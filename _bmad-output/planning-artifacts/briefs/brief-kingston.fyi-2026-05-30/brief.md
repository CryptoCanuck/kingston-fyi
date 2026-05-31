---
title: Kingston.FYI — Product Brief
status: final
created: 2026-05-30
updated: 2026-05-31
---

# Kingston.FYI — Product Brief

**One line:** A free, civic-minded community hub for Kingston, Ontario that unites local
**news, events, and a claimable business directory** into one cross-linked graph — something
no existing Kingston site offers.

## Overview

Kingston's local information lives in scattered, partial silos: a paywalled independent paper,
a thinned-out legacy daily, a tourism-facing events page, and business directories that are
either members-only or just a thinner Google. Nobody ties the three together. Kingston.FYI is
a single hub where an **event** belongs to a **venue** (a directory business), an **article**
references the businesses and events it mentions, and **neighbourhoods and categories** are
shared facets across all three — a unified graph, not three separate apps. It launches free and
open (no paywall), is built to be run by one person through automation, and is engineered
from day one for SEO discovery and clean, accessible, fast pages.

## Problem / Opportunity

- **Fragmentation.** Residents juggle multiple sites to answer "what's happening, what's open
  near me, and what's the local news" — and none connect those answers.
- **The paywall gap.** The dominant independent outlet (Kingstonist) sits behind a paywall;
  community sentiment shows real frustration at being walled off from local news. **Free, open
  access is therefore a deliberate wedge**, not just a default.
- **No claimable, city-wide directory.** The one well-integrated model in town (Downtown
  Kingston BIA — directory + events + content, cross-linked) is excellent but scoped to
  downtown members. There is **no city-wide, structured, claimable** directory woven into news
  and events. *(Village Media's "Today" network appears to have no Kingston site — to verify.)*

## Target Users

Two-sided, seeded in sequence:

- **Residents (primary / demand side).** The audience that must be won. They come for events, "near
  me" utility, and free local news; their traffic is what makes listings worth paying for. The
  **front door** is events + "what's open near me" + free news (cleanest SEO + immediate use).
- **Local businesses (revenue / supply side).** Found via scrape-seeded listings they can
  **claim, correct, and enhance**. Converting claims (then paid tiers) is the revenue engine —
  but only once there's an audience to be seen by.
- **Visitors (secondary).** Served by events and the directory; secondary, not a launch focus.
- **Event organizers (contributors).** Submit events (moderated); feed the events pillar.

## The Product: Three Cross-Linked Pillars

1. **Local News** — free, no paywall. Editorial articles by category (Local, Politics, Business,
   Sports, Arts & Culture, Opinion), each emitting `NewsArticle` structured data.
2. **Events** — aggregated and submitted listings with **list + calendar** views, always-on filters
   (date, category, neighbourhood, free/paid) and time buckets (Today / This Weekend / Next Week
   / This Month); each emits `Event` structured data (targets Google "events near me" carousels).
3. **Business Directory** — scrape-seeded to city-wide density, **search + filters + map**
   (PostGIS "near me"/map-bounds), hierarchical categories, neighbourhoods, a **claim-this-listing**
   flow, and the most-specific `LocalBusiness` structured data (no self-serving `aggregateRating`).

**The cross-link is the product.** Article → mentioned events + businesses; Event → its venue
(directory business) + related articles; Business → its upcoming events. Shared neighbourhood
and category taxonomies tie all three together as facets, and unified search spans all three.

## Differentiation & Positioning

| Lever | Kingston.FYI | Incumbents |
|---|---|---|
| **Integration** | News ↔ events ↔ claimable directory as one graph | Siloed, or editorial cross-reference only |
| **Access** | Free, no paywall | Kingstonist paywalled |
| **Access** | Free, no paywall | Kingstonist paywalled |
| **Directory** | City-wide, structured, claimable | Members-only (BIA, Chamber) or a thinner Google |
| **Trust/brand** | Civic, credible, community-first | Mixed; legacy daily hollowed out |
| **Discovery** | SEO + structured data + cross-link authority | Inconsistent |

## Go-to-Market: The Cold-Start Flywheel

Scrape-seed the directory to real density (useful from day one, though nobody pays yet) → **events,
"near me," and free news are the resident front door** (best SEO + immediate utility + daily
habit via the newsletter) → **social distributes** → audience makes listings valuable → **convert
businesses to claims, then paid tiers**. Automation generates the content so one person can sustain
broad coverage. **Steering metric: claimed listings** (downstream of traffic, upstream of revenue).

## Content Strategy & Sourcing

- **Light on manual effort, broad in automated coverage** — every accurate listing, real event,
  and primary-source brief is SEO surface area — and surface area is the traffic strategy.
- **Defensible sourcing.** Published content comes from **primary sources**: institutional press
  releases (City of Kingston, Queen's, St. Lawrence College, KFL&A Public Health, Police, the
  Frontenacs), public data/feeds, and legitimate **link-out aggregation** ("Kingston in 5"
  newsletter). AI assists the founder's *own* drafts from primary sources.
- **Hard line (rejected approach):** no scraping/rewriting competitors' (paywalled) articles —
  copyright/fair-dealing exposure, fatal to brand trust in a small market, and demoted by Google
  as scaled-content abuse. Competitors are a **signal bucket** (what to cover) only.
- **Quality guardrail:** broad coverage must be *genuinely useful* pages — never thin auto-filler
  (protects rankings *and* AdSense eligibility).

## Monetization (phased, passive-first)

- **Launch (self-serve / passive — runnable solo):** **featured/promoted listings**, **business
  claim subscriptions** (enhanced profiles), **newsletter sponsorship**, and **Google AdSense**
  (programmatic display; revenue scales with traffic, no sales labour).
  - *AdSense caveats:* hyperlocal CPMs are low → a baseline layer, **not** primary revenue
    (directory leads); placement must be **CWV- and brand-disciplined** (few units, lazy-loaded,
    reserved slots, no interstitials) to honour the locked performance + civic-trust guardrails.
- **Phase 2 (needs traffic + a sales hand):** direct local display-ad *sales* and bespoke
  sponsored content.
- The **data model supports all revenue features from day one**; only what is *operated* is phased.

## MVP Scope vs. Later Phases

**MVP (all three pillars, cross-linked — the wedge requires all three):**
- Directory: scrape-seeded density, search/filters/map, hierarchical categories + neighbourhoods,
  detail pages, **claim flow**.
- Events: aggregated + submission, list + calendar, filters, detail pages.
- News: free, primary-source + aggregation (low original volume at launch), category nav.
- Cross-linking across all three; unified search; **"Kingston in 5" newsletter**.
- **Moderation queue** (pending → approved → published, never auto-publish) + CAPTCHA + duplicate
  detection for submissions/claims.
- SEO baseline: sitemap, robots, per-page metadata, all JSON-LD; site-wide Organization +
  BreadcrumbList.
- **Multi-city-ready data model**, with Kingston the only city live.
- Launch monetization hooks: featured flag, claim subscription scaffolding, newsletter sponsor
  slot, disciplined AdSense units.

**Later phases:** richer claim subscription tiers + billing, direct ad sales + sponsored content,
typo-tolerant/faceted search (Meilisearch/Typesense), business analytics dashboards, reviews,
additional city domains (team grows with revenue).

## Success Metrics

Pageviews are a vanity metric; the win is the flywheel turning toward habit and revenue.

- **Leading / habit:** organic sessions, **indexed pages** (SEO surface area), newsletter
  subscribers + open rate, returning-visitor share, events engagement.
- **Flywheel / revenue:** directory density (listings live), **claimed listings (the week-to-week
  steering metric)**, first paying businesses, **AdSense RPM/revenue**.

## Risks & Mitigations

1. **SEO single-point-of-failure (top structural risk).** The engine leans on Google organic, and
   AI Overviews / zero-click search are eroding publisher click-through. → **Newsletter = owned
   audience** (can't be deranked) + social + direct; diversify beyond pure organic over time.
2. **Cold-start doesn't ignite.** Residents may not form the habit. → Scrape-seeded utility from
   day one; claimed listings as the early-warning signal.
3. **Quality-at-scale.** Broad automation tipping into thin filler. → Quality guardrail; useful
   pages only; primary-source discipline.
4. **Incumbent response.** Kingstonist could drop its paywall or add a directory. → Move first;
   own the *claimable* directory + cross-link they lack.
5. **Key-person / solo.** Illness or burnout stalls the site. → Automation-first lowers the load;
   honest acceptance for a passion project.
6. **Runway (softened).** Hyperlocal takes years to pay off — but this is a **passion project with
   near-zero burn and optional funding if/as traction warrants**, so it is not existential.

## Geographic Scope

Kingston-only at launch, but **multi-city-ready by design** — city/tenancy and taxonomies are
modelled from the start so expansion to additional `.fyi` city domains is a rollout, not a rewrite.

## Operating Model & Stakes

Solo founder, **passion project** (not a funded startup), automation-first so one person can run a
broad, multi-pillar site. This calibrates the *pressure* (low, no do-or-die clock) — **not** the
*build quality*, which holds to the locked production guardrails below.

## Technical Assumptions (locked — rationale belongs in architecture)

- **Next.js 16** (App Router; Server Components default, Client Components only for filters/map/
  search; PPR + tag-based revalidation for the publishing workflow).
- **Single PostgreSQL + PostGIS** — cross-linking = relational joins; geospatial for radius / "near
  me" / map-bounds.
- **Payload CMS 3.x**, Next.js-native in `/app` — admin, role-based access, auto-generated API.
- **ORM:** Drizzle vs Prisma — decided in architecture, not here (Payload leans Drizzle).
- **Search:** launch on Postgres full-text + `pg_trgm`; clean upgrade path to Meilisearch/Typesense.
- **Hosting:** persistent/container host or pooling-optimized serverless Postgres (e.g. Neon) —
  Payload's admin is connection-pool heavy.
- **Non-negotiable guardrails:** SEO/structured data as core (JSON-LD only; no self-serving
  `aggregateRating`); mandatory moderation queue + CAPTCHA + dedup + claim flow; Core Web Vitals
  budgets; WCAG 2.2 AA; clean module boundaries (Server Actions for mutations, Route Handlers for
  public API/webhooks).

## Open Questions / Unknowns

- Specific 6- and 12-month directional targets for the metrics above.
- Verify **KingstonToday** truly doesn't exist (direct domain check) before positioning leans on it.
- Confirm whether Kingstonist's directory is claimable/monetized (appears editorial).
- Newsletter cadence (daily "Kingston in 5" vs weekly) — operational load vs habit-formation.

## Related Artifacts

- **Landscape research:** `../research-landscape.md` (full competitive + model + SEO findings).
- **Design reference:** `../../design-reference/` — `design-system.md`, `content-model.md`
  (the extracted cross-link data model), `screen-inventory.md`, and the original `prototype/`.
- **Decision trail:** `.decision-log.md` (this folder).
