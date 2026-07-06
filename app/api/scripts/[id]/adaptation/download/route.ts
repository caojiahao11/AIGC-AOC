import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Revision = {
  sceneId?: string;
  problem?: string;
  reason?: string;
  originalText?: string;
  revisedText?: string;
};

type ReportPayload = {
  adaptedText?: string;
  revisions?: Revision[];
};

export const dynamic = "force-dynamic";

function safeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80) || "adapted-script";
}

function buildFallbackText(report: ReportPayload) {
  if (!report.revisions || report.revisions.length === 0) {
    return "";
  }

  return report.revisions
    .map((revision, index) => {
      return [
        `# 修改 ${index + 1}${revision.sceneId ? `：${revision.sceneId}` : ""}`,
        "",
        "## 问题",
        revision.problem ?? "",
        "",
        "## 改编原因",
        revision.reason ?? "",
        "",
        "## 改编后内容",
        revision.revisedText ?? ""
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

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

  if (!script) {
    return NextResponse.json({ error: "剧本不存在" }, { status: 404 });
  }

  const report = script.tasks[0]?.report;
  if (!report) {
    return NextResponse.json({ error: "暂无分析报告" }, { status: 404 });
  }

  const payload = report.issues as ReportPayload;
  const content = payload.adaptedText?.trim() || buildFallbackText(payload).trim();

  if (!content) {
    return NextResponse.json({ error: "暂无可下载的改编稿" }, { status: 404 });
  }

  const filename = `${safeFilename(script.title)}-改编稿.txt`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    }
  });
}
