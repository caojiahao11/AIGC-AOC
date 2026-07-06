#!/usr/bin/env node
/**
 * Gitee Webhook → 服务器自动构建镜像推送到 TCR 并重启
 *
 * 完整流程:
 *   1. 收到 Gitee push webhook
 *   2. 服务器 git pull 拉取最新代码
 *   3. docker build 构建 3 个镜像（app / worker / migrator）
 *   4. docker push 推送到腾讯云 TCR
 *   5. docker compose up 用新镜像重启服务
 *
 * 用法:
 *   WEBHOOK_SECRET=xxx TCR_PASSWORD=xxx node scripts/webhook-deploy-tcr.js
 *   后台运行:
 *   nohup WEBHOOK_SECRET=xxx TCR_PASSWORD=xxx node scripts/webhook-deploy-tcr.js > /var/log/webhook-deploy.log 2>&1 &
 */

const http = require("http");
const { exec } = require("child_process");

// ============ 配置 ============
const PORT = parseInt(process.env.WEBHOOK_PORT) || 9000;
const SECRET = process.env.WEBHOOK_SECRET || "change-me-to-random-string";
const PROJECT_DIR = process.env.PROJECT_DIR || "/opt/script-review";
const BRANCH = process.env.WEBHOOK_BRANCH || "main";
const COMPOSE_FILE = "docker-compose.prod.yml";

// TCR 配置
const TCR_REGISTRY = process.env.TCR_REGISTRY || "ccr.ccs.tencentyun.com";
const TCR_NAMESPACE = process.env.TCR_NAMESPACE || "script-review";
const TCR_USERNAME = process.env.TCR_USERNAME || "100007917040";
const TCR_PASSWORD = process.env.TCR_PASSWORD || "";

// 防止重复触发
let deploying = false;

const server = http.createServer((req, res) => {
  // 健康检查
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "running", deploying, project: "script-review" }));
    return;
  }

  if (req.url !== "/webhook" || req.method !== "POST") {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => {
    let payload;
    try { payload = JSON.parse(body); } catch { payload = {}; }

    // Gitee 用 password 字段验证
    if (payload.password && payload.password !== SECRET) {
      console.log(`[${now()}] 验证失败: 密码不匹配`);
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const branch = payload.ref?.replace("refs/heads/", "") || "unknown";
    console.log(`[${now()}] 收到 push 事件，分支: ${branch}`);

    if (branch !== BRANCH) {
      console.log(`[${now()}] 忽略: 不是 ${BRANCH} 分支`);
      res.writeHead(200);
      res.end(`Ignored: expected ${BRANCH}, got ${branch}`);
      return;
    }

    // 防止重复触发
    if (deploying) {
      console.log(`[${now()}] 忽略: 正在部署中，跳过`);
      res.writeHead(200);
      res.end("Already deploying");
      return;
    }

    deploying = true;
    res.writeHead(200);
    res.end("Deploy triggered");

    runDeploy();
  });
});

function runDeploy() {
  const IMAGE_PREFIX = `${TCR_REGISTRY}/${TCR_NAMESPACE}`;
  const TAG = `${Date.now()}`; // 用时间戳作为版本标签

  const steps = [
    {
      name: "拉取最新代码",
      cmd: `cd ${PROJECT_DIR} && git checkout ${BRANCH} && git pull origin ${BRANCH} 2>&1`,
    },
    {
      name: "登录 TCR",
      cmd: `echo "${TCR_PASSWORD}" | docker login ${TCR_REGISTRY} --username "${TCR_USERNAME}" --password-stdin 2>&1`,
    },
    {
      name: "构建 app 镜像",
      cmd: `cd ${PROJECT_DIR} && docker build --target app -t ${IMAGE_PREFIX}/app:${TAG} -t ${IMAGE_PREFIX}/app:latest . 2>&1`,
    },
    {
      name: "构建 worker 镜像",
      cmd: `cd ${PROJECT_DIR} && docker build --target worker -t ${IMAGE_PREFIX}/worker:${TAG} -t ${IMAGE_PREFIX}/worker:latest . 2>&1`,
    },
    {
      name: "构建 migrator 镜像",
      cmd: `cd ${PROJECT_DIR} && docker build --target migrator -t ${IMAGE_PREFIX}/migrator:${TAG} -t ${IMAGE_PREFIX}/migrator:latest . 2>&1`,
    },
    {
      name: "推送镜像到 TCR",
      cmd: [
        `docker push ${IMAGE_PREFIX}/app:${TAG}`,
        `docker push ${IMAGE_PREFIX}/app:latest`,
        `docker push ${IMAGE_PREFIX}/worker:${TAG}`,
        `docker push ${IMAGE_PREFIX}/worker:latest`,
        `docker push ${IMAGE_PREFIX}/migrator:${TAG}`,
        `docker push ${IMAGE_PREFIX}/migrator:latest`,
      ].join(" && ") + " 2>&1",
    },
    {
      name: "重启服务",
      cmd: `cd ${PROJECT_DIR} && docker compose -f ${COMPOSE_FILE} up -d --remove-orphans 2>&1`,
    },
    {
      name: "清理旧镜像",
      cmd: `docker image prune -f 2>&1`,
    },
  ];

  console.log(`[${now()}] ========== 开始部署 ==========`);

  function runStep(index) {
    if (index >= steps.length) {
      console.log(`[${now()}] ========== 部署完成 ==========`);
      deploying = false;
      return;
    }

    const step = steps[index];
    console.log(`[${now()}] [${index + 1}/${steps.length}] ${step.name}...`);

    exec(step.cmd, { maxBuffer: 10 * 1024 * 1024, timeout: 600 * 1000 }, (error, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);

      if (error) {
        console.error(`[${now()}] ❌ ${step.name}失败:`, error.message);
        deploying = false;
        return;
      }

      console.log(`[${now()}] ✅ ${step.name}完成`);
      runStep(index + 1);
    });
  }

  runStep(0);
}

server.listen(PORT, () => {
  console.log(`=== Webhook 自动构建部署服务已启动 ===`);
  console.log(`监听: http://0.0.0.0:${PORT}/webhook`);
  console.log(`健康检查: http://0.0.0.0:${PORT}/health`);
  console.log(`项目目录: ${PROJECT_DIR}`);
  console.log(`分支: ${BRANCH}`);
  console.log(`TCR: ${TCR_REGISTRY}/${TCR_NAMESPACE}`);
  console.log(`密码: ${SECRET === "change-me-to-random-string" ? "⚠️ 未设置 WEBHOOK_SECRET" : "✅ 已设置"}`);
  console.log(`TCR密码: ${TCR_PASSWORD ? "✅ 已设置" : "⚠️ 未设置 TCR_PASSWORD"}`);
});

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}
