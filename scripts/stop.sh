#!/bin/bash
# Stop FYI Multi-City Platform

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Stopping FYI Multi-City Platform"
echo "=========================================="

# Check if any FYI containers are running
if ! docker ps --format '{{.Names}}' | grep -q "^supabase-\|^nextjs\|^redis\|^n8n\|^cloudflared"; then
    echo -e "${YELLOW}No FYI services are currently running.${NC}"
    exit 0
fi

echo "Stopping services gracefully..."

cd "$DOCKER_DIR"

# Try to determine which compose file is being used
if docker ps --format '{{.Names}}' | grep -q "^supabase-studio"; then
    # Development mode (studio is only in dev)
    echo "Detected: Development mode"
    docker compose -f docker-compose.dev.yml down
else
    # Production mode
    echo "Detected: Production mode"
    docker compose -f docker-compose.yml down
fi

echo ""
echo "=========================================="
echo -e "${GREEN}All services stopped successfully!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}Note:${NC} Data is preserved in Docker volumes."
echo "To remove volumes (delete all data): docker volume rm fyi-supabase-db-data fyi-redis-data fyi-n8n-data fyi-supabase-storage-data"
echo ""
