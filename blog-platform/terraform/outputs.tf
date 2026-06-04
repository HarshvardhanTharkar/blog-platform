# ──────────────────────────────────────────────────────────────────────────────
# outputs.tf
# Displays useful values after `terraform apply` completes.
# These are also available to other Terraform modules via module.blog_platform.*
# ──────────────────────────────────────────────────────────────────────────────

output "ec2_public_ip" {
  description = "Elastic (static) public IP address of the EC2 instance"
  value       = aws_eip.app.public_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "ec2_public_dns" {
  description = "Public DNS hostname of the EC2 instance"
  value       = aws_instance.app.public_dns
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "Public subnet ID"
  value       = aws_subnet.public.id
}

output "security_group_id" {
  description = "EC2 security group ID"
  value       = aws_security_group.ec2.id
}

output "app_url" {
  description = "URL to access the application"
  value       = "http://${aws_eip.app.public_ip}"
}

output "jenkins_url" {
  description = "URL to access the Jenkins CI/CD dashboard"
  value       = "http://${aws_eip.app.public_ip}:8080"
}

output "ssh_command" {
  description = "SSH command to connect to the EC2 instance"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_eip.app.public_ip}"
}
