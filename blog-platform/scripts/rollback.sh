#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# scripts/rollback.sh
# Rolls back to the previous Git commit and restarts containers.
# Use when a deployment breaks the application.
#
# Usage: ./scripts/rollback.sh [number-of-commits-to-rollback]
#        Default: 1 commit back
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/blog-platform}"
STEPS_BACK="${1:-1}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[ROLLBACK] ✓ $1${NC}"; }
warn()  { echo -e "${YELLOW}[ROLLBACK] ⚠ $1${NC}"; }
error() { echo -e "${RED}[ROLLBACK] ✗ $1${NC}"; }

echo ""
warn "═══════════════════════════════════════════"
warn "  INITIATING ROLLBACK — $STEPS_BACK commit(s) back"
warn "═══════════════════════════════════════════"
echo ""

cd "$APP_DIR"

CURRENT_COMMIT=$(git log --oneline -1)
TARGET_COMMIT=$(git log --oneline -$((STEPS_BACK + 1)) | tail -1)

warn "Current: $CURRENT_COMMIT"
warn "Target:  $TARGET_COMMIT"
echo ""
read -p "Confirm rollback? [y/N] " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Rollback cancelled."
    exit 0
fi

# Checkout previous commit
git checkout "HEAD~${STEPS_BACK}"
info "Checked out $TARGET_COMMIT"

# Rebuild and restart containers
docker compose down --remove-orphans --timeout 30
docker compose build --no-cache
docker compose up -d

# Health check
sleep 15
if curl -sf --max-time 10 http://localhost/health >/dev/null 2>&1; then
    info "✅ Rollback successful. App is healthy."
    info "Rolled back to: $(git log --oneline -1)"
else
    error "Health check failed after rollback. Manual intervention required."
    docker compose logs --tail=50 backend
    exit 1
fi
