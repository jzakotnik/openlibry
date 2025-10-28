# ---- Base image versions ----
# Use Node 20 (LTS) on Alpine; includes OpenSSL 3 required by modern Prisma engines.
FROM node:20-alpine AS base

# Common packages once per stage
RUN apk add --no-cache libc6-compat openssl

# ---- Dependencies (cacheable) ----
FROM base AS deps
WORKDIR /app

# Install prod+dev deps using lockfile for reproducible builds
# If you use package-lock.json, this will pick it up; same for npm-shrinkwrap.
COPY package*.json ./
RUN npm ci

# ---- Builder ----
FROM base AS builder
WORKDIR /app

# Copy installed node_modules from deps layer
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source (including Prisma)
COPY . .

# Generate Prisma Client at build time (uses dev deps present in builder)
RUN npx prisma generate

# Optional: disable Next telemetry in CI/builds
ENV NEXT_TELEMETRY_DISABLED=1

# Build the app (recommend enabling `output: 'standalone'` in next.config.js)
RUN npm run build

# ---- Runner (slim, non-root) ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Ensure Next uses the same port as exposed below
ENV PORT=3000

# Copy only what's needed to run
# If you use `output: 'standalone'`, this is optimal:
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# If you don't use standalone output, uncomment the following and remove the two COPY lines above for standalone:
# COPY --from=deps /app/node_modules ./node_modules
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY package*.json ./
# RUN npm prune --omit=dev

# Run as the `node` user provided by the base image
USER node

EXPOSE 3000

# If using standalone output, Next produces server.js at project root in the standalone bundle
CMD ["node", "server.js"]
# If NOT using standalone, use:
# CMD ["npm", "run", "start"]
