#!/bin/bash
set -e

# ============================================
# 本地构建并推送到腾讯云 TCR（手动备用方案）
# 用法: ./scripts/push-local-to-tcr.sh
# ============================================

TCR_REGISTRY="ccr.ccs.tencentyun.com"
NAMESPACE="script-review"
TCR_USERNAME="${TCR_USERNAME:-100007917040}"

echo "=== 本地构建并推送到 TCR ==="
echo ""

# 1. 登录 TCR
echo "[1/3] 登录腾讯云 TCR..."
docker login "$TCR_REGISTRY" --username="$TCR_USERNAME"

# 2. 构建镜像
echo "[2/3] 构建镜像..."
docker build --target app -t "$TCR_REGISTRY/$NAMESPACE/app:latest" .
docker build --target worker -t "$TCR_REGISTRY/$NAMESPACE/worker:latest" .
docker build --target migrator -t "$TCR_REGISTRY/$NAMESPACE/migrator:latest" .

# 3. 推送
echo "[3/3] 推送到 TCR..."
docker push "$TCR_REGISTRY/$NAMESPACE/app:latest"
docker push "$TCR_REGISTRY/$NAMESPACE/worker:latest"
docker push "$TCR_REGISTRY/$NAMESPACE/migrator:latest"

echo ""
echo "=== 推送完成 ==="
echo "服务器上运行: ./scripts/deploy-tcr.sh"
