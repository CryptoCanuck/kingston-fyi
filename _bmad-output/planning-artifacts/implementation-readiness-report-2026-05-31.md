---
title: Kingston.FYI — Implementation Readiness Assessment
status: complete
created: 2026-05-31
updated: 2026-05-31
stepsCompleted: [1, 2, 3, 4, 5, 6]
overallStatus: READY
issues: { critical: 0, important: 1, minor: 5 }
documents:
  prd: _bmad-output/planning-artifacts/prds/prd-kingston.fyi-2026-05-31/prd.md
  prd_addendum: _bmad-output/planning-artifacts/prds/prd-kingston.fyi-2026-05-31/addendum.md
  architecture: _bmad-output/planning-artifacts/architecture.md
  epics: _bmad-output/planning-artifacts/epics.md
  ux_design: _bmad-output/planning-artifacts/ux-designs/ux-kingston.fyi-2026-05-31/DESIGN.md
  ux_experience: _bmad-output/planning-artifacts/ux-designs/ux-kingston.fyi-2026-05-31/EXPERIENCE.md
  design_reference: _bmad-output/planning-artifacts/design-reference/
---

# Implementation Readiness Assessment Report

**Date:** 2026-05-31
**Project:** kingston.fyi

## Step 1 — Document Inventory

All four required document types found as single, canonical whole files. **No duplicates, no sharded variants, no missing required documents.**

| Type | File | Size | Modified | Status |
|---|---|---|---|---|
| PRD | `prds/prd-kingston.fyi-2026-05-31/prd.md` | 21 KB | 2026-05-31 08:31 | ✅ final (62 FRs, 9 NFRs, 4 UJs) |
| PRD addendum | `prds/prd-kingston.fyi-2026-05-31/addendum.md` | 3 KB | 2026-05-31 08:28 | ✅ supporting |
| Architecture | `architecture.md` | 28 KB | 2026-05-31 10:57 | ✅ complete |
| Epics & Stories | `epics.md` | 69 KB | 2026-05-31 12:34 | ✅ complete (8 epics / 46 stories) |
| UX — Design | `ux-designs/ux-kingston.fyi-2026-05-31/DESIGN.md` | 6 KB | 2026-05-31 12:31 | ✅ final (gap-screen deltas) |
| UX — Experience | `ux-designs/ux-kingston.fyi-2026-05-31/EXPERIENCE.md` | 12 KB | 2026-05-31 12:31 | ✅ final |
| Design reference | `design-reference/` (design-system.md, content-model.md, screen-inventory.md, design-coverage.md, prototype/) | — | 2026-05-31 12:17 | ✅ authoritative for full 8-screen system |

**Note on UX scope:** the `ux-designs/` spines are a *gap-only* pass (claim flow, owner dashboard, neighbourhood pages, component deltas) layered on top of the full 8-screen `design-reference/` prototype. Both are in scope for the cross-check; `design-reference/design-coverage.md` is the bridge mapping which FRs each surface covers.

**Issues found:** none. No duplicate formats to resolve; no required document missing.

## Step 2 — PRD Analysis

### Functional Requirements (62 total, FR1–FR62)

**4.1 Platform & Global Shell**
- FR1 — Responsive global shell (sticky header: wordmark, nav News/Events/Directory, persistent search, Submit CTA; mobile hamburger + search drawer).
- FR2 — Global footer (section links, social links, newsletter signup).
- FR3 — Unified search w/ autocomplete spanning all three pillars; results route to detail; full query → directory/results.
- FR4 — Shared taxonomies as facets: Neighbourhoods, news categories, event categories, two-level business category hierarchy.
- FR5 — Multi-city-ready: every entity city-scoped; city resolution by hostname; Kingston only at launch.
- FR6 — SEO surfaces: per-page metadata, sitemap, robots, canonical URLs, JSON-LD; site-wide Organization + BreadcrumbList.

**4.2 Local News**
- FR7 — Article entity (title, dek, body, byline, publish date, read-time, category, hero image, cross-links to events + businesses).
- FR8 — News listing w/ category sub-nav, lead story + grid, Trending + newsletter sidebar.
- FR9 — Article detail w/ "Related" rail (linked events + mentioned businesses).
- FR10 — News free / no paywall.
- FR11 — Article emits NewsArticle JSON-LD.
- FR12 — Content aggregation pipeline from primary sources + operator drafts; competitors signal-only, never republished.

**4.3 Events**
- FR13 — Event entity (title, blurb, start/end datetime, display date/time, category, neighbourhood, price + free/paid flag, image, nullable venue link, related-news cross-links).
- FR14 — Events page w/ List ⇄ Calendar (month grid) toggle.
- FR15 — List view grouped into derived buckets: Today / This Weekend / Next Week / This Month.
- FR16 — Always-visible filter bar: date presets, category, neighbourhood, Free/Paid.
- FR17 — Event detail: full info, embedded map, Add to Calendar (ICS), link to venue's directory page.
- FR18 — Event emits Event JSON-LD.
- FR19 — Events aggregated (seeded) or user-submitted (FR30, moderated).

**4.4 Business Directory (centerpiece)**
- FR20 — Business listing entity (name, blurb, leaf+parent category, neighbourhood, price tier, structured hours, derived Open Now, address, phone, website, amenity tags, geocoords, photos, rating + count display, event cross-links).
- FR21 — Directory page: default-visible filter panel (Open-Now, hierarchical category, neighbourhood, min rating, price); three-pane split filters | cards | interactive map; result count.
- FR22 — Map ⇄ list hover/selection sync; pins route to detail.
- FR23 — Sort: Relevance / Rating / Distance / Newest / A–Z.
- FR24 — Geospatial search: radius / near-me / map-bounds (PostGIS); Distance sort depends on it.
- FR25 — Mobile directory: single column, list/map toggle, slide-in filter drawer, apply/show-N action.
- FR26 — Active-filter chips w/ individual + clear-all removal.
- FR27 — Business detail: gallery, header (open/closed+hours, rating, category·price·neighbourhood), amenity tags, About, "Upcoming events at this venue" rail, reviews (display + histogram), sticky contact card + map + hours.
- FR28 — Business emits most-specific LocalBusiness subtype JSON-LD; NO self-serving aggregateRating.
- FR29 — Directory seeding from public sources to city-wide density.

**4.5 Submission, Claiming & Moderation**
- FR30 — Public Submit flow (Type → Details → Location & Media → Review) for business/event, photo upload, "reviewed before publishing" notice.
- FR31 — Claim-this-listing flow: owner claims, verifies ownership, gains edit ability.
- FR32 — Moderation queue for ALL user-originated content; pending → approved → published; never auto-publish.
- FR33 — CAPTCHA on public submission/claim forms.
- FR34 — Duplicate detection on submissions.
- FR35 — Email notifications to submitters/claimants on receipt and decision.
- FR36 — Operator moderation dashboard: review, approve, reject, edit, merge duplicates.

**4.6 Cross-Linking (the wedge)**
- FR37 — Bidirectional, navigable relationships: Article↔Event, Article↔Business, Event↔Business; reverse links derived.
- FR38 — Cross-link rails on Article (FR9), Event (FR17), Business (FR27) detail.
- FR39 — Shared neighbourhood/category facets connect items across pillars; neighbourhood landing pages MVP-light; full facet hubs Phase 2.

**4.7 Newsletter**
- FR40 — Email newsletter: signup (shell+footer+inline), subscriber management, curated digest (news+events+featured business); weekly at launch.
- FR41 — Newsletter issue can include sponsor slot (pairs FR47).

**4.8 Monetization Hooks**
- FR42 — Featured/promoted (paid placement) flag/ranking in directory + surfaces.
- FR43 — Business claim subscription tiers [Phase 2 billing; data model + claimed-listing capability at MVP].
- FR44 — Google AdSense units under strict CWV/brand discipline.
- FR45 — [Phase 2] Direct local ad sales + sponsored content.
- FR46 — [Phase 2] Business analytics dashboard.
- FR47 — Newsletter sponsorship slot management (pairs FR41).

**4.9 Admin / CMS**
- FR48 — Role-based admin (CMS) for content CRUD, moderation queue, taxonomy management.
- FR49 — Auth: business owners hold accounts to claim/manage; operator holds admin role; residents browse+submit without account.

**4.10 Later-phase (not MVP)**
- FR50 [Phase 2] — Native user reviews & ratings capture (moderated).
- FR51 [Phase 2] — Typo-tolerant/faceted/instant search (Meilisearch/Typesense); MVP = Postgres FTS + pg_trgm.
- FR52 [Phase 2] — Additional city domains.

**4.11 Data Integrity, Lifecycle, Claim Governance & Operability**
- FR53 — Home hub page (hero story, "Happening This Weekend", latest news, featured businesses, newsletter band; defined slot selection rules). Covers UJ-1 entry.
- FR54 — Calendar view behavior (month grid, navigation, day cells, day-selection drill-in, FR16 filters apply; events placed by start datetime).
- FR55 — Cross-link referential integrity: references never dangle; graceful resolve on delete/unpublish/merge/unclaim; consistent reverse rails.
- FR56 — Seed-vs-claim provenance: field-level source tracking; re-seeding never overwrites owner-edited/claimed fields; conflicts → moderation.
- FR57 — Claim lifecycle governance: dual/competing claims, disputes, revocation, transfer; who may edit unclaimed vs claimed.
- FR58 — Listing lifecycle states (active/temp-closed/perm-closed/stale-unverified) + dedup/merge preserving cross-links.
- FR59 — Edit re-moderation: edits to published user content re-enter the queue; published → edited → pending state machine.
- FR60 — Moderation operability: bulk approve/reject, prioritized/triaged queue, dup-flag assist, trusted-source staging.
- FR61 — Review data & rating provenance: Review entity defined; MVP ratings sourced/imported (provenance-labelled); native capture Phase 2 (FR50); null-rating handling in FR23 + min-rating filter.
- FR62 — Event location: optional own location (address+geocoords) when no venue, so FR17 map + Event JSON-LD always have a place; venue-linked events inherit venue location.

**Total FRs: 62.** MVP unless tagged [Phase 2]. Explicit Phase-2: FR43 (billing portion), FR45, FR46, FR50, FR51, FR52, + FR39 full-facet-hubs portion.

### Non-Functional Requirements (9 total, NFR1–NFR9)
- NFR1 — SEO & Structured Data (core): JSON-LD (NewsArticle/Event-always-with-location/most-specific-LocalBusiness-no-aggregateRating, Organization, BreadcrumbList); sitemap/robots/metadata/canonicals; aggregated content canonicalized; thin/unclaimed listing pages gated from indexing (noindex/quality threshold); filter/facet URLs crawl-controlled.
- NFR2 — Performance / CWV: LCP<2.5s, INP<200ms, CLS<0.1; RSC default, minimal client JS, optimized images/fonts, streaming; ad units must not regress CWV.
- NFR3 — Accessibility: WCAG 2.2 AA, explicit attention to filters, search, calendar.
- NFR4 — Trust & Safety: nothing user-originated public before approval (incl. edits, FR59); CAPTCHA + dup detection; rate limiting + upload constraints/scanning; claim disputes/revocation; auditable moderation.
- NFR5 — Content quality at scale: automated coverage genuinely useful; guard against thin/auto-filler.
- NFR6 — Data accuracy: NAP consistency/currency; claim flow primary accuracy path; respect source ToS.
- NFR7 — Multi-tenancy readiness: pervasive city scoping in data + routing; invariant — cross-link endpoints share same city, no cross-city bleed; per-city taxonomies. (RLS vs app-layer = architecture decision.)
- NFR8 — Architectural boundaries: Server Actions for mutations; Route Handlers for public API + webhooks.
- NFR9 — Privacy/compliance: CASL + PIPEDA apply at launch.

### Additional Requirements / Constraints
- 4 User Journeys: UJ-1 (Maya — cross-link weekend discovery), UJ-2 (Dale — claim listing), UJ-3 (Priya — submit event), UJ-4 (Operator daily loop).
- Technical assumptions (locked, rationale → architecture): Next.js 16 App Router/RSC; single PostgreSQL + PostGIS; Payload CMS 3.x; Postgres FTS + pg_trgm w/ upgrade path; persistent/pooling-optimized host. ORM + mechanism "how" deferred to architecture.
- Addendum: architecture decision backlog (ORM, city/tenancy enforcement, claim verification+lifecycle, seed-vs-claim provenance, cross-link integrity, directory data lifecycle, SEO mechanics, moderation automation, abuse controls, CASL/PIPEDA, search upgrade trigger, hosting). Rejected alternative preserved: scrape+rewrite competitor articles (REJECTED — copyright/trust/scaled-content-abuse).

### PRD Completeness Assessment
PRD is **final, internally consistent, and unusually traceable** for this stage. Strengths: stable global FR IDs; explicit MVP-vs-Phase-2 tagging on each later item; a dedicated §4.11 that closes the integrity/lifecycle/governance gaps most PRDs leave implicit (provenance, claim governance, re-moderation, referential integrity, operability); NFRs separated cleanly with cross-references back to FRs; mechanism "how" correctly pushed to the addendum/architecture. Open items are appropriately scoped to (a) numeric metric targets (deferred, owner Chris) and (b) architecture-bound mechanism decisions (which the architecture must answer — validated in Step 4). No requirement is left ambiguous enough to block epic coverage validation.

## Step 3 — Epic Coverage Validation

The epics document carries its own **FR Coverage Map** (epics.md lines 178–246) plus per-epic "FRs covered" lines. I validated that map down to the **story level** — every FR must trace to a concrete story, not merely to an epic label.

### Coverage Matrix (FR → Epic → Story)

| FR | Epic | Concrete Story | Status |
|---|---|---|---|
| FR1 responsive shell | 1 | 1.7 Responsive Global Shell | ✓ |
| FR2 footer | 1 | 1.7 | ✓ |
| FR3 unified search | 6 | 6.1 Unified Cross-Pillar Search | ✓ |
| FR4 shared taxonomies | 1 | 1.4 Shared Taxonomy Collections | ✓ |
| FR5 multi-city-ready | 1 | 1.2 City Scoping Foundation | ✓ |
| FR6 SEO surfaces | 1 | 1.8 Centralized SEO Infra | ✓ |
| FR7 Article entity | 4 | 4.1 | ✓ |
| FR8 news listing | 4 | 4.2 | ✓ |
| FR9 article detail + Related | 4 | 4.3 | ✓ |
| FR10 free/no paywall | 4 | 4.2 | ✓ |
| FR11 NewsArticle JSON-LD | 4 | 4.1 | ✓ |
| FR12 news aggregation | 4 | 4.4 (infra: 1.9 inference client) | ✓ |
| FR13 Event entity | 3 | 3.1 | ✓ |
| FR14 List ⇄ Calendar | 3 | 3.2 + 3.3 | ✓ |
| FR15 time buckets | 3 | 3.2 | ✓ |
| FR16 events filter bar | 3 | 3.2 | ✓ |
| FR17 event detail + map + ICS | 3 | 3.4 | ✓ |
| FR18 Event JSON-LD | 3 | 3.1 | ✓ |
| FR19 events seeded/submitted | 3 | 3.5 (+ submit path 5.1) | ✓ |
| FR20 Business entity | 2 | 2.1 | ✓ |
| FR21 directory three-pane | 2 | 2.4 | ✓ |
| FR22 map ⇄ list sync | 2 | 2.6 | ✓ |
| FR23 sort control | 2 | 2.5 | ✓ |
| FR24 geospatial/PostGIS | 2 | 2.5 (geo infra 1-time migration 2.1) | ✓ |
| FR25 mobile directory | 2 | 2.7 | ✓ |
| FR26 active-filter chips | 2 | 2.4 | ✓ |
| FR27 business detail | 2 | 2.2 | ✓ |
| FR28 LocalBusiness JSON-LD | 2 | 2.1 | ✓ |
| FR29 directory seeding | 2 | 2.8 (infra 1.9) | ✓ |
| FR30 Submit wizard | 5 | 5.1 | ✓ |
| FR31 claim-this-listing | 5 | 5.4 | ✓ |
| FR32 moderation queue | 5 | 5.2 (gate infra 1.5) | ✓ |
| FR33 CAPTCHA | 5 | 5.1 | ✓ |
| FR34 duplicate detection | 5 | 5.3 | ✓ |
| FR35 email notifications | 5 | 5.7 | ✓ |
| FR36 moderation dashboard | 5 | 5.2 + 5.3 (merge) | ✓ |
| FR37 bidirectional cross-links | 6 | 6.3 (primitives 1.5; fields per-pillar) | ✓ |
| FR38 cross-link rails | 6 | 6.3 (rendered per-pillar 2.2/3.4/4.3) | ✓ |
| FR39 neighbourhood pages | 6 | 6.4 | ✓ |
| FR40 newsletter | 7 | 7.1 + 7.2 | ✓ |
| FR41 sponsor slot | 7 | 7.3 | ✓ |
| FR42 featured/promoted | 7 | 7.4 | ✓ |
| FR43 claim subscription (model only @MVP) | 7 | 7.6 | ✓ |
| FR44 AdSense | 7 | 7.5 | ✓ |
| FR45 direct ad sales | 8 | — (Phase 2, no story by design) | ⏸ Deferred |
| FR46 analytics dashboard | 8 | — (Phase 2, no story by design) | ⏸ Deferred |
| FR47 newsletter sponsorship mgmt | 7 | 7.3 | ✓ |
| FR48 role-based admin | 1 | 1.3 | ✓ |
| FR49 auth + owner dashboard | 1 + 5 | 1.3 (auth/RBAC) + 5.10 (dashboard) | ✓ |
| FR50 native reviews | 8 | — (Phase 2, no story by design) | ⏸ Deferred |
| FR51 upgraded search | 8 | — (Phase 2, no story by design) | ⏸ Deferred |
| FR52 additional cities | 8 | — (Phase 2, no story by design) | ⏸ Deferred |
| FR53 Home hub | 6 | 6.2 | ✓ |
| FR54 calendar behavior | 3 | 3.3 | ✓ |
| FR55 cross-link integrity | 5 | 5.8 (rails 6.3; primitives 1.5) | ✓ |
| FR56 seed-vs-claim provenance | 5 | 5.5 (fields land 2.1 + 1.9) | ✓ |
| FR57 claim lifecycle governance | 5 | 5.4 | ✓ |
| FR58 listing states + dedup | 2 + 5 | 2.8 (states) + 5.3 (merge) | ✓ |
| FR59 edit re-moderation | 5 | 5.6 | ✓ |
| FR60 moderation operability | 5 | 5.9 | ✓ |
| FR61 review data + provenance | 2 | 2.3 (+ display 2.2) | ✓ |
| FR62 event location fallback | 3 | 3.1 | ✓ |

### Missing Requirements
**None.** Every MVP FR traces to at least one concrete story with Given/When/Then acceptance criteria. The five Phase-2 FRs (FR45, FR46, FR50, FR51, FR52) are deliberately parked in Epic 8 with no detailed stories — this is correct scope discipline, not a gap.

No reverse-gap either: every FR in the epics inventory (FR1–FR62) corresponds to a PRD FR — no orphan/invented requirements in the epics.

**Observations (informational, not gaps):**
- Several FRs are intentionally **split across epics** by dependency layering (FR49 auth→1.3 / dashboard→5.10; FR58 states→2.8 / merge→5.3; FR37/38 primitives→1.5 / render→per-pillar / finalize→6.3; FR55 primitives→1.5 / enforce→5.8 / rails→6.3; FR56 fields→2.1+1.9 / enforce→5.5). This sequencing is sound — infra-first, then consumption — and each split is explicitly documented in the coverage map.
- The **AR1–AR24** architecture requirements and **UX-DR1–UX-DR19** design requirements are also inventoried in epics and woven into story ACs (e.g. AR1→1.1, AR22→2.8, UX-DR11→2.4, UX-DR13→5.1). These are validated against the architecture/UX docs in Steps 4–5.

### Coverage Statistics
- **Total PRD FRs:** 62
- **FRs mapped to epics:** 62 (100%)
- **MVP FRs with a concrete story:** 57 / 57 (100%)
- **Phase-2 FRs intentionally deferred (no story):** 5 (FR45, FR46, FR50, FR51, FR52)
- **Orphan FRs (in epics, not in PRD):** 0
- **Coverage verdict:** ✅ Complete — no missing implementation path.

## Step 4 — UX Alignment Assessment

### UX Document Status
**Found — two complementary layers.**
1. **Full 8-screen prototype** in `design-reference/` (`design-system.md`, `content-model.md`, `screen-inventory.md`) — the locked civic-editorial visual system + the original public screens. Already distilled into UX-DR1–UX-DR19 in epics.md.
2. **Gap-spine pass** in `ux-designs/ux-kingston.fyi-2026-05-31/` (`DESIGN.md` + `EXPERIENCE.md`, both `status: final`) — covers the A-list surfaces that exceeded the prototype: claim flow (FR31), owner dashboard (FR49/Story 5.10), neighbourhood pages (FR39), and 9 net-new component deltas (StatusBadge, PromotedTag, ProvenanceLabel, AdSlot, VerificationPanel, InReviewPill, DashboardNav, ListingManageCard, LocationControl). Bridge: `design-reference/design-coverage.md`.

### UX ↔ PRD Alignment — ✅ Aligned
- Every UX surface maps to a PRD FR; no UX requirement is absent from the PRD. The `design-coverage.md` gap analysis performed exactly this reconciliation, classifying each uncovered FR as a real public/owner gap (designed), a Payload-admin-native concern (out of scope, decided), an email template (deferred), or Phase 2 (deferred).
- User journeys align cleanly: UJ-1 (Maya cross-link discovery) → EXPERIENCE Flow 3 (neighbourhood) + Flow 4 (distance sort); UJ-2 (Dale claims) → Flow 1 (claim, "You now manage…") + Flow 2 (re-moderated edit); UJ-3 (Priya submits) → existing Submit wizard (UX-DR13/Story 5.1); UJ-4 (operator loop) → correctly routed to Payload admin (out of UX scope, decided).
- Microcopy, state machines (claim flow, edit re-moderation, lifecycle), and the WCAG 2.2 AA floor in EXPERIENCE.md are consistent with FR31/32/57/58/59/61 and NFR3/NFR4.

### UX ↔ Architecture Alignment — ✅ Capabilities supported; ⚠️ one structural-doc drift
**Supported:** every UX behavior has an architectural home —
- Owner accounts + `/login` + `/dashboard` → Payload built-in auth, `business-owner` role, `isBusinessOwner()` access helper.
- Claim flow + verification → Server Action `claimListing`; **AR17 verification method (website-meta / email-domain match + emailed code + operator backstop) matches EXPERIENCE.md's auto-detect path exactly**; lifecycle `unclaimed → pending-claim → claimed / disputed / revoked / transferred` matches.
- Owner edit → Server Action `ownerEdit` + re-moderation (`published → edited → pending`) — matches Flow 2.
- LocationControl gating Distance sort → PostGIS `ST_DWithin` + FR24.
- AdSlot zero-CLS / reserved / lazy → architecture's "reserved ad slots (no CLS), lazy-load AdSense."
- ProvenanceLabel "Rating from Google" → Places provenance model (FR56) + display/attribution rules.
- Transform-only transitions, MapLibre lazy map, RSC-default → all consistent.

**⚠️ FINDING (Important, non-blocking) — architecture structure tree predates the UX gap pass.**
The architecture was finalized at 10:57; the owner-dashboard/claim UX at 12:31. As a result, the architecture's **"Complete Project Directory Structure"** and **"Requirements → Structure Mapping"** enumerate `submit/` and `neighbourhood/[slug]/` but do **not** list the owner-facing routes the UX + Stories 5.4/5.10 now require:
- `app/(frontend)/claim/[businessId]/page.tsx` (FR31)
- `app/(frontend)/login/page.tsx` (FR49)
- `app/(frontend)/dashboard/page.tsx` + `dashboard/listings/[id]/edit/page.tsx` (FR49/FR59)
- a `components/dashboard/` (or `owner/`) home for the net-new components: `DashboardNav`, `ListingManageCard`, `InReviewPill`, `VerificationPanel`, plus the directory-surface deltas `StatusBadge`, `PromotedTag`, `ProvenanceLabel`, `LocationControl` (AdSlot already has `components/ads/`).

The **capabilities, boundaries, and decisions are all present** (auth, claim Server Action, ownerEdit, provenance) — only the *structural enumeration* lags. This is exactly the cross-doc drift this gate exists to catch.

**Recommendation:** a light architecture touch-up to add these route segments + a `components/dashboard/` entry to the structure tree and the FR-map row for FR49 (owner dashboard). Alternatively, capture it as an explicit implementation note carried into Story 5.4 / Story 5.10 so the implementing agent has an unambiguous placement. Either resolves it; the architecture edit is cleaner and keeps the single-source-of-truth intact. **Not a blocker for Sprint Planning or Story 1.1** (foundation epic is unaffected) — but should be resolved before Epic 5 stories are pulled.

### Warnings
- No missing UX where UI is implied (the inverse failure mode) — all user-facing FRs have either a prototype screen or a gap-spine surface.
- Email/newsletter templates (FR35/40/41/47) are intentionally **not** UX-designed yet (deferred to a separate pass, per the UX decision log). Their *triggering states* are specified in EXPERIENCE.md and the *send capability* is architected (Resend). Flag for a future light UX pass; not an MVP blocker for the data/flow layer, but the operator-facing send needs at least minimal templates before launch.

## Step 5 — Epic Quality Review

Validated all 8 epics / 46 stories against the create-epics-and-stories standards (user value, independence, forward dependencies, sizing, AC quality, DB-timing, greenfield starter rule).

### Best-Practices Compliance Checklist
| Check | Result |
|---|---|
| Epics deliver user value (not pure technical milestones) | ✅ (Epic 1 is the sanctioned greenfield-foundation exception — see Minor #1) |
| Epic independence (Epic N never requires Epic N+1) | ✅ No breaking forward dependencies |
| Stories appropriately sized & independently completable | ✅ |
| No forward dependencies / circular deps | ✅ (handled via graceful degradation) |
| DB tables created when needed (not all upfront) | ✅ |
| Clear Given/When/Then acceptance criteria | ✅ |
| Traceability to FRs maintained | ✅ (every story cites its FRs/ARs/UX-DRs) |
| Greenfield: scaffold story + CI/CD early | ✅ Story 1.1 |
| Starter-template requirement (arch names Payload `blank`) | ✅ Story 1.1 uses the exact `create-payload-app` command |

### 🔴 Critical Violations
**None.** No technical-milestone-only epics, no independence-breaking forward dependencies, no epic-sized "do everything" stories.

### 🟠 Major Issues
**None.**
- The one cross-document item of real weight — Epic 5 Stories 5.4 (claim flow) and 5.10 (owner dashboard) reference routes/components (`/claim/[id]`, `/login`, `/dashboard`, `DashboardNav`, `ListingManageCard`, `VerificationPanel`) **not yet enumerated in the architecture's structure tree** — is logged as the Step 4 Important finding. It is an architecture-doc gap, not an epic-quality defect (the stories themselves are well-formed and trace correctly to FR31/FR49/FR59). Resolve per the Step 4 recommendation before pulling Epic 5.

### 🟡 Minor Concerns
1. **Epic 1 is foundation-heavy.** It bundles scaffold + city scoping + auth + taxonomy + design system + SEO + jobs runtime — several stories (1.1, 1.2, 1.5, 1.8, 1.9) are developer/operator-facing infrastructure rather than resident-facing value. This is the **expected and BMAD-sanctioned greenfield exception** (Story 1.1 *must* be the starter scaffold), and Epic 1 does ship a visible artifact (Story 1.7 responsive shell + a reachable site). No action required; noted for completeness. *Mitigation already present:* the epic is framed around a "live, deployable, SEO-correct, accessible site shell," giving it a demonstrable end state.
2. **A few negative/branch UX states are covered at lifecycle level but not surfaced as discrete ACs.** EXPERIENCE.md specifies `already-claimed → "Report a problem"`, `verification-exhausted → operator backstop`, and `expired-code → resend`; Story 5.4's ACs cover these via the lifecycle state machine (disputed/dual-claim) but don't each appear as their own Given/When/Then. Non-blocking — tighten when running Create-Story for 5.4 so the dev agent gets explicit branch coverage.
3. **Epic 6 Story 6.3 ("finalize bidirectional cross-link rails") overlaps the per-pillar rail rendering in Stories 2.2 / 3.4 / 4.3.** This is intentional (earlier epics render their own rails defensively-empty; 6.3 completes the bidirectional consistency once all pillars exist), but it should carry a one-line note so the implementer doesn't re-build rails from scratch. Recommend clarifying 6.3's scope as "wire reverse direction + revalidation, reusing the rail components built in Epics 2–4" at Create-Story time.
4. **Minor traceability polish:** epics.md still describes itself as "45 stories" in places / the coverage map header says "All 62 FRs mapped" — actual count is **46 stories** after Story 5.10 was added. Cosmetic; update the count for cleanliness.

### Story Sizing & Dependency Notes (positive findings worth recording)
- **Graceful-degradation discipline is excellent.** Story 2.2's "upcoming events" rail "renders gracefully empty until Events (Epic 3) exist," and Story 1.7's search bar "produces no dead-end errors; cross-pillar wiring deferred to Epic 6." This is precisely how to avoid forward dependencies in a cross-linked product — the plan does it consistently.
- **DB creation is correctly staged:** Epic 1 creates only the truly-foundational collections (cities, users, taxonomies); pillar entities (businesses 2.1, events 3.1, articles 4.1, reviews 2.3, submissions/claims in Epic 5) are created in their own epics when first needed. No "all tables upfront" anti-pattern.
- **Build order 1→2→3→4→5→6→7 is strictly increasing** with no circular references; matches the architecture's stated implementation sequence.

## Summary and Recommendations

### Overall Readiness Status
## ✅ READY (proceed to Sprint Planning + Story 1.1) — with 1 important architecture touch-up to land before Epic 5

The four planning artifacts are mutually consistent, complete, and traceable. PRD↔Epics FR coverage is **100% (62/62 mapped; 57/57 MVP FRs storied)**; the architecture independently validates all 62 FRs to concrete structural homes; UX↔PRD↔Architecture alignment is clean on capabilities. There are **zero critical issues** and **zero blockers for Sprint Planning or the Epic 1 foundation work**.

### Issue Tally
- 🔴 **Critical / blocking:** 0
- 🟠 **Important (resolve before the dependent epic):** 1 — architecture structure-tree drift (owner-facing routes/components).
- 🟡 **Minor (polish / tighten at Create-Story time):** 5 — Epic 1 foundation-heaviness (sanctioned, no action), claim/dashboard branch ACs (tighten at 5.4), Story 6.3 rail-overlap note, story-count cosmetic (45→46), email-template UX pass deferred.

### The one item worth acting on (Important, non-blocking)
**Architecture's "Complete Project Directory Structure" + "Requirements → Structure Mapping" predate the UX gap pass** and omit the owner-facing surfaces that Stories 5.4 / 5.10 + EXPERIENCE.md require:
- Routes: `claim/[businessId]`, `login`, `dashboard`, `dashboard/listings/[id]/edit`.
- Components home: `components/dashboard/` (DashboardNav, ListingManageCard, InReviewPill, VerificationPanel) + directory deltas (StatusBadge, PromotedTag, ProvenanceLabel, LocationControl).

The **capabilities, boundaries, and decisions all exist** (Payload auth + business-owner role, `claimListing`/`ownerEdit` Server Actions, AR17 verification matching EXPERIENCE.md exactly, provenance, PostGIS distance). Only the structural enumeration lags. **Foundation Epic 1 and Epics 2–4 are entirely unaffected** — this only needs to be resolved before Epic 5 stories are pulled into a sprint.

### Recommended Next Steps
1. **Proceed.** `[SP]` **Sprint Planning** (`bmad-sprint-planning`) → then the story cycle from **Story 1.1** (scaffold). Nothing blocks the foundation epic.
2. **Before Epic 5** (not before Story 1.1): apply a light **architecture Update** adding the four owner-facing route segments + a `components/dashboard/` entry to the structure tree, and extend the FR49 row of the Requirements→Structure map. ~15-minute edit; keeps the architecture authoritative. (Alternatively, carry it as an explicit note into Create-Story for 5.4/5.10 — but the architecture edit is cleaner.)
3. **At Create-Story time for Story 5.4:** add discrete Given/When/Then ACs for the EXPERIENCE.md branch states (already-claimed → "Report a problem", verification-exhausted → operator backstop, expired code → resend).
4. **At Create-Story time for Story 6.3:** scope it as "wire reverse direction + `cross:{id}` revalidation, reusing the rail components built in Epics 2–4" so rails aren't double-built.
5. **Cosmetic:** update epics.md story count (45 → 46) post-Story-5.10.
6. **Track for pre-launch (not MVP-blocking now):** a light UX/template pass for transactional + newsletter emails (FR35/40/41/47); plus the already-logged architecture hardening backlog (axe-core a11y CI, seeded-ratings ToS source, DB backup/DR).

### Final Note
This assessment reviewed PRD (62 FRs / 9 NFRs / 4 UJs), Architecture (complete, 16/16 checklist), Epics (8 epics / 46 stories), and UX (full prototype + gap spines). It identified **6 issues across 2 active severity bands (1 important, 5 minor) and 0 critical** — an unusually clean result reflecting the depth of the planning phase. None block the start of implementation. Address the single important item before Epic 5; the minor items are best handled inline during the per-story Create-Story step. **Recommendation: proceed to Sprint Planning and begin Story 1.1.**

---
*Assessment: Implementation Readiness (IR) · Assessor: BMad PM (implementation-readiness) · Date: 2026-05-31 · Project: kingston.fyi · For: Chris*

