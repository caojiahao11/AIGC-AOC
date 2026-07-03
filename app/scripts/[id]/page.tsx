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
"use client";
"use client";

import { useEffect, useState } from "react";
import { useParams }"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
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
} from"use client";

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

t"use client";

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

type Issue = {
  category: string;
  severity: "high" | "medium"use client";

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

type Issue = {
  category: string;
  severity: "high" | "medium" | "low";
  sceneId: string;
  quote: string;
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

type Issue = {
  category: string;
  severity: "high" | "medium" | "low";
  sceneId: string;
  quote: string;
  problem: string;
  suggestion: string;
};

type Report ="use client";

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
  scoreBreakdown:"use client";

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

type ScriptDetail ="use client";

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
  title"use client";

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
  task"use client";

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
    report: Report | null"use client";

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

const CATEGORY_LABEL: Record<string, string"use client";

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
  logic: ""use client";

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
  ai_friendly:"use client";

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

const CATEGORY_ORDER = ["structure"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: ""use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400""use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400" }
};

const STATUS_META: Record<string, { label: string; icon:"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400" }
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }>"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400" }
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: ""use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400" }
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: "排队中", icon: <Clock className="h-3.5 w-3.5"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400" }
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: "排队中", icon: <Clock className="h-3.5 w-3.5" />, className: "text-amber"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400" }
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: "排队中", icon: <Clock className="h-3.5 w-3.5" />, className: "text-amber-400" },
  running: { label: "分析中", icon: <Loader"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400" }
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: "排队中", icon: <Clock className="h-3.5 w-3.5" />, className: "text-amber-400" },
  running: { label: "分析中", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, class"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400" }
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: "排队中", icon: <Clock className="h-3.5 w-3.5" />, className: "text-amber-400" },
  running: { label: "分析中", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, className: "text-sky-400" },
  completed: { label: "已完成"use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400" }
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: "排队中", icon: <Clock className="h-3.5 w-3.5" />, className: "text-amber-400" },
  running: { label: "分析中", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, className: "text-sky-400" },
  completed: { label: "已完成", icon: <CheckCircle2 className=""use client";

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

const CATEGORY_ORDER = ["structure", "character", "scene", "dialogue", "logic", "ai_friendly"];

const SEVERITY_META: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: "严重", className: "border-red-500/20 bg-red-500/5", dot: "bg-red-400" },
  medium: { label: "中等", className: "border-orange-500/20 bg-orange-500/5", dot: "bg-orange-400" },
  low: { label: "建议", className: "border-sky-500/20 bg-sky-500/5", dot: "bg-sky-400" }
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { label: "排队中", icon: <Clock className="h-3.5 w-3.5" />, className: "text-amber-400" },
  running: { label: "分析中", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, className: "text-sky-400" },
  completed: { label: "已完成", icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: "text-emerald"use client";

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
  failed: {"use client";

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
  failed: { label: "失败", icon: <AlertCircle"use client";

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
  failed: { label: "失败", icon: <AlertCircle className="h-3.5 w-"use client";

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
  const pct = Math.min(Math.max(score *"use client";

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
  const color = pct >= 70 ? ""use client";

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
  const color = pct >= 70 ? "bg-emerald-400" : pct >="use client";

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
  return"use client";

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
      <div className="flex items-center justify-between text-sm"use client";

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
        <span className="text-muted"use client";

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
        <span className="font-medium">{score"use client";

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
      <div className="mt-1"use client";

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
        <div"use client";

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
        <div className={`h-full rounded-full ${color}"use client";

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
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width"use client";

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
      </"use client";

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

export default function ScriptDetail"use client";

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
  const { id } ="use client";

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
  const [data, setData] = use"use client";

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
  const [filterCategory, setFilterCategory]"use client";

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
    let"use client";

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
    let attempts ="use client";

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
    const maxAttempts = 120; // 最多轮询 6 分钟"use client";

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

      try"use client";

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
        const res = await fetch(`/api"use client";

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
        if (res"use client";

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
          const json = await res"use client";

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
          if (json.task?.status"use client";

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
          if (json.task?.status === "completed" || json.task?.status ==="use client";

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
      if (!stop"use client";

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
    return"use client";

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
      <main className="mx-auto flex max-w"use client";

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
      <main className="mx-auto flex max-w-4xl items-center justify-center px-6"use client";

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
        <Loader2 className="mr-2 h"use client";

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
      </main"use client";

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
  const"use client";

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

  const"use client";

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
    ? [...new Set(report.issues.map((i) => i.category))"use client";

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
    ? [...new Set(report.issues.map((i) => i.category))].sort(
        (a, b)"use client";

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
    ? [...new Set(report.issues.map((i) => i.category))].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER"use client";

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
    ? [...new Set(report.issues.map((i) => i.category))].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
      )
    :"use client";

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
    ? [...new Set(report.issues.map((i) => i.category))].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
      )
    : [];

  const filteredIssues = report?.issues.filter((i) => {
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
    ? [...new Set(report.issues.map((i) => i.category))].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
      )
    : [];

  const filteredIssues = report?.issues.filter((i) => {
    if (filterSeverity && i.severity !== filter