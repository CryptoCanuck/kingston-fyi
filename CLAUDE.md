# CityFYI — Claude Code Instructions

## Git Commits

- **NEVER include Co-Authored-By lines referencing Claude, Anthropic, or any AI assistant**
- **NEVER mention Claude, AI, or Anthropic anywhere in commit messages**
- All commits should appear as solely authored by the repository owner (CryptoCanuck)
- Follow existing commit message style: short imperative summary, bullet points for details

## Project Overview

Multi-domain Canadian city business directory platform. Single Next.js 15 codebase serving 5 `.fyi` domains (kingston, ottawa, montreal, toronto, vancouver).

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Database:** Self-hosted Supabase (PostgreSQL 15 + PostGIS + pgvector)
- **Search:** Meilisearch (self-hosted)
- **Cache/Queue:** Redis + BullMQ
- **Scraping:** Python FastAPI service with Scrapling/Playwright
- **AI Inference:** LM Studio (OpenAI-compatible API on local GPU hardware)
- **Styling:** Tailwind CSS with CSS custom properties for city theming
- **Deployment:** Docker Compose, Nginx Proxy Manager for SSL/routing

## Key Architecture Decisions

- No Prisma — using Supabase client + raw SQL (PostGIS support in Prisma is poor)
- No LiteLLM — calling LM Studio directly via OpenAI SDK
- No Cloudflare Tunnel — using Nginx Proxy Manager
- City detection via Next.js middleware extracting hostname
- RLS policies do NOT use city_context for SELECT — filtering done in application queries

## Development

- Run dev server from local C: drive, not network shares (Watchpack crashes on SMB)
- Docker services run from `docker/docker-compose.dev.yml`
- `.env.local` at project root for Next.js, `docker/.env` for Docker services
- JWT keys must be generated with Node.js crypto (not openssl — different HMAC output)
- Kong config requires pre-resolved keys (kong-resolved.yml) due to Docker Desktop Windows file mount issues

## Code Review Findings (to address)

See the code review findings for critical and important issues that should be fixed before production deployment. Key items:
- Redis connection inconsistency between API routes and workers
- `approve_business_claim` SQL function needs authorization check
- AI functions need JSON parse error handling
- Review rating trigger should only count approved reviews
- Reviews API should filter by moderation_status
