# syntax=docker/dockerfile:1.7

# ─────────────────────────────────────────────────────────────
# IminPlay web — production Docker image
# ─────────────────────────────────────────────────────────────
# Multi-stage build targeting Next.js 16 standalone output.
# The standalone tracer emits a minimal Node server + just the
# production deps it touches, so the final image is ~180MB.
#
# Build-time (NEXT_PUBLIC_*) vars MUST be passed as --build-arg:
# Next embeds them into the client bundle at `next build` time,
# they can't be read from the container's runtime env.
# ─────────────────────────────────────────────────────────────

ARG NODE_VERSION=20-alpine

# ── Stage 1: deps — install all deps with a cached layer ──────
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: builder — compile Next.js ────────────────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# Public env vars baked into the client bundle
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── Stage 3: runner — minimal runtime ─────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Non-root user (best practice; Fargate respects this)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone server + required static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# ALB health check probes /api/health on port 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
