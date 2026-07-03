import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { prisma } from "@/lib/db";
import { createReadStream, getFileStats, fileExists, isPathWithinStorage } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const script = await prisma.script.findUnique({
    where: { id }
  });

  if (!script) {
    return NextResponse.json({ error: "文件不存在" }, { status: 404 });
  }

  if (!isPathWithinStorage(script.filePath)) {
    return NextResponse.json({ error: "非法文件路径" }, { status: 400 });
  }

  const exists = await fileExists(script.filePath);
  if (!exists) {
    return NextResponse.json({ error: "文件已丢失" }, { status: 404 });
  }

  const stats = await getFileStats(script.filePath);
  const nodeStream = createReadStream(script.filePath);

  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  const filename = (script.title ?? "script").includes(".")
    ? script.title!
    : `${script.title ?? "script"}.docx`;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(stats.size),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`
    }
  });
}
