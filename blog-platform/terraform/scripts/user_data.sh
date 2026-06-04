#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# user_data.sh
# Bootstraps a fresh Ubuntu 22.04 EC2 instance.
# Runs once as root on first boot via cloud-init.
#
# Installs:
#   - Docker Engine + Docker Compose plugin
#   - Git
#   - Java 17 (required by Jenkins)
#   - Jenkins LTS
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

echo "========== Starting ${project_name} server bootstrap =========="
echo "Time: $(date)"

# ── System update ──────────────────────────────────────────────────────────
apt-get update -y
apt-get upgrade -y
apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  git \
  wget \
  unzip \
  apt-transport-https

# ── Docker Engine ──────────────────────────────────────────────────────────
echo "--- Installing Docker ---"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Add ubuntu user to docker group (allows running docker without sudo)
usermod -aG docker ubuntu

echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"

# ── Java 17 (Jenkins dependency) ───────────────────────────────────────────
echo "--- Installing Java 17 ---"
apt-get install -y openjdk-17-jdk
java -version

# ── Jenkins LTS ────────────────────────────────────────────────────────────
echo "--- Installing Jenkins ---"
wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | \
  tee /etc/apt/sources.list.d/jenkins.list > /dev/null

apt-get update -y
apt-get install -y jenkins

# Start and enable Jenkins
systemctl enable jenkins
systemctl start jenkins

# Add jenkins user to docker group (so Jenkins pipelines can run docker commands)
usermod -aG docker jenkins

# ── Application directory ──────────────────────────────────────────────────
echo "--- Setting up application directory ---"
mkdir -p /opt/blog-platform
chown ubuntu:ubuntu /opt/blog-platform

# ── Create .env file template ──────────────────────────────────────────────
cat > /opt/blog-platform/.env.template << 'EOF'
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://admin:CHANGE_ME@mongodb:27017/blogplatform?authSource=admin
JWT_SECRET=CHANGE_ME_USE_OPENSSL_RAND_BASE64_64
JWT_EXPIRE=7d
CLIENT_URL=http://YOUR_EC2_IP
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=CHANGE_ME
EOF

echo "========== Bootstrap complete =========="
echo "Jenkins initial password:"
cat /var/lib/jenkins/secrets/initialAdminPassword || echo "(not ready yet, wait ~60s)"
echo ""
echo "Visit http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080 to configure Jenkins"
