# 剧本诊断工具 · 项目说明

> 内部使用的 AI 剧本诊断工具。上传 Word 剧本,LLM 出六维诊断报告给编辑改剧本。给团队 10 人用。

---

## 一、这个项目到底做什么

**背景**:你们在做漫剧 AI TC 项目,流程是"剧本 → AI 生成分镜 / 人物卡 / 道具卡 / 场景卡"。发现分镜复杂、反复改的**根源在剧本本身**——剧本不够好,AI 解析出来的东西自然烂。

**目标**:在 LLM 生成分镜**之前**,先诊断剧本的问题,让编辑改到位再进 AI。

**流程**:
```
编辑上传 Word 剧本
    ↓
系统解析 Word 正文
    ↓
DeepSeek 从六个维度诊断
    ↓
出结构化报告(问题定位 + 修改建议)
    ↓
编辑改剧本 → 再进 AI 分镜
```

---

## 二、检查什么(v1 版 Prompt)

六大维度,每次都全跑一遍:

| 维度 | 检查什么 |
|---|---|
| **结构与节奏** | 起承转合、场次功能、铺垫和高潮 |
| **人物一致性** | 动机、行为符合设定、有没有工具人 |
| **场景与画面** | 场景描述能不能画面化、切换是否流畅 |
| **对白** | 是否口语化、有没有信息倾倒 / 说教 |
| **逻辑与设定** | 剧情自洽、世界观一致、线索是否交代 |
| **AI 分镜友好度**(项目特有) | 抽象表达 / 多人同框 / 道具具体度 |

**报告结构**:
- 一句话总评(60 字)
- 总分 1-10(人物 + 逻辑权重 x1.5)
- 六维分
- 问题清单 5~15 条(每条:严重度 + 场次 + 原文引用 + 问题 + 具体修改建议)
- 值得保留的优点 1~3 条

---

## 三、怎么用

**给团队的一句话**:
> 剧本诊断工具:http://43.142.246.168:8080
> 上传 Word(.docx),等 30~90 秒出报告

**默认所有人共用一个用户**(`default@local`),后期接飞书登录后按人区分。

---

## 四、技术架构(简版)

```
浏览器 ──HTTP──▶ Next.js App ──写库/入队──▶ Postgres + Redis
                                                     │
                                          Worker 独立进程消费队列
                                                     │
                                                     ▼
                                          DeepSeek API 出报告
                                                     │
                                                     ▼
                                          Postgres 存报告
                                                     │
                            浏览器 ──轮询查询──▶ Next.js App 返回
```

**部署**:5 个 Docker 容器
- `sr-postgres` — 数据库
- `sr-redis` — 队列存储
- `sr-migrator` — 首次跑迁移 + seed 后退出
- `sr-app` — Next.js 8080 → 3000
- `sr-worker` — BullMQ 消费者,并发 3

**存储**:
- 剧本文件:服务器 `/data/scripts`(docker volume `scripts-data`)
- 数据 / 报告:Postgres

**AI**:
- DeepSeek V3(deepseek-chat 模型)
- 单次成本 ¥0.06 左右
- 服务器 → DeepSeek 全在国内,快

---

## 五、五张表

```
User(默认用户 default@local)
  └─< Script(剧本记录 + 解析后正文)
        └─< AnalysisTask(分析任务:type=script_review)
              └─1 AnalysisReport(报告 JSON)

PromptTemplate(每个 type 挂多版本 Prompt,isActive=true 那个被用)
```

**关键设计:`AnalysisTask.type` 字段是通用的**,后续加:
- 分镜人物一致性(`character_consistency`)
- 分镜流畅度(`storyboard_flow`)
- 人物-道具解析(`prop_analysis`)

**只需要**:写新 Prompt + 写新报告展示组件。数据库结构、队列、worker 完全不动。

---

## 六、迭代逻辑

### 迭代什么最有价值

按投入产出比排序:

**1. Prompt(优先级 ★★★★★)**

真正决定报告有没有用的是 Prompt。v1 是通用模板,**必须用真实剧本跑几次,针对性调整**。

调 Prompt 的方式:
1. 拿一个你觉得"AI 分镜做得烂"的剧本上传
2. 看报告有没有指出你实际踩过的坑
3. 没指出 → 把这个坑加进 Prompt 的对应维度
4. 报告太啰嗦 → 调 Prompt 让它更聚焦
5. 报告太笼统 → 强调"必须给出具体修改建议 + 原文引用"

调完 Prompt 只要在 `prisma/seed.ts` 改 `SCRIPT_REVIEW_V1` 常量 → 重跑 seed。**不用重启服务**。

**2. 报告 UI(优先级 ★★★★)**

- 编辑说"这个报告我看不懂 / 找不到位置" → 改 `app/scripts/[id]/page.tsx`
- 加"按严重度筛选"、"按维度筛选"、"导出 Word"

**3. 输入源(优先级 ★★★)**

现在只支持 Word 上传。可以加:
- 飞书文档链接直接读(飞书开放平台 API)
- 拖多个文件批量上传
- 剧本模板结构化解析(按"第 X 场"拆场,LLM 定位更准)

**4. 新分析类型(优先级 ★★★,长期)**

按你说的三个方向:
- **分镜人物一致性**:输入是分镜列表 + 人物卡,检查同一角色在不同分镜里外观/性格是否一致
- **分镜流畅度**:输入是分镜列表,检查镜头切换是否符合视觉节奏
- **人物-道具解析**:输入是分镜 + 道具卡,检查道具在人物手里的连续性

每个都是"加个 Prompt + 加个报告组件",半天到一天能加一个。

**5. 认证 / 团队协作(优先级 ★★)**

现在所有人共用默认用户,以后:
- 接飞书扫码登录
- 每个剧本能看到谁上传的
- 团队协作评论

**6. 部署优化(优先级 ★)**

- 备案完切 80/443
- 加自动备份数据库
- 加飞书 webhook 通知(报告出来发消息)

### 迭代节奏建议

**第一周**:先跑 5~10 个真实剧本,收集编辑反馈,调 v2 Prompt

**第二周**:根据反馈优化报告 UI + 加个 Word 导出

**长期**:每次团队有痛点 → 加 Prompt 维度 / 加新分析类型

**别做的事**:
- 别一上来就搞飞书登录,10 人共用没影响
- 别一上来就搞多剧本对比,先把单剧本报告做到 90 分
- 别一上来就备案,内部用够了

---

## 七、日常操作

### 本地开发

```bash
docker compose up -d          # postgres + redis
pnpm dev                       # 3000
pnpm exec tsx workers/analysis-worker.ts   # worker
```

### 改代码后推服务器

```bash
# 本地
git add -A && git commit -m "改了什么" && git push

# 服务器
ssh -i /Users/caojiahao/Projects/Web/daitu.pem ubuntu@43.142.246.168
cd script-review && git pull
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

### 只改 Prompt,不用重启

```bash
# 服务器
docker exec -it sr-app sh  # 或本地 pnpm studio 连生产库
# 直接改数据库 PromptTemplate.content
```

或者本地改 `seed.ts` push → 服务器 pull → `docker exec sr-worker pnpm exec tsx prisma/seed.ts`

### 看日志

```bash
docker logs sr-app -f
docker logs sr-worker -f
```

### 出问题回滚

```bash
git log --oneline
git reset --hard <上一个 commit>
# 服务器 pull + rebuild
```

---

## 八、成本

- 服务器:¥50~120/月(腾讯云 Lighthouse)
- DeepSeek API:¥50~200/月(取决于分析频率)
- 域名(可选):¥10~60/年
- **合计**:¥100~350/月

---

## 九、路线图

- [x] 服务器 + Docker 部署
- [x] 上传 → 解析 → 报告完整链路
- [x] Prompt v1(通用六维度)
- [ ] Prompt v2(基于真实反馈调)
- [ ] Word / Markdown 导出
- [ ] 飞书文档链接直读
- [ ] 飞书扫码登录
- [ ] 分镜人物一致性
- [ ] 分镜流畅度
- [ ] 分镜人物-道具解析
- [ ] 备案 + 上 80/443

---

## 十、有问题找谁

- **架构 / Prompt / 部署** → Claude(我)
- **UI / 页面交互** → Trae
- **剧本内容问题** → 你自己
