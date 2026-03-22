#!/bin/bash
# Set passwords for Supabase internal roles to match POSTGRES_PASSWORD
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    ALTER ROLE authenticator PASSWORD '$POSTGRES_PASSWORD';
    ALTER ROLE supabase_auth_admin PASSWORD '$POSTGRES_PASSWORD';
    ALTER ROLE supabase_storage_admin PASSWORD '$POSTGRES_PASSWORD';
    ALTER ROLE supabase_admin PASSWORD '$POSTGRES_PASSWORD';
    ALTER ROLE dashboard_user PASSWORD '$POSTGRES_PASSWORD';
EOSQL
