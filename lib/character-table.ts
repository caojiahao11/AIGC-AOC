export type CharacterRow = {
  name: string;
  identity: string;
  identityEn: string;
  firstEpisode: string;
};

export function renderCharacterTableHtml(title: string, rows: CharacterRow[]): string {
  const escape = (s: string) =>
    (s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const tbody = rows
    .map(
      (r, i) => `<tr class="${i % 2 ? "even" : "odd"}">
      <td class="idx">${i + 1}</td>
      <td class="name">${escape(r.name)}</td>
      <td>${escape(r.identity)}</td>
      <td>${escape(r.identityEn)}</td>
      <td class="ep">${escape(r.firstEpisode)}</td>
    </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>${escape(title)} 人物出场介绍表</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px;
    font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
    background: #ffffff;
    color: #1f2937;
  }
  .wrap { max-width: 960px; margin: 0 auto; }
  h1 {
    font-size: 22px;
    margin: 0 0 6px 0;
    color: #111827;
  }
  .sub {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  thead th {
    background: #1e293b;
    color: #f8fafc;
    font-weight: 600;
    text-align: left;
    padding: 12px 14px;
    font-size: 13px;
  }
  tbody td {
    padding: 11px 14px;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: top;
  }
  tr.even { background: #f9fafb; }
  td.idx { color: #9ca3af; width: 42px; text-align: center; }
  td.name { font-weight: 600; color: #0f172a; white-space: nowrap; }
  td.ep { text-align: center; color: #6366f1; font-variant-numeric: tabular-nums; white-space: nowrap; }
</style>
</head>
<body>
<div class="wrap">
  <h1>${escape(title)}</h1>
  <div class="sub">首次出场人物介绍表 · 共 ${rows.length} 位角色</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>角色名</th>
        <th>身份</th>
        <th>英文版身份</th>
        <th>首次出现集数</th>
      </tr>
    </thead>
    <tbody>
      ${tbody}
    </tbody>
  </table>
</div>
</body>
</html>`;
}
