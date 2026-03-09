# FYI Multi-City Architecture

## System Overview

The FYI Multi-City platform is a self-hosted, containerized application that serves multiple city-specific directory sites from a single codebase.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare Edge                              │
│  - DNS Resolution                                                │
│  - DDoS Protection                                               │
│  - SSL/TLS Termination                                          │
│  - Global CDN                                                    │
└─────────────────────────────────────────────────────────────────┘
                               │
                        (Encrypted Tunnel)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Homelab Infrastructure                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Docker Network                          │  │
│  │                    (fyi-network)                           │  │
│  │                                                            │  │
│  │  ┌─────────────┐                                          │  │
│  │  │  cloudflared │  ← Cloudflare Tunnel Client              │  │
│  │  └──────┬──────┘                                          │  │
│  │         │                                                  │  │
│  │         ▼                                                  │  │
│  │  ┌─────────────┐     ┌─────────────────────┐             │  │
│  │  │   Next.js   │     │   Redis Cache       │             │  │
│  │  │   :3000     │←────│   :6379             │             │  │
│  │  │             │     └─────────────────────┘             │  │
│  │  │ - Domain    │                                          │  │
│  │  │   Detection │                                          │  │
│  │  │ - SSR/ISR   │                                          │  │
│  │  │ - API Routes│                                          │  │
│  │  └──────┬──────┘                                          │  │
│  │         │                                                  │  │
│  │         ▼                                                  │  │
│  │  ┌─────────────────────────────────────────┐             │  │
│  │  │          Supabase Stack                   │             │  │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  │             │  │
│  │  │  │  Kong   │  │  Auth   │  │ Storage │  │             │  │
│  │  │  │  :8000  │  │  :9999  │  │  :5000  │  │             │  │
│  │  │  └────┬────┘  └────┬────┘  └────┬────┘  │             │  │
│  │  │       │            │            │        │             │  │
│  │  │       └────────────┴────────────┘        │             │  │
│  │  │                    │                      │             │  │
│  │  │                    ▼                      │             │  │
│  │  │            ┌─────────────┐               │             │  │
│  │  │            │  PostgreSQL │               │             │  │
│  │  │            │  + PostGIS  │               │             │  │
│  │  │            │    :5432    │               │             │  │
│  │  │            └─────────────┘               │             │  │
│  │  └─────────────────────────────────────────┘             │  │
│  │                                                            │  │
│  │  ┌─────────────┐                                          │  │
│  │  │     n8n     │  ← Automation/Workflows                  │  │
│  │  │    :5678    │                                          │  │
│  │  └─────────────┘                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. User Request
```
User types: kingston.fyi
```

### 2. DNS Resolution (Cloudflare)
```
kingston.fyi → CNAME → <tunnel-id>.cfargotunnel.com
```

### 3. Cloudflare Tunnel
```
Request encrypted and sent through tunnel to cloudflared container
```

### 4. Domain Detection (Next.js Middleware)
```typescript
// middleware.ts
const host = request.headers.get('host')
// kingston.fyi → city = 'kingston'
// ottawa.fyi → city = 'ottawa'
// montreal.fyi → city = 'montreal'
response.headers.set('x-city', city)
```

### 5. Page Rendering
```typescript
// app/page.tsx
const city = headers().get('x-city')
// Render city-specific content
```

## Service Architecture

### Core Services

| Service | Image | Purpose | Port |
|---------|-------|---------|------|
| cloudflared | cloudflare/cloudflared | Tunnel client | - |
| nextjs | Custom build | Web application | 3000 |
| supabase-db | supabase/postgres:15 | Database + PostGIS | 5432 |
| supabase-auth | supabase/gotrue | Authentication | 9999 |
| supabase-rest | postgrest/postgrest | REST API | 3000 |
| supabase-storage | supabase/storage-api | File storage | 5000 |
| supabase-kong | kong:2.8.1 | API gateway | 8000 |
| redis | redis:7-alpine | Cache layer | 6379 |
| n8n | n8nio/n8n | Automation | 5678 |

### Development-Only Services

| Service | Purpose | Port |
|---------|---------|------|
| supabase-studio | Database management UI | 3001 |
| inbucket | Email testing | 9000, 2500 |

## Data Flow

### Write Path
```
Client → Next.js API → Supabase Kong → PostgREST → PostgreSQL
```

### Read Path (Cached)
```
Client → Next.js → Redis Cache (hit) → Response
```

### Read Path (Cache Miss)
```
Client → Next.js → Redis Cache (miss) → Supabase → PostgreSQL → Redis → Response
```

## Security Model

### Network Isolation
- All services on internal Docker network
- No ports exposed to host (production)
- Only cloudflared communicates externally

### Authentication
- JWT-based via Supabase Auth
- ANON_KEY: Client-side (public, RLS enforced)
- SERVICE_ROLE_KEY: Server-side only (bypasses RLS)

### Data Access
- Row Level Security (RLS) on all tables
- Multi-tenant by city_id
- Business owner access control

## Multi-Tenancy Strategy

### Domain-Based Routing
```typescript
// Middleware extracts city from hostname
kingston.fyi → x-city: kingston
ottawa.fyi → x-city: ottawa
montreal.fyi → x-city: montreal
```

### Database Schema (Future)
```sql
-- All tables include city_id
CREATE TABLE places (
  id UUID PRIMARY KEY,
  city_id TEXT NOT NULL,  -- 'kingston', 'ottawa', 'montreal'
  name TEXT,
  -- ...
);

-- RLS Policy
CREATE POLICY city_isolation ON places
  USING (city_id = current_setting('app.current_city'));
```

## Scalability Considerations

### Current Phase (Single Server)
- All services on one Docker host
- Suitable for moderate traffic
- Easy to manage and deploy

### Future Scaling Options

1. **Horizontal Pod Scaling**
   - Multiple Next.js containers
   - Load balancing via Cloudflare

2. **Database Scaling**
   - Read replicas
   - Connection pooling (PgBouncer)

3. **Cache Scaling**
   - Redis cluster
   - City-specific cache keys

4. **Storage Scaling**
   - Object storage (S3-compatible)
   - CDN for static assets

## Monitoring Points

### Health Checks
- `/api/health` - Next.js application
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- n8n: `/healthz`
- All services have Docker health checks

### Key Metrics to Monitor
- Request latency per city
- Database query times
- Cache hit rates
- Tunnel connection status
- Container resource usage

## Disaster Recovery

### Data Persistence
- PostgreSQL: Named volume (fyi-supabase-db-data)
- Redis: Named volume (fyi-redis-data)
- Storage: Named volume (fyi-supabase-storage-data)
- n8n: Named volume (fyi-n8n-data)

### Backup Strategy (Future)
- Automated PostgreSQL backups
- Volume snapshots
- Off-site replication

## Technology Justifications

### Next.js 14+ (App Router)
- Server-side rendering for SEO
- TypeScript for type safety
- Middleware for domain detection
- Standalone build for Docker optimization

### Supabase (Self-Hosted)
- Full control over data
- PostgreSQL reliability
- Built-in auth solution
- No vendor lock-in
- PostGIS for geospatial queries

### Cloudflare Tunnel
- No open firewall ports
- DDoS protection included
- Free SSL certificates
- Global edge network
- Zero Trust security model

### Docker Compose
- Simple orchestration
- Easy local development
- Portable deployments
- Service dependencies managed
- Suitable for single-server deployment

### Redis
- Fast session storage
- Query result caching
- Rate limiting support
- Pub/sub for real-time features

### n8n
- Visual workflow builder
- Self-hosted automation
- Web scraping capabilities
- API integrations
- Scheduled tasks

## Future Architecture Considerations

### Phase 2+
- GraphQL layer (optional)
- Real-time subscriptions
- Image optimization pipeline
- Search indexing (Elasticsearch/Meilisearch)
- Analytics pipeline

### Production Hardening
- Secrets management (Vault)
- Log aggregation (ELK/Loki)
- Metrics (Prometheus/Grafana)
- Alerting
- Automated backups
