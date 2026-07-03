import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// { reportId, issueIndex?, vote: 'useful'|'useless'|'missing', note? }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { reportId, issueIndex, vote, note } = body;

  if (!reportId || !vote) {
    return NextResponse.json({ error: "reportId / vote 必填" }, { status: 400 });
  }
  if (!["useful", "useless", "missing"].includes(vote)) {
    return NextResponse.json({ error: "vote 不合法" }, { status: 400 });
  }

  const fb = await prisma.issueFeedback.create({
    data: {
      reportId,
      issueIndex: typeof issueIndex === "number" ? issueIndex : null,
      vote,
      note: note ?? null
    }
  });
  return NextResponse.json({ id: fb.id });
}

// 查询某报告的反馈汇总
export async function GET(req: NextRequest) {
  const reportId = req.nextUrl.searchParams.get("reportId");
  if (!reportId) return NextResponse.json({ error: "reportId 必填" }, { status: 400 });

  const list = await prisma.issueFeedback.findMany({
    where: { reportId },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(list);
}
