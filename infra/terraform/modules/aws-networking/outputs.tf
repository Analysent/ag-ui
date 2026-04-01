###############################################################################
# modules/aws-networking/outputs.tf
###############################################################################

output "vpc_id" {
  description = "ID of the healthcare VPC."
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "Primary CIDR block of the VPC."
  value       = aws_vpc.main.cidr_block
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway."
  value       = aws_internet_gateway.main.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs (one per AZ)."
  value       = aws_subnet.public[*].id
}

output "public_subnet_cidrs" {
  description = "List of public subnet CIDR blocks."
  value       = aws_subnet.public[*].cidr_block
}

output "private_app_subnet_ids" {
  description = "List of private application-tier subnet IDs (one per AZ)."
  value       = aws_subnet.private_app[*].id
}

output "private_app_subnet_cidrs" {
  description = "List of private application-tier subnet CIDR blocks."
  value       = aws_subnet.private_app[*].cidr_block
}

output "private_data_subnet_ids" {
  description = "List of private data-tier subnet IDs (PHI databases). One per AZ."
  value       = aws_subnet.private_data[*].id
}

output "private_data_subnet_cidrs" {
  description = "List of private data-tier subnet CIDR blocks."
  value       = aws_subnet.private_data[*].cidr_block
}

output "private_mgmt_subnet_ids" {
  description = "List of private management subnet IDs (bastion/SSM). One per AZ."
  value       = aws_subnet.private_mgmt[*].id
}

output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs (one per AZ)."
  value       = aws_nat_gateway.main[*].id
}

output "nat_gateway_public_ips" {
  description = "Public Elastic IPs associated with NAT Gateways."
  value       = aws_eip.nat[*].public_ip
}

output "public_route_table_id" {
  description = "ID of the public route table."
  value       = aws_route_table.public.id
}

output "private_app_route_table_ids" {
  description = "List of private app route table IDs (one per AZ)."
  value       = aws_route_table.private_app[*].id
}

output "private_data_route_table_ids" {
  description = "List of private data route table IDs (one per AZ)."
  value       = aws_route_table.private_data[*].id
}

output "private_mgmt_route_table_ids" {
  description = "List of private management route table IDs (one per AZ)."
  value       = aws_route_table.private_mgmt[*].id
}

output "vpc_flow_log_group_name" {
  description = "Name of the CloudWatch Log Group for VPC Flow Logs."
  value       = var.enable_flow_logs ? aws_cloudwatch_log_group.vpc_flow_logs[0].name : null
}

output "vpc_flow_log_group_arn" {
  description = "ARN of the CloudWatch Log Group for VPC Flow Logs."
  value       = var.enable_flow_logs ? aws_cloudwatch_log_group.vpc_flow_logs[0].arn : null
}

output "vpc_flow_log_id" {
  description = "ID of the VPC Flow Log resource."
  value       = var.enable_flow_logs ? aws_flow_log.main[0].id : null
}

output "s3_vpc_endpoint_id" {
  description = "ID of the S3 Gateway VPC Endpoint."
  value       = var.enable_vpc_endpoints ? aws_vpc_endpoint.s3[0].id : null
}

output "ssm_vpc_endpoint_ids" {
  description = "IDs of the SSM/EC2Messages/SSMMessages interface VPC Endpoints."
  value       = var.enable_vpc_endpoints ? aws_vpc_endpoint.ssm_interfaces[*].id : []
}

output "vpc_endpoint_security_group_id" {
  description = "Security group ID attached to VPC Interface Endpoints."
  value       = var.enable_vpc_endpoints ? aws_security_group.vpc_endpoints[0].id : null
}

output "transit_gateway_attachment_id" {
  description = "ID of the Transit Gateway VPC attachment (empty string if not configured)."
  value       = var.transit_gateway_id != "" ? aws_ec2_transit_gateway_vpc_attachment.main[0].id : ""
}

output "public_nacl_id" {
  description = "ID of the Network ACL applied to public subnets."
  value       = aws_network_acl.public.id
}

output "private_nacl_id" {
  description = "ID of the Network ACL applied to private subnets."
  value       = aws_network_acl.private.id
}

output "availability_zones" {
  description = "Availability zones used by this module."
  value       = var.availability_zones
}

output "all_private_subnet_ids" {
  description = "Flat list of all private subnet IDs (app + data + mgmt)."
  value = concat(
    aws_subnet.private_app[*].id,
    aws_subnet.private_data[*].id,
    aws_subnet.private_mgmt[*].id,
  )
}
