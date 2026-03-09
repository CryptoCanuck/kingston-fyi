# FYI Multi-City Directory Platform

A self-hosted, multi-city local directory platform running on Docker with Cloudflare Tunnel for secure ingress. One codebase serves multiple city domains (kingston.fyi, ottawa.fyi, montreal.fyi).

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git
- OpenSSL (for secret generation)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd fyi-multi-city
```

### 2. Generate Secrets

```bash
./scripts/generate-secrets.sh
```

This automatically generates:
- PostgreSQL password
- JWT secret
- Supabase API keys (anon and service_role)

### 3. Start Development Stack

```bash
./scripts/start-dev.sh
```

### 4. Access Services

- **Next.js App**: http://localhost:3000
- **Supabase Studio**: http://localhost:3001
- **Supabase API**: http://localhost:8000
- **n8n Workflows**: http://localhost:5678
- **Email Testing**: http://localhost:9000

## Features

- **Multi-Domain Routing**: Single codebase serves multiple city domains
- **Self-Hosted**: Everything runs in Docker on your infrastructure
- **Secure Ingress**: Cloudflare Tunnel (no exposed ports)
- **Modern Stack**: Next.js 14+, TypeScript, Supabase, Redis
- **Automation Ready**: n8n for workflows and scraping
- **PostGIS**: Geospatial queries for location-based features

## Architecture

```
User → Cloudflare → Cloudflare Tunnel
  → cloudflared container
    → Next.js (domain detection)
      → Supabase Stack
        → PostgreSQL + PostGIS
        → Redis Cache
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/health/         # Health check endpoint
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage (city-aware)
├── docker/                 # Docker configuration
│   ├── cloudflared/        # Cloudflare Tunnel config
│   ├── supabase/           # Supabase configuration
│   ├── docker-compose.yml  # Production
│   └── docker-compose.dev.yml # Development
├── docs/                   # Documentation
├── scripts/                # Automation scripts
└── middleware.ts           # Domain detection
```

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Cloudflare Setup](docs/CLOUDFLARE_SETUP.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Scripts

| Script | Purpose |
|--------|---------|
| `./scripts/generate-secrets.sh` | Generate all required secrets |
| `./scripts/start-dev.sh` | Start development environment |
| `./scripts/start-prod.sh` | Start production with Cloudflare Tunnel |
| `./scripts/stop.sh` | Stop all services |
| `./scripts/logs.sh [service]` | View service logs |

## Production Deployment

1. Set up Cloudflare Tunnel (see [Cloudflare Setup](docs/CLOUDFLARE_SETUP.md))
2. Add `TUNNEL_TOKEN` to `docker/.env`
3. Run `./scripts/start-prod.sh`

## Tech Stack

- **Frontend/Backend**: Next.js 14+ (App Router, TypeScript)
- **Database**: Supabase (self-hosted PostgreSQL 15 + PostGIS)
- **Auth**: Supabase Auth (GoTrue)
- **Cache**: Redis 7
- **Automation**: n8n
- **Ingress**: Cloudflare Tunnel
- **Orchestration**: Docker Compose

## Phase 1 Status

This is Phase 1 (Infrastructure) of the FYI Multi-City platform:

- [x] Next.js application with domain detection
- [x] Docker Compose orchestration
- [x] Supabase self-hosted stack
- [x] Cloudflare Tunnel configuration
- [x] Startup automation scripts
- [x] Documentation

Next phases will add:
- Database schema for directory data
- User authentication flows
- Business listings and reviews
- News aggregation
- Maps integration

## Contributing

1. Fork the repository
2. Create feature branch
3. Run `./scripts/start-dev.sh` for development
4. Make changes (hot reload enabled)
5. Submit pull request

## License

[Add your license here]

---

Built with the BMad Method
