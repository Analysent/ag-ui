###############################################################################
# modules/aws-networking/variables.tf
###############################################################################

variable "vpc_cidr" {
  description = "Primary CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "vpc_cidr must be a valid IPv4 CIDR block."
  }
}

variable "environment" {
  description = "Deployment environment (prod, staging, dev)."
  type        = string

  validation {
    condition     = contains(["prod", "staging", "dev", "sandbox"], var.environment)
    error_message = "environment must be one of: prod, staging, dev, sandbox."
  }
}

variable "aws_region" {
  description = "AWS region where networking resources are deployed."
  type        = string
  default     = "us-east-1"
}

variable "availability_zones" {
  description = "List of three availability zones to use for HA deployments."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]

  validation {
    condition     = length(var.availability_zones) == 3
    error_message = "Exactly 3 availability zones are required for HA."
  }
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)."
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24"]

  validation {
    condition     = length(var.public_subnet_cidrs) == 3
    error_message = "Exactly 3 public subnet CIDRs required."
  }
}

variable "private_app_subnet_cidrs" {
  description = "CIDR blocks for private application-tier subnets (one per AZ)."
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]

  validation {
    condition     = length(var.private_app_subnet_cidrs) == 3
    error_message = "Exactly 3 private app subnet CIDRs required."
  }
}

variable "private_data_subnet_cidrs" {
  description = "CIDR blocks for private data-tier subnets (one per AZ). Hosts PHI databases."
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24", "10.0.22.0/24"]

  validation {
    condition     = length(var.private_data_subnet_cidrs) == 3
    error_message = "Exactly 3 private data subnet CIDRs required."
  }
}

variable "private_mgmt_subnet_cidrs" {
  description = "CIDR blocks for management/bastion subnets (one per AZ)."
  type        = list(string)
  default     = ["10.0.30.0/28", "10.0.31.0/28", "10.0.32.0/28"]
}

variable "transit_gateway_id" {
  description = "ID of the Transit Gateway to attach this VPC to (for hybrid/multi-account connectivity)."
  type        = string
  default     = ""
}

variable "transit_gateway_route_table_id" {
  description = "ID of the Transit Gateway route table for association."
  type        = string
  default     = ""
}

variable "cloudwatch_log_retention_days" {
  description = "Retention in days for VPC Flow Logs CloudWatch log group."
  type        = number
  default     = 365

  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.cloudwatch_log_retention_days)
    error_message = "cloudwatch_log_retention_days must be a valid CloudWatch retention value."
  }
}

variable "flow_log_traffic_type" {
  description = "Type of traffic to capture in VPC Flow Logs (ALL, ACCEPT, REJECT)."
  type        = string
  default     = "ALL"

  validation {
    condition     = contains(["ALL", "ACCEPT", "REJECT"], var.flow_log_traffic_type)
    error_message = "flow_log_traffic_type must be ALL, ACCEPT, or REJECT."
  }
}

variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH into bastion/management instances."
  type        = list(string)
  default     = []
}

variable "cost_center" {
  description = "Cost center code for billing allocation."
  type        = string
  default     = "HEALTHCARE-OPS"
}

variable "data_classification" {
  description = "Data classification label for compliance tagging."
  type        = string
  default     = "PHI-Restricted"
}

variable "owner_team" {
  description = "Team responsible for these resources."
  type        = string
  default     = "platform-engineering"
}

variable "compliance_scope" {
  description = "Compliance frameworks in scope (e.g., FedRAMP-Moderate-HIPAA)."
  type        = string
  default     = "FedRAMP-Moderate-HIPAA"
}

variable "enable_nat_gateway" {
  description = "Whether to provision NAT Gateways (one per AZ for HA)."
  type        = bool
  default     = true
}

variable "enable_vpc_endpoints" {
  description = "Whether to create VPC Endpoints for S3 and SSM."
  type        = bool
  default     = true
}

variable "enable_flow_logs" {
  description = "Whether to enable VPC Flow Logs to CloudWatch."
  type        = bool
  default     = true
}

variable "kms_key_arn" {
  description = "ARN of the KMS key used to encrypt CloudWatch Log Group for VPC Flow Logs."
  type        = string
  default     = ""
}

variable "tags" {
  description = "Additional tags to merge onto all resources."
  type        = map(string)
  default     = {}
}
