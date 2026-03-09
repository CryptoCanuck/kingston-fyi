#!/bin/bash
# View logs for FYI Multi-City Platform

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

# Colors for output
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "FYI Multi-City Platform Logs"
echo "=========================================="

# Check for specific service argument
if [ -n "$1" ]; then
    echo "Showing logs for: $1"
    echo "Press Ctrl+C to stop"
    echo ""
    docker logs -f "$1"
else
    echo -e "${BLUE}Available services:${NC}"
    echo "  nextjs          - Next.js application"
    echo "  supabase-db     - PostgreSQL database"
    echo "  supabase-auth   - Authentication service"
    echo "  supabase-rest   - REST API"
    echo "  supabase-storage- Storage service"
    echo "  supabase-kong   - API Gateway"
    echo "  supabase-meta   - Database metadata"
    echo "  supabase-studio - Web UI (dev only)"
    echo "  redis           - Cache service"
    echo "  n8n             - Automation platform"
    echo "  cloudflared     - Cloudflare Tunnel (prod only)"
    echo ""
    echo "Usage:"
    echo "  ./scripts/logs.sh <service-name>   - View specific service logs"
    echo "  ./scripts/logs.sh                  - Show this help"
    echo ""
    echo "Examples:"
    echo "  ./scripts/logs.sh nextjs"
    echo "  ./scripts/logs.sh supabase-db"
    echo ""
    echo "Alternative commands:"
    echo "  docker logs <service-name>         - View logs once"
    echo "  docker logs -f <service-name>      - Follow logs"
    echo "  docker logs --tail 100 <service>   - Last 100 lines"
    echo ""

    # Show running services
    echo -e "${BLUE}Currently running services:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "^NAMES|nextjs|supabase|redis|n8n|cloudflared|inbucket" || echo "No FYI services running"
    echo ""
fi
