# PRD ↔ Content-Model Reconciliation

**Inputs**
- PRD: `prd-kingston.fyi-2026-05-31/prd.md`
- Content model: `design-reference/content-model.md`

**Question:** Do the PRD's functional requirements cover every entity, field, relationship, and taxonomy in the content model — especially the cross-link graph and the load-bearing fields (hierarchical category, structured hours → Open Now, geocoordinates, price tier, amenity tags; event bucket/datetime/venue; article related refs) and the modeling implications (derived fields, moderation status, aggregateRating exclusion)?

**Verdict:** The PRD covers the content model **very well**. All three first-class entities, both cross-link directions, the shared taxonomies, and every modeling implication called out in the content model are represented. Gaps are minor/at-the-edges: a few model-described fields are not explicitly required in the FRs, one referenced entity (Author) is mentioned in the model but absent from the PRD, and the Review entity is only partially specified (its fields and the histogram are described in the model but the capture entity is Phase 2 and its fields/structure are not enumerated as FRs).

---

## 1. Entity coverage

| Content-model entity | PRD coverage | Notes |
|---|---|---|
| **Article (News)** | FR7 (entity), FR8/FR9 (listing/detail), FR10 (free), FR11 (JSON-LD) | Covered. |
| **Event** | FR13 (entity), FR14–FR19 | Covered. |
| **Business (Directory listing)** | FR20 (entity), FR21–FR29 | Covered. |
| **Review** | FR27 (display + histogram), FR50 (capture, Phase 2) | **Partial** — see §4. Fields not enumerated. |
| **Neighbourhood (taxonomy)** | FR4, FR5, FR39 | Covered (shared facet). |
| **NewsCategory (taxonomy)** | FR4, FR8 (all 6 named) | Covered. |
| **EventCategory (taxonomy)** | FR4, FR13 (5 named) | Covered. |
| **BusinessCategory (hierarchical)** | FR4 (two-level), FR20, FR21 | Covered. |
| **Author** (model: "`author` text → Author later") | **Not present as an entity** | See gap G3 — PRD only carries `author/byline` as an Article field (FR7), never the future Author entity the model flags. |

---

## 2. Field-by-field coverage

### Article
| Model field | PRD | Status |
|---|---|---|
| `cat` (NewsCategory) | FR7 "category" | ✓ |
| `title`, `dek` | FR7 "title, dek" | ✓ |
| `author` | FR7 "author/byline" | ✓ |
| `date` | FR7 "publish date" | ✓ |
| `read` (read-time) | FR7 "read-time" | ✓ |
| `ph` → hero image | FR7 "hero image" | ✓ |
| `relatedEvents[]` → Event | FR7, FR9, FR37 | ✓ |
| `relatedBiz[]` → Business | FR7, FR9, FR37 | ✓ |
| (body) | FR7 "body" | ✓ (PRD adds body; model implies it) |

**Article: fully covered.**

### Event
| Model field | PRD | Status |
|---|---|---|
| `cat` (EventCategory) | FR13 "category (Music/Food/Family/Arts/Sports)" | ✓ |
| `title`, `blurb` | FR13 | ✓ |
| `date`, `time` (display) | FR13 "display date/time" | ✓ |
| start/end **datetime** (model: "real model needs start/end datetimes") | FR13 "start/end datetime" | ✓ — PRD explicitly requires the real datetime, not just display strings. |
| `bucket` (derived) | FR15 "derived time buckets … from start datetime relative to now" | ✓ — derivation explicitly required. |
| `day` (calendar-grid day) | FR14 "Calendar (month grid)" | ✓ (implicit; grid placement, not a stored field) |
| `venue` (string) | FR13 "venue link" | ✓ (superseded by bizId link) |
| `hood` (Neighbourhood) | FR13 "neighbourhood", FR16 filter | ✓ |
| `price`, `free` | FR13 "price + free/paid flag", FR16 Free/Paid filter | ✓ |
| `ph` → image | FR13 "image" | ✓ |
| `bizId` → Business (nullable) | FR13 "venue link to a directory business (nullable)", FR17 | ✓ — nullability explicitly required. |
| `relatedNews[]` → Article | FR13 "related-news cross-links", FR17 | ✓ |

**Event: fully covered.** (Embedded map at FR17 and Add-to-Calendar/ICS are PRD additions beyond the model.)

### Business
| Model field | PRD | Status |
|---|---|---|
| `name`, `blurb` | FR20 | ✓ |
| `cat` (leaf) | FR20 "leaf … category", FR21 | ✓ |
| `parentCat` (parent) | FR20 "parent category", FR4 hierarchy, FR21 | ✓ |
| `rating`, `reviews` (count) | FR20 "rating + review count (display)", FR27 | ✓ |
| `price` (`$/$$/$$$`) | FR20 "price tier", FR21 price filter, FR16-analog | ✓ |
| `hood` | FR20 "neighbourhood", FR21 filter | ✓ |
| `openNow` (derived) | FR20 "derived Open Now", FR21 Open-Now toggle, FR27 open/closed | ✓ — derivation explicitly required. |
| `hours` (structured) | FR20 "structured hours", FR27 structured hours | ✓ — PRD requires *structured* hours (model flags the prototype's plain text needs this). |
| `address`, `phone`, `web` | FR20 "address, phone, website" | ✓ |
| `tags[]` (amenities) | FR20 "amenity tags", FR27 | ✓ |
| `x`, `y` → PostGIS lat/lng | FR20 "geocoordinates", FR24 PostGIS geospatial | ✓ — PostGIS upgrade explicitly required. |
| `ph` → photo gallery | FR20 "photos", FR27 "photo gallery" | ✓ |
| `events[]` → Event | FR20 cross-link, FR27 "Upcoming events at this venue", FR37 | ✓ |

**Business: fully covered.**

### Review
| Model field | PRD | Status |
|---|---|---|
| `name` (author) | — | **Not enumerated** |
| `rating` (1–5) | FR50 "ratings counted from approved reviews only" | partial |
| `date` | — | **Not enumerated** |
| `text` | — | **Not enumerated** |
| rating histogram | FR27 "reviews section (display + histogram)" | ✓ |
| Belongs to a Business | implied | ✓ |

**Review: partial — see gap G1.** Display + histogram are required (FR27); capture is Phase 2 (FR50). But the review's own fields (author name, date, free-text body, 1–5 rating scale) are never enumerated as a requirement, and the MVP display of sourced ratings (FR50 note: "MVP displays ratings only where sourced") doesn't specify what review records back the histogram at MVP.

---

## 3. Cross-link graph coverage (the defining feature)

| Model relationship | PRD | Status |
|---|---|---|
| Article → Event (`relatedEvents[]`) | FR7, FR9, FR37, FR38 | ✓ |
| Article → Business (`relatedBiz[]`) | FR7, FR9, FR37, FR38 | ✓ |
| Event → Business venue (`bizId`, nullable) | FR13, FR17, FR37, FR38 | ✓ |
| Event → Article (`relatedNews[]`) | FR13, FR17, FR37 | ✓ |
| Business → Events (`events[]`) | FR20, FR27, FR37, FR38 | ✓ |
| **Bidirectional / reverse links derived, not hand-kept** | FR37 "Reverse links are derived, not hand-kept" | ✓ — PRD explicitly fixes the prototype's hand-maintained consistency. |
| Shared neighbourhood/category facets across pillars | FR4, FR39 | ✓ (full cross-pillar facet hubs are Phase 2; neighbourhood landing MVP-light) |

**Cross-link graph: fully covered, including the derived-reverse-link modeling implication.** This is the strongest part of the reconciliation — every edge in the model's graph diagram has an explicit FR, both directions, and FR37 directly addresses the "maintained by hand … real build should enforce/derive" implication.

---

## 4. Modeling implications (content-model §"Modeling implications")

| Implication | PRD | Status |
|---|---|---|
| 3 first-class collections + Review + shared taxonomy collections, relational joins | §6, §7 (single Postgres, joins), FR4, FR48 | ✓ |
| Geospatial: x/y → PostGIS for radius/near-me/map-bounds; Distance sort | FR24, FR23 | ✓ |
| Derived `openNow` from structured hours | FR20 | ✓ |
| Derived event `bucket` from start datetime | FR15 | ✓ |
| Derived `rating`/`reviews` from **approved reviews only** | FR50 (Phase 2) | ✓ as a requirement, but **Phase-2 gated** — see G2. |
| Aggregate-rating governance: show UI rating, **do NOT emit `aggregateRating` JSON-LD** | FR28, NFR1 | ✓ — explicit. |
| Moderation `status: pending → approved → published` on user-submitted Business/Event | FR32, NFR4 | ✓ |
| Structured-data targets (NewsArticle / Event / most-specific LocalBusiness / Org + BreadcrumbList) | FR11, FR18, FR28, FR6, NFR1 | ✓ — all four. |

**Modeling implications: fully covered.**

---

## 5. Gaps & recommendations

Ordered by value. None are blocking; all are "tighten the FRs to fully bind the model."

### G1 — Review entity fields not enumerated (and MVP rating provenance is fuzzy)
The model defines Review as `name, rating (1–5), date, text` belonging to a Business, plus the histogram. The PRD requires the **display** (FR27) and **Phase-2 capture** (FR50) but never enumerates the review record's fields or the 1–5 scale, and FR50's note "MVP displays ratings only where sourced" leaves unspecified **what data backs the histogram at MVP** (seeded/sourced reviews? aggregate only?). 
*Recommend:* add the Review fields to an FR (even if capture is Phase 2, the display path and the seeded/sourced review records that feed FR27's histogram at MVP should be modeled), and clarify the MVP rating/review data source.

### G2 — "Approved-reviews-only" rating derivation is Phase-2-gated but ratings display at MVP
The model says `rating`/`reviews` are derived **from approved reviews only**. The PRD honors this only inside FR50 (Phase 2). At MVP, FR20/FR27 display `rating + review count` from seeded sources. 
*Recommend:* state explicitly that the MVP-displayed rating comes from sourced aggregates (not user reviews), so the "approved-only" rule isn't silently unenforced at MVP and the counter-metric (listing inaccuracy) is honored.

### G3 — Author is not modeled as a (future) entity
The model flags `author` as "text (→ Author later)" — an explicit signal that Author becomes its own entity. The PRD treats author purely as an Article string field (FR7) with no forward-looking note. 
*Recommend:* a one-line assumption that author is a string at MVP with a path to an Author entity (parallels how the model handled `venue` string → `bizId`).

### G4 — Calendar `day` / month-grid placement not tied to datetime derivation
The model's `day` (int, calendar-grid day number) is a prototype artifact; the real build derives grid placement from the start datetime. FR14 requires the month-grid view but doesn't state that grid placement derives from `start datetime` (it's implied by FR15's bucket derivation but not stated for the calendar). Minor — likely fine as-is. 
*Recommend (optional):* note grid placement derives from start datetime, retiring the prototype's stored `day`.

### G5 — Event embedded map needs event geolocation, not modeled
FR17 requires an **embedded map** on event detail, and FR16/FR13 use `neighbourhood`. But the event entity in both the model and FR13 has **no geocoordinates of its own** — an event's location comes from its venue (`bizId`). For venue-less events (bizId nullable) there is no lat/lng to render a map or support any "near me" treatment. 
*Recommend:* clarify that event location/map derives from the linked venue, and specify behavior for venue-less events (no map, or a free-text/geocoded address field). This is a real modeling hole inherited from the prototype.

---

## 6. PRD additions beyond the model (informational — not gaps)
The PRD requires several things the content model does not enumerate (correctly extending it): Article `body` (FR7); event Add-to-Calendar/ICS + embedded map (FR17); business sticky contact card + embedded map (FR27); featured/promoted flag (FR42); claim subscription tiers data model (FR43); newsletter entity + sponsor slot (FR40/FR41/FR47); city-scoping field on every entity (FR5); moderation/audit metadata (FR32/NFR4); duplicate-detection signals (FR34). These imply additional fields (e.g., `city`, `featured`, `moderationStatus`, `claimedBy`/owner relation, submitter/claimant email) that the content model — being prototype-derived — does not list. They are PRD-correct; the content model should eventually be extended to match, but they are not PRD coverage gaps.
