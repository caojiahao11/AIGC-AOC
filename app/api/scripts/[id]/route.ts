import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const script = await prisma.script.findUnique({
    where: { id: params.id },
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { report: true }
      }
    }
  });
  if (!script) return NextResponse.json({ error: "not found" }, { status: 404 });

  const task = script.tasks[0];
  return NextResponse.json({
    id: script.id,
    title: script.title,
    wordCount: script.wordCount,
    createdAt: script.createdAt,
    task: task
      ? {
          id: task.id,
          status: task.status,
          errorMessage: task.errorMessage,
          startedAt: task.startedAt,
          completedAt: task.completedAt,
          report: task.report ? (task.report.issues as any) : null
        }
      : null
  });
}
