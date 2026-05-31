# PRD Quality Review — Kingston.FYI

## Overall verdict

This is a strong, disciplined solo/passion-project PRD that knows exactly what it is: a capabilities spec feeding an architecture phase. It holds a clear thesis (the cross-link is the product), keeps FRs at capability altitude with globally-unique stable IDs, separates MVP from Phase 2 cleanly, and carries cross-cutting NFRs with real product-specific bounds. The main risks are mechanical and one substantive gap: a **broken cross-reference** (§7 points to a nonexistent "addendum"), **success metrics with no numeric targets** (acknowledged as TBD but leaves the thesis only partially falsifiable), and a few FR consequences that lean on adjectives rather than testable conditions. None are blockers for entering architecture; all are quick fixes. Gate: **pass-with-fixes**.

## Decision-readiness — adequate

A decision-maker can act on this. The thesis is stated plainly ("The defining capability is the cross-link," §1) and the PRD repeatedly bets on it (FR37–39, the "wedge" framing, UJ-1 calling the cross-link "the experience"). Trade-offs are surfaced honestly in several places: news is free/no-paywall as a stated stance (FR10, G3), monetization is "passive-first" with billing explicitly deferred (FR43, FR45/46), and search ships as Postgres FTS with a named upgrade path rather than pretending Meilisearch is in scope (FR51, §7). Phasing decisions are stated as decisions, not buried.

What keeps this from "strong": the trade-offs that *were given up* are mostly implied rather than named. E.g., choosing no-account-for-residents (FR49) trades away personalization/retention signals — that cost isn't acknowledged. The Open Questions (§8) are genuinely open (numeric targets, verification method, competitor verification), which is good, but a couple read as already-answered ("Resident accounts — confirmed out of MVP? (assumed yes.)").

### Findings
- **low** Trade-off costs implied, not named (§ FR10, FR49, FR42–44) — Decisions are clear but the thing sacrificed (e.g., retention signal lost by no resident accounts; SEO/UX risk of paid placement in FR42) is not stated. *Fix:* one clause per major trade-off naming the cost accepted.

## Substance over theater — strong

Very little furniture here. There are no personas-as-decoration: the five user types (§3) collapse into four concrete UJs each with a named protagonist (Maya, Dale, Priya, Operator), and each UJ drives real FRs (UJ-2 → FR31/32; UJ-3 → FR30/33/35). No persona theater, no count inflation. NFRs carry product-specific content rather than boilerplate: NFR1 enumerates the exact JSON-LD types and the deliberate omission of self-serving `aggregateRating`; NFR2 ties ad units to reserved slots/no-CLS; NFR5 names the scaled-content-abuse / AdSense-eligibility risk specifically. The Vision/Overview is Kingston-specific and would not swap cleanly into another PRD. No innovation theater — the "wedge" claim (cross-linking) is consistently load-bearing, not decorative.

No findings.

## Strategic coherence — strong

The PRD reads as a thesis, not a backlog. The arc is explicit: cross-linked graph (the differentiator) → directory density as the day-one usefulness engine → claimed listings as the north-star steering metric → passive-first monetization layered on top. Feature prioritization follows the thesis: cross-linking gets its own FR group and is declared MVP-mandatory (§6: "that integration is the product"), while reviews, upgraded search, and extra cities are deferred even though they'd be easy wins — that's thesis-driven sequencing, not easy-first.

Success metrics largely validate the thesis (claimed listings as north-star; directory density; cross-link-relevant "events engagement") and **counter-metrics are present and pointed** (§2: thin-page indexing, CWV regressions, moderation latency, listing staleness) — these directly guard the bets the PRD makes. MVP scope kind is coherently a "platform/experience" play and the scope logic matches.

### Findings
- **high** Success metrics have no numeric targets (§2) — Metrics are directional only ("numeric targets TBD"). The thesis is therefore only partially falsifiable: there's no threshold that says the cross-link/density bet worked or failed. Acknowledged in §8 as deferred, which is defensible pre-architecture, but it weakens the "validate the thesis" function of SMs. *Fix:* even rough 6/12-month bands (order-of-magnitude listings live, claimed-listing count, organic sessions) so downstream has a target to design toward.

## Done-ness clarity — adequate

Most FRs carry a testable consequence. Strong examples: FR15 (time buckets *derived from start datetime relative to now* — verifiable), FR22 (hover on card highlights pin and vice versa — directly testable), FR28 (most-specific LocalBusiness subtype, `aggregateRating` NOT emitted — binary, checkable in markup), FR32 (status pending→approved→published, never auto-publish — testable), FR17 (ICS Add-to-Calendar + venue link). The NFRs mostly give bounds not adjectives: NFR1 enumerates exact schema types; NFR3 names WCAG 2.2 AA with specific surfaces (filters, search, calendar).

This is the dimension with the most residual softness, though minor for the stakes:
- FR34 "Duplicate detection ... flag *likely* duplicates" — no threshold or even a notion of what signal (name+geo? fuzzy NAP?). Done-ness undefined.
- FR3 "unified search with autocomplete" — no latency/recency expectation; "full query routes to directory/results" is clear, but autocomplete behavior (min chars, ranking) isn't bounded. (FR51 defers *typo-tolerance* to Phase 2, so MVP search expectations should be stated.)
- NFR2 "meet CWV budgets (LCP/INP/CLS)" names the metrics but no target values — "meet budgets" is an adjective until the budget numbers exist.
- FR29/FR12 "useful," NFR5 "genuinely useful" — useful is the right *intent* but has no test; partially rescued by the counter-metric (thin pages indexed) but no FR-level acceptance.

### Findings
- **medium** Several FR consequences lean on adjectives without a testable bound (§ FR3, FR34, NFR2, NFR5) — "likely duplicates," "meet CWV budgets," "genuinely useful" have no thresholds. *Fix:* attach one verifiable condition each (CWV target numbers in NFR2; dedup match signal in FR34; MVP autocomplete min-chars/latency in FR3). For "useful," lean explicitly on the existing counter-metric as the acceptance proxy.
- **low** No consolidated Acceptance section (§4) — Acceptable for this PRD since most FRs carry their own consequence, but story creation will have to reconstruct AC for the softer FRs above. *Fix:* none required; just ensure the medium-finding FRs get their bound so story-time inference is unnecessary.

## Scope honesty — strong

Omissions are explicit, not inferred. Phase 2 is tagged consistently (FR43, FR45, FR46, FR50, FR51, FR52) and re-stated as a block in §6. A dedicated later-phase FR group (§4.10) does real work. Inferences carry `[ASSUMPTION]` tags inline (FR5, FR12, FR29, FR31, NFR9) and — importantly — the decision-log records that the user explicitly confirmed the load-bearing ones ("agree all") and that the remaining tags are architecture-deferred mechanism notes, not silent assumptions. De-scoping is done out loud (reviews → display-only at MVP, FR50; search → FTS at MVP, FR51; resident accounts out, FR49).

Open-items density is appropriate to stakes: §8 has ~7 open questions, all genuinely deferrable (numeric targets, verification mechanism, competitor verification, CASL specifics), and none of them block entering architecture. For a solo green-to-build-the-design PRD, that's well-calibrated.

Note: there is **no explicit Non-Goals section**, but the work it would do is covered by §4.10 + §6 + the inline Phase 2 tags. Calling that out rather than flagging it as a gap.

### Findings
- **low** No `[NON-GOAL for MVP]` callouts despite some silently-assumable omissions (§3/§4) — e.g., no resident reviews at MVP is stated (FR50) but things like "no native commenting," "no resident profiles/saved-favorites" are implied only via "no account" (FR49). *Fix:* a one-line Non-Goals list to prevent downstream re-introduction. Optional given the stakes.

## Downstream usability — adequate

This PRD is explicitly chain-top (feeds UX → architecture → stories), so this dimension matters. FR IDs are **contiguous and unique (FR1–FR52, no gaps, no dupes)** — verified. NFR IDs contiguous (NFR1–9). UJ IDs contiguous (UJ-1–4), each with a named protagonist carrying context inline — clean. Internal cross-references resolve: FR9/FR17/FR27 ↔ FR38 (rails), FR30 ↔ FR19, FR41 ↔ FR47, FR47 ↔ FR41, FR42 ↔ FR47/FR41, FR50/FR51/FR52 ↔ §6. NFRs reference their FRs correctly (NFR1→FR11/18/28; NFR4→FR32; NFR7→FR5).

Two gaps hold it back from strong:
1. **No Glossary / Assumptions Index.** Domain nouns are used consistently in practice (cross-link, neighbourhood, claim, moderation queue, leaf/parent category, Open Now — all stable), so the *absence* causes little drift today, but there's no single source for downstream extraction and no roundtrip index for the inline `[ASSUMPTION]` tags. The decision-log partially substitutes for the assumptions index.
2. A **broken external cross-reference**: §7 and the §1 brief reference are fine, but §7 says mechanism decisions are "deferred to architecture (see addendum)" and FR5/FR29 etc. lean on it — **there is no addendum.md in this folder** (confirmed by directory listing). Downstream readers chasing "see addendum" hit nothing.

### Findings
- **high** Broken cross-reference to a nonexistent addendum (§7, end) — "(see addendum)" has no target; the folder contains only `prd.md` and `.decision-log.md`. A downstream architect following the pointer finds nothing. *Fix:* either create the addendum, repoint to `.decision-log.md` (which holds the deferred-mechanism notes), or delete the parenthetical.
- **medium** No Glossary and no Assumptions Index (§ whole doc) — Terms are consistent today so impact is low *now*, but a chain-top PRD should give UX/architecture a single noun source and a roundtrip list of the 5 inline `[ASSUMPTION]` tags (FR5, FR12, FR29, FR31, NFR9). *Fix:* add a short Glossary (≤12 terms) and an Assumptions Index appendix; the index can simply cite the decision-log's "agree all" confirmations.

## Shape fit — strong

The PRD is shaped correctly for what it is. It's a consumer-facing, multi-stakeholder product (residents, businesses, organizers, operator) with meaningful UX, so **UJs with named protagonists are load-bearing — and they're present and doing work** (§3). At the same time it correctly recognizes the solo/automation-first reality: the Operator is a real protagonist (UJ-4, FR36, FR48), monetization is passive-first, and rigor is kept light without sacrificing the substance bar. It is neither over-formalized (no UJ bloat, exactly four) nor under-formalized (a consumer product *with* UJs and explicit cross-cutting NFRs). The capability-not-implementation discipline is consistently honored — mechanism is repeatedly pushed to architecture (FR31 verification, FR5 hostname, NFR8 "mechanism detail → architecture," §7).

No findings.

## Mechanical notes

- **ID continuity:** FR1–FR52 contiguous, unique, no gaps/dupes (verified). NFR1–9 and UJ-1–4 likewise clean.
- **Cross-refs:** Internal FR↔FR / NFR↔FR / §6↔FR references all resolve. The one external break is "(see addendum)" in §7 (no such file) — raised as a high finding under Downstream usability.
- **Glossary drift:** No Glossary section, but actual usage is consistent — "neighbourhood" (UK spelling) used uniformly; "claim/claimed listing," "moderation queue," "cross-link," "Open Now," "leaf/parent category," "north-star" all stable. No observed drift.
- **Assumptions Index roundtrip:** Five inline `[ASSUMPTION]` tags (FR5, FR12, FR29, FR31, NFR9). No end-of-doc index, but the decision-log records confirmation status for each — partial substitute. Recommend a proper index for downstream.
- **UJ protagonist naming:** All four UJs named (Maya, Dale, Priya, Operator/Chris) with context inline. Good. Minor: §3 lists five "user types" but only four become UJs — Visitors (secondary) have no journey; acceptable as secondary, worth a one-word note that they're intentionally not journey-mapped at MVP.
- **Required sections:** Overview, Goals/SM (+counter-metrics), Users/UJs, FRs, cross-cutting NFRs, MVP-vs-later, Technical Assumptions, Open Questions, Related Artifacts — all present. Missing-but-substituted: Non-Goals (covered by §4.10/§6), Glossary, Assumptions Index.
