# ──────────────────────────────────────────────────────────────────────────────
# variables.tf
# Declares all input variables with descriptions, types, and defaults.
# Override defaults in terraform.tfvars (never commit secrets to VCS).
# ──────────────────────────────────────────────────────────────────────────────

variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name — used as a prefix for all resource names"
  type        = string
  default     = "blog-platform"
}

variable "environment" {
  description = "Deployment environment (dev, staging, production)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

# ── Networking ─────────────────────────────────────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "availability_zone" {
  description = "Availability Zone for the subnet"
  type        = string
  default     = "us-east-1a"
}

# ── EC2 ────────────────────────────────────────────────────────────────────

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"

  validation {
    condition     = can(regex("^t[23]\\.", var.instance_type))
    error_message = "Instance type must be t2 or t3 family for cost efficiency."
  }
}

variable "key_pair_name" {
  description = "Name of the EC2 key pair for SSH access (must exist in AWS already)"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance. Defaults to Ubuntu 22.04 LTS in us-east-1."
  type        = string
  default     = "ami-0c7217cdde317cfec"  # Ubuntu 22.04 LTS, us-east-1, x86_64
}

variable "root_volume_size" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 20
}

# ── Security ───────────────────────────────────────────────────────────────

variable "allowed_ssh_cidr" {
  description = "CIDR range allowed to SSH into the EC2 instance. Restrict to your IP!"
  type        = string
  default     = "0.0.0.0/0"  # CHANGE THIS to your IP: "1.2.3.4/32"
}

variable "jenkins_port" {
  description = "Port Jenkins runs on"
  type        = number
  default     = 8080
}
