-- Initialize test database for E2E tests
-- PostgreSQL syntax (NOT MySQL syntax)

-- Drop existing test database if it exists (for clean slate)
DROP DATABASE IF EXISTS ocpp_db_e2e;

-- Create the test database
CREATE DATABASE ocpp_db_e2e;

-- Connect to the new database and grant privileges
-- Note: We need to run this separately via psql
