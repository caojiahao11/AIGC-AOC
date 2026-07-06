FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PUPPETEER_CACHE_DIR=/pptr-cache
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates wget && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /pptr-cache /pptr-cache
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# ============ app: Next.js standalone server (含 puppeteer chromium) ============
FROM base AS app
ENV NODE_ENV=production
ENV SCRIPTS_STORAGE_DIR=/data/scripts
# puppeteer chromium 运行时依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
      libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
      libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
      libgbm1 libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0 \
      libx11-6 libxcb1 libxext6 libgtk-3-0 fonts-liberation \
      fonts-noto-cjk fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /data/scripts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# puppeteer 需要 chromium 缓存 + node_modules 里的 puppeteer 包
COPY --from=deps /pptr-cache /pptr-cache
COPY --from=deps /app/node_modules/puppeteer ./node_modules/puppeteer
COPY --from=deps /app/node_modules/puppeteer-core ./node_modules/puppeteer-core
COPY --from=deps /app/node_modules/@puppeteer ./node_modules/@puppeteer
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
