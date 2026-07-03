"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";

type Prompt = {
  id: string;
  type: string;
  version: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const TYPE_LABEL: Record<string, string> = {
  script_review: "剧本诊断",
  character_consistency: "分镜人物一致性",
  storyboard_flow: "分镜流畅度",
  prop_analysis: "人物-道具解析"
};

export default function PromptsPage() {
  const [list, setList] = useState<Prompt[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [newVersion, setNewVersion] = useState("");
  const [showNew, setShowNew] = useState(false);

  async function reload(keepSelected = true) {
    const res = await fetch("/api/prompts");
    const data = (await res.json()) as Prompt[];
    setList(data);
    if (keepSelected && selectedId) {
      const p = data.find((x) => x.id === selectedId);
      if (p) {
        setContent(p.content);
        setSavedContent(p.content);
      }
    } else if (data.length > 0) {
      const active = data.find((x) => x.isActive) ?? data[0];
      setSelectedId(active.id);
      setContent(active.content);
      setSavedContent(active.content);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(false); }, []);

  const selected = list.find((x) => x.id === selectedId);
  const dirty = content !== savedContent;

  async function save() {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/prompts/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });
    setSavedContent(content);
    setSaving(false);
  }

  async function setActive() {
    if (!selected) return;
    await fetch(`/api/prompts/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setActive: true })
    });
    reload();
  }

  async function del() {
    if (!selected) return;
    if (!confirm(`确认删除 ${selected.type} ${selected.version}?`)) return;
    const res = await fetch(`/api/prompts/${selected.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "删除失败");
      return;
    }
    setSelectedId(null);
    reload(false);
  }

  async function createNew() {
    if (!selected || !newVersion.trim()) return;
    const res = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: selected.type,
        version: newVersion.trim(),
        content: content,
        setActive: false
      })
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "创建失败");
      return;
    }
    const { id } = await res.json();
    setShowNew(false);
    setNewVersion("");
    setSelectedId(id);
    reload();
  }

  // 按 type 分组
  const grouped: Record<string, Prompt[]> = {};
  for (const p of list) {
    if (!grouped[p.type]) grouped[p.type] = [];
    grouped[p.type].push(p);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prompt 管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            编辑内容后点保存立刻生效。切换生效版本无需重启。
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[280px_1fr]">
        {/* 左侧列表 */}
        <aside className="space-y-4">
          {Object.entries(grouped).map(([type, versions]) => (
            <div key={type}>
              <div className="mb-2 text-xs font-semibold text-muted-foreground">
                {TYPE_LABEL[type] ?? type}
              </div>
              <ul className="space-y-1">
                {versions.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setSelectedId(p.id);
                        setContent(p.content);
                        setSavedContent(p.content);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        p.id === selectedId
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <span className="font-mono">{p.version}</span>
                      {p.isActive && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                          <CheckCircle2 className="h-3 w-3" />
                          生效
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* 右侧编辑 */}
        <section>
          {!selected ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
              选择一个 Prompt 版本查看和编辑
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-mono">
                  {selected.type} / {selected.version}
                </span>
                {selected.isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" />
                    当前生效
                  </span>
                ) : (
                  <button
                    onClick={setActive}
                    className="rounded-md border border-emerald-500/40 px-2 py-1 text-xs text-emerald-500 hover:bg-emerald-500/10"
                  >
                    切换为生效
                  </button>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => setShowNew((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                  >
                    <Plus className="h-3 w-3" />
                    另存新版本
                  </button>
                  {!selected.isActive && (
                    <button
                      onClick={del}
                      className="inline-flex items-center gap-1 rounded-md border border-red-500/30 px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      删除
                    </button>
                  )}
                  <button
                    onClick={save}
                    disabled={!dirty || saving}
                    className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                  >
                    <Save className="h-3 w-3" />
                    {saving ? "保存中..." : dirty ? "保存(未保存)" : "已保存"}
                  </button>
                </div>
              </div>

              {showNew && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-dashed p-3">
                  <span className="text-xs text-muted-foreground">新版本号:</span>
                  <input
                    className="flex-1 rounded-md border px-2 py-1 text-sm"
                    placeholder="如 v2 / v2-加节奏图"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                  />
                  <button
                    onClick={createNew}
                    disabled={!newVersion.trim()}
                    className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground disabled:opacity-40"
                  >
                    创建(复制当前内容)
                  </button>
                </div>
              )}

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-[600px] w-full rounded-lg border bg-background p-4 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary"
                spellCheck={false}
              />

              <p className="mt-2 text-xs text-muted-foreground">
                提示:改完保存 → 下次分析立刻用新 Prompt。旧任务的报告不会重新生成,新上传或重新分析时才会用新版本。
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
