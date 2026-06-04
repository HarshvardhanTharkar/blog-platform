# ──────────────────────────────────────────────────────────────────────────────
# ec2.tf
# Provisions the EC2 instance that runs the blog platform.
#
# The user_data script bootstraps the server on first launch:
#   1. Updates packages
#   2. Installs Docker + Docker Compose
#   3. Installs Git
#   4. Adds ubuntu user to docker group
# ──────────────────────────────────────────────────────────────────────────────

# ── EC2 Instance ─────────────────────────────────────────────────────────────
resource "aws_instance" "app" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]

  # Assign a public IP so the instance is reachable from the internet
  associate_public_ip_address = true

  # Root volume configuration
  root_block_device {
    volume_type           = "gp3"          # gp3 is newer, faster, and cheaper than gp2
    volume_size           = var.root_volume_size
    delete_on_termination = true
    encrypted             = true           # Encrypt EBS volume at rest
  }

  # user_data: runs once as root when the instance first boots
  # This script installs all prerequisites needed by the deploy script
  user_data = base64encode(templatefile("${path.module}/scripts/user_data.sh", {
    project_name = var.project_name
  }))

  # Prevent accidental destruction of the EC2 instance
  lifecycle {
    prevent_destroy = false   # Set to true in production after initial deploy
    ignore_changes  = [ami]   # Ignore AMI changes (prevents replacement on AMI update)
  }

  tags = {
    Name = "${var.project_name}-server"
  }
}

# ── Elastic IP ────────────────────────────────────────────────────────────────
# Allocates a static public IP that persists across instance stops/starts.
# Without this, the public IP changes every time the instance is restarted.
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  # EIP must be created after the internet gateway is attached
  depends_on = [aws_internet_gateway.main]

  tags = {
    Name = "${var.project_name}-eip"
  }
}
