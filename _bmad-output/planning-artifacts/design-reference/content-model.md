# Kingston.FYI — Content / Data Model (extracted from prototype)

Reverse-engineered from `prototype/data.js`. This is the **implicit data model** the
design assumes — the concrete expression of the brief's "unified graph, not three apps."
It is the highest-value input for the **PRD data requirements** and **architecture**.
Field names are the prototype's; real schema (Payload collections + Postgres tables)
will formalize and extend these.

## Entities

### Article (News)
| Field | Type | Notes |
|---|---|---|
| `id` | id | |
| `cat` | enum → NewsCategory | one of the 6 news categories |
| `title`, `dek` | text | headline + standfirst |
| `author` | text (→ Author later) | byline |
| `date`, `read` | text | publish date, read-time estimate |
| `ph` | placeholder hue | → real hero image |
| `relatedEvents[]` | **→ Event** | cross-link |
| `relatedBiz[]` | **→ Business** | cross-link (mentioned businesses) |

### Event
| Field | Type | Notes |
|---|---|---|
| `id` | id | |
| `cat` | enum → EventCategory | Music/Food/Family/Arts/Sports |
| `title`, `blurb` | text | |
| `date`, `time` | text | display strings (real model needs start/end datetimes) |
| `bucket` | enum | `today \| weekend \| nextweek \| month` (derived in real build) |
| `day` | int | calendar-grid day number |
| `venue` | text | venue name (string today) |
| `hood` | enum → Neighbourhood | |
| `price`, `free` | text + bool | |
| `ph` | placeholder hue | |
| `bizId` | **→ Business (nullable)** | the venue as a directory listing — the key event↔directory link |
| `relatedNews[]` | **→ Article** | cross-link |

### Business (Directory listing)
| Field | Type | Notes |
|---|---|---|
| `id` | id | |
| `name`, `blurb` | text | |
| `cat` | text → Category (leaf) | e.g. "Coffee Shop", "Bookstore" |
| `parentCat` | text → Category (parent) | e.g. "Food & Drink" — **hierarchical taxonomy** |
| `rating`, `reviews` | number, count | aggregate (see governance note) |
| `price` | enum | `$ \| $$ \| $$$` |
| `hood` | enum → Neighbourhood | |
| `openNow` | bool | derived from hours in real build |
| `hours` | text | (real model needs structured hours) |
| `address`, `phone`, `web` | text | contact |
| `tags[]` | text[] | amenities ("Patio", "Wheelchair access", …) |
| `x`, `y` | number | map coords (→ PostGIS lat/lng + geometry) |
| `ph` | placeholder hue | → photo gallery |
| `events[]` | **→ Event** | cross-link (events hosted at this venue) |

### Review
`id`, `name` (author), `rating` (1–5), `date`, `text`. Belongs to a Business.
Detail page also shows a **rating histogram** (5★→1★ distribution).

## Taxonomies (shared across pillars)

- **NewsCategory** (6, each with a `--tag-*` color): Local, Politics, Business, Sports,
  Arts & Culture, Opinion.
- **EventCategory** (5): Music, Food, Family, Arts, Sports.
- **Business category** — **two-level hierarchy** (`parentCat` → `cat`). Parents seen:
  Food & Drink, Shopping, Recreation, Arts & Culture, Services.
- **Neighbourhood** (8, shared by events + businesses): Downtown, Williamsville,
  Portsmouth, Sydenham, Inner Harbour, Kingscourt, Reddendale, Cataraqui.

## The cross-link graph (the defining feature)

```
        relatedBiz[]            events[] / bizId
Article ──────────────► Business ◄──────────────► Event
   │  ▲                    ▲                          │
   │  │ relatedNews[]      │ bizId (venue)            │
   │  └────────────────────┼──────────────────────────┘
   └───── relatedEvents[] ─┘     relatedNews[]

Shared taxonomies (Neighbourhood, categories) tie all three together as facets.
```

Concretely in the data:
- **Article → Event + Business:** `n1` links event `e2` and business `b3`.
- **Event → Business (venue) + Article:** `e2.bizId = b3`, `e2.relatedNews = [n1]`.
- **Business → Events:** `b4` (Market Square Creamery) hosts `e3`, `e7`.
- **Bidirectional consistency** is maintained by hand in the prototype (real build should
  enforce it via relations / derive reverse links).

## Modeling implications for PRD & architecture

- These are **3 first-class collections + Review + shared taxonomy collections**
  (Neighbourhood, NewsCategory, EventCategory, BusinessCategory-hierarchical), wired with
  **relational joins** (matches the locked "single Postgres, cross-linking = joins" decision).
- **Geospatial:** `x/y` → real lat/lng with **PostGIS** for radius / near-me / map-bounds
  (Directory sort includes "Distance").
- **Derived fields** to formalize: `openNow` (from structured hours), event `bucket`
  (from start datetime relative to now), business `rating`/`reviews` (from approved reviews
  only — see review-moderation finding in the original kickoff).
- **Aggregate rating governance:** ratings are shown on listings, but the kickoff guardrail
  says **do NOT emit self-serving `aggregateRating` JSON-LD** on LocalBusiness. Keep the UI
  rating; exclude it from structured data.
- **Moderation:** user-submitted Businesses/Events need `status: pending → approved →
  published`; the prototype's Submit flow already states "reviewed before it goes live."
- **Structured data targets** (from kickoff, to design into the model): Article→NewsArticle,
  Event→Event, Business→most-specific LocalBusiness subtype, site-wide Organization +
  BreadcrumbList.
