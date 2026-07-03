import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const scripts = await prisma.script.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true }
      }
    }
  });
  return NextResponse.json(
    scripts.map((s) => ({
      id: s.id,
      title: s.title,
      wordCount: s.wordCount,
      createdAt: s.createdAt,
      status: s.tasks[0]?.status ?? "none"
    }))
  );
}
