# ──────────────────────────────────────────────────────────────────────────────
# security-groups.tf
# Defines inbound/outbound traffic rules for the EC2 instance.
#
# Principle of Least Privilege:
#   - Only the minimum required ports are open.
#   - SSH is restricted to var.allowed_ssh_cidr (restrict to your IP in production).
#   - All outbound traffic is allowed (needed for apt updates, Docker pulls, etc.).
# ──────────────────────────────────────────────────────────────────────────────

resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-ec2-sg"
  description = "Security group for Blog Platform EC2 instance"
  vpc_id      = aws_vpc.main.id

  # ── Inbound Rules ──────────────────────────────────────────────────────────

  # SSH — for server administration
  # SECURITY: Restrict allowed_ssh_cidr to your own IP address in production
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  # HTTP — React app served by Nginx
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS — TLS termination (for when you add a certificate)
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Express API — direct access for testing/debugging
  ingress {
    description = "Express API"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # React dev server — only needed during development
  ingress {
    description = "React Dev Server"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Jenkins — CI/CD web UI
  ingress {
    description = "Jenkins"
    from_port   = var.jenkins_port
    to_port     = var.jenkins_port
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]  # Restrict Jenkins to your IP
  }

  # ── Outbound Rules ─────────────────────────────────────────────────────────

  # Allow all outbound traffic.
  # Required for: apt-get updates, Docker image pulls, MongoDB Atlas, npm installs, etc.
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ec2-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}
