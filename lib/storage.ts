import fs from "fs";
import path from "path";

const SCRIPTS_DIR = process.env.SCRIPTS_STORAGE_DIR ?? "/data/scripts";

// 确保目录存在（异步）
async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true });
}

// 清洗文件名，防止路径遍历
export function sanitizeFilename(name: string): string {
  const base = path.basename(name);
  return base.replace(/[/\\]/g, "_").replace(/\.\./g, "_");
}

export function getScriptsDir(): string {
  return SCRIPTS_DIR;
}

export async function buildFilePath(filename: string): Promise<string> {
  const safe = sanitizeFilename(filename);
  return path.join(SCRIPTS_DIR, safe);
}

// 校验路径是否在允许的存储目录下
export function isPathWithinStorage(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  return resolved.startsWith(path.resolve(SCRIPTS_DIR));
}

export async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  await ensureDir(SCRIPTS_DIR);
  const filePath = await buildFilePath(filename);

  if (!isPathWithinStorage(filePath)) {
    throw new Error("非法文件路径");
  }

  await fs.promises.writeFile(filePath, buffer);
  return filePath;
}

export function createReadStream(filePath: string) {
  return fs.createReadStream(filePath);
}

export async function getFileStats(filePath: string) {
  return fs.promises.stat(filePath);
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
