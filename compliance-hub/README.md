# awesome-cloud-compliance

For a while I kept opening the same docs over and over — OPA here, Checkov there, some Prowler page, a drift detection tool I had starred on GitHub, a FedRAMP guide I'd shared in Slack, an article from the cloud security newsletter.

So I built a list.

**awesome-cloud-compliance** is a curated resource for anyone working with compliance, security, and governance in cloud infrastructure. 50+ entries organized by what they actually do:

- Policy engines (OPA, Sentinel, Kyverno, Cloud Custodian)
- IaC security scanners — static analysis, testing tools, and deliberately-broken repos for benchmarking your scanners
- CSPM tools — runtime posture management for AWS, Azure, GCP
- Compliance framework references mapped to cloud controls — CIS, SOC 2, PCI DSS, NIST 800-53, FedRAMP, HIPAA, ISO 27001, GDPR
- Automation platforms — Atlantis, Spacelift, env0, Scalr, Digger, Infracost
- Drift detection
- Articles, talks, books, courses

Commercial tools are marked. Deprecated projects are flagged. Anything that doesn't specifically work with cloud compliance and governance gets cut.

If you maintain something relevant that's not listed, open a PR.

---

## Running locally

```bash
cd compliance-hub
npm install
npm run dev
# http://localhost:3001
```

The assistant tab works out of the box — no API key needed. It uses a built-in knowledge base. To wire in a real LLM, swap `ExperimentalEmptyAdapter` for `OpenAIAdapter` in `src/app/api/copilotkit/route.ts`.

## Adding a resource

Edit `src/data/resources.ts`. Schema:

```typescript
{
  id: "short-unique-id",
  name: "Tool Name",
  description: "What it does and why it matters. First sentence is shown in search.",
  url: "https://...",
  category: "iac-scanners",   // policy-engines | iac-scanners | cspm | compliance-frameworks | automation-platforms | drift-detection | learning-resources
  tags: ["open-source", "terraform", "cis"],
  language: "Go",             // optional
  isCommercial: false,
  isDeprecated: false,
  frameworks: ["Terraform"],  // optional
}
```

## License

MIT
