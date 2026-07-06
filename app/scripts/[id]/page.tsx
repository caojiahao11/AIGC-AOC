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
  Quote,
  Download,
  Image as ImageIcon,
  Film,
  BookText
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
  verdict?: string;
  deductionNotes?: string[];
  scoreBreakdown: Record<string, number>;
  problemBreakdown?: Record<string, string[]>;
  issues: Issue[];
  revisions?: Revision[];
  adaptedText?: string;
  highlights: string[];
};

type Revision = {
  sceneId: string;
  problem: string;
  reason: string;
  originalText: string;
  revisedText: string;
};

type CharacterRow = {
  name: string;
  identity: string;
  identityEn: string;
  firstEpisode: string;
};

type CharacterReport = { characters: CharacterRow[] };

type ScriptDetail = {
  id: string;
  title: string;
  kind?: "script" | "storyboard";
  wordCount: number;
  createdAt: string;
  task: {
    id: string;
    status: string;
    errorMessage: string | null;
    reportId: string | null;
    report: Report | CharacterReport | null;
  } | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  structure: "结构与节奏",
  character: "人物一致性",
  scene: "场景与画面",
  dialogue: "对白",
  logic: "逻辑与设定",
  ai_friendly: "AI 分镜友好度",
  fatalRisk: "雷区风险",
  formatScene: "格式与场景",
  culture: "文化审查",
  paceInfo: "节奏与信息"
};

const CATEGORY_ORDER = ["fatalRisk", "logic", "formatScene", "culture", "dialogue", "paceInfo", "structure", "character", "scene", "ai_friendly"];

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
  const pct = Math.min(Math.max(score, 0), 100);
  const color = pct >= 70 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}</span>
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
  const [reanalyzing, setReanalyzing] = useState(false);

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
  const isStoryboard = data.kind === "storyboard";
  const report = task?.report as any;
  const scriptReport: Report | null = !isStoryboard ? (report as Report) : null;
  const characterReport: CharacterReport | null = isStoryboard ? (report as CharacterReport) : null;
  const hasAdaptation = Boolean(scriptReport?.adaptedText || (scriptReport?.revisions && scriptReport.revisions.length > 0));

  async function reanalyze() {
    if (!data) return;
    const scriptId = data.id;
    setReanalyzing(true);
    try {
      const res = await fetch(`/api/scripts/${scriptId}/reanalyze`, { method: "POST" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "重新分析失败");
      }
      const next = await fetch(`/api/scripts/${scriptId}`);
      if (next.ok) setData(await next.json());
    } catch (error) {
      alert(error instanceof Error ? error.message : "重新分析失败");
    } finally {
      setReanalyzing(false);
    }
  }

  const issuesArray = Array.isArray(scriptReport?.issues) ? scriptReport.issues : [];

  const categories = issuesArray.length
    ? Array.from(new Set(issuesArray.map((i) => i.category))).sort(
        (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
      )
    : [];

  const filteredIssues = issuesArray.filter((i) => {
    if (filterSeverity && i.severity !== filterSeverity) return false;
    if (filterCategory && i.category !== filterCategory) return false;
    return true;
  });

  const highCount = issuesArray.filter((i) => i.severity === "high").length;
  const mediumCount = issuesArray.filter((i) => i.severity === "medium").length;
  const lowCount = issuesArray.filter((i) => i.severity === "low").length;

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
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                isStoryboard
                  ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                  : "border-sky-500/30 bg-sky-500/10 text-sky-300"
              }`}
            >
              {isStoryboard ? <Film className="h-3 w-3" /> : <BookText className="h-3 w-3" />}
              {isStoryboard ? "分镜" : "剧本"}
            </span>
            <h1 className="text-2xl font-bold tracking-tight">{data.title}</h1>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {isStoryboard
                ? `${data.wordCount.toLocaleString("zh-CN")} 行分镜`
                : `${data.wordCount.toLocaleString("zh-CN")} 字`}
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

      {scriptReport && !hasAdaptation && (
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <div className="font-medium text-amber-400">这是一份旧结构报告</div>
              <div className="mt-1 text-sm text-muted-foreground">
                当前报告只有打分和问题清单，没有改编稿和修改说明。请用最新提示词重新分析一次。
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={reanalyze}
            disabled={reanalyzing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {reanalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
            {reanalyzing ? "正在提交..." : "用最新提示词重新分析"}
          </button>
        </div>
      )}

      {/* 分镜:人物出场表 */}
      {isStoryboard && characterReport && characterReport.characters && characterReport.characters.length > 0 && (
        <div className="mt-8 space-y-6">
          <section className="rounded-xl border bg-card p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">首次出场人物表</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  从分镜表识别到 <span className="text-primary font-medium">{characterReport.characters.length}</span> 位角色
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/api/scripts/${data.id}/characters/xlsx`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Download className="h-4 w-4" />
                  下载 xlsx
                </a>
                <a
                  href={`/api/scripts/${data.id}/characters/image`}
                  className="inline-flex items-center gap-2 rounded-full border bg-transparent px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  <ImageIcon className="h-4 w-4" />
                  下载表格截图
                </a>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto rounded-lg border bg-background/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 w-12 text-center">#</th>
                    <th className="px-3 py-2">角色名</th>
                    <th className="px-3 py-2">身份</th>
                    <th className="px-3 py-2">英文版身份</th>
                    <th className="px-3 py-2 w-24 text-center">首次出现集数</th>
                  </tr>
                </thead>
                <tbody>
                  {characterReport.characters.map((c, i) => (
                    <tr key={c.name + i} className="border-t hover:bg-muted/20">
                      <td className="px-3 py-2 text-center text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{c.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.identity}</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.identityEn}</td>
                      <td className="px-3 py-2 text-center text-primary">{c.firstEpisode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* 剧本诊断报告 */}
      {!isStoryboard && scriptReport && (
        <div className="mt-8 space-y-8">
          {/* 总评 + 分数 */}
          <section className="rounded-xl border bg-card p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* 总分 */}
              <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-primary/5 p-6 sm:w-40">
                <div className="text-5xl font-bold tracking-tight text-primary">
                  {scriptReport.overallScore}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">总分 / 100</div>
                <div
                  className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    scriptReport.overallScore >= 80
                      ? "bg-emerald-500/10 text-emerald-400"
                      : scriptReport.overallScore >= 60
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {scriptReport.verdict ?? (scriptReport.overallScore >= 80 ? "优秀可拍" : scriptReport.overallScore >= 60 ? "勉强及格" : "不通过")}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="text-sm font-medium">总评</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{scriptReport.summary}</p>
                </div>
                {scriptReport.deductionNotes && scriptReport.deductionNotes.length > 0 && (
                  <div>
                    <div className="text-sm font-medium">扣分说明</div>
                    <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                      {scriptReport.deductionNotes.map((note, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {CATEGORY_ORDER.filter((k) => scriptReport.scoreBreakdown[k] !== undefined).map((k) => (
                    <ScoreBar key={k} label={CATEGORY_LABEL[k] ?? k} score={scriptReport.scoreBreakdown[k]} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 问题分类 */}
          {scriptReport.problemBreakdown && Object.entries(scriptReport.problemBreakdown).some(([, items]) => Array.isArray(items) && items.length > 0) && (
            <section className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold">问题分类</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(scriptReport.problemBreakdown).map(([title, items]) => {
                  if (!Array.isArray(items) || items.length === 0) return null;
                  return (
                    <div key={title} className="rounded-lg border bg-background/40 p-4">
                      <div className="text-sm font-medium">{title}</div>
                      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                        {items.map((item, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 改编稿 */}
          {scriptReport.adaptedText && (
            <section className="rounded-xl border bg-card p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">改编稿</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    根据质检问题生成的可交付改编版本
                  </p>
                </div>
                <a
                  href={`/api/scripts/${data.id}/adaptation/download`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Download className="h-4 w-4" />
                  下载改编稿
                </a>
              </div>
              <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg border bg-black/20 p-4 text-sm leading-relaxed text-muted-foreground">
                {scriptReport.adaptedText}
              </pre>
            </section>
          )}

          {/* 修改说明 */}
          {scriptReport.revisions && scriptReport.revisions.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">修改说明</h2>
              <ul className="space-y-4">
                {scriptReport.revisions.map((revision, i) => (
                  <li key={i} className="rounded-xl border bg-card p-5">
                    <div className="text-sm font-semibold">{revision.sceneId || `修改 ${i + 1}`}</div>
                    <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                        <div className="mb-1 font-medium text-red-400">原文问题</div>
                        <p className="text-muted-foreground">{revision.problem}</p>
                      </div>
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                        <div className="mb-1 font-medium text-amber-400">改编原因</div>
                        <p className="text-muted-foreground">{revision.reason}</p>
                      </div>
                    </div>
                    {revision.originalText && (
                      <div className="mt-3">
                        <div className="mb-1 text-xs font-medium text-muted-foreground">原文</div>
                        <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-black/20 p-3 text-xs leading-relaxed text-muted-foreground">
                          {revision.originalText}
                        </pre>
                      </div>
                    )}
                    {revision.revisedText && (
                      <div className="mt-3">
                        <div className="mb-1 text-xs font-medium text-emerald-400">改编后</div>
                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs leading-relaxed">
                          {revision.revisedText}
                        </pre>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 问题清单 */}
          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">
                问题清单
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  共 {scriptReport.issues.length} 条
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
          {scriptReport.highlights && scriptReport.highlights.length > 0 && (
            <section className="rounded-xl border bg-emerald-500/5 p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                值得保留
              </h2>
              <ul className="space-y-2">
                {scriptReport.highlights.map((h, i) => (
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
