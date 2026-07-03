# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

内部 AI 剧本诊断工具:上传 Word 剧本 → mammoth 提正文 → DeepSeek 出六维诊断报告(结构/人物/场景/对白/逻辑/AI 分镜友好度)→ 前端展示给编辑。10 人团队使用,部署在腾讯云 Lighthouse `43.142.246.168:8080`(不备案,走非标端口)。

## Commands

```bash
# 依赖
pnpm install

# 环境
docker compose up -d              # postgres:15 + redis:7-alpine
cp .env.example .env              # 首次填 DEEPSEEK_API_KEY

# 数据库
pnpm prisma migrate dev --name <name>   # 改 schema 后建迁移
pnpm prisma studio                       # 可视化查数据
pnpm prisma migrate reset                # 清库重来
pnpm exec tsx prisma/seed.ts             # 灌默认用户 + Prompt(upsert,可重复跑)

# 开发(两个进程都要起)
pnpm dev                                          # Next.js @ :3000
pnpm exec tsx workers/analysis-worker.ts          # BullMQ worker

# 构建
pnpm build
pnpm start

# 部署到服务器
ssh -i /Users/caojiahao/Projects/Web/daitu.pem ubuntu@43.142.246.168
```

## Architecture

**通用化任务系统是核心设计**。`AnalysisTask.type` 字段区分任务(`script_review` / `character_consistency` / `storyboard_flow` / `prop_analysis`),对应 `PromptTemplate` 表里的 Prompt 模板。**加新分析类型只需要:写 Prompt + 写报告展示组件**,worker、队列、表结构完全复用。

**上传到报告的完整链路:**

1. `app/api/scripts/upload/route.ts` — 接 formData → `lib/storage.ts` 存 `./data/scripts/` → `lib/parser/word.ts` (mammoth) 提正文塞进 `Script.parsedContent` → 读 `PromptTemplate` (isActive=true 那条) → 建 `AnalysisTask` (status=pending) → `analysisQueue.add`
2. `workers/analysis-worker.ts` — 独立进程,BullMQ 消费,读 `Script.parsedContent.text` + `PromptTemplate.content` → 调 DeepSeek (`response_format: json_object`, temperature 0.3, max_tokens 8000) → 存 `AnalysisReport.issues` (整个 JSON blob) → 更新 task status
3. `app/scripts/[id]/page.tsx` — 客户端组件,每 3s 轮询 `/api/scripts/[id]`,status=completed 停止轮询,渲染 `AnalysisReport.issues` 里的 `summary / scoreBreakdown / issues[] / highlights`

**关键点:**
- Worker 是独立进程,不依赖 Next.js 运行时。Prisma client 各自实例化。
- `Script.parsedContent` 存 `{ text: string }`,后续按场次结构化时改成 `{ scenes: [...] }`,worker 里 `formatParsedContent` 兼容两种。
- 报告 JSON 直接存 `AnalysisReport.issues` (Prisma Json 字段),前端解构渲染,不做 schema 层校验(v1 阶段容忍 LLM 输出偏差)。
- 认证用 NextAuth 但 provider 是空的 `authorize()` — 所有 API 目前默认用户 `default@local`,飞书登录待接入。

## Data Model

5 张表 (`prisma/schema.prisma`):

```
User(id, email, name, feishuUserId?, role)
  └─< Script(id, userId, title, filePath, wordCount, parsedContent: Json)
        └─< AnalysisTask(id, scriptId, type, status, promptVersion, errorMessage)
              └─1 AnalysisReport(id, taskId, summary, overallScore, issues: Json, rawResponse, costTokens)

PromptTemplate(type, version) unique — isActive=true 那条被 worker 读取
```

## Prompt 迭代

改 Prompt 只需要:改 `prisma/seed.ts` 里的 `SCRIPT_REVIEW_V1` 常量 → 重跑 seed(`upsert` 会覆盖同 version)。或者在 `prisma studio` 里改 `PromptTemplate.content`。

要保留旧版本:在 seed.ts 里加一条 `version='v2'`,把 v1 的 `isActive` 改 false。

输出 JSON schema 见 README.md,前端 `app/scripts/[id]/page.tsx` 里的 `Report` type 也是这个结构。

## Conventions

- **包管理器**:pnpm。不要用 npm/yarn(lockfile 会打架)。
- **文件存储**:本地文件系统 `./data/scripts/`,已在 `.gitignore`。**不要引入 COS/OSS**,用户明确选了本地存储。
- **API 路由**:Next.js App Router `route.ts`,不要用 Pages Router。
- **UI 库**:shadcn/ui + tailwind + lucide-react。不要引 antd / mui / heroicons 等其他 UI 库。
- **导入路径**:`@/*` 指向项目根(见 tsconfig paths)。
- **日期时区**:数据库 UTC,前端展示 `toLocaleString("zh-CN")`。
- **中文**:界面文案全中文,注释可中可英。
- **注释**:默认不写,只在"为什么"不明显时补一行。

## 服务器约定

- 腾讯云 Lighthouse Ubuntu 24.04,Docker 29.6.1 + Compose v5.3.0 已装,ubuntu 用户免 sudo。
- Docker daemon 已配国内镜像加速(腾讯云 / USTC / 网易)。
- 预拉:postgres:15 / redis:7-alpine / node:20-slim。
- **不备案**:80/443 被封,应用走 8080。防火墙已放行 22/8080/8443。
- SSH:`ssh -i /Users/caojiahao/Projects/Web/daitu.pem ubuntu@43.142.246.168`
- 生产 Dockerfile 和 compose.prod.yml **待补**(阶段 4)。

## 已知踩坑

- **`response_format: json_object`** 不保证字段齐,前端渲染要 `report.issues?.map`、`scoreBreakdown ?? {}` 兜底。
- **Trae 自动改代码**会引入不需要的库(如尝试装 antd)。审 diff 时按 Conventions 挡回去。
- **DeepSeek 有时返回 `deepseek-v4-flash`** 之类不同 fingerprint 的模型,不是 bug,是服务端路由。
