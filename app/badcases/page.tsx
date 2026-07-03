import Link from "next/link";
import { ArrowLeft, ThumbsDown, AlertOctagon, ThumbsUp } from "lucide-react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  structure: "结构与节奏",
  character: "人物一致性",
  scene: "场景与画面",
  dialogue: "对白",
  logic: "逻辑与设定",
  ai_friendly: "AI 分镜友好度"
};

const VOTE_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  useful: { label: "有用", icon: <ThumbsUp className="h-3.5 w-3.5" />, className: "text-emerald-500 bg-emerald-500/10" },
  useless: { label: "没用", icon: <ThumbsDown className="h-3.5 w-3.5" />, className: "text-red-500 bg-red-500/10" },
  missing: { label: "漏了", icon: <AlertOctagon className="h-3.5 w-3.5" />, className: "text-amber-500 bg-amber-500/10" }
};

export default async function BadcasesPage() {
  const feedbacks = await prisma.issueFeedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      report: {
        include: {
          task: {
            include: { script: { select: { id: true, title: true } } }
          }
        }
      }
    }
  });

  // 统计
  const totalUseful = feedbacks.filter((f) => f.vote === "useful").length;
  const totalUseless = feedbacks.filter((f) => f.vote === "useless").length;
  const totalMissing = feedbacks.filter((f) => f.vote === "missing").length;

  // "没用"最多的 category 排序
  const uselessByCategory: Record<string, number> = {};
  for (const fb of feedbacks) {
    if (fb.vote !== "useless" || fb.issueIndex === null) continue;
    const issues = (fb.report?.issues as any)?.issues ?? [];
    const cat = issues[fb.issueIndex]?.category;
    if (cat) uselessByCategory[cat] = (uselessByCategory[cat] ?? 0) + 1;
  }
  const uselessRanking = Object.entries(uselessByCategory).sort((a, b) => b[1] - a[1]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </Link>

      <h1 className="mt-4 text-2xl font-bold">反馈与 Badcase</h1>
      <p className="mt-1 text-sm text-muted-foreground">团队用报告时的反馈汇总,用来判断 Prompt 该往哪调。</p>

      {/* 汇总 */}
      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 text-sm text-emerald-500">
            <ThumbsUp className="h-4 w-4" />
            有用
          </div>
          <div className="mt-2 text-2xl font-bold">{totalUseful}</div>
        </div>
        <div className="rounded-xl border bg-red-500/5 p-4">
          <div className="flex items-center gap-2 text-sm text-red-500">
            <ThumbsDown className="h-4 w-4" />
            没用/太笼统
          </div>
          <div className="mt-2 text-2xl font-bold">{totalUseless}</div>
        </div>
        <div className="rounded-xl border bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 text-sm text-amber-500">
            <AlertOctagon className="h-4 w-4" />
            漏了
          </div>
          <div className="mt-2 text-2xl font-bold">{totalMissing}</div>
        </div>
      </section>

      {/* 没用最多的维度 */}
      {uselessRanking.length > 0 && (
        <section className="mt-6 rounded-xl border p-4">
          <h2 className="text-sm font-semibold">&ldquo;没用&rdquo;最多的维度</h2>
          <p className="mt-1 text-xs text-muted-foreground">这几个维度的建议编辑觉得没帮助,值得优先调 Prompt。</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {uselessRanking.map(([cat, count]) => (
              <li key={cat} className="flex items-center justify-between">
                <span>{CATEGORY_LABEL[cat] ?? cat}</span>
                <span className="font-mono text-red-500">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 明细 */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">最近反馈({feedbacks.length} 条)</h2>
        {feedbacks.length === 0 ? (
          <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            还没有反馈
          </div>
        ) : (
          <ul className="space-y-2">
            {feedbacks.map((fb) => {
              const meta = VOTE_META[fb.vote];
              const issues = (fb.report?.issues as any)?.issues ?? [];
              const issue = fb.issueIndex !== null ? issues[fb.issueIndex] : null;
              const scriptTitle = fb.report?.task?.script?.title ?? "";
              const scriptId = fb.report?.task?.script?.id;

              return (
                <li key={fb.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${meta.className}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                    {issue && (
                      <>
                        <span className="text-muted-foreground">{CATEGORY_LABEL[issue.category] ?? issue.category}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{issue.sceneId}</span>
                      </>
                    )}
                    {scriptId && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <Link href={`/scripts/${scriptId}`} className="text-muted-foreground hover:text-foreground hover:underline">
                          {scriptTitle}
                        </Link>
                      </>
                    )}
                    <span className="ml-auto text-muted-foreground">
                      {new Date(fb.createdAt).toLocaleString("zh-CN")}
                    </span>
                  </div>

                  {issue && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      原建议:{issue.suggestion}
                    </div>
                  )}
                  {fb.note && (
                    <div className="mt-2 rounded-md bg-amber-500/10 p-2 text-xs">
                      <span className="font-medium">编辑觉得应该指出:</span> {fb.note}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
