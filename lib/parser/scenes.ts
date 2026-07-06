// 把整篇剧本按"第X场/第X章/场景标题"拆成场次数组
// 兼容多种常见标记:第1场、第一场、场景1、Scene 1、第X章 等

export type Scene = {
  id: string;         // 标题,如 "第 3 场"
  content: string;    // 该场完整正文(含标题行)
  index: number;      // 0-based 序号
};

// 匹配一行是不是场次开头
const SCENE_HEADER = /^\s*(第\s*[0-9一二三四五六七八九十百千零]+\s*(?:场|集|章|幕|节)|Scene\s*\d+|场景\s*\d+|第\s*\d+\s*[场集章幕节])/i;

export function splitScenes(text: string): Scene[] {
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const scenes: Scene[] = [];
  let currentTitle: string | null = null;
  let currentBuffer: string[] = [];

  const flush = () => {
    if (currentTitle === null && currentBuffer.length === 0) return;
    const title = currentTitle ?? `场次 ${scenes.length + 1}`;
    const content = [currentTitle, ...currentBuffer].filter(Boolean).join("\n").trim();
    if (content) {
      scenes.push({ id: title.trim(), content, index: scenes.length });
    }
  };

  for (const line of lines) {
    if (SCENE_HEADER.test(line)) {
      flush();
      currentTitle = line.trim();
      currentBuffer = [];
    } else {
      currentBuffer.push(line);
    }
  }
  flush();

  // 若一场都没识别出来(整篇没有明显标记),把整篇作为单场
  if (scenes.length === 0 && text.trim()) {
    scenes.push({ id: "全文", content: text.trim(), index: 0 });
  }

  return scenes;
}
