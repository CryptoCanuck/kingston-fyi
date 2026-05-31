---
title: Kingston.FYI — Design (gap-screen deltas)
status: final
created: 2026-05-31
updated: 2026-05-31
inherits: ../../design-reference/design-system.md
colors:
  promoted-bg: "var(--accent-tint)"      # #fbf3e2 — promoted/featured surface wash
  promoted-edge: "var(--accent)"          # #c4801f — promoted left-rule / label
  status-temp-closed: "var(--accent-strong)"   # #a86714 — temporarily closed
  status-perm-closed: "var(--ink-faint)"        # #7d8f9b — permanently closed (muted)
  status-stale: "var(--ink-soft)"               # #4d6373 — stale / unverified
  inreview: "var(--accent-strong)"        # in-review / pending pill
  ad-band: "var(--limestone)"             # #f3ecdf — reserved ad-slot band
typography:
  disclosure: "var(--eyebrow)"            # reuse eyebrow (800/uppercase/.14em) for PROMOTED / ADVERTISEMENT
rounded:
  badge: "var(--r-pill)"                  # 999px — status + disclosure pills
  panel: "var(--r-lg)"                    # 14px — dashboard + verification panels
spacing:
  ad-min-h-mobile: "250px"                # reserved height → zero CLS
  ad-min-h-desktop: "280px"
components:
  - StatusBadge
  - PromotedTag
  - ProvenanceLabel
  - AdSlot
  - VerificationPanel
  - InReviewPill
  - DashboardNav
  - ListingManageCard
  - LocationControl
---

# Kingston.FYI — Design (gap-screen deltas)

> **Inherits `../../design-reference/design-system.md` verbatim.** All base tokens (limestone/slate/
> ink/amber palette, `--tag-*`, Newsreader serif + Source Sans 3, `--gap`/`--pad`/`--r*`/`--maxw`,
> the atom/molecule/organism library, transform-only transitions, the ≤1100/≤860/≤560 breakpoints)
> are unchanged. This file adds **only the visual deltas** for net-new components introduced by the
> gap screens. On any conflict, the inherited system wins; nothing here overrides it.

## Brand & Style

The new surfaces (claim flow, owner dashboard, neighbourhood pages) are **the same civic-editorial
voice**, not a separate "app UI." Owner-facing screens lean slightly more utilitarian (denser forms,
clear status) but never adopt SaaS-purple, gradients, or heavy shadow — they use the limestone/slate
surfaces and bordered cards already defined. Monetization affordances (promoted, ads) are **honestly
labelled and visually quieter than editorial content** — trust is the brand.

## Components

> Visual reference for these components in situ: [`mockups/claim-flow.html`](./mockups/claim-flow.html)
> (VerificationPanel) and [`mockups/owner-dashboard.html`](./mockups/owner-dashboard.html)
> (DashboardNav, ListingManageCard, InReviewPill, StatusBadge). Inherited system wins on conflict.

### StatusBadge (FR58)
A pill (`{rounded.badge}`) reusing the `.tag-outline` shape. State → treatment:
- **Active** → no badge (default; absence = open/normal).
- **Temporarily closed** → solid `{colors.status-temp-closed}` text on `--accent-tint`, label "Temporarily closed".
- **Permanently closed** → `{colors.status-perm-closed}` text, muted; business name may render with reduced emphasis (never strikethrough — accessibility).
- **Stale / unverified** → outline pill, `{colors.status-stale}` text, label "Unverified" with an info affordance.
Placement: on BusinessCard (top-left over photo or inline by name) and the business-detail header pill row.

### PromotedTag (FR42) — disclosure-compliant
- Label "PROMOTED" or "FEATURED" in `{typography.disclosure}` (eyebrow), `{colors.promoted-edge}`.
- Promoted card carries a 3px left rule in `{colors.promoted-edge}` and an `{colors.promoted-bg}` wash — distinct from, and quieter than, editorial emphasis.
- Never mimics organic ranking without the label; must remain legible at AA contrast.

### ProvenanceLabel (FR61/FR56)
Small `.meta` row beside `.stars`: "Rating from {source}" (e.g., "from Google") at MVP. Null-rating →
"No rating yet" in `--ink-faint`; the stars component renders an empty, non-misleading state (no zero-stars implying a bad score).

### AdSlot (FR44) — zero-CLS by construction
Reserved container: fixed `min-height` (`{spacing.ad-min-h-mobile}` / `{spacing.ad-min-h-desktop}`),
`{colors.ad-band}` background, an "ADVERTISEMENT" `{typography.disclosure}` label, lazy-loaded. The
space is reserved before the unit loads so layout never shifts. No interstitials, max one per viewport-height of content.

### VerificationPanel + InReviewPill (FR31/FR59)
- **VerificationPanel** — a `{rounded.panel}` card walking the auto-detected verification step; uses existing `.field`/`.input`/`.btn` atoms and the Submit-wizard stepper. Success state is a prominent, warm confirmation (accent), not a generic toast.
- **InReviewPill** — `{colors.inreview}` pill, label "In review", with an `aria-live` announcement. Appears on dashboard listing cards and on the owner's view of an edited listing.

### DashboardNav + ListingManageCard (FR49)
- **DashboardNav** — quiet left/top nav (slate text on paper), sections: My Listings, (Phase 2: Analytics, Subscription). Mobile collapses to the same hamburger pattern as the public Header.
- **ListingManageCard** — a BusinessCard variant adding a status row (published / InReviewPill / draft), an "Edit" `.btn` (primary) and a "View public page" `.btn-ghost`.

### LocationControl (FR24)
A `.btn-ghost` with a location icon: "Use my location". States: idle → requesting (spinner) → granted (active, Distance sort enabled) → denied (inline hint: "Enable location to sort by distance"). Never blocks the directory; Distance sort is simply gated until granted.

## Do's and Don'ts

- **Do** reuse the Submit-wizard stepper for the claim flow — same visual, same step pattern.
- **Do** keep promoted/ad surfaces honestly labelled and visually quieter than editorial content.
- **Do** reserve ad-slot space to guarantee zero CLS (NFR2).
- **Don't** introduce a separate "dashboard design language" — owner screens are the same system, slightly denser.
- **Don't** render null ratings as zero stars or as a penalty.
- **Don't** use color alone to convey listing status — always pair with a text label (AA).
