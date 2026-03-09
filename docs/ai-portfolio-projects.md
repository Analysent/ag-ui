# AI-Native Portfolio Projects

Three production-grade AI projects with Claude Code pairing plans. Each covers a distinct domain and
problem type, demonstrates real-world engineering concerns, and ships a complete 8-prompt build sequence
you can paste directly into Claude Code.

---

## Project 1 — InvoiceIQ: AI Invoice Processing & GL Reconciliation

**Stack:** Next.js 14 (App Router) · Fastify · Prisma · Supabase Postgres + Storage · BullMQ · Redis · OpenAI `text-embedding-3-small`

**Domain:** Fintech — accounts-payable automation for SMBs. Users upload PDFs; the system extracts
line items, matches them against purchase orders, flags discrepancies, and auto-posts approved invoices
to a general-ledger (GL) via a webhook.

**Real-world concerns addressed:** idempotent ingestion (duplicate invoice detection via SHA-256 hash),
partial-failure recovery (per-line-item status tracking), backpressure (BullMQ concurrency limiter),
schema migrations (Prisma migrate with shadow DB), pagination (cursor-based on `invoice.id`).

**Evals & targets:** extraction F1 ≥ 0.92 on 200-invoice golden set; P95 end-to-end latency < 8 s
per page; per-invoice AI cost < $0.04.

### Claude Code Pairing Prompts

**a) Scaffold**
```
Generate a Turborepo monorepo with:
- apps/web: Next.js 14 (App Router, TypeScript, Tailwind, shadcn/ui)
- apps/api: Fastify 4 with @fastify/multipart, zod, pino logger
- packages/db: Prisma client shared package targeting Supabase Postgres
Add root eslint.config.mjs (flat config), .prettierrc, tsconfig base,
turbo.json with build/lint/test pipelines, and Dockerfiles for api and web
with multi-stage builds. Include a docker-compose.yml with postgres, redis, and
localstack (S3-compatible) services.
```

**b) Contracts**
```
Write an OpenAPI 3.1 spec (openapi.yaml) for the invoice API:
POST /invoices (multipart upload), GET /invoices?cursor=&limit= (cursor pagination),
GET /invoices/:id, PATCH /invoices/:id/approve, GET /invoices/:id/line-items.
Include error schemas (RFC 7807 ProblemDetail). Then generate a typed TypeScript
fetch client from the spec using openapi-typescript + openapi-fetch. Export it
from packages/api-client.
```

**c) Data**
```
Design a Prisma schema for: Vendor, Invoice (status enum: PENDING/PROCESSING/
NEEDS_REVIEW/APPROVED/POSTED, sha256Hash unique for dedup), LineItem
(quantity, unitPrice, glCode, matchStatus), PurchaseOrder, and AuditLog.
Add a Supabase Storage bucket config for raw PDFs. Write a seed script using
@faker-js/faker that creates 5 vendors, 50 POs, and 200 invoices (30% with
mismatched line items). Include a migration that adds a pgvector extension
and an embedding column on LineItem.
```

**d) Workers**
```
Add BullMQ with a Redis connection. Create an InvoiceProcessingQueue with:
- extractJob: calls GPT-4o vision to pull line items from a PDF page, writes
  results with status=PROCESSING, is idempotent on (invoiceId, pageIndex).
- matchJob: embeds each line item description, cosine-searches the LineItem
  embedding index for the matching PO line, writes matchStatus.
- postGLJob: sends approved invoices to a mock GL webhook with exponential
  backoff (3 retries, 1s/2s/4s), moves to a dead-letter queue on failure.
Expose queue health at GET /queues/health returning counts per state.
```

**e) Tests**
```
Set up Vitest for the api package and Jest (jsdom) for web. Write:
1. Unit tests for the SHA-256 dedup logic and the line-item matcher function.
2. Integration test using Testcontainers (postgres + redis) that uploads a
   fixture PDF, polls until status=NEEDS_REVIEW, and asserts line-item counts.
3. A k6 load test (load-test.js) that ramps to 50 VUs, sends 500 invoice
   uploads, and asserts P95 < 8000 ms and error rate < 1%.
```

**f) AI**
```
Implement a RAG extraction pipeline:
- Chunk each PDF page to text with pdf-parse; embed with text-embedding-3-small.
- Store embeddings in pgvector; at query time retrieve the 3 nearest GL codes
  from historical invoices as few-shot context before calling GPT-4o.
Write an eval harness (evals/extraction.eval.ts) that loads 200 annotated
invoices from evals/golden.jsonl, runs extraction, and reports precision/
recall/F1 per field (vendor, amount, date, lineItems). Fail CI if F1 < 0.92.
```

**g) CI/CD**
```
Author three GitHub Actions workflows:
1. ci.yml: on PR — lint → type-check → unit tests → integration tests (docker
   compose up) → extraction eval (fail if F1 < 0.92) → upload coverage to Codecov.
2. build.yml: on merge to main — docker buildx bake, push api and web images
   to GHCR with SHA and latest tags; gate on coverage ≥ 80%.
3. release.yml: manual trigger — prisma migrate deploy against staging, then
   rolling deploy via kubectl rollout.
```

**h) Instrumentation**
```
Add @opentelemetry/sdk-node to the Fastify api. Instrument:
- HTTP request spans (fastify-otel plugin)
- BullMQ job spans (manual startSpan around processJob)
- DB query spans via Prisma tracing extension
- Custom metrics: invoice_processing_duration_seconds histogram,
  invoice_extraction_cost_dollars counter.
Export traces to an OTLP collector. Add a grafana/dashboard.json with panels:
P50/P95 processing latency, queue depth by state, extraction cost per day,
error rate by endpoint.
```

---

## Project 2 — ClinicalCopilot: Clinical Note Summarization & ICD-10 Coding Assistant

**Stack:** FastAPI · SQLAlchemy 2 (async) · Alembic · Supabase Postgres + pgvector · Celery · Redis · Claude claude-sonnet-4-6 · LangChain

**Domain:** Healthcare — helps medical coders review physician notes, suggests ICD-10 codes with
evidence citations, and flags missing documentation required for billing.

**Real-world concerns addressed:** PHI handling (column-level encryption via pgcrypto), audit log
for every AI suggestion, idempotent Celery tasks (task_id as idempotency key), partial-failure
isolation per note section, schema migrations with zero-downtime column additions.

**Evals & targets:** ICD code suggestion accuracy ≥ 0.88 (top-3 hit rate) on 150-note golden set;
P95 summary latency < 6 s; cost per note < $0.08.

### Claude Code Pairing Prompts

**a) Scaffold**
```
Generate a Python monorepo with pyproject.toml (Poetry, Python 3.12):
- app/: FastAPI application with routers/, services/, models/, schemas/
- worker/: Celery worker package sharing app/models
- alembic/: migrations directory
Add ruff.toml, mypy.ini (strict), pyproject.toml with dev/test dependency groups,
and a Dockerfile for api and worker using python:3.12-slim with multi-stage builds.
Include docker-compose.yml with postgres (pgcrypto + pgvector extensions enabled),
redis, and a flower service for Celery monitoring.
```

**b) Contracts**
```
Write an OpenAPI 3.1 spec for:
POST /notes (create note with patient_id, raw_text — encrypt PHI at rest),
GET /notes/:id/summary (trigger summarization, return task_id),
GET /tasks/:task_id (poll Celery task status + result),
POST /notes/:id/codes (submit accepted ICD codes), GET /notes?page=&size=
(offset pagination with total count). Use Pydantic v2 models as the single
source of truth; generate the spec via FastAPI's openapi() and export a
Python typed client with openapi-python-client.
```

**c) Data**
```
Design SQLAlchemy 2 async models for: Patient (pgp_sym_encrypt on name/dob),
ClinicalNote (raw_text encrypted, status enum, section_embeddings vector(1536)),
ICDCode (code, description, embedding vector(1536)), CodeSuggestion (note_id,
code_id, confidence, evidence_snippet, accepted bool), AuditLog.
Write Alembic migrations including a zero-downtime migration that adds
section_embeddings without locking the table (CREATE INDEX CONCURRENTLY).
Write a Faker seed script producing 20 patients, 150 notes with realistic
clinical text, and the full ICD-10-CM 2025 code list loaded from CMS CSV.
```

**d) Workers**
```
Add Celery with Redis broker and result backend. Create three tasks:
1. summarize_note(note_id): splits note into SOAP sections, summarizes each
   with Claude claude-sonnet-4-6, stores result; idempotent via note.status guard.
2. suggest_codes(note_id): embeds each SOAP section, retrieves top-10 ICD codes
   by cosine similarity, re-ranks with Claude claude-sonnet-4-6 using chain-of-thought,
   returns top-3 with evidence; retries=3, max_retries=3, acks_late=True.
3. audit_log_task: append-only, fires on every suggestion acceptance; dead-letter
   queue (kombu) on failure with alert metric.
```

**e) Tests**
```
Set up pytest with pytest-asyncio, pytest-cov, and Testcontainers (postgres+redis).
Write:
1. Unit tests for the SOAP section splitter and the PHI encryption round-trip.
2. Integration test: POST a fixture note, poll until status=COMPLETED, assert
   3 code suggestions returned with confidence > 0.7.
3. A Locust load test (locustfile.py) ramping to 30 users, hitting summarization
   endpoint, asserting P95 < 6000 ms and HTTP error rate < 0.5%.
Gate coverage at ≥ 80% in CI.
```

**f) AI**
```
Implement the full RAG + agent loop:
- Embed ICD descriptions once at startup; store in pgvector index.
- Agent loop: (1) retrieve candidates, (2) call Claude claude-sonnet-4-6 with structured
  output (Pydantic), (3) if confidence < 0.7 use a clarification tool to pull
  relevant CMS guidelines, (4) retry loop max 2 hops.
Write evals/icd_eval.py: loads evals/golden_notes.jsonl (150 annotated notes),
runs suggest_codes, computes top-1/top-3 hit rate, mean confidence, mean tokens
used. Fail CI if top-3 hit rate < 0.88 or mean cost per note > $0.08.
```

**g) CI/CD**
```
Author GitHub Actions workflows:
1. ci.yml: ruff lint → mypy → pytest (testcontainers) → ICD eval → upload
   coverage; fail if hit-rate < 0.88.
2. build.yml: docker buildx for api and worker images, push to GHCR; only
   if coverage ≥ 80% and eval passes.
3. migrate.yml: manual trigger — alembic upgrade head against prod DB via a
   short-lived ECS task; send Slack notification on success/failure using
   repository secret SLACK_WEBHOOK.
```

**h) Instrumentation**
```
Add opentelemetry-sdk, opentelemetry-instrumentation-fastapi, and
opentelemetry-instrumentation-sqlalchemy to the api. Add
opentelemetry-instrumentation-celery to the worker. Instrument:
- Span per Celery task with note_id and task_type attributes
- Histogram: note_summarization_seconds, icd_suggestion_seconds
- Counter: llm_tokens_used_total labeled by model and task_type
- Gauge: celery_queue_depth by queue name
Export to OTLP. Provide grafana/dashboard.json with: task success rate,
P95 latency per task, tokens/cost per day, queue depth over time.
```

---

## Project 3 — LogLens: AI-Powered Log Anomaly Detection & Incident Narrative

**Stack:** Next.js 14 (App Router) · Express · Prisma · Supabase Postgres + pgvector · BullMQ · Redis · OpenAI `text-embedding-3-small` · Claude claude-sonnet-4-6

**Domain:** DevOps/SRE — ingests structured logs via webhook or file upload, clusters anomalous
events using embedding similarity, correlates them across services, and generates an incident
narrative with a ranked root-cause hypothesis list.

**Real-world concerns addressed:** high-throughput ingestion with backpressure (BullMQ rate-limit),
idempotent log dedup (hash of source+timestamp+message), pagination of large log windows
(keyset on `log.ts`), schema migration for partition-by-day log table, partial-failure
isolation per service stream.

**Evals & targets:** anomaly detection precision ≥ 0.85 / recall ≥ 0.80 on 500-event golden set;
narrative generation P95 < 4 s; per-incident AI cost < $0.06.

### Claude Code Pairing Prompts

**a) Scaffold**
```
Generate a Turborepo monorepo:
- apps/dashboard: Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui,
  recharts for time-series panels
- apps/ingestor: Express 5, TypeScript, zod, pino, @aws-sdk/client-s3 for
  log archive uploads
- packages/db: Prisma client with Supabase Postgres connection
Add turbo.json (build/lint/test), eslint.config.mjs (flat), tsconfig base,
Dockerfiles (multi-stage), docker-compose.yml with postgres, redis, and an
OpenTelemetry collector (otel/opentelemetry-collector-contrib).
```

**b) Contracts**
```
Write OpenAPI 3.1 for:
POST /ingest (NDJSON body, up to 10 MB, returns batch_id),
GET /batches/:id (ingestion status + stats),
GET /anomalies?service=&from=&to=&cursor= (keyset pagination),
GET /incidents/:id (full incident with root-cause list),
POST /incidents/:id/feedback (thumbs-up/down on narrative quality).
Generate a typed TypeScript client with openapi-typescript + openapi-fetch
exported from packages/api-client. Write a GraphQL schema (SDL) for the
dashboard's real-time subscription: subscription OnNewAnomaly.
```

**c) Data**
```
Design a Prisma schema for: LogBatch (status, sourceHash unique), LogEvent
(ts, service, level, message, embedding vector(1536), isAnomaly bool,
partitioned by month via Postgres declarative partitioning), AnomalyCluster
(centroid vector, severity), Incident (clusterIds[], narrative, rootCauses[]),
NarrativeFeedback. Write migrations including the partition DDL (run via
$executeRaw). Write a seed script using @faker-js/faker that generates
5 services × 10 000 log events with 8% injected anomaly patterns
(latency spikes, 5xx bursts, OOM signals).
```

**d) Workers**
```
Add BullMQ. Implement three jobs:
1. ingestJob(batchId): parses NDJSON line-by-line with a transform stream
   (backpressure), deduplicates via SHA-256(source+ts+msg), batch-upserts
   500 rows at a time; idempotent on batchId.
2. embedJob(logEventId[]): calls text-embedding-3-small in batches of 100,
   writes vectors; retries 3× with jitter; dead-letter on permanent failure.
3. clusterJob: runs every 5 min via BullMQ scheduler; DBSCAN over recent
   embeddings in pgvector (L2 distance); creates/updates AnomalyCluster rows;
   triggers narrativeJob for new high-severity clusters.
```

**e) Tests**
```
Set up Vitest for both apps. Write:
1. Unit tests for the NDJSON stream parser, SHA-256 dedup, and DBSCAN distance
   helper.
2. Integration test with Testcontainers: POST 1 000-line NDJSON batch, poll
   until status=COMPLETE, assert anomaly count within expected range.
3. k6 load test (load-test.js): ramp to 100 VUs, 10 000 log lines/s throughput
   target, assert P95 ingest latency < 500 ms and queue depth stabilizes < 5 000.
Gate coverage ≥ 80%.
```

**f) AI**
```
Implement the anomaly detection + narrative agent:
- At embedJob time, compute cosine distance to cluster centroids; mark
  isAnomaly=true if distance > threshold (tuned on golden set).
- narrativeJob: call Claude claude-sonnet-4-6 with the 20 most anomalous events +
  cluster metadata; use tool_use to call a GetServiceDependencyGraph tool
  (returns mock adjacency list); produce structured output
  {summary, rootCauses: [{service, hypothesis, confidence}]}.
Write evals/anomaly.eval.ts: loads evals/golden_events.jsonl (500 labeled events),
runs detection, reports precision/recall/F1. Fail CI if precision < 0.85 or
recall < 0.80.
```

**g) CI/CD**
```
Author GitHub Actions:
1. ci.yml: eslint → tsc → vitest (testcontainers) → anomaly eval → codecov upload;
   fail if precision < 0.85 or coverage < 80%.
2. build.yml: docker buildx bake for dashboard + ingestor, push to GHCR with
   SHA + latest tags; only on passing CI.
3. deploy.yml: manual with environment approval — kubectl set image for both
   deployments, run prisma migrate deploy as a Kubernetes Job pre-hook,
   verify rollout status with kubectl rollout status --timeout=120s.
```

**h) Instrumentation**
```
Add @opentelemetry/sdk-node to the Express ingestor. Instrument:
- HTTP ingest spans with batch_id, line_count attributes
- BullMQ job spans (manual) with job_name, attempt_number
- Prisma query spans via tracing preview feature
- Custom metrics: logs_ingested_total counter, embed_batch_duration_seconds
  histogram, cluster_anomaly_count gauge by service, narrative_tokens_total counter.
Export to the OTLP collector in docker-compose. Provide grafana/dashboard.json
with panels: ingest throughput (lines/s), queue depth by job type, anomaly rate
by service, narrative cost per hour, P95 embed latency.
```

---

## Summary Table

| | InvoiceIQ | ClinicalCopilot | LogLens |
|---|---|---|---|
| **Domain** | Fintech / AP automation | Healthcare / Medical coding | DevOps / SRE |
| **Stack** | TS + Next.js + Fastify + Prisma | Python + FastAPI + SQLAlchemy | TS + Next.js + Express + Prisma |
| **Queue** | BullMQ | Celery | BullMQ |
| **AI pattern** | RAG extraction + embedding match | RAG + agent loop + tool use | Embedding clustering + narrative agent |
| **Key eval** | Extraction F1 ≥ 0.92 | ICD top-3 hit rate ≥ 0.88 | Anomaly precision ≥ 0.85 / recall ≥ 0.80 |
| **Cost target** | < $0.04 / invoice | < $0.08 / note | < $0.06 / incident |
| **P95 latency** | < 8 s / page | < 6 s / note | < 4 s narrative, < 500 ms ingest |
| **Backpressure** | BullMQ concurrency limit | Celery prefetch + acks_late | BullMQ rate-limit + stream transform |
| **Dedup strategy** | SHA-256 of PDF content | Celery task_id guard | SHA-256(source+ts+msg) |
