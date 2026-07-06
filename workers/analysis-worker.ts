import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { splitScenes, type Scene } from "../lib/parser/scenes";

const prisma = new PrismaClient();

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null
});

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1",
  timeout: 120_000,
  maxRetries: 2
});

const MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
const MAX_OUTPUT_TOKENS = Number(process.env.DEEPSEEK_MAX_OUTPUT_TOKENS ?? "16000");

function parseJsonReport(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      [
        "LLM 输出非合法 JSON",
        `输出长度: ${raw.length}`,
        `开头: ${raw.slice(0, 300)}`,
        `结尾: ${raw.slice(-300)}`
      ].join("\n")
    );
  }
}

function validateReportShape(data: any) {
  if (!data || typeof data !== "object") {
    throw new Error("LLM JSON 不是对象");
  }

  if (typeof data.summary !== "string") {
    throw new Error("LLM JSON 缺少 summary 字符串");
  }

  if (typeof data.overallScore !== "number") {
    throw new Error("LLM JSON 缺少 overallScore 数字");
  }

  if (!data.scoreBreakdown || typeof data.scoreBreakdown !== "object") {
    throw new Error("LLM JSON 缺少 scoreBreakdown 对象");
  }

  if (!Array.isArray(data.issues)) {
    throw new Error("LLM JSON 缺少 issues 数组");
  }

  if (!Array.isArray(data.highlights)) {
    data.highlights = [];
  }

  if (!data.problemBreakdown || typeof data.problemBreakdown !== "object") {
    data.problemBreakdown = {};
  }

  if (!Array.isArray(data.revisions)) {
    data.revisions = [];
  }

  // adaptedText 交给 Phase 2 分段改编生成,这里允许为空
  if (typeof data.adaptedText !== "string") {
    data.adaptedText = "";
  }
}

// Phase 2:分段改编。把整篇按场次拆开,每场并发调 LLM 生成改编稿,最后拼接。
async function rewriteSceneByScene(
  scriptTitle: string,
  scenes: Scene[],
  issues: any[],
  adaptationPrompt: string
): Promise<{ adaptedText: string; revisions: any[]; sceneTokens: number }> {
  const CONCURRENCY = 3;
  const perSceneIssues = new Map<string, any[]>();
  for (const issue of issues ?? []) {
    if (!issue?.sceneId) continue;
    if (!perSceneIssues.has(issue.sceneId)) perSceneIssues.set(issue.sceneId, []);
    perSceneIssues.get(issue.sceneId)!.push(issue);
  }

  const results: string[] = new Array(scenes.length);
  const revisions: any[] = [];
  let totalTokens = 0;

  async function rewriteOne(scene: Scene): Promise<{ text: string; revision?: any }> {
    const relevant = perSceneIssues.get(scene.id) ?? [];
    if (relevant.length === 0) {
      return { text: scene.content };
    }

    const issuesText = relevant.length
      ? relevant
          .map(
            (i, idx) =>
              `${idx + 1}. [${i.severity ?? "-"}][${i.category ?? "-"}] ${i.problem ?? ""}\n   建议:${i.suggestion ?? ""}`
          )
          .join("\n")
      : "";

    const response = await deepseek.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `${adaptationPrompt}

【系统技术约束】
1. 你会收到一段剧本原文和该段的诊断问题清单。
2. 输出必须是这一场的完整正文，不能只输出被修改片段或摘要。
3. 保留原有场次边界，不新增、合并或删除场次。
4. 只输出纯文本正文，不要输出前言、总结、markdown 或 JSON。`
        },
        {
          role: "user",
          content: `剧本标题:${scriptTitle}
场次:${scene.id}

【诊断问题】
${issuesText}

【原文】
${scene.content}

请直接输出该场改编后的完整正文。`
        }
      ],
      temperature: 0.3,
      max_tokens: MAX_OUTPUT_TOKENS
    });

    totalTokens += response.usage?.total_tokens ?? 0;
    const text = response.choices[0]?.message.content?.trim() ?? "";
    if (!text) throw new Error(`场次 ${scene.id} 改编返回为空`);
    return {
      text,
      revision: {
        sceneId: scene.id,
        problem: relevant.map((i) => i.problem).filter(Boolean).join("\n"),
        reason: relevant.map((i) => i.suggestion).filter(Boolean).join("\n"),
        originalText: scene.content,
        revisedText: text
      }
    };
  }

  // 简单的并发池,不引入 p-limit
  let cursor = 0;
  async function worker() {
    while (cursor < scenes.length) {
      const my = cursor++;
      const scene = scenes[my];
      try {
        const rewritten = await rewriteOne(scene);
        results[my] = rewritten.text;
        if (rewritten.revision) {
          revisions.push(rewritten.revision);
        }
      } catch (err) {
        console.warn(`[analysis] 场次 ${scene.id} 改编失败,回退原文:`, err);
        results[my] = scene.content;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, scenes.length) }, worker));

  return {
    adaptedText: results.join("\n\n"),
    revisions: revisions.sort((a, b) => {
      const ai = scenes.findIndex((s) => s.id === a.sceneId);
      const bi = scenes.findIndex((s) => s.id === b.sceneId);
      return ai - bi;
    }),
    sceneTokens: totalTokens
  };
}

async function createReportJson(templateContent: string, userPrompt: string) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await deepseek.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `${templateContent}

你必须只输出一个完整、合法、可被 JSON.parse 解析的 JSON 对象。
不要输出 markdown，不要输出解释，不要在 JSON 前后添加任何文字。
所有字符串里的换行必须使用 \\n 转义。
如果内容较多，优先减少 issues 数量，保证 JSON 完整闭合。

无论原始提示词怎么写，最终必须严格返回以下 JSON 结构：
{
  "summary": "一句话总评，80字以内",
  "overallScore": 0,
  "verdict": "不通过 / 勉强及格 / 优秀可拍",
  "deductionNotes": ["扣分说明1", "扣分说明2"],
  "scoreBreakdown": {
    "fatalRisk": 0,
    "logic": 0,
    "formatScene": 0,
    "culture": 0,
    "dialogue": 0,
    "paceInfo": 0
  },
  "problemBreakdown": {
    "雷区/敏感设定问题": [],
    "文化审查与硬伤问题": [],
    "格式与场景问题": [],
    "台词与对话问题": [],
    "节奏与信息投喂问题": []
  },
  "issues": [
    {
      "category": "logic",
      "severity": "high",
      "sceneId": "第X章/场景名",
      "quote": "原文片段",
      "problem": "具体问题",
      "suggestion": "修改建议"
    }
  ],
  "highlights": ["值得保留的优点"]
}

字段规则：
- overallScore 使用百分制 0-100，不要使用 10 分制。
- Phase 1 只做质检评分和问题定位，不要输出改编稿全文。
- issues 只保留最重要的问题，最多 20 条。
- quote 只摘录必要原文片段，每条不超过 120 字。
- problem 和 suggestion 要短，每条不超过 120 字。
- 不要输出 adaptedText，不要输出 revisions，这两个字段会在 Phase 2 分场生成。`
        },
        {
          role: "user",
          content:
            attempt === 1
              ? userPrompt
              : `${userPrompt}

上一次输出不是合法 JSON。请重新输出完整 JSON，严格保证所有大括号、方括号和引号闭合。必要时减少 issues 数量。不要输出 adaptedText 或 revisions。`
        }
      ],
      temperature: 0.2,
      max_tokens: MAX_OUTPUT_TOKENS,
      response_format: { type: "json_object" }
    });

    const raw = response.choices[0]?.message.content ?? "";
    const finishReason = response.choices[0]?.finish_reason;
    const tokens = response.usage?.total_tokens ?? 0;

    try {
      if (finishReason === "length") {
        throw new Error(`LLM 输出被截断，finish_reason=length，输出长度=${raw.length}`);
      }

      const data = parseJsonReport(raw);
      validateReportShape(data);

      return { data, raw, tokens };
    } catch (error) {
      lastError = error;
      console.warn(
        `[analysis] 第 ${attempt} 次 JSON 解析失败:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function runCharacterExtract(taskId: string) {
  const task = await prisma.analysisTask.update({
    where: { id: taskId },
    data: { status: "running", startedAt: new Date() },
    include: { script: true }
  });

  const template = await prisma.promptTemplate.findFirst({
    where: { type: task.type, version: task.promptVersion }
  });
  if (!template) throw new Error(`Prompt 模板 ${task.type}/${task.promptVersion} 未找到`);

  const parsed = task.script.parsedContent as {
    characters?: { name: string; firstChapter: string; variants: string[] }[];
    rows?: { chapter: string; characters: string; scene: string; dialogue: string; original: string; prompt: string }[];
  } | null;
  const characters = parsed?.characters ?? [];
  if (characters.length === 0) throw new Error("分镜没有识别到角色,无法生成人物卡");

  const input = characters.map((c) => ({
    name: c.name,
    firstChapter: c.firstChapter,
    variants: c.variants
  }));

  // 构建分镜场次上下文，帮助 LLM 推断角色身份
  const rows = parsed?.rows ?? [];
  const contextLines = rows
    .filter((r) => r.scene || r.dialogue || r.original || r.prompt)
    .slice(0, 80)
    .map((r) => {
      const parts: string[] = [];
      if (r.chapter) parts.push(`[${r.chapter}]`);
      if (r.characters) parts.push(`人物:${r.characters}`);
      if (r.scene) parts.push(`场景:${r.scene}`);
      if (r.dialogue) parts.push(`台词:${r.dialogue}`);
      if (r.original) parts.push(`原文:${r.original}`);
      if (r.prompt) parts.push(`提示:${r.prompt}`);
      return parts.join(" | ");
    })
    .join("\n");

  const userPrompt = `以下是从分镜表中提取的角色名单，以及部分场次内容。请根据场景描述、台词、原文等信息推断每个角色的真实身份，并按 System Prompt 输出 JSON。

【剧本标题】${task.script.title}
【角色数量】${input.length}
【角色名单】
${JSON.stringify(input, null, 2)}

【分镜场次参考（前80场）】
${contextLines || "（无额外场次信息）"}`;

  let lastError: unknown;
  let raw = "";
  let tokens = 0;
  let data: any = null;

  const systemContent = `${template.content}

【系统技术约束】
你必须只输出一个可被 JSON.parse 解析的 JSON 对象，不要输出 markdown 表格，不要输出任何解释文字。

JSON 结构如下：
{
  "characters": [
    {
      "name": "角色中文名（与输入完全一致）",
      "identity": "身份/职业描述（中文）",
      "identityEn": "Identity in English",
      "firstEpisode": "首次出场集数或场次"
    }
  ]
}

字段规则：
- characters 必须是数组。
- name 必须与输入的角色名完全一致，不要改名。
- identity 用中文写，简洁明了。
- identityEn 用英文写，尽量简短。
- firstEpisode 从分镜表的场次/集数信息中提取，不要编造。
- 输出条目数必须与输入一致，不能漏角色。`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await deepseek.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemContent },
        {
          role: "user",
          content:
            attempt === 1
              ? userPrompt
              : `${userPrompt}\n\n上一次输出不是合法 JSON,请严格按格式重新输出。`
        }
      ],
      temperature: 0.2,
      max_tokens: MAX_OUTPUT_TOKENS,
      response_format: { type: "json_object" }
    });

    raw = response.choices[0]?.message.content ?? "";
    tokens += response.usage?.total_tokens ?? 0;

    try {
      data = JSON.parse(raw);
      if (!Array.isArray(data.characters)) throw new Error("缺少 characters 数组");
      if (data.characters.length !== input.length) {
        console.warn(`[character] 输出条数 ${data.characters.length} 与输入 ${input.length} 不一致`);
      }
      break;
    } catch (err) {
      lastError = err;
      console.warn(`[character] 第 ${attempt} 次解析失败:`, err instanceof Error ? err.message : err);
      data = null;
    }
  }

  if (!data) throw lastError instanceof Error ? lastError : new Error(String(lastError));

  // 拼合 firstChapter 兜底(LLM 有时会漏 firstEpisode)
  const byName = new Map(input.map((c) => [c.name, c.firstChapter]));
  data.characters = data.characters.map((c: any) => ({
    name: c.name,
    identity: c.identity ?? "",
    identityEn: c.identityEn ?? "",
    firstEpisode: c.firstEpisode ?? byName.get(c.name) ?? ""
  }));

  await prisma.analysisReport.create({
    data: {
      taskId,
      summary: `识别 ${data.characters.length} 个角色`,
      overallScore: null,
      issues: data,
      rawResponse: raw,
      costTokens: tokens
    }
  });

  await prisma.analysisTask.update({
    where: { id: taskId },
    data: { status: "completed", errorMessage: null, completedAt: new Date() }
  });
}

async function runAnalysis(taskId: string) {
  const task = await prisma.analysisTask.update({
    where: { id: taskId },
    data: { status: "running", startedAt: new Date() },
    include: { script: true }
  });

  const template = await prisma.promptTemplate.findFirst({
    where: { type: task.type, version: task.promptVersion }
  });
  if (!template) throw new Error(`Prompt 模板 ${task.type}/${task.promptVersion} 未找到`);

  const adaptationTemplate = await prisma.promptTemplate.findFirst({
    where: { type: "script_adaptation", isActive: true },
    orderBy: { createdAt: "desc" }
  });
  if (!adaptationTemplate) {
    throw new Error("未找到生效的 script_adaptation 改编 Prompt");
  }

  const parsed = task.script.parsedContent as { text?: string } | null;
  const scriptText = parsed?.text ?? "";
  if (!scriptText) throw new Error("剧本正文为空,无法分析");

  const userPrompt = `以下是待诊断的剧本,请按 System Prompt 输出 JSON 报告。

【标题】${task.script.title}
【字数】${task.script.wordCount}
【正文】

${scriptText}`;

  // Phase 1: 整体诊断(评分 / issues / revisions)
  console.log("[analysis] Phase 1 诊断中...");
  const { data, raw, tokens } = await createReportJson(template.content, userPrompt);

  // Phase 2: 按场次拆分并逐场改编,拼成完整改编稿
  const scenes = splitScenes(scriptText);
  console.log(`[analysis] Phase 2 拆出 ${scenes.length} 场,开始分段改编`);
  let phase2Tokens = 0;
  try {
    const { adaptedText, revisions, sceneTokens } = await rewriteSceneByScene(
      task.script.title,
      scenes,
      data.issues ?? [],
      adaptationTemplate.content
    );
    data.adaptedText = adaptedText;
    data.revisions = revisions;
    phase2Tokens = sceneTokens;
    console.log(`[analysis] Phase 2 完成,共 ${sceneTokens} tokens`);
  } catch (err: any) {
    console.error("[analysis] Phase 2 失败,保留 Phase 1 的 adaptedText:", err?.message ?? err);
  }

  await prisma.analysisReport.create({
    data: {
      taskId,
      summary: data.summary ?? "",
      overallScore: typeof data.overallScore === "number" ? Math.round(data.overallScore) : null,
      issues: data,
      rawResponse: raw,
      costTokens: tokens + phase2Tokens
    }
  });

  await prisma.analysisTask.update({
    where: { id: taskId },
    data: { status: "completed", completedAt: new Date() }
  });
}

const worker = new Worker<{ taskId: string }>(
  "analysis",
  async (job) => {
    console.log("[analysis] 开始", job.data.taskId);
    try {
      const t = await prisma.analysisTask.findUnique({
        where: { id: job.data.taskId },
        select: { type: true }
      });
      if (t?.type === "character_extract") {
        await runCharacterExtract(job.data.taskId);
      } else {
        await runAnalysis(job.data.taskId);
      }
      console.log("[analysis] 完成", job.data.taskId);
    } catch (e: any) {
      console.error("[analysis] 失败", job.data.taskId, e.message);
      await prisma.analysisTask.update({
        where: { id: job.data.taskId },
        data: {
          status: "failed",
          errorMessage: e.message?.slice(0, 500) ?? "unknown",
          completedAt: new Date()
        }
      });
      throw e;
    }
  },
  { connection, concurrency: 3 }
);

worker.on("ready", () => console.log("Worker ready, waiting for jobs..."));
worker.on("error", (err) => console.error("Worker error:", err));
