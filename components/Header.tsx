"use client";

import Link from "next/link";
import { FileText, Upload, Settings, MessageSquare } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <FileText className="h-5 w-5 text-primary" />
          剧本诊断
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/badcases"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            反馈
          </Link>
          <Link
            href="/prompts"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
            Prompt
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Upload className="h-3.5 w-3.5" />
            上传剧本
          </Link>
        </nav>
      </div>
    </header>
  );
}
