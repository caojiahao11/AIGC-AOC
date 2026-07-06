import Link from "next/link";
import { prisma } from "@/lib/db";
import { Upload, Cpu, ClipboardCheck, FileText, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

async function getScripts() {
  return prisma.script.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      kind: true,
      wordCount: true,
      createdAt: true,
      tasks: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } }
    }
  });
}

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: "排队中",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  },
  running: {
    label: "分析中",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-sky-500/10 text-sky-400 border-sky-500/20"
  },
  completed: {
    label: "已完成",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  },
  failed: {
    label: "失败",
    icon: <AlertCircle className="h-3 w-3" />,
    className: "bg-red-500/10 text-red-400 border-red-500/20"
  },
  none: {
    label: "未分析",
    icon: <FileText className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground border-border"
  }
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const scripts = await getScripts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">剧本诊断工具</h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground leading-relaxed">
          上传剧本 Word 文件，AI 自动分析结构、人物、对白与逻辑问题，生成专业诊断报告
        </p>
        <div className="mt-8">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload className="h-4 w-4" />
            开始上传剧本
          </Link>
        </div>
      </section>

      {/* 流程 */}
      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: <Upload className="h-5 w-5" />,
            title: "上传剧本",
            desc: "支持 .docx 格式，自动解析正文内容"
          },
          {
            icon: <Cpu className="h-5 w-5" />,
            title: "AI 分析",
            desc: "DeepSeek 大模型多维度诊断剧本质量"
          },
          {
            icon: <ClipboardCheck className="h-5 w-5" />,
            title: "查看报告",
            desc: "总评分、问题清单与优化建议一目了然"
          }
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {s.icon}
            </div>
            <h3 className="mt-3 font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </section>

      {/* 列表 */}
      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">最近上传</h2>
          <span className="text-sm text-muted-foreground">共 {scripts.length} 个剧本</span>
        </div>

        {scripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-muted-foreground">
            <FileText className="h-10 w-10 opacity-30" />
            <p className="mt-3 text-sm">还没有任何剧本</p>
            <Link
              href="/upload"
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              上传第一个剧本 →
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {scripts.map((s) => {
              const meta = STATUS_META[s.tasks[0]?.status ?? "none"];
              const isStoryboard = s.kind === "storyboard";
              return (
                <Link
                  key={s.id}
                  href={`/scripts/${s.id}`}
                  className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          isStoryboard
                            ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                            : "border-sky-500/30 bg-sky-500/10 text-sky-300"
                        }`}
                      >
                        {isStoryboard ? "分镜" : "剧本"}
                      </span>
                      <div className="truncate font-medium group-hover:text-primary transition-colors">
                        {s.title}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {isStoryboard
                          ? `${s.wordCount.toLocaleString("zh-CN")} 行`
                          : `${s.wordCount.toLocaleString("zh-CN")} 字`}
                      </span>
                      <span>·</span>
                      <span>{new Date(s.createdAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                  </div>
                  <span
                    className={`ml-4 inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.className}`}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
