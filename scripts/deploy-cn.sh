#!/bin/bash
set -e

# ============================================
# 国内版一键部署脚本（支持 Gitee/Coding/阿里云等国内仓库）
# 用法: ssh 到服务器后执行 ./deploy-cn.sh
# ============================================

PROJECT_DIR="${PROJECT_DIR:-$HOME/script-review}"
# 默认使用 Gitee，可改成 Coding、阿里云等
REPO_URL="${REPO_URL:-https://gitee.com/your-name/AIGC-AOC.git}"
BRANCH="${BRANCH:-main}"

echo "=== 剧本诊断工具 - 国内版生产部署 ==="
echo "项目目录: $PROJECT_DIR"
echo "仓库地址: $REPO_URL"
echo "分支: $BRANCH"
echo ""

# 1. 确保目录存在并拉取最新代码
if [ ! -d "$PROJECT_DIR/.git" ]; then
  echo "[1/6] 首次克隆仓库..."
  git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$PROJECT_DIR"
else
  echo "[1/6] 拉取最新代码..."
  cd "$PROJECT_DIR"
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
fi

cd "$PROJECT_DIR"

# 2. 检查环境变量文件
if [ ! -f ".env.production" ]; then
  echo "[ERROR] 缺少 .env.production 文件，请先创建"
  echo "参考: cp .env.example .env.production 并填写真实配置"
  exit 1
fi

# 3. 构建 Docker 镜像
echo "[2/6] 构建 Docker 镜像..."
docker build --target app -t script-review-app:latest .
docker build --target worker -t script-review-worker:latest .
docker build --target migrator -t script-review-migrator:latest .

# 4. 部署服务
echo "[3/6] 启动服务..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 5. 清理旧镜像
echo "[4/6] 清理旧镜像..."
docker image prune -f

# 6. 健康检查
echo "[5/6] 等待服务就绪..."
sleep 10

APP_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' sr-app 2>/dev/null || echo "unknown")
if [ "$APP_HEALTH" = "healthy" ]; then
  echo "[6/6] 服务健康检查通过"
else
  echo "[WARN] 服务状态: $APP_HEALTH，请检查日志: docker logs sr-app"
fi

echo ""
echo "=== 部署完成 ==="
echo "应用: http://localhost:8080 (服务器内部)"
echo "如需外网访问，请确保 Nginx 已配置并指向 8080 端口"
