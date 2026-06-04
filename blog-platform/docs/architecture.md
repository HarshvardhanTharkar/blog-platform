# Architecture Diagrams

## Phase 1 — System Architecture

### User → Frontend → Backend → Database

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INKWELL BLOG PLATFORM                           │
└─────────────────────────────────────────────────────────────────────────┘

     User
      │
      │  HTTP Request (browser)
      ▼
┌──────────────────────────────┐
│     Nginx (port 80)          │
│  - Serves React static files │
│  - Proxies /api/* to Express │
│  - Handles SSL termination   │
└──────────┬──────────┬────────┘
           │          │
     Static files   /api/* requests
           │          │
           ▼          ▼
┌──────────────┐  ┌──────────────────────────────────────────────────┐
│ React SPA    │  │              Express.js API (port 5000)           │
│              │  │                                                    │
│ - Pages      │  │  Middleware Pipeline:                              │
│ - Components │  │  helmet() → cors() → rateLimit() → json()        │
│ - AuthContext│  │       → morgan() → routes → errorHandler()       │
│ - React      │  │                                                    │
│   Router     │  │  Routes:                                           │
│ - Axios      │  │  /api/auth  → authController                      │
│   Services   │  │  /api/blogs → blogController                      │
└──────────────┘  │  /api/users → userController                      │
                  └──────────────────────┬───────────────────────────┘
                                         │
                                         │  Mongoose ODM
                                         ▼
                         ┌───────────────────────────────┐
                         │         MongoDB               │
                         │                               │
                         │  Collections:                 │
                         │  ├── users (unique email idx) │
                         │  └── blogs (text index)       │
                         └───────────────────────────────┘
```

## Frontend Flow

```
User Action (click/form submit)
        │
        ▼
React Component (e.g. Login.js)
        │
        ▼
Service Layer (authService.login())
        │
        ▼
Axios Instance (api.js)
  - Attaches JWT from localStorage
  - Handles 401 globally
        │
        ▼
Express API endpoint
        │
        ▼
Response → AuthContext.dispatch()
        │
        ▼
React re-renders with new state
        │
        ▼
React Router navigates to /dashboard
```

## Backend Flow

```
Incoming Request
        │
        ▼
helmet()          ← Security headers
        │
        ▼
cors()            ← CORS validation
        │
        ▼
rateLimit()       ← Too many requests? → 429
        │
        ▼
express.json()    ← Parse request body
        │
        ▼
Route Match       ← 404 if no route matches
        │
        ▼
protect()         ← JWT validation (protected routes)
  ├── No token    → 401
  ├── Bad token   → 401
  └── Valid       → attaches req.user
        │
        ▼
validate()        ← express-validator rules
  └── Fails       → 422 Validation Error
        │
        ▼
Controller        ← Business logic
  └── Mongoose queries → MongoDB
        │
        ▼
sendSuccess()     ← Standardized JSON response
  { success, message, data }
```

## CI/CD Flow

```
Developer
    │ git push origin main
    ▼
GitHub Repository
    │ Webhook POST /github-webhook/
    ▼
Jenkins Server (EC2:8080)
    │
    ├─► Stage 1: Checkout
    │       git clone / pull
    │
    ├─► Stage 2: Install Deps (parallel)
    │       npm ci (server)
    │       npm ci (client)
    │
    ├─► Stage 3: Backend Tests
    │       jest --coverage
    │       ├─ PASS → continue
    │       └─ FAIL → abort pipeline, notify
    │
    ├─► Stage 4: Frontend Build
    │       npm run build
    │       verify build/ exists
    │
    ├─► Stage 5: Docker Build
    │       docker build ./server
    │       docker build ./client
    │
    ├─► Stage 6: Compose Validate
    │       docker compose config --quiet
    │
    ├─► Stage 7: Deploy to EC2 [main branch only]
    │       SCP .env to server
    │       SSH: git pull
    │            docker compose build
    │            docker compose down
    │            docker compose up -d
    │
    └─► Stage 8: Health Check
            curl http://EC2_IP/health
            retry 5x × 15s
            ├─ PASS → Pipeline SUCCESS ✅
            └─ FAIL → Rollback + FAILURE ❌
```

## AWS Network Flow

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────┐
│  AWS Region: us-east-1                          │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  VPC: 10.0.0.0/16                       │   │
│  │                                         │   │
│  │  Internet Gateway ◄──────────────────── │ ──┤── Internet
│  │        │                                │   │
│  │        ▼                                │   │
│  │  Route Table                            │   │
│  │  0.0.0.0/0 → IGW                       │   │
│  │        │                                │   │
│  │        ▼                                │   │
│  │  ┌──────────────────────────────────┐   │   │
│  │  │  Public Subnet: 10.0.1.0/24      │   │   │
│  │  │  AZ: us-east-1a                  │   │   │
│  │  │                                  │   │   │
│  │  │  ┌─────────────────────────────┐ │   │   │
│  │  │  │  Security Group             │ │   │   │
│  │  │  │  Inbound:                   │ │   │   │
│  │  │  │   :22  SSH   (your IP only) │ │   │   │
│  │  │  │   :80  HTTP  (0.0.0.0/0)    │ │   │   │
│  │  │  │   :443 HTTPS (0.0.0.0/0)    │ │   │   │
│  │  │  │   :5000 API  (0.0.0.0/0)    │ │   │   │
│  │  │  │   :8080 Jenkins (your IP)   │ │   │   │
│  │  │  │  Outbound: ALL              │ │   │   │
│  │  │  │                             │ │   │   │
│  │  │  │  EC2 t3.small               │ │   │   │
│  │  │  │  Ubuntu 22.04               │ │   │   │
│  │  │  │  EBS 20GB gp3 (encrypted)   │ │   │   │
│  │  │  │  Elastic IP: X.X.X.X        │ │   │   │
│  │  │  └─────────────────────────────┘ │   │   │
│  │  └──────────────────────────────────┘   │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```
