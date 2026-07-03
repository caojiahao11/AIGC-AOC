import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// 更新内容或切换 active
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const target = await prisma.promptTemplate.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });

  // 切 active:先把同 type 全部取消,再激活当前
  if (body.setActive === true) {
    await prisma.$transaction([
      prisma.promptTemplate.updateMany({ where: { type: target.type }, data: { isActive: false } }),
      prisma.promptTemplate.update({ where: { id: params.id }, data: { isActive: true } })
    ]);
  }

  if (typeof body.content === "string") {
    await prisma.promptTemplate.update({
      where: { id: params.id },
      data: { content: body.content }
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const target = await prisma.promptTemplate.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (target.isActive) {
    return NextResponse.json({ error: "当前生效版本不能删除,先切换到别的版本" }, { status: 400 });
  }
  await prisma.promptTemplate.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
