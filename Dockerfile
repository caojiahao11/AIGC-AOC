FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# 国内加速：使用阿里云 debian 镜像源
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources || true
RUN sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources || true
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates wget && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

FROM base AS deps
# 国内 npm 镜像
ENV PNPM_REGISTRY=https://mirrors.tencent.com/npm/
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --registry=$PNPM_REGISTRY

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# ============ app: Next.js standalone server ============
FROM base AS app
ENV NODE_ENV=production
ENV SCRIPTS_STORAGE_DIR=/data/scripts
RUN mkdir -p /data/scripts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1
CMD ["node", "server.js"]

# ============ worker: BullMQ consumer ============
FROM base AS worker
ENV NODE_ENV=production
ENV SCRIPTS_STORAGE_DIR=/data/scripts
RUN mkdir -p /data/scripts
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
CMD ["pnpm", "exec", "tsx", "workers/analysis-worker.ts"]

# ============ migrator: 一次性 prisma migrate + seed ============
FROM base AS migrator
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
CMD sh -c "pnpm prisma migrate deploy && pnpm exec tsx prisma/seed.ts"
