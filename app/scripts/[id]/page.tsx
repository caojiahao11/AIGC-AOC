"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Lightbulb,
  Filter,
  Quote
} from "lucide-react";
import { IssueFeedbackButtons } from "@/components/IssueFeedback";

type Issue = {
  category: string;
  severity: "high" | "medium" | "low";
  sceneId: string;
  quote: string;
  problem: string;
  suggestion: string;
};

type Report = {
  summary: string;
  overallScore: number;
  scoreBreakdown: Record<string, number>;
  issues: Issue[];
  highlights: string[];
};

type ScriptDetail = {
  id: string;
  title: string;
  wordCount: number;
  createdAt: string;
  task: {
    id: string;
    status: string;
    errorMessage: string | null;
    reportId: string | null;
    report: Report | null;
  } | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  structure: "结构与节奏",
  character: "人物一致性",
  scene: "场景与画面",
  dialogue: "对白",
  logic: "逻辑与设定",
  ai_friendly: "AI 分镜友好度"
};

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400" }
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: "排队中", icon: <Clock className="h-3.5 w-3.5" />, className: "text-amber-400" },
  running: { label: "分析中", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, className: "text-sky-400" },
  completed: { label: "已完成", icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: "text-emerald-400" },
  failed: { label: "失败", icon: <AlertCircle className="h-3.5 w-3.5" />, className: "text-red-400" }
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.min(Math.max(score * 10, 0), 100);
  const color = pct >= 70 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}/10</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ScriptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ScriptDetail | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    let attempts = 0;
    const maxAttempts = 120; // 最多轮询 6 分钟

    async function tick() {
      if (stop || attempts >= maxAttempts) return;
      attempts++;

      try {
        const res = await fetch(`/api/scripts/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (!stop) setData(json);
          if (json.task?.status === "completed" || json.task?.status === "failed") return;
        }
      } catch {
        // 忽略轮询网络错误
      }
      if (!stop) setTimeout(tick, 3000);
    }
    tick();
    return () => { stop = true; };
  }, [id]);

  if (!data) {
    return (
      <main className="mx-auto flex max-w-4xl items-center justify-center px-6 py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        加载中…
      </main>
    );
  }

  const task = data.task;
  const report = task?.report;

  const categories = report
    ? Array.from(new Set(report.issues.map((i) => i.category))).sort(
        (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
      )
    : [];

  const filteredIssues = report?.issues.filter((i) => {
    if (filterSeverity && i.severity !== filterSeverity) return false;
    if (filterCategory && i.category !== filterCategory) return false;
    return true;
  });

  const highCount = report?.issues.filter((i) => i.severity === "high").length ?? 0;
  const mediumCount = report?.issues.filter((i) => i.severity === "medium").length ?? 0;
  const lowCount = report?.issues.filter((i) => i.severity === "low").length ?? 0;

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      {/* 顶部信息 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </Link>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{data.title}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {data.wordCount.toLocaleString("zh-CN")} 字
            </span>
            <span>{new Date(data.createdAt).toLocaleString("zh-CN")}</span>
          </div>
        </div>
        {task && (
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${STATUS_META[task.status]?.className ?? ""}`}>
            {STATUS_META[task.status]?.icon}
            {STATUS_META[task.status]?.label ?? task.status}
          </span>
        )}
      </div>

      {/* 分析中 */}
      {task && task.status !== "completed" && task.status !== "failed" && (
        <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-6">
          <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
          <div>
            <div className="font-medium">分析进行中…</div>
            <div className="text-sm text-muted-foreground">预计 30~90 秒，请稍候</div>
          </div>
        </div>
      )}

      {/* 失败 */}
      {task?.status === "failed" && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-red-400">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-medium">分析失败</div>
            <div className="mt-1 text-sm">{task.errorMessage || "未知错误，请稍后重试"}</div>
          </div>
        </div>
      )}

      {/* 报告 */}
      {report && (
        <div className="mt-8 space-y-8">
          {/* 总评 + 分数 */}
          <section className="rounded-xl border bg-card p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* 总分 */}
              <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-primary/5 p-6 sm:w-40">
                <div className="text-5xl font-bold tracking-tight text-primary">
                  {report.overallScore}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">总分 / 10</div>
                <div
                  className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    report.overallScore >= 7
                      ? "bg-emerald-500/10 text-emerald-400"
                      : report.overallScore >= 5
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {report.overallScore >= 7 ? "优秀" : report.overallScore >= 5 ? "良好" : "需改进"}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="text-sm font-medium">总评</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CATEGORY_ORDER.filter((k) => report.scoreBreakdown[k] !== undefined).map((k) => (
                    <ScoreBar key={k} label={CATEGORY_LABEL[k] ?? k} score={report.scoreBreakdown[k]} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 问题清单 */}
          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">
                问题清单
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  共 {report.issues.length} 条
                  {highCount > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      严重 {highCount}
                    </span>
                  )}
                  {mediumCount > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                      中等 {mediumCount}
                    </span>
                  )}
                  {lowCount > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-xs text-sky-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                      建议 {lowCount}
                    </span>
                  )}
                </span>
              </h2>

              {/* 筛选器 */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                {/* 严重度筛选 */}
                {(["high", "medium", "low"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterSeverity(filterSeverity === s ? null : s)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      filterSeverity === s
                        ? `${SEVERITY_META[s].className} font-medium`
                        : "border-border bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {SEVERITY_META[s].label}
                  </button>
                ))}
                {/* 分类筛选 */}
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilterCategory(filterCategory === c ? null : c)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      filterCategory === c
                        ? "border-primary/30 bg-primary/10 font-medium text-primary"
                        : "border-border bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {CATEGORY_LABEL[c] ?? c}
                  </button>
                ))}
                {(filterSeverity || filterCategory) && (
                  <button
                    onClick={() => { setFilterSeverity(null); setFilterCategory(null); }}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    清除筛选
                  </button>
                )}
              </div>
            </div>

            {filteredIssues && filteredIssues.length > 0 ? (
              <ul className="space-y-3">
                {filteredIssues.map((issue, i) => {
                  const sev = SEVERITY_META[issue.severity] ?? SEVERITY_META.low;
                  return (
                    <li
                      key={i}
                      className={`rounded-xl border p-4 transition-colors hover:bg-card/60 ${sev.className}`}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${sev.dot}`} />
                          <span className="font-medium">{sev.label}</span>
                        </span>
                        <span className="text-muted-foreground">{CATEGORY_LABEL[issue.category] ?? issue.category}</span>
                        {issue.sceneId && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">{issue.sceneId}</span>
                          </>
                        )}
                      </div>

                      {issue.quote && (
                        <div className="mt-3 flex gap-2 rounded-lg bg-black/20 px-3 py-2 text-sm text-muted-foreground">
                          <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-50" />
                          {issue.quote}
                        </div>
                      )}

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex gap-2">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400/70" />
                          <span>{issue.problem}</span>
                        </div>
                        <div className="flex gap-2">
                          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/70" />
                          <span className="text-muted-foreground">{issue.suggestion}</span>
                        </div>
                      </div>

                      {task?.reportId && (
                        <IssueFeedbackButtons reportId={task.reportId} issueIndex={i} />
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                没有符合条件的问题
              </div>
            )}
          </section>

          {/* 值得保留 */}
          {report.highlights && report.highlights.length > 0 && (
            <section className="rounded-xl border bg-emerald-500/5 p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                值得保留
              </h2>
              <ul className="space-y-2">
                {report.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
