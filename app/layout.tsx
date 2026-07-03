import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "剧本诊断工具",
  description: "内部剧本诊断工具"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
