import { CategoryMeta, Resource } from "@/types";

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "policy-engines",
    label: "Policy Engines",
    description: "Tools for defining and enforcing compliance policies as code",
    icon: "Shield",
    color: "blue",
  },
  {
    id: "iac-scanners",
    label: "IaC Security Scanners",
    description:
      "Static analysis and security testing tools for Infrastructure as Code",
    icon: "Search",
    color: "orange",
  },
  {
    id: "cspm",
    label: "CSPM Tools",
    description:
      "Cloud Security Posture Management tools for runtime cloud compliance",
    icon: "Cloud",
    color: "purple",
  },
  {
    id: "compliance-frameworks",
    label: "Compliance Frameworks",
    description:
      "Industry standards and regulatory frameworks mapped to cloud controls",
    icon: "FileText",
    color: "green",
  },
  {
    id: "automation-platforms",
    label: "Automation Platforms",
    description:
      "CI/CD and GitOps platforms for automating infrastructure governance",
    icon: "Zap",
    color: "yellow",
  },
  {
    id: "drift-detection",
    label: "Drift Detection",
    description:
      "Tools for detecting infrastructure drift and state mismatches",
    icon: "GitBranch",
    color: "red",
  },
  {
    id: "learning-resources",
    label: "Learning Resources",
    description:
      "Articles, conference talks, books, and courses on cloud compliance",
    icon: "BookOpen",
    color: "teal",
  },
];

export const RESOURCES: Resource[] = [
  // ─── Policy Engines ──────────────────────────────────────────────────────────
  {
    id: "opa",
    name: "Open Policy Agent (OPA)",
    description:
      "General-purpose policy engine that unifies policy enforcement across the stack. Write policies in Rego language. Integrates with Terraform via conftest or OPA Terraform provider.",
    url: "https://www.openpolicyagent.org",
    category: "policy-engines",
    tags: ["open-source", "multi-cloud", "kubernetes", "terraform"],
    language: "Go",
    frameworks: ["Kubernetes", "Terraform", "Envoy", "API Gateway"],
  },
  {
    id: "sentinel",
    name: "HashiCorp Sentinel",
    description:
      "Policy-as-code framework embedded in HCP Terraform and Vault. Enforces policies before infrastructure changes are applied. First-class Terraform integration.",
    url: "https://developer.hashicorp.com/sentinel",
    category: "policy-engines",
    tags: ["commercial", "terraform"],
    isCommercial: true,
    frameworks: ["Terraform", "Vault", "Consul", "Nomad"],
  },
  {
    id: "cloud-custodian",
    name: "Cloud Custodian",
    description:
      "Rules engine for cloud security, cost optimization, and governance. Supports AWS, Azure, and GCP. Write policies in YAML. Strong CIS and SOC 2 coverage.",
    url: "https://cloudcustodian.io",
    category: "policy-engines",
    tags: ["open-source", "multi-cloud", "aws", "azure", "gcp", "cis", "soc2"],
    language: "Python",
    frameworks: ["AWS", "Azure", "GCP"],
  },
  {
    id: "kyverno",
    name: "Kyverno",
    description:
      "Kubernetes-native policy management. Define, validate, mutate, and generate configurations. No new language needed — policies are written as Kubernetes resources.",
    url: "https://kyverno.io",
    category: "policy-engines",
    tags: ["open-source", "kubernetes"],
    language: "Go",
    frameworks: ["Kubernetes"],
  },
  {
    id: "gatekeeper",
    name: "OPA Gatekeeper",
    description:
      "Policy controller for Kubernetes using OPA. Provides CRDs for policy definitions, admission webhooks, and audit functionality.",
    url: "https://open-policy-agent.github.io/gatekeeper",
    category: "policy-engines",
    tags: ["open-source", "kubernetes"],
    language: "Go",
    frameworks: ["Kubernetes"],
  },
  {
    id: "cedar",
    name: "Cedar Policy Language (AWS)",
    description:
      "Expressive, fast, safe policy language from AWS. Used in Amazon Verified Permissions and AWS IAM. Open-sourced under Apache 2.0.",
    url: "https://cedarpolicy.com",
    category: "policy-engines",
    tags: ["open-source", "aws"],
    language: "Rust",
    frameworks: ["AWS"],
  },
  {
    id: "conftest",
    name: "Conftest",
    description:
      "Write tests against structured configuration data using OPA / Rego. Supports Terraform plans, Kubernetes manifests, Dockerfile, and more.",
    url: "https://www.conftest.dev",
    category: "policy-engines",
    tags: ["open-source", "terraform", "kubernetes"],
    language: "Go",
    frameworks: ["Terraform", "Kubernetes", "Docker"],
  },
  {
    id: "cue",
    name: "CUE Language",
    description:
      "Open-source data validation language. Validate, define, and use data. Strong typing for configuration files including Terraform and Kubernetes.",
    url: "https://cuelang.org",
    category: "policy-engines",
    tags: ["open-source", "multi-cloud"],
    language: "Go",
  },

  // ─── IaC Security Scanners ───────────────────────────────────────────────────
  {
    id: "checkov",
    name: "Checkov",
    description:
      "Static analysis tool for Terraform, CloudFormation, ARM, Bicep, Kubernetes, Helm, Dockerfile and more. 1000+ built-in policies. Supports CIS, SOC 2, NIST, PCI DSS.",
    url: "https://www.checkov.io",
    category: "iac-scanners",
    tags: [
      "open-source",
      "terraform",
      "kubernetes",
      "cis",
      "soc2",
      "pci-dss",
      "nist",
      "multi-cloud",
    ],
    language: "Python",
    frameworks: [
      "Terraform",
      "CloudFormation",
      "Kubernetes",
      "ARM",
      "Dockerfile",
    ],
  },
  {
    id: "tfsec",
    name: "tfsec",
    description:
      "Security scanner for Terraform code. Fast, focused on Terraform-specific patterns. Checks AWS, Azure, GCP resources. Now maintained under Trivy.",
    url: "https://aquasecurity.github.io/tfsec",
    category: "iac-scanners",
    tags: ["open-source", "terraform", "multi-cloud", "aws", "azure", "gcp"],
    language: "Go",
    frameworks: ["Terraform"],
  },
  {
    id: "trivy",
    name: "Trivy",
    description:
      "Comprehensive security scanner by Aqua Security. Covers vulnerabilities, misconfigurations, secrets, and licenses in containers, IaC, and file systems. Subsumes tfsec.",
    url: "https://trivy.dev",
    category: "iac-scanners",
    tags: [
      "open-source",
      "terraform",
      "kubernetes",
      "multi-cloud",
      "cis",
      "nist",
    ],
    language: "Go",
    frameworks: ["Terraform", "Kubernetes", "Docker", "CloudFormation"],
  },
  {
    id: "terrascan",
    name: "Terrascan",
    description:
      "Static code analyzer for IaC. Detects compliance and security violations. 500+ policies. Supports Terraform, Kubernetes, Helm, Kustomize, Dockerfile.",
    url: "https://runterrascan.io",
    category: "iac-scanners",
    tags: [
      "open-source",
      "terraform",
      "kubernetes",
      "cis",
      "pci-dss",
      "nist",
      "hipaa",
    ],
    language: "Go",
    frameworks: ["Terraform", "Kubernetes", "Helm", "Dockerfile"],
  },
  {
    id: "kics",
    name: "KICS (Checkmarx)",
    description:
      "Keeping Infrastructure as Code Secure. Finds security vulnerabilities, compliance issues, and infrastructure misconfigurations in IaC. 2400+ queries.",
    url: "https://kics.io",
    category: "iac-scanners",
    tags: [
      "open-source",
      "terraform",
      "kubernetes",
      "cis",
      "pci-dss",
      "hipaa",
      "multi-cloud",
    ],
    language: "Go",
    frameworks: [
      "Terraform",
      "CloudFormation",
      "Kubernetes",
      "Ansible",
      "Dockerfile",
    ],
  },
  {
    id: "snyk-iac",
    name: "Snyk IaC",
    description:
      "Find and fix security issues in Terraform, CloudFormation, Kubernetes, and Helm. Inline fix suggestions in IDE. Commercial with free tier.",
    url: "https://snyk.io/product/infrastructure-as-code-security",
    category: "iac-scanners",
    tags: ["commercial", "terraform", "kubernetes", "multi-cloud"],
    isCommercial: true,
    frameworks: ["Terraform", "CloudFormation", "Kubernetes", "Helm"],
  },
  {
    id: "terraform-compliance",
    name: "terraform-compliance",
    description:
      "BDD (Behavior-Driven Development) framework for Terraform. Write compliance tests in Gherkin language. Focused on negative testing.",
    url: "https://terraform-compliance.com",
    category: "iac-scanners",
    tags: ["open-source", "terraform"],
    language: "Python",
    frameworks: ["Terraform"],
  },
  {
    id: "regula",
    name: "Regula",
    description:
      "Checks Terraform and CloudFormation for AWS, Azure, GCP security and compliance using OPA. Library of 400+ rules. Now part of Fugue.",
    url: "https://regula.dev",
    category: "iac-scanners",
    tags: ["open-source", "terraform", "aws", "azure", "gcp", "cis"],
    language: "Go",
    frameworks: ["Terraform", "CloudFormation"],
  },
  {
    id: "cfn-guard",
    name: "cfn-guard (AWS)",
    description:
      "Policy-as-code evaluation tool from AWS. Validate CloudFormation and Terraform templates against policy rules written in Guard DSL.",
    url: "https://github.com/aws-cloudformation/cloudformation-guard",
    category: "iac-scanners",
    tags: ["open-source", "aws", "terraform"],
    language: "Rust",
    frameworks: ["CloudFormation", "Terraform"],
  },
  {
    id: "terragoat",
    name: "TerraGoat",
    description:
      "Deliberately vulnerable Terraform repository for benchmarking IaC scanners. Contains intentionally misconfigured AWS, Azure, and GCP resources.",
    url: "https://github.com/bridgecrewio/terragoat",
    category: "iac-scanners",
    tags: ["open-source", "terraform", "deliberately-broken", "multi-cloud"],
    language: "HCL",
    frameworks: ["Terraform"],
  },
  {
    id: "tflint",
    name: "TFLint",
    description:
      "Pluggable Terraform linter. Finds possible errors, warns about deprecated syntax, and enforces best practices. Rich plugin ecosystem for AWS, Azure, GCP.",
    url: "https://github.com/terraform-linters/tflint",
    category: "iac-scanners",
    tags: ["open-source", "terraform", "multi-cloud"],
    language: "Go",
    frameworks: ["Terraform"],
  },

  // ─── CSPM Tools ───────────────────────────────────────────────────────────────
  {
    id: "prowler",
    name: "Prowler",
    description:
      "Open-source AWS, Azure, GCP, and Kubernetes security tool. 400+ checks covering CIS, GDPR, HIPAA, ISO27001, NIST 800-53, PCI DSS, SOC 2, FedRAMP.",
    url: "https://prowler.pro",
    category: "cspm",
    tags: [
      "open-source",
      "multi-cloud",
      "cis",
      "gdpr",
      "hipaa",
      "iso27001",
      "nist",
      "pci-dss",
      "soc2",
      "fedramp",
    ],
    language: "Python",
    frameworks: ["AWS", "Azure", "GCP", "Kubernetes"],
  },
  {
    id: "scoutsuite",
    name: "ScoutSuite",
    description:
      "Multi-cloud security auditing tool. Gathers configuration data from cloud APIs and presents it in a web-based report. Supports AWS, Azure, GCP, Alibaba, Oracle.",
    url: "https://github.com/nccgroup/ScoutSuite",
    category: "cspm",
    tags: ["open-source", "multi-cloud", "aws", "azure", "gcp"],
    language: "Python",
    frameworks: ["AWS", "Azure", "GCP"],
  },
  {
    id: "steampipe",
    name: "Steampipe",
    description:
      "Use SQL to instantly query cloud infrastructure, SaaS APIs, and more. 140+ plugins. Rich compliance mod ecosystem for CIS, NIST, SOC 2 benchmarks.",
    url: "https://steampipe.io",
    category: "cspm",
    tags: [
      "open-source",
      "multi-cloud",
      "cis",
      "nist",
      "soc2",
      "aws",
      "azure",
      "gcp",
    ],
    language: "Go",
    frameworks: ["AWS", "Azure", "GCP", "Kubernetes"],
  },
  {
    id: "cloudsploit",
    name: "CloudSploit",
    description:
      "Open-source cloud security scanning engine by Aqua Security. Detects security risks in AWS, Azure, GCP, and Oracle Cloud configuration settings.",
    url: "https://cloudsploit.com",
    category: "cspm",
    tags: ["open-source", "multi-cloud", "aws", "azure", "gcp"],
    language: "JavaScript",
    frameworks: ["AWS", "Azure", "GCP"],
  },
  {
    id: "aws-security-hub",
    name: "AWS Security Hub",
    description:
      "AWS native CSPM service. Aggregates, organizes, and prioritizes security alerts from multiple AWS services. CIS Benchmark, PCI DSS, NIST 800-53 standards built-in.",
    url: "https://aws.amazon.com/security-hub",
    category: "cspm",
    tags: ["commercial", "aws", "cis", "pci-dss", "nist"],
    isCommercial: true,
    frameworks: ["AWS"],
  },
  {
    id: "defender-for-cloud",
    name: "Microsoft Defender for Cloud",
    description:
      "Azure-native CSPM and workload protection platform. Continuous posture assessment, regulatory compliance dashboard, and threat protection.",
    url: "https://azure.microsoft.com/en-us/products/defender-for-cloud",
    category: "cspm",
    tags: ["commercial", "azure", "cis", "pci-dss", "nist", "iso27001"],
    isCommercial: true,
    frameworks: ["Azure"],
  },
  {
    id: "security-command-center",
    name: "Google Security Command Center",
    description:
      "GCP's centralized vulnerability and threat reporting service. Identifies misconfigurations, vulnerabilities, and active threats across GCP resources.",
    url: "https://cloud.google.com/security-command-center",
    category: "cspm",
    tags: ["commercial", "gcp", "cis"],
    isCommercial: true,
    frameworks: ["GCP"],
  },
  {
    id: "cloudquery",
    name: "CloudQuery",
    description:
      "Open-source data integration platform for cloud infrastructure. Sync cloud resource data to SQL databases and run compliance queries. 200+ plugins.",
    url: "https://www.cloudquery.io",
    category: "cspm",
    tags: ["open-source", "multi-cloud", "cis", "nist", "aws", "azure", "gcp"],
    language: "Go",
    frameworks: ["AWS", "Azure", "GCP", "Kubernetes"],
  },

  // ─── Compliance Frameworks ───────────────────────────────────────────────────
  {
    id: "cis-benchmarks",
    name: "CIS Benchmarks",
    description:
      "Industry-standard secure configuration guidelines for AWS, Azure, GCP, Kubernetes, Docker. Free PDFs available. Widely supported by all major CSPM tools.",
    url: "https://www.cisecurity.org/cis-benchmarks",
    category: "compliance-frameworks",
    tags: ["cis", "multi-cloud", "kubernetes"],
    frameworks: ["AWS", "Azure", "GCP", "Kubernetes", "Docker"],
  },
  {
    id: "soc2-framework",
    name: "SOC 2 (AICPA)",
    description:
      "Service Organization Controls 2. Trust Services Criteria: Security, Availability, Confidentiality, Processing Integrity, Privacy. Terraform control mapping.",
    url: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
    category: "compliance-frameworks",
    tags: ["soc2"],
    frameworks: ["AWS", "Azure", "GCP"],
  },
  {
    id: "pci-dss",
    name: "PCI DSS v4.0",
    description:
      "Payment Card Industry Data Security Standard v4.0. 12 requirements for securing cardholder data. AWS/Azure/GCP mappings and Terraform module references.",
    url: "https://www.pcisecuritystandards.org",
    category: "compliance-frameworks",
    tags: ["pci-dss", "multi-cloud"],
    frameworks: ["AWS", "Azure", "GCP"],
  },
  {
    id: "nist-800-53",
    name: "NIST SP 800-53 Rev 5",
    description:
      "Security and Privacy Controls for Information Systems. Baseline control families mapped to AWS, Azure, GCP services and Terraform resources.",
    url: "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final",
    category: "compliance-frameworks",
    tags: ["nist", "multi-cloud"],
    frameworks: ["AWS", "Azure", "GCP"],
  },
  {
    id: "fedramp",
    name: "FedRAMP",
    description:
      "Federal Risk and Authorization Management Program. Cloud security standard for US federal agencies. Based on NIST 800-53. AWS GovCloud, Azure Gov, GCP Assured.",
    url: "https://www.fedramp.gov",
    category: "compliance-frameworks",
    tags: ["fedramp", "nist", "aws", "azure", "gcp"],
    frameworks: ["AWS", "Azure", "GCP"],
  },
  {
    id: "hipaa",
    name: "HIPAA / HITECH",
    description:
      "Health Insurance Portability and Accountability Act. Security and Privacy Rules for healthcare data. AWS, Azure, GCP HIPAA-eligible services documented.",
    url: "https://www.hhs.gov/hipaa/index.html",
    category: "compliance-frameworks",
    tags: ["hipaa", "aws", "azure", "gcp"],
    frameworks: ["AWS", "Azure", "GCP"],
  },
  {
    id: "iso27001",
    name: "ISO/IEC 27001:2022",
    description:
      "International standard for information security management systems. Annex A controls mapped to AWS, Azure, GCP services. Used globally as baseline for ISMS.",
    url: "https://www.iso.org/standard/27001",
    category: "compliance-frameworks",
    tags: ["iso27001", "multi-cloud"],
    frameworks: ["AWS", "Azure", "GCP"],
  },
  {
    id: "gdpr",
    name: "GDPR",
    description:
      "General Data Protection Regulation. EU data privacy law. AWS, Azure, GCP GDPR compliance resources and Terraform controls for data residency and encryption.",
    url: "https://gdpr.eu",
    category: "compliance-frameworks",
    tags: ["gdpr", "multi-cloud"],
    frameworks: ["AWS", "Azure", "GCP"],
  },
  {
    id: "aws-fsbp",
    name: "AWS Foundational Security Best Practices",
    description:
      "AWS-curated set of controls that detect when deployed accounts don't align with security best practices. Directly integrated with Security Hub.",
    url: "https://docs.aws.amazon.com/securityhub/latest/userguide/fsbp-standard.html",
    category: "compliance-frameworks",
    tags: ["aws", "cis"],
    frameworks: ["AWS"],
  },

  // ─── Automation Platforms ─────────────────────────────────────────────────────
  {
    id: "spacelift",
    name: "Spacelift",
    description:
      "GitOps platform for Terraform, OpenTofu, Pulumi, Ansible, and Kubernetes. Built-in OPA policy engine for policy-as-code. Drift detection, approval workflows.",
    url: "https://spacelift.io",
    category: "automation-platforms",
    tags: ["commercial", "terraform", "kubernetes", "multi-cloud"],
    isCommercial: true,
    frameworks: ["Terraform", "OpenTofu", "Pulumi", "Kubernetes"],
  },
  {
    id: "env0",
    name: "env0",
    description:
      "Cloud environment management platform. Custom flows, OPA policies, cost controls, and drift detection. Supports Terraform, Terragrunt, OpenTofu, Pulumi.",
    url: "https://www.env0.com",
    category: "automation-platforms",
    tags: ["commercial", "terraform", "multi-cloud"],
    isCommercial: true,
    frameworks: ["Terraform", "OpenTofu", "Terragrunt", "Pulumi"],
  },
  {
    id: "scalr",
    name: "Scalr",
    description:
      "Terraform remote operations backend with OPA policy enforcement, RBAC, and cost estimation. Self-hosted or SaaS. Strong governance features.",
    url: "https://www.scalr.com",
    category: "automation-platforms",
    tags: ["commercial", "terraform"],
    isCommercial: true,
    frameworks: ["Terraform", "OpenTofu"],
  },
  {
    id: "hcp-terraform",
    name: "HCP Terraform (Terraform Cloud)",
    description:
      "HashiCorp's managed Terraform platform. Sentinel policy enforcement, Audit logging, SSO, private module registry. Plus tier enables policy sets.",
    url: "https://www.hashicorp.com/products/terraform",
    category: "automation-platforms",
    tags: ["commercial", "terraform"],
    isCommercial: true,
    frameworks: ["Terraform"],
  },
  {
    id: "atlantis",
    name: "Atlantis",
    description:
      "Open-source Terraform pull request automation. Runs terraform plan on PR, comments the plan output, and applies on merge. Self-hosted.",
    url: "https://www.runatlantis.io",
    category: "automation-platforms",
    tags: ["open-source", "terraform"],
    language: "Go",
    frameworks: ["Terraform", "OpenTofu"],
  },
  {
    id: "terrateam",
    name: "Terrateam",
    description:
      "GitOps CI/CD for Terraform and OpenTofu. GitHub App-based workflow. Policy checks, drift detection, cost estimation, apply-on-merge.",
    url: "https://terrateam.io",
    category: "automation-platforms",
    tags: ["commercial", "terraform"],
    isCommercial: true,
    frameworks: ["Terraform", "OpenTofu"],
  },
  {
    id: "digger",
    name: "Digger",
    description:
      "Open-source CI/CD orchestration for Terraform. Runs Terraform in your own CI (GitHub Actions, GitLab CI). No separate backend needed.",
    url: "https://digger.dev",
    category: "automation-platforms",
    tags: ["open-source", "terraform"],
    language: "Go",
    frameworks: ["Terraform", "OpenTofu"],
  },
  {
    id: "infracost",
    name: "Infracost",
    description:
      "Cloud cost estimates for Terraform. Shows cost breakdown in pull requests before applying changes. Supports AWS, Azure, GCP. Policy for cost governance.",
    url: "https://www.infracost.io",
    category: "automation-platforms",
    tags: ["open-source", "terraform", "multi-cloud"],
    language: "Go",
    frameworks: ["Terraform"],
  },

  // ─── Drift Detection ─────────────────────────────────────────────────────────
  {
    id: "driftctl",
    name: "driftctl",
    description:
      "Detect, track, and alert on infrastructure drift. Compares your Terraform state with real cloud resources. Outputs unmanaged resources and differences.",
    url: "https://driftctl.com",
    category: "drift-detection",
    tags: ["open-source", "terraform", "aws"],
    language: "Go",
    isDeprecated: true,
    frameworks: ["Terraform"],
  },
  {
    id: "terraform-drift",
    name: "Terraform Refresh / Plan Drift",
    description:
      "Native Terraform drift detection using terraform plan -refresh-only. Detects out-of-band changes to managed resources. No extra tooling needed.",
    url: "https://developer.hashicorp.com/terraform/tutorials/state/refresh",
    category: "drift-detection",
    tags: ["open-source", "terraform"],
    frameworks: ["Terraform"],
  },
  {
    id: "cloudquery-drift",
    name: "CloudQuery Drift (cloudquery/cloudquery)",
    description:
      "Use CloudQuery's asset inventory to compare cloud state against Terraform state files. SQL-based drift queries against live cloud data.",
    url: "https://www.cloudquery.io/blog/solving-infrastructure-drift",
    category: "drift-detection",
    tags: ["open-source", "terraform", "multi-cloud", "aws", "azure", "gcp"],
    language: "Go",
    frameworks: ["Terraform", "AWS", "Azure", "GCP"],
  },
  {
    id: "komiser",
    name: "Komiser",
    description:
      "Cloud environment inspector and drift detection. Tracks cloud assets, their relationships, and costs. Detects unmanaged resources and policy violations.",
    url: "https://www.tailwarden.com/komiser",
    category: "drift-detection",
    tags: ["open-source", "multi-cloud", "aws", "azure", "gcp"],
    language: "Go",
    frameworks: ["AWS", "Azure", "GCP"],
  },

  // ─── Learning Resources ───────────────────────────────────────────────────────
  {
    id: "tfsec-guide",
    name: "Terraform Security Best Practices (HashiCorp)",
    description:
      "Official HashiCorp guide covering Terraform security best practices: remote state encryption, secret management, least-privilege IAM, and workspace isolation.",
    url: "https://developer.hashicorp.com/terraform/tutorials/configuration-language/sensitive-variables",
    category: "learning-resources",
    tags: ["terraform", "article"],
    frameworks: ["Terraform"],
  },
  {
    id: "opa-terraform-guide",
    name: "Policy as Code with OPA and Terraform",
    description:
      "HashiCorp Learn guide on using OPA and Conftest to validate Terraform plans before apply. Step-by-step with practical Rego policy examples.",
    url: "https://developer.hashicorp.com/terraform/tutorials/policy/opa-terraform",
    category: "learning-resources",
    tags: ["terraform", "article"],
    frameworks: ["Terraform", "OPA"],
  },
  {
    id: "cloud-security-book",
    name: "Hacking the Cloud (Community Wiki)",
    description:
      "Community-maintained encyclopedia of attack techniques for cloud environments. AWS, Azure, GCP attack paths. Essential for understanding what you're defending against.",
    url: "https://hackingthe.cloud",
    category: "learning-resources",
    tags: ["article", "multi-cloud", "aws", "azure", "gcp"],
    frameworks: ["AWS", "Azure", "GCP"],
  },
  {
    id: "terraform-weekly",
    name: "Terraform Weekly Newsletter",
    description:
      "Weekly newsletter curating the best Terraform articles, tools, and news. Great for staying current with the ecosystem.",
    url: "https://www.tfweekly.com",
    category: "learning-resources",
    tags: ["terraform", "article"],
    frameworks: ["Terraform"],
  },
  {
    id: "cloudposse",
    name: "Cloud Posse Reference Architecture",
    description:
      "Opinionated reference architecture for AWS using Terraform. Includes security baselines, compliance guardrails, IAM policies, and governance patterns.",
    url: "https://cloudposse.com",
    category: "learning-resources",
    tags: ["terraform", "aws", "article"],
    frameworks: ["Terraform", "AWS"],
  },
  {
    id: "aws-security-maturity",
    name: "AWS Security Maturity Roadmap",
    description:
      "Phased approach to building security maturity on AWS. Maps AWS services to security domains across 4 maturity levels. Free PDF.",
    url: "https://maturitymodel.security.aws.dev",
    category: "learning-resources",
    tags: ["aws", "article", "nist"],
    frameworks: ["AWS"],
  },
  {
    id: "policy-as-code-video",
    name: "Policy as Code: The Next Step in DevSecOps (KubeCon Talk)",
    description:
      "Conference talk covering the evolution from manual compliance reviews to automated policy-as-code pipelines using OPA, Gatekeeper, and Conftest.",
    url: "https://www.youtube.com/watch?v=3MGD0QlCaHk",
    category: "learning-resources",
    tags: ["video", "kubernetes", "open-source"],
    frameworks: ["Kubernetes", "OPA"],
  },
  {
    id: "iac-security-course",
    name: "Infrastructure as Code Security (Pluralsight)",
    description:
      "Course covering security principles for IaC: Terraform security scanning, policy-as-code, secret management, and CI/CD integration. Hands-on labs.",
    url: "https://www.pluralsight.com/courses/infrastructure-code-security",
    category: "learning-resources",
    tags: ["course", "terraform", "commercial"],
    isCommercial: true,
    frameworks: ["Terraform"],
  },
  {
    id: "terraforming-the-cloud",
    name: "Terraform: Up & Running, 3rd Edition (Book)",
    description:
      "Comprehensive Terraform book by Yevgeniy Brikman. Chapter on security best practices covers remote state, secrets, IAM, and compliance tooling.",
    url: "https://www.terraformupandrunning.com",
    category: "learning-resources",
    tags: ["book", "terraform", "commercial"],
    isCommercial: true,
    frameworks: ["Terraform"],
  },
  {
    id: "cis-terraform-modules",
    name: "CIS AWS Foundations Terraform Modules",
    description:
      "Community Terraform modules that implement CIS AWS Foundations Benchmark controls. Modular, reusable, and well-documented.",
    url: "https://registry.terraform.io/modules/terraform-aws-modules/security-group",
    category: "learning-resources",
    tags: ["terraform", "aws", "cis", "open-source"],
    frameworks: ["Terraform", "AWS"],
  },
];

export const getResourcesByCategory = (
  category: string
): Resource[] => {
  if (category === "all") return RESOURCES;
  return RESOURCES.filter((r) => r.category === category);
};

export const searchResources = (
  resources: Resource[],
  query: string
): Resource[] => {
  const q = query.toLowerCase();
  return resources.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.includes(q)) ||
      (r.frameworks || []).some((f) => f.toLowerCase().includes(q))
  );
};

export const STATS = {
  total: RESOURCES.length,
  categories: CATEGORIES.length,
  openSource: RESOURCES.filter((r) => !r.isCommercial).length,
  frameworks: [
    "CIS",
    "SOC 2",
    "PCI DSS",
    "NIST 800-53",
    "FedRAMP",
    "HIPAA",
    "ISO 27001",
    "GDPR",
  ],
};
