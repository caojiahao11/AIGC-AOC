import * as XLSX from "xlsx";

export type StoryboardRow = {
  chapter: string;
  boardIndex: string;
  characters: string;
  scene: string;
  props: string;
  prompt: string;
  dialogue: string;
  original: string;
  duration: string;
};

export type CharacterAppearance = {
  name: string;             // 合并服装后缀后的角色名,如 "Ethan"
  firstChapter: string;     // 首次出现章节,如 "1"
  variants: string[];       // 原始出现形式,如 ["Ethan常服", "Ethan战斗服"]
};

export type StoryboardParsed = {
  rows: StoryboardRow[];
  characters: CharacterAppearance[];
};

const HEADER_ALIASES: Record<keyof StoryboardRow, string[]> = {
  chapter: ["章节", "集数", "章"],
  boardIndex: ["故事板", "分镜", "镜号"],
  characters: ["出现人物", "人物", "角色"],
  scene: ["场景"],
  props: ["道具", "物品"],
  prompt: ["提示词", "prompt"],
  dialogue: ["对应台词", "台词"],
  original: ["对应原文", "原文"],
  duration: ["预估时长", "时长"]
};

// 服装/形态后缀,合并同名角色时剥掉
// 例:"Ethan常服" / "Ethan战斗服" / "Serafina晚礼服" → "Ethan" / "Serafina"
const OUTFIT_SUFFIX = /(常服|战斗服|战服|礼服|晚礼服|校服|便服|正装|睡衣|运动服|军装|盔甲|变身形态|受伤形态|变装|童年|少年|老年|回忆|幼年|成年)$/;

function stripOutfit(raw: string): string {
  let name = raw.trim();
  // 反复剥,防止"Ethan常服变装"这种组合
  for (let i = 0; i < 3; i++) {
    const next = name.replace(OUTFIT_SUFFIX, "").trim();
    if (next === name) break;
    name = next;
  }
  return name;
}

function splitCharacterCell(cell: string): string[] {
  if (!cell) return [];
  return cell
    .split(/[、,，;；\s\n\r]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function locateColumns(headerRow: unknown[]): Partial<Record<keyof StoryboardRow, number>> {
  const map: Partial<Record<keyof StoryboardRow, number>> = {};
  headerRow.forEach((cell, idx) => {
    const value = String(cell ?? "").trim();
    if (!value) return;
    for (const key of Object.keys(HEADER_ALIASES) as (keyof StoryboardRow)[]) {
      if (map[key] !== undefined) continue;
      if (HEADER_ALIASES[key].some((alias) => value.includes(alias))) {
        map[key] = idx;
      }
    }
  });
  return map;
}

function readCell(row: unknown[], idx: number | undefined): string {
  if (idx === undefined) return "";
  const v = row[idx];
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

export function parseStoryboardBuffer(buffer: Buffer): StoryboardParsed {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames.find((n) => n.includes("分镜") || n.includes("脚本")) ?? wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error("分镜文件为空");

  const table: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (table.length < 2) throw new Error("分镜表内容过少,无法识别");

  const cols = locateColumns(table[0]);
  if (cols.characters === undefined) {
    throw new Error("未在分镜表中找到'出现人物'列,请检查表头");
  }

  const rows: StoryboardRow[] = [];
  const firstSeen = new Map<string, { chapter: string; variants: Set<string> }>();

  for (let i = 1; i < table.length; i++) {
    const raw = table[i];
    if (!raw || raw.every((v) => !String(v ?? "").trim())) continue;

    const row: StoryboardRow = {
      chapter: readCell(raw, cols.chapter),
      boardIndex: readCell(raw, cols.boardIndex),
      characters: readCell(raw, cols.characters),
      scene: readCell(raw, cols.scene),
      props: readCell(raw, cols.props),
      prompt: readCell(raw, cols.prompt),
      dialogue: readCell(raw, cols.dialogue),
      original: readCell(raw, cols.original),
      duration: readCell(raw, cols.duration)
    };
    rows.push(row);

    const chapter = row.chapter || "?";
    for (const rawName of splitCharacterCell(row.characters)) {
      const canonical = stripOutfit(rawName);
      if (!canonical) continue;
      const seen = firstSeen.get(canonical);
      if (!seen) {
        firstSeen.set(canonical, { chapter, variants: new Set([rawName]) });
      } else {
        seen.variants.add(rawName);
      }
    }
  }

  const characters: CharacterAppearance[] = Array.from(firstSeen.entries())
    .map(([name, v]) => ({
      name,
      firstChapter: v.chapter,
      variants: Array.from(v.variants)
    }))
    .sort((a, b) => {
      const na = Number(a.firstChapter);
      const nb = Number(b.firstChapter);
      if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
      return a.name.localeCompare(b.name, "zh-Hans-CN");
    });

  return { rows, characters };
}
