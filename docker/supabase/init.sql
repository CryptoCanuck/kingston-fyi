-- Supabase PostgreSQL Initialization Script
-- This script runs on first database startup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "postgis_topology";

-- Create required schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Create auth schema tables (minimal setup - GoTrue handles the rest)
-- These are created by GoTrue on first run

-- Create storage schema tables (minimal setup - Storage API handles the rest)
-- These are created by Storage API on first run

-- Set search path to include PostGIS functions
ALTER DATABASE postgres SET search_path TO public, extensions;

-- Notify that initialization is complete
DO $$
BEGIN
  RAISE NOTICE 'Supabase database initialized with PostGIS support';
END $$;
