FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

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
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
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
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY . .
RUN pnpm prisma generate
CMD ["pnpm", "exec", "tsx", "workers/analysis-worker.ts"]

# ============ migrator: 一次性执行 prisma migrate + seed ============
FROM base AS migrator
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
CMD sh -c "pnpm prisma migrate deploy && pnpm exec tsx prisma/seed.ts"
