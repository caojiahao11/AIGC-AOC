#!/usr/bin/env bash
# 推本地已 build 好的三个镜像到腾讯云 TCR。
# 前置条件:必须先手动 docker login ccr.ccs.tencentyun.com
# 用法:bash scripts/push-to-tcr.sh
set -euo pipefail

REGISTRY="ccr.ccs.tencentyun.com"
NAMESPACE="script-review"

# 检查是否登录
if ! grep -q "$REGISTRY" ~/.docker/config.json 2>/dev/null; then
  echo "[!] 未登录 $REGISTRY,请先运行:"
  echo "    docker login $REGISTRY"
  exit 1
fi

for name in app worker migrator; do
  local_image="script-review-${name}:latest"
  remote_image="${REGISTRY}/${NAMESPACE}/${name}:latest"

  if ! docker image inspect "$local_image" >/dev/null 2>&1; then
    echo "[!] 本地找不到 $local_image,跳过"
    continue
  fi

  echo "===> tag $local_image -> $remote_image"
  docker tag "$local_image" "$remote_image"

  echo "===> push $remote_image"
  docker push "$remote_image"
done

echo "[✓] 全部完成"
