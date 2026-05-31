---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-05-31'
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-kingston.fyi-2026-05-31/prd.md
  - _bmad-output/planning-artifacts/prds/prd-kingston.fyi-2026-05-31/addendum.md
  - _bmad-output/planning-artifacts/briefs/brief-kingston.fyi-2026-05-30/brief.md
  - _bmad-output/planning-artifacts/briefs/brief-kingston.fyi-2026-05-30/research-landscape.md
  - _bmad-output/planning-artifacts/design-reference/content-model.md
  - _bmad-output/planning-artifacts/design-reference/screen-inventory.md
  - _bmad-output/planning-artifacts/design-reference/design-system.md
workflowType: 'architecture'
project_name: 'kingston.fyi'
user_name: 'Chris'
date: '2026-05-31'
---

# Kingston.FYI — Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:** 62 FRs (FR1–FR62) in 11 groups — Platform/Shell, News, Events,
Directory (centerpiece), Submission/Claim/Moderation, Cross-Linking, Newsletter, Monetization
hooks, Admin/CMS, later-phase, and Data-Integrity/Lifecycle/Claim-Governance. Architecturally they
reduce to **two write-models over one cross-linked, city-scoped schema**: an editorial *publishing*
path (news + moderated submissions) and a machine-driven *directory* path (seeded listings + owner
claims), joined by a bidirectional relationship graph and shared taxonomies.

**Non-Functional Requirements:** 9 cross-cutting NFRs that drive the architecture more than any
single feature:
- **SEO/structured data (NFR1):** JSON-LD per type, canonicals, indexing gates on thin/unclaimed
  pages, facet crawl control.
- **Performance/CWV (NFR2):** LCP<2.5s, INP<200ms, CLS<0.1 → RSC-default, minimal client JS,
  disciplined ads.
- **Accessibility (NFR3):** WCAG 2.2 AA, esp. filters/search/calendar.
- **Trust & Safety (NFR4):** nothing user-originated public pre-approval; edits re-moderate;
  rate-limit + upload scanning.
- **Content quality at scale (NFR5):** broad-but-useful; no thin filler.
- **Data accuracy (NFR6) + Multi-tenancy (NFR7):** consistent NAP; pervasive city scoping with a
  cross-city isolation invariant.
- **Architectural boundaries (NFR8):** Server Actions for mutations, Route Handlers for public
  API/webhooks.
- **Privacy (NFR9):** CASL + PIPEDA at launch.

**Scale & Complexity:**
- Primary domain: full-stack SEO-critical web (content + geospatial directory).
- Complexity level: medium-high (high relative to solo capacity).
- Estimated architectural components: content/CMS + directory + cross-link graph + search +
  geospatial + moderation workflow + automation/ingestion pipelines + newsletter + monetization
  hooks + multi-tenant routing + SEO/structured-data layer.

### Technical Constraints & Dependencies

Locked stack (rationale to be captured, not relitigated): Next.js 16 App Router (RSC default; PPR +
tag-based revalidation); single PostgreSQL + PostGIS; Payload CMS 3.x (Next-native; admin, RBAC,
auto-API); Postgres FTS + `pg_trgm` at launch → Meilisearch/Typesense upgrade path;
persistent/container or pooling-optimized serverless Postgres host (Payload admin is pool-heavy).
Open "how" decisions catalogued in the PRD addendum.

### Cross-Cutting Concerns Identified

Cross-link graph integrity; city tenancy isolation; moderation/trust-&-safety across all write
paths; SEO/structured-data correctness (incl. seeding interaction); geospatial search; CWV
performance; WCAG accessibility; data provenance & lifecycle (seed-vs-claim); solo-operable
automation pipelines.

## Starter Template Evaluation

### Primary Technology Domain
Full-stack SEO-critical web (content + geospatial directory) — Next.js 16 App Router with Payload
CMS 3.x Next-native in `/app`.

### Version constraints (verified May 2026)
- **Next.js pinned to ≥ 16.2.6** (current 16.2.6). Payload does **not** support Next.js 15.5–16.1.x.
- **Payload ≥ 3.73.0** (first release with full Next.js 16.2.x support).
- React 19.2; Turbopack + React Compiler stable in Next 16.

### Starter Options Considered
- **Payload `website` template** — full front-end + SEO/draft/search/redirects plugins; but
  block-builder marketing front-end conflicts with our fixed custom designs (discarded front-end →
  low value here).
- **Payload `blank` template** — minimal Payload + Next App Router + Postgres adapter; clean base
  for a fully custom front-end. **Selected.**

### Selected Starter: Payload `blank` template (PostgreSQL)

**Rationale:** the custom pixel-specified design makes the website template's front-end throwaway;
`blank` keeps the codebase lean and lets us add exactly what the 62 FRs need (PostGIS, our
collections, custom RSC front-end, chosen plugins) plus Payload drafts/versions for moderation.

**Initialization Command:**
```bash
npx create-payload-app@latest -t blank --db postgres --name kingston-fyi
# then pin next@^16.2.6 and payload@^3.73.0; add PostGIS + plugins below
```

**Plugins/capabilities to add on top (official):**
`@payloadcms/db-postgres` (Drizzle-based) · `@payloadcms/plugin-seo` · `@payloadcms/plugin-redirects`
· `@payloadcms/plugin-search` · `@payloadcms/plugin-nested-docs` (hierarchical categories) · Payload
**drafts/versions** (→ moderation workflow) · PostGIS extension on the Postgres DB.

**Architectural Decisions Provided by Starter:**
- **Language & Runtime:** TypeScript-first, Node; Next.js 16 App Router (RSC default), Turbopack.
- **Styling:** Tailwind available; our design system layers on as CSS custom properties (from `design-system.md`).
- **Build Tooling:** Turbopack (stable default in Next 16).
- **Code Organization:** Payload-in-`/app` (admin + Local API co-located); Server Actions for
  mutations, Route Handlers for public API/webhooks.
- **Data layer:** `@payloadcms/db-postgres` (Drizzle) — informs the ORM decision.
- **Dev experience:** single `next dev`, Payload admin auto-generated, typed collections.

**Note:** Project initialization with this command should be the first implementation story;
immediately pin Next.js ≥16.2.6 / Payload ≥3.73.0 and enable PostGIS.

## Core Architectural Decisions

### Decision Priority Analysis
- **Critical (block implementation):** ORM, city-tenancy enforcement, geospatial approach,
  cross-link integrity, moderation workflow.
- **Important (shape architecture):** seed-vs-claim provenance, directory lifecycle, auth/RBAC,
  CAPTCHA, abuse controls, email/newsletter, search, background jobs, hosting, object storage.
- **Deferred (post-MVP):** RLS hardening, Meilisearch/Typesense, Redis cache layer, multi-region,
  native-reviews infra.

### Data Architecture
- **ORM → Drizzle via `@payloadcms/db-postgres`; Prisma rejected.** Payload's native adapter is
  Drizzle and has first-class PostGIS; Prisma would mean a second ORM with poor PostGIS support.
- **Geospatial → PostGIS:** `geometryColumn('point','POINT',4326)` + GiST index; radius / "near me" /
  map-bounds via `ST_DWithin` / `ST_MakeEnvelope` in raw SQL (`payload.db.drizzle.execute()`).
  Events carry an optional own point (FR62).
- **Data model →** Payload collections from `content-model.md`; `relationship` fields for cross-links;
  `plugin-nested-docs` for hierarchical business categories; a `city` relationship on every content
  entity.
- **Migrations →** Payload (Drizzle) migrations; a migration enables the `postgis` extension +
  spatial columns/indexes.
- **Caching →** Next.js data cache + tag-based revalidation (`revalidateTag` from Payload
  `afterChange` hooks). Redis cache layer deferred.
- **Search →** Postgres FTS + `pg_trgm` + `@payloadcms/plugin-search` at launch. Upgrade trigger:
  measured search latency/relevance/typo-tolerance problems or volume outgrowing FTS → Meilisearch/Typesense.

### Authentication & Security
- **Auth →** Payload built-in auth; business-owner accounts + operator/admin roles via RBAC;
  residents browse/submit without accounts (FR49).
- **City tenancy → application-layer enforcement** (mandatory `city` filter via Payload access
  control / `baseListFilter` on every collection) + a cross-link-same-city invariant enforced in
  validation hooks + tests. **RLS deferred** (Payload's pooled connection doesn't set per-request PG
  session vars; revisit as defense-in-depth when city #2 ships).
- **Claim verification →** website-meta / email-domain match + emailed code, operator approval as
  backstop. **Claim lifecycle:** `unclaimed → pending-claim → claimed`, plus `disputed / revoked /
  transferred` (FR57).
- **CAPTCHA → Cloudflare Turnstile** on submit/claim/newsletter forms.
- **Abuse →** rate-limit public mutations (Server Action wrapper + IP throttle); upload constraints
  (type/size + `sharp`).

### API & Communication Patterns
- **Mutations → Server Actions** (submit, claim, newsletter, owner edits) with Zod validation.
- **Public API / webhooks / jobs-trigger / sitemap / robots → Route Handlers.** Payload's auto
  REST/GraphQL is locked down; Local API used server-side in RSC.
- **Background work → Payload Jobs Queue** (cron `schedule`): aggregation (FR12), seeding (FR29),
  staleness checks (FR58), newsletter send (FR40) — `autoRun` on the persistent host.
- **Email → Resend** (chosen; alternatives Buttondown / self-host Listmonk) for transactional via
  Payload's email adapter **and** newsletter via Resend Broadcasts — **CASL-compliant** (explicit
  consent + unsubscribe).

### Data Acquisition & Enrichment (added 2026-05-31)

The cold-start seeding (FR29) + news aggregation (FR12) pipelines depend on three external
capabilities not in the original draft; decided with Chris on 2026-05-31:

- **Directory listing source → Google Places API (official).** Used as a **discovery + refresh**
  source, *not* a retained standalone database (Places ToS prohibits that). Store `place_id`
  indefinitely; Google-attributed Place fields are written with **provenance (FR56) = `google-places`
  and marked refresh-required** (re-fetched on the allowed cadence, never frozen as our own data).
  Places returns geometry, so Places-sourced listings need no separate geocoding. A listing's
  Google-sourced fields are *superseded and become ours* once an owner claims-and-edits (FR31/56) or
  the field is enriched from another source. Display/attribution rules respected on any live-rendered
  Places field. **No Google Maps scraping** (ToS + civic-trust posture — consistent with the rejected
  scrape-competitor-articles decision).
- **LLM inference → self-hosted / open-weights model** behind a swappable `lib/inference` client
  (job-level abstraction; provider replaceable without touching pipeline logic). Roles: normalize
  messy source data, categorize into the two-level business taxonomy, dedup-match (FR58), generate
  listing blurbs, and summarize primary-source press releases into operator-reviewed news **drafts**
  (FR12 — drafts only, never auto-published; competitors never republished). Tradeoff is **ops, not
  per-token cost**: requires an inference host (small GPU box or CPU-bound small model via
  vLLM/Ollama) reachable from the Railway Jobs Queue. All LLM output enters as **drafts/pending →
  moderation**, never bypassing the gate (NFR4/NFR5).
- **Geocoding → MapTiler Geocoding API** (already the chosen tile vendor; friendlier storage terms
  than Google, results retainable). Used for the non-Places paths — user submissions, manual entries,
  and open-data records lacking coordinates. No Google dependency for geo.

### Frontend Architecture
- **State →** URL search params as canonical filter/search state + minimal local state; no global
  store at MVP.
- **Map → MapLibre GL JS** (chosen; alternative Leaflet) + affordable tile source (MapTiler free tier
  or self-hosted Protomaps); client component, lazy-loaded; PostGIS-backed pins + bounds.
- **Forms →** React Hook Form + Zod (shared client + Server Action validation) for multi-step submit/claim.
- **Styling →** Tailwind + design-system CSS custom properties (`design-system.md`).
- **Performance →** RSC default, PPR, `next/image` (R2 remote), `next/font`, lazy-load map + AdSense,
  reserved ad slots (no CLS); calendar = `date-fns` + custom month grid.

### Infrastructure & Deployment
- **Hosting → Railway** (chosen; persistent container host enabling Jobs `autoRun`; Postgres+PostGIS,
  cron, pooling; alternatives Fly.io / Hetzner / DO; Neon only if going serverless-leaning).
- **Object storage → Cloudflare R2** via `@payloadcms/storage-s3` (zero egress; `generateFileURL` for CDN).
- **CI/CD →** GitHub Actions → deploy; Payload migrations on deploy (incl. PostGIS enable).
- **Observability →** Sentry (errors) + privacy-friendly analytics (Plausible/Umami) + Google Search Console.
- **Region →** Canada / US-East (close to Kingston).

### Decision Impact Analysis
**Implementation sequence:** (1) `create-payload-app` blank + pin versions + enable PostGIS →
(2) collections + city scoping + cross-link relations → (3) moderation/drafts + auth/RBAC →
(4) directory seeding + provenance + geospatial → (5) front-end from design + map/search →
(6) jobs (aggregation/newsletter) + SEO/JSON-LD → (7) monetization hooks.
**Cross-component dependencies:** city scoping touches every collection + query; moderation gates
every public surface; PostGIS underpins directory list+map+sort; Jobs Queue drives content freshness.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined
Conflict points for a Payload + Next.js + Postgres/Drizzle, cross-linked, multi-tenant, SEO-critical
app. Principle: **follow framework idioms; centralize the few cross-cutting rules.**

### Naming Patterns
- **Database (Payload-managed):** never hand-name tables. Collection slugs are lowercase-plural kebab
  (`articles`, `events`, `businesses`, `neighbourhoods`, `business-categories`, `reviews`, `cities`);
  Payload/Drizzle generates snake_case tables/columns.
- **IDs → UUID** (`idType: 'uuid'`) — non-enumerable; safe across merges/dedup + multi-city.
- **URLs/slugs (SEO-load-bearing, stable):** `/news/[category]/[slug]`, `/events/[slug]`,
  `/directory/[category]/[slug]`, `/business/[slug]`, `/neighbourhood/[slug]`. Slugs are kebab-case,
  generated from a `slug` field, **immutable once published** (changes emit a redirect via
  `plugin-redirects`).
- **Code:** Components `PascalCase.tsx`; route segments lowercase; hooks `useX`; collection configs
  `kebab-case.ts` under `src/collections/`; functions/vars `camelCase`.

### Structure Patterns
- Payload route groups: `src/app/(frontend)/…` (public site) and `src/app/(payload)/…` (admin).
  Plus `src/collections/`, `src/fields/`, `src/access/`, `src/hooks/`, `src/jobs/`, `src/lib/`
  (shared SEO + city helpers), `src/components/` organized **by pillar** (news/events/directory/shared).
- **Tests:** co-located `*.test.ts(x)`; end-to-end under `tests/`.

### Format Patterns
- **Dates:** store UTC ISO 8601; display in America/Toronto; date math via `date-fns`.
- **JSON:** camelCase; booleans true/false; null over empty-string for "absent."
- **Server Action result:** `{ ok: true, data } | { ok: false, error: { code, message, fields? } }`.
- **Route Handler errors:** `{ error: { code, message } }` + correct HTTP status.

### Communication Patterns
- **Cross-links → always typed Payload `relationship` fields**, never free-form ID strings.
  **Reverse links are derived by query, never stored** (prevents FR55 integrity drift).
- **Revalidation tags:** `entity:{id}` (e.g. `business:{id}`), `list:{city}:{pillar}`
  (e.g. `list:kingston:events`), `cross:{id}` for related rails — fired from Payload
  `afterChange`/`afterDelete` hooks so cross-link edits revalidate both sides.
- **Jobs:** task names kebab-case (`aggregate-press-releases`, `seed-directory`, `send-newsletter`,
  `check-staleness`).

### Process Patterns
- **Validation:** shared Zod schemas reused by client (React Hook Form) and Server Action.
- **City scoping → the one mandatory rule:** every collection uses a shared `cityScoped()`
  access/filter helper; no query omits the city constraint (enforces NFR7). A cross-link validation
  hook asserts endpoints share `city`.
- **Moderation gate:** a reused `published()` access helper (status approved/published only) guards
  every public surface; edits to published content re-enter draft.
- **SEO → centralized:** one `generateMetadata` helper + one JSON-LD builder per entity type
  (NewsArticle/Event/LocalBusiness), emitted in exactly one place (and `aggregateRating` never added).

### Enforcement Guidelines
**All implementers MUST:** use `cityScoped()` on every query; route public reads through `published()`;
create cross-links only via `relationship` fields; emit structured data only through the shared
JSON-LD helpers; generate slugs via the slug field + redirect-on-change.
**Tooling:** TypeScript `strict`, ESLint + Prettier, Payload-generated types as source of truth.

**Anti-patterns to avoid:** raw cross-table SQL bypassing `cityScoped()`; storing reverse-link arrays;
emitting self-serving `aggregateRating`; mutable published slugs; per-feature ad-hoc metadata/JSON-LD.

## Project Structure & Boundaries

### Complete Project Directory Structure
```
kingston-fyi/
├── package.json                      # next ^16.2.6, payload ^3.73.0, @payloadcms/db-postgres, drizzle,
│                                     #   maplibre-gl, resend, zod, react-hook-form, date-fns
├── next.config.mjs                   # withPayload(); images.remotePatterns (R2 CDN); PPR
├── tsconfig.json · tailwind.config.ts · .env.example · .gitignore
├── .github/workflows/ci.yml          # lint · typecheck · test · payload migrate · deploy (Railway)
├── migrations/                       # Payload/Drizzle migrations — incl. 0000_enable_postgis
├── public/
├── tests/                            # Playwright e2e (directory filters, submit→moderation, claim)
└── src/
    ├── payload.config.ts             # collections, db-postgres({extensions:['postgis']}), plugins
    │                                 #   (seo/redirects/search/nested-docs), email (Resend),
    │                                 #   storage-s3 (R2), jobs queue
    ├── payload-types.ts              # generated — source of truth for types
    ├── app/
    │   ├── (frontend)/               # PUBLIC SITE (RSC default)
    │   │   ├── layout.tsx            # shell: Header/Footer, fonts, design-system tokens
    │   │   ├── page.tsx              # Home hub (FR53)
    │   │   ├── news/page.tsx · news/[category]/[slug]/page.tsx           # FR7–11
    │   │   ├── events/page.tsx (list⇄calendar) · events/[slug]/page.tsx  # FR13–18,54
    │   │   ├── directory/[[...filters]]/page.tsx · business/[slug]/page.tsx # FR20–28
    │   │   ├── neighbourhood/[slug]/page.tsx                             # FR39
    │   │   ├── submit/page.tsx                                           # FR30
    │   │   ├── sitemap.ts · robots.ts                                    # NFR1
    │   │   └── api/                  # Route Handlers (public): search, geo, og, webhooks/*, payload-jobs/run (cron)
    │   └── (payload)/                # Payload admin + auto API (generated; public REST/GraphQL locked down)
    ├── collections/                  # Cities, Articles, Events, Businesses, Reviews, Neighbourhoods,
    │                                 #   NewsCategories, EventCategories, BusinessCategories,
    │                                 #   Submissions, Claims, Media, Users
    ├── fields/                       # slugField, cityField, pointField (geometryColumn), seoFields, provenance/lockedFields
    ├── access/                       # cityScoped(), published(), isAdmin(), isBusinessOwner()
    ├── hooks/                        # revalidate (tag conventions), crossLinkCityInvariant, slug+redirect,
    │                                 #   seedProvenanceGuard, moderationState
    ├── jobs/                         # aggregate-press-releases, seed-directory, send-newsletter, check-staleness, dedup-flag
    ├── lib/
    │   ├── seo/                      # jsonld builders (article/event/localBusiness/org/breadcrumb) + generateMetadata helper
    │   ├── geo/                      # PostGIS queries (ST_DWithin/ST_MakeEnvelope), geocoding
    │   ├── search/                   # FTS + pg_trgm queries; plugin-search wiring
    │   ├── city.ts                   # hostname → city resolution (FR5)
    │   └── validation/               # shared Zod schemas (submit, claim, newsletter)
    ├── actions/                      # Server Actions: submitListing, claimListing, subscribeNewsletter, ownerEdit
    ├── components/
    │   ├── shared/                   # Header, Footer, SearchBar, NewsletterBand, Tag, Stars, Ph, Icon, Map (MapLibre, lazy)
    │   ├── news/ · events/ · directory/   # cards, filter panel, calendar grid, split list+map
    │   └── ads/                      # AdSense slot (reserved, lazy)
    └── styles/globals.css            # design-system CSS custom properties (design-system.md)
```

### Architectural Boundaries
- **Write boundary:** all public mutations go through **Server Actions** (`src/actions/`) → Payload
  Local API (with `cityScoped()` + Zod + Turnstile). No direct DB writes from components.
- **Public API boundary:** **Route Handlers** (`app/(frontend)/api/`) for search, geo, OG images,
  inbound **webhooks**, and the **jobs cron trigger**. Payload's auto REST/GraphQL is access-locked;
  RSC reads use the **Local API** directly.
- **Data boundary:** Postgres via `@payloadcms/db-postgres` only; geospatial via `lib/geo`; every
  query passes through `cityScoped()`; reverse cross-links derived, never stored.
- **Component boundary:** RSC by default; Client Components limited to directory filters/map, events
  calendar, and search (URL-param state).

### Requirements → Structure Mapping
| FR group | Lives in |
|---|---|
| Platform/Shell, search (FR1–6) | `components/shared/`, `lib/search`, `lib/city.ts`, `(frontend)/layout.tsx` |
| News (FR7–12) | `collections/Articles`, `(frontend)/news/*`, `jobs/aggregate-press-releases` |
| Events (FR13–19, 54) | `collections/Events`, `(frontend)/events/*`, `components/events` |
| Directory (FR20–29) | `collections/Businesses`, `(frontend)/directory|business/*`, `lib/geo`, `components/directory`, `jobs/seed-directory` |
| Submission/Claim/Moderation (FR30–36, 55–60) | `collections/{Submissions,Claims}`, `actions/*`, `hooks/*`, `access/*`, Payload drafts |
| Cross-linking (FR37–39, 55) | `relationship` fields + `hooks/crossLinkCityInvariant` + `lib/seo` rails |
| Newsletter (FR40–41) | `actions/subscribeNewsletter`, `jobs/send-newsletter` (Resend) |
| Monetization (FR42–47) | featured-flag fields, `components/ads`, claim-subscription scaffolding |
| Admin/CMS (FR48–49) | `(payload)/`, `collections/Users`, `access/` |

### Integration Points & Data Flow
- **Inbound content:** Jobs Queue (cron) → press-release/feed ingestion + directory seeding → Payload
  collections (drafts/pending) → moderation → publish → `revalidateTag`.
- **External services:** R2 (media), Resend (email/newsletter), MapLibre tiles (MapTiler/Protomaps),
  **Google Places API** (directory discovery/refresh — ToS-bounded, see Data Acquisition),
  **MapTiler Geocoding** (non-Places address→coords), **self-hosted LLM inference** (open-weights,
  seeding/aggregation enrichment), Turnstile (CAPTCHA), AdSense, Sentry, analytics.
- **Read flow:** RSC pages → Local API (cityScoped + published) → cached + tag-revalidated → JSON-LD +
  metadata via `lib/seo`.

### Development / Build / Deploy
- **Dev:** single `next dev` (Turbopack) with Payload admin co-located; local Postgres+PostGIS (Docker).
- **Build:** `next build`; Payload migrations run on deploy.
- **Deploy:** GitHub Actions → Railway (app + managed Postgres/PostGIS + cron for jobs).

## Architecture Validation Results

### Coherence Validation ✅
- **Decision compatibility:** Next.js ≥16.2.6 + Payload ≥3.73.0 verified compatible; Drizzle/PostGIS
  native to the Payload adapter; Jobs Queue + persistent host (Railway) consistent; R2/Resend/
  Turnstile/MapLibre integrate cleanly. No contradictory decisions.
- **Pattern consistency:** naming/URL/tag/city-scoping/SEO patterns align with Payload + Next idioms;
  the mandatory `cityScoped()` + `published()` helpers are coherent with multi-tenancy + moderation.
- **Structure alignment:** the `(frontend)`/`(payload)` tree, `actions/` (Server Actions) and `api/`
  (Route Handlers) boundaries directly realize the NFR8 module-boundary rule.

### Requirements Coverage Validation ✅
- **FR coverage:** all 62 FRs map to concrete locations (Requirements→Structure table). Cross-link
  integrity (FR55), seed-vs-claim provenance (FR56), claim lifecycle (FR57), lifecycle/dedup (FR58),
  edit re-moderation (FR59), moderation operability (FR60) each have explicit homes.
- **NFR coverage:** SEO (lib/seo + plugins + indexing gates), CWV (RSC/PPR/lazy/reserved slots),
  Trust&Safety (drafts+Turnstile+rate-limit), data-accuracy (provenance+claim), multi-tenancy
  (cityScoped + same-city invariant), boundaries (Server Actions/Route Handlers), privacy
  (Resend/CASL). Accessibility addressed in patterns; needs CI tooling (see gaps).

### Implementation Readiness Validation ✅
- Decision completeness (versions + rationale), structure completeness (tree + boundaries + FR map),
  and pattern completeness (naming/structure/format/communication/process + anti-patterns) all confirmed.

### Gap Analysis Results
- **Critical:** none open.
- **Important (track, non-blocking):** accessibility automated testing (axe-core in CI); ToS-safe
  source for seeded ratings/reviews (FR61); DB backup/DR policy.
- **Nice-to-have:** upload virus scanning; claim-verification exact mechanism; staging environment.

### Validation Issues Addressed
The 5 PRD-critical gaps from the PRD reviewer gate were resolved into requirements (FR53–62) and are
architecturally supported here. Remaining items are hardening-level (implementation backlog).

### Architecture Completeness Checklist
**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment
**Overall Status:** READY FOR IMPLEMENTATION (all 16 checklist items confirmed; no critical gaps —
listed important gaps are hardening items for the implementation backlog, not blockers).
**Confidence Level:** high.
**Key Strengths:** stack-native geospatial + cross-link graph; one enforced city-scoping rule;
moderation via Payload drafts; automation via Jobs Queue fits the solo/automation-first goal;
centralized SEO.
**Areas for Future Enhancement:** RLS defense-in-depth at city #2; Meilisearch/Typesense; Redis cache;
a11y CI tooling; backups/DR formalization; seeded-ratings ToS source.

### Implementation Handoff
**AI Agent Guidelines:** follow decisions exactly; use `cityScoped()` + `published()` + shared SEO
helpers; respect the Server Action / Route Handler boundary; consult this document for architectural questions.
**First Implementation Priority:** `npx create-payload-app@latest -t blank --db postgres --name kingston-fyi`,
then pin Next ≥16.2.6 / Payload ≥3.73.0 and enable PostGIS.
