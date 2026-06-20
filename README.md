# Inkwell — Blog Platform

> A production-ready, full-stack blogging platform built with the MERN stack, containerized with Docker, provisioned on AWS with Terraform, and deployed via a Jenkins CI/CD pipeline — **live and fully automated end to end.**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?logo=mongodb)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-24.x-blue?logo=docker)](https://docker.com)
[![Terraform](https://img.shields.io/badge/Terraform-1.6+-purple?logo=terraform)](https://terraform.io)
[![Jenkins](https://img.shields.io/badge/Jenkins-LTS-red?logo=jenkins)](https://jenkins.io)
[![Status](https://img.shields.io/badge/Status-Live-success)]()

**🔗 Live App:** [http://13.50.160.247](http://13.50.160.247)
**🔧 Jenkins Pipeline:** [http://13.50.160.247:8080/job/inkwell-pipeline/](http://13.50.160.247:8080/job/inkwell-pipeline/)

---

## Table of Contents

1. [Overview](#overview)
2. [Screenshots](#screenshots)
3. [Features](#features)
4. [Architecture](#architecture)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Local Development](#local-development)
8. [Docker Setup](#docker-setup)
9. [AWS Infrastructure (Terraform)](#aws-infrastructure-terraform)
10. [Jenkins Setup](#jenkins-setup)
11. [CI/CD Workflow](#cicd-workflow)
12. [Security](#security)
13. [Testing](#testing)
14. [Deployment Notes & Lessons Learned](#deployment-notes--lessons-learned)
15. [Troubleshooting](#troubleshooting)
16. [Future Improvements](#future-improvements)
17. [Resume Description](#resume-description)

---

## Overview

Inkwell is a full-featured blogging platform designed as a portfolio-grade project demonstrating production engineering practices across the full stack — and it is **actually deployed and running**, not just documented.

- **Frontend** — React 18 SPA with Context API state management, protected routes, and a polished editorial design
- **Backend** — Node.js + Express REST API with JWT authentication, role-based access, full-text search, and rate limiting
- **Database** — MongoDB with Mongoose ODM, text indexes for search, and proper relationship modeling
- **DevOps** — Fully containerized with Docker, infrastructure-as-code with Terraform, automated deployment via a self-hosted Jenkins pipeline triggered by GitHub webhooks

---

## Screenshots

> Screenshots are stored in `docs/screenshots/`. Add your captured images there with the filenames below — GitHub will render them automatically once committed.

![Inkwell home page](docs/screenshots/homepage.png)

![Jenkins build history](docs/screenshots/jenkins-builds.png)

![Jenkins pipeline stages](docs/screenshots/jenkins-stages.png)

![EC2 instance running](docs/screenshots/ec2-instance.png)

### Docker Containers — Healthy
```
NAME            IMAGE                    STATUS                   PORTS
blog_backend    blog-platform-backend    Up (healthy)             5000/tcp
blog_frontend   blog-platform-frontend   Up                       0.0.0.0:80->80/tcp
blog_mongodb    mongo:7.0                Up (healthy)             27017/tcp
```

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 Authentication | Register, login, logout with JWT |
| ✍️ Blog CRUD | Create, read, update, delete articles |
| 🔍 Search | Full-text search across title, content, tags |
| 👤 Profiles | Author profiles with bio and post history |
| 📊 Dashboard | Personal stats (posts, views, drafts) |
| 🏷️ Tags | Tag-based filtering |
| 📱 Responsive | Mobile-first responsive layout |
| 🛡️ Security | Helmet, CORS, rate limiting, input validation |
| 🐳 Dockerized | Multi-stage builds, health checks |
| ☁️ AWS | VPC, EC2, Elastic IP, Security Groups |
| 🔄 CI/CD | Automated test → build → deploy pipeline, triggered by `git push` |

---

## Architecture

### System Architecture (as deployed)

```
┌──────────────────────────────────────────────────────────────────┐
│                    AWS eu-north-1 (Stockholm)                    │
│                                                                    │
│   ┌────────────────────────────────────────────────────────┐     │
│   │              VPC 10.0.0.0/16                            │     │
│   │                                                          │     │
│   │   ┌──────────────────────────────────────────────┐     │     │
│   │   │      Public Subnet 10.0.1.0/24 (eu-north-1a)  │     │     │
│   │   │                                                │     │     │
│   │   │   ┌──────────────────────────────────────┐     │     │     │
│   │   │   │     EC2 t3.small — Ubuntu 24.04       │     │     │     │
│   │   │   │     (2 vCPU, 2GB RAM + 2GB swap)      │     │     │     │
│   │   │   │                                       │     │     │     │
│   │   │   │  ┌──────────┐   ┌─────────────────┐   │     │     │     │
│   │   │   │  │  Nginx   │   │ Jenkins :8080   │   │     │     │     │
│   │   │   │  │  :80     │   │ (Java 21)       │   │     │     │     │
│   │   │   │  └────┬─────┘   └─────────────────┘   │     │     │     │
│   │   │   │       │ Docker Network (blog_network) │     │     │     │
│   │   │   │  ┌────▼─────┐   ┌────────────────┐    │     │     │     │
│   │   │   │  │ Frontend │   │    Backend     │    │     │     │     │
│   │   │   │  │ (React)  │   │ (Express:5000) │    │     │     │     │
│   │   │   │  └──────────┘   └───────┬────────┘    │     │     │     │
│   │   │   │                         │             │     │     │     │
│   │   │   │               ┌─────────▼────────┐    │     │     │     │
│   │   │   │               │   MongoDB :27017 │    │     │     │     │
│   │   │   │               │   (Docker)       │    │     │     │     │
│   │   │   │               └──────────────────┘    │     │     │     │
│   │   │   │                                       │     │     │     │
│   │   │   │  Host-level MongoDB 7.0 also runs     │     │     │     │
│   │   │   │  for Jenkins backend test stage       │     │     │     │
│   │   │   └───────────────────────────────────────┘     │     │     │
│   │   └────────────────────────────────────────────────┘     │     │
│   │                                                          │     │
│   │   ┌──────────────────┐    ┌──────────────────┐          │     │
│   │   │ Internet Gateway │    │   Route Table    │          │     │
│   │   │                  │◄───│  0.0.0.0/0 → IGW │          │     │
│   │   └──────────────────┘    └──────────────────┘          │     │
│   └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│   Elastic IP 13.50.160.247 — static, attached to the EC2 instance │
└──────────────────────────────────────────────────────────────────┘
         ▲
         │
    Internet User
```

### CI/CD Flow (verified live with GitHub webhook auto-trigger)

```
Developer
    │
    │  git push origin main
    ▼
┌─────────┐
│ GitHub  │──── Webhook (push event) ──────────────────────┐
└─────────┘                                                  │
                                                             ▼
                                                    ┌────────────────┐
                                                    │    Jenkins     │
                                                    │  (8 stages)    │
                                                    │                │
                                                    │  1 Checkout    │
                                                    │  2 Install Deps│
                                                    │  3 Backend Test│
                                                    │  4 Frontend Bld│
                                                    │  5 Docker Build│
                                                    │  6 Compose Val │
                                                    │  7 Deploy EC2  │
                                                    │  8 Health Check│
                                                    └────────────────┘
                                                             │
                                                             ▼
                                                   ✅ Live in ~8–10 min
```

### Request Lifecycle

```
Browser → Nginx (:80)
           │
           ├── /api/* ──► Express (:5000)
           │                  │
           │              JWT Middleware
           │                  │
           │              Rate Limiter
           │                  │
           │              Controller
           │                  │
           │              Mongoose ──► MongoDB
           │
           └── /* ──► React SPA (index.html)
                          │
                      React Router
                          │
                      Page Component
                          │
                    Axios → /api/*
```

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, receive JWT |
| POST | `/api/auth/logout` | ✓ | Logout (audit log) |
| GET | `/api/auth/me` | ✓ | Get current user |

### Blogs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/blogs` | — | List published blogs (paginated) |
| GET | `/api/blogs/search?q=query` | — | Full-text search |
| GET | `/api/blogs/:id` | — | Get single blog |
| GET | `/api/blogs/user/my` | ✓ | Get my blogs (incl. drafts) |
| POST | `/api/blogs` | ✓ | Create blog |
| PUT | `/api/blogs/:id` | ✓ | Update blog (author only) |
| DELETE | `/api/blogs/:id` | ✓ | Delete blog (author only) |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/:id` | — | Get author public profile |
| PUT | `/api/users/profile` | ✓ | Update own profile |
| PUT | `/api/users/change-password` | ✓ | Change password |

### System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Backend health check (used by Docker + Jenkins) |
| GET | `/api/blogs` | — | Also used as the Jenkins post-deploy health probe |

Try it live:
```bash
curl http://13.50.160.247/api/blogs
```

---

## Database Schema

### Users Collection

```javascript
{
  _id:       ObjectId,
  name:      String (2–50 chars),
  email:     String (unique, lowercase),
  password:  String (bcrypt hash, select: false),
  bio:       String (max 300 chars),
  avatar:    String (URL),
  role:      String (enum: 'user' | 'admin', default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Blogs Collection

```javascript
{
  _id:         ObjectId,
  title:       String (5–150 chars),
  content:     String (min 50 chars),
  excerpt:     String (auto-generated, max 300 chars),
  author:      ObjectId → ref: 'User',
  tags:        [String] (lowercase, trimmed),
  coverImage:  String (URL),
  published:   Boolean (default: true),
  views:       Number (default: 0),
  readTime:    Number (minutes, auto-calculated),
  createdAt:   Date,
  updatedAt:   Date
}
```

**Indexes:**
- `users.email` — unique index
- `blogs`: text index on `title + content + tags` (full-text search)
- `blogs`: compound index on `author + createdAt`
- `blogs`: compound index on `published + createdAt`

---

## Local Development

### Prerequisites

- Node.js 20+ (tested with 22.x as well)
- MongoDB 7 (or Docker)
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/HarshvardhanTharkar/blog-platform.git
cd blog-platform/blog-platform

# 2. Backend setup
cd server
cp .env.example .env       # Edit with your MongoDB URI and JWT secret
npm install --legacy-peer-deps
npm run dev                # Starts on http://localhost:5000

# 3. Frontend setup (new terminal)
cd ../client
npm install --legacy-peer-deps
npm start                  # Starts on http://localhost:3000
```

> **Note:** `npm install --legacy-peer-deps` is required rather than `npm ci` — the committed lockfiles can drift from `package.json` across npm versions, and `--legacy-peer-deps` avoids peer-dependency resolution failures on newer npm releases.

### Environment Variables

**server/.env**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/blogplatform
MONGO_URI_TEST=mongodb://localhost:27017/blogplatform_test
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

**client/.env** (optional)
```env
REACT_APP_API_URL=          # Leave blank to use proxy
```

---

## Docker Setup

### Production (single command)

```bash
# Copy and edit environment file
cp server/.env.example .env
# Edit .env with production values

# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Development (hot reload)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Individual service commands

```bash
# Rebuild a specific service
docker compose build backend

# View logs for one service
docker compose logs -f backend

# Exec into a container
docker compose exec backend sh

# Check health status
docker compose ps
```

### Image sizes (actual, from production build)

| Image | Base | Final |
|-------|------|-------|
| Backend | node:20-alpine | ~284MB |
| Frontend | nginx:1.25-alpine | ~76MB |
| MongoDB | mongo:7.0 | ~700MB |

---

## AWS Infrastructure (Terraform)

### Architecture

```
Internet → Internet Gateway → Route Table → Public Subnet → EC2 (Elastic IP)
                                                              └── Security Group
                                                                  ├── :22   (SSH, IP-restricted)
                                                                  ├── :80   (HTTP, public)
                                                                  ├── :443  (HTTPS, public, unused — no TLS yet)
                                                                  ├── :5000 (API, public — direct access)
                                                                  ├── :3000 (React dev server, public)
                                                                  └── :8080 (Jenkins, open for GitHub webhook delivery)
```

> **Note on port 8080:** GitHub's webhook servers connect from a range of IPs, not a single fixed address, so Jenkins' port had to be opened to `0.0.0.0/0` for webhook delivery to succeed (confirmed via GitHub's "Recent Deliveries" log — IP-restricted access caused `failed to connect to host`). In a stricter production setup this would instead allowlist GitHub's published webhook IP ranges.

### Prerequisites

- Terraform 1.6+ (tested with 1.15.x)
- AWS CLI v2, configured (`aws configure`)
- An EC2 key pair created in AWS (or created via `aws ec2 create-key-pair`)

### Deployment Commands

```bash
cd terraform

# Initialize — downloads AWS provider
terraform init

# Preview changes (dry run)
terraform plan

# Apply — creates all AWS resources
terraform apply

# Destroy — removes all resources (CAUTION)
terraform destroy
```

### Resources Created

| Resource | Type | Description |
|----------|------|-------------|
| `blog-platform-vpc` | aws_vpc | Isolated network (10.0.0.0/16) |
| `blog-platform-public-subnet` | aws_subnet | Public subnet (10.0.1.0/24, eu-north-1a) |
| `blog-platform-igw` | aws_internet_gateway | Internet access |
| `blog-platform-public-rt` | aws_route_table | Routes 0.0.0.0/0 → IGW |
| `blog-platform-ec2-sg` | aws_security_group | Firewall rules |
| `blog-platform-server` | aws_instance | Ubuntu 24.04, t3.small |
| `blog-platform-eip` | aws_eip | Static public IP — `13.50.160.247` |

### Cost Estimate (eu-north-1)

| Resource | Monthly Cost |
|----------|-------------|
| EC2 t3.small | ~$13–15 |
| Elastic IP (attached) | $0.00 |
| EBS 20GB gp3 | ~$1.60 |
| Data transfer | ~$1–5 |
| **Total** | **~$16–20/month** |

---

## Jenkins Setup

### 1. Access Jenkins

```
http://13.50.160.247:8080
```

Get the initial admin password:
```bash
ssh -i your-key.pem ubuntu@13.50.160.247
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

> **Java requirement:** Jenkins 2.555.x requires **Java 21** minimum (Java 17 will fail to start with `Unsupported Java version`). The EC2 bootstrap installs Java 17 by default — Java 21 must be installed separately and set as the active `update-alternatives` target before Jenkins will run.

### 2. Install Required Plugins

Go to: Manage Jenkins → Plugins → Available plugins

Required plugins:
- Pipeline (workflow-aggregator)
- Git / GitHub / GitHub Integration
- NodeJS Plugin
- SSH Agent
- Credentials Binding
- Timestamper
- Workspace Cleanup

### 3. Configure NodeJS Tool

Manage Jenkins → Tools → NodeJS installations → Add NodeJS
- Name: `NodeJS-20` (must match the `tools { nodejs '...' }` block in the Jenkinsfile exactly)
- Version: 20.19.x
- ✓ Install automatically

### 4. Configure Credentials

| Credential ID | Kind | Purpose |
|---|---|---|
| `github-credentials` | Username + Password (PAT) | Checkout from GitHub |
| `ec2-ssh-key` | SSH Username with private key | SSH deploy to EC2 |
| `blog-platform-env` | Secret file | Production `.env` |

See `jenkins/credentials-setup.md` for full steps.

### 5. Grant Jenkins Docker Access

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 6. Create Pipeline Job

1. New Item → Pipeline
2. Name: `inkwell-pipeline`
3. Build Triggers: ✓ GitHub hook trigger for GITScm polling
4. Pipeline Definition: Pipeline script from SCM
5. SCM: Git → repository URL
6. Branch: `*/main`
7. **Script Path:** `blog-platform/Jenkinsfile` — the Jenkinsfile lives in a nested subdirectory of this repo, not the root, so the script path must reflect that

### 7. Configure GitHub Webhook

In your GitHub repository:
- Settings → Webhooks → Add webhook
- Payload URL: `http://13.50.160.247:8080/github-webhook/`
- Content type: `application/json`
- Events: Just the push event

Verify delivery succeeded under **Recent Deliveries** — should show a green checkmark with HTTP 200.

### 8. Global Environment Variables

Manage Jenkins → System → Global properties → Environment variables:

| Variable | Value |
|---|---|
| `EC2_HOST` | `13.50.160.247` |
| `APP_DIR` | `/opt/blog-platform/blog-platform` (note the nested path) |

---

## CI/CD Workflow

```
git push main
     │
     ▼
GitHub Webhook fires ──► Jenkins triggered automatically
     │
     ▼
┌─ Stage 1: Checkout ──────────────────────────────── ~1s ──┐
│  git clone + git log                                       │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 2: Install Dependencies (parallel) ──────── ~25s ──┐
│  Backend: npm install --legacy-peer-deps                   │
│  Frontend: npm install --legacy-peer-deps                  │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 3: Backend Tests ──────────────────────────── ~9s ─┐
│  Jest + Supertest, 22 tests, coverage report                │
│  Connects to a host-level MongoDB 7.0 instance on Jenkins   │
│  Fails pipeline if any test fails                           │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 4: Frontend Build ─────────────────────────── ~30s ─┐
│  npm run build → optimized production bundle (CI=true,      │
│  so ESLint warnings are treated as build errors)             │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 5: Docker Build ───────────────────────────── ~5s ──┐
│  Build backend image + frontend image (cached layers)       │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 6: Compose Validate ───────────────────────── ~1s ──┐
│  docker compose config --quiet                              │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 7: Deploy to EC2 ─────────────────────────── ~110s ─┐
│  1. SCP .env file to APP_DIR                                 │
│  2. SSH: git pull + docker compose build --no-cache +        │
│     down --remove-orphans + up -d + image prune              │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 8: Health Check ───────────────────────────── ~15s ─┐
│  curl http://EC2_IP/api/blogs — retries 5x every 15s         │
└────────────────────────────────────────────────────────────┘
     │
     ▼
✅ SUCCESS — verified live, total time ~3–4 minutes
```

---

## Security

### Backend
- **JWT** — Signed tokens with configurable expiry (7d default)
- **bcryptjs** — Passwords hashed with 12 salt rounds
- **express-validator** — All inputs validated and sanitized before processing
- **express-rate-limit** — 100 req/15min globally, 20 req/15min on auth routes
- **Helmet** — Sets 11 security-related HTTP headers
- **CORS** — Whitelist-based origin restriction

### Infrastructure
- **Security Groups** — SSH and Jenkins UI restricted to a specific IP by default (port 8080 opened publicly to support GitHub webhook delivery — see note above)
- **EBS Encryption** — Root volume encrypted at rest
- **Non-root Docker user** — Backend container runs as `nodeuser` (UID 1001)
- **Secret management** — No secrets in source code or Docker images; `.env` delivered via Jenkins Secret File credential and SCP, never committed to git

### Application
- **Ownership checks** — Users can only edit/delete their own posts
- **Role-based access** — Admin role for elevated permissions
- **Password not exposed** — `select: false` on User.password field
- **JWT validation** — Token expiry and invalid token detection

---

## Testing

### Run Backend Tests

```bash
cd server
npm test                  # Run all tests
npm test -- --coverage    # With coverage report
```

**Current results:** 2 test suites, 22 tests, all passing — ~73% statement coverage.

### Run Tests in Docker

```bash
docker compose exec backend npm test
```

---

## Deployment Notes & Lessons Learned

A handful of real issues came up provisioning this on a fresh AWS account and Ubuntu 24.04, documented here in case they help:

- **Jenkins GPG key import** — the documented `wget`-piped key import failed signature verification on Ubuntu 24.04; importing via `gpg --keyserver keyserver.ubuntu.com --recv-keys` and exporting with `--armor` resolved it.
- **Java version mismatch** — Jenkins 2.555.x requires Java 21; the bootstrap script installs Java 17. Installing `openjdk-21-jdk` and switching `update-alternatives` fixed the service crash loop.
- **t3.small memory pressure** — Jenkins + Docker + a host-level MongoDB for tests pushed RAM usage past available memory, intermittently leaving the instance `impaired`. Adding a 2GB swapfile resolved sustained operation; a `t3.medium` would remove the need for swap entirely if budget allows.
- **MongoDB apt repo on noble** — MongoDB 7.0's official apt repo doesn't yet publish for Ubuntu 24.04 (`noble`); using the `jammy` (22.04) repo definition works fine on noble in practice.
- **Nested repo structure** — the Jenkinsfile and `docker-compose.yml` live one directory below the GitHub repo root, so every `dir()` step in the Jenkinsfile and the `Script Path` / `APP_DIR` Jenkins settings need the `blog-platform/` prefix.
- **Lockfile drift in CI** — `npm ci` failed in Docker builds and the Jenkins agent because locally-generated `package-lock.json` files (npm 11) didn't match what the container's npm (10.x) expected. Switching to `npm install --legacy-peer-deps` across all Dockerfiles and the Jenkinsfile avoided this without freezing dependency versions.
- **CRA + `CI=true`** — Jenkins sets `CI=true` automatically, which makes Create React App treat ESLint warnings as build-breaking errors; an unused import that was harmless locally failed the pipeline until removed.
- **GitHub webhook delivery blocked by Security Group** — restricting port 8080 to a single IP blocks GitHub's webhook delivery entirely (`failed to connect to host` in GitHub's delivery log), since GitHub doesn't deliver from a single fixed IP.
- **Elastic IP disassociation on stop/start** — stopping and starting the EC2 instance (used to recover from `impaired` status) occasionally left the Elastic IP unattached, silently changing the instance's public IP until manually re-associated.

---

## Troubleshooting

### Docker containers won't start

```bash
docker compose logs backend
docker compose logs mongodb
sudo lsof -i :80
sudo lsof -i :5000
docker compose down -v && docker compose up -d --build   # WARNING: removes volumes
```

### Jenkins can't run Docker commands

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
id jenkins
```

### Jenkins won't start (`Unsupported Java version`)

```bash
sudo apt-get install -y openjdk-21-jdk
sudo update-alternatives --set java /usr/lib/jvm/java-21-openjdk-amd64/bin/java
sudo systemctl restart jenkins
```

### EC2 instance shows `impaired` status

```bash
aws ec2 stop-instances --instance-ids <id> --region eu-north-1
aws ec2 wait instance-stopped --instance-ids <id> --region eu-north-1
aws ec2 start-instances --instance-ids <id> --region eu-north-1
aws ec2 wait instance-running --instance-ids <id> --region eu-north-1
# then re-check Elastic IP association:
aws ec2 describe-addresses --region eu-north-1
```

### MongoDB connection refused

```bash
docker compose ps mongodb
docker compose logs mongodb
docker compose exec backend sh
# mongosh mongodb://admin:password@mongodb:27017/blogplatform?authSource=admin
```

### Jenkins webhook not triggering

1. Check GitHub → Settings → Webhooks → Recent Deliveries for the exact error
2. `failed to connect to host` → the EC2 Security Group is blocking GitHub's IP; open port 8080 to `0.0.0.0/0` or allowlist GitHub's webhook IP ranges
3. Redeliver the failed payload from GitHub's UI to test without a new commit

### SSH connection times out

- Your local public IP likely changed since the security group rule was set; re-authorize:
```bash
$newip = (Invoke-WebRequest -Uri "https://checkip.amazonaws.com" -UseBasicParsing).Content.Trim()
aws ec2 authorize-security-group-ingress --group-id <sg-id> --protocol tcp --port 22 --cidr "$newip/32" --region eu-north-1
```

---

## Future Improvements

- [ ] **HTTPS** — Let's Encrypt via certbot, or AWS ACM + ALB
- [ ] **Image uploads** — S3 integration for cover images and avatars
- [ ] **Markdown editor** — Rich text editor with live preview (e.g. TipTap)
- [ ] **Comments** — Nested comment system with moderation
- [ ] **Likes/Bookmarks** — User engagement features
- [ ] **Email notifications** — SendGrid integration
- [ ] **Frontend tests** — `@testing-library/react` coverage
- [ ] **CDN** — CloudFront distribution for static assets
- [ ] **Redis caching** — Cache popular blogs, rate limit data
- [ ] **t3.medium or memory-optimized instance** — remove swap dependency, run SonarQube/Trivy alongside Jenkins without contention
- [ ] **GitHub webhook IP allowlisting** — replace the open `0.0.0.0/0` rule on port 8080 with GitHub's published webhook IP ranges
- [ ] **CloudWatch monitoring**
- [ ] **ECS/EKS migration** for horizontal scaling

---

## Resume Description

> **Inkwell — Full-Stack MERN + DevOps Project** | *React, Node.js, MongoDB, Docker, AWS, Terraform, Jenkins*

- Built and **deployed live** a production-style blogging platform using **React 18**, **Node.js/Express**, and **MongoDB**, featuring JWT authentication, full-text search, role-based authorization, and form validation

- Containerized the application using **Docker** with multi-stage builds, `docker compose` orchestration across three services with health checks, and a non-root container user for the backend

- Provisioned AWS cloud infrastructure (VPC, EC2, Security Groups, Elastic IP) using **Terraform** (Infrastructure as Code), and self-hosted a **Jenkins** CI/CD server on the same instance

- Configured an 8-stage Jenkins pipeline (test → build → deploy → health check) triggered automatically by GitHub webhook push events, taking commits from `git push` to a live, health-checked deployment in under 5 minutes

- Diagnosed and resolved real-world production deployment issues — Jenkins/Java version compatibility, memory-constrained EC2 instance stability, Docker lockfile drift in CI, and GitHub webhook connectivity through AWS Security Groups

- Implemented production security practices including **bcrypt** password hashing (12 rounds), **Helmet** HTTP headers, API rate limiting, CORS whitelisting, and input validation

---

*Built as a portfolio project demonstrating full-stack engineering and DevOps practices — including the messy, real parts of getting a pipeline to actually run in production.*
