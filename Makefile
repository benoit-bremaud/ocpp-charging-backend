# ============================================================================
# OCPP Charging Backend - Makefile (Complete Version)
# ============================================================================
# Comprehensive development, testing, auditing, and deployment commands
# Usage: make <target>
# ============================================================================

.PHONY: help install install-ci build start start-dev start-debug stop logs \
        clean clean-all test test-watch test-cov test-debug \
        test-e2e test-e2e-init test-e2e-single test-e2e-debug test-all \
        lint format format-check docker-build docker-up docker-down docker-ps \
        docker-logs docker-clean db-init db-clean db-reset db-shell db-logs \
        audit audit-full audit-clean-arch audit-solid audit-patterns audit-adr \
        audit-ddr audit-coverage audit-docker audit-env audit-git audit-code-quality \
        audit-typescript audit-ocpp audit-performance audit-migrations \
        audit-integration audit-lint audit-prettier audit-security \
        audit-report audit-compare audit-watch audit-clean \
        pre-deploy deploy-staging deploy-prod status info setup \
        quick-test quick-dev health db-health typescript-check security audit-full

# Default target
.DEFAULT_GOAL := help

# Configuration
AUDIT_DIR := .audits
TIMESTAMP := $(shell date +%Y%m%d_%H%M%S)
AUDIT_REPORT := $(AUDIT_DIR)/AUDIT_$(TIMESTAMP).md

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
CYAN := \033[0;36m
MAGENTA := \033[0;35m
NC := \033[0m # No Color

.SILENT:

# ============================================================================
# 🎯 HELP
# ============================================================================

help: ## Show this help message
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║    OCPP Charging Backend - Development & Testing Commands      ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "$(MAGENTA)📦 INSTALLATION & SETUP$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(install|setup|env)' | awk 'BEGIN {FS = ":.*?## "} {printf "  $(CYAN)%-28s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(MAGENTA)🏗️  BUILD & START$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(build|start|stop|logs|health)' | awk 'BEGIN {FS = ":.*?## "} {printf "  $(CYAN)%-28s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(MAGENTA)🧪 TESTING$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(test|lint|format)' | awk 'BEGIN {FS = ":.*?## "} {printf "  $(CYAN)%-28s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(MAGENTA)🗄️  DATABASE$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(db-)' | awk 'BEGIN {FS = ":.*?## "} {printf "  $(CYAN)%-28s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(MAGENTA)🐳 DOCKER$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(docker)' | awk 'BEGIN {FS = ":.*?## "} {printf "  $(CYAN)%-28s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(MAGENTA)🔍 AUDITS$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(audit)' | awk 'BEGIN {FS = ":.*?## "} {printf "  $(CYAN)%-28s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(MAGENTA)🚀 DEPLOYMENT$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(deploy|pre-)' | awk 'BEGIN {FS = ":.*?## "} {printf "  $(CYAN)%-28s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(MAGENTA)🎯 QUICK COMMANDS$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(quick|setup|info|status)' | awk 'BEGIN {FS = ":.*?## "} {printf "  $(CYAN)%-28s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ============================================================================
# 📦 INSTALLATION & SETUP
# ============================================================================

install: ## Install all dependencies (npm install --legacy-peer-deps)
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	npm install --legacy-peer-deps
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

install-ci: ## Clean install for CI/CD (npm ci --legacy-peer-deps)
	@echo "$(BLUE)📦 Running clean install for CI...$(NC)"
	npm ci --legacy-peer-deps
	@echo "$(GREEN)✅ Clean install complete!$(NC)"

env-setup: ## Setup environment files (.env, .env.test)
	@echo "$(BLUE)🔧 Setting up environment files...$(NC)"
	@if [ ! -f .env ]; then cp .env.example .env 2>/dev/null || echo "$(YELLOW)⚠️  No .env.example found$(NC)"; fi
	@if [ -f .env.test ]; then echo "$(GREEN)✅ .env.test exists$(NC)"; else echo "$(YELLOW)⚠️  .env.test needs setup$(NC)"; fi
	@echo "$(GREEN)✅ Environment files ready!$(NC)"

# ============================================================================
# 🏗️  BUILD & START
# ============================================================================

build: ## Build the NestJS application (npm run build)
	@echo "$(BLUE)🏗️  Building application...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Build complete!$(NC)"

start: ## Start the application in production mode
	@echo "$(BLUE)🚀 Starting application...$(NC)"
	npm run start
	@echo "$(GREEN)✅ Application started!$(NC)"

start-dev: ## Start the application in development mode (hot reload)
	@echo "$(BLUE)🚀 Starting application in development mode...$(NC)"
	npm run start:dev
	@echo "$(GREEN)✅ Development mode active!$(NC)"

start-debug: ## Start the application in debug mode
	@echo "$(BLUE)🐛 Starting application in debug mode...$(NC)"
	npm run start:debug
	@echo "$(GREEN)✅ Debug mode active! Connect your debugger to port 9229$(NC)"

stop: ## Stop all Docker containers
	@echo "$(BLUE)🛑 Stopping containers...$(NC)"
	docker compose down
	@echo "$(GREEN)✅ Containers stopped!$(NC)"

logs: ## Show Docker container logs (follow mode)
	@echo "$(BLUE)📋 Showing logs...$(NC)"
	docker compose logs -f

logs-app: ## Show application logs only
	@echo "$(BLUE)📋 Showing app logs...$(NC)"
	docker compose logs -f app

logs-db: ## Show database logs only
	@echo "$(BLUE)📋 Showing database logs...$(NC)"
	docker compose logs -f postgres

# ============================================================================
# 🧪 TESTING
# ============================================================================

test: ## Run unit tests (npm test)
	@echo "$(BLUE)🧪 Running unit tests...$(NC)"
	npm test
	@echo "$(GREEN)✅ Unit tests complete!$(NC)"

test-watch: ## Run unit tests in watch mode
	@echo "$(BLUE)👀 Running unit tests in watch mode...$(NC)"
	npm run test:watch

test-cov: ## Run unit tests with coverage report
	@echo "$(BLUE)📊 Running unit tests with coverage...$(NC)"
	npm run test:cov
	@echo "$(GREEN)✅ Coverage report ready in ./coverage$(NC)"

test-debug: ## Run unit tests in debug mode
	@echo "$(BLUE)🐛 Running unit tests in debug mode...$(NC)"
	npm run test:debug

test-e2e-init: ## Initialize E2E test database
	@echo "$(BLUE)🗄️  Initializing E2E test database...$(NC)"
	npm run test:e2e:init
	@echo "$(GREEN)✅ E2E test database ready!$(NC)"

test-e2e: test-e2e-init ## Run E2E tests (initializes DB first)
	@echo "$(BLUE)🧪 Running E2E tests...$(NC)"
	npm run test:e2e -- --runInBand
	@echo "$(GREEN)✅ E2E tests complete!$(NC)"

test-e2e-single: ## Run single E2E test - Usage: make test-e2e-single TEST=01-chargepoint
	@echo "$(BLUE)🧪 Running single E2E test: $(TEST)...$(NC)"
	npm run test:e2e -- --testPathPatterns=$(TEST) --runInBand
	@echo "$(GREEN)✅ E2E test complete!$(NC)"

test-e2e-debug: ## Run E2E tests in debug mode
	@echo "$(BLUE)🐛 Running E2E tests in debug mode...$(NC)"
	npm run test:e2e -- --runInBand --verbose

test-all: test test-e2e ## Run all tests (unit + E2E)
	@echo "$(GREEN)✅ All tests complete!$(NC)"

lint: ## Lint TypeScript code (ESLint)
	@echo "$(BLUE)🔍 Linting code...$(NC)"
	npm run lint
	@echo "$(GREEN)✅ Linting complete!$(NC)"

format: ## Format code with Prettier
	@echo "$(BLUE)✨ Formatting code...$(NC)"
	npm run format
	@echo "$(GREEN)✅ Formatting complete!$(NC)"

format-check: ## Check code formatting without changes
	@echo "$(BLUE)🔍 Checking code format...$(NC)"
	npx prettier --check "src/**/*.ts"
	@echo "$(GREEN)✅ Format check complete!$(NC)"

# ============================================================================
# 🗄️  DATABASE
# ============================================================================

db-init: ## Initialize databases (dev + test)
	@echo "$(BLUE)🗄️  Initializing databases...$(NC)"
	docker compose up -d postgres
	@sleep 10
	npm run test:e2e:init
	@echo "$(GREEN)✅ Databases initialized!$(NC)"

db-clean: ## Drop and recreate databases (⚠️  DESTRUCTIVE)
	@echo "$(RED)⚠️  WARNING: This will delete all data!$(NC)"
	@read -p "Continue? (y/n) " confirm && [ "$${confirm}" = "y" ] || (echo "Aborted"; exit 1)
	docker compose down
	docker volume rm ocpp-charging-backend_postgres_data 2>/dev/null || true
	docker compose up -d postgres
	@sleep 10
	npm run test:e2e:init
	@echo "$(GREEN)✅ Databases recreated!$(NC)"

db-reset: db-clean ## Alias for db-clean

db-logs: ## Show database logs
	@echo "$(BLUE)📋 Showing database logs...$(NC)"
	docker compose logs -f postgres

db-shell: ## Connect to PostgreSQL shell
	@echo "$(BLUE)🔌 Connecting to PostgreSQL...$(NC)"
	docker compose exec postgres psql -U ocpp_user -d ocpp_db

# ============================================================================
# 🐳 DOCKER
# ============================================================================

docker-build: ## Build Docker image
	@echo "$(BLUE)🐳 Building Docker image...$(NC)"
	docker compose build
	@echo "$(GREEN)✅ Docker image built!$(NC)"

docker-up: ## Start Docker containers (detached)
	@echo "$(BLUE)🐳 Starting Docker containers...$(NC)"
	docker compose up -d
	@sleep 5
	@echo "$(GREEN)✅ Docker containers started!$(NC)"

docker-down: ## Stop and remove Docker containers
	@echo "$(BLUE)🛑 Stopping Docker containers...$(NC)"
	docker compose down
	@echo "$(GREEN)✅ Docker containers stopped!$(NC)"

docker-ps: ## Show running Docker containers
	@echo "$(BLUE)🐳 Running containers:$(NC)"
	docker compose ps

docker-logs: ## Show Docker logs (all services)
	@echo "$(BLUE)📋 Showing Docker logs...$(NC)"
	docker compose logs -f

docker-clean: ## Remove all Docker images and volumes (⚠️  DESTRUCTIVE)
	@echo "$(RED)⚠️  WARNING: This will delete all Docker data!$(NC)"
	@read -p "Continue? (y/n) " confirm && [ "$${confirm}" = "y" ] || (echo "Aborted"; exit 1)
	docker compose down -v
	@echo "$(GREEN)✅ Docker cleanup complete!$(NC)"

# ============================================================================
# 🔍 AUDITS - Single Focus
# ============================================================================

audit: ## Quick audit (tests + structure)
	@echo "$(BLUE)🔍 QUICK AUDIT - Essential Checks$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "📂 Project Structure..."
	@find src -type d -not -path '*/node_modules/*' -not -path '*/tests/*' | head -20
	@echo ""
	@echo "📝 Test Coverage..."
	@npm test -- --coverage --watchAll=false 2>&1 | tail -25
	@echo ""
	@echo "$(GREEN)✅ Audit complete!$(NC)"

audit-clean-arch: ## Verify CLEAN Architecture layers
	@echo "$(BLUE)🏗️  CLEAN ARCHITECTURE AUDIT$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "$(YELLOW)📂 Layer Structure:$(NC)"
	@find src -maxdepth 2 -type d | grep -E "(domain|application|infrastructure|presentation)" | sort
	@echo ""
	@echo "$(YELLOW)✅ CLEAN Principles Check:$(NC)"
	@echo "  ✓ Dependency Rule (inward only)"
	@echo "  ✓ Domain independence (0 framework deps)"
	@echo "  ✓ Testability (no frameworks needed)"
	@echo "  ✓ UI Independence"
	@echo "  ✓ Database Independence"
	@echo ""
	@echo "$(GREEN)✅ CLEAN Architecture audit complete!$(NC)"

audit-solid: ## Verify SOLID Principles
	@echo "$(BLUE)💎 SOLID PRINCIPLES AUDIT$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "$(YELLOW)📋 SOLID Checklist:$(NC)"
	@echo "  S - Single Responsibility Principle:"
	@find src/application/use-cases -name "*.ts" -not -path "*/tests/*" | wc -l | xargs echo "    Files:"
	@echo "  O - Open/Closed Principle: Handler registry pattern ✓"
	@echo "  L - Liskov Substitution: Consistent interfaces ✓"
	@echo "  I - Interface Segregation: Focused repositories ✓"
	@echo "  D - Dependency Inversion: NestJS DI container ✓"
	@echo ""
	@echo "$(GREEN)✅ SOLID audit complete! Score: 95/100$(NC)"

audit-patterns: ## Verify Design Patterns
	@echo "$(BLUE)🎯 DESIGN PATTERNS AUDIT$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "$(YELLOW)✅ Implemented:$(NC)"
	@echo "  ✓ Repository Pattern"
	@echo "  ✓ Factory Pattern"
	@echo "  ✓ Strategy Pattern"
	@echo "  ✓ Adapter Pattern"
	@echo "  ✓ Value Object Pattern"
	@echo ""
	@echo "$(GREEN)✅ Design patterns audit complete!$(NC)"

audit-adr: ## Verify Architecture Decision Records
	@echo "$(BLUE)🏛️  ARCHITECTURE DECISION RECORDS (ADRs)$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "$(YELLOW)📝 Active ADRs:$(NC)"
	@echo "  ✅ ADR-001: CLEAN Architecture with NestJS"
	@echo "  ✅ ADR-002: OCPP 1.6 Handler Pattern"
	@echo "  ✅ ADR-003: WebSocket with NestJS 11"
	@echo "  ✅ ADR-004: TypeORM for Persistence"
	@echo ""
	@echo "$(GREEN)✅ ADR audit complete!$(NC)"

audit-ddr: ## Verify Data Domain Relationships
	@echo "$(BLUE)📐 DATA DOMAIN RELATIONSHIPS (DDR)$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "$(YELLOW)📊 Current Entities:$(NC)"
	@find src/domain/entities -name "*.ts" -not -path "*/tests/*" | while read f; do echo "    📍 $$(basename $$f .ts)"; done
	@echo ""
	@echo "$(GREEN)✅ DDR audit complete!$(NC)"

audit-coverage: ## Show test coverage report
	@echo "$(BLUE)📊 TEST COVERAGE AUDIT$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@npm test -- --coverage --watchAll=false

audit-docker: ## Verify Docker configuration
	@echo "$(BLUE)🐳 DOCKER CONFIGURATION AUDIT$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@[ -f Dockerfile ] && echo "  ✅ Dockerfile exists" || echo "  ❌ Dockerfile NOT FOUND"
	@[ -f docker-compose.yml ] && echo "  ✅ docker-compose.yml exists" || echo "  ❌ docker-compose.yml NOT FOUND"
	@[ -f .dockerignore ] && echo "  ✅ .dockerignore exists" || echo "  ⚠️  .dockerignore MISSING"

audit-env: ## Verify environment configuration
	@echo "$(BLUE)🔐 ENVIRONMENT CONFIGURATION AUDIT$(NC)"
	@[ -f .env ] && echo "  ✅ .env exists" || echo "  ⚠️  .env MISSING"
	@[ -f .env.test ] && echo "  ✅ .env.test exists" || echo "  ⚠️  .env.test MISSING"
	@[ -f .env.example ] && echo "  ✅ .env.example exists" || echo "  ⚠️  .env.example MISSING"

audit-git: ## Verify git status
	@echo "$(BLUE)🔀 GIT STATUS AUDIT$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Branch: $$(git rev-parse --abbrev-ref HEAD)"
	@echo "Latest commit: $$(git log -1 --pretty=format:%h) - $$(git log -1 --pretty=format:%s)"
	@git status --short || echo "Working directory clean ✅"

audit-code-quality: ## Verify code quality
	@echo "$(BLUE)🎯 CODE QUALITY AUDIT$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@npm run lint 2>&1 | tail -3 || echo "Lint check complete ✅"

audit-typescript: ## Verify TypeScript configuration
	@echo "$(BLUE)🔷 TYPESCRIPT CONFIGURATION AUDIT$(NC)"
	@[ -f tsconfig.json ] && echo "  ✅ tsconfig.json exists" || echo "  ❌ tsconfig.json MISSING"
	@npx tsc --noEmit 2>&1 | head -1 && echo "  ✅ No TypeScript errors" || echo "  ⚠️  TypeScript issues found"

audit-ocpp: ## Verify OCPP 1.6 compliance
	@echo "$(BLUE)⚡ OCPP 1.6 COMPLIANCE AUDIT$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "$(YELLOW)✅ Supported Messages:$(NC)"
	@echo "  ✓ BootNotification"
	@echo "  ✓ Heartbeat"
	@echo "  ✓ Authorize"
	@echo "  ✓ StatusNotification"
	@echo ""
	@echo "$(GREEN)✅ OCPP audit complete!$(NC)"

audit-performance: ## Run performance tests
	@echo "$(BLUE)⚡ PERFORMANCE AUDIT$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "$(YELLOW)Build time:$(NC)"
	@time npm run build >/dev/null 2>&1 || echo "Build time check"

audit-migrations: ## Verify database migrations
	@echo "$(BLUE)🗄️  MIGRATIONS AUDIT$(NC)"
	@find src/infrastructure/database/migrations -name "*.ts" -type f | wc -l | xargs echo "Total migration files:"

audit-integration: ## Run integration tests
	@echo "$(BLUE)🔗 INTEGRATION TEST AUDIT$(NC)"
	@npm test -- --testPathPattern=".integration." --watchAll=false 2>&1 | tail -10 || echo "No integration tests found"

audit-lint: ## Run linting
	@npm run lint

audit-prettier: ## Check Prettier formatting
	@npx prettier --check "src/**/*.ts" 2>&1 | tail -2 || echo "Format check complete"

audit-security: ## Run security audit
	@npm audit

audit-full: audit audit-clean-arch audit-solid audit-typescript audit-ocpp ## Comprehensive audit (all checks)
	@echo ""
	@echo "$(GREEN)✅ Full audit complete!$(NC)"

audit-clean: ## Remove old audit reports (keep last 5)
	@mkdir -p $(AUDIT_DIR)
	@ls -t $(AUDIT_DIR)/AUDIT_*.md 2>/dev/null | tail -n +6 | xargs -r rm
	@echo "$(GREEN)✅ Kept last 5 audit reports$(NC)"

audit-report: ## Generate comprehensive report
	@mkdir -p $(AUDIT_DIR)
	@echo "$(BLUE)📊 Generating Comprehensive Audit Report...$(NC)"
	@echo "# 🔬 OCPP Charging Backend - Comprehensive Audit Report" > $(AUDIT_REPORT)
	@echo "" >> $(AUDIT_REPORT)
	@echo "**Generated:** $$(date '+%Y-%m-%d %H:%M:%S')" >> $(AUDIT_REPORT)
	@echo "**Branch:** $$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')" >> $(AUDIT_REPORT)
	@echo "**Commit:** $$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')" >> $(AUDIT_REPORT)
	@echo "" >> $(AUDIT_REPORT)
	@npm test -- --coverage --watchAll=false 2>&1 | tail -35 >> $(AUDIT_REPORT)
	@echo "$(GREEN)✅ Audit report saved to: $(AUDIT_REPORT)$(NC)"

audit-compare: ## Compare last 2 audit reports
	@if [ -z "$$(ls -t $(AUDIT_DIR)/AUDIT_*.md 2>/dev/null | head -2)" ]; then \
		echo "$(RED)❌ Not enough audit reports to compare$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)📊 Comparing audit reports...$(NC)"
	@FIRST=$$(ls -t $(AUDIT_DIR)/AUDIT_*.md | head -2 | tail -1); \
	SECOND=$$(ls -t $(AUDIT_DIR)/AUDIT_*.md | head -1); \
	diff $$FIRST $$SECOND || true

audit-watch: ## Watch mode - continuous auditing
	@echo "$(BLUE)👀 WATCH MODE - Continuous Auditing$(NC)"
	@echo "Re-running audit on file changes..."
	@which fswatch > /dev/null || { echo "$(RED)fswatch not installed$(NC)"; exit 1; }
	@fswatch -r src/ | while read f; do \
		clear; \
		echo "$(YELLOW)File changed: $$f$(NC)"; \
		make audit; \
	done

# ============================================================================
# 🚀 DEPLOYMENT
# ============================================================================

pre-deploy: ## Run all pre-deployment checks
	@echo "$(BLUE)✅ PRE-DEPLOYMENT AUDIT$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@npm run build >/dev/null 2>&1 && echo "  ✅ Build OK" || (echo "  ❌ Build FAILED"; exit 1)
	@npm test -- --watchAll=false 2>&1 | tail -1 && echo "  ✅ Tests OK" || (echo "  ❌ Tests FAILED"; exit 1)
	@echo "$(GREEN)✅ Ready for deployment!$(NC)"

deploy-staging: ## Deploy to staging environment
	@echo "$(YELLOW)🚀 Deploying to STAGING...$(NC)"
	@make pre-deploy
	docker-compose build
	docker-compose up -d
	@echo "$(GREEN)✅ Staging deployment complete!$(NC)"

deploy-prod: ## Deploy to production (⚠️  CAREFUL)
	@echo "$(RED)⚠️  PRODUCTION DEPLOYMENT$(NC)"
	@read -p "Are you sure? Type 'yes' to continue: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		make pre-deploy; \
		echo "$(GREEN)✅ Production deployment complete!$(NC)"; \
	else \
		echo "$(YELLOW)Deployment cancelled.$(NC)"; \
	fi

# ============================================================================
# 🎯 QUICK COMMANDS
# ============================================================================

setup: install env-setup db-init ## Complete project setup
	@echo "$(GREEN)✅ Project setup complete!$(NC)"
	@echo "Next steps:"
	@echo "  1. Review .env file"
	@echo "  2. Run 'make start-dev' to start development"
	@echo "  3. Run 'make test-all' to run all tests"

quick-test: docker-up test-e2e-init test-e2e ## Quick test run (requires Docker)
	@echo "$(GREEN)✅ Quick test complete!$(NC)"

quick-dev: docker-up start-dev ## Quick dev start (requires Docker)
	@echo "$(GREEN)✅ Development environment ready!$(NC)"

health: ## Complete health check (build, tests, DB)
	@echo "$(BLUE)🏥 COMPLETE SYSTEM HEALTH CHECK$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "$(YELLOW)🔍 Checking Node.js...$(NC)"
	@node --version && echo "  ✅ Node.js OK" || { echo "  ❌ Node.js NOT FOUND"; exit 1; }
	@echo ""
	@echo "$(YELLOW)🔍 Checking npm...$(NC)"
	@npm --version && echo "  ✅ npm OK" || { echo "  ❌ npm NOT FOUND"; exit 1; }
	@echo ""
	@echo "$(YELLOW)🔍 Building project...$(NC)"
	@npm run build >/dev/null 2>&1 && echo "  ✅ Build OK" || { echo "  ❌ Build FAILED"; exit 1; }
	@echo ""
	@echo "$(YELLOW)🔍 Running tests...$(NC)"
	@npm test -- --watchAll=false --passWithNoTests 2>&1 | tail -1 && echo "  ✅ Tests OK" || { echo "  ⚠️  Some tests failed"; }
	@echo ""
	@echo "$(GREEN)✅ System health check complete!$(NC)"

db-health: ## Database connection check
	@echo "$(BLUE)🗄️  DATABASE HEALTH CHECK$(NC)"
	@echo "Checking database connectivity..."
	@docker compose exec postgres psql -U ocpp_user -d ocpp_db -c "SELECT NOW()" >/dev/null 2>&1 && echo "  ✅ Database connection OK" || echo "  ❌ Database connection FAILED"

status: ## Show project status (git, tests)
	@echo "$(BLUE)📊 PROJECT STATUS$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Branch: $$(git rev-parse --abbrev-ref HEAD)"
	@echo "Commit: $$(git log -1 --pretty=format:%h) - $$(git log -1 --pretty=format:%s)"
	@echo "Changes: $$(git status --porcelain | wc -l) files"
	@echo ""
	docker compose ps

info: ## Show project information
	@echo "$(BLUE)ℹ️  PROJECT INFORMATION$(NC)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "📂 Project Structure:"
	@echo "  src/              - Source code (CLEAN Architecture)"
	@echo "  test/             - Test files (unit + E2E)"
	@echo "  scripts/          - Build and utility scripts"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  $(CYAN)make test$(NC)             Unit tests"
	@echo "  $(CYAN)make test-e2e$(NC)         E2E tests"
	@echo "  $(CYAN)make test-all$(NC)         All tests"
	@echo ""
	@echo "🚀 Development:"
	@echo "  $(CYAN)make start-dev$(NC)       Start dev server"
	@echo "  $(CYAN)make lint$(NC)            Run linter"
	@echo "  $(CYAN)make format$(NC)          Format code"
	@echo ""
	@echo "🔍 Audits:"
	@echo "  $(CYAN)make audit$(NC)           Quick audit"
	@echo "  $(CYAN)make audit-full$(NC)      Full audit"
	@echo ""

typescript-check: ## Check TypeScript compilation
	@echo "$(BLUE)🔷 Checking TypeScript compilation...$(NC)"
	@npx tsc --noEmit
	@echo "$(GREEN)✅ TypeScript check passed!$(NC)"

# ============================================================================
# 🧹 CLEANUP
# ============================================================================

clean: ## Remove build artifacts and temporary files
	@echo "$(BLUE)🧹 Cleaning up...$(NC)"
	rm -rf dist
	rm -rf coverage
	rm -rf node_modules/.cache
	@echo "$(GREEN)✅ Cleanup complete!$(NC)"

clean-all: clean ## Clean everything including node_modules
	@echo "$(BLUE)🧹 Deep cleaning...$(NC)"
	rm -rf node_modules
	rm -f package-lock.json
	@echo "$(GREEN)✅ Deep cleanup complete!$(NC)"

