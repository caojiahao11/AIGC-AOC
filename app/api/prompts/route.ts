import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const list = await prisma.promptTemplate.findMany({
    orderBy: [{ type: "asc" }, { createdAt: "desc" }]
  });
  return NextResponse.json(list);
}

// 新建一个版本(基于 body 里的 type + version + content)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, version, content, setActive } = body as {
    type: string;
    version: string;
    content: string;
    setActive?: boolean;
  };
  if (!type || !version || !content) {
    return NextResponse.json({ error: "type / version / content 必填" }, { status: 400 });
  }

  const created = await prisma.promptTemplate.create({
    data: { type, version, content, isActive: false }
  });

  if (setActive) {
    await prisma.$transaction([
      prisma.promptTemplate.updateMany({ where: { type }, data: { isActive: false } }),
      prisma.promptTemplate.update({ where: { id: created.id }, data: { isActive: true } })
    ]);
  }

  return NextResponse.json({ id: created.id });
}
