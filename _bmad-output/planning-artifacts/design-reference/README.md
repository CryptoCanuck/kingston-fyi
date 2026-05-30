# Kingston.FYI — Design Reference (extracted)

This folder captures the **Claude Design handoff bundle** and an extraction of its
intent, visual system, data model, and screens — for use during planning (product
brief → PRD → UX spec → architecture). **No application code is implemented yet.**

## Contents

| File | What it is |
|---|---|
| `HANDOFF-README.md` | Original instructions from the Claude Design bundle |
| `chats/chat1.md` | The design conversation — where the user's intent lives (read first) |
| `prototype/` | The original HTML/CSS/JS prototype (React-via-Babel), verbatim. Source of truth for pixel-perfect recreation later. `prototype/screenshots/` has rendered captures. |
| `design-system.md` | Extracted visual system: tokens, color, type, components, responsive rules |
| `content-model.md` | Extracted data model: entities, fields, the cross-link graph, taxonomies |
| `screen-inventory.md` | Extracted screens (8), their features, flows, and components |

## How this maps to the build

- The prototype is a **presentation-layer reference**, not production code. The README
  in the bundle is explicit: recreate it pixel-perfect in the target stack (Next.js 16
  / React 19), don't copy the prototype's internal structure.
- `content-model.md` is the highest-value extraction for the **PRD and architecture** —
  it encodes the "unified graph, not three apps" requirement as concrete entities and links.
- The prototype uses **fictional Kingston-flavoured placeholder content** and **styled
  colour-block image placeholders** by design — these are not real data.

## Status

- Original kickoff: planning-first (brief → PRD → architecture), no code yet.
- Design bundle fetched, preserved here, and extracted on 2026-05-30.
- Next: product brief (`bmad-product-brief`), folding in locked tech decisions + this design.
