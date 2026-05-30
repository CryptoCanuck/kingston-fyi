# Kingston.FYI — Screen & Flow Inventory (extracted from prototype)

Eight screens, fully clickable and cross-linked. Source: `prototype/pages-*.jsx`,
`shell.jsx`, `app.jsx`. Routes (prototype names): `home, news, article, events, event,
directory, business, submit`.

## Global shell (all screens)

- **Sticky header:** wordmark logo (left) · nav **News / Events / Directory** · persistent
  **search bar with cross-pillar autocomplete** · **Submit** CTA (right). Collapses to
  hamburger + search drawer ≤860px. Active-nav underline in accent. Optional dark masthead.
- **Footer:** Sections / Explore / About link columns, social icons (share/mail/globe),
  newsletter signup, legal row. Slate-900 background.
- **NewsletterBand** ("The Limestone Letter") reused on home + as compact card elsewhere.

## 1. Home (hub)
- Featured **hero** news story + secondary stories grid.
- **"Happening This Weekend"** horizontal event-card strip.
- **"Latest News"** article grid (image, category tag, headline, timestamp).
- **"Discover Local Businesses"** featured directory row.
- Newsletter band.

## 2. News listing
- Category sub-nav: Local / Politics / Business / Sports / Arts & Culture / Opinion.
- Lead story + responsive article-card grid.
- Sidebar: **Trending** list + newsletter.

## 3. Article detail
- Headline, byline, date, read-time, hero, body copy.
- **"Related" rail** = linked **events** + mentioned **businesses** (the cross-link, made
  visible). Hover highlight via `.kf-cross`.

## 4. Events
- Prominent **LIST ⇄ CALENDAR (month grid)** view toggle.
- **Always-visible filter bar:** date presets, category (Music/Food/Family/Arts/Sports),
  neighbourhood, **Free/Paid**.
- LIST view grouped into time buckets: **Today / This Weekend / Next Week / This Month**.
- Event card: image, title, date & time, venue, price tag.

## 5. Event detail
- Full event info, embedded **map**, **"Add to Calendar"**, and a **link through to the
  venue's directory page** (event→business cross-link).

## 6. Business Directory — *the centerpiece UX*
- Top **search bar with autocomplete** (by name / type / neighbourhood).
- **Left filter panel, visible by default** (not hidden) — `DirFilters`:
  - **Open Now** toggle (Switch)
  - **Hierarchical Category** (collapsible parent → leaf checkboxes, built from data)
  - **Neighbourhood** select
  - **Minimum rating** radios (Any / 4.0+ / 4.5+ / 4.8+)
  - **Price** chips ($, $$, $$$, multi-select)
  - "Clear (n)" + active-filter chips above results
- **Sort control:** Relevance / Rating / Distance / Newest / A–Z.
- **Three-pane split:** filters | scrollable business-card list | **interactive map with
  pins** (hover-synced with list). Result count shown ("N places in Kingston").
- **Mobile:** single column + **list/map toggle** + slide-in filter drawer with
  "Show N results" apply button.
- Business card (list variant): photo, name, category, star rating, neighbourhood, price, blurb.

## 7. Business detail
- **Photo gallery** (2fr/1fr/1fr mosaic, "+8 photos").
- Header: name, Open/Closed + hours pill, stars, category · price · neighbourhood,
  Share + Visit website.
- Amenity **tags**.
- **About** section.
- **"Upcoming events at this venue"** rail (business→event cross-link).
- **Reviews:** average + **rating histogram** (5★→1★ %), individual reviews, "Read all".
- Sticky sidebar: **contact card + embedded map**, Directions / Call, structured **Hours**
  (today highlighted).

## 8. Submit flow (moderation-aware)
4-step wizard with a stepper (Type · Details · Location & Media · Review) + done state.
- **Step 1 — Type:** choose **Business** or **Event** (drives the form).
- **Step 2 — Details:** name/title, category (business parent cats or event cats),
  neighbourhood, (events: date/time/price), (business: hours), description. Required-field marks.
- **Step 3 — Location & media:** street address, website, contact email, **photo upload**
  (drag/drop, up to 8 images).
- **Step 4 — Review:** preview card + summary; **explicit notice that every submission is
  reviewed by the team before going live (≈ 2 business days).**
- **Done:** confirmation ("it's in review"), email-on-publish promise, submit-another.

> Maps directly to the kickoff's non-negotiable **moderation queue** (pending → approved →
> published, never auto-publish) plus CAPTCHA + duplicate detection + claim-listing (to add).

## Notable cross-pillar behaviors to preserve in the build
- Unified search autocomplete across News + Events + Businesses.
- Map/list hover synchronization in the directory.
- Bidirectional related-content rails (article↔event↔business).
- Shared neighbourhood + category facets across events and directory.
