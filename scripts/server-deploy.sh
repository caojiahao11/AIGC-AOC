#!/bin/bash
set -e

# ============================================
# 一键部署到云服务器
# 用法: 填好 SERVER_USER 和 SSH 密码/密钥，然后运行 ./scripts/server-deploy.sh
# ============================================

# ===== 必填：服务器连接信息 =====
SERVER_IP="43.142.246.168"      # 服务器 IP
SERVER_USER="ubuntu"
# 以下二选一：
SSH_PASSWORD=""                  # SSH 密码（如果用密码登录）
SSH_KEY_PATH="/Users/caojiahao/Projects/Web/daitu.pem"

# ===== 必填：仓库信息 =====
REPO_URL="https://github.com/caojiahao11/AIGC-AOC.git"
BRANCH="main"

# ===== 可选：部署目录 =====
REMOTE_DIR="/opt/script-review"

# ============================================
# 以下一般不用改
# ============================================

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"

# 检查必填项
if [ -z "$SERVER_IP" ] || [ -z "$SERVER_USER" ]; then
  echo "[ERROR] 请填写 SERVER_IP 和 SERVER_USER"
  exit 1
fi

if [ -z "$SSH_PASSWORD" ] && [ -z "$SSH_KEY_PATH" ]; then
  echo "[ERROR] 请填写 SSH_PASSWORD 或 SSH_KEY_PATH 之一"
  exit 1
fi

# 从本地 .env 读取密钥
if [ ! -f "$ENV_FILE" ]; then
  echo "[ERROR] 本地 .env 文件不存在: $ENV_FILE"
  exit 1
fi

DEEPSEEK_API_KEY=$(grep '^DEEPSEEK_API_KEY=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' || true)
if [ -z "$DEEPSEEK_API_KEY" ]; then
  echo "[ERROR] 本地 .env 中未找到 DEEPSEEK_API_KEY"
  exit 1
fi

echo "=== 开始部署到 ${SERVER_USER}@${SERVER_IP} ==="
echo ""

# 生成随机数据库密码和 NextAuth Secret
DB_PASSWORD=$(openssl rand -base64 24 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 48)

# 1. 生成 .env.production
echo "[1/6] 生成生产环境配置..."
cat > /tmp/.env.production << EOF
# 数据库
POSTGRES_USER=script_review
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=script_review

# NextAuth
NEXTAUTH_URL=http://${SERVER_IP}:8080
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# DeepSeek
DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# 上传限制
MAX_UPLOAD_SIZE_MB=50
EOF

# 构建 SSH/SCP 命令
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
if [ -n "$SSH_KEY_PATH" ]; then
  SSH_OPTS="$SSH_OPTS -i $SSH_KEY_PATH"
fi

# 用 sshpass 支持密码登录
if [ -n "$SSH_PASSWORD" ]; then
  if ! command -v sshpass &> /dev/null; then
    echo "[INFO] 安装 sshpass..."
    if command -v brew &> /dev/null; then
      brew install sshpass
    elif command -v apt-get &> /dev/null; then
      sudo apt-get install -y sshpass
    else
      echo "[ERROR] 请手动安装 sshpass，或用 SSH 密钥登录"
      exit 1
    fi
  fi
  SSH_PREFIX="sshpass -p '$SSH_PASSWORD'"
else
  SSH_PREFIX=""
fi

SSH_CMD="${SSH_PREFIX} ssh $SSH_OPTS ${SERVER_USER}@${SERVER_IP}"
SCP_CMD="${SSH_PREFIX} scp $SSH_OPTS"

echo "[2/6] 确保服务器上目录存在..."
$SSH_CMD "mkdir -p ${REMOTE_DIR}"

echo "[3/6] 上传生产环境配置..."
$SCP_CMD /tmp/.env.production ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/.env.production

echo "[4/6] 服务器上拉取代码并部署..."
$SSH_CMD "
set -e
cd ${REMOTE_DIR}

# 安装 Docker（如果没有）
if ! command -v docker &> /dev/null; then
  echo '安装 Docker...'
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# 安装 Docker Compose（如果没有）
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo '安装 Docker Compose...'
  curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" \
    -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi

# 克隆或更新代码
if [ ! -d '.git' ]; then
  echo '首次克隆代码...'
  git clone --depth 1 -b ${BRANCH} ${REPO_URL} .
else
  echo '更新代码...'
  git fetch origin ${BRANCH}
  git reset --hard origin/${BRANCH}
fi

# 确保 .env.production 存在
if [ ! -f '.env.production' ]; then
  echo '[ERROR] .env.production 缺失'
  exit 1
fi

# 构建并启动
echo '构建 Docker 镜像...'
docker build --target app -t script-review-app:latest .
docker build --target worker -t script-review-worker:latest .
docker build --target migrator -t script-review-migrator:latest .

echo '启动服务...'
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo '清理旧镜像...'
docker image prune -f

echo '等待服务启动...'
sleep 10

# 健康检查
APP_HEALTH=\$(docker inspect --format='{{.State.Health.Status}}' sr-app 2>/dev/null || echo 'unknown')
if [ \"\$APP_HEALTH\" = 'healthy' ]; then
  echo '服务健康检查通过'
else
  echo \"服务状态: \$APP_HEALTH，查看日志: docker logs sr-app\"
fi
"

echo ""
echo "=== 部署完成 ==="
echo "应用地址: http://${SERVER_IP}:8080"
echo ""
# 保存配置供下次使用
cat > /tmp/.env.production.saved << EOF
# 数据库密码（请保存好）
POSTGRES_PASSWORD=${DB_PASSWORD}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
EOF
echo "数据库密码和 NEXTAUTH_SECRET 已保存到 /tmp/.env.production.saved，请妥善保管"
