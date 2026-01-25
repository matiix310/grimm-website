# Use Bun's official image
FROM oven/bun:1.3-alpine AS base

WORKDIR /app

# Install dependencies with bun
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --no-save --no-cache --frozen-lockfile

FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development \
    PORT=8000 \
    HOSTNAME="0.0.0.0"

# Disable telemetry during dev
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["bun", "run", "dev"]

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build --experimental-build-mode compile

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Disable telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED=1

ENV NODE_ENV=production \
    PORT=8000 \
    HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

CMD ["bun", "./server.js"]