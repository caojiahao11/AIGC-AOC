#!/usr/bin/env node
/**
 * 服务器 Webhook 自动部署服务
 * 接收 Gitee/Coding/GitHub 的 push 事件，自动执行 deploy-cn.sh
 *
 * 用法:
 *   node scripts/webhook-deploy.js
 * 或后台运行:
 *   nohup node scripts/webhook-deploy.js > webhook.log 2>&1 &
 *
 * 配置 Gitee Webhook:
 *   URL: http://your-server-ip:9000/webhook
 *   密码: 在 WEBHOOK_SECRET 环境变量中设置
 */

const http = require("http");
const { exec } = require("child_process");
const crypto = require("crypto");

const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || "your-webhook-secret";
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT || "./scripts/deploy-cn.sh";
const PROJECT_DIR = process.env.PROJECT_DIR || process.env.HOME + "/script-review";

function verifySignature(body, signature) {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(body);
  return hmac.digest("hex") === signature;
}

const server = http.createServer((req, res) => {
  if (req.url !== "/webhook" || req.method !== "POST") {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    // Gitee 用 password 字段验证，GitHub 用 X-Hub-Signature-256
    const signature = req.headers["x-hub-signature-256"]?.replace("sha256=", "");
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      payload = {};
    }

    // 支持 Gitee/Coding 的密码验证
    if (payload.password && payload.password !== SECRET) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    // 支持 GitHub 的签名验证
    if (signature && !verifySignature(body, signature)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const branch = payload.ref?.replace("refs/heads/", "") || payload.push_data?.ref?.replace("refs/heads/", "") || "main";

    console.log(`[${new Date().toISOString()}] 收到 push 事件，分支: ${branch}`);

    if (branch !== "main") {
      res.writeHead(200);
      res.end("Ignored: not main branch");
      return;
    }

    res.writeHead(200);
    res.end("Deploy triggered");

    // 异步执行部署脚本
    console.log(`[${new Date().toISOString()}] 开始执行部署...`);
    const deploy = exec(
      `cd ${PROJECT_DIR} && bash ${DEPLOY_SCRIPT}`,
      { maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`[${new Date().toISOString()}] 部署失败:`, error.message);
          return;
        }
        console.log(`[${new Date().toISOString()}] 部署完成`);
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
      }
    );
  });
});

server.listen(PORT, () => {
  console.log(`Webhook 服务已启动: http://0.0.0.0:${PORT}/webhook`);
  console.log(`项目目录: ${PROJECT_DIR}`);
  console.log(`部署脚本: ${DEPLOY_SCRIPT}`);
  console.log(`验证密码: ${SECRET === "your-webhook-secret" ? "未设置（请设置 WEBHOOK_SECRET）" : "已设置"}`);
});
