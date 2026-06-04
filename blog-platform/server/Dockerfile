# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: deps — install only production dependencies
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Set working directory
WORKDIR /app

# Copy only package files first (layer cache: only re-runs npm ci when deps change)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force


# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: final — lean production image
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS final

# Security: update base packages
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create a non-root user for security (principle of least privilege)
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodeuser -u 1001 -G nodejs

# Copy installed node_modules from deps stage (avoids re-running npm ci)
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copy application source code
COPY --chown=nodeuser:nodejs . .

# Create logs directory with correct ownership
RUN mkdir -p logs && chown -R nodeuser:nodejs logs

# Switch to non-root user
USER nodeuser

# Expose application port
EXPOSE 5000

# Health check: polls /health every 30s, fails after 3 retries
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Use dumb-init to properly handle PID 1 signal forwarding
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server.js"]
