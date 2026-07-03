import Link from "next/link";
import { prisma } from "@/lib/db";

async function getScripts() {
  return prisma.script.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { tasks: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
}

const STATUS_LABEL: Record<string, string> = {
  pending: "排队中",
  running: "分析中",
  completed: "已完成",
  failed: "失败"
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const scripts = await getScripts();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">剧本诊断工具</h1>
        <Link
          href="/upload"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-black/80"
        >
          上传剧本
        </Link>
      </div>

      {scripts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          还没有任何剧本,点右上角上传第一个吧
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {scripts.map((s) => {
            const status = s.tasks[0]?.status ?? "none";
            return (
              <li key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <Link href={`/scripts/${s.id}`} className="font-medium hover:underline">
                    {s.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {s.wordCount} 字 · {new Date(s.createdAt).toLocaleString("zh-CN")}
                  </div>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs">
                  {STATUS_LABEL[status] ?? status}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
