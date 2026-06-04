#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# jenkins/install-jenkins.sh
# Idempotent Jenkins + Docker setup script for Ubuntu 22.04.
# Run this if Jenkins wasn't installed by the Terraform user_data script,
# or to verify all components are correctly configured.
#
# Usage:
#   chmod +x install-jenkins.sh
#   sudo ./install-jenkins.sh
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }

info "Starting Jenkins installation..."

# ── Prerequisites ──────────────────────────────────────────────────────────
info "Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget gnupg git apt-transport-https ca-certificates lsb-release

# ── Java 17 ────────────────────────────────────────────────────────────────
if java -version 2>/dev/null | grep -q "17"; then
  info "Java 17 already installed, skipping..."
else
  info "Installing Java 17..."
  apt-get install -y openjdk-17-jdk
  info "Java installed: $(java -version 2>&1 | head -1)"
fi

# ── Docker ─────────────────────────────────────────────────────────────────
if command -v docker &>/dev/null; then
  info "Docker already installed: $(docker --version)"
else
  info "Installing Docker..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  info "Docker installed: $(docker --version)"
fi

# ── Jenkins ────────────────────────────────────────────────────────────────
if command -v jenkins &>/dev/null || systemctl is-active --quiet jenkins; then
  info "Jenkins already installed, skipping..."
else
  info "Installing Jenkins LTS..."
  wget -O /usr/share/keyrings/jenkins-keyring.asc \
    https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
  echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
    https://pkg.jenkins.io/debian-stable binary/" | \
    tee /etc/apt/sources.list.d/jenkins.list > /dev/null

  apt-get update -y
  apt-get install -y jenkins
  systemctl enable jenkins
  systemctl start jenkins
  info "Jenkins installed and started."
fi

# ── Group permissions ───────────────────────────────────────────────────────
# Allow jenkins and ubuntu users to run Docker commands without sudo
info "Configuring Docker group permissions..."
usermod -aG docker jenkins 2>/dev/null || true
usermod -aG docker ubuntu  2>/dev/null || true

# Restart Jenkins to pick up new group membership
systemctl restart jenkins

# ── Verify services ────────────────────────────────────────────────────────
info "Verifying services..."
systemctl is-active --quiet jenkins && info "Jenkins: RUNNING" || warning "Jenkins: NOT running"
systemctl is-active --quiet docker  && info "Docker: RUNNING"  || warning "Docker: NOT running"

# ── Print setup info ───────────────────────────────────────────────────────
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "unknown")

echo ""
echo "══════════════════════════════════════════════════════"
echo "  Jenkins Setup Complete"
echo "══════════════════════════════════════════════════════"
echo "  URL:              http://${PUBLIC_IP}:8080"
echo "  Initial password: $(cat /var/lib/jenkins/secrets/initialAdminPassword 2>/dev/null || echo 'file not ready yet')"
echo ""
echo "  Next steps:"
echo "  1. Open Jenkins URL in browser"
echo "  2. Paste the initial password"
echo "  3. Install suggested plugins + these extras:"
echo "     - Pipeline"
echo "     - Git"
echo "     - Docker Pipeline"
echo "     - SSH Agent"
echo "     - Credentials"
echo "     - GitHub Integration"
echo "  4. Create admin user"
echo "  5. Add credentials (see jenkins/credentials-setup.md)"
echo "  6. Create pipeline job pointing to your GitHub repo"
echo "══════════════════════════════════════════════════════"
