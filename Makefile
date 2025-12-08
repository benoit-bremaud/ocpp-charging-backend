# ============================================================================
# OCPP Charging Backend - Makefile
# ============================================================================
# Comprehensive development, testing, and deployment commands
# Usage: make <target>
# ============================================================================

.PHONY: help install build start stop logs clean test test-cov test-e2e \
        test-e2e-init test-e2e-debug test-all lint format docker-build \
        docker-push db-init db-clean db-reset env-setup audit security

# Default target
.DEFAULT_GOAL := help

# ============================================================================
# 🎯 HELP
# ============================================================================

help: ## Show this help message
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║    OCPP Charging Backend - Development & Testing Commands      ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "📦 INSTALLATION & SETUP"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(install|setup|env)' | awk 'BEGIN {FS = ":.*?## "} {printf "  %-30s %s\n", $$1, $$2}'
	@echo ""
	@echo "🏗️  BUILD & START"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(build|start|stop|logs)' | awk 'BEGIN {FS = ":.*?## "} {printf "  %-30s %s\n", $$1, $$2}'
	@echo ""
	@echo "🧪 TESTING"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(test|lint)' | awk 'BEGIN {FS = ":.*?## "} {printf "  %-30s %s\n", $$1, $$2}'
	@echo ""
	@echo "🗄️  DATABASE"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(db-)' | awk 'BEGIN {FS = ":.*?## "} {printf "  %-30s %s\n", $$1, $$2}'
	@echo ""
	@echo "🐳 DOCKER"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(docker)' | awk 'BEGIN {FS = ":.*?## "} {printf "  %-30s %s\n", $$1, $$2}'
	@echo ""
	@echo "🔒 SECURITY & QUALITY"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(audit|security)' | awk 'BEGIN {FS = ":.*?## "} {printf "  %-30s %s\n", $$1, $$2}'
	@echo ""

# ============================================================================
# 📦 INSTALLATION & SETUP
# ============================================================================

install: ## Install all dependencies (npm install --legacy-peer-deps)
	@echo "📦 Installing dependencies..."
	npm install --legacy-peer-deps
	@echo "✅ Dependencies installed!"

install-ci: ## Clean install for CI/CD (npm ci --legacy-peer-deps)
	@echo "📦 Running clean install for CI..."
	npm ci --legacy-peer-deps
	@echo "✅ Clean install complete!"

env-setup: ## Setup environment files (.env, .env.test)
	@echo "🔧 Setting up environment files..."
	@if [ ! -f .env ]; then cp .env.example .env 2>/dev/null || echo "⚠️  No .env.example found"; fi
	@if [ ! -f .env.test ]; then echo "⚠️  .env.test already exists"; fi
	@echo "✅ Environment files ready!"

# ============================================================================
# 🏗️  BUILD & START
# ============================================================================

build: ## Build the NestJS application (npm run build)
	@echo "🏗️  Building application..."
	npm run build
	@echo "✅ Build complete!"

start: ## Start the application in production mode
	@echo "🚀 Starting application..."
	npm run start
	@echo "✅ Application started!"

start-dev: ## Start the application in development mode (hot reload)
	@echo "🚀 Starting application in development mode..."
	npm run start:dev
	@echo "✅ Development mode active!"

start-debug: ## Start the application in debug mode
	@echo "🐛 Starting application in debug mode..."
	npm run start:debug
	@echo "✅ Debug mode active! Connect your debugger to port 9229"

stop: ## Stop all Docker containers
	@echo "🛑 Stopping containers..."
	docker compose down
	@echo "✅ Containers stopped!"

logs: ## Show Docker container logs (follow mode)
	@echo "📋 Showing logs..."
	docker compose logs -f

logs-app: ## Show application logs only
	@echo "📋 Showing app logs..."
	docker compose logs -f app

logs-db: ## Show database logs only
	@echo "📋 Showing database logs..."
	docker compose logs -f postgres

# ============================================================================
# 🧪 TESTING
# ============================================================================

test: ## Run unit tests (npm test)
	@echo "🧪 Running unit tests..."
	npm test
	@echo "✅ Unit tests complete!"

test-watch: ## Run unit tests in watch mode
	@echo "👀 Running unit tests in watch mode..."
	npm run test:watch

test-cov: ## Run unit tests with coverage report
	@echo "📊 Running unit tests with coverage..."
	npm run test:cov
	@echo "✅ Coverage report ready in ./coverage"

test-debug: ## Run unit tests in debug mode
	@echo "🐛 Running unit tests in debug mode..."
	npm run test:debug

test-e2e-init: ## Initialize E2E test database
	@echo "🗄️  Initializing E2E test database..."
	npm run test:e2e:init
	@echo "✅ E2E test database ready!"

test-e2e: test-e2e-init ## Run E2E tests (initializes DB first)
	@echo "🧪 Running E2E tests..."
	npm run test:e2e -- --runInBand
	@echo "✅ E2E tests complete!"

test-e2e-single: ## Run single E2E test - Usage: make test-e2e-single TEST=01-chargepoint
	@echo "🧪 Running single E2E test: $(TEST)..."
	npm run test:e2e -- --testPathPatterns=$(TEST) --runInBand
	@echo "✅ E2E test complete!"

test-e2e-debug: ## Run E2E tests in debug mode
	@echo "🐛 Running E2E tests in debug mode..."
	npm run test:e2e -- --runInBand --verbose

test-all: test test-e2e ## Run all tests (unit + E2E)
	@echo "✅ All tests complete!"

lint: ## Lint TypeScript code (ESLint)
	@echo "🔍 Linting code..."
	npm run lint
	@echo "✅ Linting complete!"

format: ## Format code with Prettier
	@echo "✨ Formatting code..."
	npm run format
	@echo "✅ Formatting complete!"

format-check: ## Check code formatting without changes
	@echo "🔍 Checking code format..."
	npm run format:check
	@echo "✅ Format check complete!"

# ============================================================================
# 🗄️  DATABASE
# ============================================================================

db-init: ## Initialize databases (dev + test)
	@echo "🗄️  Initializing databases..."
	docker compose up -d postgres
	@sleep 10
	npm run test:e2e:init
	@echo "✅ Databases initialized!"

db-clean: ## Drop and recreate databases (⚠️  DESTRUCTIVE)
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Continue? (y/n) " confirm && [ "$${confirm}" = "y" ] || (echo "Aborted"; exit 1)
	docker compose down
	docker volume rm ocpp-charging-backend_postgres_data 2>/dev/null || true
	docker compose up -d postgres
	@sleep 10
	npm run test:e2e:init
	@echo "✅ Databases recreated!"

db-reset: db-clean ## Alias for db-clean

db-logs: ## Show database logs
	@echo "📋 Showing database logs..."
	docker compose logs -f postgres

db-shell: ## Connect to PostgreSQL shell
	@echo "🔌 Connecting to PostgreSQL..."
	docker compose exec postgres psql -U ocpp_user -d ocpp_db

# ============================================================================
# 🐳 DOCKER
# ============================================================================

docker-build: ## Build Docker image
	@echo "🐳 Building Docker image..."
	docker compose build
	@echo "✅ Docker image built!"

docker-up: ## Start Docker containers (detached)
	@echo "🐳 Starting Docker containers..."
	docker compose up -d
	@sleep 5
	@echo "✅ Docker containers started!"

docker-down: ## Stop and remove Docker containers
	@echo "🛑 Stopping Docker containers..."
	docker compose down
	@echo "✅ Docker containers stopped!"

docker-ps: ## Show running Docker containers
	@echo "🐳 Running containers:"
	docker compose ps

docker-logs: ## Show Docker logs (all services)
	@echo "📋 Showing Docker logs..."
	docker compose logs -f

docker-clean: ## Remove all Docker images and volumes (⚠️  DESTRUCTIVE)
	@echo "⚠️  WARNING: This will delete all Docker data!"
	@read -p "Continue? (y/n) " confirm && [ "$${confirm}" = "y" ] || (echo "Aborted"; exit 1)
	docker compose down -v
	@echo "✅ Docker cleanup complete!"

# ============================================================================
# 🔒 SECURITY & QUALITY
# ============================================================================

audit: ## Run npm security audit
	@echo "🔍 Running security audit..."
	npm audit
	@echo "✅ Audit complete!"

audit-fix: ## Fix npm security vulnerabilities
	@echo "🔧 Fixing security vulnerabilities..."
	npm audit fix
	@echo "✅ Vulnerabilities fixed!"

security: audit ## Alias for audit

typescript-check: ## Check TypeScript compilation
	@echo "🔷 Checking TypeScript compilation..."
	npx tsc --noEmit
	@echo "✅ TypeScript check passed!"

# ============================================================================
# 🧹 CLEANUP
# ============================================================================

clean: ## Remove build artifacts and temporary files
	@echo "🧹 Cleaning up..."
	rm -rf dist
	rm -rf coverage
	rm -rf node_modules/.cache
	@echo "✅ Cleanup complete!"

clean-all: clean ## Clean everything including node_modules
	@echo "🧹 Deep cleaning..."
	rm -rf node_modules
	rm -f package-lock.json
	@echo "✅ Deep cleanup complete!"

# ============================================================================
# 📊 PROJECT STATUS & INFO
# ============================================================================

status: docker-ps ## Show project status
	@echo ""
	@echo "🔷 TypeScript:"
	@npx tsc --version
	@echo ""
	@echo "🐳 Docker Compose:"
	@docker compose --version
	@echo ""
	@echo "📦 Node/npm:"
	@node --version && npm --version

info: ## Show project information
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║           OCPP Charging Backend - Project Info                 ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📂 Project Structure:"
	@echo "  src/              - Source code (CLEAN Architecture)"
	@echo "  test/             - Test files (unit + E2E)"
	@echo "  scripts/          - Build and utility scripts"
	@echo "  docker/           - Docker configuration"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  Unit tests:       make test"
	@echo "  E2E tests:        make test-e2e"
	@echo "  All tests:        make test-all"
	@echo "  Coverage:         make test-cov"
	@echo ""
	@echo "🚀 Development:"
	@echo "  Start dev:        make start-dev"
	@echo "  Start debug:      make start-debug"
	@echo "  Lint:             make lint"
	@echo "  Format:           make format"
	@echo ""
	@echo "🐳 Docker:"
	@echo "  Start services:   make docker-up"
	@echo "  Stop services:    make docker-down"
	@echo "  View logs:        make logs"
	@echo ""
	@echo "🗄️  Database:"
	@echo "  Initialize:       make db-init"
	@echo "  Reset (⚠️ ):      make db-reset"
	@echo "  Shell:            make db-shell"
	@echo ""

# ============================================================================
# 🚀 QUICK START COMMANDS
# ============================================================================

setup: install env-setup db-init ## Complete project setup
	@echo "✅ Project setup complete!"
	@echo "Next steps:"
	@echo "  1. Review .env file"
	@echo "  2. Run 'make start-dev' to start development"
	@echo "  3. Run 'make test-all' to run all tests"

quick-test: docker-up test-e2e-init test-e2e ## Quick test run (requires Docker)
	@echo "✅ Quick test complete!"

quick-dev: docker-up start-dev ## Quick dev start (requires Docker)
	@echo "✅ Development environment ready!"

# ============================================================================
# 📋 NOTES
# ============================================================================

# Notes for contributors:
# - Use 'make help' to see all available commands
# - All Docker commands require docker-compose installed
# - Database commands require PostgreSQL running in Docker
# - E2E tests require both databases (ocpp_db and ocpp_db_e2e)
# - For CI/CD pipelines, use 'make install-ci' instead of 'make install'
# - Use 'make clean-all' only when you need to reset everything
# - E2E test database (ocpp_db_e2e) is auto-initialized via 'npm run test:e2e:init'

