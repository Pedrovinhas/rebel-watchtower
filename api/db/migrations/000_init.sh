#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  SELECT 'CREATE DATABASE holocron_test'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'holocron_test')\gexec
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "holocron_test" \
  -f /docker-entrypoint-initdb.d/001_create_entities.sql
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "holocron_test" \
  -f /docker-entrypoint-initdb.d/002_create_events.sql
