#!/bin/bash
set -e

# ============================================
# 腾讯云 TCR 一键部署脚本
# 在服务器上运行，从 TCR 拉取最新镜像并启动
# ============================================

PROJECT_DIR="/opt/script-review"
TCR_REGISTRY="ccr.ccs.tencentyun.com"
NAMESPACE="script-review"
TCR_USERNAME="${TCR_USERNAME:-100007917040}"

echo "=== 剧本诊断工具 - TCR 快速部署 ==="
echo "仓库: $TCR_REGISTRY/$NAMESPACE"
echo ""

cd "$PROJECT_DIR"

# 1. 检查 .env.production
if [ ! -f ".env.production" ]; then
  echo "[ERROR] 缺少 .env.production，请先创建"
  exit 1
fi

# 2. 登录 TCR（只需要第一次，token 会缓存）
echo "[1/4] 登录腾讯云 TCR..."
if ! sudo docker info 2>/dev/null | grep -q "Username.*$TCR_USERNAME"; then
  echo "请输入 TCR 访问密码:"
  sudo docker login "$TCR_REGISTRY" --username="$TCR_USERNAME"
else
  echo "已登录"
fi

# 3. 拉取最新镜像
echo "[2/4] 拉取最新镜像..."
sudo docker pull "$TCR_REGISTRY/$NAMESPACE/app:latest"
sudo docker pull "$TCR_REGISTRY/$NAMESPACE/worker:latest"
sudo docker pull "$TCR_REGISTRY/$NAMESPACE/migrator:latest"

# 4. 启动服务
echo "[3/4] 启动服务..."
sudo docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 5. 清理旧镜像
echo "[4/4] 清理旧镜像..."
sudo docker image prune -f

# 6. 健康检查
echo ""
echo "等待服务启动..."
sleep 10

APP_HEALTH=$(sudo docker inspect --format='{{.State.Health.Status}}' sr-app 2>/dev/null || echo "unknown")
if [ "$APP_HEALTH" = "healthy" ]; then
  echo "✅ 服务健康检查通过"
else
  echo "⚠️ 服务状态: $APP_HEALTH，查看日志: sudo docker logs sr-app"
fi

echo ""
echo "=== 部署完成 ==="
echo "访问地址: http://$(curl -s http://metadata.tencentyun.com/latest/meta-data/public-ipv4 2>/dev/null || echo '你的服务器IP'):8080"
