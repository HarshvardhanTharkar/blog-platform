# Jenkins Credentials Setup

Configure these credentials in Jenkins before running the pipeline:
Manage Jenkins → Credentials → System → Global credentials → Add Credential

---

## 1. GitHub Personal Access Token
- Kind: Username with password
- ID: `github-credentials`
- Username: your-github-username
- Password: your-github-PAT (needs repo + webhook permissions)
- Description: GitHub Access Token

## 2. EC2 SSH Private Key
- Kind: SSH Username with private key
- ID: `ec2-ssh-key`
- Username: ubuntu
- Private Key: (paste your .pem file content)
- Description: EC2 SSH Key

## 3. Application .env Secrets
- Kind: Secret file
- ID: `blog-platform-env`
- File: Upload your production .env file
- Description: Blog Platform Production Environment Variables

## 4. Docker Hub (optional, if pushing to Docker Hub)
- Kind: Username with password
- ID: `dockerhub-credentials`
- Username: your-dockerhub-username
- Password: your-dockerhub-password-or-token
- Description: Docker Hub Registry

---

## Required Jenkins Environment Variables
Configure in: Manage Jenkins → Configure System → Global properties → Environment variables

| Name | Value | Description |
|------|-------|-------------|
| EC2_HOST | 1.2.3.4 | Your EC2 Elastic IP |
| APP_DIR | /opt/blog-platform | App directory on EC2 |
| DOCKER_COMPOSE_VERSION | v2.23.0 | Docker Compose version |
