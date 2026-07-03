import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null
});

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1"
});

const MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

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

  const parsed = task.script.parsedContent as { text?: string } | null;
  const scriptText = parsed?.text ?? "";
  if (!scriptText) throw new Error("剧本正文为空,无法分析");

  const userPrompt = `以下是待诊断的剧本,请按 System Prompt 输出 JSON 报告。

【标题】${task.script.title}
【字数】${task.script.wordCount}
【正文】

${scriptText}`;

  const response = await deepseek.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: template.content },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 8000,
    response_format: { type: "json_object" }
  });

  const raw = response.choices[0].message.content ?? "";
  const tokens = response.usage?.total_tokens ?? 0;

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`LLM 输出非合法 JSON: ${raw.slice(0, 200)}`);
  }

  await prisma.analysisReport.create({
    data: {
      taskId,
      summary: data.summary ?? "",
      overallScore: typeof data.overallScore === "number" ? Math.round(data.overallScore) : null,
      issues: data,
      rawResponse: raw,
      costTokens: tokens
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
      await runAnalysis(job.data.taskId);
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
