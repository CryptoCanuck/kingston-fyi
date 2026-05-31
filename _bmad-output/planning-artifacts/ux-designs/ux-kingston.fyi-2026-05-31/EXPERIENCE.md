---
title: Kingston.FYI — Experience (gap screens & flows)
status: final
created: 2026-05-31
updated: 2026-05-31
design_ref: ./DESIGN.md
sources:
  - ../../design-reference/design-coverage.md
  - ../../design-reference/design-system.md
  - ../../design-reference/screen-inventory.md
  - ../../design-reference/content-model.md
  - ../../prds/prd-kingston.fyi-2026-05-31/prd.md
  - ../../architecture.md
  - ../../epics.md
---

# Kingston.FYI — Experience (gap screens & flows)

Behavioral contract for the design-coverage gap surfaces. Visual identity is `./DESIGN.md`
(which inherits `design-system.md`); this file owns *how it works*. Scope is the A-list only —
operator/admin UI is Payload-admin-native (out of scope), email/newsletter templates and Phase-2
surfaces are deferred. Tokens referenced as `{component.Name}` / `{colors.x}` from DESIGN.md.

## Foundation

- **Form-factor:** responsive web (the existing site). RSC-default; client interactivity only where
  needed (claim stepper, dashboard edit forms, geolocation control). New surfaces obey the inherited
  ≤1100 / ≤860 / ≤560 breakpoints.
- **UI system:** the locked Kingston.FYI design system (`design-system.md`) — these screens **compose
  existing atoms/molecules/organisms**; net-new components are specified in DESIGN.md.
- **Two audiences here:** the **business owner** (new authenticated role) and the **resident**
  (existing, for neighbourhood pages + the directory extensions). Operator stays in Payload admin.

## Information Architecture

New/extended routes (delta to `screen-inventory.md`):

| Route | Purpose | FR |
|---|---|---|
| `/business/[slug]` → **Claim entry** | "Claim this listing" CTA on the existing business detail page launches the claim flow | FR31 |
| `/claim/[businessId]` | The claim + verification flow (stepper) | FR31 |
| `/login` | Business-owner sign-in | FR49 |
| `/dashboard` | Owner home → My Listings | FR49 |
| `/dashboard/listings/[id]/edit` | Edit a claimed listing (re-moderated on save) | FR49/FR59 |
| `/neighbourhood/[slug]` | MVP-light cross-pillar neighbourhood page | FR39 |

**Account creation is not a standalone route at MVP** — it is created/linked *inside* the claim flow
at verification success (claim-first; decided). A direct `/signup` is `[ASSUMPTION: not exposed at
MVP — owners arrive via claim]`.

Directory/business surfaces gain **in-place extensions** (no new route): `{component.StatusBadge}`,
`{component.PromotedTag}`, `{component.ProvenanceLabel}`, `{component.AdSlot}`, `{component.LocationControl}`.

**Surface closure:** every gap FR maps to a surface above or an in-place extension; no orphan needs.

## Voice and Tone

Civic, plain, reassuring — never salesy, never bureaucratic. Microcopy:
- Claim CTA: **"Claim this listing"** (sub: "Are you the owner? Manage your info.").
- Verification (auto-detect): **"We'll confirm you own {business} — this takes a minute."** Email-match
  path: "We found an email that matches {domain}. We sent a 6-digit code." Fallback code: "Enter the
  code we emailed to {address}."
- Success climax: **"You now manage {business}."**
- In review: **"Your changes are in review"** (sub: "Your live listing stays as-is until we approve — usually within 2 business days.").
- Already-claimed: "This listing is already managed by its owner. Is this you? **Report a problem.**"
- Promoted disclosure: **"PROMOTED"** / featured: "FEATURED". Ad: **"ADVERTISEMENT"**.
- Status: "Temporarily closed", "Permanently closed", "Unverified — info may be out of date".
- Null rating: **"No rating yet"**. Provenance: "Rating from Google".
- Location denied: "Enable location to sort by distance."

## Component Patterns (behavioral)

- **Claim stepper** — reuses the Submit wizard's 4-step stepper *pattern* with claim-specific steps
  (see Key Flows). Back/Next preserve entered data; step state in component (not URL) since it's a gated, authenticated-becoming flow.
- **{component.StatusBadge}** — derived from listing lifecycle state (FR58); "stale/unverified" shows
  an info popover explaining the data may be outdated and inviting a claim.
- **{component.PromotedTag}** — rendered whenever a result is shown due to a paid/featured flag (FR42);
  promoted results are visually quieter than editorial and **always labelled**; they still respect active filters + city scope.
- **{component.ProvenanceLabel}** — shown wherever a rating renders (card + detail); null-rating sorts
  to a defined position (not "0") and the min-rating filter excludes nulls only when a minimum is set.
- **{component.AdSlot}** — reserves space before load (zero CLS), lazy-loads on scroll, max one per
  viewport-height; never between a heading and its content.
- **{component.LocationControl}** — gates Distance sort; on denial, Distance is disabled with the hint, other sorts unaffected.
- **{component.ListingManageCard}** — shows live status; "Edit" opens the edit form; if an edit is
  already pending, the card shows `{component.InReviewPill}` and the edit form warns that a prior change is still under review.

## State Patterns

**Claim flow states** (FR31/FR57):
`idle → initiated → verifying(auto-detect) → [verified | code-sent → code-verified | operator-pending] → claimed`
plus terminal/branch states: `already-claimed`, `disputed` (another party claims it), `failed`
(verification exhausted → operator backstop), `expired` (code timeout → resend).

**Listing edit states** (FR59 — re-moderation): `published → editing → submitted → in-review → (approved→published | changes-requested→editing)`. **The live public listing never reflects an edit until approved.**

**Listing lifecycle states** (FR58, display): `active` (no badge) · `temporarily-closed` · `permanently-closed` · `stale-unverified`.

**Dashboard list states:** `loading` (skeleton) · `empty` ("You don't manage any listings yet — find yours and claim it." + search CTA) · `populated` · `error` (retry).

**Verification sub-states (auto-detect):** attempting domain/meta match → matched (instant) | not-matched (→ emailed code) | code entry (resend + attempts limit) | exhausted (→ operator review with InReviewPill).

**Rating states** (FR61): `sourced` (with ProvenanceLabel) · `none` (No rating yet) · [Phase 2: `native`].

## Interaction Primitives

- Transitions are **transform-only, never opacity** (inherited robustness rule) — applies to stepper
  step changes and dashboard drawer.
- **Focus management:** entering a claim step moves focus to the step heading; success state moves
  focus to the confirmation; the edit form returns focus to the edited card on save. Mobile dashboard nav traps focus while open, restores on close.
- **Geolocation:** permission requested only on explicit `{component.LocationControl}` activation (never auto-prompt on load).
- **Optimistic vs pending:** owner edits are **never optimistic** on the public side — the UI explicitly shows "in review" rather than implying the change is live.

## Accessibility Floor (WCAG 2.2 AA — behavioral; visual contrast in DESIGN.md)

- Claim stepper fully keyboard-operable; each step is a labelled landmark; Next/Back are real buttons; the stepper exposes current step to assistive tech (`aria-current`).
- Status changes ("In review", verification success/failure) announced via `aria-live` polite regions.
- `{component.StatusBadge}` and `{component.PromotedTag}` never rely on color alone — text label always present.
- `{component.AdSlot}` is not a focus trap and is labelled "Advertisement"; decorative ad chrome is `aria-hidden`.
- `{component.LocationControl}` denial path is reachable and explained without color-only cues.
- Code-entry input has an explicit label, autocomplete `one-time-code`, and visible error text (not color-only).
- Target sizes meet 2.2 AA (24×24 minimum) for badges/controls added to dense cards.

## Key Flows

> Visual reference: [`mockups/claim-flow.html`](./mockups/claim-flow.html) (verify step + success climax) ·
> [`mockups/owner-dashboard.html`](./mockups/owner-dashboard.html) (My Listings + in-review state).
> The spines are the contract; mocks illustrate — spines win on conflict.

### Flow 1 — Dale claims Skeleton Park Roasters (FR31, UJ-2) ★ priority
Dale (owner, has `dale@skeletonparkroasters.ca`) finds his auto-seeded listing.
1. On `/business/skeleton-park-roasters` he taps **"Claim this listing."**
2. Claim flow opens (`/claim/[id]`). Step 1 explains what claiming gives him.
3. **Auto-detect:** the system sees his listing's website is `skeletonparkroasters.ca`, offers the email-domain path, and emails a 6-digit code to `dale@…ca`.
4. He enters the code. **★ Climax beat:** the panel turns warm-confirm — **"You now manage Skeleton Park Roasters"** — and his owner account is created/linked in that same moment (no separate signup).
5. He lands in `/dashboard` with the listing now under his management.
*Branches:* domain match impossible → emailed-code to a contact address; exhausted/ambiguous → operator backstop with InReviewPill; listing already claimed → "Report a problem".

### Flow 2 — Dale fixes his hours, sees re-moderation (FR59) ★ priority
1. From `/dashboard`, Dale opens his listing's **Edit**.
2. He corrects hours + adds two photos, hits Save.
3. **★ Climax beat:** instead of a "saved & live" message, he sees **"Your changes are in review"** with the reassurance his live listing is unchanged — and the card now shows `{component.InReviewPill}`.
4. On operator approval he's emailed; the live listing updates. (Operator side = Payload admin, out of scope.)

### Flow 3 — Maya explores Williamsville (FR39)
1. From an article tag or the directory, Maya opens `/neighbourhood/williamsville`.
2. The page shows, in one civic-editorial layout, Williamsville's **latest news, upcoming events, and notable businesses** — composed from existing cards.
3. She taps an event → its venue → the venue's other events. The neighbourhood page delivered cross-pillar discovery in one stop. *(MVP-light; full faceted hub is Phase 2.)*

### Flow 4 — A resident sorts by distance (FR24)
1. In the directory, a resident taps **{component.LocationControl}** "Use my location".
2. Browser prompts; on grant, **Distance sort** activates and results reorder by proximity (PostGIS).
3. On deny, Distance stays disabled with an inline hint; all other sorts/filters keep working.

## Inspiration & Anti-patterns

- **Anti-pattern:** a separate, glossy "merchant portal" look. Owners get the *same* civic system,
  slightly denser — continuity signals the same trustworthy brand.
- **Anti-pattern:** dark-pattern monetization (promoted results indistinguishable from organic, ads
  that shift layout, interstitials). Explicitly forbidden — disclosure + reserved space + restraint.
- **Anti-pattern:** implying owner edits are live before moderation. Always show "in review".

## Open items / assumptions

- `[ASSUMPTION]` No public `/signup` at MVP — owner accounts originate from the claim flow; a
  standalone signup/login-for-existing-owner is reachable via `/login`.
- `[ASSUMPTION]` Neighbourhood page composition uses recency + featured-flag selection (mirrors the
  Home hub rules, FR53) — confirm slot rules.
- `[NOTE FOR UX]` Email templates (claim received / verified / changes approved) are a separate pass
  (Section C of the coverage report) but their *triggering states* are specified here.
