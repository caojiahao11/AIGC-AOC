import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { saveFile } from "@/lib/storage";
import { prisma } from "@/lib/db";
import { parseStoryboardBuffer } from "@/lib/parser/storyboard";
import { analysisQueue } from "@/lib/queue";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB ?? "50");
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "缺少文件" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: `文件超过 ${MAX_SIZE_MB}MB` }, { status: 413 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (ext !== ".xlsx") {
      return NextResponse.json({ error: "仅支持 .xlsx 分镜文件" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: "default@local" } });
    if (!user) return NextResponse.json({ error: "默认用户未初始化,请先跑 seed" }, { status: 500 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = await saveFile(buffer, safeName);

    let characters: ReturnType<typeof parseStoryboardBuffer>["characters"] = [];
    let rowCount = 0;
    let parsed: ReturnType<typeof parseStoryboardBuffer> | null = null;
    try {
      parsed = parseStoryboardBuffer(buffer);
      characters = parsed.characters;
      rowCount = parsed.rows.length;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "分镜解析失败";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    if (characters.length === 0) {
      return NextResponse.json({ error: "分镜表里没识别到任何角色" }, { status: 400 });
    }

    const template = await prisma.promptTemplate.findFirst({
      where: { type: "character_extract", isActive: true }
    });

    // 截取前 120 行作为 LLM 上下文，避免 token 超限
    const contextRows = parsed!.rows.slice(0, 120).map((r) => ({
      chapter: r.chapter,
      characters: r.characters,
      scene: r.scene,
      dialogue: r.dialogue,
      original: r.original,
      prompt: r.prompt
    }));

    const script = await prisma.script.create({
      data: {
        userId: user.id,
        title: title ?? file.name,
        kind: "storyboard",
        source: "upload",
        filePath,
        wordCount: rowCount,
        parsedContent: { characters, rowCount, rows: contextRows }
      }
    });

    if (!template) {
      return NextResponse.json({
        scriptId: script.id,
        warning: "已保存,但未找到 character_extract 的激活 Prompt,未触发分析"
      });
    }

    const task = await prisma.analysisTask.create({
      data: {
        scriptId: script.id,
        userId: user.id,
        type: "character_extract",
        promptVersion: template.version,
        status: "pending"
      }
    });

    await analysisQueue.add("analyze", { taskId: task.id });

    return NextResponse.json({ scriptId: script.id, taskId: task.id });
  } catch (error) {
    console.error("分镜上传失败:", error);
    const msg = error instanceof Error ? error.message : "上传失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
