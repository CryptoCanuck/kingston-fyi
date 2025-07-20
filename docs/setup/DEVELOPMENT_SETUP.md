# Kingston.FYI Development Setup Guide

This guide provides comprehensive instructions for setting up the Kingston.FYI development environment, including MongoDB, Zitadel authentication, and all necessary dependencies.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [MongoDB Setup](#mongodb-setup)
4. [Zitadel Setup](#zitadel-setup)
5. [Application Setup](#application-setup)
6. [Database Initialization](#database-initialization)
7. [Running the Application](#running-the-application)
8. [Troubleshooting](#troubleshooting)
9. [Development Tools](#development-tools)

## Prerequisites

Before setting up the development environment, ensure you have the following installed:

### Required Software

- **Node.js** (v20 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`

- **npm** (v10 or higher, comes with Node.js)
  - Verify installation: `npm --version`

- **Docker & Docker Compose** (for Zitadel and optional MongoDB container)
  - Docker Desktop: https://www.docker.com/products/docker-desktop/
  - Verify installation: `docker --version` and `docker-compose --version`

- **Git**
  - Download from: https://git-scm.com/
  - Verify installation: `git --version`

### Optional Software

- **MongoDB Compass** (GUI for MongoDB)
  - Download from: https://www.mongodb.com/products/compass

- **VS Code** with recommended extensions:
  - ESLint
  - Prettier
  - MongoDB for VS Code
  - Tailwind CSS IntelliSense

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/kingston-fyi.git
cd kingston-fyi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your specific configuration (see detailed configuration below).

## MongoDB Setup

You have two options for MongoDB setup:

### Option 1: Local MongoDB with Docker (Recommended)

This option is included in the `docker-compose.yml` file and will be started automatically.

### Option 2: MongoDB Atlas (Cloud)

1. Create a free MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Set up database access:
   - Create a database user
   - Add your IP address to the IP Access List
4. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
5. Update your `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

### Option 3: Local MongoDB Installation

1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Follow the installation guide for your OS
3. Start MongoDB service:
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
   - Windows: MongoDB runs as a service automatically
4. Default connection string: `mongodb://localhost:27017/kingston-fyi`

## Zitadel Setup

Zitadel is used for authentication and user management.

### Using Docker Compose (Recommended)

The provided `docker-compose.yml` includes Zitadel configuration. Simply run:

```bash
docker-compose up -d zitadel
```

### Configuring Zitadel

1. Access Zitadel Console:
   - URL: http://localhost:8080/ui/console
   - Default login: `zitadel-admin@zitadel.localhost`
   - Default password: `RootPassword1!`

2. Create a new project:
   - Click "Projects" → "Create new project"
   - Name: "Kingston FYI"
   - Note the Project ID

3. Create an application:
   - In your project, click "Applications" → "New"
   - Type: "Web Application"
   - Name: "Kingston FYI Web"
   - Authentication: "PKCE"
   - Redirect URIs:
     - `http://localhost:3000/api/auth/callback/zitadel`
   - Post Logout URIs:
     - `http://localhost:3000`
   - Note the Client ID

4. Create API credentials (for server-side operations):
   - Click "Service Users" → "New"
   - Create a service user
   - Generate a key and save the JSON file

5. Update your `.env.local` with Zitadel configuration:
   ```
   ZITADEL_ISSUER=http://localhost:8080
   ZITADEL_CLIENT_ID=<your-client-id>
   ZITADEL_CLIENT_SECRET=<your-client-secret>
   ZITADEL_PROJECT_ID=<your-project-id>
   ```

## Application Setup

### 1. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Add it to your `.env.local`:
```
NEXTAUTH_SECRET=<generated-secret>
```

### 2. Complete Environment Configuration

Your complete `.env.local` should look like:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/kingston-fyi
MONGODB_DB=kingston-fyi

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-generated-secret>

# Zitadel Configuration
ZITADEL_ISSUER=http://localhost:8080
ZITADEL_CLIENT_ID=<your-client-id>
ZITADEL_CLIENT_SECRET=<your-client-secret>
ZITADEL_PROJECT_ID=<your-project-id>

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Initialization

### 1. Start All Services

Using Docker Compose:

```bash
docker-compose up -d
```

This starts MongoDB and Zitadel.

### 2. Initialize Database Schema

The application uses Mongoose for MongoDB schema management. Schemas are automatically created on first use.

### 3. Seed Initial Data (Optional)

Run the migration script to populate initial data:

```bash
npm run migrate
```

This will:
- Create indexes for optimal performance
- Seed sample places and events (if needed)
- Set up initial categories

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at:
- Application: http://localhost:3000
- Zitadel Console: http://localhost:8080/ui/console
- MongoDB: mongodb://localhost:27017

### Production Build

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
- **Error**: `MongoNetworkError: connect ECONNREFUSED`
- **Solution**: 
  - Ensure MongoDB is running: `docker-compose ps`
  - Check MongoDB logs: `docker-compose logs mongodb`
  - Verify connection string in `.env.local`

#### 2. Zitadel Authentication Issues
- **Error**: `Invalid client or redirect_uri`
- **Solution**:
  - Verify redirect URIs in Zitadel match exactly
  - Ensure Client ID is correct
  - Check Zitadel is running: `docker-compose ps zitadel`

#### 3. NextAuth Session Issues
- **Error**: `[next-auth][error][SESSION_ERROR]`
- **Solution**:
  - Regenerate and update `NEXTAUTH_SECRET`
  - Clear browser cookies
  - Ensure `NEXTAUTH_URL` matches your development URL

#### 4. Port Already in Use
- **Error**: `Port 3000 is already in use`
- **Solution**:
  - Kill the process: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)
  - Or change the port: `npm run dev -- -p 3001`

#### 5. Docker Issues
- **Error**: `Cannot connect to Docker daemon`
- **Solution**:
  - Ensure Docker Desktop is running
  - Reset Docker: Docker Desktop → Troubleshoot → Reset

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

### Database Debugging

Connect to MongoDB shell:

```bash
docker-compose exec mongodb mongosh
```

Common commands:
```javascript
// Switch to database
use kingston-fyi

// Show collections
show collections

// Count documents
db.places.countDocuments()

// View sample documents
db.places.find().limit(5).pretty()
```

## Development Tools

### Useful Scripts

```bash
# Run linter
npm run lint

# Type checking
npm run type-check

# Database migration
npm run migrate

# Clear database (careful!)
docker-compose exec mongodb mongosh kingston-fyi --eval "db.dropDatabase()"
```

### VS Code Settings

Recommended `.vscode/settings.json`:

```json
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
```

### Browser Extensions

- React Developer Tools
- Redux DevTools (if using Redux)
- Zitadel Browser Extension (for testing auth flows)

## Next Steps

1. Review the API documentation in `/docs/api`
2. Check the component library in `/src/components`
3. Explore the data models in `/src/models`
4. Join our Discord for development discussions

## Support

If you encounter issues not covered in this guide:

1. Check existing issues: https://github.com/your-org/kingston-fyi/issues
2. Join our Discord: https://discord.gg/kingston-fyi
3. Email: dev@kingston.fyi

---

Happy coding! 🚀