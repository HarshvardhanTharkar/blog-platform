# ──────────────────────────────────────────────────────────────────────────────
# main.tf
# Contains data sources and any resources that don't fit in dedicated files.
# ──────────────────────────────────────────────────────────────────────────────

# Fetch available AZs in the configured region (used for validation/reference)
data "aws_availability_zones" "available" {
  state = "available"
}

# Fetch the current AWS account ID (useful for ARN construction)
data "aws_caller_identity" "current" {}

# Fetch the current AWS region
data "aws_region" "current" {}
