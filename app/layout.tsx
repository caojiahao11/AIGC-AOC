import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Upload } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "剧本诊断工具",
  description: "上传剧本 Word 文件，AI 自动分析结构、人物、对白与逻辑问题"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <FileText className="h-5 w-5 text-primary" />
              剧本诊断
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Upload className="h-3.5 w-3.5" />
              上传剧本
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
