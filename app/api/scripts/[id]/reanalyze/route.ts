import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analysisQueue } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const script = await prisma.script.findUnique({
    where: { id: params.id }
  });

  if (!script) {
    return NextResponse.json({ error: "剧本不存在" }, { status: 404 });
  }

  // 根据 kind 决定任务类型和 Prompt
  const isStoryboard = script.kind === "storyboard";
  const taskType = isStoryboard ? "character_extract" : "script_review";

  const template = await prisma.promptTemplate.findFirst({
    where: { type: taskType, isActive: true }
  });

  if (!template) {
    return NextResponse.json(
      { error: `未找到生效的 ${taskType} Prompt` },
      { status: 500 }
    );
  }

  const task = await prisma.analysisTask.create({
    data: {
      scriptId: script.id,
      userId: script.userId,
      type: taskType,
      promptVersion: template.version,
      status: "pending"
    }
  });

  await analysisQueue.add("analyze", { taskId: task.id });

  return NextResponse.json({ taskId: task.id });
}
