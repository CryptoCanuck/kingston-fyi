# Screen ⇄ PRD Reconciliation — Kingston.FYI

**Inputs**
- PRD: `prd-kingston.fyi-2026-05-31/prd.md` (FR1–FR52, NFR1–NFR9)
- Screen inventory: `design-reference/screen-inventory.md` (8 screens + global shell + cross-pillar behaviors)

**Method:** Each screen's features/interactions mapped to a covering FR. Verdicts: **Covered**, **Under-specified** (FR exists but omits a screen detail), **Gap** (no FR covers the feature).

---

## Global shell

| Screen feature | FR | Verdict |
|---|---|---|
| Sticky header: wordmark, nav News/Events/Directory, persistent search, Submit CTA | FR1 | Covered |
| Collapse to hamburger + search drawer ≤860px | FR1 | Covered |
| Footer: Sections/Explore/About columns, social icons, newsletter, legal row | FR2 | Covered (legal/About link columns implied, not explicit) |
| Cross-pillar autocomplete in header search | FR3 | Covered |
| Active-nav underline in accent / optional dark masthead | — | Cosmetic (design-system, not FR-bearing) |
| NewsletterBand reused on home + compact card elsewhere | FR40 | Covered |

**Notes**
- **G1 (minor):** Footer "About / legal row" (terms, privacy, about pages) is not named in any FR. NFR9 (CASL/privacy) implies a privacy page must exist, but no FR mandates static/legal/About pages. Worth an explicit FR or note that legal pages are in scope.

---

## 1. Home (hub)

| Screen feature | FR | Verdict |
|---|---|---|
| Featured hero news story + secondary stories grid | — | **Gap (under-specified)** |
| "Happening This Weekend" event strip | FR15 (buckets) | Partial — bucket logic exists; Home placement not stated |
| "Latest News" article grid | FR7/FR8 | Partial — Home composition not stated |
| "Discover Local Businesses" featured directory row | FR42 (featured/promoted) | Partial — featured flag exists; Home row not stated |
| Newsletter band | FR40 | Covered |

**Notes**
- **G2 (notable): There is no FR for the Home/hub page itself.** The Home screen is the product's primary entry and composes hero news + weekend events + latest news + featured businesses + newsletter into one curated hub. No FR defines this page, what it aggregates, or how the hero/featured content is selected (editorial pick vs. automatic). UJ-1 ("Lands on Home, sees 'Happening This Weekend'…") depends on it, but no requirement backs the journey. **Recommend a dedicated FR for the Home hub** specifying its composed sections and the selection logic for hero story + featured businesses + weekend events.

---

## 2. News listing

| Screen feature | FR | Verdict |
|---|---|---|
| Category sub-nav (Local/Politics/Business/Sports/Arts & Culture/Opinion) | FR8 | Covered |
| Lead story + responsive article-card grid | FR8 | Covered |
| Sidebar: Trending list + newsletter | FR8 | Covered (Trending named) |

**Notes**
- **Under-specified:** FR8 names "Trending list" but no FR defines how trending is computed (views? recency? manual?). Minor; flag for architecture.

---

## 3. Article detail

| Screen feature | FR | Verdict |
|---|---|---|
| Headline, byline, date, read-time, hero, body | FR7 | Covered |
| "Related" rail: linked events + mentioned businesses | FR9, FR37, FR38 | Covered |
| Hover highlight via `.kf-cross` | — | Cosmetic |

**Verdict: fully covered.**

---

## 4. Events (list/calendar)

| Screen feature | FR | Verdict |
|---|---|---|
| LIST ⇄ CALENDAR (month grid) toggle | FR14 | Covered |
| Always-visible filter bar: date presets, category, neighbourhood, Free/Paid | FR16 | Covered |
| LIST grouped into Today/This Weekend/Next Week/This Month buckets | FR15 | Covered |
| Event card: image, title, date & time, venue, price tag | FR13 | Covered |

**Notes**
- **G3 (under-specified): Calendar (month-grid) view interaction is not specified.** FR14 names the toggle but no FR describes calendar behavior — clicking a day, density indicators, navigating months, or how filters (FR16) apply within the calendar view. The calendar is a named MVP view yet has zero behavioral requirements. NFR3 explicitly calls out the events calendar for a11y, but there's no functional FR defining what it does. **Recommend extending FR14** with month navigation, day-click behavior, and filter interaction in calendar mode.

---

## 5. Event detail

| Screen feature | FR | Verdict |
|---|---|---|
| Full event info | FR13 | Covered |
| Embedded map | FR17 | Covered |
| Add to Calendar (ICS) | FR17 | Covered |
| Link through to venue's directory page | FR17, FR37, FR38 | Covered |

**Notes**
- **Under-specified:** Event detail screen does not explicitly list a related-news rail, but FR17/FR37/FR38 require the Event↔Article reverse link to be navigable and a cross-link rail on Event detail. The screen inventory only mentions the venue link; PRD is actually *more* complete here. No gap; note the prototype omits the related-news rail the PRD promises (FR13 "related-news cross-links" + FR38).

---

## 6. Business Directory (centerpiece)

| Screen feature | FR | Verdict |
|---|---|---|
| Top search bar w/ autocomplete (name/type/neighbourhood) | FR3 | Covered |
| Left filter panel visible by default | FR21 | Covered |
| Open Now toggle | FR20 (derived), FR21 | Covered |
| Hierarchical category (collapsible parent→leaf checkboxes) | FR4, FR21 | Covered |
| Neighbourhood select | FR21 | Covered |
| Minimum rating radios (Any/4.0+/4.5+/4.8+) | FR21 | Covered |
| Price chips multi-select | FR21 | Covered |
| Clear(n) + active-filter chips | FR26 | Covered |
| Sort: Relevance/Rating/Distance/Newest/A–Z | FR23 | Covered |
| Three-pane split + map with pins | FR21, FR22 | Covered |
| Map/list hover sync | FR22 | Covered |
| Result count ("N places in Kingston") | FR21 | Covered |
| Mobile: single column + list/map toggle + filter drawer + "Show N" | FR25 | Covered |
| Business card (list variant) fields | FR20 | Covered |

**Notes**
- **G4 (under-specified): "Minimum rating" filter + star ratings on directory cards depend on rating data that MVP largely won't have.** FR50 defers native reviews to Phase 2, and FR27 notes "MVP displays ratings only where sourced." The directory filter (FR21 min-rating radios) and card star ratings (FR20) are MVP screen features, but most seeded listings (FR29) will have no rating. PRD does not specify min-rating filter behavior when rating data is sparse/absent (hide filter? treat null as excluded?). **Recommend FR21 clarify min-rating filter behavior for unrated listings.**
- **Under-specified:** Directory autocomplete is "by name/type/neighbourhood" (screen) — FR3 covers cross-pillar autocomplete generally but doesn't call out the directory-scoped facet autocomplete. Minor.

---

## 7. Business detail

| Screen feature | FR | Verdict |
|---|---|---|
| Photo gallery (mosaic, "+8 photos") | FR20, FR27 | Covered |
| Header: name, Open/Closed + hours pill, stars, category·price·neighbourhood | FR27 | Covered |
| Share + Visit website | FR27 (contact card) | Partial — Visit-website covered; **Share action not in any FR** |
| Amenity tags | FR20, FR27 | Covered |
| About section | FR27 | Covered |
| "Upcoming events at this venue" rail | FR27, FR37, FR38 | Covered |
| Reviews: average + rating histogram + individual reviews + "Read all" | FR27, FR50 | **Conflict** — see note |
| Sticky sidebar: contact card + map, Directions/Call, structured Hours (today highlighted) | FR27 | Covered |

**Notes**
- **G5 (conflict): Reviews section with individual reviews + "Read all" appears on the MVP screen, but native reviews are FR50 = Phase 2.** FR27 says the detail page has a "reviews section (display + histogram)" as MVP, while FR50 defers review *capture* to Phase 2 and says "MVP displays ratings only where sourced." The screen shows *individual review text* and a histogram, implying sourced review content at MVP. The PRD does not clarify: at MVP, where do displayed individual reviews + histogram come from if capture is Phase 2? Either the screen over-promises for MVP or FR27 needs to scope the reviews section to "sourced reviews only, no capture." **Recommend reconciling FR27 vs FR50 explicitly.**
- **G6 (minor gap): "Share" action** (header + on cards) is on multiple screens (business detail, footer social icons include share) but no FR mentions share/social-share functionality. Likely trivial (native share sheet), but currently unspecified.

---

## 8. Submit flow

| Screen feature | FR | Verdict |
|---|---|---|
| 4-step wizard w/ stepper (Type · Details · Location & Media · Review) | FR30 | Covered |
| Step 1 — Type: Business or Event | FR30 | Covered |
| Step 2 — Details (cat/neighbourhood/event date·time·price/business hours/description) | FR30 | Covered |
| Step 3 — Location & media: address, website, contact email, photo upload (drag/drop, ≤8) | FR30 | Covered (8-image cap not stated in FR) |
| Step 4 — Review: preview + "reviewed before publishing (~2 business days)" notice | FR30, FR32 | Covered |
| Done state: confirmation, email-on-publish, submit-another | FR30, FR35 | Covered |
| CAPTCHA | FR33 | Covered (screen doesn't show it; PRD requires it) |
| Duplicate detection | FR34 | Covered (operator-side) |

**Notes**
- **Under-specified:** Photo upload limit ("up to 8 images", drag/drop) is a concrete screen constraint absent from FR30. Minor.
- **Note:** Claim-this-listing flow (FR31) is referenced in the screen inventory footnote ("claim-listing (to add)") but **has no screen/prototype**. PRD covers it (FR31), so it's a PRD-ahead-of-design item, not a PRD gap. Flag for design to add the claim flow screens.

---

## Cross-pillar behaviors (inventory §"Notable")

| Behavior | FR | Verdict |
|---|---|---|
| Unified search autocomplete across News+Events+Businesses | FR3 | Covered |
| Map/list hover sync in directory | FR22 | Covered |
| Bidirectional related-content rails | FR37, FR38 | Covered |
| Shared neighbourhood + category facets across events & directory | FR4, FR39 | Covered (FR39 notes facet hubs are Phase 2-light) |

**Verdict: fully covered.**

---

## Summary of gaps (highest value first)

1. **No FR for the Home/hub page** — the primary landing screen (hero news + weekend events + latest news + featured businesses) has no requirement; selection/curation logic for hero + featured content is undefined. (G2)
2. **Calendar (month-grid) view behavior unspecified** — FR14 names the toggle but no FR defines month navigation, day-click, or filter interaction in calendar mode; only a11y is mentioned (NFR3). (G3)
3. **Reviews section conflicts with Phase 2** — FR27 shows individual reviews + histogram at MVP while FR50 defers review capture to Phase 2; source of MVP review content unresolved. (G5)
4. **Min-rating filter / card stars vs. unrated seeded listings** — directory rating filter and card stars are MVP screen features but most seeded listings lack ratings; behavior for null ratings undefined. (G4)
5. **Minor unspecified items:** Share action (G6); legal/About static pages (G1); photo-upload 8-image cap; trending computation; directory-scoped autocomplete facets.

**PRD-ahead-of-design (not a PRD gap):** Claim-this-listing flow (FR31) has no prototype screen — design owes the screens.
