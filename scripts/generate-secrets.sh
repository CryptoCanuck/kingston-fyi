#!/bin/bash
# Generate secrets for FYI Multi-City Platform
# This script creates secure random values for all required secrets

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/docker/.env"
ENV_EXAMPLE="$PROJECT_ROOT/docker/.env.example"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "FYI Multi-City Secrets Generator"
echo "=========================================="

# Check prerequisites
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}Error: openssl is required but not installed.${NC}"
    exit 1
fi

# Generate JWT token for Supabase
# Based on https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys
generate_jwt() {
    local role=$1
    local jwt_secret=$2
    local expiry=1893456000  # Year 2030

    # JWT Header
    local header='{"alg":"HS256","typ":"JWT"}'
    local header_base64=$(echo -n "$header" | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')

    # JWT Payload
    local payload="{\"role\":\"$role\",\"iss\":\"supabase\",\"iat\":$(date +%s),\"exp\":$expiry}"
    local payload_base64=$(echo -n "$payload" | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')

    # JWT Signature
    local signature=$(echo -n "${header_base64}.${payload_base64}" | openssl dgst -sha256 -hmac "$jwt_secret" -binary | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')

    echo "${header_base64}.${payload_base64}.${signature}"
}

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Warning: $ENV_FILE already exists.${NC}"
    read -p "Do you want to regenerate secrets? This will overwrite existing values. (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. Existing .env file preserved."
        exit 0
    fi
fi

# Copy from example if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo -e "${GREEN}Created .env from .env.example${NC}"
    else
        echo -e "${RED}Error: $ENV_EXAMPLE not found${NC}"
        exit 1
    fi
fi

echo "Generating secure secrets..."

# Generate PostgreSQL password
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=')
echo -e "${GREEN}✓ PostgreSQL password generated${NC}"

# Generate JWT Secret (32 bytes hex)
JWT_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✓ JWT secret generated${NC}"

# Generate Supabase API keys
ANON_KEY=$(generate_jwt "anon" "$JWT_SECRET")
echo -e "${GREEN}✓ Anonymous key generated${NC}"

SERVICE_ROLE_KEY=$(generate_jwt "service_role" "$JWT_SECRET")
echo -e "${GREEN}✓ Service role key generated${NC}"

# Update .env file with generated values
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" "$ENV_FILE"
    sed -i '' "s/^JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$ENV_FILE"
    sed -i '' "s/^ANON_KEY=.*/ANON_KEY=$ANON_KEY/" "$ENV_FILE"
    sed -i '' "s/^SERVICE_ROLE_KEY=.*/SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY/" "$ENV_FILE"
else
    # Linux
    sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" "$ENV_FILE"
    sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$ENV_FILE"
    sed -i "s/^ANON_KEY=.*/ANON_KEY=$ANON_KEY/" "$ENV_FILE"
    sed -i "s/^SERVICE_ROLE_KEY=.*/SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY/" "$ENV_FILE"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Secrets generated successfully!${NC}"
echo "=========================================="
echo ""
echo "Generated secrets have been written to: $ENV_FILE"
echo ""
echo -e "${YELLOW}IMPORTANT:${NC}"
echo "1. Keep these secrets safe and never commit them to git"
echo "2. The TUNNEL_TOKEN still needs to be set manually"
echo "   See docker/cloudflared/README.md for instructions"
echo ""
echo "Next steps:"
echo "1. Set your TUNNEL_TOKEN in docker/.env"
echo "2. Run ./scripts/start-dev.sh to start the development stack"
echo ""
