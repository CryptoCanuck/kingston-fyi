---
stepsCompleted: [1, 2, 3, 4]
status: complete
completedAt: 2026-05-31
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-kingston.fyi-2026-05-31/prd.md
  - _bmad-output/planning-artifacts/prds/prd-kingston.fyi-2026-05-31/addendum.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/briefs/brief-kingston.fyi-2026-05-30/brief.md
  - _bmad-output/planning-artifacts/design-reference/content-model.md
  - _bmad-output/planning-artifacts/design-reference/screen-inventory.md
  - _bmad-output/planning-artifacts/design-reference/design-system.md
title: kingston.fyi — Epic Breakdown
project_name: kingston.fyi
user_name: Chris
date: 2026-05-31
---

# kingston.fyi - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for kingston.fyi, decomposing the requirements from the PRD, the design reference (UX), and the Architecture decision document into implementable stories.

## Requirements Inventory

### Functional Requirements

**Platform & Global Shell**
- FR1: Responsive global shell — sticky header (wordmark, nav News/Events/Directory, persistent search, Submit CTA), collapsing to hamburger + search drawer on mobile.
- FR2: Global footer — section links, social links, newsletter signup.
- FR3: Unified search with autocomplete spanning all three pillars (News + Events + Businesses); each result routes to its detail page; full query routes to directory/results.
- FR4: Shared taxonomies usable as facets across pillars — Neighbourhoods, news categories, event categories, two-level business category hierarchy (parent → leaf).
- FR5: Multi-city-ready — every content entity scoped to a city; taxonomies + routing city-aware; Kingston only city live at launch; city resolution by hostname.
- FR6: SEO surfaces — per-page metadata, sitemap, robots, canonical URLs, JSON-LD; site-wide Organization + BreadcrumbList.

**Local News**
- FR7: Article entity — title, dek, body, author/byline, publish date, read-time, category, hero image, cross-link references to related events + mentioned businesses.
- FR8: News listing — category sub-nav (Local, Politics, Business, Sports, Arts & Culture, Opinion), lead story + responsive grid, Trending list + newsletter sidebar.
- FR9: Article detail with a "Related" rail rendering linked events + mentioned businesses (cross-link made visible).
- FR10: News is free / no paywall — all articles fully readable without account or payment.
- FR11: Each article emits NewsArticle JSON-LD.
- FR12: Content aggregation pipeline — ingest from primary sources (institutional press releases, public feeds) and assist operator-authored drafts; competitors are a signal source only, never republished.

**Events**
- FR13: Event entity — title, blurb, start/end datetime, display date/time, category, neighbourhood, price + free/paid flag, image, venue link to a directory business (nullable), related-news cross-links.
- FR14: Events page with List ⇄ Calendar (month grid) toggle.
- FR15: List view grouped into derived time buckets — Today / This Weekend / Next Week / This Month (derived from start datetime relative to now).
- FR16: Always-visible filter bar — date presets, category, neighbourhood, Free/Paid.
- FR17: Event detail — full info, embedded map, Add to Calendar (ICS), link through to the venue's directory page.
- FR18: Each event emits Event JSON-LD.
- FR19: Events may be aggregated (seeded) or user-submitted (via FR30, moderated).

**Business Directory (centerpiece)**
- FR20: Business listing entity — name, blurb, leaf + parent category, neighbourhood, price tier, structured hours, derived Open Now, address, phone, website, amenity tags, geocoordinates, photos, rating + review count (display), cross-links to events hosted at the venue.
- FR21: Directory page — filter panel visible by default (desktop) with Open-Now toggle, hierarchical category, neighbourhood, minimum rating, price; three-pane split (filters | scrollable business cards | interactive map with pins); result count shown.
- FR22: Map ⇄ list hover/selection sync (hovering a card highlights its pin and vice versa); pins route to the business detail page.
- FR23: Sort control — Relevance / Rating / Distance / Newest / A–Z (with null-rating handling).
- FR24: Geospatial search — radius / "near me" / map-bounds queries (PostGIS); Distance sort depends on it.
- FR25: Mobile directory — single column with list/map toggle + slide-in filter drawer and an "apply / show N results" action.
- FR26: Active-filter chips with individual + clear-all removal.
- FR27: Business detail — photo gallery, header (open/closed + hours, rating, category·price·neighbourhood), amenity tags, About, "Upcoming events at this venue" rail (cross-link), reviews section (display + histogram), sticky contact card + embedded map + structured hours.
- FR28: Each business emits the most-specific LocalBusiness subtype JSON-LD; self-serving aggregateRating is NOT emitted.
- FR29: Directory seeding — listings seeded from public sources to city-wide density before any owner engagement; store only permissible factual NAP fields per source ToS.

**Submission, Claiming & Moderation (trust & safety)**
- FR30: Public Submit flow (multi-step: Type → Details → Location & Media → Review) for a business or an event, with photo upload and a clear "reviewed before publishing" notice.
- FR31: Claim-this-listing flow — an owner claims a seeded/existing business, verifies ownership, gains edit ability.
- FR32: Moderation queue for all user-originated content (submissions, claims, claimed-listing edits): status pending → approved → published; never auto-publish.
- FR33: CAPTCHA on public submission/claim forms.
- FR34: Duplicate detection on submissions (flag likely duplicates for the moderator).
- FR35: Email notifications to submitters/claimants on receipt and on publish/decision.
- FR36: Operator moderation dashboard — review, approve, reject, edit, merge duplicates.

**Cross-Linking (the wedge)**
- FR37: Bidirectional relationships first-class and navigable in both directions — Article↔Event, Article↔Business, Event↔Business (venue); reverse links derived, not hand-kept.
- FR38: Cross-link rails render on Article detail (FR9), Event detail (FR17), Business detail (FR27).
- FR39: Shared neighbourhood/category facets connect items across pillars; neighbourhood landing pages MVP-light, full cross-pillar facet hubs Phase 2.

**Newsletter**
- FR40: Email newsletter — signup (shell + footer + inline bands), subscriber management, curated digest of news + events + a featured business; weekly at launch, daily later.
- FR41: A newsletter issue can include a sponsor slot (monetization hook; see FR47).

**Monetization Hooks (passive-first)**
- FR42: Businesses can be flagged/ranked as featured/promoted (paid placement) in the directory and relevant surfaces.
- FR43: Business claim subscription tiers (enhanced profile capabilities for paid claims) — [Phase 2 for billing; data model + claimed-listing capability ship at MVP].
- FR44: Google AdSense programmatic display units under strict CWV/brand discipline (limited, lazy-loaded, reserved slots, no interstitials).
- FR45: [Phase 2] Direct local display-ad sales and bespoke sponsored content.
- FR46: [Phase 2] Business analytics dashboard for claimed/subscribed listings.
- FR47: Newsletter sponsorship slot management (pairs with FR41).

**Admin / CMS**
- FR48: Role-based admin (CMS) for content CRUD across all entities, the moderation queue, taxonomy management.
- FR49: Auth — business owners hold accounts to claim/manage listings; operator/editor holds an admin role; residents browse and submit without an account at MVP.

**Later-phase functional scope (not MVP)**
- FR50: [Phase 2] Native user reviews & ratings capture (with moderation; ratings from approved reviews only).
- FR51: [Phase 2] Typo-tolerant / faceted / instant search via Meilisearch/Typesense (MVP uses Postgres FTS + pg_trgm).
- FR52: [Phase 2] Additional city domains brought live on the shared platform.

**Data Integrity, Lifecycle, Claim Governance & Operability**
- FR53: Home hub page — composed landing page (featured/hero story, "Happening This Weekend" events, latest news, featured businesses, newsletter band) with defined selection rules for hero/featured slots.
- FR54: Calendar view behavior — month grid with navigation, day cells showing events, day-selection drill-in, FR16 filters apply; events placed by start datetime.
- FR55: Cross-link referential integrity — cross-link references never dangle; on delete/unpublish/merge/unclaim, references resolve gracefully (hidden or repointed) and reverse-link rails stay consistent.
- FR56: Seed-vs-claim provenance — listing fields track source (seeded vs owner-edited); re-seeding never overwrites owner-edited or claimed fields; conflicts surface to moderation.
- FR57: Claim lifecycle governance — competing/dual claims, ownership disputes, revocation (fraud/abuse), transfer (business sold); who may edit while unclaimed vs claimed.
- FR58: Listing lifecycle states & dedup — listings carry a state (active / temporarily-closed / permanently-closed / stale-unverified); seeded duplicates detected and merged, preserving cross-links.
- FR59: Edit re-moderation — edits to already-published user-originated content re-enter the moderation queue; state machine covers published → edited → pending.
- FR60: Moderation operability — bulk approve/reject, prioritized/triaged queue, duplicate-flag assist, trusted-source staging.
- FR61: Review data & rating provenance — Review entity (author, rating 1–5, date, text) + business rating + count defined; MVP shows sourced/imported ratings (provenance labelled); histogram reflects available data; native capture is Phase 2; null-rating listings render and sort gracefully.
- FR62: Event location — optional own location (address + geocoordinates) used when no venue business, so FR17's map and Event JSON-LD always have a place; venue-linked events inherit the venue's location.

### NonFunctional Requirements

- NFR1: SEO & Structured Data (core) — JSON-LD (NewsArticle, Event always with location, most-specific LocalBusiness with no self-serving aggregateRating, site-wide Organization + BreadcrumbList); sitemap, robots, per-page generated metadata, canonical URLs; correct canonicals for aggregated content; thin/unclaimed listing pages gated from indexing (noindex/quality threshold) until enriched or claimed; filter/facet URL combinations crawl-controlled.
- NFR2: Performance / Core Web Vitals — LCP < 2.5s, INP < 200ms, CLS < 0.1; Server Components by default, minimal client JS (filters/map/search only), optimized images + fonts, streaming; ad units must not regress CWV (reserved slots, lazy-load).
- NFR3: Accessibility — WCAG 2.2 AA, with explicit attention to directory filters, search, events calendar (keyboard, focus, contrast, labels).
- NFR4: Trust & Safety — nothing user-originated publicly visible before approval (incl. edits to published content, which re-enter moderation); CAPTCHA + duplicate detection on public forms; rate limiting + upload constraints/scanning; claim disputes/revocation handled; moderation actions auditable.
- NFR5: Content quality at scale — broad automated coverage must be genuinely useful (real data / primary sources); guard against thin/auto-filler pages.
- NFR6: Data accuracy — listing data (esp. NAP) consistent and current; claim flow is primary accuracy-improvement path; respect source ToS on stored fields.
- NFR7: Multi-tenancy readiness — city scoping pervasive in data + routing without per-city code forks; invariant: cross-link endpoints must share the same city (no cross-city references or query bleed); neighbourhood + category taxonomies per-city.
- NFR8: Architectural boundaries — Server Actions for form mutations; Route Handlers for public API + webhooks (no tangled mini-backend).
- NFR9: Privacy/compliance — subscriber + submitter emails and business-owner accounts handled per Canadian norms; CASL (email) and PIPEDA apply at launch.

### Additional Requirements

_Technical/infrastructure requirements from the Architecture Decision Document that shape stories._

- AR1 (Starter / Story 1.1): Scaffold via `npx create-payload-app@latest -t blank --db postgres --name kingston-fyi`; pin Next.js ≥16.2.6 + Payload ≥3.73.0 (15.5–16.1.x unsupported); enable PostGIS; ORM = Drizzle via `@payloadcms/db-postgres` (Prisma rejected).
- AR2: Official plugins layered on the blank template — `@payloadcms/plugin-seo`, `plugin-redirects`, `plugin-search`, `plugin-nested-docs` (hierarchical categories); Payload drafts/versions (moderation); `@payloadcms/storage-s3` (R2); Resend email adapter; Payload Jobs Queue.
- AR3: UUID primary keys (`idType: 'uuid'`) across all collections.
- AR4: City scoping is the one mandatory query rule — shared `cityScoped()` access/`baseListFilter` on every collection; `crossLinkCityInvariant` validation hook asserts cross-link endpoints share a city. (RLS deferred to city #2.)
- AR5: Moderation via Payload drafts/versions — reused `published()` access helper guards every public surface; state machine pending → approved → published; edits to published content re-enter draft (FR59).
- AR6: Geospatial via PostGIS — `geometryColumn('point','POINT',4326)` + GiST index; radius/near-me/map-bounds via `ST_DWithin`/`ST_MakeEnvelope` in raw SQL (`payload.db.drizzle.execute()`); migration `0000_enable_postgis`.
- AR7: Write boundary = Server Actions (`src/actions/`) → Payload Local API with `cityScoped()` + Zod + Turnstile + rate-limit; public API/webhooks/jobs-cron/sitemap/robots = Route Handlers; Payload auto REST/GraphQL access-locked; RSC reads use Local API.
- AR8: Tag-based revalidation conventions — `entity:{id}`, `list:{city}:{pillar}`, `cross:{id}` — fired from Payload `afterChange`/`afterDelete` hooks so cross-link edits revalidate both sides.
- AR9: Centralized SEO layer — `lib/seo/` JSON-LD builders (article/event/localBusiness/org/breadcrumb) + one `generateMetadata` helper; `sitemap.ts`/`robots.ts`; noindex gating for thin/unclaimed pages; facet/filter crawl control; canonical strategy for aggregated content; aggregateRating never emitted.
- AR10: SEO-load-bearing slugs — `slug` field, kebab-case, immutable once published; changes emit a redirect via `plugin-redirects`. URL patterns: `/news/[category]/[slug]`, `/events/[slug]`, `/directory/[category]/[slug]`, `/business/[slug]`, `/neighbourhood/[slug]`.
- AR11: Map = MapLibre GL JS (client component, lazy-loaded) + tile source (MapTiler free tier / self-hosted Protomaps); PostGIS-backed pins + bounds.
- AR12: Forms = React Hook Form + Zod with shared schemas reused client + Server Action; multi-step submit/claim.
- AR13: Hosting = Railway (persistent container, Jobs `autoRun`, managed Postgres+PostGIS, cron); CI/CD = GitHub Actions (lint · typecheck · test · payload migrate · deploy); region Canada / US-East.
- AR14: Object storage = Cloudflare R2 via `@payloadcms/storage-s3` (zero egress, CDN `generateFileURL`); `next/image` `remotePatterns` for R2.
- AR15: Observability = Sentry (errors) + privacy-friendly analytics (Plausible/Umami) + Google Search Console.
- AR16: Auth = Payload built-in; RBAC roles — operator/admin + business-owner; residents browse/submit without accounts.
- AR17: Claim verification = website-meta / email-domain match + emailed code, operator approval as backstop; claim lifecycle `unclaimed → pending-claim → claimed`, plus `disputed / revoked / transferred`.
- AR18: Seed-vs-claim provenance — field-level source tracking + `seedProvenanceGuard` hook so re-seeding only fills unclaimed, un-edited fields.
- AR19: Project structure — `(frontend)` / `(payload)` route groups; `collections/`, `fields/`, `access/`, `hooks/`, `jobs/`, `lib/`, `actions/`, `components/` organized by pillar (news/events/directory/shared); co-located `*.test.ts(x)`; Playwright e2e under `tests/`.
- AR20: Background jobs (Payload Jobs Queue, cron) — `aggregate-press-releases`, `seed-directory`, `send-newsletter`, `check-staleness`, `dedup-flag`; all ingestion writes land as drafts/pending → moderation, never auto-published.
- AR21: Hardening backlog (track, non-blocking) — axe-core a11y testing in CI; ToS-safe source for seeded ratings/reviews (FR61); DB backup/DR policy; upload constraints + `sharp` (virus scanning nice-to-have).
- AR22 (Data acquisition — directory): **Google Places API** as a ToS-bounded **discovery + refresh** source for `seed-directory` — store `place_id` indefinitely; Google-attributed fields written with provenance `google-places` + marked refresh-required (re-fetched on allowed cadence, never frozen as our own); superseded/owned once claimed-and-edited (FR31/56) or enriched elsewhere; Places geometry used directly (no geocoding for Places listings); display/attribution rules honored. **No Google Maps scraping.**
- AR23 (Data acquisition — LLM): **self-hosted / open-weights LLM** behind a swappable `lib/inference` client for normalize/categorize/dedup-match/blurb-generation/press-release-summarization; tradeoff is ops (inference host: small GPU or CPU-bound vLLM/Ollama reachable from the Jobs Queue), not per-token cost; **all LLM output enters as drafts/pending → moderation** (NFR4/NFR5); competitors never republished (FR12).
- AR24 (Data acquisition — geocoding): **MapTiler Geocoding API** (already the tile vendor; retainable results) for non-Places address→coords paths (user submissions, manual/open-data entries). No Google dependency for geo.

### UX Design Requirements

_First-class actionable work items extracted from the design-reference (design-system.md + screen-inventory.md). The visual system is fixed/custom (a key reason the Payload `blank` template was chosen)._

- UX-DR1: Implement the civic-editorial design system as CSS custom properties in `styles/globals.css` — full color token set (limestone `--paper`/`--limestone`/`--card`, slate `--slate-900..500`, ink `--ink`/`--ink-soft`/`--ink-faint`, amber `--accent` family, six editorial `--tag-*` category colors, `--line`/shadow tokens). Explicitly no SaaS purple gradients.
- UX-DR2: Typography system — Newsreader serif headlines (600, leading 1.12, `letter-spacing -0.01em`, `text-wrap: balance`) + Source Sans 3 body (17px/1.55) via `next/font`; eyebrow style (800, uppercase, `letter-spacing .14em`, accent-strong).
- UX-DR3: Spacing/radius/layout tokens — density (`--gap` 24px, `--pad` 22px), radius scale (`--r-sm` 5, `--r` 9, `--r-lg` 14, `--r-pill` 999), container `--maxw` 1240px with `.kf-wrap` 28px gutters.
- UX-DR4: Atom components — `btn` (primary/dark/ghost, sm/lg), `tag` + `tag-outline`, `chip` (filter pill, `is-active`), form `field`/`input`/`select`/`textarea`, `eyebrow`, `stars`, `meta` rows, `Switch`, `Check`, `Radio`, `Icon` (inline SVG set), `Ph` placeholder, `Logo` wordmark.
- UX-DR5: Molecule components — `SearchBar` (cross-pillar autocomplete suggestions), `CatTag`, `PriceTag`, `section-head` (titled section + "more" link + slate underline), `FilterGroup`, `ContactRow`, `ReviewLine`, margin-based card bodies (`.cb`, not flex gap — render/print-safe).
- UX-DR6: Organism components — `Header` (sticky, collapsing), `Footer`, `NewsletterBand` ("The Limestone Letter"), `NewsCard`/`EventCard`/`BusinessCard` (lead/grid/row/list variants), `DirFilters` (directory filter panel), `KMap` (interactive MapLibre map with hover-synced pins).
- UX-DR7: Home hub layout (Screen 1) — hero story + secondary grid, "Happening This Weekend" event strip, "Latest News" grid, "Discover Local Businesses" featured row, newsletter band.
- UX-DR8: News listing layout (Screen 2) — category sub-nav, lead story + article-card grid, Trending + newsletter sidebar.
- UX-DR9: Article detail layout (Screen 3) — headline/byline/date/read-time/hero/body + "Related" rail (events + businesses) with `.kf-cross` hover highlight.
- UX-DR10: Events layout (Screens 4/5) — LIST ⇄ CALENDAR toggle, always-visible filter bar, time-bucket grouping (Today/This Weekend/Next Week/This Month) in list, month grid in calendar; event detail with embedded map + Add to Calendar + venue link.
- UX-DR11: Directory layout (Screen 6) — top autocomplete search, left `DirFilters` panel visible by default (Open Now switch, hierarchical category checkboxes, neighbourhood select, min-rating radios, price chips, clear-all + active chips), sort control, three-pane split (filters | card list | map), result count.
- UX-DR12: Business detail layout (Screen 7) — photo-gallery mosaic, header (open/closed pill, stars, category·price·neighbourhood, share/visit), amenity tags, About, "Upcoming events at this venue" rail, reviews + rating histogram, sticky contact card + embedded map + structured hours (today highlighted).
- UX-DR13: Submit wizard (Screen 8) — 4-step stepper (Type · Details · Location & Media · Review) + done state, with explicit "reviewed before going live (~2 business days)" notice and submit-another confirmation.
- UX-DR14: Cross-pillar search autocomplete — single suggestion list mixing News + Events + Businesses, each routing to its detail page.
- UX-DR15: Map ⇄ list hover synchronization in the directory (shared `hovered` state — card hover highlights pin and vice versa).
- UX-DR16: Route transitions transform-only, never opacity (`.kf-route` / transform keyframes) — deliberate robustness so throttled animation can't hide content; card bodies use margin-based stacking.
- UX-DR17: Responsive breakpoints — ≤1100px (news/biz grids → 2-col, detail → single col, directory map hides), ≤860px (header → hamburger + search drawer, directory → single column with list/map toggle + slide-in filter drawer), ≤560px (base font 16px, biz grid 1-col, event cards drop thumbnail, calendar cells → dots, stepper labels hide).
- UX-DR18: Theming hooks as design-system variables — accent color, dark masthead (`dark` prop on Header/Footer), headline font, card style (`data-cardstyle`), corner radius, density.
- UX-DR19: WCAG 2.2 AA implementation across interactive surfaces (directory filters, search, events calendar) — keyboard operability, visible focus, contrast, labels (realizes NFR3).

### FR Coverage Map

- FR1 (responsive shell): Epic 1 — global header/nav/search-affordance/Submit CTA + mobile collapse
- FR2 (footer): Epic 1 — section/social links + newsletter signup
- FR3 (unified cross-pillar search): Epic 6 — FTS + autocomplete (needs all pillars live)
- FR4 (shared taxonomies): Epic 1 — Neighbourhood/News/Event/Business-category collections + admin
- FR5 (multi-city-ready): Epic 1 — city scoping + hostname→city resolution
- FR6 (SEO surfaces): Epic 1 — metadata/sitemap/robots/canonicals + Org+BreadcrumbList infra
- FR7 (Article entity + cross-links): Epic 4
- FR8 (news listing): Epic 4
- FR9 (article detail + Related rail): Epic 4
- FR10 (free/no paywall): Epic 4
- FR11 (NewsArticle JSON-LD): Epic 4
- FR12 (news aggregation pipeline): Epic 4 (infra: AR23 inference client in Epic 1)
- FR13 (Event entity + venue cross-link): Epic 3
- FR14 (List ⇄ Calendar toggle): Epic 3
- FR15 (time-bucket grouping): Epic 3
- FR16 (events filter bar): Epic 3
- FR17 (event detail + map + ICS + venue link): Epic 3
- FR18 (Event JSON-LD): Epic 3
- FR19 (events seeded or submitted): Epic 3 (public submission path in Epic 5)
- FR20 (Business entity): Epic 2
- FR21 (directory three-pane + filters): Epic 2
- FR22 (map ⇄ list hover sync): Epic 2
- FR23 (sort control, null-rating-safe): Epic 2
- FR24 (geospatial search/PostGIS): Epic 2
- FR25 (mobile directory): Epic 2
- FR26 (active-filter chips): Epic 2
- FR27 (business detail): Epic 2
- FR28 (LocalBusiness JSON-LD, no aggregateRating): Epic 2
- FR29 (directory seeding): Epic 2 (Google Places discovery — AR22; infra in Epic 1)
- FR30 (Submit wizard): Epic 5
- FR31 (claim-this-listing): Epic 5
- FR32 (moderation queue, never auto-publish): Epic 5 (published() gate infra in Epic 1)
- FR33 (CAPTCHA/Turnstile): Epic 5
- FR34 (duplicate detection): Epic 5
- FR35 (email notifications): Epic 5
- FR36 (moderation dashboard + merge): Epic 5
- FR37 (bidirectional cross-links): Epic 6 (primitives in Epic 1; fields per-pillar Epics 2–4)
- FR38 (cross-link rails on all detail pages): Epic 6 (rendered per-pillar Epics 2–4, finalized Epic 6)
- FR39 (shared-facet neighbourhood pages): Epic 6
- FR40 (newsletter): Epic 7
- FR41 (newsletter sponsor slot): Epic 7
- FR42 (featured/promoted businesses): Epic 7
- FR43 (claim subscription tiers — model only at MVP): Epic 7
- FR44 (AdSense units, CWV-safe): Epic 7
- FR45 (direct ad sales + sponsored content): Epic 8 [Phase 2]
- FR46 (analytics dashboard): Epic 8 [Phase 2]
- FR47 (newsletter sponsorship slot mgmt): Epic 7
- FR48 (role-based admin/CMS): Epic 1
- FR49 (auth: owners + operator; residents accountless): Epic 1 (auth/RBAC, Story 1.3) + Epic 5 (owner dashboard UI, Story 5.10)
- FR50 (native reviews capture): Epic 8 [Phase 2]
- FR51 (upgraded search Meili/Typesense): Epic 8 [Phase 2]
- FR52 (additional cities live): Epic 8 [Phase 2]
- FR53 (Home hub): Epic 6
- FR54 (calendar view behavior): Epic 3
- FR55 (cross-link referential integrity): Epic 5 (graceful-resolution rails in Epic 6; primitives Epic 1)
- FR56 (seed-vs-claim provenance): Epic 5 (provenance fields land in Epic 2; enforcement in Epic 5)
- FR57 (claim lifecycle governance): Epic 5
- FR58 (listing lifecycle states + dedup): Epic 2 (model/states) + Epic 5 (merge action)
- FR59 (edit re-moderation): Epic 5
- FR60 (moderation operability): Epic 5
- FR61 (review data + rating provenance): Epic 2 (model + sourced display; native capture FR50 → Epic 8)
- FR62 (event location fallback): Epic 3

All 62 FRs mapped. NFR1–9 are cross-cutting: SEO/CWV/a11y/boundaries (NFR1/2/3/8) established in Epic 1
and enforced per-epic; trust & safety (NFR4) concentrated in Epic 5; content-quality (NFR5) in the
Epic 2/4 seeding+aggregation pipelines; data-accuracy (NFR6) via provenance+claim (Epics 2/5);
multi-tenancy (NFR7) in Epic 1; privacy/CASL (NFR9) in Epic 7 (+ Epic 5 submitter data).

## Epic List

### Epic 1: Platform Foundation & Public Shell
Scaffold the greenfield app and stand up a live, deployable, SEO-correct, accessible site shell with a working admin. Establishes the project (create-payload-app blank + Postgres + PostGIS + version pins + Drizzle), Payload admin + RBAC auth, the city-scoping foundation + cross-link primitives, shared taxonomy collections + management, the design system + responsive global shell, centralized SEO infra + the `published()` moderation gate, the swappable `lib/inference` client + provenance-field scaffolding, and Railway deploy + CI.
**FRs covered:** FR1, FR2, FR4, FR5, FR6, FR48, FR49

### Epic 2: Business Directory (centerpiece — density engine)
A genuinely useful city-wide directory from day one. Business collection + PostGIS geo; three-pane directory (filters | card list | map) with map⇄list hover sync, geospatial search + Distance sort, active-filter chips, mobile list/map toggle + filter drawer; business detail (gallery, hours/Open-Now, amenities, contact card, "upcoming events" rail); most-specific LocalBusiness JSON-LD (no aggregateRating); Google-Places-backed directory seeding pipeline (discovery + refresh, ToS-bounded) + provenance fields + lifecycle states + dedup model; Review data model + sourced-rating display (null-rating-safe); thin/unclaimed indexing gate.
**FRs covered:** FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR58, FR61

### Epic 3: Events
"What's on near me," cross-linked to venues. Event collection + nullable venue→Business cross-link + event-location fallback; List ⇄ Calendar (month grid) with time-bucket grouping; always-visible filter bar; event detail (embedded map, Add to Calendar/ICS, venue link); Event JSON-LD always with a location; event aggregation seeding.
**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR54, FR62

### Epic 4: Local News
Free, no-paywall local news, cross-linked. Article collection + related-events/mentioned-businesses cross-links; news listing (category sub-nav, lead + grid, Trending sidebar); article detail + "Related" rail; NewsArticle JSON-LD; primary-source aggregation pipeline (press releases/feeds via the inference client; competitors signal-only, drafts never auto-published).
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12

### Epic 5: Submission, Claiming & Moderation (trust & safety)
The community-contribution + owner-claim loop, safely gated — and the operator's daily moderation workflow (UJ-2/3/4). 4-step Submit wizard; claim-this-listing + verification + lifecycle (dual-claim/dispute/revoke/transfer); business-owner dashboard (My Listings, edit, status); moderation queue/dashboard (pending→approved→published, never auto-publish); Turnstile CAPTCHA; duplicate detection + merge (preserving cross-links); email notifications; edit re-moderation; seed-vs-claim provenance enforcement; moderation operability (bulk/triage/trusted-source staging); abuse controls (rate-limit, upload scanning).
**FRs covered:** FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR49 (owner dashboard), FR55, FR56, FR57, FR59, FR60

### Epic 6: Unified Search, Home Hub & Cross-Pillar Connections
The unified front door — needs all pillars live, so it comes after them. Cross-pillar unified search + autocomplete (Postgres FTS + pg_trgm); the composed Home hub (hero, "Happening This Weekend," latest news, featured businesses, newsletter band) with selection rules; neighbourhood landing pages (MVP-light facets); finalize the bidirectional cross-link rails across all three detail pages.
**FRs covered:** FR3, FR37, FR38, FR39, FR53

### Epic 7: Newsletter & Monetization Hooks
The growth + revenue engine, passive-first, present at launch. Newsletter ("Kingston in 5"): signup, subscriber management, curated digest, Resend send job (CASL-compliant), sponsor slot; featured/promoted flag + ranking; AdSense units (reserved/lazy, CWV-safe); claim-subscription-tier data-model scaffolding (billing deferred).
**FRs covered:** FR40, FR41, FR42, FR43, FR44, FR47

### Epic 8: Phase-2 Scope & Hardening Backlog *(deferred — not MVP; no detailed stories written now)*
Captured for coverage completeness only: native reviews/ratings capture (FR50), upgraded search Meilisearch/Typesense (FR51), additional city domains (FR52), direct ad sales + sponsored content (FR45), analytics dashboard (FR46); plus the architecture hardening items (AR21: axe-core a11y CI, DB backup/DR, seeded-ratings ToS source, upload virus scanning).
**FRs covered:** FR45, FR46, FR50, FR51, FR52

---

## Epic 1: Platform Foundation & Public Shell

Scaffold the greenfield app on the locked stack and stand up a live, deployable, SEO-correct, accessible site shell with a working admin — establishing the city-scoping, auth/RBAC, taxonomy, cross-link, design-system, SEO, and automation foundations every later epic plugs into.

### Story 1.1: Project Scaffold & Deployable Skeleton

As the operator/developer,
I want the Kingston.FYI app scaffolded on the locked stack and deployed,
So that there is a running foundation with an admin I can log into and every later story builds on a consistent base.

**Acceptance Criteria:**

**Given** a clean repository,
**When** `npx create-payload-app@latest -t blank --db postgres --name kingston-fyi` is run and dependencies are pinned,
**Then** `package.json` has `next ^16.2.6` and `payload ^3.73.0` (never 15.5–16.1.x) and `@payloadcms/db-postgres` (Drizzle) is the configured adapter,
**And** `idType: 'uuid'` is configured so all collections use UUID primary keys.

**Given** the provisioned Postgres database,
**When** the initial migration runs,
**Then** a `0000_enable_postgis` migration enables the `postgis` extension,
**And** `next dev` (Turbopack) boots the public site and the Payload admin co-located under `/admin`.

**Given** a push to the main branch,
**When** GitHub Actions runs,
**Then** it lints, typechecks, runs tests, applies Payload migrations, and deploys to Railway (app + managed Postgres/PostGIS),
**And** the deployed `/admin` is reachable and the public `/` returns 200 with no console errors.

### Story 1.2: City Scoping Foundation

As the operator,
I want every content entity scoped to a city with hostname-based resolution,
So that Kingston launches now and new `.fyi` cities are a rollout, not a rewrite.

**Acceptance Criteria:**

**Given** the multi-city requirement (FR5),
**When** the schema is defined,
**Then** a `cities` collection exists (name, slug, hostname, timezone) seeded with Kingston, and a reusable `cityField` relationship is available for content collections.

**Given** an incoming request,
**When** `lib/city.ts` resolves the host,
**Then** the active city is derived from hostname (the launch domain + localhost both resolve to Kingston) and is available to RSC reads.

**Given** the mandatory city-scoping rule (NFR7),
**When** `cityScoped()` is applied as access / `baseListFilter`,
**Then** a query that omits the city constraint is prevented, and a unit test proves a query cannot return another city's rows.

**Given** a cross-city reference attempt,
**When** the `crossLinkCityInvariant` validation hook runs,
**Then** a relationship whose endpoints differ in city is rejected.

### Story 1.3: Authentication & Role-Based Access

As the operator,
I want an admin login with roles for operator/admin and business-owner while residents browse without an account,
So that the right people can manage content and claim listings.

**Acceptance Criteria:**

**Given** Payload auth (FR48/FR49),
**When** the `users` collection is defined,
**Then** it supports roles `admin`/`operator` and `business-owner`, and Payload admin-panel access is restricted to `admin`/`operator`.

**Given** a resident,
**When** they browse the site or open the public Submit affordance,
**Then** no account or login is required.

**Given** role-based access,
**When** `isAdmin()` and `isBusinessOwner()` access helpers are applied,
**Then** a business-owner cannot reach operator-only admin areas and vice versa (unit-tested).

**Given** an operator account,
**When** they sign in at `/admin`,
**Then** they reach the Payload admin dashboard.

### Story 1.4: Shared Taxonomy Collections & Management

As the operator,
I want the shared, city-scoped taxonomies manageable in the admin,
So that all three pillars use consistent neighbourhood and category facets.

**Acceptance Criteria:**

**Given** shared facets (FR4),
**When** taxonomy collections are defined,
**Then** `neighbourhoods`, `news-categories`, `event-categories`, and `business-categories` exist, each city-scoped via `cityField`.

**Given** the two-level business hierarchy,
**When** `business-categories` uses `plugin-nested-docs`,
**Then** a parent→leaf relationship is enforced and editable in the admin.

**Given** Kingston launch data,
**When** seeds run,
**Then** the 8 neighbourhoods, 6 news categories (each with its editorial `--tag-*` color), and 5 event categories from the content model are present.

**Given** an operator in the admin,
**When** they add or edit a taxonomy term,
**Then** the change persists and stays city-scoped with no leakage across cities.

### Story 1.5: Cross-Link Primitives & Moderation-Gate Infrastructure

As a developer,
I want shared cross-link and publish-gate primitives,
So that every pillar wires bidirectional links and public reads stay gated consistently.

**Acceptance Criteria:**

**Given** typed cross-links (FR37),
**When** the relationship-field convention and a derived reverse-link query helper are provided,
**Then** reverse links are computed by query and never stored, preventing integrity drift (FR55).

**Given** moderation (NFR4),
**When** a `statusField` (draft/pending/approved/published) factory and a `published()` access helper are provided,
**Then** `published()` returns only approved/published content and is unit-tested.

**Given** edits to already-published content,
**When** the moderation helper handles them,
**Then** it supports the published→edited→pending transition scaffold (for FR59).

**Given** cache freshness,
**When** `afterChange`/`afterDelete` hooks fire,
**Then** they revalidate tags by the `entity:{id}` / `list:{city}:{pillar}` / `cross:{id}` conventions.

### Story 1.6: Design System Foundation

As a developer,
I want the civic-editorial design system as tokens plus reusable atoms and molecules,
So that every screen is built from one consistent visual language.

**Acceptance Criteria:**

**Given** the brand system (UX-DR1/3),
**When** `styles/globals.css` is authored,
**Then** it defines the full color (limestone/slate/ink/amber/`--tag-*`/line), spacing/radius (`--gap`, `--pad`, `--r*`), and layout (`--maxw` 1240, `.kf-wrap`) custom properties verbatim — and no SaaS-purple gradients are used.

**Given** typography (UX-DR2),
**When** fonts load via `next/font`,
**Then** Newsreader serif headlines (600 / 1.12 / -0.01em / balance) and Source Sans 3 body (17px / 1.55) and the eyebrow style (800 / uppercase / .14em / accent-strong) are applied.

**Given** reuse (UX-DR4/5),
**When** atom and molecule components are built,
**Then** `Btn`, `Tag`/`TagOutline`, `Chip`, form fields, `Eyebrow`, `Stars`, `Meta`, `Switch`/`Check`/`Radio`, `Icon`, `Ph`, `Logo`, `SearchBar`, `CatTag`, `PriceTag`, `SectionHead`, `FilterGroup`, `ContactRow`, and `ReviewLine` exist and render in a component sandbox.

**Given** render robustness (UX-DR16/18),
**When** route transitions and card bodies are implemented,
**Then** transitions are transform-only (never opacity) and card bodies use margin-based stacking, and theming hooks (accent, dark masthead, headline font, card style, radius, density) are exposed as variables.

### Story 1.7: Responsive Global Shell

As a resident,
I want a consistent header, footer, and newsletter band across the site,
So that I can navigate the three pillars and search from anywhere.

**Acceptance Criteria:**

**Given** the global shell (FR1/FR2, UX-DR6),
**When** `(frontend)/layout.tsx` renders,
**Then** a sticky `Header` (wordmark, nav News/Events/Directory, persistent search bar, Submit CTA) and `Footer` (section/social links + newsletter signup) appear on every page.

**Given** mobile (UX-DR17),
**When** the viewport narrows,
**Then** the header collapses to a hamburger + search drawer at ≤860px and the layout follows the ≤1100 / ≤860 / ≤560 breakpoint rules.

**Given** accessibility (NFR3, UX-DR19),
**When** the shell is audited,
**Then** nav, search, and the Submit CTA are keyboard-operable with visible focus, correct labels, and AA contrast.

**Given** the persistent search bar,
**When** a user types,
**Then** the input is present and accessible and produces no dead-end errors; cross-pillar result wiring is deferred to Epic 6.

### Story 1.8: Centralized SEO Infrastructure

As the operator,
I want centralized metadata, sitemap/robots, and site-wide structured data,
So that every page is SEO-correct from launch and pillars only plug in their entity JSON-LD.

**Acceptance Criteria:**

**Given** per-page metadata (FR6, NFR1),
**When** the `generateMetadata` helper is used,
**Then** pages emit title/description/canonical consistently from one place.

**Given** crawl surfaces,
**When** `sitemap.ts` and `robots.ts` are implemented,
**Then** they generate from published, city-scoped content and support noindex / crawl-control rules that later epics consume (thin/facet gating).

**Given** site-wide structured data,
**When** a page renders,
**Then** Organization + BreadcrumbList JSON-LD are emitted via the shared `lib/seo` builders, and the builder module exposes per-entity slots (NewsArticle/Event/LocalBusiness) for later epics.

**Given** the no-self-serving rule,
**When** the JSON-LD builders are designed,
**Then** there is no code path that emits `aggregateRating` on a LocalBusiness.

### Story 1.9: Jobs Queue, Inference Client & Provenance Scaffolding

As the operator,
I want the background-jobs runtime, a swappable LLM inference client, and provenance field factories in place,
So that the Epic 2/4 seeding and aggregation pipelines have a consistent foundation.

**Acceptance Criteria:**

**Given** automation (AR20),
**When** the Payload Jobs Queue is configured on the Railway host,
**Then** `autoRun`/cron is enabled and a no-op registered task runs on schedule, proving the runtime.

**Given** swappable inference (AR23),
**When** `lib/inference` is implemented,
**Then** it exposes a provider-agnostic client interface configured for the self-hosted open-weights endpoint, so pipelines call it without provider-specific code.

**Given** field provenance (AR18, FR56),
**When** a provenance / `lockedFields` field factory is provided,
**Then** content fields can record source (`seeded` / `google-places` / `owner-edited` / `operator`) and mark fields refresh-required vs owner-owned.

**Given** the moderation invariant (NFR4),
**When** any job writes content,
**Then** the scaffolding defaults newly-ingested records to draft/pending status and never to published.

---

## Epic 2: Business Directory (centerpiece — density engine)

Deliver a genuinely useful, city-wide, map-driven business directory people can browse and filter from day one — the cold-start density engine — seeded from Google Places (ToS-bounded discovery + refresh) and ready for owner claims.

### Story 2.1: Business Entity, Geo & Structured Data

As the operator,
I want a Business collection with geospatial coordinates and structured-data output,
So that listings carry the full data model and emit correct LocalBusiness JSON-LD.

**Acceptance Criteria:**

**Given** the listing model (FR20),
**When** the `businesses` collection is defined,
**Then** it has name, blurb, leaf + parent category, neighbourhood, price tier, structured hours, address, phone, website, amenity tags, photos, rating + review count (display), provenance fields (Story 1.9), status gate (Story 1.5), and `cityField`.

**Given** geospatial needs (FR24),
**When** the schema is migrated,
**Then** a `geometryColumn('point','POINT',4326)` with a GiST index is created via migration and populated from the listing's coordinates.

**Given** structured data (FR28, NFR1),
**When** a business page renders,
**Then** it emits the most-specific `LocalBusiness` subtype JSON-LD via `lib/seo`, and never emits `aggregateRating`.

### Story 2.2: Business Detail Page

As a resident,
I want a rich business detail page,
So that I can see everything about a place — photos, hours, contact, location, and what's on there.

**Acceptance Criteria:**

**Given** the detail layout (FR27, UX-DR12),
**When** a business page renders,
**Then** it shows the photo-gallery mosaic, a header (open/closed + hours pill, rating, category·price·neighbourhood, share/visit), amenity tags, About, a sticky contact card with embedded map, and structured hours with today highlighted.

**Given** the venue cross-link (FR38),
**When** the "Upcoming events at this venue" rail renders,
**Then** it lists the venue's upcoming events, and renders gracefully empty until Events (Epic 3) exist (no error, no broken layout).

**Given** the reviews section (FR61),
**When** ratings exist,
**Then** the average + rating histogram (5★→1★) and individual reviews render with provenance labelling; with no rating, the section renders gracefully.

**Given** indexing quality (NFR1/NFR5),
**When** a listing is thin or unclaimed below the quality threshold,
**Then** its page is gated from indexing (noindex) until enriched or claimed.

### Story 2.3: Reviews Model, Sourced Ratings & Open-Now

As a resident,
I want accurate ratings and live open/closed status,
So that I can judge and choose a business at a glance.

**Acceptance Criteria:**

**Given** the review model (FR61),
**When** the `reviews` collection is defined,
**Then** it has author, rating (1–5), date, text, a business relationship, and a provenance label; at MVP ratings shown are sourced/imported.

**Given** a business rating + count,
**When** displayed,
**Then** they derive from available sourced review data, and a business with no rating renders and sorts gracefully (null-rating-safe).

**Given** structured hours (FR20),
**When** Open-Now is derived,
**Then** it computes from the structured hours in America/Toronto and reflects the current open/closed state on cards and detail.

### Story 2.4: Directory Listing — Filters, Three-Pane & Chips

As a resident,
I want a filterable directory with filters visible by default,
So that I can narrow to exactly the places I want.

**Acceptance Criteria:**

**Given** the directory page (FR21, UX-DR11),
**When** it renders on desktop,
**Then** a left `DirFilters` panel is visible by default (Open-Now toggle, hierarchical category checkboxes, neighbourhood select, minimum-rating radios, price chips) alongside a scrollable business-card list and a result count ("N places in Kingston").

**Given** filter state,
**When** filters change,
**Then** state lives in URL search params and the result list updates accordingly.

**Given** active filters (FR26),
**When** filters are applied,
**Then** active-filter chips appear above results with individual removal and a clear-all ("Clear (n)").

### Story 2.5: Geospatial Search & Sort

As a resident,
I want near-me search and meaningful sorting,
So that I can find the closest or best-matching places.

**Acceptance Criteria:**

**Given** geospatial search (FR24),
**When** a radius / "near me" / map-bounds query runs,
**Then** `lib/geo` executes `ST_DWithin` / `ST_MakeEnvelope` against PostGIS and returns the in-area businesses.

**Given** non-Places coordinates,
**When** an address lacks coordinates (submissions, manual/open-data entries),
**Then** MapTiler Geocoding (AR24) resolves them for storage.

**Given** the sort control (FR23),
**When** a sort is chosen,
**Then** Relevance / Rating / Distance / Newest / A–Z all work, Distance depends on the user's location, and null-rating listings are ordered gracefully.

### Story 2.6: Interactive Map with List Sync

As a resident,
I want the map and list to work together,
So that I can explore spatially and jump to any place.

**Acceptance Criteria:**

**Given** the map pane (FR22, AR11, UX-DR15),
**When** the directory renders on desktop,
**Then** a lazy-loaded MapLibre GL map shows pins for the result set, backed by PostGIS bounds.

**Given** map⇄list interaction,
**When** a user hovers a card or a pin,
**Then** the corresponding pin/card is highlighted (shared hover state), and clicking a pin routes to the business detail page.

**Given** CWV (NFR2),
**When** the map loads,
**Then** it is lazy-loaded and reserves its layout space so it does not regress LCP/CLS.

### Story 2.7: Mobile Directory Experience

As a resident on mobile,
I want a usable single-column directory with a map toggle and filter drawer,
So that I can browse the directory comfortably on a phone.

**Acceptance Criteria:**

**Given** mobile (FR25, UX-DR17),
**When** the directory renders ≤860px,
**Then** it is single-column with a list/map toggle and a slide-in filter drawer.

**Given** the filter drawer,
**When** a user adjusts filters,
**Then** an "apply / show N results" action applies them and closes the drawer.

**Given** accessibility (NFR3),
**When** the drawer and toggle are used,
**Then** they are keyboard-operable with focus management and correct labels.

### Story 2.8: Google-Places Directory Seeding, Lifecycle & Dedup

As the operator,
I want an automated, ToS-compliant seeding pipeline,
So that the directory reaches city-wide density before any owner engagement.

**Acceptance Criteria:**

**Given** seeding (FR29, AR22),
**When** the `seed-directory` job runs,
**Then** it uses the Google Places API as a discovery + refresh source, stores `place_id`, writes Google-attributed fields with provenance `google-places` marked refresh-required, and never builds a frozen standalone copy (no Maps scraping).

**Given** ingested listings (NFR4),
**When** the job writes records,
**Then** they enter as draft/pending (operator-publishable), not auto-published, and thin/unclaimed pages stay indexing-gated (NFR1) until enriched.

**Given** lifecycle (FR58),
**When** a listing's state changes,
**Then** it carries active / temporarily-closed / permanently-closed / stale-unverified, and the `check-staleness` job flags stale records.

**Given** duplicates (FR58),
**When** the `dedup-flag` job runs (assisted by `lib/inference`),
**Then** likely duplicate seeded listings are flagged for operator merge (merge action lands in Epic 5, preserving cross-links).

---

## Epic 3: Events

Let residents discover "what's on near me," presented as both a list and a calendar, with every event cross-linked to its venue and always carrying a place for the map and structured data.

### Story 3.1: Event Entity, Venue Cross-Link & Structured Data

As the operator,
I want an Event collection linked to venues with a location fallback,
So that events carry the full model and always emit a located Event JSON-LD.

**Acceptance Criteria:**

**Given** the event model (FR13),
**When** the `events` collection is defined,
**Then** it has title, blurb, start/end datetime, display date/time, category, neighbourhood, price + free/paid flag, image, a nullable `venue` relationship to a business, related-news cross-links, provenance + status gate, and `cityField`.

**Given** the location fallback (FR62),
**When** an event has no venue business,
**Then** it carries its own optional location (address + geocoordinates, geocoded via MapTiler when absent); venue-linked events inherit the venue's location.

**Given** structured data (FR18, NFR1),
**When** an event page renders,
**Then** it emits `Event` JSON-LD via `lib/seo` that always includes a location (venue or own).

**Given** the cross-city invariant (NFR7),
**When** an event links to a venue,
**Then** `crossLinkCityInvariant` ensures both share the same city.

### Story 3.2: Events List with Time Buckets & Filters

As a resident,
I want a filterable events list grouped by when things happen,
So that I can quickly see what's on today or this weekend.

**Acceptance Criteria:**

**Given** the list view (FR14/FR15, UX-DR10),
**When** the events page renders in list mode,
**Then** events are grouped into Today / This Weekend / Next Week / This Month derived from start datetime relative to now.

**Given** the filter bar (FR16),
**When** it renders,
**Then** date presets, category, neighbourhood, and Free/Paid are always visible and apply to the list via URL state.

**Given** an event card,
**When** it renders,
**Then** it shows image, title, date & time, venue, and price tag.

### Story 3.3: Calendar View

As a resident,
I want a month-grid calendar of events,
So that I can plan around specific dates.

**Acceptance Criteria:**

**Given** the calendar view (FR54, FR14, UX-DR10),
**When** the user toggles to Calendar,
**Then** a month grid renders with month navigation and day cells showing that day's events, placed by start datetime (not a stored day number).

**Given** a day selection,
**When** the user clicks a day,
**Then** the view drills into that day's events.

**Given** the FR16 filters,
**When** filters are active,
**Then** they apply to the calendar as well as the list.

**Given** mobile (UX-DR17),
**When** ≤560px,
**Then** calendar cells collapse to dots while remaining usable and accessible.

### Story 3.4: Event Detail with Map, ICS & Venue Link

As a resident,
I want a complete event detail page,
So that I can get directions, add it to my calendar, and reach the venue.

**Acceptance Criteria:**

**Given** the detail layout (FR17, UX-DR10),
**When** an event page renders,
**Then** it shows full info, an embedded map (venue or own location), and an Add to Calendar action that generates a valid ICS file.

**Given** a venue-linked event (FR38),
**When** the page renders,
**Then** it links through to the venue's directory page, and the venue's "upcoming events" rail (Story 2.2) reflects this event.

**Given** related news (FR38),
**When** cross-links exist,
**Then** a related-news rail renders, gracefully empty when none.

### Story 3.5: Event Aggregation Seeding

As the operator,
I want events aggregated from public sources into the moderation queue,
So that the calendar is populated without all-manual entry.

**Acceptance Criteria:**

**Given** aggregation (FR19),
**When** the event aggregation job runs,
**Then** it ingests events from public sources, normalizes them via `lib/inference`, and writes them as draft/pending — never auto-published.

**Given** a seeded event with a known venue,
**When** normalization runs,
**Then** it attempts to match the venue to an existing business listing (flagging for operator confirmation rather than guessing).

---

## Epic 4: Local News

Deliver free, no-paywall local news, cross-linked to the events and businesses each story mentions, fed by a primary-source aggregation pipeline that drafts — never auto-publishes.

### Story 4.1: Article Entity, Cross-Links & Structured Data

As the operator,
I want an Article collection with cross-links and structured data,
So that articles carry the full model and emit NewsArticle JSON-LD.

**Acceptance Criteria:**

**Given** the article model (FR7),
**When** the `articles` collection is defined,
**Then** it has title, dek, body, author/byline, publish date, read-time, category, hero image, related-events + mentioned-businesses relationships, status gate, and `cityField`.

**Given** structured data (FR11, NFR1),
**When** an article page renders,
**Then** it emits `NewsArticle` JSON-LD via `lib/seo`.

**Given** the cross-city invariant (NFR7),
**When** an article links to an event or business,
**Then** `crossLinkCityInvariant` ensures shared city.

### Story 4.2: News Listing

As a resident,
I want a news landing page with categories and trending,
So that I can browse and read local news freely.

**Acceptance Criteria:**

**Given** the listing (FR8, UX-DR8),
**When** the news page renders,
**Then** it shows a category sub-nav (Local, Politics, Business, Sports, Arts & Culture, Opinion), a lead story + responsive article-card grid, and a Trending list + newsletter sidebar.

**Given** the free model (FR10),
**When** any article is opened,
**Then** it is fully readable without an account or payment, with no paywall or metering.

### Story 4.3: Article Detail with Related Rail

As a resident,
I want an article page that connects to the places and events it mentions,
So that the cross-link is part of the reading experience.

**Acceptance Criteria:**

**Given** the detail layout (FR9, UX-DR9),
**When** an article renders,
**Then** it shows headline, byline, date, read-time, hero, and body.

**Given** cross-links (FR38),
**When** the "Related" rail renders,
**Then** it lists linked events + mentioned businesses with `.kf-cross` hover highlight, each routing to its detail page, and renders gracefully empty when none.

### Story 4.4: Primary-Source News Aggregation

As the operator,
I want a primary-source aggregation pipeline that produces drafts,
So that I can publish local news efficiently without republishing competitors.

**Acceptance Criteria:**

**Given** aggregation (FR12, AR23),
**When** the `aggregate-press-releases` job runs,
**Then** it ingests from primary sources (institutional press releases, public feeds) and uses `lib/inference` to summarize them into operator-authored **drafts**.

**Given** the trust guardrails (NFR4/NFR5),
**When** drafts are created,
**Then** they enter as draft/pending (never auto-published), competitors are treated as a signal source only and never republished, and source provenance is recorded.

---

## Epic 5: Submission, Claiming & Moderation (trust & safety)

Open the community-contribution and owner-claim loops — safely. Nothing user-originated goes public before approval; owners can claim and edit listings; and the operator gets an efficient daily moderation workflow.

### Story 5.1: Public Submit Wizard with CAPTCHA

As a resident or organizer,
I want a clear multi-step form to submit a business or event,
So that I can contribute content knowing it will be reviewed.

**Acceptance Criteria:**

**Given** the submit flow (FR30, UX-DR13),
**When** a user submits,
**Then** a 4-step wizard (Type → Details → Location & Media → Review) collects the data, supports photo upload (up to 8), and shows an explicit "reviewed before going live (~2 business days)" notice plus a done/confirmation state.

**Given** abuse protection (FR33),
**When** the form is submitted,
**Then** Cloudflare Turnstile CAPTCHA must pass, and the write goes through a Server Action with shared Zod validation (AR7/AR12).

**Given** the moderation invariant (FR32/NFR4),
**When** a submission is accepted,
**Then** it is stored as pending and is never publicly visible before approval.

### Story 5.2: Moderation Queue & Dashboard

As the operator,
I want a moderation dashboard for all user-originated content,
So that I can review and publish safely with a clear state machine.

**Acceptance Criteria:**

**Given** the queue (FR32/FR36),
**When** the operator opens moderation,
**Then** submissions, claims, and edits appear with status pending → approved → published, and the operator can review, approve, reject, and edit.

**Given** the never-auto-publish rule (NFR4),
**When** content is approved,
**Then** publishing is an explicit operator action and nothing publishes automatically.

**Given** auditability (NFR4),
**When** a moderation action is taken,
**Then** it is recorded (who/what/when).

### Story 5.3: Duplicate Detection & Merge

As the operator,
I want likely duplicates flagged and mergeable,
So that the directory and events stay clean as submissions and seeds overlap.

**Acceptance Criteria:**

**Given** duplicate detection (FR34),
**When** a submission resembles an existing listing/event,
**Then** it is flagged as a likely duplicate for the moderator (assisted by `lib/inference` / `dedup-flag`).

**Given** a merge action (FR58),
**When** the operator merges duplicates,
**Then** the merge preserves all cross-links (FR55) and provenance, and leaves a single canonical record.

### Story 5.4: Claim-this-Listing, Verification & Lifecycle

As a business owner,
I want to claim and verify my listing,
So that I can manage its information.

**Acceptance Criteria:**

**Given** the claim flow (FR31, AR17),
**When** an owner claims a listing,
**Then** verification runs via website-meta / email-domain match + emailed code, with operator approval as backstop, and on success the owner gains edit ability.

**Given** the claim lifecycle (FR57),
**When** claim states change,
**Then** the machine covers unclaimed → pending-claim → claimed plus disputed / revoked / transferred, and competing/dual claims are surfaced for operator resolution.

**Given** edit rights (FR57),
**When** a listing is unclaimed vs claimed,
**Then** who may edit is enforced (operator for unclaimed; the verified owner once claimed).

### Story 5.5: Seed-vs-Claim Provenance Enforcement

As the operator,
I want re-seeding to never clobber owner edits,
So that owner-provided accuracy is preserved.

**Acceptance Criteria:**

**Given** provenance (FR56),
**When** the `seedProvenanceGuard` hook runs during re-seeding,
**Then** it only fills/updates unclaimed, un-edited fields and never overwrites owner-edited or claimed fields.

**Given** a conflict,
**When** a re-seed would change an owner-owned field,
**Then** the conflict surfaces to moderation rather than applying silently.

### Story 5.6: Edit Re-Moderation

As the operator,
I want edits to published content to re-enter moderation,
So that nothing changes the public site without review.

**Acceptance Criteria:**

**Given** re-moderation (FR59/NFR4),
**When** a claimed-listing edit or a resubmitted event is saved,
**Then** it re-enters the queue via the published → edited → pending transition and the live version is unchanged until re-approval.

### Story 5.7: Submitter & Claimant Email Notifications

As a submitter or claimant,
I want email updates on my submission/claim,
So that I know it was received and when it's decided.

**Acceptance Criteria:**

**Given** notifications (FR35),
**When** a submission or claim is received,
**Then** a confirmation email is sent via Resend.

**Given** a moderation decision,
**When** content is published or rejected,
**Then** the submitter/claimant is emailed the outcome.

### Story 5.8: Cross-Link Referential Integrity

As a resident,
I want cross-links to never break,
So that I never hit a dead venue link or stale rail.

**Acceptance Criteria:**

**Given** integrity (FR55),
**When** a cross-link target is deleted / unpublished / merged / unclaimed,
**Then** references resolve gracefully (hidden or repointed) with no 404 venue links.

**Given** reverse rails,
**When** a target changes,
**Then** the derived reverse-link rails stay consistent on both sides.

### Story 5.9: Moderation Operability & Abuse Controls

As the solo operator,
I want efficient bulk moderation and abuse protection,
So that throughput is not the launch bottleneck and the site is protected.

**Acceptance Criteria:**

**Given** operability (FR60),
**When** the operator works the queue,
**Then** bulk approve/reject, a prioritized/triaged queue, duplicate-flag assist, and trusted-source staging are available.

**Given** abuse controls (NFR4),
**When** public mutations occur,
**Then** rate limiting (Server Action wrapper + IP throttle) and upload constraints (type/size + `sharp`) are enforced.

### Story 5.10: Business-Owner Dashboard

As a verified business owner,
I want a dashboard listing the businesses I manage with their status and an edit entry,
So that I can keep my listing accurate and see where my changes stand.

**Acceptance Criteria:**

**Given** a verified owner (FR49, UX EXPERIENCE.md IA),
**When** they sign in and open `/dashboard`,
**Then** a separate authenticated area shows "My Listings" — each claimed listing as a `ListingManageCard` with its live status, an Edit action, and a "View public page" action.

**Given** a listing with a pending edit (FR59),
**When** the dashboard renders that card,
**Then** it shows the `InReviewPill` and the reassurance that the live listing is unchanged until approval.

**Given** the empty and loading states,
**When** an owner has no listings yet or data is loading,
**Then** an empty state ("find yours and claim it" + search CTA) and a loading skeleton render per the EXPERIENCE.md state patterns.

**Given** accessibility (NFR3),
**When** the dashboard and its mobile nav are used,
**Then** they meet WCAG 2.2 AA (keyboard, focus management, status announced via `aria-live`).

**Given** Phase-2 capabilities (FR43/FR46),
**When** the nav renders,
**Then** Analytics and Subscription appear as clearly-deferred ("soon") items, not built at MVP.

---

## Epic 6: Unified Search, Home Hub & Cross-Pillar Connections

Tie the three pillars into one front door — a unified search, a composed home hub, neighbourhood facets, and the bidirectional cross-link rails finalized now that all content exists.

### Story 6.1: Unified Cross-Pillar Search

As a resident,
I want one search that spans news, events, and businesses,
So that I can find anything on the site from one box.

**Acceptance Criteria:**

**Given** unified search (FR3, UX-DR14),
**When** a user types in the persistent search bar,
**Then** autocomplete suggestions span News + Events + Businesses in one list (Postgres FTS + `pg_trgm` via `lib/search` / `plugin-search`), each routing to its detail page.

**Given** a full query,
**When** the user submits,
**Then** it routes to a directory/results page with results.

**Given** city scoping (NFR7),
**When** search runs,
**Then** results are limited to the active city.

### Story 6.2: Home Hub Page

As a resident,
I want a composed home page,
So that I can see what's happening, what's on, and the latest news at a glance.

**Acceptance Criteria:**

**Given** the home hub (FR53, UX-DR7),
**When** `/` renders,
**Then** it assembles a featured/hero story, a "Happening This Weekend" event strip, a latest-news grid, a featured-businesses row, and a newsletter band.

**Given** selection rules,
**When** slots are filled,
**Then** hero/featured slots use editor flags with a recency/featured-flag fallback so the page is never empty.

**Given** CWV (NFR2),
**When** the home hub loads,
**Then** it is RSC-rendered with reserved media slots and meets the LCP/CLS budgets.

### Story 6.3: Finalized Bidirectional Cross-Link Rails

As a resident,
I want related content to connect in both directions everywhere,
So that the cross-link is consistent across all three pillars.

**Acceptance Criteria:**

**Given** all pillars live (FR37/FR38),
**When** an article, event, or business detail page renders,
**Then** its related rails (Article↔Event, Article↔Business, Event↔Business) render in both directions, with reverse links derived by query.

**Given** an edit to either endpoint,
**When** a relationship changes,
**Then** both sides revalidate via the `cross:{id}` tag and stay consistent.

### Story 6.4: Neighbourhood Landing Pages

As a resident,
I want a page per neighbourhood,
So that I can see its news, events, and businesses together.

**Acceptance Criteria:**

**Given** shared facets (FR39),
**When** a `/neighbourhood/[slug]` page renders,
**Then** it surfaces that neighbourhood's news, events, and businesses (MVP-light; full faceted hubs are Phase 2).

**Given** SEO (NFR1),
**When** the page renders,
**Then** it has correct metadata + canonical and is included in the sitemap when it has genuine content.

---

## Epic 7: Newsletter & Monetization Hooks

Stand up the growth and revenue engine — a CASL-compliant newsletter and passive-first monetization hooks — all present at launch under strict CWV/brand discipline.

### Story 7.1: Newsletter Signup & Subscriber Management

As a resident,
I want to subscribe to the newsletter,
So that I get a curated digest of local goings-on.

**Acceptance Criteria:**

**Given** signup (FR40, NFR9),
**When** a user subscribes from the shell, footer, or an inline band,
**Then** signup uses double opt-in (explicit CASL consent) with a working unsubscribe, protected by Turnstile, via a Server Action.

**Given** subscriber management,
**When** subscriptions change,
**Then** subscribers are stored with consent state and managed by the operator (and synced to Resend audiences).

### Story 7.2: Newsletter Digest & Send Job

As the operator,
I want an automated curated digest send,
So that I can run the newsletter without manual assembly each week.

**Acceptance Criteria:**

**Given** the digest (FR40),
**When** the `send-newsletter` job runs (weekly at launch),
**Then** it composes a curated digest of news + events + a featured business and sends via Resend Broadcasts, CASL-compliant.

**Given** cadence,
**When** configured,
**Then** the schedule supports weekly now and daily later without code changes.

### Story 7.3: Newsletter Sponsor Slot

As the operator,
I want a sponsor slot in newsletter issues,
So that the newsletter can be monetized.

**Acceptance Criteria:**

**Given** the sponsor slot (FR41/FR47),
**When** an issue is composed,
**Then** it can include a managed sponsor slot, and slot management lets the operator set the sponsor per issue.

### Story 7.4: Featured / Promoted Businesses

As the operator,
I want to flag businesses as featured,
So that paid placements can surface across the directory and relevant surfaces.

**Acceptance Criteria:**

**Given** featured placement (FR42),
**When** a business is flagged featured/promoted,
**Then** it is ranked/surfaced accordingly in the directory and relevant surfaces (e.g. home featured row), clearly distinguishable.

**Given** ranking integrity,
**When** featured listings appear,
**Then** they respect the active filters and city scope (no irrelevant promotion).

### Story 7.5: AdSense Display Units

As the operator,
I want CWV-safe AdSense units,
So that the site earns programmatic revenue without harming performance or trust.

**Acceptance Criteria:**

**Given** ads (FR44, NFR2),
**When** AdSense units render,
**Then** they are limited, lazy-loaded, use reserved slots (no CLS), and use no interstitials.

**Given** the CWV budgets,
**When** ad units are present,
**Then** LCP/INP/CLS budgets still hold.

### Story 7.6: Claim Subscription Tier Scaffolding

As the operator,
I want the data model for paid claim tiers in place,
So that enhanced-profile capabilities can ship without billing at MVP.

**Acceptance Criteria:**

**Given** subscription tiers (FR43),
**When** the model is defined,
**Then** a claimed listing can carry a tier and tier-gated capabilities, with billing deferred to Phase 2.

**Given** MVP capability,
**When** an owner has a claimed listing,
**Then** the claimed-listing editing capability ships at MVP regardless of tier.
