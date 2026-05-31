# Kingston.FYI — Design Coverage & Gap Analysis

_Created 2026-05-31. Reconciles the 8-screen design prototype (`screen-inventory.md`,
`design-system.md`) against the finalized 62-FR PRD + epics. The prototype predates the PRD's
expansion (adversarial-review additions FR53–62, the full monetization set, and the claim /
moderation / governance requirements), so a number of FRs now exceed the designed scope._

## The 8 designed screens (prototype)

Home · News listing · Article detail · Events (list ⇄ calendar) · Event detail · Directory ·
Business detail · Submit wizard — plus the global shell (Header/Footer/NewsletterBand) and the
full design-system token + component library.

## Coverage verdict

The **resident-facing core is well-covered**. The gaps are concentrated in three places the
prototype never addressed: **business-owner-facing UI**, **operator/admin UI**, and
**non-screen surfaces** (email, ads). Below, every gap is classified by how it should be closed —
critically, several "gaps" are *not* gaps because the architecture deliberately routes them to
Payload's generated admin.

---

## A. Genuine public / owner-facing design gaps (need new or extended UX)

These are resident- or owner-facing surfaces with real visual/interaction design missing:

| FR | Gap | Resolution |
|---|---|---|
| **FR31** | **Claim-this-listing flow** + ownership verification (emailed code / website-meta). Prototype note literally says "claim-listing (to add)." | New multi-step flow (mirror the Submit wizard's stepper pattern). |
| **FR49 / FR31 / FR59 / FR43 / FR46** | **Business-owner account + owner dashboard** — login, "my listings," edit a claimed listing, see "in review" status, (later) tier/analytics. None designed. | New authenticated owner area. Core (login + manage/edit + status) is MVP; analytics/tier UI is Phase 2. |
| **FR39** | **Neighbourhood landing page** — new page type surfacing a neighbourhood's news + events + businesses. | New page (MVP-light); compose from existing card components. |
| **FR42** | **Featured / promoted disclosure** — "featured" badge + ranking treatment + ad-disclosure labelling in directory and home featured row. (Home has a featured row; promotion labelling is undesigned.) | Extend existing cards/rows with a clear "Promoted/Featured" affordance. |
| **FR58** | **Listing status badges** — temporarily-closed / permanently-closed / stale-unverified states on business cards + detail. | Extend BusinessCard + business detail header. |
| **FR61 / FR56** | **Provenance / "sourced rating" labelling** — at MVP ratings are imported; the UI must label provenance and handle null-rating gracefully. | Extend the Stars/reviews block + add a provenance label. |
| **FR24** | **"Near me" / location-permission UX** — the map is designed, but the geolocation-permission prompt + "use my location" affordance for Distance sort is not. | Add to directory filter/sort controls. |
| **FR44** | **AdSense reserved ad slots** — placement + reserved-space design so ads don't cause CLS. | Define slot positions across listing/detail templates. |
| **FR33** | **CAPTCHA (Turnstile) placement** in submit/claim forms. | Minor — widget slot in existing forms. |
| **FR5** | **Multi-city** surface — minimal at launch (Kingston only); no city switcher needed yet, but wordmark/footer city context should be considered. | Minor; mostly deferred until city #2 (FR52, Phase 2). |

## B. NOT design gaps — deliberately routed to Payload admin (generated UI)

The architecture decided the **operator works in Payload's admin** (RBAC, auto-generated CRUD,
drafts/versions). These need *configuration*, not custom front-end design:

- **FR32 / FR36 / FR60** moderation queue, dashboard, bulk/triage/staging — Payload admin views + a custom admin component where useful.
- **FR34** duplicate-flag review, **FR56** provenance-conflict resolution, **FR57** claim-lifecycle ops (dispute/revoke/transfer), **FR58** merge — operator actions in admin.
- **FR12 / FR19 / FR29** aggregation + seeding controls/monitoring — admin + job logs.
- **FR4 / FR48** taxonomy management + content CRUD — native Payload admin.

> **DECIDED 2026-05-31 (Chris):** Accept **Payload-admin-native** for all operator UI — no custom
> operator front-end — with light custom admin components only where the default UX is too slow for
> the solo moderation loop (FR60). Section B is therefore out of UX-design scope.

## C. Non-screen design surfaces (still need design, just not web screens)

- **FR35** transactional email templates (submission/claim received; publish/decision).
- **FR40** newsletter issue template ("Kingston in 5" digest: news + events + featured business).
- **FR41 / FR47** newsletter sponsor-slot treatment within the issue template.

> These want a lightweight email design pass consistent with the design system (Resend templates).

## D. Phase 2 — defer design entirely

- **FR50** native user-review submission form (MVP shows sourced ratings only).
- **FR43 / FR46** claim-subscription tier selection + billing + analytics dashboard.
- **FR39 (full)** rich cross-pillar facet hubs (MVP is light neighbourhood pages).
- **FR52** additional-city surfaces (city switcher, etc.).

---

## Recommendation & decisions (2026-05-31)

1. **B — DECIDED: Payload-admin-native operator UI** (no custom operator front-end). Out of UX scope.
2. **A — DECIDED: run `bmad-ux` now** to design the A-list gaps as design-reference additions,
   prioritizing the **claim flow (FR31)** and **owner account + dashboard (FR49)** (the biggest,
   most novel surfaces); the rest are extensions of existing components and may be designed inline.
3. **C** (email/newsletter templates) — schedule alongside Epic 5 (notifications) + Epic 7 (newsletter).
4. **D** — deferred to Phase 2.

No FRs need to be *cut* — but the build estimate for **Epic 5** (claim + owner-facing) is heavier
than the prototype implied, and **owner-account/dashboard UX is currently undesigned**. That is the
main "beyond the original design scope" finding.
