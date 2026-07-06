import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { renderCharacterTableHtml, type CharacterRow } from "@/lib/character-table";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const script = await prisma.script.findUnique({
    where: { id: params.id },
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { report: true }
      }
    }
  });
  if (!script) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (script.kind !== "storyboard") {
    return NextResponse.json({ error: "该资源不是分镜文件" }, { status: 400 });
  }

  const report = script.tasks[0]?.report;
  const characters = (report?.issues as { characters?: CharacterRow[] } | null)?.characters ?? [];
  if (characters.length === 0) {
    return NextResponse.json({ error: "报告尚未生成或没有人物数据" }, { status: 404 });
  }

  const html = renderCharacterTableHtml(script.title, characters);

  const puppeteer = (await import("puppeteer")).default;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 800, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "load" });

    const element = await page.$(".wrap");
    const buffer = element
      ? await element.screenshot({ type: "png" })
      : await page.screenshot({ type: "png", fullPage: true });

    const filename = `${script.title.replace(/[\\/:*?"<>|]/g, "_")}-人物出场表.png`;
    return new NextResponse(new Uint8Array(buffer as Buffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
      }
    });
  } finally {
    await browser.close();
  }
}
