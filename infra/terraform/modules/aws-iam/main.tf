###############################################################################
# modules/aws-iam/main.tf
#
# FedRAMP-Moderate / HIPAA-compliant IAM configuration for a
# Medicaid/Medicare healthcare platform on AWS.
#
# Resources:
#   - IAM account alias
#   - IAM password policy (FedRAMP AC-2, IA-5)
#   - IAM permission boundary policy (SCP-style guardrail)
#   - EC2 instance role + instance profile
#   - Lambda execution role
#   - ECS task role + ECS execution role
#   - CI/CD deployment role (cross-account assume)
#   - CloudTrail delivery role
#   - Break-glass emergency role (MFA required)
###############################################################################

locals {
  common_tags = merge(
    {
      Project            = "medicaid-medicare-platform"
      ManagedBy          = "terraform"
      Environment        = var.environment
      CostCenter         = var.cost_center
      DataClassification = var.data_classification
      Owner              = var.owner_team
      ComplianceScope    = var.compliance_scope
    },
    var.tags
  )

  name_prefix = "${var.environment}-healthcare"
}

data "aws_caller_identity" "current" {}
data "aws_partition" "current" {}
data "aws_region" "current" {}

###############################################################################
# IAM Account Alias
###############################################################################
resource "aws_iam_account_alias" "main" {
  account_alias = var.account_alias
}

###############################################################################
# IAM Account Password Policy (FedRAMP IA-5 compliant)
###############################################################################
resource "aws_iam_account_password_policy" "main" {
  minimum_password_length        = var.password_minimum_length
  require_uppercase_characters   = true
  require_lowercase_characters   = true
  require_numbers                = true
  require_symbols                = true
  allow_users_to_change_password = true
  hard_expiry                    = false
  max_password_age               = var.password_max_age_days
  password_reuse_prevention      = var.password_reuse_prevention
}

###############################################################################
# IAM Permission Boundary Policy
# Acts as an account-level guardrail (SCP-style), attached to all non-root roles
###############################################################################
resource "aws_iam_policy" "permission_boundary" {
  name        = "${local.name_prefix}-permission-boundary"
  path        = "/boundaries/"
  description = "Permission boundary enforcing FedRAMP guardrails. Attached to all workload IAM roles."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCoreServicesOnly"
        Effect = "Allow"
        Action = [
          "s3:*",
          "ec2:*",
          "ecs:*",
          "ecr:*",
          "lambda:*",
          "logs:*",
          "cloudwatch:*",
          "xray:*",
          "ssm:*",
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey",
          "dynamodb:*",
          "rds:*",
          "elasticache:*",
          "sqs:*",
          "sns:Publish",
          "sns:Subscribe",
          "sns:ListTopics",
          "iam:GetRole",
          "iam:ListRoles",
          "iam:PassRole",
          "sts:AssumeRole",
          "tag:GetResources",
          "health:*",
          "support:*"
        ]
        Resource = "*"
      },
      {
        Sid    = "DenyPrivilegedIAMActions"
        Effect = "Deny"
        Action = [
          "iam:CreateUser",
          "iam:DeleteUser",
          "iam:CreateAccessKey",
          "iam:AttachUserPolicy",
          "iam:PutUserPolicy",
          "iam:AddUserToGroup",
          "iam:CreateLoginProfile",
          "iam:UpdateLoginProfile",
          "iam:DeleteLoginProfile",
          "iam:CreateGroup",
          "iam:DeleteGroup",
          "iam:UpdateAccountPasswordPolicy",
          "iam:DeleteAccountPasswordPolicy",
          "iam:CreateSAMLProvider",
          "iam:DeleteSAMLProvider",
          "organizations:*",
          "account:*"
        ]
        Resource = "*"
      },
      {
        Sid    = "DenyLeaveOrganization"
        Effect = "Deny"
        Action = [
          "organizations:LeaveOrganization"
        ]
        Resource = "*"
      },
      {
        Sid    = "DenyDisableSecurityServices"
        Effect = "Deny"
        Action = [
          "cloudtrail:DeleteTrail",
          "cloudtrail:StopLogging",
          "cloudtrail:UpdateTrail",
          "config:DeleteConfigRule",
          "config:DeleteConfigurationRecorder",
          "config:DeleteDeliveryChannel",
          "config:StopConfigurationRecorder",
          "guardduty:DeleteDetector",
          "guardduty:DisassociateFromMasterAccount",
          "securityhub:DisableSecurityHub",
          "macie2:DisableMacie"
        ]
        Resource = "*"
      },
      {
        Sid    = "DenyNonApprovedRegions"
        Effect = "Deny"
        NotAction = [
          "iam:*",
          "sts:*",
          "route53:*",
          "cloudfront:*",
          "waf:*",
          "shield:*",
          "health:*",
          "support:*",
          "organizations:*",
          "account:*",
          "billing:*"
        ]
        Resource = "*"
        Condition = {
          StringNotEquals = {
            "aws:RequestedRegion" = ["us-east-1", "us-west-2", "us-gov-east-1", "us-gov-west-1"]
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

###############################################################################
# EC2 Instance Role
###############################################################################
resource "aws_iam_role" "ec2" {
  name                 = var.ec2_role_name
  path                 = "/healthcare/"
  permissions_boundary = aws_iam_policy.permission_boundary.arn
  description          = "Role for EC2 instances in the healthcare platform."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "ec2_phi_s3" {
  count = length(var.s3_phi_bucket_arns) > 0 ? 1 : 0

  name = "${var.environment}-ec2-phi-s3-access"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "PHIS3Access"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetObjectTagging",
          "s3:PutObjectTagging"
        ]
        Resource = concat(
          var.s3_phi_bucket_arns,
          [for arn in var.s3_phi_bucket_arns : "${arn}/*"]
        )
      },
      {
        Sid    = "KMSForPHI"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey"
        ]
        Resource = var.kms_key_arns
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "ec2_cw_agent" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.ec2_role_name}-instance-profile"
  path = "/healthcare/"
  role = aws_iam_role.ec2.name

  tags = local.common_tags
}

###############################################################################
# Lambda Execution Role
###############################################################################
resource "aws_iam_role" "lambda" {
  name                 = var.lambda_role_name
  path                 = "/healthcare/"
  permissions_boundary = aws_iam_policy.permission_boundary.arn
  description          = "Execution role for Lambda functions in the healthcare platform."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "lambda_phi" {
  name = "${var.environment}-lambda-phi-access"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerRead"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = length(var.secrets_manager_arns) > 0 ? var.secrets_manager_arns : ["arn:${data.aws_partition.current.partition}:secretsmanager:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:secret:${var.environment}/healthcare/*"]
      },
      {
        Sid    = "KMSDecrypt"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey"
        ]
        Resource = length(var.kms_key_arns) > 0 ? var.kms_key_arns : ["*"]
      },
      {
        Sid    = "XRayTracing"
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords",
          "xray:GetSamplingRules",
          "xray:GetSamplingTargets"
        ]
        Resource = "*"
      }
    ]
  })
}

###############################################################################
# ECS Task Role (application permissions)
###############################################################################
resource "aws_iam_role" "ecs_task" {
  name                 = var.ecs_task_role_name
  path                 = "/healthcare/"
  permissions_boundary = aws_iam_policy.permission_boundary.arn
  description          = "IAM role for ECS task containers (application-level permissions)."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          }
          ArnLike = {
            "aws:SourceArn" = "arn:${data.aws_partition.current.partition}:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*"
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "ecs_task_app" {
  name = "${var.environment}-ecs-task-app-policy"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "PHIBucketAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetObjectVersion"
        ]
        Resource = length(var.s3_phi_bucket_arns) > 0 ? concat(
          var.s3_phi_bucket_arns,
          [for arn in var.s3_phi_bucket_arns : "${arn}/*"]
        ) : ["arn:${data.aws_partition.current.partition}:s3:::${var.environment}-healthcare-*/*"]
      },
      {
        Sid    = "SecretsRead"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:${data.aws_partition.current.partition}:secretsmanager:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:secret:${var.environment}/healthcare/*"
      },
      {
        Sid    = "KMSOperations"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:GenerateDataKeyWithoutPlaintext",
          "kms:DescribeKey",
          "kms:ReEncryptFrom",
          "kms:ReEncryptTo"
        ]
        Resource = length(var.kms_key_arns) > 0 ? var.kms_key_arns : ["*"]
      },
      {
        Sid    = "SQSMessaging"
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl",
          "sqs:ChangeMessageVisibility"
        ]
        Resource = "arn:${data.aws_partition.current.partition}:sqs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${var.environment}-healthcare-*"
      },
      {
        Sid    = "CloudWatchMetrics"
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricData",
          "cloudwatch:GetMetricStatistics"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "Healthcare/Application"
          }
        }
      },
      {
        Sid    = "XRayTracing"
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords",
          "xray:GetSamplingRules",
          "xray:GetSamplingTargets"
        ]
        Resource = "*"
      }
    ]
  })
}

###############################################################################
# ECS Execution Role (ECR pull, CloudWatch logs)
###############################################################################
resource "aws_iam_role" "ecs_execution" {
  name                 = var.ecs_execution_role_name
  path                 = "/healthcare/"
  permissions_boundary = aws_iam_policy.permission_boundary.arn
  description          = "ECS task execution role for ECR image pulling and CloudWatch log creation."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "ecs_execution_managed" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_execution_secrets" {
  name = "${var.environment}-ecs-execution-secrets"
  role = aws_iam_role.ecs_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerForECS"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:${data.aws_partition.current.partition}:secretsmanager:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:secret:${var.environment}/healthcare/*"
      },
      {
        Sid    = "KMSForECR"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = length(var.kms_key_arns) > 0 ? var.kms_key_arns : ["*"]
      }
    ]
  })
}

###############################################################################
# CI/CD Deployment Role
###############################################################################
resource "aws_iam_role" "cicd" {
  name                 = var.cicd_role_name
  path                 = "/cicd/"
  permissions_boundary = aws_iam_policy.permission_boundary.arn
  description          = "Least-privilege role for CI/CD pipelines to deploy healthcare platform resources."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCrossAccountAssume"
        Effect = "Allow"
        Principal = {
          AWS = length(var.trusted_cicd_account_ids) > 0 ? [
            for acct in var.trusted_cicd_account_ids :
            "arn:${data.aws_partition.current.partition}:iam::${acct}:root"
          ] : ["arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:root"]
        }
        Action = "sts:AssumeRole"
        Condition = {
          Bool = {
            "aws:MultiFactorAuthPresent" = "true"
          }
          StringEquals = {
            "sts:ExternalId" = "${var.environment}-cicd-deploy"
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "cicd_deploy" {
  name = "${var.environment}-cicd-deploy-policy"
  role = aws_iam_role.cicd.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ECSDeployments"
        Effect = "Allow"
        Action = [
          "ecs:RegisterTaskDefinition",
          "ecs:DeregisterTaskDefinition",
          "ecs:DescribeTaskDefinition",
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeClusters",
          "ecs:ListClusters",
          "ecs:ListServices"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "aws:RequestedRegion" = ["us-east-1", "us-west-2"]
          }
        }
      },
      {
        Sid    = "ECRImagePush"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:DescribeRepositories",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:ListImages"
        ]
        Resource = "*"
      },
      {
        Sid    = "LambdaDeployment"
        Effect = "Allow"
        Action = [
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "lambda:PublishVersion",
          "lambda:CreateAlias",
          "lambda:UpdateAlias",
          "lambda:GetFunction",
          "lambda:GetFunctionConfiguration",
          "lambda:ListVersionsByFunction"
        ]
        Resource = "arn:${data.aws_partition.current.partition}:lambda:*:${data.aws_caller_identity.current.account_id}:function:${var.environment}-healthcare-*"
      },
      {
        Sid    = "S3ArtifactAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:${data.aws_partition.current.partition}:s3:::${var.environment}-healthcare-artifacts",
          "arn:${data.aws_partition.current.partition}:s3:::${var.environment}-healthcare-artifacts/*"
        ]
      },
      {
        Sid    = "IAMPassRole"
        Effect = "Allow"
        Action = "iam:PassRole"
        Resource = [
          aws_iam_role.ecs_task.arn,
          aws_iam_role.ecs_execution.arn,
          aws_iam_role.lambda.arn
        ]
      },
      {
        Sid    = "ReadOnlyAccess"
        Effect = "Allow"
        Action = [
          "ec2:Describe*",
          "elasticloadbalancing:Describe*",
          "cloudformation:DescribeStacks",
          "cloudformation:DescribeStackEvents",
          "cloudformation:GetTemplate",
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "*"
      },
      {
        Sid    = "DenyProductionDestruction"
        Effect = "Deny"
        Action = [
          "ec2:TerminateInstances",
          "rds:DeleteDBInstance",
          "rds:DeleteDBCluster",
          "dynamodb:DeleteTable",
          "s3:DeleteBucket",
          "elasticache:DeleteCacheCluster",
          "ecs:DeleteCluster",
          "ecs:DeleteService"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "aws:ResourceTag/Environment" = "prod"
          }
        }
      }
    ]
  })
}

###############################################################################
# CloudTrail IAM Role
###############################################################################
resource "aws_iam_role" "cloudtrail" {
  name        = var.cloudtrail_role_name
  path        = "/security/"
  description = "IAM role for CloudTrail to deliver logs to CloudWatch and S3."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "cloudtrail_logs" {
  name = "${var.environment}-cloudtrail-logs-policy"
  role = aws_iam_role.cloudtrail.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailCreateLogStream"
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream"
        ]
        Resource = "arn:${data.aws_partition.current.partition}:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/cloudtrail/${var.environment}:log-stream:*"
      },
      {
        Sid    = "AWSCloudTrailPutLogEvents"
        Effect = "Allow"
        Action = [
          "logs:PutLogEvents"
        ]
        Resource = "arn:${data.aws_partition.current.partition}:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/cloudtrail/${var.environment}:log-stream:*"
      }
    ]
  })
}

###############################################################################
# Break-Glass Emergency Access Role (FedRAMP IR-6, IR-7)
# Requires MFA. Usage triggers CloudWatch alarm via CloudTrail.
###############################################################################
resource "aws_iam_role" "break_glass" {
  name        = var.break_glass_role_name
  path        = "/emergency/"
  description = "Emergency break-glass role. MFA required. Usage is audited."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowBreakGlassAssumeWithMFA"
        Effect = "Allow"
        Principal = {
          AWS = length(var.break_glass_trusted_arns) > 0 ? var.break_glass_trusted_arns : [
            "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:root"
          ]
        }
        Action = "sts:AssumeRole"
        Condition = {
          Bool = {
            "aws:MultiFactorAuthPresent" = "true"
          }
          NumericLessThan = {
            "aws:MultiFactorAuthAge" = tostring(var.mfa_token_age_seconds)
          }
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    SensitivityLevel = "CRITICAL"
    AuditRequired    = "true"
    EmergencyAccess  = "true"
  })
}

resource "aws_iam_role_policy" "break_glass_full_access" {
  name = "${var.environment}-break-glass-policy"
  role = aws_iam_role.break_glass.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "EmergencyFullAccess"
        Effect   = "Allow"
        Action   = "*"
        Resource = "*"
      },
      {
        Sid    = "CannotModifyBreakGlassRole"
        Effect = "Deny"
        Action = [
          "iam:DeleteRole",
          "iam:DeleteRolePolicy",
          "iam:DetachRolePolicy",
          "iam:UpdateRole",
          "iam:UpdateAssumeRolePolicy"
        ]
        Resource = [
          "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:role/emergency/${var.break_glass_role_name}"
        ]
      },
      {
        Sid    = "CannotDisableCloudTrail"
        Effect = "Deny"
        Action = [
          "cloudtrail:DeleteTrail",
          "cloudtrail:StopLogging",
          "cloudtrail:UpdateTrail"
        ]
        Resource = "*"
      }
    ]
  })
}

# CloudWatch alarm: alert security team when break-glass role is assumed
resource "aws_cloudwatch_metric_alarm" "break_glass_usage" {
  alarm_name          = "${var.environment}-break-glass-role-assumed"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "BreakGlassRoleAssumptions"
  namespace           = "Healthcare/Security"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "CRITICAL: Break-glass emergency role has been assumed. Incident response required."
  treat_missing_data  = "notBreaching"

  alarm_actions = []  # populated by security module SNS ARN

  tags = merge(local.common_tags, {
    SensitivityLevel = "CRITICAL"
  })
}
