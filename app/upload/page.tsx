"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  FileText,
  X,
  AlertTriangle,
  ArrowLeft,
  Loader2
} from "lucide-react";

const MAX_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB ?? "50");
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const validateFile = (f: File): string | null => {
    if (f.size > MAX_SIZE_BYTES) return `文件超过 ${MAX_SIZE_MB}MB 限制`;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".docx") return "仅支持 .docx 格式";
    return null;
  };

  const handleFile = (f: File | null) => {
    setError(null);
    if (!f) { setFile(null); return; }
    const err = validateFile(f);
    if (err) { setError(err); setFile(null); return; }
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0] ?? null;
    setError(null);
    if (!dropped) { setFile(null); return; }
    const err = validateFile(dropped);
    if (err) { setError(err); setFile(null); return; }
    setFile(dropped);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    if (title) fd.append("title", title);

    try {
      const res = await fetch("/api/scripts/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "上传失败");
      router.push(`/scripts/${json.scriptId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "上传失败");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">上传剧本</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        支持 .docx 格式，文件大小不超过 {MAX_SIZE_MB}MB
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {/* 拖放区 */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            dragOver
              ? "border-primary bg-primary/5"
              : file
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-border hover:border-muted-foreground/40"
          }`}
        >
          {!file ? (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium">把 Word 剧本拖到这里</p>
              <p className="mt-1 text-xs text-muted-foreground">
                不会拖拽也没关系，直接点击下面按钮选择文件
              </p>
              <div className="mt-4">
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]">
                  <Upload className="h-4 w-4" />
                  选择 Word 文件
                  <input
                    type="file"
                    accept=".docx"
                    className="sr-only"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">仅支持 .docx 格式，最大 {MAX_SIZE_MB}MB</p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-emerald-400" />
              <div className="text-left">
                <div className="text-sm font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="ml-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* 标题 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">剧本标题（可选）</label>
          <input
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：第 3 集 第一版"
          />
          <p className="mt-1 text-xs text-muted-foreground">留空将使用文件名作为标题</p>
        </div>

        {/* 错误 */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* 提交 */}
        <button
          type="submit"
          disabled={!file || loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              上传并分析中…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              上传并分析
            </>
          )}
        </button>
      </form>
    </main>
  );
}
