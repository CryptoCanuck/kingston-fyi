# Kingston.FYI — Design System (extracted from prototype)

A fresh **civic-editorial** system built from the brief — *"a credible local newspaper
crossed with a friendly community guide."* Source: `prototype/styles.css`, `shell.jsx`,
`ui.jsx`. Token names below are the real `--*` names; reuse them verbatim when building.

## Brand direction

- **Tone:** trustworthy, civic, modern. Not corporate, not flashy. Nods to Kingston's
  "Limestone City" identity and Lake Ontario waterfront.
- **Palette logic:** deep slate blue + limestone off-white/beige + a single warm amber
  accent. Explicitly **no SaaS purple gradients**.
- **Surfaces:** bordered cards over heavy shadows; generous whitespace; strong
  typographic hierarchy.
- **Logo:** wordmark only — "Kingston.FYI" set in the serif.

## Color tokens

```
/* limestone & slate surfaces */
--paper        #faf7f0   page surface (lighter limestone)
--limestone    #f3ecdf   secondary bg bands
--limestone-2  #ece3d2   deeper band / hover
--card         #ffffff

/* slate (dark / masthead) */
--slate-900 #16252f   --slate-800 #1d3040 (primary dark/masthead)
--slate-700 #274255   --slate-600 #3a586c   --slate-500 #557287

/* ink (text) */
--ink #1b2a33 (body)   --ink-soft #4d6373 (secondary)   --ink-faint #7d8f9b (meta)

/* accent (amber) — overridable by the tweaks panel */
--accent #c4801f   --accent-strong #a86714   --accent-soft #f6e7cb   --accent-tint #fbf3e2

/* category tag colors (editorial) */
--tag-local #2f6d6a   --tag-politics #7a4b8c   --tag-business #2e5d8a
--tag-sports #b1582b  --tag-arts #a23a64       --tag-opinion #6b6f3a

/* lines & shadows */
--line #e3d9c6   --line-strong #d4c7ad   --line-faint #efe8da
--shadow-sm/md/lg  (subtle, used sparingly)
```

## Typography

- **Headlines (serif):** `--serif: "Newsreader", Georgia, serif` — warm contemporary serif,
  weight 600, tight leading (1.12), `letter-spacing -0.01em`, `text-wrap: balance`.
- **Body / UI (sans):** `--sans: "Source Sans 3", system-ui, sans-serif`. Base 17px / 1.55.
- Also loaded but secondary: Spectral, Bitter, Playfair Display (tweaks-panel font options).
- **Eyebrow:** 800 weight, uppercase, `letter-spacing .14em`, accent-strong color.

## Spacing / radius / layout

- Density tokens (overridable): `--gap: 24px`, `--pad: 22px`.
- Radius: `--r-sm 5px`, `--r 9px`, `--r-lg 14px`, `--r-pill 999px`.
- Container: `--maxw: 1240px`; `.kf-wrap` = max-width + 28px gutters.

## Component inventory (reusable atoms → organisms)

**Atoms** — `.btn` (primary/dark/ghost, sm/lg), `.tag` + `.tag-outline` (category chips),
`.chip` (filter pill, `.is-active`), form `.field`/`.input`/`.select`/`.textarea`,
`.eyebrow`, `.stars` (rating), `.meta` (icon+text rows), `Switch`, `Check`, `Radio`,
`Icon` (inline SVG set), `Ph` (styled image placeholder, hues `ph-a`…`ph-f`), `Logo`.

**Molecules** — `SearchBar` (with autocomplete suggestions), `CatTag`, `PriceTag`,
`.section-head` (titled section w/ "more" link + slate underline), `FilterGroup`,
`ContactRow`, `ReviewLine`, card bodies (`.cb` margin-based stack — renderer-safe).

**Organisms** — `Header` (sticky), `Footer`, `NewsletterBand` ("The Limestone Letter"),
`NewsCard` / `EventCard` / `BusinessCard` (multiple variants: lead/grid/row/list),
`DirFilters` (the directory filter panel), `KMap` (stylized interactive map w/ pins).

## Key interaction patterns

- **Search autocomplete** unifies all three pillars: suggestions are News + Events +
  Businesses in one list, each routing to its detail page (`shell.jsx buildSuggestions`).
- **Map ⇄ list hover sync** in the directory: hovering a card highlights its map pin and
  vice-versa (`hovered` state shared between list and `KMap`).
- **Cross-link hover** (`.kf-cross`) highlights related items in article/detail rails.
- **Route transition** (`.kf-route` / `@keyframes kf-fade`) is **transform-only, never
  opacity** — a deliberate robustness choice so throttled/paused animation can't hide content.
- Card bodies use **margin-based stacking (`.cb`)**, not flex `gap`, for reliable
  render/print/export. (Worth carrying forward.)

## Responsive breakpoints

- **≤1100px:** news/biz grids → 2-col; article/detail layouts → single column; **directory
  map hides**, filters+list remain.
- **≤860px:** header collapses to hamburger + search drawer; hero/news → 1-col; directory
  becomes single column with a **list/map toggle** and a **slide-in filter drawer**
  (`.kf-dir-filters.is-open`); gallery reflows.
- **≤560px:** base font 16px; biz grid 1-col; event cards drop thumbnail; calendar cells
  collapse to dots; submit stepper labels hide.

## Theming hooks (from the tweaks panel)

Root-level overridable knobs the prototype exposes: accent color, **dark masthead**
(`dark` prop on Header/Footer), headline font, card style (`[data-cardstyle="shadow"]`),
corner radius, density. Useful to keep as design-system theming variables.
