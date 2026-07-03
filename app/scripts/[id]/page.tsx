"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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

const SEVERITY_LABEL: Record<string, { text: string; className: string }> = {
  high: { text: "严重", className: "bg-red-100 text-red-700" },
  medium: { text: "中等", className: "bg-orange-100 text-orange-700" },
  low: { text: "建议", className: "bg-blue-100 text-blue-700" }
};

export default function ScriptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ScriptDetail | null>(null);

  useEffect(() => {
    let stop = false;
    async function tick() {
      const res = await fetch(`/api/scripts/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (!stop) setData(json);
        if (json.task?.status === "completed" || json.task?.status === "failed") return;
      }
      if (!stop) setTimeout(tick, 3000);
    }
    tick();
    return () => {
      stop = true;
    };
  }, [id]);

  if (!data) return <main className="p-10">加载中...</main>;

  const task = data.task;
  const report = task?.report;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← 返回列表
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">{data.title}</h1>
      <div className="mt-1 text-sm text-muted-foreground">
        {data.wordCount} 字 · {new Date(data.createdAt).toLocaleString("zh-CN")}
      </div>

      {!task && <div className="mt-8">未发起分析</div>}

      {task && task.status !== "completed" && task.status !== "failed" && (
        <div className="mt-8 rounded-md border bg-muted/30 p-6">
          <div className="animate-pulse">分析中,请稍候...(约 30~90 秒)</div>
          <div className="mt-1 text-xs text-muted-foreground">状态:{task.status}</div>
        </div>
      )}

      {task?.status === "failed" && (
        <div className="mt-8 rounded-md border border-red-300 bg-red-50 p-6 text-red-700">
          分析失败:{task.errorMessage}
        </div>
      )}

      {report && (
        <div className="mt-8 space-y-6">
          <section className="rounded-lg border p-6">
            <div className="text-sm text-muted-foreground">总评</div>
            <div className="mt-1 text-lg">{report.summary}</div>
            <div className="mt-3 text-3xl font-semibold">{report.overallScore} / 10</div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {Object.entries(report.scoreBreakdown || {}).map(([k, v]) => (
                <div key={k} className="rounded-md bg-muted px-3 py-2">
                  <span className="text-muted-foreground">{CATEGORY_LABEL[k] ?? k}</span>
                  <span className="ml-2 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">问题清单({report.issues?.length ?? 0} 条)</h2>
            <ul className="space-y-3">
              {report.issues?.map((issue, i) => {
                const sev = SEVERITY_LABEL[issue.severity] ?? SEVERITY_LABEL.low;
                return (
                  <li key={i} className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${sev.className}`}>{sev.text}</span>
                      <span className="text-muted-foreground">{CATEGORY_LABEL[issue.category] ?? issue.category}</span>
                      <span className="text-muted-foreground">·</span>
                      <span>{issue.sceneId}</span>
                    </div>
                    {issue.quote && (
                      <blockquote className="mt-2 border-l-2 pl-3 text-sm text-muted-foreground">
                        &ldquo;{issue.quote}&rdquo;
                      </blockquote>
                    )}
                    <div className="mt-2 text-sm">
                      <div><span className="font-medium">问题:</span> {issue.problem}</div>
                      <div className="mt-1"><span className="font-medium">建议:</span> {issue.suggestion}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {report.highlights?.length > 0 && (
            <section className="rounded-lg border p-6">
              <h2 className="mb-3 text-lg font-semibold">值得保留</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {report.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
