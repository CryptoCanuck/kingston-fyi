#!/bin/bash
# Start FYI Multi-City Platform in development mode

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
echo "FYI Multi-City Platform - Development Mode"
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
    echo -e "${YELLOW}Warning: .env file not found.${NC}"
    echo "Running secret generator..."
    "$SCRIPT_DIR/generate-secrets.sh"
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

echo ""
echo "Starting development stack..."
echo ""

# Change to docker directory
cd "$DOCKER_DIR"

# Pull latest images
echo "Pulling latest images..."
docker compose -f docker-compose.dev.yml pull

# Start services
echo "Starting services..."
docker compose -f docker-compose.dev.yml up -d --build

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
    if curl -s http://localhost:3000/api/health &> /dev/null; then
        echo -e " ${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "=========================================="
echo -e "${GREEN}Development stack is running!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo "  Next.js App:        http://localhost:3000"
echo "  Supabase API:       http://localhost:8000"
echo "  Supabase Studio:    http://localhost:3001"
echo "  n8n Workflows:      http://localhost:5678"
echo "  Email Testing:      http://localhost:9000"
echo "  PostgreSQL:         localhost:5432"
echo "  Redis:              localhost:6379"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:          ./scripts/logs.sh"
echo "  Stop services:      ./scripts/stop.sh"
echo "  Service status:     docker ps"
echo ""
echo -e "${YELLOW}Note:${NC} Cloudflared is NOT running in dev mode."
echo "Use localhost URLs for development."
echo ""
echo "Next.js hot reload is enabled - edit code and see changes instantly!"
echo ""
