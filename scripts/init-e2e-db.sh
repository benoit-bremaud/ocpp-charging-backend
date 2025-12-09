#!/bin/bash

# Initialize E2E Test Database
# This script creates the test database in PostgreSQL

set -e

echo "🔧 Initializing E2E Test Database..."

# Extract database credentials from .env.test
DB_HOST=$(grep "^DATABASE_HOST=" .env.test | cut -d= -f2)
DB_PORT=$(grep "^DATABASE_PORT=" .env.test | cut -d= -f2)
DB_USER=$(grep "^DATABASE_USER=" .env.test | cut -d= -f2)
DB_PASSWORD=$(grep "^DATABASE_PASSWORD=" .env.test | cut -d= -f2)
DB_NAME=$(grep "^DATABASE_NAME=" .env.test | cut -d= -f2)

echo "📋 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"

# Execute initialization script using postgres default DB
# We connect to 'postgres' database (system database) to create our test database
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -f scripts/init-test-db.sql

echo "✅ E2E Test Database Initialization Complete!"
