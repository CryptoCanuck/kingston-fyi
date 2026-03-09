# Troubleshooting Guide

Common issues and solutions for the FYI Multi-City Platform.

## Quick Diagnostics

### Check Service Status

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Expected output:
```
NAMES                STATUS              PORTS
nextjs               Up (healthy)        0.0.0.0:3000->3000/tcp
supabase-db          Up (healthy)        0.0.0.0:5432->5432/tcp
supabase-auth        Up (healthy)
supabase-kong        Up (healthy)        0.0.0.0:8000->8000/tcp
redis                Up (healthy)        0.0.0.0:6379->6379/tcp
...
```

### View All Logs

```bash
# Development
docker compose -f docker/docker-compose.dev.yml logs

# Last 100 lines
docker compose -f docker/docker-compose.dev.yml logs --tail=100

# Follow (real-time)
docker compose -f docker/docker-compose.dev.yml logs -f
```

---

## Startup Issues

### Services Won't Start

**Symptom**: `docker compose up` fails or containers exit immediately

**Solutions**:

1. Check Docker resources:
```bash
docker system df
docker system info | grep "Memory\|CPUs"
```

2. Increase Docker memory (Docker Desktop → Settings → Resources)
   - Recommended: 4GB+ RAM
   - 2+ CPUs

3. Check for port conflicts:
```bash
# macOS/Linux
lsof -i :3000 -i :5432 -i :6379 -i :8000

# Windows
netstat -ano | findstr "3000 5432 6379 8000"
```

4. Remove conflicting containers:
```bash
docker rm -f $(docker ps -aq --filter "name=nextjs\|supabase\|redis\|n8n")
```

### .env File Missing

**Symptom**: `Error: .env file not found`

**Solution**:
```bash
./scripts/generate-secrets.sh
```

### Secrets Not Generated

**Symptom**: `JWT_SECRET not configured`

**Solution**:
```bash
# Regenerate
./scripts/generate-secrets.sh
# Type 'y' to overwrite
```

Or manually edit `docker/.env`:
```bash
JWT_SECRET=$(openssl rand -hex 32)
```

---

## Next.js Issues

### Application Won't Load

**Symptom**: Can't access http://localhost:3000

**Solutions**:

1. Check if container is running:
```bash
docker ps | grep nextjs
```

2. View logs:
```bash
docker logs nextjs
```

3. Common errors:
   - Missing dependencies → Rebuild: `docker compose up --build`
   - TypeScript errors → Fix code, container auto-restarts
   - Port conflict → Stop other services on 3000

4. Rebuild from scratch:
```bash
docker compose -f docker/docker-compose.dev.yml down
docker compose -f docker/docker-compose.dev.yml up --build
```

### Hot Reload Not Working

**Symptom**: Changes don't appear after saving

**Solutions**:

1. Check volume mount:
```bash
docker inspect nextjs | grep Mounts -A 20
```

2. Verify you're editing correct files (not inside container)

3. Restart Next.js:
```bash
docker restart nextjs
```

4. Check for TypeScript errors:
```bash
npm run type-check
```

### Build Errors

**Symptom**: `npm run build` fails

**Solutions**:

1. Check TypeScript:
```bash
npm run type-check
```

2. Check ESLint:
```bash
npm run lint
```

3. Clear cache:
```bash
rm -rf .next
npm run build
```

---

## Database Issues

### PostgreSQL Won't Start

**Symptom**: `supabase-db` container unhealthy

**Solutions**:

1. Check logs:
```bash
docker logs supabase-db
```

2. Common errors:
   - Disk space: `docker system prune`
   - Corrupted data: Remove volume (loses data!)
     ```bash
     docker volume rm fyi-supabase-db-data
     ```
   - Permission issues: Check volume ownership

3. Wait longer (first start can take time):
```bash
docker logs -f supabase-db
# Wait for "database system is ready to accept connections"
```

### Can't Connect to Database

**Symptom**: Connection refused to PostgreSQL

**Solutions**:

1. Verify it's running:
```bash
docker exec supabase-db pg_isready -U postgres
```

2. Check password:
```bash
grep POSTGRES_PASSWORD docker/.env
```

3. Test connection:
```bash
docker exec -it supabase-db psql -U postgres -c "SELECT 1"
```

4. From host:
```bash
psql -h localhost -p 5432 -U postgres -d postgres
# Password from docker/.env
```

### PostGIS Not Available

**Symptom**: PostGIS functions fail

**Solutions**:

1. Check extension:
```bash
docker exec supabase-db psql -U postgres -c "\dx"
# Should list postgis
```

2. Enable manually:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

3. Check init script ran:
```bash
docker exec supabase-db psql -U postgres -c "SELECT PostGIS_version();"
```

---

## Supabase Issues

### Kong Gateway 502 Error

**Symptom**: API returns 502 Bad Gateway

**Solutions**:

1. Check all services are healthy:
```bash
docker ps | grep supabase
```

2. Verify kong config:
```bash
docker exec supabase-kong cat /var/lib/kong/kong.yml
```

3. Check PostgREST:
```bash
docker logs supabase-rest
```

4. Restart Kong:
```bash
docker restart supabase-kong
```

### Authentication Failing

**Symptom**: Can't sign up or sign in

**Solutions**:

1. Check GoTrue logs:
```bash
docker logs supabase-auth
```

2. Verify JWT secret matches across services:
```bash
grep JWT_SECRET docker/.env
```

3. In development, emails go to Inbucket:
   - http://localhost:9000

4. Auto-confirm enabled? Check:
```bash
grep GOTRUE_MAILER_AUTOCONFIRM docker/.env
```

### Studio Won't Load

**Symptom**: http://localhost:3001 not accessible

**Solutions**:

1. Studio only runs in dev mode:
```bash
docker ps | grep supabase-studio
```

2. Check logs:
```bash
docker logs supabase-studio
```

3. Ensure pg-meta is healthy:
```bash
docker logs supabase-meta
```

---

## Domain Detection Issues

### Wrong City Showing

**Symptom**: Always shows "Kingston" regardless of domain

**Solutions**:

1. Verify /etc/hosts:
```bash
cat /etc/hosts | grep ".fyi"
# Should show:
# 127.0.0.1 kingston.fyi
# 127.0.0.1 ottawa.fyi
# 127.0.0.1 montreal.fyi
```

2. Test middleware:
```bash
curl -H "Host: ottawa.fyi" http://localhost:3000
# Should show Ottawa content
```

3. Check browser DNS cache:
   - Clear browser cache
   - Use incognito mode
   - Try different browser

4. Verify middleware.ts is deployed:
```bash
docker exec nextjs ls -la
# Should show middleware.ts compiled
```

### Host Header Not Preserved

**Symptom**: x-city header always defaults

**Solutions**:

1. In development, access via:
   - http://kingston.fyi:3000 (with hosts entry)
   - NOT http://localhost:3000

2. Check middleware is active:
   - Response should have `x-city` header
   - Check in browser dev tools (Network tab)

---

## Cloudflare Tunnel Issues

### Tunnel Not Connecting (Production)

**Symptom**: Tunnel shows "Disconnected" in Cloudflare

**Solutions**:

1. Check token:
```bash
docker exec cloudflared printenv TUNNEL_TOKEN | head -c 20
# Should show start of token
```

2. View logs:
```bash
docker logs cloudflared
```

3. Common errors:
   - Invalid token → Regenerate in Cloudflare Dashboard
   - Network blocked → Check firewall
   - DNS issues → Verify internet connection

4. Test connection:
```bash
docker exec cloudflared cloudflared tunnel info
```

### Domain Not Resolving

**Symptom**: ERR_NAME_NOT_RESOLVED

**Solutions**:

1. Check DNS propagation:
```bash
dig kingston.fyi
nslookup kingston.fyi
```

2. Verify CNAME in Cloudflare Dashboard
3. Wait 5-10 minutes for propagation
4. Clear local DNS cache:
```bash
# macOS
sudo dscacheutil -flushcache

# Windows
ipconfig /flushdns

# Linux
sudo systemd-resolve --flush-caches
```

---

## Performance Issues

### Slow Startup

**Symptom**: Services take long to become healthy

**Solutions**:

1. First run downloads images (normal)
2. Increase Docker resources
3. Check disk I/O:
```bash
docker system df
docker system prune
```

4. Pre-pull images:
```bash
docker compose -f docker/docker-compose.dev.yml pull
```

### High Memory Usage

**Symptom**: Docker using excessive RAM

**Solutions**:

1. Check per-container usage:
```bash
docker stats
```

2. Limit memory in docker-compose:
```yaml
services:
  nextjs:
    mem_limit: 1g
```

3. Stop unused services
4. Clear Docker cache:
```bash
docker system prune -a
```

### Slow Database Queries

**Symptom**: Application response times high

**Solutions**:

1. Check database health:
```bash
docker exec supabase-db pg_isready
```

2. Monitor active queries:
```sql
SELECT * FROM pg_stat_activity;
```

3. Enable query logging:
```bash
docker exec supabase-db psql -U postgres -c "SET log_statement = 'all';"
```

4. Use Redis cache for frequent queries

---

## Data Recovery

### Accidental Volume Deletion

**Symptom**: Lost database data

**Prevention**:
- Regular backups
- Don't use `docker compose down -v` carelessly

**Recovery**:
- If no backup, data is lost
- Set up automated backups (future phase)

### Corrupt Database

**Symptom**: PostgreSQL won't start, data errors

**Solutions**:

1. Check logs for specific error
2. If minor corruption:
```bash
docker exec supabase-db psql -U postgres -c "VACUUM FULL;"
```

3. If severe, restore from backup or recreate:
```bash
docker volume rm fyi-supabase-db-data
./scripts/start-dev.sh
# Database recreated fresh
```

---

## Getting Help

### Collect Diagnostic Info

```bash
# System info
docker version
docker compose version
node --version
npm --version

# Service status
docker ps -a

# Recent logs
docker compose -f docker/docker-compose.dev.yml logs --tail=50

# Resource usage
docker stats --no-stream
```

### Useful Debug Commands

```bash
# Enter container shell
docker exec -it nextjs sh
docker exec -it supabase-db bash

# Network inspection
docker network inspect fyi-network

# Check volumes
docker volume ls | grep fyi

# View environment
docker exec nextjs env | sort
```

### Where to Ask

1. Check this guide first
2. Search project issues
3. Review Supabase docs: https://supabase.com/docs
4. Cloudflare community: https://community.cloudflare.com/
5. Next.js docs: https://nextjs.org/docs

---

## Preventive Measures

1. **Always use scripts** (`start-dev.sh`, `stop.sh`)
2. **Monitor Docker resources** regularly
3. **Keep secrets secure** and backed up
4. **Document changes** you make
5. **Test in development** before production
6. **Set up backups** before going live
7. **Check logs** after startup
