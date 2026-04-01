###############################################################################
# providers.tf
# Multi-cloud provider configuration for a FedRAMP/HIPAA-aligned
# Medicaid/Medicare healthcare platform.
#
# Clouds: AWS (primary), Azure (secondary), GCP (analytics/AI), OCI (DR)
###############################################################################

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    # ── AWS ────────────────────────────────────────────────────────────────
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }

    # ── Azure ──────────────────────────────────────────────────────────────
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.97"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.47"
    }

    # ── GCP ────────────────────────────────────────────────────────────────
    google = {
      source  = "hashicorp/google"
      version = "~> 5.22"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.22"
    }

    # ── OCI ────────────────────────────────────────────────────────────────
    oci = {
      source  = "oracle/oci"
      version = "~> 5.33"
    }

    # ── Utility providers ──────────────────────────────────────────────────
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.11"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

###############################################################################
# AWS Provider
###############################################################################
provider "aws" {
  region = var.aws_region

  # Assume the deployment role in the target account
  assume_role {
    role_arn     = var.aws_deploy_role_arn
    session_name = "terraform-healthcare-platform"
    external_id  = var.aws_external_id
  }

  default_tags {
    tags = {
      Project            = "medicaid-medicare-platform"
      ManagedBy          = "terraform"
      Environment        = var.environment
      CostCenter         = var.cost_center
      DataClassification = "PHI-Restricted"
      Owner              = var.owner_team
      ComplianceScope    = "FedRAMP-Moderate-HIPAA"
      LastModified       = timestamp()
    }
  }
}

# Secondary AWS provider – us-west-2 for DR / cross-region replication
provider "aws" {
  alias  = "dr"
  region = var.aws_dr_region

  assume_role {
    role_arn     = var.aws_deploy_role_arn
    session_name = "terraform-healthcare-platform-dr"
    external_id  = var.aws_external_id
  }

  default_tags {
    tags = {
      Project            = "medicaid-medicare-platform"
      ManagedBy          = "terraform"
      Environment        = "${var.environment}-dr"
      CostCenter         = var.cost_center
      DataClassification = "PHI-Restricted"
      Owner              = var.owner_team
      ComplianceScope    = "FedRAMP-Moderate-HIPAA"
    }
  }
}

###############################################################################
# Azure Provider
###############################################################################
provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
    key_vault {
      purge_soft_delete_on_destroy               = false
      recover_soft_deleted_key_vaults            = true
      purge_soft_deleted_secrets_on_destroy      = false
      purge_soft_deleted_certificates_on_destroy = false
    }
    virtual_machine {
      delete_os_disk_on_deletion     = true
      graceful_shutdown              = true
      skip_shutdown_and_force_delete = false
    }
    log_analytics_workspace {
      permanently_delete_on_destroy = false
    }
  }

  subscription_id = var.azure_subscription_id
  tenant_id       = var.azure_tenant_id
  client_id       = var.azure_client_id
  client_secret   = var.azure_client_secret

  skip_provider_registration = false
}

provider "azuread" {
  tenant_id     = var.azure_tenant_id
  client_id     = var.azure_client_id
  client_secret = var.azure_client_secret
}

###############################################################################
# GCP Provider
###############################################################################
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
  zone    = var.gcp_zone

  impersonate_service_account = var.gcp_deploy_sa_email
}

provider "google-beta" {
  project = var.gcp_project_id
  region  = var.gcp_region
  zone    = var.gcp_zone

  impersonate_service_account = var.gcp_deploy_sa_email
}

###############################################################################
# OCI Provider
###############################################################################
provider "oci" {
  tenancy_ocid     = var.oci_tenancy_ocid
  user_ocid        = var.oci_user_ocid
  fingerprint      = var.oci_fingerprint
  private_key_path = var.oci_private_key_path
  region           = var.oci_region
}
