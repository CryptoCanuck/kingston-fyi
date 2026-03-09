#!/bin/bash
# Creates the n8n_user role in PostgreSQL using the N8N_DB_PASSWORD env var.
# Mount into the container or run via docker exec:
#   docker exec -e N8N_DB_PASSWORD="$N8N_DB_PASSWORD" supabase-db /bin/bash /docker-entrypoint-initdb.d/create-n8n-user.sh

set -euo pipefail

if [ -z "${N8N_DB_PASSWORD:-}" ]; then
  echo "ERROR: N8N_DB_PASSWORD environment variable is not set" >&2
  exit 1
fi

# Check if role already exists before creating
ROLE_EXISTS=$(psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER:-postgres}" --dbname "${POSTGRES_DB:-postgres}" -tAc \
  "SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'n8n_user'")

if [ "$ROLE_EXISTS" != "1" ]; then
  psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER:-postgres}" --dbname "${POSTGRES_DB:-postgres}" -c \
    "CREATE ROLE n8n_user WITH LOGIN PASSWORD '${N8N_DB_PASSWORD}';"
  echo "Created n8n_user role"
else
  echo "n8n_user role already exists, skipping"
fi

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER:-postgres}" --dbname "${POSTGRES_DB:-postgres}" -c \
  "GRANT ALL ON SCHEMA n8n TO n8n_user;"
