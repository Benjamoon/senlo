# 1. Base image
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 2. Builder stage
FROM base AS builder
WORKDIR /app

# Copy all files first to ensure pnpm workspace works correctly
COPY . .

# Set build-time arguments (needed for Next.js build)
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ALLOW_REGISTRATION
ARG NEXT_PUBLIC_IS_DEMO_MODE
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_ALLOW_REGISTRATION=$NEXT_PUBLIC_ALLOW_REGISTRATION
ENV NEXT_PUBLIC_IS_DEMO_MODE=$NEXT_PUBLIC_IS_DEMO_MODE
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID=$NEXT_PUBLIC_UMAMI_WEBSITE_ID

# Install all dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# 3. Production runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-privileged user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --create-home --home-dir /home/nextjs -g nodejs nextjs

# Copy the entire app from builder
COPY --from=builder --chown=nextjs:nodejs /app /app

# Install only production dependencies to save space
RUN pnpm install --prod --frozen-lockfile

# Final touches
RUN chmod +x /app/deploy/vps/start.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/deploy/vps/start.sh"]
