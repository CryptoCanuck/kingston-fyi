---
title: Kingston.FYI — Product Requirements Document
status: final
created: 2026-05-31
updated: 2026-05-31
---

# Kingston.FYI — PRD

## 1. Overview

Kingston.FYI is a free, civic-minded community hub for Kingston, Ontario that unites **local
news, events, and a claimable business directory** into one cross-linked graph. The defining
capability is the **cross-link**: an event belongs to a venue (a directory business), articles
reference the businesses and events they mention, and neighbourhoods + categories are shared
facets across all three pillars. Built to be run by one person through automation, free/no-paywall,
SEO-first, and multi-city-ready (Kingston live first).

Full strategy, positioning, GTM, and monetization rationale: see the finalized **product brief**
(`../briefs/brief-kingston.fyi-2026-05-30/brief.md`). This PRD defines *what the product must do*.

## 2. Goals & Success Metrics

**Product goals**
- G1 — Be the single place a Kingston resident answers "what's happening, what's on near me, and
  what's the local news," with the three connected.
- G2 — Reach city-wide directory density so the site is useful from day one, then convert business
  owners to claimed (and later paid) listings.
- G3 — Maximize useful SEO surface area (real listings, events, primary-source news) as the
  traffic engine, while protecting Core Web Vitals and accessibility.
- G4 — Run sustainably solo via automation (seeding, aggregation, low-overhead moderation).

**Success metrics** (directional; numeric targets TBD)
- Leading/habit: organic sessions, indexed pages, newsletter subscribers + open rate,
  returning-visitor share, events engagement.
- Flywheel/revenue: directory density (listings live), **claimed listings (north-star steering
  metric)**, first paying businesses, AdSense RPM/revenue.

**Counter-metrics** (watch for harm while chasing the above)
- Thin/low-value pages indexed (scaled-content-abuse risk) — coverage must stay genuinely useful.
- CWV regressions from ad units or media.
- Moderation latency / unreviewed-but-public content (must stay zero).
- Listing inaccuracy / stale data rate.

**Prioritization & principles** (carried from the brief; these constrain *how* the FRs are built):
- **Cold-start sequencing:** seed the directory to density first (useful before anyone pays);
  events + "near me" + free news are the resident front door; convert businesses to claims once
  traffic exists. Build order serves this.
- **Free / no paywall is a deliberate wedge** against the paywalled incumbent — not a default.
- **Broad but never hollow (hard line):** automated breadth ships only as genuinely useful pages;
  thin/auto-filler is out (rankings, AdSense eligibility, and trust all depend on it).
- **Civic, trustworthy, community-first** is a product constraint, not merely a tone.
- **Passion-project calibration:** low time-pressure, solo/automation-first — but **not** low build
  quality; the locked guardrails (SEO, moderation, CWV, WCAG) hold regardless.

## 3. Users & Key Journeys

**User types:** Residents (primary audience), Local businesses (revenue/supply), Visitors
(secondary), Event organizers (contributors), and the Operator/Editor (Chris — content
curation + moderation, via the admin). Persona context is carried inline in the journeys.

- **UJ-1 — Maya (downtown resident) plans her weekend.** Lands on Home, sees "Happening This
  Weekend," opens an event, sees its **venue** (a directory business) and a **related article**,
  taps through to the venue page, sees the venue's **other upcoming events**, adds one to her
  calendar. *(The cross-link is the experience.)*
- **UJ-2 — Dale (owner, Skeleton Park Roasters) claims his listing.** Searches his business, finds
  an accurate auto-seeded listing, hits "Claim this listing," verifies ownership, edits hours/
  photos/description; changes enter the **moderation queue** and publish on approval.
- **UJ-3 — Priya (event organizer) submits an event.** Uses the multi-step Submit flow (type →
  details → location & media → review), passes CAPTCHA, sees "in review," receives an email when
  it's published. Never auto-published.
- **UJ-4 — Operator daily loop.** Reviews the moderation queue (submissions + claims + edits),
  curates aggregated events, publishes primary-source news drafts, sends the newsletter.

## 4. Functional Requirements

FRs are globally numbered with stable IDs and grouped by capability area. Each FR is a capability,
not an implementation. **MVP** unless tagged **[Phase 2]**.

### 4.1 Platform & Global Shell
- **FR1** — Responsive global shell: sticky header (wordmark, nav News/Events/Directory,
  persistent search, Submit CTA), collapsing to hamburger + search drawer on mobile.
- **FR2** — Global footer: section links, social links, and newsletter signup.
- **FR3** — **Unified search with autocomplete spanning all three pillars** (News + Events +
  Businesses), each result routing to its detail page; full query routes to directory/results.
- **FR4** — Shared taxonomies usable as facets across pillars: **Neighbourhoods**, news categories,
  event categories, and a **two-level business category hierarchy** (parent → leaf).
- **FR5** — **Multi-city-ready:** every content entity is scoped to a city; taxonomies and routing
  are city-aware so additional `.fyi` city domains are a rollout, not a rewrite. Kingston is the
  only city live at launch. City resolution is by hostname. [ASSUMPTION: city = hostname-derived]
- **FR6** — SEO surfaces: per-page metadata, `sitemap`, `robots`, canonical URLs, and JSON-LD
  (see NFR group). Site-wide Organization + BreadcrumbList.

### 4.2 Local News
- **FR7** — Article entity: title, dek, body, author/byline, publish date, read-time, category,
  hero image, and cross-link references to related events and mentioned businesses.
- **FR8** — News listing with category sub-nav (Local, Politics, Business, Sports, Arts & Culture,
  Opinion), a lead story + responsive grid, and a Trending list + newsletter in the sidebar.
- **FR9** — Article detail page with a **"Related" rail** rendering linked events + mentioned
  businesses (the cross-link, made visible).
- **FR10** — News is **free / no paywall** — all articles fully readable without account or payment.
- **FR11** — Each article emits `NewsArticle` JSON-LD.
- **FR12** — Content aggregation pipeline: ingest from **primary sources** (institutional press
  releases, public feeds) and assist operator-authored drafts; competitors are a signal source
  only, never republished. [ASSUMPTION: ingestion runs as scheduled jobs / Route Handlers]

### 4.3 Events
- **FR13** — Event entity: title, blurb, start/end datetime, display date/time, category
  (Music/Food/Family/Arts/Sports), neighbourhood, price + free/paid flag, image, **venue link to a
  directory business (nullable)**, and related-news cross-links.
- **FR14** — Events page with **List ⇄ Calendar (month grid)** toggle.
- **FR15** — List view grouped into derived time buckets: Today / This Weekend / Next Week / This
  Month (derived from start datetime relative to now).
- **FR16** — Always-visible filter bar: date presets, category, neighbourhood, and Free/Paid.
- **FR17** — Event detail: full info, embedded map, **Add to Calendar** (ICS), and a **link through
  to the venue's directory page**.
- **FR18** — Each event emits `Event` JSON-LD (targets "events near me" rich results).
- **FR19** — Events may be aggregated (seeded) or user-submitted (via FR30, moderated).

### 4.4 Business Directory *(centerpiece)*
- **FR20** — Business listing entity: name, blurb, leaf + parent category, neighbourhood, price
  tier, structured hours, derived **Open Now**, address, phone, website, amenity tags, geocoordinates,
  photos, rating + review count (display), and cross-links to events hosted at the venue.
- **FR21** — Directory page: **filter panel visible by default** (desktop) with Open-Now toggle,
  hierarchical category, neighbourhood, minimum rating, and price; a **three-pane split** of
  filters | scrollable business cards | **interactive map with pins**; result count shown.
- **FR22** — **Map ⇄ list hover/selection sync** (hovering a card highlights its pin and vice versa);
  pins route to the business detail page.
- **FR23** — Sort control: Relevance / Rating / Distance / Newest / A–Z.
- **FR24** — **Geospatial search:** radius / "near me" / map-bounds queries (PostGIS); Distance sort
  depends on it.
- **FR25** — Mobile directory: single column with **list/map toggle** + slide-in filter drawer and
  an "apply / show N results" action.
- **FR26** — Active-filter chips with individual + clear-all removal.
- **FR27** — Business detail: photo gallery, header (open/closed + hours, rating, category·price·
  neighbourhood), amenity tags, About, **"Upcoming events at this venue" rail** (cross-link),
  reviews section (display + histogram), and a sticky contact card + embedded map + structured hours.
- **FR28** — Each business emits the **most-specific `LocalBusiness` subtype** JSON-LD. **Self-serving
  `aggregateRating` is NOT emitted** on LocalBusiness.
- **FR29** — **Directory seeding:** listings are seeded from public sources to city-wide density so
  the directory is useful before any owner engagement. [ASSUMPTION: automated seeding pipeline;
  store only permissible factual NAP fields per source ToS]

### 4.5 Submission, Claiming & Moderation *(trust & safety)*
- **FR30** — Public **Submit flow** (multi-step: Type → Details → Location & Media → Review) for a
  business or an event, with photo upload and a clear "reviewed before publishing" notice.
- **FR31** — **Claim-this-listing flow:** an owner claims a seeded/existing business, verifies
  ownership, and gains the ability to edit it. [ASSUMPTION: verification via emailed code or
  phone/website match at MVP; method finalized in architecture]
- **FR32** — **Moderation queue for all user-originated content** (submissions, claims, claimed-
  listing edits): status **pending → approved → published**; **never auto-publish**.
- **FR33** — **CAPTCHA** on public submission/claim forms.
- **FR34** — **Duplicate detection** on submissions (flag likely duplicates of existing listings/
  events for the moderator).
- **FR35** — Email notifications to submitters/claimants on receipt and on publish/decision.
- **FR36** — Operator moderation dashboard: review, approve, reject, edit, and merge duplicates.

### 4.6 Cross-Linking *(the wedge — explicit requirements)*
- **FR37** — Bidirectional relationships are first-class and **navigable in both directions**:
  Article↔Event, Article↔Business, Event↔Business (venue). Reverse links are derived, not hand-kept.
- **FR38** — Cross-link rails render on Article detail (FR9), Event detail (FR17), and Business
  detail (FR27).
- **FR39** — Shared neighbourhood/category facets connect items across pillars (e.g., a
  neighbourhood page or facet surfaces its news, events, and businesses). Neighbourhood landing
  pages are MVP-light; full cross-pillar facet hubs are Phase 2 (confirmed).

### 4.7 Newsletter
- **FR40** — Email newsletter ("The Limestone Letter" / "Kingston in 5"): signup (shell + footer +
  inline bands), subscriber management, and a curated digest of news + events + a featured business.
  (Weekly "Kingston in 5" at launch, daily later — confirmed.)
- **FR41** — A newsletter issue can include a **sponsor slot** (monetization hook; see FR47).

### 4.8 Monetization Hooks *(passive-first; model supports all from day one)*
- **FR42** — Businesses can be flagged/ranked as **featured/promoted** (paid placement) in the
  directory and relevant surfaces.
- **FR43** — **Business claim subscription tiers** (enhanced profile capabilities for paid claims).
  [Phase 2 for billing; the data model + claimed-listing capability ship at MVP]
- **FR44** — **Google AdSense** programmatic display units, placed under strict CWV/brand discipline
  (limited, lazy-loaded, reserved slots, no interstitials).
- **FR45** — **[Phase 2]** Direct local display-ad sales and bespoke sponsored content.
- **FR46** — **[Phase 2]** Business analytics dashboard for claimed/subscribed listings.
- **FR47** — Newsletter sponsorship slot management (pairs with FR41).

### 4.9 Admin / CMS
- **FR48** — Role-based admin (CMS) for content CRUD across all entities, the moderation queue, and
  taxonomy management.
- **FR49** — Auth: business owners hold accounts to claim/manage listings; the operator/editor holds
  an admin role. Residents browse and submit **without an account** at MVP (confirmed).

### 4.10 Later-phase functional scope (not MVP)
- **FR50 [Phase 2]** — Native user **reviews & ratings** capture (with moderation; ratings counted
  from approved reviews only). *MVP displays ratings only where sourced; no self-serving structured data.*
- **FR51 [Phase 2]** — Typo-tolerant / faceted / instant search via Meilisearch/Typesense (MVP uses
  Postgres FTS + `pg_trgm`).
- **FR52 [Phase 2]** — Additional city domains brought live on the shared platform.

### 4.11 Data Integrity, Lifecycle, Claim Governance & Operability
- **FR53 — Home hub page:** composed landing page assembling a featured/hero story, "Happening
  This Weekend" events, latest news, featured businesses, and a newsletter band, with defined
  selection rules for hero/featured slots (editorially flaggable, recency/featured-flag fallback).
  Covers UJ-1's entry point.
- **FR54 — Calendar view behavior:** month grid with month navigation, day cells showing events,
  day-selection drilling into that day's events, and the FR16 filters applying to the calendar.
  Events place on the grid by **start datetime** (not a stored day number).
- **FR55 — Cross-link referential integrity:** cross-link references (Event↔venue, Article↔business/
  event) never dangle. On delete / unpublish / merge / unclaim of a target, references resolve
  gracefully (hidden or repointed) and reverse-link rails stay consistent — no 404 venue links.
- **FR56 — Seed-vs-claim provenance:** listing fields track source (seeded vs owner-edited).
  **Re-seeding never overwrites owner-edited or claimed fields** — it only fills/updates unclaimed,
  un-edited fields; conflicts surface to moderation rather than applying silently.
- **FR57 — Claim lifecycle governance:** beyond FR31's happy path — handle competing/dual claims,
  ownership disputes, revocation (fraud/abuse), and transfer (business sold); define who may edit a
  listing while unclaimed vs claimed.
- **FR58 — Listing lifecycle states & dedup:** listings carry a state (active / temporarily-closed /
  permanently-closed / stale-unverified); seeded duplicates can be detected and merged (FR36), with
  merges preserving cross-links (FR55).
- **FR59 — Edit re-moderation:** edits to already-published user-originated content (claimed-listing
  edits, resubmitted events) re-enter the moderation queue (FR32); the state machine covers
  published → edited → pending.
- **FR60 — Moderation operability:** since all user content is gated (NFR4) and the operator is solo,
  moderation must be efficient — bulk approve/reject, a prioritized/triaged queue, duplicate-flag
  assist, and trusted-source staging — so throughput is not the launch bottleneck.
- **FR61 — Review data & rating provenance:** the Review entity (author, rating 1–5, date, text) and
  a business's rating + count are defined; at MVP, ratings/reviews shown are **sourced/imported**
  (provenance labelled) and the histogram reflects available data — **native user-review capture is
  Phase 2 (FR50)**. Listings with no rating render and sort gracefully (null-rating handling in
  FR23 and the min-rating filter).
- **FR62 — Event location:** events have an optional own location (address + geocoordinates) used
  when there is no venue business, so FR17's map and the `Event` JSON-LD always have a place;
  venue-linked events inherit the venue's location.

## 5. Cross-Cutting Non-Functional Requirements

- **NFR1 — SEO & Structured Data (core, not polish):** JSON-LD only; `NewsArticle` (FR11),
  `Event` (FR18, always with a location per FR62), most-specific `LocalBusiness` (FR28, no
  self-serving `aggregateRating`), site-wide Organization + BreadcrumbList; `sitemap`, `robots`,
  per-page generated metadata, canonical URLs. **Aggregated/curated content uses correct canonicals
  to avoid duplicate-content penalties; thin or unclaimed listing pages are gated from indexing
  (noindex / quality threshold) until enriched or claimed (ties NFR5); filter/facet URL
  combinations are crawl-controlled.**
- **NFR2 — Performance / Core Web Vitals:** meet CWV budgets (target LCP < 2.5s, INP < 200ms,
  CLS < 0.1); Server Components by
  default, minimal client JS (interactivity only for filters/map/search), optimized images and
  fonts, streaming. Ad units must not regress CWV (reserved slots → no CLS; lazy-load).
- **NFR3 — Accessibility:** WCAG 2.2 AA, with explicit attention to directory filters, search, and
  the events calendar (keyboard, focus, contrast, labels).
- **NFR4 — Trust & Safety:** nothing user-originated is publicly visible before approval (FR32),
  including **edits to published content, which re-enter moderation (FR59)**; CAPTCHA + duplicate
  detection on public forms; **rate limiting + upload constraints/scanning** against abuse; claim
  disputes/revocation handled (FR57); moderation actions auditable.
- **NFR5 — Content quality at scale:** broad automated coverage must be genuinely useful (real data
  / primary sources) — guard against thin/auto-filler pages (protects rankings and AdSense eligibility).
- **NFR6 — Data accuracy:** listing data (esp. NAP) kept consistent and current; claim flow is the
  primary accuracy-improvement path; respect source ToS on stored fields.
- **NFR7 — Multi-tenancy readiness:** city scoping pervasive in data + routing (FR5) without
  per-city code forks. **Invariant: cross-link endpoints must share the same city — no cross-city
  references or query bleed**; neighbourhood + category taxonomies are per-city. (Enforcement
  mechanism — RLS vs application-layer — is an architecture decision.)
- **NFR8 — Architectural boundaries:** Server Actions for form mutations; Route Handlers for public
  API + webhooks (no tangled mini-backend). *(Mechanism detail → architecture.)*
- **NFR9 — Privacy/compliance:** handle subscriber + submitter emails and business-owner accounts
  per Canadian norms — **CASL (email) and PIPEDA apply at launch, not deferrable past it**; specifics
  → architecture/legal.

## 6. MVP Scope vs. Later Phases

**MVP (launch):** all three pillars present and **cross-linked** (FR37–39) — that integration is the
product. Directory seeded to density + claim flow + moderation; events aggregated + submission;
free primary-source news; unified search (FR3, Postgres FTS); newsletter; SEO/JSON-LD baseline;
CWV + WCAG; multi-city-ready model with Kingston live; monetization hooks present (featured flag,
claim capability, AdSense, newsletter sponsor slot).

**Phase 2 / later:** native reviews (FR50), upgraded search (FR51), additional cities (FR52), claim
subscription billing + analytics (FR43/FR46), direct ad sales + sponsored content (FR45).

## 7. Technical Assumptions (locked — rationale belongs in architecture)

Carried from the brief; listed here as constraints the requirements assume, **not** decided here:
Next.js 16 (App Router; RSC default); single PostgreSQL + PostGIS; Payload CMS 3.x (Next-native;
admin, RBAC, auto-API); Postgres FTS + `pg_trgm` at launch with a clean upgrade path to
Meilisearch/Typesense; persistent/container or pooling-optimized serverless Postgres host. ORM
(Drizzle vs Prisma) and all mechanism/"how" decisions are **deferred to architecture** (catalogued in `addendum.md`).

## 8. Open Questions & Assumptions

- **6/12-month numeric targets for §2 metrics** — deferred (owner: Chris); set directional bands
  before launch.
- Verify KingstonToday / Village Media absence; confirm whether any incumbent directory is claimable
  (sharpens positioning).
- **Architecture-bound mechanism decisions** — claim verification, seed-vs-claim provenance,
  cross-link integrity, city-scoping enforcement (RLS vs app-layer), SEO crawl/canonical/noindex,
  moderation automation, abuse controls, CASL/PIPEDA specifics, ORM — are catalogued in
  `addendum.md` for `bmad-create-architecture`.

*Resolved this session (confirmed): newsletter = weekly at launch (FR40); residents browse/submit
without an account at MVP (FR49); native reviews = Phase 2 (FR50); neighbourhood hubs MVP-light,
full facet hubs Phase 2 (FR39).*

## 9. Related Artifacts

- **Brief (final):** `../briefs/brief-kingston.fyi-2026-05-30/brief.md`
- **Landscape research:** `../briefs/brief-kingston.fyi-2026-05-30/research-landscape.md`
- **Design reference:** `../design-reference/` — `content-model.md` (entities/fields/cross-links),
  `screen-inventory.md` (screens + flows), `design-system.md`, `prototype/`.
- **Decision trail:** `.decision-log.md` (this folder).
