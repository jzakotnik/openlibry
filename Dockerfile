# ---- Base image versions ----
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ---- Dependencies (cacheable, prod only) ----
FROM base AS deps
COPY package*.json ./
# Avoid dev deps here so Cypress doesn't run in this layer
RUN npm ci --omit=dev

# ---- Builder (needs dev deps, but skip Cypress binary) ----
FROM base AS builder

ENV CYPRESS_INSTALL_BINARY=0
COPY package*.json ./
RUN npm ci
COPY . .
# Generate Prisma Client at build time
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Runner (slim) ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Your DB is bind-mounted here from the host
ENV DATABASE_URL="file:/app/database/dev.db"

# Copy runtime artifacts (Next.js standalone output recommended)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Ensure DB directory exists and fix perms
RUN mkdir -p /app/database && chown -R node:node /app

# Add entrypoint that runs Prisma schema sync on first run / on pending migrations
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Make Prisma CLI available at runtime via node_modules from builder (lightweight)
# We copy only what's needed for npx to find prisma: package.json, lockfile and node_modules/prisma*
# If your devDeps are heavy, you can replace this with: RUN npm i -g prisma@6.13.0
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

USER node
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]