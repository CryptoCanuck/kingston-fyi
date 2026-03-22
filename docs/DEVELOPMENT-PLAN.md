# CityFYI — Full Development Plan

> Incremental evolution from existing kingston-fyi codebase
> Target: Build → Validate → Loop until complete

---

## Infrastructure Summary

| Resource | Details |
|---|---|
| Docker Host | 16 cores, 128GB RAM, local |
| Ingress | Nginx Proxy Manager → SSL + domain routing |
| LLM (Real-time) | 5090 GPU rig, LM Studio (OpenAI-compatible API) |
| LLM (Batch) | gmktec 128GB RAM boxes, LM Studio (OpenAI-compatible API) |
| Domains | kingston.fyi, ottawa.fyi, toronto.fyi, vancouver.fyi, montreal.fyi |

## What Exists Today

- Next.js 14.2.15 (App Router, TypeScript)
- Supabase self-hosted (Postgres 15 + PostGIS + Auth + Storage + Kong)
- Redis 7 (caching)
- n8n (automation workflows)
- Cloudflare Tunnel (ingress — being replaced by NPM)
- 3 cities configured (kingston, ottawa, montreal)
- Places directory with categories, search (Postgres FTS), reviews, submissions
- Events system
- User auth (email/password), profiles, roles (user/business_owner/moderator/admin)
- RLS policies, PostGIS spatial queries, full Docker Compose stack

## What Needs to Be Built

- [ ] Swap Cloudflare Tunnel → Nginx Proxy Manager routing
- [ ] Add toronto + vancouver cities
- [ ] Upgrade Next.js 14 → 15
- [ ] Add Meilisearch (replace Postgres FTS)
- [ ] Add BullMQ workers (background job processing)
- [ ] Scraping pipeline (Scrapling + LM Studio enrichment)
- [ ] News aggregation system (RSS + scraping + AI summarization)
- [ ] Business claiming & verification portal
- [ ] AI-powered review moderation
- [ ] Business owner dashboard (edit listing, respond to reviews, analytics)
- [ ] Admin panel (multi-city ops, moderation, scraping monitor)
- [ ] SEO (JSON-LD, per-city sitemaps)

---

## Phase 1: Foundation Upgrade

**Goal:** Modernize the base, add new infrastructure services, expand to 5 cities.

### 1.1 — Remove Cloudflare Tunnel, configure for NPM

**Changes:**
- Remove `cloudflared` service from `docker/docker-compose.yml`
- Expose Next.js port 3000 to the Docker host network (or NPM's network)
- Update `NEXT_PUBLIC_SUPABASE_URL` and `API_EXTERNAL_URL` env vars to use the domain routed through NPM
- Update `SITE_URL` for Supabase Auth redirects

**Validate:**
- `docker compose up` starts without cloudflared
- Next.js accessible on host port 3000
- NPM can proxy to it and serve SSL

### 1.2 — Upgrade Next.js 14 → 15

**Changes:**
- Update `next` to `15.x` in `package.json`
- Update `react` and `react-dom` to `19.x`
- Update `eslint-config-next` to `15.x`
- Update `@types/react` and `@types/react-dom` for React 19
- Fix any breaking changes:
  - `headers()` is now async (already used as async in `lib/city.ts` — verify all call sites)
  - `cookies()` is now async
  - `params` and `searchParams` in page/layout props are now Promises
  - Review middleware for any Next.js 15 changes

**Validate:**
- `npm run build` succeeds with zero errors
- `npm run dev` serves pages correctly
- All existing routes render without errors
- Auth flow (sign-in, sign-up, callback) works

### 1.3 — Add Toronto & Vancouver cities

**Changes:**
- Add to `VALID_CITIES` in `middleware.ts`: `'toronto'`, `'vancouver'`
- Add city configs in `lib/city.ts` with colors/coordinates
- Add `INSERT` statements to `docker/supabase/init.sql` for toronto and vancouver
- Create SQL migration file `docker/supabase/migrations/001_add_cities.sql` for existing databases
- Update `lib/types.ts` `CityId` union type

**Validate:**
- Middleware resolves toronto.fyi → `toronto` and vancouver.fyi → `vancouver`
- City configs render correct theming
- Database has all 5 city records

### 1.4 — Add Meilisearch to Docker Compose

**Changes:**
- Add `meilisearch` service to `docker/docker-compose.yml`:
  ```yaml
  meilisearch:
    image: getmeili/meilisearch:v1.12
    container_name: meilisearch
    restart: unless-stopped
    volumes:
      - meilisearch-data:/meili_data
    environment:
      - MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
      - MEILI_ENV=production
    networks:
      - fyi-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:7700/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  ```
- Add `MEILI_MASTER_KEY` to `.env.example`
- Add `meilisearch-data` volume
- Create `lib/meilisearch.ts` — client setup, index creation, search helpers
- Add `meilisearch` npm package to `package.json`
- Create index initialization script: `scripts/init-meilisearch.ts`
  - Create `places` index with filterable attributes: `city_id`, `category_id`, `is_active`, `is_featured`, `rating`
  - Create `events` index with filterable attributes: `city_id`, `category_id`, `status`, `start_date`
  - Create `news` index (empty for now)
  - Set searchable attributes, ranking rules
- Add `MEILI_URL` and `MEILI_MASTER_KEY` env vars to Next.js service

**Validate:**
- Meilisearch container starts healthy
- Can create indexes and insert a test document via API
- `lib/meilisearch.ts` client connects successfully

### 1.5 — Add BullMQ worker infrastructure

**Changes:**
- Add `bullmq` npm package to `package.json`
- Create `workers/` directory at project root:
  - `workers/index.ts` — worker entry point, registers all queues
  - `workers/queues.ts` — queue definitions (scraping, enrichment, news, moderation, sync)
  - `workers/connection.ts` — shared Redis/BullMQ connection config
- Create `Dockerfile.worker` for the worker process (Node.js, runs `workers/index.ts`)
- Add `worker` service to `docker/docker-compose.yml`:
  ```yaml
  worker:
    build:
      context: ..
      dockerfile: docker/Dockerfile.worker
    container_name: fyi-worker
    restart: unless-stopped
    environment:
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - SUPABASE_URL=http://supabase-kong:8000
      - SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
      - MEILI_URL=http://meilisearch:7700
      - MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
      - LM_STUDIO_FAST_URL=${LM_STUDIO_FAST_URL}
      - LM_STUDIO_BATCH_URL=${LM_STUDIO_BATCH_URL}
    depends_on:
      redis:
        condition: service_healthy
      supabase-db:
        condition: service_healthy
    networks:
      - fyi-network
  ```
- Create `lib/queues.ts` — shared queue names + add-job helpers callable from Next.js API routes

**Validate:**
- Worker container starts and connects to Redis
- Can enqueue a test job from Next.js and see it processed by the worker
- BullMQ dashboard accessible (add bull-board or arena as optional dev service)

### 1.6 — Add LM Studio client

**Changes:**
- Add `openai` npm package to `package.json`
- Create `lib/ai.ts`:
  - `fastClient` — OpenAI client pointed at 5090 GPU rig LM Studio endpoint (`LM_STUDIO_FAST_URL`)
  - `batchClient` — OpenAI client pointed at gmktec LM Studio endpoint (`LM_STUDIO_BATCH_URL`)
  - Helper functions: `moderateReview(text)`, `enrichListing(data)`, `summarizeArticle(text)`, `classifyCategory(text)`, `generateEmbedding(text)`
- Add env vars: `LM_STUDIO_FAST_URL`, `LM_STUDIO_BATCH_URL`, `LM_STUDIO_EMBED_URL`
- Each helper specifies model via the `model` parameter in the OpenAI call (LM Studio uses this to select loaded model)

**Validate:**
- `fastClient` can send a test completion request to 5090 and get a response
- `batchClient` can send a test completion request to gmktec and get a response
- Embedding generation works

### 1.7 — Migrate search from Postgres FTS to Meilisearch

**Changes:**
- Update `app/api/search/route.ts` to query Meilisearch instead of Postgres `search_places()` function
- Update `app/api/places/route.ts` — if search query param provided, use Meilisearch
- Build Meilisearch sync: BullMQ job that listens for place/event changes and syncs to Meilisearch indexes
  - `workers/sync-meilisearch.ts` — processes sync jobs
- Create one-time sync script `scripts/sync-all-to-meilisearch.ts` — bulk imports all existing places/events
- Update search UI (`app/search/page.tsx`) to use instant search with Meilisearch
- Add faceted filtering UI: category, rating range, city (for cross-city search if desired)

**Validate:**
- Search returns results from Meilisearch with typo tolerance
- New/updated places automatically sync to Meilisearch via BullMQ
- Search latency < 50ms for typical queries
- Faceted filters work correctly

### Phase 1 Completion Criteria
- [ ] All 5 domains route correctly through NPM → Next.js → city-specific theming
- [ ] Next.js 15 + React 19 running with no build errors
- [ ] Meilisearch running with places/events indexed
- [ ] BullMQ worker processing jobs from Redis
- [ ] LM Studio clients can reach inference endpoints
- [ ] Search uses Meilisearch with faceted filtering

---

## Phase 2: Database Schema Evolution

**Goal:** Extend the existing schema to support all PRD features without breaking existing functionality.

### 2.1 — Add pgvector extension + embedding column

**Changes:**
- Migration SQL: `CREATE EXTENSION IF NOT EXISTS vector;`
- Add `embedding vector(768)` column to `places` table (for semantic dedup)
- Add `embedding vector(768)` column to future `news_articles` table
- Create HNSW index on embedding columns for fast similarity search

**Validate:**
- `SELECT * FROM pg_extension WHERE extname = 'vector';` returns a row
- Can insert and query vectors

### 2.2 — Add news tables

**Changes:**
- Create `news_sources` table:
  ```sql
  CREATE TABLE news_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id TEXT NOT NULL REFERENCES cities(id),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('rss', 'scrape')),
    scrape_config JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_fetched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```
- Create `news_articles` table:
  ```sql
  CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id TEXT NOT NULL REFERENCES cities(id),
    source_id UUID NOT NULL REFERENCES news_sources(id),
    title TEXT NOT NULL,
    summary TEXT,
    source_url TEXT NOT NULL UNIQUE,
    source_name TEXT NOT NULL,
    content TEXT,
    categories TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    sentiment TEXT,
    entities JSONB DEFAULT '{}',
    embedding vector(768),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```
- Add indexes, RLS policies, grants
- Add TypeScript types to `lib/types.ts`

**Validate:**
- Tables exist with correct schema
- RLS allows public read, admin write
- Types compile

### 2.3 — Add business claiming tables

**Changes:**
- Create `business_claims` table:
  ```sql
  CREATE TABLE business_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID NOT NULL REFERENCES places(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    verification_method TEXT NOT NULL CHECK (verification_method IN ('phone', 'email', 'document')),
    verification_code TEXT,
    evidence_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(place_id, user_id)
  );
  ```
- Create `business_updates` table (audit trail):
  ```sql
  CREATE TABLE business_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID NOT NULL REFERENCES places(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```
- Add `google_place_id TEXT` column to `places` table
- Add `source_metadata JSONB DEFAULT '{}'` column to `places` table
- Add `ai_enrichment JSONB DEFAULT '{}'` column to `places` table
- Add `claimed_by UUID REFERENCES profiles(id)` column to `places` table
- Add `status TEXT DEFAULT 'scraped' CHECK (status IN ('scraped', 'verified', 'claimed'))` column to `places` table
- Add indexes, RLS policies, grants
- Add TypeScript types

**Validate:**
- All tables and columns exist
- Claims are user-scoped (one claim per place per user)
- Audit trail captures changes

### 2.4 — Add review moderation fields

**Changes:**
- Add `moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged'))` to `reviews` table
- Add `sentiment_score NUMERIC(3,2)` to `reviews` table
- Add `moderation_metadata JSONB DEFAULT '{}'` to `reviews` table (AI reasoning)
- Create `review_responses` table:
  ```sql
  CREATE TABLE review_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(review_id)
  );
  ```
- Update reviews RLS: only show `moderation_status = 'approved'` reviews publicly
- Add TypeScript types

**Validate:**
- New columns exist
- Public queries only return approved reviews
- Business owners can insert review responses for places they own

### 2.5 — Add analytics event table

**Changes:**
- Create `analytics_events` table:
  ```sql
  CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id TEXT NOT NULL REFERENCES cities(id),
    event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'search', 'click', 'listing_view', 'review_submit')),
    place_id UUID REFERENCES places(id),
    search_query TEXT,
    metadata JSONB DEFAULT '{}',
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```
- Partition by month for performance (or use TimescaleDB extension if needed)
- Create index on `(city_id, event_type, created_at)`
- Create index on `(place_id, event_type, created_at)` for business analytics
- No RLS needed — server-side insert only via service role

**Validate:**
- Can insert analytics events
- Can query aggregates by place, city, date range

### Phase 2 Completion Criteria
- [ ] pgvector extension enabled, embedding columns exist
- [ ] news_sources and news_articles tables created with indexes + RLS
- [ ] business_claims and business_updates tables created
- [ ] places table extended with google_place_id, source_metadata, ai_enrichment, claimed_by, status
- [ ] reviews extended with moderation_status, sentiment_score; review_responses table created
- [ ] analytics_events table created and insertable
- [ ] All TypeScript types updated and compiling

---

## Phase 3: Scraping Pipeline

**Goal:** Build the automated business listing ingestion pipeline using Scrapling + LM Studio.

### 3.1 — Scrapling Python service

**Changes:**
- Create `scraper/` directory at project root:
  - `scraper/requirements.txt` — scrapling, httpx, pydantic, redis, psycopg2-binary
  - `scraper/Dockerfile` — Python 3.12 with Playwright browsers
  - `scraper/main.py` — FastAPI app exposing scraping endpoints (called by BullMQ workers)
  - `scraper/scrapers/google_maps.py` — Google Maps scraper using Scrapling
  - `scraper/scrapers/base.py` — Base scraper class
  - `scraper/models.py` — Pydantic models for scraped business data
  - `scraper/config.py` — City bounding boxes, category mappings
- Add `scraper` service to Docker Compose:
  ```yaml
  scraper:
    build:
      context: ./scraper
      dockerfile: Dockerfile
    container_name: fyi-scraper
    restart: unless-stopped
    environment:
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - DATABASE_URL=postgres://postgres:${POSTGRES_PASSWORD}@supabase-db:5432/postgres
    networks:
      - fyi-network
  ```

**Validate:**
- Scraper container starts and FastAPI health endpoint responds
- Can call scraper endpoint with a bounding box + category and get raw results back

### 3.2 — BullMQ scraping orchestration

**Changes:**
- Create `workers/scraping/` directory:
  - `workers/scraping/orchestrator.ts` — scheduled job that triggers scraping by city + category grid
  - `workers/scraping/extract.ts` — calls Scrapling service, receives raw data
  - `workers/scraping/transform.ts` — calls LM Studio for category normalization + description generation
  - `workers/scraping/dedupe.ts` — Google Place ID match + Levenshtein fuzzy match
  - `workers/scraping/load.ts` — upsert into Supabase + sync to Meilisearch
- Pipeline is chained: orchestrator → extract → transform → dedupe → load
- Each step is a separate BullMQ job for visibility and retry isolation
- Add cron schedule: weekly full scrape, daily delta per city

**Validate:**
- Trigger a manual scrape of one category in Kingston
- Raw data flows through all pipeline stages
- Listings appear in database and Meilisearch
- Duplicates are detected and merged
- Job history visible in BullMQ

### 3.3 — LM Studio enrichment integration

**Changes:**
- `workers/scraping/transform.ts` calls:
  - `batchClient.chat.completions.create()` with category normalization prompt → maps raw category to taxonomy
  - `batchClient.chat.completions.create()` with description generation prompt → generates SEO description
  - `batchClient.chat.completions.create()` with data validation prompt → validates phone/address format
- Results stored in `places.ai_enrichment` JSONB column
- Rate limiting via BullMQ concurrency settings (respect LM Studio throughput)

**Validate:**
- AI-generated descriptions are coherent and relevant
- Category mappings match existing taxonomy
- Enrichment metadata stored correctly
- Pipeline handles LM Studio timeouts/errors gracefully

### 3.4 — Admin scraping dashboard

**Changes:**
- Create `app/admin/` directory (protected by admin role check)
- Create `app/admin/scraping/page.tsx`:
  - Job history table: city, category, status, counts (new/updated/duplicate/error), duration
  - Manual trigger button per city/category
  - Error log viewer
- Create `app/api/admin/scraping/route.ts` — endpoints for job status, manual trigger
- BullMQ job results stored in Redis (use BullMQ's built-in job data)

**Validate:**
- Admin can view scraping job history
- Admin can trigger manual re-scrape
- Error details are visible and actionable

### Phase 3 Completion Criteria
- [ ] Scrapling service running in Docker, can scrape Google Maps
- [ ] Full pipeline: extract → transform → dedupe → load working end-to-end
- [ ] LM Studio enrichment producing quality descriptions and category mappings
- [ ] Meilisearch automatically synced with new/updated listings
- [ ] Admin dashboard shows job status and allows manual triggers
- [ ] Cron schedule configured for weekly full + daily delta

---

## Phase 4: News Aggregation

**Goal:** Automated local news ingestion from configurable sources with AI summarization.

### 4.1 — RSS ingestion worker

**Changes:**
- Add `rss-parser` npm package
- Create `workers/news/rss-ingest.ts`:
  - Fetches RSS feeds from active `news_sources` where `type = 'rss'`
  - Parses XML, extracts title, link, published date, content/description
  - Deduplicates by `source_url` (UNIQUE constraint)
  - Inserts raw articles into `news_articles`
  - Updates `news_sources.last_fetched_at`
- BullMQ cron: runs every 30 minutes

**Validate:**
- Add a test RSS feed (e.g., CBC Kingston) to `news_sources`
- Articles appear in `news_articles` after job runs
- Duplicate URLs are skipped

### 4.2 — Scrapling news scraper

**Changes:**
- Add scraper endpoint in `scraper/scrapers/news.py`:
  - Takes a URL + CSS selectors (from `news_sources.scrape_config`)
  - Returns extracted article data
- Create `workers/news/scrape-ingest.ts`:
  - For `news_sources` where `type = 'scrape'`, calls Scrapling service
  - Inserts articles same as RSS worker

**Validate:**
- Configure a non-RSS local news site
- Articles scraped and inserted correctly

### 4.3 — AI news enrichment

**Changes:**
- Create `workers/news/enrich.ts`:
  - After article insert, enqueue enrichment job
  - LM Studio batch client:
    - Summarize article (2-3 sentences) → `news_articles.summary`
    - Categorize (business, politics, events, development, sports, community) → `news_articles.categories`
    - Extract entities (businesses, locations, people) → `news_articles.entities`
  - Generate embedding via LM Studio embedding endpoint → `news_articles.embedding`
- Semantic dedup: after embedding, check pgvector cosine similarity > 0.92 against recent articles in same city → mark as duplicate or merge

**Validate:**
- Summaries are concise and accurate
- Categories are relevant
- Same story from two sources correctly deduplicated
- Entities extracted include business names that exist in places table

### 4.4 — News public pages

**Changes:**
- Create `app/news/page.tsx` — city news feed:
  - List of articles with AI summary, source attribution, published date, category badges
  - Category filter tabs
  - Date range filter
  - Pagination
- Create `app/news/[slug]/page.tsx` — article detail:
  - Full summary, source link (opens original), related businesses (from entity extraction → places lookup), related articles (pgvector similarity)
- Auto-link: when `news_articles.entities` contains a business name that matches a place, render as clickable link to place page

**Validate:**
- kingston.fyi/news shows Kingston news articles
- Category filters work
- Business names in articles link to their listing pages
- Source attribution and link-through present

### 4.5 — Admin news source management

**Changes:**
- Create `app/admin/news/page.tsx`:
  - CRUD for `news_sources` per city
  - Toggle active/inactive
  - Last fetched timestamp
  - Test fetch button (runs one-off ingest)
  - For scrape-type sources: configure CSS selectors

**Validate:**
- Admin can add/edit/remove news sources
- Test fetch returns articles
- Inactive sources are skipped by workers

### Phase 4 Completion Criteria
- [ ] RSS and scrape-based news ingestion running on schedule
- [ ] AI summaries, categories, and entity extraction working
- [ ] Semantic deduplication catching cross-source duplicates
- [ ] Public news feed with filters and business auto-linking
- [ ] Admin panel for managing news sources per city

---

## Phase 5: Business Claiming & Portal

**Goal:** Self-service portal for business owners to claim, verify, and manage their listings.

### 5.1 — Claiming flow

**Changes:**
- Add "Claim This Business" button on place detail page (`app/places/[category]/[slug]/page.tsx`)
  - Only shows if `places.claimed_by IS NULL`
  - Requires authentication (redirect to sign-in if not logged in)
- Create `app/claim/[placeId]/page.tsx`:
  - Step 1: Confirm business identity
  - Step 2: Select verification method (phone, email, document)
  - Step 3: Complete verification
- Create `app/api/claims/route.ts`:
  - POST: create claim, trigger verification
  - GET: check claim status
- Phone verification: generate 6-digit code, store in `business_claims.verification_code`, send via BullMQ job (Twilio or similar — placeholder for now, can use email as fallback)
- Email verification: send magic link to `owner@businessdomain.com`
- Document: upload to Supabase Storage, set status to pending admin review
- Auto-approve phone/email claims on successful verification → update `places.claimed_by` and `places.status = 'claimed'`

**Validate:**
- User can find their business and initiate a claim
- Email verification flow works end-to-end
- Document upload stores file and creates pending claim
- Approved claim updates place ownership

### 5.2 — Business owner dashboard

**Changes:**
- Create `app/dashboard/page.tsx` — business owner landing:
  - List of claimed businesses
  - Quick stats per business (views, searches, reviews)
- Create `app/dashboard/[placeId]/page.tsx` — single business management:
  - **Edit tab**: name, description, hours, photos, categories, contact info, social links
  - **Reviews tab**: list of reviews with "Respond" button
  - **Analytics tab**: views over time, top search terms, click-throughs
- Create `app/api/dashboard/[placeId]/route.ts`:
  - GET: business data (owner-only, check `claimed_by = auth.uid()`)
  - PATCH: update business fields, create `business_updates` audit trail entry
- Photo management: upload to Supabase Storage, manage gallery order

**Validate:**
- Business owner sees only their claimed businesses
- Edits are reflected on public listing immediately
- All edits logged in `business_updates`
- Photo upload and gallery management works

### 5.3 — Review responses

**Changes:**
- Add "Respond" action on reviews in dashboard
- Create `app/api/reviews/[reviewId]/response/route.ts`:
  - POST: insert into `review_responses` (only allowed if user owns the business)
- Display responses on public place page below each review

**Validate:**
- Owner can respond to reviews from dashboard
- Response appears on public listing
- Only one response per review

### 5.4 — Notifications

**Changes:**
- Create `notifications` table:
  ```sql
  CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    type TEXT NOT NULL CHECK (type IN ('new_review', 'claim_status', 'news_mention', 'admin_edit')),
    title TEXT NOT NULL,
    body TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```
- BullMQ notification worker: dispatches email + creates in-app notification record
- Triggers: new review on owned business, claim approved/rejected, business mentioned in news
- Create `app/api/notifications/route.ts` — list + mark as read
- Add notification bell icon in header for authenticated users

**Validate:**
- New review triggers notification to business owner
- Claim status change triggers notification
- Notification list shows unread count

### Phase 5 Completion Criteria
- [ ] Business claiming flow works (email + document verification at minimum)
- [ ] Business owner dashboard: edit listing, manage photos, view analytics
- [ ] Review response functionality working
- [ ] Notification system delivering alerts for key events
- [ ] Full audit trail on all business edits

---

## Phase 6: AI Review Moderation

**Goal:** Automated review screening with AI, with admin oversight.

### 6.1 — Moderation pipeline

**Changes:**
- Create `workers/moderation/review.ts`:
  - On new review insert, enqueue moderation job
  - Call LM Studio fast client (5090):
    - Classify: spam, offensive, likely-fake, clean
    - Score sentiment: positive/negative/neutral (0-1)
  - If clean: set `moderation_status = 'approved'`
  - If flagged: set `moderation_status = 'flagged'`, store reasoning in `moderation_metadata`
- Update review submission API to set initial `moderation_status = 'pending'`
- Update public review display to only show `approved` reviews

**Validate:**
- Submit a clean review → appears within seconds
- Submit spam/offensive content → flagged, not visible publicly
- Sentiment scores stored correctly

### 6.2 — Admin moderation queue

**Changes:**
- Create `app/admin/moderation/page.tsx`:
  - List of flagged reviews with AI reasoning
  - Approve / Reject / Edit actions
  - Moderation stats: total reviewed, auto-approved rate, false positive rate
- Create `app/api/admin/moderation/route.ts`:
  - GET: list pending/flagged reviews
  - PATCH: approve/reject with admin notes

**Validate:**
- Flagged reviews appear in admin queue
- Admin can approve/reject efficiently
- Approved reviews become visible on public listings

### Phase 6 Completion Criteria
- [ ] AI moderation runs on every new review
- [ ] Clean reviews auto-approved, questionable ones flagged
- [ ] Admin moderation queue functional
- [ ] Moderation accuracy > 90% on test set

---

## Phase 7: Admin Panel

**Goal:** Comprehensive admin interface for managing multi-city operations.

### 7.1 — Admin layout & dashboard

**Changes:**
- Create `app/admin/layout.tsx` — admin layout with sidebar nav:
  - Dashboard, Cities, Listings, Users, Claims, News, Moderation, Scraping, Analytics
  - Role check: redirect non-admins
- Create `app/admin/page.tsx` — KPI dashboard:
  - Total listings, reviews, claims, users per city
  - Scraping job health
  - Recent activity feed

**Validate:**
- Only admin users can access /admin
- KPIs display real data

### 7.2 — City management

**Changes:**
- Create `app/admin/cities/page.tsx`:
  - List all cities with status
  - Add new city form: name, slug, domain, province, bounding box, theme config (colors, hero image, logo)
  - Edit existing city config
- Create `app/api/admin/cities/route.ts`

**Validate:**
- Admin can add a new city record
- New city appears in middleware routing (after app restart or with dynamic config reload)

### 7.3 — Listing management

**Changes:**
- Create `app/admin/listings/page.tsx`:
  - Searchable, filterable table of all places across cities
  - Bulk actions: approve, reject, merge duplicates, trigger re-scrape
  - Inline edit for quick fixes
- Create `app/api/admin/listings/route.ts`

**Validate:**
- Admin can search/filter across all cities
- Bulk actions work
- Merge duplicate flow correctly consolidates records

### 7.4 — User management

**Changes:**
- Create `app/admin/users/page.tsx`:
  - User list with role badges
  - Change role: admin, moderator, city-manager, business_owner, user
  - View user's claims and reviews
- Create `app/api/admin/users/route.ts`

**Validate:**
- Admin can view and change user roles
- Role changes take effect immediately

### 7.5 — Claims review queue

**Changes:**
- Create `app/admin/claims/page.tsx`:
  - List of pending document-based claims
  - Evidence viewer (opens Supabase Storage file)
  - Approve / Reject / Request more info actions
- Create `app/api/admin/claims/route.ts`

**Validate:**
- Admin can process claims efficiently
- Approval updates place ownership and sends notification

### 7.6 — Analytics dashboard

**Changes:**
- Create `app/admin/analytics/page.tsx`:
  - Traffic by city (from `analytics_events` table)
  - Top searched terms
  - Review volume trends
  - Listing growth over time
- Server-side analytics tracking: add middleware or API-level event logging for page views and searches

**Validate:**
- Charts render real data
- Analytics events being captured

### Phase 7 Completion Criteria
- [ ] Admin panel with all sections accessible
- [ ] City CRUD working
- [ ] Listing management with bulk actions
- [ ] User role management
- [ ] Claims review queue
- [ ] Analytics dashboard with real data

---

## Phase 8: SEO & Polish

**Goal:** Production-ready SEO, performance, and mobile polish.

### 8.1 — Structured data

**Changes:**
- Add JSON-LD `LocalBusiness` schema to place detail pages
- Add JSON-LD `Event` schema to event detail pages
- Add JSON-LD `WebSite` and `Organization` schema to layout
- Add `BreadcrumbList` schema to category and detail pages

**Validate:**
- Google Rich Results Test passes for place and event pages

### 8.2 — Per-city sitemaps

**Changes:**
- Create `app/sitemap.ts` — dynamic sitemap generation:
  - Per-city sitemap index
  - Place URLs, event URLs, news URLs, category pages
  - Canonical URLs use the correct domain per city
- Create `app/robots.ts` — per-domain robots.txt

**Validate:**
- `kingston.fyi/sitemap.xml` contains Kingston URLs with kingston.fyi domain
- `toronto.fyi/sitemap.xml` contains Toronto URLs with toronto.fyi domain

### 8.3 — Performance optimization

**Changes:**
- Enable ISR on listing pages with on-demand revalidation when listings are edited
- Optimize images: use Next.js Image component, configure remote patterns for Supabase Storage
- Add Redis caching for frequently accessed data (city configs, category lists, featured listings)
- Review and optimize database queries (EXPLAIN ANALYZE on hot paths)

**Validate:**
- Lighthouse score > 90 on all core pages
- LCP < 2.5s
- Search responses < 100ms

### 8.4 — Mobile polish

**Changes:**
- Audit all pages on mobile viewport
- Fix any layout issues, touch targets, font sizes
- Ensure hamburger menu, search, and all interactions work on mobile
- Test business owner dashboard on mobile

**Validate:**
- All pages usable on 375px viewport
- Touch targets ≥ 44px

### Phase 8 Completion Criteria
- [ ] JSON-LD structured data on all place and event pages
- [ ] Per-city sitemaps with correct canonical URLs
- [ ] Lighthouse > 90 on core pages
- [ ] LCP < 2.5s
- [ ] Mobile-friendly across all pages

---

## Execution Strategy: Build → Validate → Loop

Each phase follows this pattern:

1. **Read** — I read the relevant existing code to understand current state
2. **Build** — I implement the changes (create files, edit existing code, write migrations)
3. **Validate** — I run the build (`npm run build`), type-check (`npm run type-check`), lint (`npm run lint`), and verify Docker services start
4. **Fix** — If validation fails, I fix errors and re-validate
5. **Confirm** — I report what was done and confirm with you before moving to the next step

For infrastructure changes (Docker Compose, database migrations), I'll build the configs and scripts but you'll need to run `docker compose up` on your local machine to validate the services actually start. I can validate the code compiles and configs are syntactically correct.

**Parallelizable work:**
- Phase 1.4 (Meilisearch) and 1.5 (BullMQ) can be built in parallel
- Phase 2 (schema) substeps are independent
- Phase 4 (news) can run in parallel with Phase 5 (claiming) after Phase 3
- Phase 6 (moderation) and Phase 7 (admin) can partially overlap

**Estimated scope:** ~150-200 files created/modified across all phases.

---

## Quick Reference: New Services Added to Docker Compose

| Service | Image | Port | Purpose |
|---|---|---|---|
| meilisearch | getmeili/meilisearch:v1.12 | 7700 | Full-text search |
| worker | custom (Node.js) | — | BullMQ job processing |
| scraper | custom (Python + Playwright) | 8001 | Scrapling web scraping |

Services removed: `cloudflared`

Services kept as-is: `nextjs`, `supabase-db`, `supabase-auth`, `supabase-rest`, `supabase-storage`, `supabase-kong`, `supabase-meta`, `redis`, `n8n`
