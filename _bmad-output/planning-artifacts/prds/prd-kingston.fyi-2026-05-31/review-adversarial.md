# Adversarial Review — Kingston.FYI PRD (2026-05-31)

Reviewer stance: hostile. Scope: gaps that bite during architecture/build of a cross-linked
news+events+directory hub. Evidence cites FR/NFR IDs from `prd.md` and the design-reference
`content-model.md`. Severity: **critical** (will cause data corruption, legal/SEO penalty, or
launch-blocking rework), **high** (predictable mid-build redesign or silent prod incident),
**medium** (real gap, deferrable but should be named).

---

## A. Cross-link integrity edge cases

### A1. Venue deletion/unclaim/merge leaves orphaned event references — UNSPECIFIED — **CRITICAL**
FR13 makes `bizId` a nullable venue link; FR36 explicitly allows the operator to **merge
duplicates**. The PRD never states what happens to events (or articles' `relatedBiz[]`) when the
referenced business is deleted, merged into another listing, or has its claim revoked. Concrete
failure modes that are currently undefined:
- **Merge:** `b4` and `b9` are duplicates, operator merges `b9`→`b4`. Do `e3,e7` (which pointed at
  `b9`) get repointed to `b4`? If not, they dangle. FR36 lists "merge duplicates" as a feature but
  the merge's effect on inbound cross-links (events, article mentions, reverse rails) is unspecified.
- **Delete:** if a seeded business is removed (closed, ToS takedown, bad data), `Event.bizId` and
  `Article.relatedBiz[]` become dangling FKs. The Event detail "link through to venue" (FR17) and
  the Article "Related rail" (FR9) will 404 or render empty.
- **Unclaim/revocation:** see B-series. The listing may persist but its content state changes.

The PRD asserts "Reverse links are derived, not hand-kept" (FR37) but derivation does not solve
referential integrity on the *forward* side. Architecture needs an explicit policy:
`ON DELETE SET NULL` vs `RESTRICT` vs soft-delete-with-tombstone, and a merge procedure that
rewrites all inbound references in one transaction. **This is the single highest-risk gap** because
the cross-link is the stated product wedge.

### A2. Reverse-link derivation vs. moderation state mismatch — **HIGH**
FR37 says reverse links are derived. But events can be `pending` (FR32) and businesses can be
`pending`. If an event's reverse appearance on the venue's "Upcoming events at this venue" rail
(FR27) is a pure join, a **pending/unpublished event will leak onto a published business page** the
moment the FK is set, before moderation. Same hazard for `relatedBiz[]` pointing at a still-pending
submitted business surfacing on a published article. The derivation query MUST filter by
`status=published` on the *target* in every direction — this is not stated and is easy to miss
because reverse links are described as automatic.

### A3. Cross-link editing/curation authority undefined — **HIGH**
Who sets `Article.relatedBiz[]`, `Article.relatedEvents[]`, `Event.relatedNews[]`? FR7/FR13 list
them as fields; FR12 mentions aggregation/operator drafts. But:
- Can a business owner editing their *claimed* listing add/remove which events link to them, or
  attach themselves as the venue of an arbitrary event? That is a vector for hijacking SEO/cross-link
  surface (e.g., claim a popular venue, attach your unrelated promo event). No authority model for
  who may create/modify a cross-link is given.
- Article cross-links are presumably operator-only, but FR37 doesn't say. Without an authority
  matrix the moderation/claim flows (FR31–36) have a hole.

### A4. Cross-pillar reference cardinality / self-reference / cycles — **MEDIUM**
No constraints stated: can an event reference itself as related-news (no), can two articles
mutually reference creating a render loop in the "Related" rail (FR9), is there a cap on
`relatedBiz[]` length (unbounded array → unbounded rail render → CWV risk per NFR2)? Minor but
should be bounded.

---

## B. Moderation / trust & safety holes

### B1. Edit-after-approval re-moderation loop is implied but not closed — **HIGH**
FR32 puts "claimed-listing edits" into the queue (good). But the **state machine is incomplete**.
It lists `pending → approved → published`. Missing: what is the public-facing state of a *published*
listing while a claimed edit sits pending? Two acceptable designs (show last-published version vs.
hide) are not chosen, and the wrong choice means either stale data or a business page going dark on
every edit. Also missing: rejected state, and the transition `published → (edit) → pending` (does
the live version stay up? — must, per NFR4 "nothing user-originated visible before approval," which
actually creates tension: the *already-approved* version is fine to keep live, but the PRD's blanket
"never auto-publish" needs the carve-out spelled out so devs don't hide live listings on edit).

### B2. Claim disputes / ownership conflicts — ENTIRELY ABSENT — **CRITICAL**
FR31 describes a single happy-path claim ("an owner claims... verifies... gains edit"). There is no
requirement for:
- **Two parties claiming the same listing** (former vs current owner, franchisee vs corporate,
  competitor squatting). No conflict-resolution, no "already claimed — request transfer" path.
- **Claim revocation / transfer** when a business is sold or a claim was fraudulent. Once claimed,
  is it claimed forever? FR43 attaches paid subscription tiers to claims — a disputed/expired claim
  now has billing entanglement.
- **What un-claiming does to owner-supplied edits** (photos, hours, description). Do they revert to
  seeded data or persist orphaned?

For a directory whose north-star metric is *claimed listings* (§2) and whose revenue is *claim
subscriptions* (FR43), the absence of a dispute/revocation model is a launch-blocking trust gap.

### B3. Verification method is hand-waved with real abuse surface — **HIGH**
FR31 ASSUMPTION: "emailed code or phone/website match." Both named methods are weak:
- Email/phone "match" against *seeded* NAP data means anyone who can receive at the seeded
  email/phone claims it — fine for a real owner, but the seeded contact may be a generic info@,
  a reception desk, or scraped wrong. No fallback/escalation path, no manual-review tier for
  high-value listings, no rate-limit on claim attempts.
- "Website match" (e.g., meta tag / file upload) presumes the listing has a website; many seeded
  SMBs won't. Undefined fallback.
This is flagged as "finalize in architecture," but the *requirement* that there be an
abuse-resistant, manual-escalation-capable verification path should be in the PRD, not deferred to
mechanism.

### B4. Spam / abuse controls are under-specified beyond CAPTCHA — **HIGH**
FR33 (CAPTCHA) + FR34 (duplicate detection) are the only stated defenses. Missing:
- **Rate limiting / throttling** per IP/email on the public Submit and Claim forms. CAPTCHA alone
  doesn't stop a slow bot or a determined human flooding the queue — and the whole model is
  "solo operator reviews everything" (NFR4: unreviewed-public must stay zero), so a flood is a
  denial-of-service against the *operator's attention*, the scarcest resource (G4).
- **Photo upload abuse**: FR30 allows photo upload from anonymous (no-account, FR49) submitters.
  No requirement for malware/EXIF scrubbing, NSFW/illegal-content screening, size/type limits, or
  storage-cost abuse controls. Anonymous binary upload + solo moderation is a serious hole.
- **Submitter accountability**: residents submit without accounts (FR49). With no account and only
  CAPTCHA, there is no way to ban a repeat abuser, no submission audit trail tied to identity. NFR4
  promises "auditable moderation actions" but the *submitter* side is anonymous.

### B5. Moderation SLA / queue overflow vs. solo operation — **HIGH** (see also F1)
Counter-metric §2 says "unreviewed-but-public content must stay zero" and "moderation latency"
must be watched, but there is **no requirement for queue prioritization, aging/SLA surfacing, or
bulk actions** beyond FR36's review/approve/reject/edit/merge. At city-wide seeded density plus
public submissions, a solo operator needs triage tooling (auto-approve trusted sources? confidence
scoring? batch approve from a vetted feed?). Not specifying this makes G4 (run solo) aspirational.

### B6. Aggregated content has no provenance/takedown story — **MEDIUM**
FR12/FR19/FR29 ingest news, events, and listings from external sources. No requirement to store
**source attribution + ingest timestamp + license/ToS basis** per record, nor a takedown workflow
when a primary source revokes or a business demands removal (PIPEDA right-to-erasure adjacent).
NFR6 says "respect source ToS" but provenance isn't a stored field requirement. Without it, A1
(merge/delete) and legal takedowns can't be executed cleanly.

---

## C. Multi-city / tenancy leaks

### C1. Shared taxonomies are declared "shared" but neighbourhoods are city-specific — CONTRADICTION — **HIGH**
FR4 + FR5: taxonomies are "shared facets" *and* "every content entity is scoped to a city."
**Neighbourhoods are inherently per-city** (Downtown Kingston ≠ Downtown Ottawa). The
content-model lists 8 hard Kingston neighbourhoods. If Neighbourhood is a single shared taxonomy
collection, adding Ottawa either (a) pollutes Kingston's facet list with Ottawa hoods, or
(b) requires a `city` scope on the taxonomy itself — which FR4 doesn't say. Event/business
categories *may* be global, but the PRD lumps all taxonomies together as "shared," which will force
a schema change at city #2. Architecture needs: which taxonomies are global vs. city-scoped. As
written it's ambiguous and FR7/NFR7's "no per-city forks" promise is at risk.

### C2. Cross-city cross-link bleed is unguarded — **CRITICAL**
The cross-link is a join (content-model). Nothing in FR37–39 requires that
`Article.relatedBiz`, `Event.bizId`, etc. be **constrained to the same city**. Once Ottawa is live
on the shared platform (FR52), a Kingston article could link an Ottawa business, or unified search
(FR3) could surface cross-city results, or a neighbourhood facet hub (FR39) could mix cities. There
is no stated invariant "all endpoints of a cross-link share `city_id`" and no requirement that every
query (search, facets, rails, sitemap) be city-filtered. Given the CLAUDE.md note that "RLS does NOT
use city_context for SELECT — filtering done in application queries," **every missing city filter is
a silent cross-tenant data leak**. This must be a first-class invariant in the PRD, not assumed.

### C3. Hostname → city resolution single point of failure — **MEDIUM**
FR5 ASSUMPTION "city = hostname-derived." No requirement for: behavior on unknown/misconfigured
host, localhost/preview/staging domains, www vs apex, or a default. Sitemaps/canonicals (NFR1) are
per-host; a hostname-resolution miss produces wrong canonicals → SEO duplicate-content penalty
across domains. Worth a requirement, not just an assumption.

### C4. Per-city SEO entities (Organization JSON-LD, sitemaps, robots) — **MEDIUM**
NFR1 says "site-wide Organization." With multi-city on one codebase, "site-wide" is ambiguous: one
Organization for the platform or one per city domain? Each `.fyi` is a distinct site to Google and
needs its own sitemap/robots/Organization. Not specified; will surface as an SEO bug at city #2.

---

## D. SEO / structured-data correctness

### D1. Thin/unclaimed seeded pages — no noindex/quality-gate requirement — **CRITICAL**
This is the biggest SEO landmine and the PRD half-sees it: §2 counter-metric and NFR5 name
"scaled content abuse / thin pages" as a risk, but **no functional requirement gates indexing on
content sufficiency.** FR29 seeds the directory to "city-wide density" from public NAP. A seeded,
unclaimed listing with name+address+phone+category and no description/photos/hours is exactly the
"thin, auto-generated, low-value" page Google's scaled-content-abuse and helpful-content systems
demonetize/deindex sites for — and it's emitting LocalBusiness JSON-LD (FR28). There is no
requirement to `noindex` thin listings, or a content-completeness threshold for indexing, or a
canonical/aggregation strategy. For an SEO-first, AdSense-funded site (G3, FR44), this can torch the
whole domain's rankings and AdSense eligibility. NFR5 states the *goal* but no FR *enforces* it.

### D2. Aggregation duplicate-content / canonical handling — **HIGH**
FR12 ingests from primary sources; FR19 aggregates events; the same event/press release often
appears verbatim across sources and across *competitor* sites. There is no requirement for canonical
strategy on aggregated content (point canonical at primary source? rewrite? noindex aggregated
duplicates?). "Competitors never republished" (FR12) addresses copyright, not the duplicate-content
SEO problem when two sources carry the same municipal press release. Canonical URLs are mentioned
generically (NFR1) but not the aggregation-specific dedup/canonical policy.

### D3. Event JSON-LD without venue address when `bizId` is null — **HIGH**
FR13 venue is nullable; FR18 emits `Event` JSON-LD targeting "events near me" rich results. Google's
Event structured-data **requires a `location`** (with address) for eligibility. An event with
`venue` as a free-text string (content-model shows `venue` text + nullable `bizId`) and no linked
business has no structured address → invalid/ineligible Event markup, or worse, a structured-data
error flagged in Search Console. No requirement covers the null-venue / online-event / TBA-location
case for valid Event JSON-LD.

### D4. Faceted-navigation crawl explosion — **HIGH**
FR16, FR21, FR23, FR26 create rich filter+sort combinatorics (date×category×neighbourhood×price×
open-now × 5 sort orders). Without a stated requirement for crawl control (canonical to the
unfaceted page, `noindex` on filtered permutations, or robots rules), Googlebot crawls millions of
near-duplicate facet URLs — classic crawl-budget waste + thin-content + duplicate-content triple
threat. NFR1 lists canonical/robots generically but doesn't require a faceted-URL indexing policy.
For an SEO-first directory this is a predictable, severe issue.

### D5. `aggregateRating` excluded from JSON-LD but shown in UI — provenance gap — **MEDIUM**
FR28/NFR1 correctly forbid self-serving `aggregateRating` (good). But FR20/FR27 *display* rating +
review count + histogram, and content-model says aggregate rating is shown. At MVP native reviews
are Phase 2 (FR50), so **where do MVP ratings come from?** FR50's note says "MVP displays ratings
only where sourced" — sourced from where, under what ToS, and is displaying a scraped third-party
rating (e.g., Google's) even permissible? Showing a star rating with no first-party reviews and no
disclosed source is both a trust and a potential ToS/legal issue. Underspecified.

### D6. Open Now / hours staleness in structured data — **MEDIUM**
FR20 derives Open Now from structured hours; LocalBusiness JSON-LD can carry `openingHours`. Seeded
hours go stale (NFR6). Emitting stale `openingHours` in structured data = surfacing wrong info in
rich results. No freshness/confidence requirement before emitting hours to structured data.

---

## E. Directory data lifecycle

### E1. Seeded vs. claimed source-of-truth conflict — UNRESOLVED — **CRITICAL**
FR29 seeds listings from public sources (auto-refreshing for accuracy, NFR6). FR31 lets owners claim
and edit. **What happens when the seeding pipeline re-runs over a claimed listing whose owner has
edited the hours/description?** Does the automated re-seed overwrite owner edits (destroying claimed
data and trust) or skip claimed records (then seeded fields go stale and conflict)? There is no
field-level ownership / source-of-truth model (e.g., "once claimed, owner-edited fields are locked
from re-seed; un-edited fields still refresh"). This is a guaranteed data-corruption bug the moment
seeding runs a second time after first claims. The PRD names NAP accuracy as the claim flow's job
(NFR6) but never reconciles it with the automated seed refresh.

### E2. Dedup / merge of duplicate *listings* (not just submissions) — **HIGH**
FR34 detects duplicate *submissions*; FR36 lets the operator merge duplicates. But seeding from
multiple public sources (FR29) will itself produce **duplicate seeded listings** (same business from
two feeds, name variants). There's no requirement for dedup *at ingest* across seed sources, nor a
canonical-record/golden-record model. Combined with A1 (merge cross-link rewrite undefined), the
merge story is a stub. Also: merge + claim + cross-links interact (merging a claimed listing into an
unclaimed one — which survives? whose subscription/billing?).

### E3. Staleness detection / lifecycle states (closed / moved / seasonal) — **HIGH**
NFR6 wants data "current," but there's no entity state for **permanently closed, temporarily closed,
moved, or seasonal**. Seeded directories rot fast (businesses close). No requirement for a
last-verified timestamp, a "report this listing as closed" path (note: residents have no account,
FR49, so even community correction is unprovisioned beyond the generic Submit flow), or a re-verify
cadence. A directory full of dead listings is both a trust killer and a thin-content/SEO problem
(D1). "Open Now" (FR20) on a closed-forever business is actively misleading.

### E4. Geocoding failure / null-coordinate handling — **MEDIUM**
FR24 (PostGIS radius/near-me/bounds) and FR22 (map pins) assume coordinates. Seeded NAP often
geocodes poorly or not at all (rural addresses, PO boxes, new buildings). No requirement for
behavior when a listing has no/low-confidence coordinates: excluded from distance sort? hidden from
map? shown with a default pin (wrong)? Distance sort (FR23) silently drops or mis-ranks null-coord
listings. Needs a stated rule.

---

## F. Solo-operability & MVP/Phase-2 placement

### F1. The full MVP cannot realistically be run solo as specified — **HIGH**
G4 and NFR4 demand zero unreviewed-public content with one operator, while MVP simultaneously
requires: (a) city-wide seeded directory density (FR29), (b) re-seeding for accuracy (NFR6),
(c) news aggregation + operator drafting + publishing (FR12), (d) event aggregation + curation
(FR19), (e) reviewing *every* submission/claim/edit (FR32/FR36), (f) a weekly newsletter (FR40),
(g) duplicate detection triage (FR34). The PRD provides **no automation-leverage requirements** for
the moderation/curation bottleneck (no trusted-source auto-publish lane, no confidence-scored
auto-approve, no bulk tooling beyond merge). The "run solo via automation" goal is asserted but the
moderation pipeline that consumes the most human time has the *least* automation specified. Either
add operator-leverage FRs or acknowledge MVP needs >1 person. This is the gap most likely to make
the launch unsustainable rather than broken.

### F2. Duplicate detection (FR34) is non-trivial and mis-scoped as casual MVP — **MEDIUM**
Reliable fuzzy dedup across name variants + geocoded proximity + category is a real subsystem
(blocking, scoring, thresholds). Listed as a flat FR with no acceptance criteria. Either scope it as
"flag obvious exact/near-exact matches" (cheap, MVP-OK) or recognize the general case is Phase-2.
As written it reads deceptively small.

### F3. CASL/PIPEDA compliance deferred but touches MVP-shipping features — **HIGH**
NFR9 defers CASL/privacy to "architecture/legal" as an ASSUMPTION. But MVP ships newsletter signup
(FR40), submitter/claimant emails (FR35), and business-owner accounts (FR49) — all CASL/PIPEDA
triggers at launch. CASL requires documented consent, identification, and unsubscribe *in the
sending mechanism*; PIPEDA requires a privacy policy, consent, and erasure handling for collected
emails. These are launch-day legal obligations, not architecture niceties. Treating compliance as a
deferred assumption risks shipping a non-compliant newsletter/account system. Should be an MVP
requirement, not an open question.

### F4. "Add to Calendar / ICS" and embedded maps are fine; **map provider ToS** unstated — **MEDIUM**
FR17/FR22/FR27 embed maps and pins. If seeded coordinates/data derive from one provider and maps
render via another, attribution/ToS constraints apply (and tie back to D5's "where do ratings come
from"). Minor, but the data-source ToS posture (NFR6 mentions it once) isn't carried into the
map/rating display requirements.

### F5. AdSense at MVP on a freshly-seeded thin-content site — sequencing risk — **MEDIUM**
FR44 ships AdSense at MVP. AdSense approval and continued eligibility require substantial original,
useful content; a brand-new site that is mostly auto-seeded thin listings (D1) risks rejection or
later policy strikes. Not a defect in the requirement itself, but the PRD should sequence AdSense
*after* content-quality gates exist, or note the dependency. Currently listed as a flat day-one hook.

---

## G. Smaller / cross-cutting

- **G-a (MEDIUM):** No requirement for **i18n/French** despite Ontario context and likely
  Ottawa/Montreal expansion (FR52). Bilingual obligations (and French content for Montreal) are a
  schema concern (per-field locale) cheaper to design now than retrofit. The multi-city model (FR5)
  is silent on language.
- **G-b (MEDIUM):** **Image rights** for seeded/submitted photos (FR29/FR30 photo upload) — no
  requirement that submitters affirm rights, or that seeded photos are license-clear. Republishing
  scraped business photos is a copyright exposure parallel to FR12's news caution, but unaddressed
  for the directory.
- **G-c (MEDIUM):** **Search result authority/ranking across pillars** (FR3 unified search) is
  undefined — how are news vs events vs businesses ranked/interleaved, and is moderation state /
  city scope enforced in the index? Ties to B2/C2.
- **G-d (LOW):** Event timezone handling — `start/end datetime` (content-model) with no stated
  timezone requirement; ICS export (FR17) and "Today/Weekend" buckets (FR15) and Event JSON-LD
  (FR18) all break subtly without explicit TZ (America/Toronto, DST). Easy to miss.
- **G-e (LOW):** Newsletter **featured business** in the digest (FR40) — is it a paid/featured
  listing (FR42), an editorial pick, or random? Selection authority + conflict with paid placement
  unstated (minor monetization/trust ambiguity).

---

## Verdict

The PRD is well-structured and unusually honest about its own risks in §2/NFR5/NFR6 — but it
**names** several hazards as counter-metrics/NFRs without writing the **functional requirements that
prevent them**. The cross-link is correctly identified as the wedge, yet its hardest engineering
realities (deletion/merge integrity, moderation-state filtering on derived reverse links, cross-city
constraint) are unspecified. The directory's seed-vs-claim source-of-truth conflict and the
thin-page/SEO indexing gate are the two issues most likely to cause data corruption and a
ranking/AdSense penalty respectively. The solo-operability claim is under-resourced on the
moderation bottleneck.

**Must-fix before architecture (critical):** A1 (cross-link integrity on delete/merge/unclaim),
B2 (claim dispute/revocation/transfer model), C2 (cross-city cross-link/query isolation invariant),
D1 (thin/unclaimed-page indexing gate), E1 (seed-vs-claim field-level source-of-truth).
