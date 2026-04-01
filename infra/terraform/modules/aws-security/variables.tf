###############################################################################
# modules/aws-security/variables.tf
###############################################################################

variable "environment" {
  description = "Deployment environment (prod, staging, dev)."
  type        = string
}

variable "aws_region" {
  description = "AWS region for security resources."
  type        = string
  default     = "us-east-1"
}

variable "cost_center" {
  description = "Cost center for billing allocation."
  type        = string
  default     = "HEALTHCARE-OPS"
}

variable "owner_team" {
  description = "Team responsible for security resources."
  type        = string
  default     = "security-engineering"
}

variable "compliance_scope" {
  description = "Compliance frameworks in scope."
  type        = string
  default     = "FedRAMP-Moderate-HIPAA"
}

variable "data_classification" {
  description = "Data classification label."
  type        = string
  default     = "PHI-Restricted"
}

variable "cloudtrail_log_retention_days" {
  description = "Retention period for CloudTrail CloudWatch logs (days)."
  type        = number
  default     = 2555 # 7 years for HIPAA

  validation {
    condition     = var.cloudtrail_log_retention_days >= 365
    error_message = "HIPAA requires at least 365 days of log retention."
  }
}

variable "cloudtrail_s3_lifecycle_days" {
  description = "Days before CloudTrail logs are moved to Glacier Instant Retrieval."
  type        = number
  default     = 90
}

variable "cloudtrail_s3_expiration_days" {
  description = "Days before CloudTrail S3 objects expire (0 = never)."
  type        = number
  default     = 2555
}

variable "kms_deletion_window_days" {
  description = "Waiting period in days before KMS key deletion (7-30)."
  type        = number
  default     = 30

  validation {
    condition     = var.kms_deletion_window_days >= 7 && var.kms_deletion_window_days <= 30
    error_message = "kms_deletion_window_days must be between 7 and 30."
  }
}

variable "security_alert_emails" {
  description = "Email addresses to receive SNS security alerts."
  type        = list(string)
  default     = []
}

variable "guardduty_finding_publishing_frequency" {
  description = "How frequently GuardDuty sends updated findings (FIFTEEN_MINUTES, ONE_HOUR, SIX_HOURS)."
  type        = string
  default     = "FIFTEEN_MINUTES"

  validation {
    condition     = contains(["FIFTEEN_MINUTES", "ONE_HOUR", "SIX_HOURS"], var.guardduty_finding_publishing_frequency)
    error_message = "Must be FIFTEEN_MINUTES, ONE_HOUR, or SIX_HOURS."
  }
}

variable "macie_finding_publishing_frequency" {
  description = "How frequently Macie publishes findings."
  type        = string
  default     = "FIFTEEN_MINUTES"
}

variable "enable_security_hub" {
  description = "Whether to enable AWS Security Hub."
  type        = bool
  default     = true
}

variable "enable_guardduty" {
  description = "Whether to enable AWS GuardDuty."
  type        = bool
  default     = true
}

variable "enable_macie" {
  description = "Whether to enable AWS Macie (required for PHI/PII detection)."
  type        = bool
  default     = true
}

variable "enable_inspector" {
  description = "Whether to enable AWS Inspector v2."
  type        = bool
  default     = true
}

variable "enable_config" {
  description = "Whether to enable AWS Config."
  type        = bool
  default     = true
}

variable "enable_waf" {
  description = "Whether to create WAF v2 WebACL."
  type        = bool
  default     = true
}

variable "waf_alb_arn" {
  description = "ARN of the ALB to associate with the WAF WebACL (optional)."
  type        = string
  default     = ""
}

variable "config_s3_bucket_name_override" {
  description = "Optional override for the AWS Config delivery S3 bucket name."
  type        = string
  default     = ""
}

variable "cloudtrail_role_arn" {
  description = "ARN of the IAM role for CloudTrail CloudWatch Logs delivery."
  type        = string
  default     = ""
}

variable "vpc_id" {
  description = "VPC ID for Config rules that inspect VPC resources."
  type        = string
  default     = ""
}

variable "tags" {
  description = "Additional tags to merge onto all resources."
  type        = map(string)
  default     = {}
}
