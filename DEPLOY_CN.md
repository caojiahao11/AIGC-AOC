# 国内生产部署指南（不依赖 GitHub）

## 架构概览

```
┌─────────────┐     ┌─────────────────────────────────────────────┐
│   用户浏览器  │────▶│  云服务器 (Nginx + Docker Compose)           │
└─────────────┘     │                                             │
                    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
                    │  │  Nginx   │─▶│   App    │  │  Worker  │  │
                    │  │ (443/80) │  │ (8080)   │  │          │  │
                    │  └──────────┘  └────┬─────┘  └────┬─────┘  │
                    │                     │             │         │
                    │              ┌──────┴─────┐  ┌────┴────┐   │
                    │              │  PostgreSQL │  │  Redis  │   │
                    │              │   (5432)   │  │ (6379)  │   │
                    │              └────────────┘  └─────────┘   │
                    └─────────────────────────────────────────────┘
                              ▲
                              │
                    ┌─────────┴──────────┐
                    │   Gitee 仓库        │
                    │  (国内快速访问)      │
                    └────────────────────┘
```

## 推荐方案：Gitee + 服务器本地部署

### 为什么选这个方案？

| 对比项 | GitHub Actions | Gitee + 服务器本地部署 |
|---|---|---|
| 国内访问速度 | 慢 | **快** |
| 网络稳定性 | 常抽风 | **稳定** |
| CI 免费额度 | 2000 分钟/月 | **不限** |
| 部署控制 | 黑盒 | **完全可控** |
| 配置复杂度 | 中 | **简单** |

### 部署流程

```
本地开发测试 → push 到 Gitee main 分支
                              ↓
                    SSH 到服务器执行 ./deploy-cn.sh
                              ↓
                         部署完成
```

可选：配置 Webhook 实现 push 后自动部署（见下方"自动部署"章节）

---

## 第一步：在 Gitee 创建仓库

1. 打开 https://gitee.com 注册/登录
2. 点击右上角 **+** → **新建仓库**
3. 仓库名：`AIGC-AOC`
4. 选择 **开源**（或私有，私有也能部署）
5. 不要勾选 "使用 README 文件初始化仓库"
6. 点击 **创建**

### 添加本地代码到 Gitee

```bash
# 在本地项目目录
cd /Users/caojiahao/Projects/Web/script-review

# 添加 Gitee 远程地址（保留 GitHub 作为 backup）
git remote add gitee https://gitee.com/你的用户名/AIGC-AOC.git

# 推送代码
git push gitee dev
git push gitee main
```

---

## 第二步：准备云服务器

### 服务器要求

- **系统**：Ubuntu 22.04 LTS（推荐）
- **内存**：最低 2GB，推荐 4GB+
- **磁盘**：最低 20GB SSD
- **带宽**：最低 3Mbps，推荐 5Mbps+
- **域名**（可选）：有域名可配 HTTPS，没有直接用 IP

### 推荐云服务商（国内）

| 厂商 | 最低配置价格 | 特点 |
|---|---|---|
| 阿里云 ECS | ~60元/月 | 稳定，文档全 |
| 腾讯云 CVM | ~60元/月 | 和 Coding 集成好 |
| 华为云 ECS | ~60元/月 | 性价比高 |
| UCloud | ~50元/月 | 便宜 |

### 一键安装环境

SSH 登录服务器后执行：

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 安装 Nginx + Certbot
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx git

# 验证安装
docker --version
docker compose version
nginx -v
```

---

## 第三步：首次部署

```bash
# 1. SSH 登录服务器
ssh root@your-server-ip

# 2. 克隆代码（从 Gitee，速度快）
git clone --depth 1 https://gitee.com/你的用户名/AIGC-AOC.git ~/script-review

# 3. 进入项目目录
cd ~/script-review

# 4. 创建生产环境配置
cp .env.example .env.production
vim .env.production
# 填写真实配置：
#   POSTGRES_PASSWORD=强密码
#   NEXTAUTH_SECRET=随机字符串（至少32位）
#   NEXTAUTH_URL=http://你的服务器IP 或 https://你的域名
#   DEEPSEEK_API_KEY=你的API Key

# 5. 执行部署脚本
chmod +x scripts/deploy-cn.sh
./scripts/deploy-cn.sh
```

部署完成后：
- 应用跑在服务器内部 `http://localhost:8080`
- 如需外网访问，继续配置 Nginx（见下方）

---

## 第四步：配置 Nginx + HTTPS

### 有域名的情况（推荐）

```bash
# 1. 复制 Nginx 配置
sudo cp nginx/nginx.conf /etc/nginx/sites-available/script-review

# 2. 修改为你的域名
sudo sed -i 's/your-domain.com/你的真实域名.com/g' /etc/nginx/sites-available/script-review

# 3. 启用配置
sudo ln -s /etc/nginx/sites-available/script-review /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 4. 申请 HTTPS 证书
sudo certbot --nginx -d 你的真实域名.com
```

### 没有域名的情况（直接用 IP）

```bash
# 创建简单配置，直接暴露 80 端口
cat << 'EOF' | sudo tee /etc/nginx/sites-available/script-review
server {
    listen 80;
    server_name _;
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering off;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/script-review /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

现在访问 `http://你的服务器IP` 就能看到应用了。

---

## 第五步：后续更新（日常操作）

### 手动更新（推荐，完全可控）

本地测试通过后：

```bash
# 本地操作
git checkout main
git merge dev
git push gitee main

# 服务器操作
ssh root@your-server-ip
cd ~/script-review
./scripts/deploy-cn.sh
```

### 自动更新（Webhook，push 即部署）

在服务器上启动 webhook 服务：

```bash
cd ~/script-review

# 设置环境变量
export WEBHOOK_SECRET="你的密码"
export WEBHOOK_PORT=9000

# 启动 webhook 服务（前台运行测试）
node scripts/webhook-deploy.js

# 测试通过后，后台运行
nohup node scripts/webhook-deploy.js > webhook.log 2>&1 &
```

然后在 Gitee 仓库页面配置 Webhook：

1. 打开 `https://gitee.com/你的用户名/AIGC-AOC/hooks`
2. 点击 **添加 WebHook**
3. URL：`http://你的服务器IP:9000/webhook`
4. 密码：`你的密码`（和 WEBHOOK_SECRET 一致）
5. 勾选 **Push**
6. 点击 **添加**

配置完成后，每次 push 到 `main` 分支，服务器会自动部署。

**注意**：Webhook 服务跑在 9000 端口，如果服务器有防火墙，需要开放这个端口：

```bash
# 阿里云/腾讯云安全组里开放 9000 端口
# 或者服务器本地防火墙
sudo ufw allow 9000/tcp
```

---

## 常见问题

### Q: Gitee 推送失败？

Gitee 默认需要设置用户名和邮箱：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

如果是私有仓库，需要配置凭据：

```bash
git remote set-url gitee https://用户名:密码@gitee.com/用户名/AIGC-AOC.git
```

### Q: 部署后数据库数据会丢失吗？

不会。PostgreSQL 和 Redis 数据都挂载在 Docker Volume 中，重启容器数据保留。

如需备份：

```bash
docker exec sr-postgres pg_dump -U script_review script_review > backup.sql
```

### Q: 如何查看日志？

```bash
# 应用日志
docker logs -f sr-app

# Worker 日志
docker logs -f sr-worker

# Webhook 日志
tail -f ~/script-review/webhook.log
```

### Q: 如何重启服务？

```bash
cd ~/script-review
docker compose -f docker-compose.prod.yml restart
```

### Q: 完全重置（清数据库）？

```bash
cd ~/script-review
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

**警告**：这会删除所有数据！

---

## 方案对比总结

| 场景 | 推荐方案 |
|---|---|
| 追求简单、不想折腾 | 手动 SSH + `./deploy-cn.sh` |
| 团队协作、频繁更新 | Gitee Webhook 自动部署 |
| 有腾讯云服务器 | 可以用 Coding 替代 Gitee |
| 预算有限 | UCloud 服务器 + Gitee |
