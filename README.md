# 剧本诊断工具 (Script Review)

内部使用的 AI 剧本诊断工具。上传 Word 剧本,LLM 从**结构 / 人物 / 场景 / 对白 / 逻辑 / AI 分镜友好度**六个维度出诊断报告,给编辑修剧本用。

架构做了通用化,后续可扩展**分镜人物一致性**、**分镜流畅度**、**分镜人物-道具解析**等能力,不用改表结构。

---

## 技术栈

| 层 | 选型 |
|---|---|
| 前后端 | Next.js 14 App Router + TypeScript |
| UI | Tailwind CSS + shadcn/ui + lucide-react |
| 数据库 | PostgreSQL 15 + Prisma |
| 任务队列 | BullMQ + Redis 7 |
| 认证 | NextAuth.js(默认用户模式,后续接飞书) |
| LLM | DeepSeek V3(via openai SDK,`response_format: json_object`) |
| 文件存储 | 本地文件系统(`./data/scripts`) |
| Word 解析 | mammoth |
| 部署 | Docker Compose + 腾讯云 Lighthouse |

---

## 目录结构

```
script-review/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/      NextAuth 路由
│   │   └── scripts/
│   │       ├── route.ts              GET /api/scripts 列表
│   │       ├── upload/route.ts       POST 上传 + 触发分析
│   │       └── [id]/
│   │           ├── route.ts          GET 详情 + 报告
│   │           └── download/route.ts GET 下载原文件
│   ├── upload/page.tsx               上传页(拖放交互)
│   ├── scripts/[id]/page.tsx         报告页(轮询状态)
│   ├── page.tsx                      首页(列表)
│   └── layout.tsx
├── lib/
│   ├── db.ts                         Prisma client (singleton)
│   ├── queue.ts                      BullMQ analysis queue
│   ├── llm.ts                        DeepSeek 封装
│   ├── storage.ts                    本地文件读写
│   ├── auth.ts                       NextAuth 配置
│   ├── utils.ts                      cn() 等
│   └── parser/
│       ├── index.ts
│       └── word.ts                   mammoth 解析 .docx
├── workers/
│   └── analysis-worker.ts            BullMQ Worker(独立进程)
├── prisma/
│   ├── schema.prisma                 5 张表
│   └── seed.ts                       默认用户 + Prompt v1
├── components/ui/                    shadcn 组件
├── data/scripts/                     .gitignore 忽略
├── docker-compose.yml                postgres + redis
└── .env.example
```

---

## 数据模型

```
User ─┬──< Script ──< AnalysisTask ──1─ AnalysisReport
      └──< AnalysisTask

PromptTemplate  (type, version 唯一, isActive 选一版本上线)
```

关键设计:`AnalysisTask.type` 字段区分任务类型(`script_review` / `character_consistency` / `storyboard_flow` / `prop_analysis`),后续扩展只加 Prompt 模板 + 报告展示组件,**表结构不动**。

---

## 本地开发

### 前置

- Node.js 20+
- pnpm(`corepack enable pnpm`)
- Docker Desktop

### 首次启动

```bash
git clone https://github.com/caojiahao11/AIGC-AOC.git script-review
cd script-review
pnpm install

# 环境变量
cp .env.example .env
# 编辑 .env,填 DEEPSEEK_API_KEY

# 起 postgres + redis
docker compose up -d

# 建表 + 灌种子数据(默认用户 + Prompt v1)
pnpm prisma migrate dev --name init
pnpm exec tsx prisma/seed.ts

# 起两个进程(两个终端)
pnpm dev                              # http://localhost:3000
pnpm exec tsx workers/analysis-worker.ts   # BullMQ worker
```

打开 http://localhost:3000 → 上传剧本 → 30~90 秒后看报告。

### 常用命令

```bash
# Prisma
pnpm prisma studio           # 可视化数据库
pnpm prisma migrate dev      # 改 schema 后新增迁移
pnpm prisma migrate reset    # 重置数据库(会删数据)

# 服务
docker compose logs -f postgres redis
docker compose down -v       # 关闭并清空数据

# 灌 Prompt(改了 seed.ts 后重跑)
pnpm exec tsx prisma/seed.ts
```

---

## 环境变量

```env
# App
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="用 openssl rand -base64 32 生成"

# Database
DATABASE_URL="postgresql://script_review:script_review@localhost:5432/script_review?schema=public"

# Redis / BullMQ
REDIS_URL="redis://localhost:6379"

# DeepSeek
DEEPSEEK_API_KEY="sk-xxx"
DEEPSEEK_BASE_URL="https://api.deepseek.com/v1"
DEEPSEEK_MODEL="deepseek-chat"

# Local file storage
SCRIPTS_STORAGE_DIR="./data/scripts"
MAX_UPLOAD_SIZE_MB="50"
```

---

## Prompt 与迭代

**当前**:`type=script_review, version=v1`,存储在 `PromptTemplate` 表,`isActive=true` 的会被 worker 读取。

**迭代步骤:**

1. 改 `prisma/seed.ts` 里的 `SCRIPT_REVIEW_V1`(或复制成 v2)
2. 重跑 `pnpm exec tsx prisma/seed.ts`(`upsert` 会覆盖同 version)
3. 或直接在 `pnpm prisma studio` 里改数据库

**输出 JSON schema:**

```typescript
{
  summary: string;             // 60 字总评
  overallScore: number;        // 1-10
  scoreBreakdown: {
    structure: number; character: number; scene: number;
    dialogue: number; logic: number; ai_friendly: number;
  };
  issues: [{
    category: 'structure' | 'character' | 'scene' | 'dialogue' | 'logic' | 'ai_friendly';
    severity: 'high' | 'medium' | 'low';
    sceneId: string;           // "第 3 场"
    quote: string;             // 原文片段
    problem: string;
    suggestion: string;        // 必须可执行,不接受空话
  }];
  highlights: string[];        // 1-3 条优点
}
```

---

## 生产部署(腾讯云 Lighthouse)

**服务器:** 上海,Ubuntu 24.04,Docker 已装,IP `43.142.246.168:8080`。

```bash
ssh -i daitu.pem ubuntu@43.142.246.168

# 首次
git clone https://github.com/caojiahao11/AIGC-AOC.git script-review
cd script-review
cp .env.example .env  # 编辑填生产密钥
docker compose -f docker-compose.prod.yml up -d --build
docker compose exec app pnpm prisma migrate deploy
docker compose exec app pnpm exec tsx prisma/seed.ts

# 更新
git pull && docker compose -f docker-compose.prod.yml up -d --build
```

生产 docker compose 会包含 app + worker + postgres + redis 四个容器,8080 端口对外。

> `docker-compose.prod.yml` 和 `Dockerfile` 待补(阶段 4)。

---

## 扩展新分析类型

以人物一致性为例:

1. **写 Prompt** → 加到 `seed.ts`,`type='character_consistency', version='v1'`
2. **触发** → 前端加入口调 `POST /api/analysis`(待实现),传 `scriptId + type`
3. **Worker 已通用**,读 `PromptTemplate` + `Script.parsedContent` 就跑
4. **报告展示** → 新建 `app/scripts/[id]/character/page.tsx`,复用 `AnalysisReport` 表读结果

数据库结构不动,worker 不动。

---

## 路线图

- [x] 服务器 + Docker 就绪
- [x] 骨架 + 5 张表
- [x] 上传 → 解析 → DeepSeek → 报告 全链路
- [ ] 拿真实剧本迭代 Prompt v2
- [ ] 报告导出(Word / Markdown)
- [ ] 飞书扫码登录 + 飞书文档直接读
- [ ] 分镜一致性 / 流畅度 / 道具解析
- [ ] 生产部署 + 团队试用

---

## 安全

- `.env`、`data/`、`node_modules` 已在 `.gitignore`
- 密钥不进仓库,通过环境变量注入
- 生产建议:80/443 走反代,加飞书登录,DEEPSEEK_API_KEY 限流

---

## License

内部项目,未开源。
