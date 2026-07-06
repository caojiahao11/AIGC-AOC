import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/db";
import type { CharacterRow } from "@/lib/character-table";

export const dynamic = "force-dynamic";

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

  const aoa: (string | number)[][] = [
    ["序号", "角色名", "身份", "英文版身份", "首次出现集数"],
    ...characters.map((c, i) => [
      i + 1,
      c.name ?? "",
      c.identity ?? "",
      c.identityEn ?? "",
      c.firstEpisode ?? ""
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 6 }, { wch: 14 }, { wch: 32 }, { wch: 32 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "人物出场表");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const filename = `${script.title.replace(/[\\/:*?"<>|]/g, "_")}-人物出场表.xlsx`;

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    }
  });
}
