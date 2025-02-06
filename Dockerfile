FROM node:20-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build stage
RUN pnpm compile

FROM node:20-slim AS runtime

WORKDIR /app

# Copy from builder
COPY --from=builder /app ./
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=builder /usr/local/bin/pnpm /usr/local/bin/pnpm

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8545 || exit 1

# Create non-root user
USER node

# Default command
CMD ["pnpm", "node"]
