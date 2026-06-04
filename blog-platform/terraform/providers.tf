# ──────────────────────────────────────────────────────────────────────────────
# providers.tf
# Declares the required Terraform version and configures the AWS provider.
# The backend block (remote state) is commented out — uncomment and fill in
# your S3 bucket + DynamoDB table after running `terraform init` the first time.
# ──────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # OPTIONAL: Remote state backend (recommended for teams / CI/CD)
  # Uncomment after creating the S3 bucket and DynamoDB table manually.
  #
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "blog-platform/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

# Configure the AWS provider.
# Credentials are read from environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
# or from the ~/.aws/credentials file — never hardcode credentials here.
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
