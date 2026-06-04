# Inkwell — Blog Platform

> A production-ready, full-stack blogging platform built with the MERN stack, containerized with Docker, provisioned on AWS with Terraform, and deployed via a Jenkins CI/CD pipeline.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?logo=mongodb)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-24.x-blue?logo=docker)](https://docker.com)
[![Terraform](https://img.shields.io/badge/Terraform-1.6+-purple?logo=terraform)](https://terraform.io)
[![Jenkins](https://img.shields.io/badge/Jenkins-LTS-red?logo=jenkins)](https://jenkins.io)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Local Development](#local-development)
7. [Docker Setup](#docker-setup)
8. [AWS Infrastructure (Terraform)](#aws-infrastructure-terraform)
9. [Jenkins Setup](#jenkins-setup)
10. [CI/CD Workflow](#cicd-workflow)
11. [Security](#security)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)
14. [Future Improvements](#future-improvements)
15. [Resume Description](#resume-description)

---

## Overview

Inkwell is a full-featured blogging platform designed as a portfolio-grade project demonstrating production engineering practices across the full stack:

- **Frontend** — React 18 SPA with Context API state management, protected routes, and a polished editorial design
- **Backend** — Node.js + Express REST API with JWT authentication, role-based access, full-text search, and rate limiting
- **Database** — MongoDB with Mongoose ODM, text indexes for search, and proper relationship modeling
- **DevOps** — Fully containerized with Docker, infrastructure-as-code with Terraform, automated deployment via Jenkins

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
| 🔄 CI/CD | Automated test → build → deploy pipeline |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                             │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    VPC 10.0.0.0/16                  │   │
│   │                                                     │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │            Public Subnet 10.0.1.0/24        │   │   │
│   │   │                                             │   │   │
│   │   │   ┌─────────────────────────────────────┐   │   │   │
│   │   │   │           EC2 t3.small              │   │   │   │
│   │   │   │                                     │   │   │   │
│   │   │   │  ┌──────────┐  ┌────────────────┐   │   │   │   │
│   │   │   │  │  Nginx   │  │   Jenkins :8080│   │   │   │   │
│   │   │   │  │  :80     │  └────────────────┘   │   │   │   │
│   │   │   │  └────┬─────┘                       │   │   │   │
│   │   │   │       │ Docker Network              │   │   │   │
│   │   │   │  ┌────▼─────┐  ┌────────────────┐   │   │   │   │
│   │   │   │  │ Frontend │  │    Backend     │   │   │   │   │
│   │   │   │  │ (React)  │  │  (Express:5000)│   │   │   │   │
│   │   │   │  └──────────┘  └───────┬────────┘   │   │   │   │
│   │   │   │                        │             │   │   │   │
│   │   │   │               ┌────────▼────────┐    │   │   │   │
│   │   │   │               │    MongoDB      │    │   │   │   │
│   │   │   │               │  (Docker :27017)│    │   │   │   │
│   │   │   │               └─────────────────┘    │   │   │   │
│   │   │   └─────────────────────────────────┘   │   │   │   │
│   │   └─────────────────────────────────────────┘   │   │   │
│   │                                                  │   │   │
│   │   ┌──────────────────┐    ┌──────────────────┐   │   │   │
│   │   │ Internet Gateway │    │   Route Table    │   │   │   │
│   │   │                  │◄───│  0.0.0.0/0 → IGW │   │   │   │
│   │   └──────────────────┘    └──────────────────┘   │   │   │
│   └─────────────────────────────────────────────────┘   │   │
└─────────────────────────────────────────────────────────────┘
         ▲
         │
    Internet User
```

### CI/CD Flow

```
Developer
    │
    │  git push origin main
    ▼
┌─────────┐
│ GitHub  │──── Webhook ────────────────────────────────────┐
└─────────┘                                                  │
                                                             ▼
                                                    ┌────────────────┐
                                                    │    Jenkins     │
                                                    │                │
                                                    │  ┌──────────┐  │
                                                    │  │Checkout  │  │
                                                    │  └────┬─────┘  │
                                                    │       ▼        │
                                                    │  ┌──────────┐  │
                                                    │  │Install   │  │
                                                    │  │  Deps    │  │
                                                    │  └────┬─────┘  │
                                                    │       ▼        │
                                                    │  ┌──────────┐  │
                                                    │  │  Tests   │  │
                                                    │  └────┬─────┘  │
                                                    │       ▼        │
                                                    │  ┌──────────┐  │
                                                    │  │ Docker   │  │
                                                    │  │  Build   │  │
                                                    │  └────┬─────┘  │
                                                    │       ▼        │
                                                    │  ┌──────────┐  │
                                                    │  │ Deploy   │  │
                                                    │  │  EC2     │  │
                                                    │  └────┬─────┘  │
                                                    │       ▼        │
                                                    │  ┌──────────┐  │
                                                    │  │ Health   │  │
                                                    │  │  Check   │  │
                                                    │  └──────────┘  │
                                                    └────────────────┘
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
| GET | `/health` | — | Health check (used by Docker + Jenkins) |

**Query parameters for `GET /api/blogs`:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 50) |
| `tag` | string | Filter by tag |
| `author` | string | Filter by author ID |

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

- Node.js 20+
- MongoDB 7 (or Docker)
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/blog-platform.git
cd blog-platform

# 2. Backend setup
cd server
cp .env.example .env       # Edit with your MongoDB URI and JWT secret
npm install
npm run dev                # Starts on http://localhost:5000

# 3. Frontend setup (new terminal)
cd ../client
cp .env.example .env
npm install
npm start                  # Starts on http://localhost:3000
```

### Environment Variables

**server/.env**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/blogplatform
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

### Image sizes (approximate)

| Image | Base | Final |
|-------|------|-------|
| Backend | node:20-alpine | ~180MB |
| Frontend | nginx:1.25-alpine | ~45MB |
| MongoDB | mongo:7.0 | ~700MB |

---

## AWS Infrastructure (Terraform)

### Architecture

```
Internet → Internet Gateway → Route Table → Public Subnet → EC2 (Elastic IP)
                                                              └── Security Group
                                                                  ├── :22  (SSH)
                                                                  ├── :80  (HTTP)
                                                                  ├── :443 (HTTPS)
                                                                  ├── :5000 (API)
                                                                  └── :8080 (Jenkins)
```

### Prerequisites

- Terraform 1.6+
- AWS CLI configured (`aws configure`)
- An EC2 key pair created in AWS

### Deployment Commands

```bash
cd terraform

# Initialize — downloads AWS provider
terraform init

# Format code
terraform fmt

# Validate configuration
terraform validate

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
| `blog-platform-public-subnet` | aws_subnet | Public subnet (10.0.1.0/24) |
| `blog-platform-igw` | aws_internet_gateway | Internet access |
| `blog-platform-public-rt` | aws_route_table | Routes 0.0.0.0/0 → IGW |
| `blog-platform-ec2-sg` | aws_security_group | Firewall rules |
| `blog-platform-server` | aws_instance | Ubuntu 22.04, t3.small |
| `blog-platform-eip` | aws_eip | Static public IP |

### Cost Estimate (us-east-1)

| Resource | Monthly Cost |
|----------|-------------|
| EC2 t3.small | ~$15.18 |
| Elastic IP (attached) | $0.00 |
| EBS 20GB gp3 | ~$1.60 |
| Data transfer | ~$1–5 |
| **Total** | **~$18–22/month** |

---

## Jenkins Setup

### 1. Access Jenkins

After `terraform apply`, visit:
```
http://<EC2_ELASTIC_IP>:8080
```

Get the initial admin password:
```bash
ssh -i your-key.pem ubuntu@<EC2_IP>
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 2. Install Required Plugins

Go to: Manage Jenkins → Plugin Manager → Available

Required plugins:
- Pipeline
- Git
- GitHub Integration
- Docker Pipeline
- SSH Agent
- Credentials Binding
- Timestamper
- AnsiColor
- Build Timeout
- Workspace Cleanup

### 3. Configure Credentials

See `jenkins/credentials-setup.md` for step-by-step instructions.

### 4. Create Pipeline Job

1. New Item → Pipeline
2. Name: `blog-platform`
3. Build Triggers: ✓ GitHub hook trigger for GITScm polling
4. Pipeline Definition: Pipeline script from SCM
5. SCM: Git → your repository URL
6. Credentials: `github-credentials`
7. Branch: `*/main`
8. Script Path: `Jenkinsfile`

### 5. Configure GitHub Webhook

In your GitHub repository:
- Settings → Webhooks → Add webhook
- Payload URL: `http://<EC2_IP>:8080/github-webhook/`
- Content type: `application/json`
- Events: Just the push event

---

## CI/CD Workflow

```
git push main
     │
     ▼
GitHub Webhook fires ──► Jenkins triggered
     │
     ▼
┌─ Stage 1: Checkout ──────────────────────────────── ~30s ─┐
│  git clone + git log                                       │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 2: Install Dependencies (parallel) ───────── ~90s ─┐
│  Backend: npm ci                                           │
│  Frontend: npm ci                                          │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 3: Backend Tests ──────────────────────────── ~60s ─┐
│  Jest + Supertest + Coverage Report                        │
│  Fails pipeline if any test fails                          │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 4: Frontend Build ─────────────────────────── ~90s ─┐
│  npm run build → optimized production bundle               │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 5: Docker Build ───────────────────────────── ~90s ─┐
│  Build backend image + frontend image                      │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 6: Compose Validate ───────────────────────── ~10s ─┐
│  docker compose config --quiet                             │
└────────────────────────────────────────────────────────────┘
     │
     ▼ (main/master branch only)
┌─ Stage 7: Deploy to EC2 ─────────────────────────── ~120s ─┐
│  1. SCP .env file to server                                │
│  2. SSH: git pull + docker compose build + down + up       │
└────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ Stage 8: Health Check ───────────────────────────── ~30s ─┐
│  curl http://EC2_IP/health — retries 5x every 15s          │
└────────────────────────────────────────────────────────────┘
     │
     ▼
✅ SUCCESS — or — ❌ FAILURE (auto-rollback triggered)
```

Total pipeline time: ~8–10 minutes

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
- **Security Groups** — Inbound rules limited to required ports only
- **EBS Encryption** — Root volume encrypted at rest
- **Non-root Docker user** — Backend container runs as `nodeuser` (UID 1001)
- **Secret management** — No secrets in source code or Docker images; passed via environment variables

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
npm test -- --watch       # Watch mode
```

### Test Coverage

| Module | Tests |
|--------|-------|
| Auth API | Register, Login, Me endpoint, JWT validation |
| Blog API | CRUD operations, authorization, pagination |

### Run Tests in Docker

```bash
docker compose exec backend npm test
```

---

## Project Structure

```
blog-platform/
├── client/                    # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── BlogCard.js
│   │   │   ├── Footer.js
│   │   │   ├── Loader.js
│   │   │   ├── Navbar.js
│   │   │   └── SearchBar.js
│   │   ├── context/
│   │   │   └── AuthContext.js # Global auth state (useReducer)
│   │   ├── hooks/
│   │   │   └── useBlogs.js    # Custom hooks for data fetching
│   │   ├── layouts/
│   │   │   └── MainLayout.js  # Shared page layout
│   │   ├── pages/             # Route-level page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── CreateBlog.js
│   │   │   ├── EditBlog.js
│   │   │   ├── BlogDetails.js
│   │   │   ├── Profile.js
│   │   │   ├── AuthorProfile.js
│   │   │   └── NotFound.js
│   │   ├── routes/
│   │   │   ├── AppRouter.js   # All routes defined here
│   │   │   └── ProtectedRoute.js
│   │   ├── services/          # Axios API wrappers
│   │   │   ├── api.js         # Axios instance + interceptors
│   │   │   ├── authService.js
│   │   │   ├── blogService.js
│   │   │   └── userService.js
│   │   ├── index.css          # Global design system styles
│   │   └── index.js           # React entry point
│   ├── nginx.conf             # Nginx SPA config
│   ├── Dockerfile             # Multi-stage build
│   └── package.json
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # MongoDB connection
│   │   ├── controllers/       # Route handler logic
│   │   │   ├── authController.js
│   │   │   ├── blogController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT protect + authorize
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js    # express-validator rules
│   │   ├── models/
│   │   │   ├── User.js        # Mongoose schema + methods
│   │   │   └── Blog.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── blogRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── tests/
│   │   │   ├── auth.test.js
│   │   │   └── blog.test.js
│   │   ├── utils/
│   │   │   ├── logger.js      # Winston logger
│   │   │   └── response.js    # Standardized API responses
│   │   └── app.js             # Express app setup
│   ├── server.js              # Entry point + graceful shutdown
│   ├── Dockerfile
│   └── package.json
│
├── terraform/                 # Infrastructure as Code
│   ├── providers.tf           # AWS provider config
│   ├── variables.tf           # Input variable declarations
│   ├── main.tf                # Data sources
│   ├── vpc.tf                 # VPC, Subnet, IGW, Route Table
│   ├── security-groups.tf     # EC2 firewall rules
│   ├── ec2.tf                 # EC2 instance + Elastic IP
│   ├── outputs.tf             # Post-apply output values
│   ├── terraform.tfvars       # Variable values (gitignored)
│   └── scripts/
│       └── user_data.sh       # EC2 bootstrap script
│
├── jenkins/
│   ├── install-jenkins.sh     # Jenkins setup script
│   ├── plugins.txt            # Required plugins list
│   └── credentials-setup.md  # Credentials configuration guide
│
├── scripts/
│   ├── deploy.sh              # Production deployment script
│   ├── rollback.sh            # Rollback to previous commit
│   └── mongo-init.js          # MongoDB initialization
│
├── docker-compose.yml         # Production orchestration
├── docker-compose.dev.yml     # Development overrides
├── Jenkinsfile                # CI/CD pipeline definition
├── .gitignore
└── README.md
```

---

## Troubleshooting

### Docker containers won't start

```bash
# Check container logs
docker compose logs backend
docker compose logs mongodb

# Check if ports are in use
sudo lsof -i :80
sudo lsof -i :5000
sudo lsof -i :27017

# Hard reset (WARNING: removes volumes)
docker compose down -v
docker compose up -d --build
```

### Jenkins can't run Docker commands

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Verify
id jenkins
```

### MongoDB connection refused

```bash
# Check MongoDB container health
docker compose ps mongodb
docker compose logs mongodb

# Test connection from backend container
docker compose exec backend sh
# Inside container:
# mongosh mongodb://admin:password@mongodb:27017/blogplatform?authSource=admin
```

### Terraform errors

```bash
# Refresh state
terraform refresh

# Import existing resource
terraform import aws_instance.app i-1234567890abcdef0

# Unlock state (if locked by crashed run)
terraform force-unlock LOCK_ID
```

### Jenkins webhook not triggering

1. Verify EC2 Security Group allows inbound :8080 from GitHub's IP ranges
2. Check Jenkins → Manage Jenkins → System Log for webhook events
3. Test webhook manually in GitHub → Settings → Webhooks → Recent Deliveries

---

## Future Improvements

- [ ] **Image uploads** — S3 integration for cover images and avatars
- [ ] **Markdown editor** — Rich text editor with live preview (e.g. TipTap)
- [ ] **Comments** — Nested comment system with moderation
- [ ] **Likes/Bookmarks** — User engagement features
- [ ] **Email notifications** — SendGrid integration for auth and engagement
- [ ] **HTTPS** — AWS ACM certificate + Nginx TLS termination
- [ ] **CDN** — CloudFront distribution for static assets
- [ ] **Redis caching** — Cache popular blogs, rate limit data
- [ ] **Load balancer** — ALB for horizontal scaling
- [ ] **Monitoring** — CloudWatch metrics + Grafana dashboard
- [ ] **ECS/EKS migration** — Move from single EC2 to container orchestration
- [ ] **RDS/DocumentDB** — Managed MongoDB alternative

---

## Resume Description

Use these bullet points on your resume:

> **Blog Platform — Full-Stack MERN + DevOps Project** | *React, Node.js, MongoDB, Docker, AWS, Terraform, Jenkins*

- Developed a production-ready blogging platform using **React 18**, **Node.js/Express**, and **MongoDB**, featuring JWT authentication, full-text search, role-based authorization, and real-time form validation

- Containerized the application using **Docker** with multi-stage builds (reducing image sizes by ~60%), `docker compose` orchestration across three services, and container health checks ensuring zero-downtime deployments

- Provisioned AWS cloud infrastructure (VPC, EC2, Security Groups, Elastic IP) using **Terraform** (Infrastructure as Code), enabling reproducible, version-controlled environment provisioning

- Configured a **Jenkins CI/CD pipeline** with 8 automated stages (test → build → deploy → health check), GitHub webhook integration for push-triggered deployments, and automatic rollback on failure

- Implemented production security practices including **bcrypt** password hashing (12 rounds), **Helmet** HTTP headers, API rate limiting, CORS whitelisting, input validation, and principle of least privilege for AWS security groups

---

*Built with ❤️ as a portfolio project demonstrating full-stack engineering and DevOps practices.*
