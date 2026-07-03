import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { saveFile } from "@/lib/storage";
import { prisma } from "@/lib/db";
import { parseWordBuffer } from "@/lib/parser/word";
import { analysisQueue } from "@/lib/queue";

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
    if (ext !== ".docx") {
      return NextResponse.json({ error: "仅支持 .docx 格式" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: "default@local" } });
    if (!user) return NextResponse.json({ error: "默认用户未初始化,请先跑 seed" }, { status: 500 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = await saveFile(buffer, safeName);

    let wordCount = 0;
    let plainText = "";
    try {
      const parsed = await parseWordBuffer(buffer);
      plainText = parsed.text;
      wordCount = plainText.length;
    } catch (e) {
      console.warn("Word 解析失败,先入库不阻塞:", e);
    }

    const template = await prisma.promptTemplate.findFirst({
      where: { type: "script_review", isActive: true }
    });

    const script = await prisma.script.create({
      data: {
        userId: user.id,
        title: title ?? file.name,
        source: "upload",
        filePath,
        wordCount,
        parsedContent: plainText ? { text: plainText } : undefined
      }
    });

    if (!template) {
      return NextResponse.json({
        scriptId: script.id,
        warning: "已保存,但未找到 script_review 的激活 Prompt,未触发分析"
      });
    }

    const task = await prisma.analysisTask.create({
      data: {
        scriptId: script.id,
        userId: user.id,
        type: "script_review",
        promptVersion: template.version,
        status: "pending"
      }
    });

    await analysisQueue.add("analyze", { taskId: task.id });

    return NextResponse.json({ scriptId: script.id, taskId: task.id });
  } catch (error) {
    console.error("上传失败:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
