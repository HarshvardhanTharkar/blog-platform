# ──────────────────────────────────────────────────────────────────────────────
# vpc.tf
# Provisions the network foundation:
#   VPC → Public Subnet → Internet Gateway → Route Table → Association
#
# Architecture:
#   Internet ──► IGW ──► Route Table (0.0.0.0/0 → IGW) ──► Public Subnet
#                                                               │
#                                                            EC2 Instance
# ──────────────────────────────────────────────────────────────────────────────

# ── VPC ──────────────────────────────────────────────────────────────────────
# The VPC is the isolated network boundary for all resources.
# enable_dns_hostnames=true allows EC2 instances to receive public DNS names.
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# ── Public Subnet ─────────────────────────────────────────────────────────────
# Resources in this subnet can receive public IP addresses.
# map_public_ip_on_launch=true means EC2 instances automatically get a public IP.
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet"
    Type = "public"
  }
}

# ── Internet Gateway ──────────────────────────────────────────────────────────
# Attaches the VPC to the internet. Without this, no inbound/outbound
# internet traffic is possible regardless of security group rules.
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# ── Route Table ───────────────────────────────────────────────────────────────
# Defines routing rules for the public subnet.
# The 0.0.0.0/0 route sends all non-local traffic to the internet gateway.
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# ── Route Table Association ────────────────────────────────────────────────────
# Links the route table to the public subnet.
# Without this association, the subnet uses the VPC's default (local-only) route table.
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
