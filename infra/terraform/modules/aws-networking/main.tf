###############################################################################
# modules/aws-networking/main.tf
#
# Production-grade AWS networking for a FedRAMP-Moderate / HIPAA-aligned
# Medicaid/Medicare healthcare platform.
#
# Resources provisioned:
#   - VPC (10.0.0.0/16)
#   - Public, private-app, private-data, private-mgmt subnets across 3 AZs
#   - Internet Gateway
#   - NAT Gateways (one per AZ for high availability)
#   - VPC Flow Logs → CloudWatch Logs (IAM role + CW log group)
#   - VPC Endpoints: S3 (gateway), SSM / SSMMessages / EC2Messages (interface)
#   - Transit Gateway attachment
#   - Network ACLs for public and private subnets
#   - Route tables (public, private-per-AZ)
#   - FedRAMP/HIPAA compliance tags on every resource
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
}

###############################################################################
# VPC
###############################################################################
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.common_tags, {
    Name = "${var.environment}-healthcare-vpc"
  })
}

###############################################################################
# Internet Gateway
###############################################################################
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.common_tags, {
    Name = "${var.environment}-igw"
  })
}

###############################################################################
# Public Subnets (one per AZ)
###############################################################################
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = false # explicitly controlled; ALB/NAT EIPs used instead

  tags = merge(local.common_tags, {
    Name                     = "${var.environment}-public-${var.availability_zones[count.index]}"
    SubnetTier               = "public"
    "kubernetes.io/role/elb" = "1" # reserved for future EKS ALB controller
  })
}

###############################################################################
# Private Application Subnets (one per AZ)
###############################################################################
resource "aws_subnet" "private_app" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_app_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(local.common_tags, {
    Name                              = "${var.environment}-private-app-${var.availability_zones[count.index]}"
    SubnetTier                        = "private-app"
    "kubernetes.io/role/internal-elb" = "1"
  })
}

###############################################################################
# Private Data Subnets (one per AZ) – hosts PHI databases
###############################################################################
resource "aws_subnet" "private_data" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_data_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(local.common_tags, {
    Name       = "${var.environment}-private-data-${var.availability_zones[count.index]}"
    SubnetTier = "private-data"
    PHIHosted  = "true"
  })
}

###############################################################################
# Private Management Subnets (one per AZ) – bastion / Systems Manager
###############################################################################
resource "aws_subnet" "private_mgmt" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_mgmt_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(local.common_tags, {
    Name       = "${var.environment}-private-mgmt-${var.availability_zones[count.index]}"
    SubnetTier = "private-mgmt"
  })
}

###############################################################################
# Elastic IPs for NAT Gateways
###############################################################################
resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? length(var.availability_zones) : 0
  domain = "vpc"

  tags = merge(local.common_tags, {
    Name = "${var.environment}-nat-eip-${var.availability_zones[count.index]}"
  })

  depends_on = [aws_internet_gateway.main]
}

###############################################################################
# NAT Gateways (one per AZ for HA)
###############################################################################
resource "aws_nat_gateway" "main" {
  count = var.enable_nat_gateway ? length(var.availability_zones) : 0

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  connectivity_type = "public"

  tags = merge(local.common_tags, {
    Name = "${var.environment}-natgw-${var.availability_zones[count.index]}"
  })

  depends_on = [aws_internet_gateway.main]
}

###############################################################################
# Route Tables – Public
###############################################################################
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(local.common_tags, {
    Name = "${var.environment}-rt-public"
  })
}

resource "aws_route_table_association" "public" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

###############################################################################
# Route Tables – Private (one per AZ, routes to AZ-local NAT GW)
###############################################################################
resource "aws_route_table" "private_app" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.main.id

  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.main[count.index].id
    }
  }

  tags = merge(local.common_tags, {
    Name = "${var.environment}-rt-private-app-${var.availability_zones[count.index]}"
  })
}

resource "aws_route_table_association" "private_app" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private_app[count.index].id
}

resource "aws_route_table" "private_data" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.main.id

  # Data tier: no direct internet – only via NAT if patches required
  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.main[count.index].id
    }
  }

  tags = merge(local.common_tags, {
    Name = "${var.environment}-rt-private-data-${var.availability_zones[count.index]}"
  })
}

resource "aws_route_table_association" "private_data" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.private_data[count.index].id
  route_table_id = aws_route_table.private_data[count.index].id
}

resource "aws_route_table" "private_mgmt" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.main.id

  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.main[count.index].id
    }
  }

  tags = merge(local.common_tags, {
    Name = "${var.environment}-rt-private-mgmt-${var.availability_zones[count.index]}"
  })
}

resource "aws_route_table_association" "private_mgmt" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.private_mgmt[count.index].id
  route_table_id = aws_route_table.private_mgmt[count.index].id
}

###############################################################################
# VPC Flow Logs → CloudWatch
###############################################################################
resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  count = var.enable_flow_logs ? 1 : 0

  name              = "/aws/vpc/flowlogs/${var.environment}-healthcare-vpc"
  retention_in_days = var.cloudwatch_log_retention_days
  kms_key_id        = var.kms_key_arn != "" ? var.kms_key_arn : null

  tags = merge(local.common_tags, {
    Name = "${var.environment}-vpc-flow-logs"
  })
}

resource "aws_iam_role" "vpc_flow_log" {
  count = var.enable_flow_logs ? 1 : 0

  name = "${var.environment}-vpc-flow-log-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
        Action = "sts:AssumeRole"
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "vpc_flow_log" {
  count = var.enable_flow_logs ? 1 : 0

  name = "${var.environment}-vpc-flow-log-policy"
  role = aws_iam_role.vpc_flow_log[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "${aws_cloudwatch_log_group.vpc_flow_logs[0].arn}:*"
      }
    ]
  })
}

resource "aws_flow_log" "main" {
  count = var.enable_flow_logs ? 1 : 0

  vpc_id          = aws_vpc.main.id
  traffic_type    = var.flow_log_traffic_type
  iam_role_arn    = aws_iam_role.vpc_flow_log[0].arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs[0].arn

  tags = merge(local.common_tags, {
    Name = "${var.environment}-vpc-flow-log"
  })
}

###############################################################################
# Data Sources
###############################################################################
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

###############################################################################
# VPC Endpoints – S3 (Gateway) – no internet traversal for S3 traffic
###############################################################################
resource "aws_vpc_endpoint" "s3" {
  count = var.enable_vpc_endpoints ? 1 : 0

  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${data.aws_region.current.name}.s3"
  vpc_endpoint_type = "Gateway"

  route_table_ids = concat(
    aws_route_table.public[*].id,
    aws_route_table.private_app[*].id,
    aws_route_table.private_data[*].id,
    aws_route_table.private_mgmt[*].id,
  )

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowAccessFromVPC"
        Effect    = "Allow"
        Principal = "*"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "aws:PrincipalAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${var.environment}-vpce-s3"
  })
}

###############################################################################
# VPC Endpoints – SSM Interface (required for Session Manager, no bastion host)
###############################################################################
resource "aws_security_group" "vpc_endpoints" {
  count = var.enable_vpc_endpoints ? 1 : 0

  name        = "${var.environment}-vpce-sg"
  description = "Allow HTTPS from within VPC to VPC Interface Endpoints"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS from VPC CIDR"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.environment}-vpce-sg"
  })
}

locals {
  ssm_endpoint_services = [
    "ssm",
    "ssmmessages",
    "ec2messages",
    "ecr.api",
    "ecr.dkr",
    "logs",
    "kms",
    "secretsmanager",
  ]
}

resource "aws_vpc_endpoint" "ssm_interfaces" {
  count = var.enable_vpc_endpoints ? length(local.ssm_endpoint_services) : 0

  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.${local.ssm_endpoint_services[count.index]}"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  subnet_ids = aws_subnet.private_mgmt[*].id
  security_group_ids = [
    aws_security_group.vpc_endpoints[0].id
  ]

  tags = merge(local.common_tags, {
    Name = "${var.environment}-vpce-${local.ssm_endpoint_services[count.index]}"
  })
}

###############################################################################
# Transit Gateway Attachment (optional – for cross-account / hybrid connectivity)
###############################################################################
resource "aws_ec2_transit_gateway_vpc_attachment" "main" {
  count = var.transit_gateway_id != "" ? 1 : 0

  transit_gateway_id = var.transit_gateway_id
  vpc_id             = aws_vpc.main.id

  subnet_ids = aws_subnet.private_app[*].id

  dns_support                                     = "enable"
  ipv6_support                                    = "disable"
  transit_gateway_default_route_table_association = false
  transit_gateway_default_route_table_propagation = false

  tags = merge(local.common_tags, {
    Name = "${var.environment}-tgw-attachment"
  })
}

resource "aws_ec2_transit_gateway_route_table_association" "main" {
  count = (var.transit_gateway_id != "" && var.transit_gateway_route_table_id != "") ? 1 : 0

  transit_gateway_attachment_id  = aws_ec2_transit_gateway_vpc_attachment.main[0].id
  transit_gateway_route_table_id = var.transit_gateway_route_table_id
}

###############################################################################
# Network ACL – Public Subnets
# Restricts to HTTPS inbound + ephemeral return traffic; SSH blocked at NACL
###############################################################################
resource "aws_network_acl" "public" {
  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.public[*].id

  # Inbound: HTTPS
  ingress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 443
    to_port    = 443
  }

  # Inbound: HTTP (redirect to HTTPS handled at ALB)
  ingress {
    rule_no    = 110
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 80
    to_port    = 80
  }

  # Inbound: Ephemeral return traffic
  ingress {
    rule_no    = 200
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024
    to_port    = 65535
  }

  # Inbound: ICMP for health-check/diagnostics (internal only)
  ingress {
    rule_no    = 300
    protocol   = "icmp"
    action     = "allow"
    cidr_block = var.vpc_cidr
    from_port  = 0
    to_port    = 0
    icmp_type  = -1
    icmp_code  = -1
  }

  # Outbound: HTTPS
  egress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 443
    to_port    = 443
  }

  # Outbound: HTTP (for package managers, OS updates via NAT)
  egress {
    rule_no    = 110
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 80
    to_port    = 80
  }

  # Outbound: Ephemeral return traffic
  egress {
    rule_no    = 200
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024
    to_port    = 65535
  }

  tags = merge(local.common_tags, {
    Name = "${var.environment}-nacl-public"
  })
}

###############################################################################
# Network ACL – Private Subnets (app + data + mgmt)
###############################################################################
resource "aws_network_acl" "private" {
  vpc_id = aws_vpc.main.id
  subnet_ids = concat(
    aws_subnet.private_app[*].id,
    aws_subnet.private_data[*].id,
    aws_subnet.private_mgmt[*].id,
  )

  # Inbound: All traffic from within the VPC
  ingress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"
    cidr_block = var.vpc_cidr
    from_port  = 0
    to_port    = 65535
  }

  # Inbound: Ephemeral (return from NAT GW / internet)
  ingress {
    rule_no    = 200
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024
    to_port    = 65535
  }

  # Inbound: ICMP from VPC
  ingress {
    rule_no    = 300
    protocol   = "icmp"
    action     = "allow"
    cidr_block = var.vpc_cidr
    from_port  = 0
    to_port    = 0
    icmp_type  = -1
    icmp_code  = -1
  }

  # Outbound: All traffic to VPC
  egress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"
    cidr_block = var.vpc_cidr
    from_port  = 0
    to_port    = 65535
  }

  # Outbound: HTTPS (to NAT GW → internet for patches/ECR)
  egress {
    rule_no    = 200
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 443
    to_port    = 443
  }

  # Outbound: HTTP (OS package repos)
  egress {
    rule_no    = 210
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 80
    to_port    = 80
  }

  # Outbound: Ephemeral
  egress {
    rule_no    = 300
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024
    to_port    = 65535
  }

  tags = merge(local.common_tags, {
    Name = "${var.environment}-nacl-private"
  })
}

###############################################################################
# Default Security Group – deny all (defence-in-depth)
###############################################################################
resource "aws_default_security_group" "default" {
  vpc_id = aws_vpc.main.id

  # No ingress or egress rules – effectively deny all
  tags = merge(local.common_tags, {
    Name = "${var.environment}-default-sg-deny-all"
  })
}
