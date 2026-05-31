---
title: PRD ↔ Brief Reconciliation — Kingston.FYI
status: review
created: 2026-05-31
prd: ../prd-kingston.fyi-2026-05-31/prd.md
brief: ../../briefs/brief-kingston.fyi-2026-05-30/brief.md
---

# Reconciliation: PRD against Source Brief

Scope: find what the PRD **dropped**, **contradicts**, or **under-specified** relative to the
brief — with special attention to qualitative intent (tone/voice/positioning, cold-start
sequencing, the "broad but genuinely useful, never hollow" principle, the passion-project / solo
framing) that an FR list silently loses. Also flag anything the PRD **added** that the brief
doesn't support.

Overall: the PRD is a faithful, high-fidelity translation of the brief's *functional* content.
Nearly every brief feature has a traceable FR/NFR. The gaps are almost entirely in **strategic
narrative and qualitative framing** — the "why" and the "how it sequences" — which the PRD
defers to the brief by reference rather than re-stating. That deferral is defensible for a PRD,
but several items are load-bearing enough that downstream readers (architect, dev, designer)
who read only the PRD will lose intent. Findings are graded by severity.

---

## A. Dropped / under-specified — QUALITATIVE INTENT (highest risk)

### A1. Cold-start sequencing is flattened — HIGH
The brief's GTM is an explicit ordered flywheel (§Go-to-Market): **seed directory → residents
as front door via events + "near me" + free news → social distributes → audience makes listings
valuable → convert claims → paid tiers.** It also names the **"front door"** explicitly:
"events + 'what's open near me' + free news (cleanest SEO + immediate use)."

The PRD reduces this to G2 ("density so the site is useful from day one, then convert owners")
and UJ journeys. The PRD **never states the sequencing rationale** — that residents are won
*first*, that the front door is specifically events/near-me/free-news, or that claims are only
valuable *once there's an audience*. A reader optimizing the PRD could reasonably prioritize the
directory-owner experience over the resident front door, inverting the strategy. The two-sided,
**"seeded in sequence"** framing from the brief's Target Users section is absent.
→ Recommend: a short "Sequencing / front door" note in §2 or §3, or a Strategy callout.

### A2. "Free / no paywall" as a deliberate competitive WEDGE, not just a feature — HIGH
The brief is emphatic: "**Free, open access is therefore a deliberate wedge**, not just a
default," grounded in real community frustration at Kingstonist's paywall (§Problem/Opportunity).
The PRD has FR10 ("free / no paywall") and uses the word "free" in the overview — but as a
*property*, stripped of the competitive-positioning rationale and the community-sentiment
evidence. The strategic "why this is a wedge" is gone. This matters because it should constrain
future monetization decisions (e.g. it argues against ever paywalling news, even partially).
→ Recommend: preserve one sentence of wedge rationale near FR10 or in §1.

### A3. "Broad but genuinely useful, never hollow" — present but WEAKENED — MEDIUM
The brief states the quality guardrail forcefully and with a stated cause: "**broad coverage
must be *genuinely useful* pages — never thin auto-filler** (protects rankings *and* AdSense
eligibility)" plus the "**Hard line (rejected approach)**" against scraping/rewriting
competitors. The PRD captures the principle in NFR5 and the counter-metric, and FR12 captures
"competitors are a signal source only, never republished." So the substance survives. What is
weakened: the brief frames this as a **hard line / rejected approach** with explicit copyright,
fair-dealing, and brand-trust reasoning ("fatal to brand trust in a small market"). The PRD's
NFR5 reads as a quality target, not a non-negotiable line. The *brand-trust* dimension of the
reasoning is dropped (PRD keeps only rankings + AdSense).
→ Recommend: elevate NFR5 / FR12 language to "hard line" and restore the brand-trust reason.

### A4. Passion-project / solo framing — partially dropped, with a lost nuance — MEDIUM
The PRD keeps "run by one person through automation" (G4, overview) — the *operational* half.
It **drops the brief's explicit "Operating Model & Stakes" calibration**: "passion project (not
a funded startup) … this calibrates the *pressure* (low, no do-or-die clock) — **not** the
*build quality*, which holds to the locked production guardrails." That nuance — low pressure
but uncompromised quality — is exactly the kind of intent that prevents a reader from cutting
corners "because it's just a solo passion project." The PRD also drops the brief's Risk #5
(key-person / burnout, mitigated by automation + "honest acceptance for a passion project") and
Risk #6 (runway softened — "near-zero burn … not existential").
→ Recommend: one line in §1 or §7 capturing "low pressure, full build quality."

### A5. Civic / trustworthy / community-first tone & brand positioning — thin — MEDIUM
The brief's differentiation table calls out **"Trust/brand: Civic, credible, community-first"**
as a competitive lever vs. incumbents. The PRD says "civic-minded community hub" in the overview
and "civic-trust" appears once (NFR context), but the **brand positioning as a differentiator**
is not carried as a requirement or design constraint. Tone/voice guidance for content
(editorial credibility, civic register) has no home in the PRD. For a content-heavy product this
is a real omission — it should shape the newsletter voice, news editorial standards, and UI tone.
→ Recommend: add a brand/voice note (or point explicitly to design-system.md for tone).

---

## B. Dropped / under-specified — FACTUAL / SCOPE DETAILS (medium/low)

### B1. Sourcing specifics — named primary sources dropped — MEDIUM
The brief enumerates the **named institutional primary sources**: City of Kingston, Queen's,
St. Lawrence College, KFL&A Public Health, Police, the Frontenacs, plus "legitimate link-out
aggregation." FR12 abstracts this to "institutional press releases, public feeds." The concrete
source list is operationally useful (it defines the aggregation pipeline's targets) and is lost.
Also dropped: "AI assists the founder's *own* drafts from primary sources" — the PRD says
"assist operator-authored drafts" (FR12) which is close, but the *AI* assistance is implicit only.
→ Recommend: carry the named-source list into FR12 or an appendix.

### B2. Risks & Mitigations section — entirely absent from PRD — MEDIUM
The brief has 6 explicit risks with mitigations (SEO single-point-of-failure / AI Overviews /
zero-click; cold-start; quality-at-scale; incumbent response; key-person; runway). The PRD has
**counter-metrics** (§2) that partially cover quality-at-scale and CWV, but there is **no risk
register**. The most strategically important — **Risk #1: SEO single-point-of-failure**, with
the AI-Overviews / zero-click erosion threat and the **"newsletter = owned audience (can't be
deranked)"** mitigation — is a major strategic driver for the newsletter that the PRD treats as
just FR40. The PRD never explains *why* the newsletter matters strategically (owned audience /
SEO de-risking).
→ Recommend: add a brief Risks section, or at minimum attach the newsletter's strategic
rationale to FR40 and note the SEO concentration risk.

### B3. "Incumbent response" + verification open question — partially carried — LOW
Brief Risk #4 (Kingstonist could drop paywall / add a directory → "move first; own the
*claimable* directory + cross-link they lack"). The PRD drops the competitive-response framing.
The verification open question survives (PRD §8 ≈ brief Open Questions: KingstonToday / Village
Media, Kingstonist directory claimable). Good fidelity on the open questions.

### B4. AdSense "not primary revenue / directory leads" emphasis — softened — LOW
The brief is explicit that **AdSense is a baseline layer, NOT primary revenue (directory leads)**
because hyperlocal CPMs are low. The PRD (FR44, §2 lists "AdSense RPM/revenue" as a flywheel
metric) preserves the discipline (CWV/brand) but loses the explicit "not the primary revenue,
directory is" prioritization. Minor, but it affects how revenue features get prioritized.

### B5. Newsletter naming inconsistency / link-out aggregation role — LOW
Brief consistently calls it **"Kingston in 5"** and ties it to **link-out aggregation** as a
*sourcing* mechanism. PRD FR40 offers two names ("The Limestone Letter" / "Kingston in 5") and
treats it purely as a digest, dropping its role as the legitimate link-out aggregation channel
(brief §Content Strategy). Low impact; worth aligning the name and noting the link-out role.

---

## C. PRD ADDED beyond the brief (verify support)

### C1. Specific personas with names — ADDED, harmless — LOW
The PRD introduces named personas (Maya, Dale, Priya, Chris/Operator) in UJ-1–4. The brief has
user *types* but no named personas or user journeys. This is normal PRD elaboration and
consistent with brief intent — not a contradiction. Flagging only for traceability.

### C2. Concrete FR-level UI specifics — ADDED, mostly traceable to design-reference — LOW
Many fine-grained UI requirements (three-pane split, map⇄list hover sync FR22, active-filter
chips FR26, sort options FR23, multi-step submit wizard steps, news category sub-nav exact list,
calendar month-grid) are more specific than the brief. These plausibly derive from the
design-reference artifacts (content-model.md, screen-inventory.md, prototype) cited by both docs,
not invented. Not a brief contradiction, but they exceed what the brief alone supports — confirm
they trace to design-reference.

### C3. "Open Now" derived field, amenity tags, price tier, rating histogram — ADDED — LOW
FR20/FR21/FR27 specify Open-Now derivation, amenity tags, price tiers, review histogram. Brief
mentions search/filters/map and claimable listings generically. These are reasonable
elaborations (and Open-Now aligns with the "what's open near me" front door), but they're PRD
additions. Likely from design-reference; confirm.

### C4. Technical: "Next.js 16" and "Payload CMS 3.x" — CONSISTENT (note vs CLAUDE.md) — LOW
PRD §7 and brief both lock Next.js 16 + Payload CMS 3.x + single Postgres/PostGIS + Drizzle-vs-
Prisma-deferred. PRD is fully consistent with the brief here. (Aside: the repo's CLAUDE.md
describes a *different* stack — Next.js 15, Supabase, no Payload, Meilisearch, LM Studio. That is
a PRD/brief-vs-implementation divergence, outside the brief-reconciliation scope, but worth
surfacing to the user.)

### C5. Counter-metrics framing — ADDED, supportive — LOW
The PRD's explicit counter-metrics (§2) are not in the brief as such but are well-aligned with
the brief's quality guardrail and risks. Positive addition.

---

## D. Contradictions

None material. Checked: free/no-paywall (consistent), never-auto-publish moderation (consistent),
no self-serving aggregateRating (consistent both docs), multi-city-ready / Kingston-only-live
(consistent), monetization phased / data-model-supports-all-day-one (consistent: PRD FR43 "Phase
2 for billing; data model ships MVP" matches brief), reviews as Phase 2 (consistent), search
Postgres-FTS-now/Meilisearch-later (consistent). No direct contradictions found.

---

## E. Summary table (traceability of brief's qualitative intent)

| Brief intent | In PRD? | Severity if lost |
|---|---|---|
| Cold-start sequencing / "front door" = events+near-me+news | Flattened | HIGH |
| Free = deliberate competitive wedge (vs Kingstonist paywall) | Property only | HIGH |
| "Broad but genuinely useful, never hollow" / hard line on rewriting | Weakened (brand-trust reason lost) | MEDIUM |
| Passion-project: low pressure, NOT low build quality | Op half only | MEDIUM |
| Civic / trustworthy / community-first brand as differentiator | Thin | MEDIUM |
| Named primary sources + AI-assisted own drafts | Abstracted | MEDIUM |
| Risk register (esp. SEO SPOF → newsletter as owned audience) | Absent | MEDIUM |
| AdSense = baseline not primary (directory leads) | Softened | LOW |
| Newsletter name + link-out aggregation role | Inconsistent | LOW |

## Recommended minimal edits
1. Add a 3–4 line "Strategy & Sequencing" callout to §1/§2: front door, two-sided seeding order,
   free-as-wedge, newsletter-as-owned-audience.
2. Strengthen NFR5/FR12 to "hard line" + restore brand-trust reasoning.
3. One line in §7 (or §1): solo passion project = low pressure, full build quality.
4. Add a short Risks section (or fold SEO-SPOF + cold-start + incumbent into §8).
5. Carry named primary-source list into FR12; align newsletter name + note link-out role.
