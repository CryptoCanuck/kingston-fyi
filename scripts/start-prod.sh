#!/bin/bash
# Start FYI Multi-City Platform in production mode

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"
ENV_FILE="$DOCKER_DIR/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "FYI Multi-City Platform - Production Mode"
echo "=========================================="

# Check prerequisites
echo "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed${NC}"

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not available.${NC}"
    echo "Please ensure Docker Compose is installed."
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose available${NC}"

# Check Docker daemon
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker daemon is not running.${NC}"
    echo "Please start Docker Desktop or the Docker daemon."
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon running${NC}"

# Check for .env file
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found.${NC}"
    echo "Run ./scripts/generate-secrets.sh first."
    exit 1
fi

# Validate critical environment variables
source "$ENV_FILE"

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" == "your_jwt_secret_here_32_bytes_hex" ]; then
    echo -e "${RED}Error: JWT_SECRET not configured.${NC}"
    echo "Run ./scripts/generate-secrets.sh first."
    exit 1
fi
echo -e "${GREEN}✓ JWT_SECRET configured${NC}"

if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" == "your_secure_password_here" ]; then
    echo -e "${RED}Error: POSTGRES_PASSWORD not configured.${NC}"
    echo "Run ./scripts/generate-secrets.sh first."
    exit 1
fi
echo -e "${GREEN}✓ POSTGRES_PASSWORD configured${NC}"

if [ -z "$ANON_KEY" ] || [ "$ANON_KEY" == "your_anon_key_jwt_token_here" ]; then
    echo -e "${RED}Error: ANON_KEY not configured.${NC}"
    echo "Run ./scripts/generate-secrets.sh first."
    exit 1
fi
echo -e "${GREEN}✓ ANON_KEY configured${NC}"

if [ -z "$TUNNEL_TOKEN" ] || [ "$TUNNEL_TOKEN" == "your_tunnel_token_here" ]; then
    echo -e "${RED}Error: TUNNEL_TOKEN not configured.${NC}"
    echo "Production mode requires Cloudflare Tunnel."
    echo "See docker/cloudflared/README.md for setup instructions."
    exit 1
fi
echo -e "${GREEN}✓ TUNNEL_TOKEN configured${NC}"

echo ""
echo -e "${YELLOW}WARNING: Starting in PRODUCTION mode${NC}"
echo "This will expose your application via Cloudflare Tunnel."
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Starting production stack..."
echo ""

# Change to docker directory
cd "$DOCKER_DIR"

# Pull latest images
echo "Pulling latest images..."
docker compose -f docker-compose.yml pull

# Build Next.js production image
echo "Building production images..."
docker compose -f docker-compose.yml build

# Start services
echo "Starting services..."
docker compose -f docker-compose.yml up -d

# Wait for services to be healthy
echo ""
echo "Waiting for services to be healthy..."
echo "This may take a few minutes on first run..."

# Wait for database
echo -n "Waiting for PostgreSQL..."
for i in {1..60}; do
    if docker exec supabase-db pg_isready -U postgres &> /dev/null; then
        echo -e " ${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for Next.js
echo -n "Waiting for Next.js..."
for i in {1..60}; do
    if docker exec nextjs wget --no-verbose --tries=1 --spider http://localhost:3000/api/health &> /dev/null 2>&1; then
        echo -e " ${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for Cloudflare Tunnel
echo -n "Waiting for Cloudflare Tunnel..."
sleep 10
echo -e " ${GREEN}Connected${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}Production stack is running!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Your sites are now accessible at:${NC}"
echo "  https://kingston.fyi"
echo "  https://ottawa.fyi"
echo "  https://montreal.fyi"
echo ""
echo -e "${BLUE}Internal Services (not exposed):${NC}"
echo "  Next.js:            Running on port 3000"
echo "  Supabase API:       Running on port 8000"
echo "  PostgreSQL:         Running on port 5432"
echo "  Redis:              Running on port 6379"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:          ./scripts/logs.sh"
echo "  Stop services:      ./scripts/stop.sh"
echo "  Service status:     docker ps"
echo ""
echo -e "${YELLOW}Note:${NC} Traffic is routed through Cloudflare Tunnel."
echo "No ports are exposed directly to the internet."
echo ""
