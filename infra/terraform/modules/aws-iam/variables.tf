###############################################################################
# modules/aws-iam/variables.tf
###############################################################################

variable "environment" {
  description = "Deployment environment (prod, staging, dev)."
  type        = string
}

variable "account_alias" {
  description = "AWS account alias to set (must be unique across all AWS accounts)."
  type        = string
  default     = "healthcare-medicaid-prod"
}

variable "cost_center" {
  description = "Cost center tag for IAM resources."
  type        = string
  default     = "HEALTHCARE-OPS"
}

variable "owner_team" {
  description = "Owning team for IAM resources."
  type        = string
  default     = "platform-engineering"
}

variable "compliance_scope" {
  description = "Compliance framework scope string."
  type        = string
  default     = "FedRAMP-Moderate-HIPAA"
}

variable "data_classification" {
  description = "Data classification label."
  type        = string
  default     = "PHI-Restricted"
}

# ── Password policy ───────────────────────────────────────────────────────────
variable "password_minimum_length" {
  description = "Minimum IAM password length (FedRAMP requires ≥ 14)."
  type        = number
  default     = 16
}

variable "password_reuse_prevention" {
  description = "Number of previous passwords to prevent reuse."
  type        = number
  default     = 24
}

variable "password_max_age_days" {
  description = "Maximum IAM password age in days (FedRAMP requires ≤ 60)."
  type        = number
  default     = 60
}

# ── Role-specific config ──────────────────────────────────────────────────────
variable "ec2_role_name" {
  description = "Name of the IAM role for EC2 instances."
  type        = string
  default     = "healthcare-ec2-role"
}

variable "lambda_role_name" {
  description = "Name of the IAM role for Lambda functions."
  type        = string
  default     = "healthcare-lambda-role"
}

variable "ecs_task_role_name" {
  description = "Name of the IAM role for ECS task execution."
  type        = string
  default     = "healthcare-ecs-task-role"
}

variable "ecs_execution_role_name" {
  description = "Name of the IAM role for ECS task execution (ECR pull, CloudWatch logs)."
  type        = string
  default     = "healthcare-ecs-execution-role"
}

variable "cicd_role_name" {
  description = "Name of the IAM role for CI/CD pipeline deployments."
  type        = string
  default     = "healthcare-cicd-deploy-role"
}

variable "break_glass_role_name" {
  description = "Name of the break-glass emergency access IAM role."
  type        = string
  default     = "healthcare-break-glass-emergency"
}

variable "cloudtrail_role_name" {
  description = "Name of the IAM role for CloudTrail log delivery."
  type        = string
  default     = "healthcare-cloudtrail-role"
}

variable "cloudtrail_log_bucket_arn" {
  description = "ARN of the S3 bucket where CloudTrail delivers logs."
  type        = string
  default     = ""
}

variable "cloudtrail_kms_key_arn" {
  description = "ARN of the KMS key used by CloudTrail."
  type        = string
  default     = ""
}

variable "trusted_cicd_account_ids" {
  description = "AWS account IDs allowed to assume the CI/CD deploy role."
  type        = list(string)
  default     = []
}

variable "break_glass_trusted_arns" {
  description = "IAM ARNs (users/roles) that can assume the break-glass role."
  type        = list(string)
  default     = []
}

variable "mfa_token_age_seconds" {
  description = "Maximum age of MFA token for the break-glass role (seconds)."
  type        = number
  default     = 3600
}

variable "s3_phi_bucket_arns" {
  description = "ARNs of S3 buckets containing PHI data; granted to app roles."
  type        = list(string)
  default     = []
}

variable "secrets_manager_arns" {
  description = "ARNs of Secrets Manager secrets the app role may read."
  type        = list(string)
  default     = []
}

variable "kms_key_arns" {
  description = "ARNs of KMS keys the app roles may use for encrypt/decrypt."
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Additional tags to merge onto all resources."
  type        = map(string)
  default     = {}
}
