# Development Guide

Complete guide for local development of the FYI Multi-City Platform.

## Getting Started

### Prerequisites

- **Docker Desktop** or Docker Engine + Docker Compose
- **Node.js 20+** (for local development without Docker)
- **Git**
- **OpenSSL** (for secret generation)

### Initial Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd fyi-multi-city
```

2. **Generate secrets**
```bash
./scripts/generate-secrets.sh
```

This creates `docker/.env` with:
- PostgreSQL password
- JWT secrets
- Supabase API keys

3. **Start development stack**
```bash
./scripts/start-dev.sh
```

First run takes 5-10 minutes to download images and initialize databases.

## Development URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Next.js App | http://localhost:3000 | Main application |
| Supabase Studio | http://localhost:3001 | Database management |
| Supabase API | http://localhost:8000 | REST API |
| n8n | http://localhost:5678 | Automation workflows |
| Inbucket | http://localhost:9000 | Email testing |
| PostgreSQL | localhost:5432 | Database (direct access) |
| Redis | localhost:6379 | Cache (direct access) |

## Hot Reload

Next.js development mode includes hot reload. Edit files in `/app` and changes appear instantly.

Supported changes:
- React components
- Pages and layouts
- API routes
- CSS/styles
- TypeScript types

Files watched:
- `app/**/*`
- `middleware.ts`
- `next.config.js`
- `tsconfig.json`

## Testing Multi-Domain Routing

### Method 1: /etc/hosts (Recommended)

Edit your hosts file:

**macOS/Linux:**
```bash
sudo nano /etc/hosts
```

**Windows:**
```
C:\Windows\System32\drivers\etc\hosts
```

Add:
```
127.0.0.1 kingston.fyi
127.0.0.1 ottawa.fyi
127.0.0.1 montreal.fyi
```

Then visit:
- http://kingston.fyi:3000
- http://ottawa.fyi:3000
- http://montreal.fyi:3000

### Method 2: Custom Headers

```bash
curl -H "Host: ottawa.fyi" http://localhost:3000
```

### Method 3: Browser Extension

Use ModHeader or similar to set `Host` header.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── health/        # Health check endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── docker/                # Docker configuration
│   ├── cloudflared/       # Tunnel config
│   ├── supabase/          # Supabase stack
│   ├── docker-compose.yml # Production
│   ├── docker-compose.dev.yml # Development
│   └── .env.example       # Environment template
├── docs/                  # Documentation
├── scripts/               # Automation scripts
├── middleware.ts          # Domain detection
├── next.config.js         # Next.js config
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Database Management

### Access Supabase Studio

1. Navigate to http://localhost:3001
2. Login with your Supabase credentials
3. Use Table Editor for visual management
4. Use SQL Editor for custom queries

### Direct PostgreSQL Access

```bash
# Via Docker
docker exec -it supabase-db psql -U postgres

# Via psql client
psql -h localhost -p 5432 -U postgres -d postgres
```

Password is in `docker/.env` as `POSTGRES_PASSWORD`.

### Useful SQL Commands

```sql
-- List extensions
\dx

-- Verify PostGIS
SELECT PostGIS_version();

-- List schemas
\dn

-- List tables
\dt

-- Check connection
SELECT current_database(), current_user;
```

## Adding New Features

### 1. Create New Page

```typescript
// app/new-page/page.tsx
import { headers } from 'next/headers'

export default function NewPage() {
  const headersList = headers()
  const city = headersList.get('x-city') || 'kingston'

  return <div>Welcome to {city}</div>
}
```

### 2. Create API Route

```typescript
// app/api/example/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello' })
}

export async function POST(request: Request) {
  const body = await request.json()
  return NextResponse.json({ received: body })
}
```

### 3. Add Environment Variable

1. Add to `docker/.env.example`:
```bash
NEW_VARIABLE=default_value
```

2. Add to Docker Compose services as needed
3. Access in Next.js:
```typescript
const value = process.env.NEW_VARIABLE
```

## Debugging

### View Service Logs

```bash
# All services
docker compose -f docker/docker-compose.dev.yml logs

# Specific service
./scripts/logs.sh nextjs
./scripts/logs.sh supabase-db

# Follow logs
docker logs -f nextjs
```

### Common Debug Commands

```bash
# Service status
docker ps

# Container details
docker inspect nextjs

# Network info
docker network inspect fyi-network

# Disk usage
docker system df
```

### Next.js Debugging

```bash
# Build analysis
npm run build
# Check .next/analyze for bundle analysis

# Type checking
npm run type-check

# Lint
npm run lint
```

## Working with Supabase

### REST API

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Query
const { data } = await supabase.from('table').select('*')

// Insert
const { data, error } = await supabase.from('table').insert({ ... })
```

### Authentication

```typescript
// Sign up
const { user, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign in
const { user, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### Email Testing

Emails in development go to Inbucket:
1. Go to http://localhost:9000
2. Check inbox for verification emails
3. Click links to test email flows

## Running Tests

### Unit Tests (Future)
```bash
npm test
```

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
```

### Manual Testing Checklist

- [ ] Homepage loads correctly
- [ ] Domain detection works (via /etc/hosts)
- [ ] Health endpoint returns 200
- [ ] Supabase Studio accessible
- [ ] Database queries work
- [ ] Hot reload functional

## Performance Optimization

### Build Analysis

```bash
npm run build
# Check bundle sizes in output
```

### Docker Optimization

- Multi-stage builds minimize image size
- Volume mounts for hot reload
- Named volumes for data persistence

### Caching

- Redis available at localhost:6379
- Use for query result caching
- Session storage

## Stopping Development

```bash
./scripts/stop.sh
```

This:
- Stops all containers gracefully
- Preserves data in volumes
- Can restart anytime

### Clean Slate (Delete All Data)

```bash
docker compose -f docker/docker-compose.dev.yml down -v
```

**Warning**: This deletes all database data!

## Common Issues

### Port Conflicts

If port 3000 is in use:
1. Stop other services on that port
2. Or modify `docker-compose.dev.yml` to use different port

### Slow Performance

- Ensure Docker has enough resources (CPU/Memory)
- Disable unused services
- Clear Docker cache: `docker system prune`

### Module Not Found

```bash
# Rebuild node_modules
docker compose -f docker/docker-compose.dev.yml down
docker compose -f docker/docker-compose.dev.yml up --build
```

### Database Connection Issues

```bash
# Check database is healthy
docker exec supabase-db pg_isready -U postgres

# Restart database
docker restart supabase-db
```

## Best Practices

1. **Always run type-check before committing**
2. **Keep environment variables in .env.example**
3. **Document new features in /docs**
4. **Test across all three city domains**
5. **Monitor Docker resource usage**
6. **Commit often with descriptive messages**

## Next Steps

After local development is working:
1. Add database schemas for your data models
2. Implement authentication flows
3. Build city-specific features
4. Add RLS policies for security
5. Set up production deployment with Cloudflare Tunnel
