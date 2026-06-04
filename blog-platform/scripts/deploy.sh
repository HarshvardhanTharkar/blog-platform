#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# scripts/deploy.sh
# Production deployment script. Runs on the EC2 instance.
# Called by the Jenkinsfile during the Deploy stage, or manually.
#
# Usage:
#   ./scripts/deploy.sh [branch]
#   Default branch: main
#
# What it does:
#   1. Stash local changes and pull latest code
#   2. Build new Docker images
#   3. Stop and replace old containers (zero-downtime swap)
#   4. Run health check
#   5. Prune unused images to save disk space
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Config ─────────────────────────────────────────────────────────────────
APP_DIR="${APP_DIR:-/opt/blog-platform}"
BRANCH="${1:-main}"
COMPOSE_FILE="docker-compose.yml"
HEALTH_URL="http://localhost/health"
MAX_HEALTH_RETRIES=10
HEALTH_RETRY_DELAY=15

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${GREEN}[$(date '+%H:%M:%S')] ✓ $1${NC}"; }
warn()    { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠ $1${NC}"; }
error()   { echo -e "${RED}[$(date '+%H:%M:%S')] ✗ $1${NC}" >&2; }
section() { echo -e "\n${BLUE}══════════════════════ $1 ══════════════════════${NC}"; }

# ── Preflight ──────────────────────────────────────────────────────────────
section "Pre-flight Checks"

if [[ ! -d "$APP_DIR" ]]; then
    error "App directory $APP_DIR does not exist."
    exit 1
fi

if [[ ! -f "$APP_DIR/.env" ]]; then
    error ".env file not found at $APP_DIR/.env"
    error "Copy .env.example to .env and fill in production values."
    exit 1
fi

command -v docker      >/dev/null 2>&1 || { error "Docker not installed"; exit 1; }
command -v git         >/dev/null 2>&1 || { error "Git not installed";    exit 1; }
docker compose version >/dev/null 2>&1 || { error "Docker Compose (v2 plugin) not installed"; exit 1; }

info "All preflight checks passed."

# ── Pull latest code ──────────────────────────────────────────────────────
section "Pulling Code (branch: $BRANCH)"

cd "$APP_DIR"
git fetch origin
git stash 2>/dev/null && warn "Stashed local changes" || true
git checkout "$BRANCH"
git pull origin "$BRANCH"

COMMIT=$(git log --oneline -1)
info "Deployed commit: $COMMIT"

# ── Build images ───────────────────────────────────────────────────────────
section "Building Docker Images"

docker compose -f "$COMPOSE_FILE" build --no-cache --parallel
info "Docker images built successfully."

# ── Zero-downtime swap ─────────────────────────────────────────────────────
section "Swapping Containers"

# Bring down old containers but keep volumes
docker compose -f "$COMPOSE_FILE" down --remove-orphans --timeout 30
info "Old containers stopped."

# Start new containers in detached mode
docker compose -f "$COMPOSE_FILE" up -d
info "New containers started."

# ── Wait for containers to be healthy ──────────────────────────────────────
section "Waiting for Health"

attempt=0
until docker compose -f "$COMPOSE_FILE" ps | grep -q "healthy" || [[ $attempt -ge $MAX_HEALTH_RETRIES ]]; do
    attempt=$((attempt + 1))
    warn "Waiting for containers to become healthy... ($attempt/$MAX_HEALTH_RETRIES)"
    sleep "$HEALTH_RETRY_DELAY"
done

# ── HTTP health check ──────────────────────────────────────────────────────
section "HTTP Health Check"

attempt=0
until curl -sf --max-time 10 "$HEALTH_URL" >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [[ $attempt -ge $MAX_HEALTH_RETRIES ]]; then
        error "Health check failed after $MAX_HEALTH_RETRIES attempts."
        error "Check logs: docker compose logs backend"
        exit 1
    fi
    warn "Health check attempt $attempt/$MAX_HEALTH_RETRIES failed, retrying in ${HEALTH_RETRY_DELAY}s..."
    sleep "$HEALTH_RETRY_DELAY"
done

info "Application is healthy at $HEALTH_URL"

# ── Cleanup old images ─────────────────────────────────────────────────────
section "Cleanup"

docker image prune -f
info "Unused images pruned."

# ── Final status ───────────────────────────────────────────────────────────
section "Deployment Complete"

docker compose -f "$COMPOSE_FILE" ps
echo ""
info "🚀 Blog Platform deployed successfully!"
info "Commit: $COMMIT"
info "App URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR_EC2_IP')"
