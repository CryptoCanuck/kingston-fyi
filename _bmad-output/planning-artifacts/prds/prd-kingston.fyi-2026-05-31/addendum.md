# Kingston.FYI PRD — Addendum

Downstream depth for **architecture / UX**, not PRD requirements. The PRD says *what*; this
captures *how*-decisions deliberately deferred, plus open mechanism questions surfaced during the
PRD reviewer gate (2026-05-31).

## Architecture decision backlog (resolve in `bmad-create-architecture`)

- **ORM:** Drizzle vs Prisma (Payload 3.x leans Drizzle).
- **City/tenancy enforcement:** hostname → city resolution; whether city scoping is enforced via
  Postgres RLS or application-layer query filters (the PRD requires the *invariant*; the mechanism
  is here). Guard against cross-city cross-link/query bleed (PRD FR-integrity + NFR7).
- **Claim verification method** (emailed code / website-meta / phone) and the **claim lifecycle**
  state machine (dispute, revoke, transfer-on-sale, dual-claim resolution).
- **Seed-vs-claim provenance:** field-level ownership model so re-seeding never clobbers
  owner-edited/claimed fields; conflict resolution + staleness policy.
- **Cross-link referential integrity:** FK vs soft-reference, cascade/restrict on delete, merge
  semantics, reverse-link derivation, graceful resolution of dangling refs.
- **Directory data lifecycle:** dedup/merge of seeded duplicates; listing states
  (active / temporarily-closed / permanently-closed / stale); re-seed cadence + diffing.
- **SEO mechanics:** canonical strategy for aggregated content; noindex/quality-gate for thin or
  unclaimed listing pages until enriched; crawl control for filter/facet URL explosion
  (robots / canonical / param handling); Event JSON-LD requires a location (venue-less events).
- **Moderation automation-assist:** trusted-source auto-staging, bulk actions, prioritization,
  duplicate-flagging signal — to keep solo moderation tractable (PRD operability FR).
- **Abuse controls:** rate limiting, upload constraints/scanning, CAPTCHA provider.
- **Compliance:** CASL (email) + PIPEDA specifics — triggered at launch, not deferrable past it.
- **Search upgrade path:** Postgres FTS + `pg_trgm` → Meilisearch/Typesense trigger criteria.
- **Hosting:** persistent/container vs pooling-optimized serverless Postgres (Payload pool load).

## Rejected alternative (rationale preserved)

- **Scrape + rewrite a competitor's (paywalled) articles** (e.g., Kingstonist) — REJECTED.
  Copyright / narrow Canadian fair-dealing exposure; fatal to civic-trust brand in a small market;
  Google "scaled content abuse" demotion. Replaced by an automated **primary-source + aggregation**
  engine (institutional press releases, public feeds, legitimate link-out). Competitors are a
  signal/research source only.

## Pointers

- Tech-stack locks + rationale: product brief §"Technical Assumptions" and memory
  `[[kingston-greenfield-rebuild]]`.
- Data model: `../design-reference/content-model.md`. Screens: `../design-reference/screen-inventory.md`.
- Reviewer-gate detail: `review-rubric.md`, `review-adversarial.md`, and `reconcile-*.md` (this folder).
