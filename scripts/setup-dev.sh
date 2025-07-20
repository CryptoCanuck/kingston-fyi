#!/bin/bash

# Kingston.FYI Development Environment Setup Script
# This script automates the setup process for Unix-based systems (macOS, Linux)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored messages
print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           Kingston.FYI Development Setup Script           ║"
echo "║                    Unix/Linux/macOS                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if script is run from the project root
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to compare versions
version_compare() {
    if [[ $1 == $2 ]]; then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 0
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 1
        fi
    done
    return 0
}

print_info "Checking system requirements..."

# Check Node.js
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js v20 or higher."
    print_info "Visit: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    if ! version_compare "$NODE_VERSION" "20.0.0"; then
        print_error "Node.js version $NODE_VERSION is too old. Please upgrade to v20 or higher."
        exit 1
    fi
    print_success "Node.js v$NODE_VERSION found"
fi

# Check npm
if ! command_exists npm; then
    print_error "npm is not installed."
    exit 1
else
    NPM_VERSION=$(npm -v)
    print_success "npm v$NPM_VERSION found"
fi

# Check Docker
if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker Desktop."
    print_info "Visit: https://www.docker.com/products/docker-desktop/"
    exit 1
else
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    print_success "Docker v$DOCKER_VERSION found and running"
fi

# Check Docker Compose
if command_exists docker-compose; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
    print_success "Docker Compose v$COMPOSE_VERSION found"
elif docker compose version >/dev/null 2>&1; then
    COMPOSE_VERSION=$(docker compose version | cut -d' ' -f4)
    print_success "Docker Compose (plugin) v$COMPOSE_VERSION found"
else
    print_error "Docker Compose is not installed."
    exit 1
fi

# Check Git
if ! command_exists git; then
    print_error "Git is not installed. Please install Git."
    print_info "Visit: https://git-scm.com/"
    exit 1
else
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    print_success "Git v$GIT_VERSION found"
fi

print_info "\nInstalling project dependencies..."
npm install

# Setup environment files
print_info "\nSetting up environment configuration..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    print_success "Created .env.local from .env.example"
    
    # Generate NextAuth secret
    print_info "Generating secure NextAuth secret..."
    if command_exists openssl; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        # Update .env.local with the generated secret
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/your-nextauth-secret-here/$NEXTAUTH_SECRET/" .env.local
        else
            # Linux
            sed -i "s/your-nextauth-secret-here/$NEXTAUTH_SECRET/" .env.local
        fi
        print_success "Generated and set NextAuth secret"
    else
        print_warning "OpenSSL not found. Please manually generate a NextAuth secret."
    fi
else
    print_info ".env.local already exists, skipping..."
fi

# Start Docker services
print_info "\nStarting Docker services..."
if docker compose up -d; then
    print_success "Docker services started successfully"
else
    # Fallback to docker-compose command
    if docker-compose up -d; then
        print_success "Docker services started successfully"
    else
        print_error "Failed to start Docker services"
        exit 1
    fi
fi

# Wait for services to be healthy
print_info "\nWaiting for services to be ready..."
RETRIES=30
RETRY_COUNT=0

# Wait for MongoDB
while ! docker exec kingston-fyi-mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
    if [ $RETRY_COUNT -eq $RETRIES ]; then
        print_error "MongoDB failed to start within expected time"
        exit 1
    fi
    printf "."
    sleep 2
    ((RETRY_COUNT++))
done
print_success "\nMongoDB is ready"

# Wait for Zitadel
RETRY_COUNT=0
while ! curl -f http://localhost:8080/debug/ready >/dev/null 2>&1; do
    if [ $RETRY_COUNT -eq $RETRIES ]; then
        print_error "Zitadel failed to start within expected time"
        print_info "Check logs with: docker compose logs zitadel"
        exit 1
    fi
    printf "."
    sleep 2
    ((RETRY_COUNT++))
done
print_success "\nZitadel is ready"

# Run database migrations
print_info "\nRunning database migrations..."
if npm run migrate; then
    print_success "Database migrations completed"
else
    print_warning "Database migration failed. This might be okay if it's the first run."
fi

# Create .vscode settings if not exists
if [ ! -d ".vscode" ]; then
    mkdir -p .vscode
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
EOF
    print_success "Created VS Code settings"
fi

# Final instructions
echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Setup completed successfully! 🎉              ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}📝 Next steps:${NC}"
echo "1. Configure Zitadel:"
echo "   - Open: http://localhost:8080/ui/console"
echo "   - Login: zitadel-admin@zitadel.localhost"
echo "   - Password: RootPassword1!"
echo "   - Follow the setup guide in docs/setup/DEVELOPMENT_SETUP.md"
echo ""
echo "2. Update your .env.local file with Zitadel credentials"
echo ""
echo "3. Start the development server:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "4. Open the application:"
echo "   http://localhost:3000"
echo ""
echo -e "${BLUE}📚 Additional resources:${NC}"
echo "- Setup documentation: docs/setup/DEVELOPMENT_SETUP.md"
echo "- MongoDB GUI: docker compose --profile debug up mongo-express -d"
echo "- Mailhog (email testing): docker compose --profile debug up mailhog -d"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- Keep Docker running while developing"
echo "- To stop services: docker compose down"
echo "- To remove all data: docker compose down -v"