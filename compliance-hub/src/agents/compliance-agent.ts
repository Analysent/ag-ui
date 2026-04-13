import {
  AbstractAgent,
  RunAgentInput,
  EventType,
  BaseEvent,
} from "@ag-ui/client";
import { Observable } from "rxjs";
import { RESOURCES, CATEGORIES } from "@/data/resources";

// Knowledge base summary for the agent
const KNOWLEDGE_BASE = `
You are a Cloud Compliance & Governance Assistant for the Compliance Governance Hub.
You have deep knowledge of cloud security, infrastructure compliance, and governance tooling.

RESOURCE CATALOG OVERVIEW:
- Total resources: ${RESOURCES.length}
- Categories: ${CATEGORIES.map((c) => c.label).join(", ")}

POLICY ENGINES:
${RESOURCES.filter((r) => r.category === "policy-engines")
  .map((r) => `- ${r.name}: ${r.description.split(".")[0]}`)
  .join("\n")}

IAC SECURITY SCANNERS:
${RESOURCES.filter((r) => r.category === "iac-scanners")
  .map((r) => `- ${r.name}: ${r.description.split(".")[0]}`)
  .join("\n")}

CSPM TOOLS:
${RESOURCES.filter((r) => r.category === "cspm")
  .map((r) => `- ${r.name}: ${r.description.split(".")[0]}`)
  .join("\n")}

COMPLIANCE FRAMEWORKS:
${RESOURCES.filter((r) => r.category === "compliance-frameworks")
  .map((r) => `- ${r.name}: ${r.description.split(".")[0]}`)
  .join("\n")}

AUTOMATION PLATFORMS:
${RESOURCES.filter((r) => r.category === "automation-platforms")
  .map((r) => `- ${r.name}: ${r.description.split(".")[0]}`)
  .join("\n")}

DRIFT DETECTION:
${RESOURCES.filter((r) => r.category === "drift-detection")
  .map((r) => `- ${r.name}: ${r.description.split(".")[0]}`)
  .join("\n")}

GUIDANCE RULES:
- If asked about getting started with compliance, recommend starting with Checkov or tfsec for IaC scanning, then graduating to OPA for custom policies.
- For Kubernetes compliance, recommend OPA Gatekeeper or Kyverno.
- For multi-cloud posture management, recommend Prowler, Steampipe, or CloudQuery.
- For FedRAMP/government workloads, highlight FedRAMP, NIST 800-53, AWS GovCloud, and Prowler.
- Always mention whether tools are open-source or commercial.
- Deprecated tools (driftctl) should be noted; recommend alternatives.
- When asked about a specific compliance framework (CIS, SOC 2, PCI DSS, NIST, FedRAMP, HIPAA, ISO 27001, GDPR), explain what it covers and list tools that support it.
`;

/**
 * ComplianceAgent - An AG-UI agent specialized for cloud compliance guidance.
 * Uses streaming text responses via the AG-UI event protocol.
 */
export class ComplianceAgent extends AbstractAgent {
  protected run(input: RunAgentInput): Observable<BaseEvent> {
    const messageId = Date.now().toString();

    return new Observable<BaseEvent>((observer) => {
      const lastUserMessage =
        [...input.messages].reverse().find((m) => m.role === "user")?.content ||
        "";

      observer.next({
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId,
      } as BaseEvent);

      observer.next({
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: "assistant",
      } as BaseEvent);

      // Generate a contextual response
      const response = generateResponse(
        typeof lastUserMessage === "string"
          ? lastUserMessage
          : JSON.stringify(lastUserMessage)
      );

      // Stream the response word by word for a natural feel
      const words = response.split(" ");
      let i = 0;

      const interval = setInterval(() => {
        if (i < words.length) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          observer.next({
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId,
            delta: chunk,
          } as BaseEvent);
          i++;
        } else {
          clearInterval(interval);

          observer.next({
            type: EventType.TEXT_MESSAGE_END,
            messageId,
          } as BaseEvent);

          observer.next({
            type: EventType.RUN_FINISHED,
            threadId: input.threadId,
            runId: input.runId,
          } as BaseEvent);

          observer.complete();
        }
      }, 30);

      return () => clearInterval(interval);
    });
  }
}

function generateResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("get started") || msg.includes("beginning") || msg.includes("start")) {
    return `Honest answer: most teams try to boil the ocean and stall. Here's a path that actually works.

Start with **Checkov** — drop it in your CI pipeline against your Terraform today. It's free, takes 10 minutes to wire up, and will immediately surface things like open S3 buckets and missing encryption. That's your quick win.

Once that's running, schedule a weekly **Prowler** run against your live AWS/Azure/GCP accounts. It'll show you the gap between what you think is configured and what's actually there.

After those two are humming, then start thinking about custom policy enforcement with OPA/Conftest if you need org-specific rules, or Sentinel if you're on HCP Terraform.

Drift detection and automation platforms (Atlantis, Spacelift) come last — once you've got a baseline to protect.

What's driving this for you — a specific audit, a framework requirement, or just getting ahead of things?`;
  }

  if (msg.includes("opa") || msg.includes("open policy agent")) {
    return `OPA is the one I keep coming back to. It's general-purpose — not just for Terraform, not just for Kubernetes. You write policies in Rego (takes a day to learn the basics) and can apply the same engine across your whole stack.

For Terraform specifically, the workflow with **Conftest** is pretty clean:

\`\`\`bash
terraform plan -out tfplan.binary
terraform show -json tfplan.binary > tfplan.json
conftest test tfplan.json
\`\`\`

For Kubernetes, **OPA Gatekeeper** runs as an admission webhook. Every resource hitting the API server gets validated against your policies before it lands.

The main thing to know: Rego has a learning curve. If you just need Kubernetes and want something easier, **Kyverno** is worth a look — policies are Kubernetes CRDs, no new language. If you're on HCP Terraform and want first-class integration, **Sentinel** is tighter but it's commercial.

OPA is the right call if you need one policy engine for multiple contexts.`;
  }

  if (msg.includes("checkov") || msg.includes("tfsec") || msg.includes("scanner")) {
    return `Short version: start with **Checkov** unless you have a specific reason not to.

It covers Terraform, CloudFormation, Kubernetes, ARM, Dockerfile — the broadest coverage. The documentation is good. 1000+ built-in checks mapped to CIS, SOC 2, NIST, PCI DSS. And it takes about 10 minutes to add to a GitHub Actions workflow.

**tfsec** got absorbed into **Trivy** (same team at Aqua Security). Trivy is worth knowing because it goes beyond IaC — it also scans container images and file systems for CVEs. If you're already using it for container security, lean on it for IaC too.

**KICS** has the largest query library (2400+) and is solid if you need breadth. Slightly less polished UX than Checkov.

**Snyk IaC** is the commercial option — good IDE integration, nice fix suggestions inline. Worth it if you're already a Snyk shop.

For most teams getting started: Checkov in CI, block on HIGH severity, fix your backlog gradually.`;
  }

  if (msg.includes("fedramp") || msg.includes("fed ramp") || msg.includes("federal")) {
    return `FedRAMP is a multi-year commitment — go in knowing that. It's based on NIST 800-53 Rev 5, so everything you do toward NIST helps.

On the tooling side: **Prowler** has native FedRAMP support and is the fastest way to get a gap assessment. **Checkov** maps to NIST 800-53 controls for IaC. **AWS Security Hub** has a FedRAMP-ready workload view if you're on AWS GovCloud.

Speaking of which — the cloud provider matters a lot here. AWS GovCloud, Azure Government, and Google Assured Workloads are purpose-built for FedRAMP workloads. Regular commercial regions don't have authorized services for High impact level.

The practical path:
1. Run Prowler against your current environment — you'll get a gap list immediately
2. Work your NIST 800-53 controls in Terraform (SCPs, encryption, logging)
3. Document your System Security Plan — this is unavoidable, start early
4. Engage a 3PAO when you're ready for assessment

Moderate authorization: plan 12+ months. High: longer. Is this for a new system or an existing one getting authorized?`;
  }

  if (msg.includes("drift")) {
    return `Drift is honestly one of the more annoying problems in infrastructure — someone goes into the console to "just quickly" fix something and now your state doesn't match reality.

The simplest thing that works: run \`terraform plan -refresh-only\` on a schedule in CI. It'll show you everything that changed out of band. No extra tooling.

**driftctl** used to be the go-to dedicated tool but it's deprecated now. The team moved on to CloudQuery, which is a better answer anyway — it syncs your cloud inventory to Postgres and you can write SQL queries to compare live state against your Terraform state files.

If you're on Spacelift, env0, or Atlantis, they all have built-in drift detection with scheduled plan runs. That's the lowest-effort path if you're already using one of those platforms.

**Komiser** is worth a look if you want a visual inventory of everything in your cloud accounts — it surfaces unmanaged resources (things that exist in AWS but aren't in any Terraform state) which is a different but equally important problem.

What's your current setup — Terraform Cloud, self-managed, or a third-party platform?`;
  }

  if (msg.includes("cis") || msg.includes("center for internet security")) {
    return `CIS Benchmarks are probably the best starting point for most teams. They're free to download, opinionated in a good way, and supported by basically every scanning tool out there.

They cover AWS, Azure, GCP, Kubernetes, Docker — separate benchmark documents for each. Each has Level 1 (basic hygiene, low operational impact) and Level 2 (defense in depth, sometimes affects usability).

Start with Level 1. It covers the high-frequency misconfigurations — publicly exposed resources, unencrypted storage, missing MFA, overly permissive IAM. That alone will get you most of the way.

For tooling: **Prowler** is probably the most complete — 400+ CIS checks across all major clouds, and it'll output a report against the specific benchmark version. Run it today with:

\`\`\`bash
pip install prowler
prowler aws --compliance cis_level2_aws_3.0
\`\`\`

**Steampipe** is great if you want SQL-based queries against CIS controls — useful for building dashboards or custom reporting. **AWS Security Hub** has CIS AWS Foundations built in if you want something that's always-on in your account.

Which cloud are you starting with?`;
  }

  if (msg.includes("kubernetes") || msg.includes("k8s")) {
    return `Kubernetes has a slightly different compliance toolchain from regular cloud infrastructure — worth knowing what's relevant where.

For **policy enforcement** (preventing bad configs from landing in the cluster): your two real options are **OPA Gatekeeper** and **Kyverno**. Gatekeeper is more flexible but requires learning Rego. Kyverno policies are Kubernetes CRDs — no new language, generally easier for teams that aren't deep in OPA already. I'd probably start with Kyverno unless you already have OPA investment.

For **scanning manifests in CI**: Checkov and Trivy both handle Kubernetes YAML, Helm, Kustomize well. Trivy is particularly good because it'll also catch CVEs in the images referenced by your manifests in the same scan.

For **CIS Kubernetes Benchmark assessment**: run **kube-bench** against your cluster nodes. It's purpose-built for this:

\`\`\`bash
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml
kubectl logs job/kube-bench
\`\`\`

For **runtime threat detection**: Falco is the standard. It watches syscalls and flags anomalous behavior.

Are you on EKS/AKS/GKE or running self-managed? The managed services handle some of the CIS controls for you.`;
  }

  if (msg.includes("soc 2") || msg.includes("soc2")) {
    return `SOC 2 is achievable but people underestimate how much of it is operational evidence rather than just technical controls.

The five Trust Services Criteria are Security, Availability, Confidentiality, Processing Integrity, and Privacy — most Type II audits focus on Security as the minimum, with others added depending on what you're selling.

On the technical side, the controls you'll need to demonstrate: encryption at rest and in transit, MFA enforcement, least-privilege access, audit logging (CloudTrail is table stakes), vulnerability scanning with patch cadence, and change management (IaC with PR reviews gets you most of the way here).

Tools that map well: **Prowler** has a SOC 2 compliance standard you can run directly. **Checkov** covers the IaC controls. **Steampipe** has a SOC 2 mod for ongoing SQL-based assessment. Cloud Posse's Terraform modules for AWS are a solid starting point for implementing the controls in code.

Timeline reality check: Type I (point-in-time) takes about 3 months to get ready. Type II requires 6-12 months of operating evidence — your auditor will want to see that controls were in place consistently, not just the week before the audit.

Start instrumenting now. Everything you do today is evidence for the Type II period.`;
  }

  if (msg.includes("terraform") && (msg.includes("module") || msg.includes("best practice"))) {
    return `A few things that matter more than most people realize:

**Remote state with encryption** — non-negotiable for anything beyond a personal project:

\`\`\`hcl
terraform {
  backend "s3" {
    bucket         = "your-tf-state-bucket"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
\`\`\`

**Secrets** — never in .tfvars, never in state if you can help it. Use SSM Parameter Store or Secrets Manager and reference via data sources. Mark variables \`sensitive = true\` so they don't leak in plan output.

**IAM** — separate roles per workspace/environment. Prefer OIDC-based auth for CI over long-lived access keys. Apply \`iam:PassRole\` restrictions on the Terraform execution role.

**Scanning** — Checkov in CI is the baseline. tflint for linting (catches provider issues and deprecated syntax). Conftest/OPA if you have custom org policies to enforce on plans.

Checkov GitHub Actions, if you want to copy-paste:
\`\`\`yaml
- uses: bridgecrewio/checkov-action@master
  with:
    directory: .
    framework: terraform
    soft_fail: false
\`\`\`

What area do you want to go deeper on?`;
  }

  // Default response
  return `I know this catalog pretty well. Here's what I can help with:

**Picking the right tool** — Checkov vs Trivy vs KICS, OPA vs Kyverno, Prowler vs Steampipe, Atlantis vs Spacelift. There are real tradeoffs and I can walk you through them.

**Specific frameworks** — CIS Benchmarks, SOC 2, PCI DSS, NIST 800-53, FedRAMP, HIPAA, ISO 27001, GDPR. What they actually require, which tools map to them, and where to start.

**Terraform security** — state management, secrets, IAM least privilege, scanning in CI, drift detection.

**Kubernetes compliance** — OPA Gatekeeper vs Kyverno, manifest scanning, CIS Kubernetes Benchmark with kube-bench.

What are you trying to figure out?`;
}
- "What's the best tool for SOC 2?"
- "How do I detect infrastructure drift?"
- "What's the difference between OPA and Kyverno?"
- "How do I achieve FedRAMP compliance?"

What would you like to know?`;
}
