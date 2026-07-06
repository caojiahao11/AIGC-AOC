# 生产部署指南

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
```

## 部署方式（二选一）

### 方式 A：GitHub Actions 自动部署（推荐）

**适用场景**：GitHub 访问流畅，希望 push 即部署

1. 在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：
   - `SERVER_HOST`：你的云服务器 IP
   - `SERVER_USER`：SSH 用户名
   - `SERVER_SSH_KEY`：SSH 私钥内容

2. push 到 `main` 分支，自动触发部署

3. 也可在 Actions 页面手动点击 "Run workflow"

### 方式 B：云服务器本地部署（更稳定）

**适用场景**：GitHub 访问慢，或希望完全掌控部署过程

```bash
# 1. SSH 登录服务器
ssh root@your-server-ip

# 2. 首次部署（克隆 + 启动）
git clone --depth 1 https://github.com/caojiahao11/AIGC-AOC.git ~/script-review
cd ~/script-review
cp .env.example .env.production
# 编辑 .env.production 填入真实配置
vim .env.production

chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 3. 后续更新（本地测完后）
# 本地执行：
git checkout main
git merge dev
git push origin main

# 服务器执行：
cd ~/script-review
./scripts/deploy.sh
```

## 服务器环境要求

- **系统**：Ubuntu 22.04 LTS（推荐）或 CentOS 8+
- **内存**：最低 2GB，推荐 4GB+
- **磁盘**：最低 20GB SSD
- **Docker**：已安装 Docker + Docker Compose
- **域名**（可选）：有域名可配 HTTPS，没有直接用 IP

## 一键安装依赖（新服务器）

```bash
# 安装 Docker
 curl -fsSL https://get.docker.com | sh
 sudo usermod -aG docker $USER
 newgrp docker

# 安装 Nginx + Certbot
 sudo apt update
 sudo apt install -y nginx certbot python3-certbot-nginx

# 配置 Nginx
 sudo cp nginx/nginx.conf /etc/nginx/sites-available/script-review
 sudo sed -i 's/your-domain.com/your-real-domain.com/g' /etc/nginx/sites-available/script-review
 sudo ln -s /etc/nginx/sites-available/script-review /etc/nginx/sites-enabled/
 sudo nginx -t
 sudo systemctl restart nginx

# 申请 HTTPS 证书
 sudo certbot --nginx -d your-real-domain.com
```

## 常见问题

### Q: GitHub 拉取速度慢？

**方案 1**：服务器配置 GitHub 镜像加速
```bash
git config --global url."https://ghproxy.com/https://github.com/".insteadOf "https://github.com/"
```

**方案 2**：使用 Gitee 中转
```bash
# 在 Gitee 导入 GitHub 仓库，设置自动同步
# 然后服务器从 Gitee 拉取
git clone --depth 1 https://gitee.com/your-name/AIGC-AOC.git
```

**方案 3**：直接放弃 GitHub Actions，全部用方式 B（服务器本地 deploy.sh）

### Q: 如何更新 Prompt 模板？

Prompt 模板存在数据库里，部署后访问：
```
https://your-domain.com/prompts
```

### Q: 数据库数据会丢失吗？

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

# 数据库日志
docker logs -f sr-postgres
```
