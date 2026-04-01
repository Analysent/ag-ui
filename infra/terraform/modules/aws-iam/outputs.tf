###############################################################################
# modules/aws-iam/outputs.tf
###############################################################################

output "permission_boundary_arn" {
  description = "ARN of the IAM permission boundary policy (attach to all workload roles)."
  value       = aws_iam_policy.permission_boundary.arn
}

output "ec2_role_arn" {
  description = "ARN of the EC2 instance IAM role."
  value       = aws_iam_role.ec2.arn
}

output "ec2_role_name" {
  description = "Name of the EC2 instance IAM role."
  value       = aws_iam_role.ec2.name
}

output "ec2_instance_profile_arn" {
  description = "ARN of the EC2 instance profile."
  value       = aws_iam_instance_profile.ec2.arn
}

output "ec2_instance_profile_name" {
  description = "Name of the EC2 instance profile."
  value       = aws_iam_instance_profile.ec2.name
}

output "lambda_role_arn" {
  description = "ARN of the Lambda execution IAM role."
  value       = aws_iam_role.lambda.arn
}

output "lambda_role_name" {
  description = "Name of the Lambda execution IAM role."
  value       = aws_iam_role.lambda.name
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role (application permissions)."
  value       = aws_iam_role.ecs_task.arn
}

output "ecs_task_role_name" {
  description = "Name of the ECS task role."
  value       = aws_iam_role.ecs_task.name
}

output "ecs_execution_role_arn" {
  description = "ARN of the ECS task execution role (ECR pull, CloudWatch logs)."
  value       = aws_iam_role.ecs_execution.arn
}

output "ecs_execution_role_name" {
  description = "Name of the ECS task execution role."
  value       = aws_iam_role.ecs_execution.name
}

output "cicd_role_arn" {
  description = "ARN of the CI/CD deployment role."
  value       = aws_iam_role.cicd.arn
}

output "cicd_role_name" {
  description = "Name of the CI/CD deployment role."
  value       = aws_iam_role.cicd.name
}

output "cloudtrail_role_arn" {
  description = "ARN of the CloudTrail log delivery role."
  value       = aws_iam_role.cloudtrail.arn
}

output "cloudtrail_role_name" {
  description = "Name of the CloudTrail log delivery role."
  value       = aws_iam_role.cloudtrail.name
}

output "break_glass_role_arn" {
  description = "ARN of the break-glass emergency access role. Treat as highly sensitive."
  value       = aws_iam_role.break_glass.arn
  sensitive   = true
}

output "break_glass_role_name" {
  description = "Name of the break-glass emergency access role."
  value       = aws_iam_role.break_glass.name
}

output "account_alias" {
  description = "The configured AWS account alias."
  value       = aws_iam_account_alias.main.account_alias
}
