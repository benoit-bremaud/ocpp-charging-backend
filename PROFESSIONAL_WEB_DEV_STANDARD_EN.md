# 🏛️ PROFESSIONAL WEB DEVELOPMENT QUALITY STANDARD
## Complete Audit & Compliance Guide v6.0

**Version:** 6.0 (English)  
**Date:** December 10, 2025  
**Status:** 📌 **OFFICIAL ENTERPRISE STANDARD**  
**Language:** 100% English  
**Scope:** Full-Stack TypeScript Web Development (Node.js, NestJS, Express, React, Next.js, Angular)

---

## 📋 EXECUTIVE SUMMARY

This comprehensive document defines the **professional standard for clean, modern, and production-ready web applications**. It serves as:

- **A quality charter** for development teams
- **A review checklist** for architecture and code audits
- **A learning map** for developers advancing their craft
- **An automation framework** with 50+ integrated commands
- **A governance model** for sustainable technical excellence

### 🎯 Target Grade: **A (80%+)** across 14 audit categories

**Total Scoring System:** 5,600 points across **16 quality pillars** and **14 measurable categories**

---

## 📑 TABLE OF CONTENTS

1. [Scope & Quality Pillars](#section-1-scope--quality-pillars)
2. [Core Design Principles](#section-2-core-design-principles)
3. [Software Architecture](#section-3-software-architecture)
4. [Design Patterns](#section-4-design-patterns)
5. [Project Structure & Modularization](#section-5-project-structure--modularization)
6. [Code Quality & Conventions](#section-6-code-quality--conventions)
7. [Testing & Quality Strategy](#section-7-testing--quality-strategy)
8. [Security Best Practices](#section-8-security-best-practices)
9. [Performance & Scalability](#section-9-performance--scalability)
10. [Data & Persistence Quality](#section-10-data--persistence-quality)
11. [API Lifecycle & Contracts](#section-11-api-lifecycle--contracts)
12. [DevOps, CI/CD & 12-Factor](#section-12-devops-cicd--12-factor)
13. [Observability](#section-13-observability)
14. [Front-End: UX, Accessibility, SEO & GEO](#section-14-front-end-ux-accessibility-seo--geo)
15. [Compliance, GDPR & Legal](#section-15-compliance-gdpr--legal)
16. [Error Handling & Resilience](#section-16-error-handling--resilience)
17. [Team Practices & Governance](#section-17-team-practices--governance)
18. [Quick Audit Checklist](#section-18-audit-checklist-condensed)
19. [Scoring & Grading](#section-19-scoring--grading)
20. [Makefile Automation](#section-20-makefile-automation-reference)

---

## SECTION 1: SCOPE & QUALITY PILLARS

### 1.1 The 16 Quality Pillars

A professional full-stack web application must be evaluated and optimized across **16 distinct quality dimensions**:

| # | Pillar | Description | Critical | Automation |
|---|--------|-------------|----------|-----------|
| 1 | **Design Principles** | SOLID, DRY, KISS, YAGNI, SoC | 🔴 YES | `make audit-solid` |
| 2 | **Architecture** | Clean, Hexagonal, DDD, CQRS patterns | 🔴 YES | `make audit-architecture` |
| 3 | **Design Patterns** | GoF, enterprise, and UI patterns | 🟠 HIGH | `make audit-patterns` |
| 4 | **Project Structure** | Modularization, boundaries, dependencies | 🔴 YES | `make audit-structure` |
| 5 | **Code Quality** | TypeScript strict, ESLint, Prettier, conventions | 🔴 YES | `make audit-code-quality` |
| 6 | **Testing Strategy** | Unit, integration, E2E, coverage | 🔴 YES | `make audit-tests` |
| 7 | **Security** | OWASP Top 10, validation, secrets, deps | 🔴 YES | `make audit-security` |
| 8 | **Performance** | Bundle size, API latency, DB optimization | 🟠 HIGH | `make audit-performance` |
| 9 | **Data Integrity** | Schema, migrations, concurrency, backup | 🟠 HIGH | `make audit-database` |
| 10 | **API Contracts** | Versioning, documentation, stability | 🟠 HIGH | `make audit-api` |
| 11 | **DevOps & CI/CD** | 12-Factor, IaC, automation, deployment | 🟠 HIGH | `make audit-infrastructure` |
| 12 | **Observability** | Logging, metrics, tracing, health checks | 🟠 HIGH | `make audit-logging` |
| 13 | **Front-End UX** | Accessibility, responsive, user experience | 🟠 HIGH | `make audit-ux` |
| 14 | **SEO & GEO** | Search, AI-discovery, content structure | 🟡 MEDIUM | `make audit-seo-geo` |
| 15 | **Compliance** | GDPR, privacy, legal, retention | 🔴 YES | `make audit-compliance` |
| 16 | **Team & Governance** | Git workflow, reviews, ADRs, knowledge sharing | 🟡 MEDIUM | `make audit-governance` |

### 1.2 Quality Maturity Levels

```
Level 5: EXCELLENCE      (90-100%) = Production-ready immediately
Level 4: VERY GOOD       (80-89%)  = Minor improvements needed
Level 3: GOOD            (70-79%)  = 2-3 weeks of focused work
Level 2: ACCEPTABLE      (60-69%)  = Priority issues to address
Level 1: CRITICAL        (< 60%)   = Blocks production deployment
```

---

## SECTION 2: CORE DESIGN PRINCIPLES

### 2.1 SOLID Principles (Foundation)

#### S – Single Responsibility Principle

**Definition:** Each class or module should have **one and only one reason to change**.

**Benefits:**
- Easier to understand, test, and maintain
- Changes in one responsibility don't affect others
- Reusability improves

**Example – Violation:**
```typescript
// ❌ BAD: Mixes multiple responsibilities
class UserService {
  createUser(data) { /* user logic */ }
  sendEmail(to, template) { /* email logic */ }
  logActivity(event) { /* logging logic */ }
  validatePayment(amount) { /* payment logic */ }
}
```

**Example – Correct:**
```typescript
// ✅ GOOD: Each class has one responsibility
class UserService {
  create(data): User { /* only user creation */ }
}

class EmailService {
  send(to, template): void { /* only emails */ }
}

class AuditLogger {
  log(event): void { /* only logging */ }
}

class PaymentValidator {
  validate(amount): ValidationResult { /* only payments */ }
}
```

**Codebase Target:**
- Classes < 300 lines
- Methods < 50 lines
- One primary abstraction per class

---

#### O – Open/Closed Principle

**Definition:** Software entities should be **open for extension but closed for modification**.

**Benefits:**
- New features without changing existing code
- Reduces bug risk
- Encourages abstraction and polymorphism

**Example – Violation:**
```typescript
// ❌ BAD: Must modify every time a new charge type is added
class ChargeCalculator {
  calculate(type: string, amount: number) {
    if (type === 'AC') return amount * 0.15;
    if (type === 'DC') return amount * 0.20;
    if (type === 'FAST') return amount * 0.25;
    // Adding a new type requires modifying this function
    throw new Error('Unknown type');
  }
}
```

**Example – Correct:**
```typescript
// ✅ GOOD: Extension without modification
interface ChargeStrategy {
  calculate(amount: number): number;
}

class ACChargeStrategy implements ChargeStrategy {
  calculate(amount: number) { return amount * 0.15; }
}

class DCChargeStrategy implements ChargeStrategy {
  calculate(amount: number) { return amount * 0.20; }
}

class ChargeCalculator {
  constructor(private strategy: ChargeStrategy) {}
  calculate(amount: number) {
    return this.strategy.calculate(amount);
  }
}
// New charge type? Add new strategy class. No modifications needed.
```

**Codebase Target:**
- Use composition over large conditionals
- Strategy pattern for varying behavior
- Template Method for algorithms

---

#### L – Liskov Substitution Principle

**Definition:** **Subtypes must be substitutable for their base types** without breaking the program.

**Benefits:**
- Polymorphism works correctly
- Contracts between classes are clear
- Prevents unexpected runtime errors

**Example – Violation:**
```typescript
// ❌ BAD: Subclass breaks the contract
class Animal {
  move(): void { console.log('Moving...'); }
}

class Bird extends Animal {
  move(): void { console.log('Flying...'); }
}

class Penguin extends Bird {
  move(): void { 
    throw new Error('Penguins cannot fly!'); 
    // Violates the parent contract!
  }
}

function makeAnimalMove(animal: Animal) {
  animal.move(); // Crashes if animal is Penguin
}
```

**Example – Correct:**
```typescript
// ✅ GOOD: Proper substitution
interface Movable {
  move(): void;
}

class FlyingBird implements Movable {
  move() { console.log('Flying...'); }
}

class SwimmingBird implements Movable {
  move() { console.log('Swimming...'); }
}

class Penguin implements Movable {
  move() { console.log('Swimming...'); }
}

function makeMovable(movable: Movable) {
  movable.move(); // Safe for all types
}
```

**Codebase Target:**
- Preconditions not weakened in overrides
- Postconditions not strengthened
- Invariants maintained across hierarchy

---

#### I – Interface Segregation Principle

**Definition:** **Clients should not depend on interfaces they don't use**.

**Benefits:**
- Smaller, focused interfaces
- Easier to implement and test
- Less coupling

**Example – Violation:**
```typescript
// ❌ BAD: Fat interface forces unnecessary dependencies
interface ChargeStationService {
  authenticate(): Promise<void>;
  getStatus(): Promise<StationStatus>;
  getPrice(): Promise<number>;
  reportFault(): Promise<void>;
  getMaintenanceSchedule(): Promise<Schedule>;
}

class ChargePointAdapter implements ChargeStationService {
  // Must implement ALL methods even if only getStatus is needed
}
```

**Example – Correct:**
```typescript
// ✅ GOOD: Segregated, focused interfaces
interface StatusProvider {
  getStatus(): Promise<StationStatus>;
}

interface PricingProvider {
  getPrice(): Promise<number>;
}

interface MaintenanceProvider {
  getMaintenanceSchedule(): Promise<Schedule>;
}

class ChargePointAdapter implements StatusProvider {
  getStatus() { /* only this */ }
}
```

**Codebase Target:**
- Interfaces with 1-4 methods maximum
- Each interface represents a cohesive contract
- "Fat" interfaces broken into smaller ones

---

#### D – Dependency Inversion Principle

**Definition:** **Depend on abstractions, not on concrete implementations**.

**Benefits:**
- Loose coupling between components
- Easy to swap implementations (e.g., DB, external APIs)
- Testability improves (mock implementations)

**Example – Violation:**
```typescript
// ❌ BAD: Direct dependency on concrete classes
class OrderService {
  private emailService = new GmailEmailService(); // Tightly coupled
  private database = new PostgresDatabase(); // Tightly coupled

  async createOrder(order: Order) {
    this.database.save(order);
    this.emailService.send(order.email);
  }
}

// Can't test without real Gmail and Postgres!
```

**Example – Correct:**
```typescript
// ✅ GOOD: Depend on abstractions
interface EmailService {
  send(to: string, message: string): Promise<void>;
}

interface OrderRepository {
  save(order: Order): Promise<void>;
}

class OrderService {
  constructor(
    private emailService: EmailService,
    private repository: OrderRepository
  ) {}

  async createOrder(order: Order) {
    await this.repository.save(order);
    await this.emailService.send(order.email);
  }
}

// Easy to test with mocks:
const mockEmail = { send: jest.fn() };
const mockRepo = { save: jest.fn() };
const service = new OrderService(mockEmail, mockRepo);
```

**Codebase Target:**
- NestJS `@Injectable()` with dependency injection
- Repositories as interfaces
- Services injected, not instantiated with `new`

---

### 2.2 Additional Core Principles

#### DRY – Don't Repeat Yourself
- No duplicated business logic
- Shared utilities and services for common patterns
- **Codebase Target:** < 3% duplication (SonarQube metric)

#### KISS – Keep It Simple, Stupid
- Simplest solution that correctly solves the problem
- Avoid over-engineering and premature abstraction
- **Codebase Target:** Cyclomatic complexity < 5 per function

#### YAGNI – You Aren't Gonna Need It
- Build only what's required by current specifications
- Avoid speculative features
- **Codebase Target:** Zero legacy/dead code

#### Separation of Concerns (SoC)
- UI separate from business logic
- Business logic separate from infrastructure
- Each layer has clear responsibility
- **Codebase Target:** No business rules in controllers/views

#### High Cohesion / Low Coupling
- Modules internally consistent
- Few, well-defined external dependencies
- **Codebase Target:** Coupling ratio < 0.5, cohesion > 0.7

#### Law of Demeter
- "Talk to your immediate friends"
- Avoid chains like `a.b.c.d()`
- **Codebase Target:** Max 2-3 levels of property access

#### SLAP – Single Level of Abstraction
- Each function at one abstraction level
- High-level functions call descriptive helpers
- **Codebase Target:** No low-level details mixed with high-level logic

#### CQS – Command Query Separation
- Methods that mutate state (commands) ≠ methods that read state (queries)
- Command: side effects, no return (or return success indicator)
- Query: no side effects, always returns data
- **Codebase Target:** Clear naming: `getStatus()` vs `updateStatus()`

---

## SECTION 3: SOFTWARE ARCHITECTURE

### 3.1 Clean Architecture (Recommended)

Clean Architecture organizes code into **concentric layers with dependencies pointing inward**:

```
┌────────────────────────────────────────────┐
│         Presentation / Controllers         │  HTTP, GraphQL, CLI
├────────────────────────────────────────────┤
│      Interface Adapters / Gateways         │  DTOs, Mappers, Repositories
├────────────────────────────────────────────┤
│   Application / Use Cases / Orchestration  │  Business workflows
├────────────────────────────────────────────┤
│            Domain / Core / Entities        │  Pure business logic
└────────────────────────────────────────────┘
```

#### Layer 1: Domain / Core

**Responsibility:** Pure business logic, framework-independent

**Contains:**
- Entities (with identity)
- Value Objects (immutable, identity by value)
- Domain Services (stateless business operations)
- Domain Events (things that happened)
- Repository Interfaces (ports)

**Key Constraint:** **NO framework imports** (no @nestjs, @angular, typeorm decorators)

**Example – Domain:**
```typescript
// ✅ GOOD: Pure domain layer
export class User {
  private constructor(
    public readonly id: UserId,
    public readonly email: Email,
    public readonly passwordHash: string
  ) {}

  static create(email: Email, password: string): User {
    const hash = bcryptHash(password);
    return new User(UserId.generate(), email, hash);
  }

  authenticate(password: string): boolean {
    return bcryptCompare(password, this.passwordHash);
  }
}

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

---

#### Layer 2: Application / Use Cases

**Responsibility:** Orchestrate domain objects to implement business workflows

**Contains:**
- Use Case classes (one per business action)
- Application Services
- DTOs (Data Transfer Objects)
- Mappers (domain ↔ DTO)
- Port interfaces for outbound adapters

**Key Constraint:** Depend on domain only; call repositories via interfaces

**Example – Application:**
```typescript
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const email = Email.create(request.email);
    const user = User.create(email, request.password);
    
    await this.userRepository.save(user);
    
    return new CreateUserResponse(user.id);
  }
}
```

---

#### Layer 3: Interface Adapters

**Responsibility:** Convert between external formats and domain objects

**Contains:**
- Controllers (HTTP requests → DTOs)
- Presenters (domain objects → view models)
- Repository Implementations (domain interfaces → DB code)
- External API clients

**Key Constraint:** Keep controllers thin; delegate to use cases

**Example – Adapter (NestJS):**
```typescript
@Controller('users')
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() request: CreateUserDto) {
    const result = await this.createUserUseCase.execute(request);
    return new UserPresenter(result).toJSON();
  }
}

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(private typeOrmRepository: Repository<UserEntity>) {}

  async save(user: User): Promise<void> {
    const entity = UserMapper.toPersistent(user);
    await this.typeOrmRepository.save(entity);
  }
}
```

---

#### Layer 4: Infrastructure / Frameworks

**Responsibility:** Framework glue, external integrations

**Contains:**
- Framework configuration (NestJS modules, Express app)
- Database connections, migrations
- Message brokers, caches
- External API clients
- File storage, logging backends

**Key Constraint:** Pure implementation details; replaceable in theory

---

### 3.2 Other Architectural Styles

#### Hexagonal Architecture (Ports & Adapters)

- Domain/application in the center
- Ports (interfaces) for inbound (HTTP, CLI) and outbound (DB, queues) adapters
- Each I/O channel is an adapter

#### Domain-Driven Design (DDD)

**Key Concepts:**
- **Bounded Contexts:** Clear subdomains (auth, billing, charging stations)
- **Ubiquitous Language:** Domain terms reflected consistently in code
- **Aggregates:** Clusters of entities with aggregate root enforcing invariants
- **Domain Events:** Explicit events when something important happens

**Example – DDD in charging domain:**
```typescript
export class ChargeSession extends AggregateRoot {
  private connectorId: ConnectorId;
  private userId: UserId;
  private kwhDelivered: number = 0;
  private status: ChargeSessionStatus = 'IDLE';

  static create(connectorId: ConnectorId, userId: UserId): ChargeSession {
    const session = new ChargeSession();
    session.connectorId = connectorId;
    session.userId = userId;
    session.addDomainEvent(new ChargeSessionStarted(connectorId, userId));
    return session;
  }

  updateMeterValue(meterValue: number): void {
    const delta = meterValue - this.kwhDelivered;
    this.kwhDelivered = meterValue;
    this.addDomainEvent(new MeterValueRecorded(this.connectorId, delta));
  }

  stop(): void {
    this.status = 'STOPPED';
    this.addDomainEvent(new ChargeSessionStopped(this.connectorId, this.kwhDelivered));
  }
}
```

#### CQRS (Command Query Responsibility Segregation)

- **Commands:** Modify state (create, update, delete)
- **Queries:** Read state (no side effects)
- Can use different storage/optimization for each

#### Monolithic Modular vs Microservices vs BFF

- **Monolithic Modular:** Single deployable with clear internal module boundaries
- **Microservices:** Independent deployables, each owns its data, eventual consistency
- **BFF (Backend For Frontend):** Backend layer tailored to specific frontend (web, mobile, admin)

**Architecture should be explicit and documented** (via ADRs).

---

## SECTION 4: DESIGN PATTERNS

### 4.1 GoF Creational Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Factory** | Create objects without specifying concrete classes | `UserFactory.create(data)` |
| **Abstract Factory** | Families of related objects | Multiple DB implementations |
| **Builder** | Step-by-step construction of complex objects | `new OrderBuilder().withUser().withItems().build()` |
| **Singleton** | Single instance, global access | Config manager (use DI container instead) |
| **Prototype** | Clone existing objects | Rarely used in web apps |

### 4.2 GoF Structural Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Adapter** | Wrap incompatible interfaces | Wrap legacy API to match current interface |
| **Facade** | Simpler interface over complex subsystem | Payment facade hiding payment provider details |
| **Decorator** | Extend behavior dynamically | Add logging, caching around services |
| **Composite** | Part-whole hierarchies | Tree structures (org charts, categories) |
| **Proxy** | Surrogate for another object | Lazy loading, caching, remote access |
| **Bridge** | Decouple abstraction from implementation | Platform-specific rendering |

### 4.3 GoF Behavioral Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Strategy** | Interchangeable algorithms | Different charge pricing strategies |
| **Observer / Pub-Sub** | Notify subscribers of events | Event-driven architecture |
| **Command** | Represent actions as objects | Undo/redo, queued commands |
| **State** | Encapsulate state-dependent behavior | Order states (pending, confirmed, shipped) |
| **Chain of Responsibility** | Pass request along chain of handlers | Middleware chains, permission checks |
| **Template Method** | Algorithm skeleton in base class | Document processing steps |

### 4.4 Enterprise & DDD Patterns

| Pattern | Use Case |
|---------|----------|
| **Repository** | Abstraction over persistence |
| **Unit of Work** | Group changes into transaction |
| **Application Service** | Use case orchestrator |
| **Domain Service** | Stateless business logic |
| **Specification** | Reusable domain business rules |
| **Aggregate Root** | Enforce domain invariants |
| **Domain Event** | Explicit side effects |
| **Saga / Process Manager** | Long-running workflows |

### 4.5 Front-End Patterns

| Pattern | Framework | Use Case |
|---------|-----------|----------|
| **Container / Presentational** | React | Separation of concerns in components |
| **Higher-Order Components (HOC)** | React | Code reuse, logic abstraction |
| **Render Props** | React | Logic sharing without nesting |
| **Hooks** | React | Logic reuse, side effects |
| **MVVM** | Angular | Model-View-ViewModel separation |
| **Smart / Dumb Components** | Angular, React | Data vs presentation |
| **State Management** | Redux, NgRx, Zustand | Centralized state |

**Guideline:** Use patterns **intentionally** to solve recurring problems, not for their own sake.

---

## SECTION 5: PROJECT STRUCTURE & MODULARIZATION

### 5.1 Recommended Folder Structure

```
ocpp-charging-backend/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── domain/               # Business logic (NO FRAMEWORKS)
│   │   │   │   ├── entities/
│   │   │   │   ├── value-objects/
│   │   │   │   ├── repositories/     # Interfaces only
│   │   │   │   └── events/
│   │   │   ├── application/          # Use cases & orchestration
│   │   │   │   ├── use-cases/
│   │   │   │   ├── services/
│   │   │   │   ├── mappers/
│   │   │   │   └── dtos/
│   │   │   ├── infrastructure/       # Framework & externals
│   │   │   │   ├── database/
│   │   │   │   ├── config/
│   │   │   │   └── external-services/
│   │   │   └── presentation/         # Controllers & HTTP
│   │   │       ├── controllers/
│   │   │       └── websocket/
│   │   └── test/                     # Tests
│   │
│   └── web/                          # React/Next/Angular frontend
│       ├── src/
│       │   ├── domain/               # Business logic
│       │   ├── application/          # Services, hooks, state
│       │   ├── presentation/         # Components, pages
│       │   └── infrastructure/       # API clients, utils
│       └── test/
│
├── libs/
│   ├── shared-types/                 # Shared TypeScript types
│   ├── shared-ui/                    # Design system, UI components
│   ├── validation/                   # Shared validation rules
│   └── ocpp-types/                   # OCPP message types
│
├── Makefile                          # Automation (50+ commands)
├── docker-compose.yml
├── .github/workflows/
└── docs/
    ├── AUDIT_COMPLIANCE_GUIDE_EN.md
    ├── QUICK_START_EN.md
    ├── adr/                          # Architecture Decision Records
    └── api/                          # API documentation
```

### 5.2 Key Rules

- ✅ **By feature/domain, not by type**
  - ✗ `components/`, `services/`, `utils/` only
  - ✓ `features/user/`, `features/billing/`, `features/charging/`

- ✅ **Clear dependency direction**
  - Domain imports nothing
  - Application imports domain only
  - Infrastructure imports everything
  - Presentation imports application only

- ✅ **Use TypeScript path aliases**
  - `@app/domain`, `@app/application`, `@app/infrastructure`
  - Avoid deep relative imports: `../../../utils`

- ✅ **Lazy loading of modules**
  - NestJS: `imports: [dynamic()]`
  - Front-end: Route-based code splitting

- ✅ **No circular dependencies**
  - Lint rules enforce module boundaries
  - Use Nx `nx-enforce-module-boundaries`

---

## SECTION 6: CODE QUALITY & CONVENTIONS

### 6.1 TypeScript Strict Mode (Mandatory)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "useDefineForClassFields": true
  }
}
```

**Target:** 0% usage of `any` type

**How to handle unknowns:**
```typescript
// ❌ AVOID
function process(data: any) { }

// ✅ GOOD
function process(data: unknown) {
  if (typeof data === 'string') { }
}

// ✅ BETTER: Use types
function process(data: CreateUserRequest) { }
```

---

### 6.2 ESLint & Prettier Configuration

**ESLint Rules (Essential):**
- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/explicit-return-types`
- `no-console` (except in specific contexts)
- `no-debugger`
- `no-var`
- `prefer-const`
- `eqeqeq` (enforce `===`)
- Custom rule: No imports from infrastructure into domain

**Prettier Settings:**
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

### 6.3 Naming Conventions

```typescript
// Variables & Methods: camelCase
const userName = 'John';
function getUserById() { }

// Classes & Interfaces: PascalCase
class UserService { }
interface IUserRepository { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_TIMEOUT = 5000;

// Files: kebab-case
user.service.ts
create-user.dto.ts
user-repository.interface.ts

// Directories: kebab-case
user-management/
charge-sessions/
payment-processing/

// Booleans: is*, has*, can*, should*
const isActive = true;
const hasPermission = true;
const canDelete = false;
const shouldRetry = true;

// Arrays: plural
const users: User[] = [];
const items: Item[] = [];

// Callbacks: on* or handle*
function onClick() { }
function handleSubmit() { }
function onError() { }
```

---

### 6.4 DRY & Abstraction

**No Code Duplication:**
```typescript
// ❌ AVOID: Duplicated validation logic
class UserService {
  create(email: string) {
    if (!email || email.length < 5) throw new Error('Invalid email');
  }
  update(email: string) {
    if (!email || email.length < 5) throw new Error('Invalid email');
  }
}

// ✅ GOOD: Extracted validation
function validateEmail(email: string): void {
  if (!email || email.length < 5) throw new Error('Invalid email');
}

class UserService {
  create(email: string) {
    validateEmail(email);
  }
  update(email: string) {
    validateEmail(email);
  }
}

// ✅ BETTER: Value Object
class Email {
  constructor(private value: string) {
    if (!value || value.length < 5) throw new Error('Invalid email');
  }
  static create(value: string): Email {
    return new Email(value);
  }
}

class UserService {
  create(email: Email) { }
  update(email: Email) { }
}
```

**Target:** SonarQube duplication metric < 3%

---

### 6.5 Comments & Documentation

**Self-Documenting Code First:**
```typescript
// ❌ AVOID
const x = 5; // max value
function f(a) { // check user
  return a > x;
}

// ✅ GOOD
const MAX_LOGIN_ATTEMPTS = 5;
function isUserUnderLoginAttemptLimit(attempts: number): boolean {
  return attempts > MAX_LOGIN_ATTEMPTS;
}
```

**Comments for Non-Obvious Logic:**
```typescript
// Explain WHY, not WHAT
// ✅ GOOD
// We use optimistic locking here because concurrent updates are frequent
// during charging sessions, and pessimistic locking caused timeout issues
this.version++;

// ✅ GOOD
// Cache for 5 minutes: balance is read-heavy but updated infrequently
await cache.set(key, value, { ttl: 300 });

// ❌ AVOID
// Increment version
this.version++;
```

**JSDoc for Public APIs:**
```typescript
/**
 * Creates a new user account
 * @param email - User's email address (must be unique)
 * @param password - Raw password (will be hashed)
 * @returns Created user with hashed password
 * @throws ValidationError if email is invalid or duplicate
 * @throws ExternalError if email verification service fails
 */
async function createUser(
  email: string,
  password: string
): Promise<User> {
  // implementation
}
```

---

## SECTION 7: TESTING & QUALITY STRATEGY

### 7.1 Test Pyramid

```
        /\
       /E2E\         5-10%   - Full user flows (Cypress, Playwright)
      /______\       
     /        \
    / Integration\ 15-25% - API + DB + external integrations
   /______________\
  /                \
 /   Unit Tests    \ 65-75% - Functions, services, domain logic
/____________________\
```

### 7.2 Unit Tests

**Target:** 75% of total tests

**Scope:** Domain services, use cases, utilities – **no DB, no HTTP**

**Tools:** Jest, Vitest

**Example:**
```typescript
describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let mockOrderRepository: jest.Mock;

  beforeEach(() => {
    mockOrderRepository = {
      save: jest.fn(),
    };
    useCase = new CreateOrderUseCase(mockOrderRepository);
  });

  it('should create and persist a new order', async () => {
    const request = new CreateOrderRequest(userId, items);
    const result = await useCase.execute(request);

    expect(result.orderId).toBeDefined();
    expect(mockOrderRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId })
    );
  });

  it('should reject empty order items', async () => {
    const request = new CreateOrderRequest(userId, []);
    
    await expect(useCase.execute(request)).rejects.toThrow(
      ValidationError
    );
  });
});
```

---

### 7.3 Integration Tests

**Target:** 20% of total tests

**Scope:** Multiple layers together – use cases with real database, message brokers

**Tools:** NestJS Testing Module, Testcontainers for DB

**Example:**
```typescript
describe('UserModule Integration', () => {
  let app: INestApplication;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [UserModule, DatabaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = app.get(UserRepository);
    await app.init();
  });

  it('should create and retrieve user from database', async () => {
    const user = User.create(Email.create('test@example.com'), 'password');
    await userRepository.save(user);

    const retrieved = await userRepository.findById(user.id);
    expect(retrieved?.email.value).toBe('test@example.com');
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

### 7.4 E2E Tests

**Target:** 5-10% of total tests

**Scope:** Critical user journeys – full HTTP stack

**Tools:** Cypress, Playwright, NestJS E2E testing

**Example:**
```typescript
describe('User Registration E2E', () => {
  it('should register new user and login', async () => {
    const app = await startApp();
    const email = `user-${Date.now()}@example.com`;

    // Register
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'secure123' })
      .expect(201);

    expect(registerRes.body.userId).toBeDefined();

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'secure123' })
      .expect(200);

    expect(loginRes.body.token).toBeDefined();
  });
});
```

---

### 7.5 Coverage & Metrics

**Targets:**
- Overall coverage: ≥ 85%
- Business logic: ≥ 90%
- Critical paths: 100%

**Tools:** Jest coverage, SonarQube

**Coverage report:**
```bash
make coverage
# Generates HTML report in coverage/lcov-report/index.html
```

---

### 7.6 Mutation Testing (Advanced)

**Tool:** Stryker

**Purpose:** Measure quality of test scenarios (not just coverage %)

```bash
npm install --save-dev @stryker-mutator/core
npm run stryker
```

---

## SECTION 8: SECURITY BEST PRACTICES

### 8.1 OWASP Top 10 (2021)

| # | Vulnerability | Prevention |
|---|---|---|
| **1** | **Broken Access Control** | JWT/OAuth2, RBAC/ABAC, verify permissions per endpoint |
| **2** | **Cryptographic Failures** | HTTPS everywhere, TLS 1.3+, encrypt sensitive data at rest |
| **3** | **Injection** | ORM with parameterized queries, input validation, sanitization |
| **4** | **Insecure Design** | Threat modeling, security requirements in user stories |
| **5** | **Security Misconfiguration** | Env vars, no default credentials, security headers |
| **6** | **Vulnerable Components** | `npm audit`, Snyk, regular dependency updates |
| **7** | **Authentication Failures** | Strong passwords, MFA, secure session management, JWT exp |
| **8** | **Data Integrity Issues** | Input validation (client + server), type checking |
| **9** | **Logging & Monitoring Failures** | Structured logs, audit trails, alerting |
| **10** | **SSRF** | URL validation, whitelist external endpoints |

### 8.2 Input Validation

**Server-Side (Mandatory):**
```typescript
// ✅ GOOD: NestJS DTO + class-validator
import { IsEmail, IsStrongPassword, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @MaxLength(50)
  name: string;
}

@Post()
async create(@Body() dto: CreateUserDto) {
  // DTO validated automatically by NestJS ValidationPipe
  // Invalid requests rejected before reaching handler
}
```

**Client-Side (UX, not security):**
```typescript
// React
const [errors, setErrors] = useState<Record<string, string>>({});

function validate(data: CreateUserRequest): boolean {
  const newErrors = {};
  if (!data.email.includes('@')) newErrors.email = 'Invalid email';
  if (data.password.length < 8) newErrors.password = 'Too short';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}
```

### 8.3 Secrets Management

```typescript
// ❌ AVOID: Hardcoded secrets
const JWT_SECRET = 'my-super-secret-key';
const DB_PASSWORD = 'postgres123';

// ✅ GOOD: Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const DB_PASSWORD = process.env.DATABASE_PASSWORD;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not configured');
}
```

**.env.example (check into git):**
```
JWT_SECRET=<generate-with-crypto>
DATABASE_PASSWORD=<secure-password>
API_KEY=<third-party-api-key>
```

**.env (DO NOT check into git, in .gitignore):**
```
JWT_SECRET=actual-secret-key-here
DATABASE_PASSWORD=actual-password
API_KEY=actual-api-key
```

### 8.4 Authentication & Authorization

```typescript
// JWT Strategy (NestJS)
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}

// Role-Based Authorization Guard
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some((role) => user.roles.includes(role));
  }

  constructor(private reflector: Reflector) {}
}

// Usage
@Controller('users')
export class UserController {
  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  async listUsers() {
    // Only ADMIN role can access
  }
}
```

### 8.5 Dependency Security

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Force update (careful)
npm audit fix --force

# Continuous scanning
npm install --save-dev snyk
snyk test
```

### 8.6 Error Handling & Information Leakage

```typescript
// ❌ BAD: Exposes stack trace
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack });
});

// ✅ GOOD: User-facing error, internal logging
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ExecutionContext) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error('Exception', exception); // Log internally

    const status = 500;
    response.status(status).json({
      statusCode: status,
      message: 'An error occurred. Please contact support.',
      timestamp: new Date().toISOString(),
      // No stack trace, no sensitive details
    });
  }
}
```

### 8.7 Transport Security

```typescript
// HTTPS Enforcement
const app = await NestFactory.create(AppModule);

// Security headers
import helmet from '@nestjs/helmet';
app.use(helmet());

// CORS Configuration
app.enableCors({
  origin: process.env.CORS_ORIGIN, // Explicit whitelist
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

await app.listen(3000);
```

---

## SECTION 9: PERFORMANCE & SCALABILITY

### 9.1 Front-End Performance

**Bundle Optimization:**
```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer

# Targets
- Main bundle: < 250 KB (gzipped < 100 KB)
- Vendor bundle: < 500 KB
- Total (gzipped): < 150 KB
```

**Code Splitting:**
```typescript
// React
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}

// Next.js
import dynamic from 'next/dynamic';
const DynamicComponent = dynamic(() => import('./Component'));
```

**Image Optimization:**
```typescript
// Next.js Image component
import Image from 'next/image';
<Image 
  src="/photo.jpg" 
  alt="Photo" 
  width={400} 
  height={300}
  placeholder="blur"
  priority
/>

// Responsive images
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="fallback" />
</picture>
```

**Lazy Loading:**
```typescript
// Route-based splitting
const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, loadChildren: () => import('./dashboard.module').then(m => m.DashboardModule) }
];

// Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadHeavyComponent();
      observer.unobserve(entry.target);
    }
  });
});
observer.observe(targetElement);
```

---

### 9.2 Back-End Performance

**Database Optimization:**
```typescript
// Indexes on frequently queried fields
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_sessions_user_id ON charge_sessions(user_id);

// Avoid N+1 queries
// ❌ BAD
const users = await userRepository.find();
for (const user of users) {
  user.orders = await orderRepository.findByUserId(user.id); // N queries!
}

// ✅ GOOD: Use eager loading
const users = await userRepository.find({
  relations: ['orders'], // Load in single query
});

// ✅ BETTER: Pagination
const users = await userRepository.find({
  relations: ['orders'],
  skip: 0,
  take: 20, // Limit results
});
```

**Caching Strategy:**
```typescript
// Redis cache for frequently accessed data
@Injectable()
export class UserCache {
  constructor(private cache: RedisService) {}

  async getUser(userId: string): Promise<User> {
    // Try cache first
    const cached = await this.cache.get(`user:${userId}`);
    if (cached) return JSON.parse(cached);

    // Load from DB
    const user = await this.userRepository.findById(userId);

    // Cache for 1 hour
    await this.cache.set(`user:${userId}`, JSON.stringify(user), 3600);

    return user;
  }

  invalidateUser(userId: string) {
    return this.cache.delete(`user:${userId}`);
  }
}
```

**Connection Pooling:**
```typescript
// TypeORM configuration
{
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  pool: {
    min: 5,
    max: 20, // Max connections
    idleTimeoutMillis: 30000,
  },
}
```

**Async Non-Blocking I/O:**
```typescript
// ❌ BAD: Blocking operation
for (const order of orders) {
  // Synchronous operation blocks event loop
  const total = calculateTotal(order);
}

// ✅ GOOD: Async operations
const totals = await Promise.all(
  orders.map(order => calculateTotalAsync(order))
);

// ✅ BETTER: Batch processing
const totals = await batchCalculate(orders, { batchSize: 100 });
```

---

### 9.3 Monitoring Performance

```bash
# Load testing with k6
npm install --save-dev k6

# Stress test critical endpoints
k6 run load-test.js

# Targets
- API response time: < 500ms (p95)
- Database query: < 100ms
- Concurrent users: > 1000
```

---

## SECTION 10: DATA & PERSISTENCE QUALITY

### 10.1 Data Model Design

**Principles:**
- **Align with domain:** Reflect business concepts
- **Normalization:** Avoid redundancy (usually 3NF)
- **Referential integrity:** Foreign keys, constraints
- **Proper types:** Integer vs string, date precision

**Example – Charging Session:**
```sql
CREATE TABLE charge_sessions (
  id UUID PRIMARY KEY,
  connector_id UUID NOT NULL REFERENCES connectors(id),
  user_id UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  kwh_delivered DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) NOT NULL CHECK (status IN ('IDLE', 'ACTIVE', 'STOPPED')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (connector_id) REFERENCES connectors(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_sessions_user_id ON charge_sessions(user_id);
CREATE INDEX idx_sessions_connector_id ON charge_sessions(connector_id);
CREATE INDEX idx_sessions_status ON charge_sessions(status);
```

---

### 10.2 Database Migrations

**Tool:** TypeORM migrations, Flyway, or Liquibase

```typescript
// TypeORM migration
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateChargeSessionsTable1702178400000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'charge_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'status', type: 'varchar', length: 20 },
          // ... more columns
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('charge_sessions');
  }
}
```

**Execution:**
```bash
npm run typeorm migration:generate -n CreateChargeSessionsTable
npm run typeorm migration:run
npm run typeorm migration:revert
```

---

### 10.3 Backup & Disaster Recovery

**Strategy:**
- Daily automated backups
- Point-in-time recovery capability
- Tested restore procedures
- Offsite backup copies

```bash
# Backup
pg_dump -U postgres mydb > backup-$(date +%Y%m%d).sql

# Restore
psql -U postgres mydb < backup-20231210.sql

# Automated backup with cron
0 2 * * * pg_dump -U postgres mydb > /backups/backup-$(date +\%Y\%m\%d).sql
```

---

### 10.4 Concurrency Handling

**Pessimistic Locking (Row Lock):**
```typescript
const session = await queryRunner.query(
  'SELECT * FROM charge_sessions WHERE id = $1 FOR UPDATE',
  [sessionId]
);
// Other transactions wait until this one completes
```

**Optimistic Locking (Version Field):**
```typescript
@Entity()
export class ChargeSession {
  @Column()
  version: number = 1;

  updateStatus(newStatus: string) {
    this.status = newStatus;
    this.version++; // Increment version
  }
}

// Update only if version matches
const result = await this.repo.update(
  { id: sessionId, version: 1 },
  { status: 'STOPPED', version: 2 }
);

if (result.affected === 0) {
  throw new OptimisticLockError('Session was modified by another process');
}
```

---

### 10.5 PII & Privacy Handling

```typescript
// Encrypt sensitive data at rest
@Entity()
export class User {
  @Column()
  @Exclude() // Don't expose in responses
  email: string;

  @Column()
  @Transform(({ value }) => maskEmail(value)) // Hash or mask
  emailHash: string;

  // Retention: Delete after 12 months of inactivity
  @Column()
  lastLoginAt: Date;
}

// Audit trail
@Entity()
export class AuditLog {
  @Column()
  action: 'CREATE' | 'UPDATE' | 'DELETE';

  @Column()
  entityId: string;

  @Column()
  userId: string;

  @Column()
  timestamp: Date;

  @Column({ type: 'json' })
  changeSet: Record<string, any>; // What changed
}
```

---

## SECTION 11: API LIFECYCLE & CONTRACTS

### 11.1 Versioning Strategy

**URL-Based (Explicit):**
```
GET /api/v1/users          # Version 1
GET /api/v2/users          # Version 2 (breaking changes)
```

**Header-Based (Mediated):**
```
GET /api/users
API-Version: 2.0           # Server-routed based on header
```

**Recommendation:** URL-based for clarity and caching benefits

---

### 11.2 Contract-First (OpenAPI / Swagger)

```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: OCPP Charging API
  version: 1.0.0

paths:
  /api/v1/users:
    post:
      summary: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '400':
          description: Validation error

components:
  schemas:
    CreateUserRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8

    UserResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
        createdAt:
          type: string
          format: date-time
```

**NestJS Swagger Integration:**
```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('OCPP Charging API')
  .setDescription('Charging station management API')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Endpoint Documentation:**
```typescript
@Post('/users')
@ApiCreatedResponse({ type: UserResponse })
@ApiBadRequestResponse({ description: 'Validation failed' })
async create(@Body() dto: CreateUserDto): Promise<UserResponse> {
  // ...
}
```

---

### 11.3 Deprecation & Breaking Changes

```typescript
// Mark for deprecation
@Deprecated({ replacedBy: '/api/v2/users' })
@Get('/api/v1/users')
async listUsersV1() { }

// New version
@Get('/api/v2/users')
async listUsersV2() { }

// Gradual migration
// 1. Deploy v2 alongside v1 (3 months notice)
// 2. v1 returns deprecation header: Sunset: Sat, 01 Jan 2024 00:00:00 GMT
// 3. Remove v1 after EOL date
```

---

### 11.4 Error Model Consistency

```typescript
// Standard error response
interface ErrorResponse {
  statusCode: number;
  errorCode: string;     // Machine-readable: USER_NOT_FOUND
  message: string;       // Human-readable
  details?: Record<string, any>; // Field validation errors
  timestamp: string;
  traceId: string;       // For log correlation
}

// Examples
{
  "statusCode": 404,
  "errorCode": "USER_NOT_FOUND",
  "message": "User with ID 123 not found",
  "timestamp": "2023-12-10T12:00:00Z",
  "traceId": "abc-123-def"
}

{
  "statusCode": 400,
  "errorCode": "VALIDATION_FAILED",
  "message": "Request validation failed",
  "details": {
    "email": "Invalid email format",
    "password": "Minimum 8 characters required"
  },
  "timestamp": "2023-12-10T12:00:00Z",
  "traceId": "abc-123-def"
}
```

---

## SECTION 12: DEVOPS, CI/CD & 12-FACTOR

### 12.1 The Twelve-Factor App

| Factor | Principle |
|--------|-----------|
| **1. Codebase** | Single codebase tracked in version control, deployed to multiple environments |
| **2. Dependencies** | Explicitly declared (package.json) and isolated |
| **3. Config** | Environment variables, not hardcoded |
| **4. Backing Services** | Treat DB, cache, message broker as attached resources |
| **5. Build/Release/Run** | Strict separation of build, release, and run stages |
| **6. Processes** | Stateless execution |
| **7. Port Binding** | Service is self-contained, exports HTTP |
| **8. Concurrency** | Horizontal scaling via multiple processes |
| **9. Disposability** | Fast startup, graceful shutdown |
| **10. Dev/Prod Parity** | Same dependencies, services, versions |
| **11. Logs** | Write to stdout, aggregation by environment |
| **12. Admin Processes** | One-off tasks in same environment as app |

---

### 12.2 CI/CD Pipeline Example

**GitHub Actions Workflow:**
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm run test:ci
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost/test

      - name: Upload coverage
        uses: codecov/codecov-action@v3

      - name: Build
        run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to staging
        run: ./scripts/deploy-staging.sh
        env:
          STAGING_TOKEN: ${{ secrets.STAGING_TOKEN }}

  deploy-prod:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: ./scripts/deploy-prod.sh
        env:
          PROD_TOKEN: ${{ secrets.PROD_TOKEN }}
```

---

### 12.3 Infrastructure as Code (IaC)

**Docker Dockerfile:**
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js || exit 1

CMD ["node", "dist/main.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/ocpp
      REDIS_URL: redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ocpp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## SECTION 13: OBSERVABILITY

### 13.1 Structured Logging

**Implementation:**
```typescript
import { Logger } from '@nestjs/common';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

@Injectable()
export class OrderService {
  private logger = new Logger('OrderService');

  async createOrder(request: CreateOrderRequest) {
    this.logger.debug({ request }, 'Creating order');

    try {
      const order = await this.repository.save(order);
      
      this.logger.log({
        orderId: order.id,
        userId: request.userId,
        timestamp: new Date().toISOString(),
      }, 'Order created successfully');

      return order;
    } catch (error) {
      this.logger.error({
        error: error.message,
        stack: error.stack,
        request,
        timestamp: new Date().toISOString(),
      }, 'Failed to create order');

      throw error;
    }
  }
}
```

**Log Levels:**
- `DEBUG`: Development details
- `INFO`: Business events (order created, user logged in)
- `WARN`: Potentially problematic (deprecated API usage, retry attempt)
- `ERROR`: Error conditions requiring attention
- `FATAL`: System failure requiring immediate action

---

### 13.2 Metrics & SLOs

**Key Metrics:**
```typescript
// Define SLOs
export const chargeSessionSLO = {
  latency_p99: 500, // 99th percentile < 500ms
  error_rate: 0.001, // < 0.1% errors
  availability: 0.999, // 99.9% uptime
};

// Collect metrics
const metrics = {
  http_request_duration_ms: new Histogram(...),
  database_query_duration_ms: new Histogram(...),
  cache_hit_rate: new Gauge(...),
  active_sessions: new Gauge(...),
  orders_per_minute: new Counter(...),
};

// Emit metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.http_request_duration_ms
      .labels(req.method, req.path, res.statusCode)
      .observe(duration);
  });
  next();
});
```

---

### 13.3 Distributed Tracing

```typescript
// OpenTelemetry integration
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Traces automatically propagated through async operations
// View in Jaeger UI: http://localhost:16686
```

---

### 13.4 Health Checks

```typescript
@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get('/live')
  liveness() {
    // Is the service running?
    return { status: 'ok' };
  }

  @Get('/ready')
  async readiness() {
    // Is the service ready to handle traffic?
    return this.health.check([
      () => this.database.ping(),
      () => this.cache.ping(),
    ]);
  }
}

// Kubernetes integration
// livenessProbe:
//   httpGet:
//     path: /health/live
//     port: 3000
//   initialDelaySeconds: 10
//   periodSeconds: 10
//
// readinessProbe:
//   httpGet:
//     path: /health/ready
//     port: 3000
//   initialDelaySeconds: 5
//   periodSeconds: 5
```

---

## SECTION 14: FRONT-END: UX, ACCESSIBILITY, SEO & GEO

### 14.1 Accessibility (WCAG 2.1 AA)

**Semantic HTML:**
```html
<!-- ❌ BAD: div-itis -->
<div class="header">
  <div class="nav"><div>Home</div><div>About</div></div>
</div>

<!-- ✅ GOOD: Semantic -->
<header>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
```

**ARIA for Dynamic Content:**
```html
<button aria-label="Close modal" aria-pressed="false" onclick="closeModal()">
  ✕
</button>

<div role="alert" aria-live="polite">
  Form submitted successfully!
</div>

<div aria-expanded="false" role="button" onclick="toggleMenu()">
  Menu
</div>
```

**Keyboard Navigation:**
```typescript
// Tab order, focus management
<form>
  <label htmlFor="email">Email:</label>
  <input id="email" type="email" required />
  
  <label htmlFor="password">Password:</label>
  <input id="password" type="password" required />
  
  <button type="submit">Sign In</button>
</form>

// Focus management in modals
const modal = useRef<HTMLDivElement>(null);
useEffect(() => {
  modal.current?.focus();
}, [open]);
```

**Color Contrast:**
```css
/* Minimum 4.5:1 for normal text, 3:1 for large text */
.text {
  color: #000000; /* Black */
  background: #ffffff; /* White */
  /* Contrast ratio: 21:1 ✓ */
}
```

---

### 14.2 SEO Best Practices

**Semantic HTML:**
```html
<main>
  <article>
    <h1>How to Set Up a Charging Station</h1>
    <p>Published on <time datetime="2023-12-10">December 10, 2023</time></p>
    
    <section>
      <h2>Installation Steps</h2>
      <ol>
        <li>Choose location</li>
        <li>Install hardware</li>
        <li>Configure network</li>
      </ol>
    </section>
  </article>
</main>
```

**Meta Tags:**
```html
<head>
  <title>Premium EV Charging Solutions | ChargeNow</title>
  <meta name="description" content="Fast, reliable EV charging for your home or business. OCPP-compliant stations with smart pricing.">
  <meta name="keywords" content="EV charging, OCPP, electric vehicles">
  <link rel="canonical" href="https://chargenow.com/pricing">
  
  <!-- Open Graph (sharing) -->
  <meta property="og:title" content="Premium EV Charging Solutions">
  <meta property="og:description" content="Fast, reliable EV charging">
  <meta property="og:image" content="https://chargenow.com/og-image.jpg">
  <meta property="og:url" content="https://chargenow.com/pricing">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Premium EV Charging Solutions">
</head>
```

**Sitemaps & Robots:**
```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://chargenow.com/</loc>
    <lastmod>2023-12-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://chargenow.com/pricing</loc>
    <lastmod>2023-12-09</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>

<!-- robots.txt -->
User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://chargenow.com/sitemap.xml
```

**Core Web Vitals:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

```typescript
// Monitor with web-vitals library
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log); // Layout shifts
getFID(console.log); // Input delay
getLCP(console.log); // Paint timing
```

---

### 14.3 GEO – Generative Engine Optimization

**Definition:** Optimizing content for **AI-generated answers** in ChatGPT, Claude, Perplexity, Google AI Overviews, etc.

**Key Principles:**

1. **Machine-Scannable Structure**
   ```html
   <!-- Clear hierarchy -->
   <h1>How to Install an EVSE</h1>
   <h2>System Requirements</h2>
   <p>You need:</p>
   <ul>
     <li>240V power supply</li>
     <li>NEMA 6-50 outlet</li>
     <li>Proper grounding</li>
   </ul>
   
   <h2>Installation Steps</h2>
   <ol>
     <li>Turn off power at breaker</li>
     <li>Install outlet box</li>
     <li>Run wiring and conduit</li>
   </ol>
   ```

2. **Authority & Sourcing**
   - Publish on official site AND reputable third-party channels
   - Contribute to industry blogs, technical forums, wikis
   - Build backlinks and citations

3. **Depth & Contextuality**
   - Long-form content (1000+ words for complex topics)
   - Include comparisons, pros/cons, edge cases
   - Structured examples and code snippets

4. **Consistency Across Channels**
   - Same terminology across docs, blog, support articles
   - Consistent positioning and messaging
   - Cross-link related content

5. **Structured Data**
   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "HowTo",
     "name": "Install an EVSE",
     "step": [
       {
         "@type": "HowToStep",
         "name": "Turn off power",
         "text": "Turn off the breaker for this circuit"
       },
       {
         "@type": "HowToStep",
         "name": "Install outlet",
         "text": "Install NEMA 6-50 outlet box"
       }
     ]
   }
   </script>
   ```

6. **Monitor AI Engines**
   - Track how ChatGPT, Perplexity, etc. answer queries in your domain
   - Which sources get cited?
   - Where is your content missing or misrepresented?

7. **Ethical Optimization**
   - Focus on high-quality, accurate, well-sourced content
   - No keyword stuffing or deception
   - Complement traditional SEO, not replace it

---

## SECTION 15: COMPLIANCE, GDPR & LEGAL

### 15.1 Data Governance

**Personal Data Inventory:**
```
System: Charging Backend
Owner: Compliance Team
Last Audit: 2023-12-10

Data Types Collected:
├─ Users: ID, Email, Name, Phone (Lawful basis: contract)
├─ Usage: Session start/end, kWh, cost (Lawful basis: contract)
├─ Payments: Card last 4 digits, receipt (Lawful basis: contract)
└─ Support: Tickets, Chat logs (Lawful basis: legitimate interest)

Retention Periods:
├─ User account: Until deletion request
├─ Session logs: 3 years (tax requirement)
├─ Payment records: 7 years (tax requirement)
└─ Support tickets: 2 years
```

---

### 15.2 Data Subject Rights (GDPR Articles 12-22)

**Right of Access (Article 15):**
```typescript
@Post('data-export')
async exportMyData(@Req() req: Request) {
  const userId = req.user.id;
  const data = await this.dataService.exportUserData(userId);
  return response.download(data, 'my-data.json');
}
```

**Right to Rectification (Article 16):**
```typescript
@Patch('profile')
async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
  const user = req.user;
  // Allow corrections
  await this.userService.update(user.id, dto);
}
```

**Right to Erasure (Article 17):**
```typescript
@Delete('account')
async deleteAccount(@Req() req: Request) {
  const userId = req.user.id;
  
  // Delete personal data
  await this.userService.delete(userId);
  
  // Anonymize transaction history
  await this.sessionService.anonymize(userId);
  
  // Log for audit trail
  this.auditLog.record('USER_DELETED', userId);
}
```

**Right to Portability (Article 20):**
```typescript
// Export data in machine-readable format
@Get('data-portable')
async portableData(@Req() req: Request) {
  const data = {
    profile: await this.userService.get(req.user.id),
    sessions: await this.sessionService.findAll(req.user.id),
    payments: await this.paymentService.findAll(req.user.id),
  };
  return data; // JSON
}
```

---

### 15.3 Privacy by Design

```typescript
// Privacy by Design principles:

// 1. Data minimization
class User {
  email: string; // ✓ Necessary
  // ✗ No: birthday, dietary preferences, etc.
}

// 2. Purpose limitation
// Email collected for account: only used for login/notifications
// NOT sold to marketing, NOT used for profiling

// 3. Encryption
const hashedPassword = await bcrypt.hash(password, 10);

// 4. Retention
setInterval(() => {
  // Delete old logs (30 days retention)
  deleteLogsOlderThan(30);
}, 24 * 60 * 60 * 1000);

// 5. Pseudonymization
const sessionLog = {
  pseudonymId: hash(userId), // Not actual ID
  action: 'CHARGE_STARTED',
  timestamp: new Date(),
};

// 6. Transparent privacy policy
// Clear language, not legalese
// Linked from every page
```

---

### 15.4 Cookie & Tracking Consent

```typescript
// Cookie consent banner
<CookieConsent>
  <p>
    We use cookies for essential functionality (authentication) 
    and analytics (with your consent).
  </p>
  <button onClick={acceptAll}>Accept All</button>
  <button onClick={acceptEssential}>Accept Essential Only</button>
  <a href="/privacy">Privacy Policy</a>
</CookieConsent>

// Only load analytics after consent
useEffect(() => {
  if (consentStatus === 'ACCEPTED') {
    loadGoogleAnalytics();
    loadHotjar();
  }
}, [consentStatus]);
```

---

## SECTION 16: ERROR HANDLING & RESILIENCE

### 16.1 Typed Error Hierarchy

```typescript
// Base domain error
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Specific domain errors
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_FAILED';

  constructor(
    public readonly field: string,
    message: string
  ) {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(
    public readonly entityType: string,
    public readonly id: string,
    message?: string
  ) {
    super(message || `${entityType} ${id} not found`);
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
}

export class InsufficientFundsError extends DomainError {
  readonly code = 'INSUFFICIENT_FUNDS';

  constructor(
    public readonly available: number,
    public readonly required: number
  ) {
    super(`Insufficient funds: ${available} < ${required}`);
  }
}
```

### 16.2 Exception Filters (NestJS)

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ExecutionContext) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log the error
    this.logger.error({
      exception,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });

    // Handle domain errors
    if (exception instanceof ValidationError) {
      return response.status(400).json({
        statusCode: 400,
        errorCode: exception.code,
        message: exception.message,
        details: { field: exception.field },
        timestamp: new Date().toISOString(),
      });
    }

    if (exception instanceof NotFoundError) {
      return response.status(404).json({
        statusCode: 404,
        errorCode: exception.code,
        message: exception.message,
        timestamp: new Date().toISOString(),
      });
    }

    // Default: hide implementation details
    response.status(500).json({
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

### 16.3 Resilience Patterns

**Retry with Exponential Backoff:**
```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

**Circuit Breaker:**
```typescript
enum CircuitState {
  CLOSED,    // Normal operation
  OPEN,      // Failing, reject requests
  HALF_OPEN, // Testing if service recovered
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > 60000) {
        // Try again after 1 minute
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= 5) {
      this.state = CircuitState.OPEN;
    }
  }
}
```

**Idempotency:**
```typescript
// Idempotency key to ensure same request returns same result
@Post('charge-sessions')
async startCharging(
  @Headers('Idempotency-Key') idempotencyKey: string,
  @Body() request: StartChargingRequest
) {
  // Check if already processed
  const cached = await this.cache.get(`idempotency:${idempotencyKey}`);
  if (cached) {
    return cached; // Return same result
  }

  // Process request
  const result = await this.chargingService.start(request);

  // Cache result for 24 hours
  await this.cache.set(`idempotency:${idempotencyKey}`, result, 86400);

  return result;
}
```

---

## SECTION 17: TEAM PRACTICES & GOVERNANCE

### 17.1 Git Workflow (Gitflow)

```
main (production releases)
  ↑
  ├─ release/v1.2.0 (release candidate)
  │   ├─ hotfix/critical-bug → back to main & develop
  │
develop (integration branch)
  ├─ feature/user-auth → code review → merge to develop
  ├─ feature/payment-integration → code review → merge
  └─ bugfix/session-timeout → code review → merge
```

**Branch Naming:**
```
feature/user-authentication
feature/ocpp-message-validation
bugfix/session-timeout
hotfix/security-vulnerability
release/v1.2.0
```

---

### 17.2 Commit Message Convention (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (formatting)
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Test-related
- `chore:` Build, dependencies

**Examples:**
```
feat(auth): add JWT refresh token support

Implement automatic refresh token rotation to improve security.
Tokens now expire after 1 hour with refresh tokens valid for 30 days.

Closes #123
```

```
fix(charging): handle concurrent meter value updates

Use optimistic locking to prevent race conditions when multiple
meter values arrive simultaneously.

Fixes #456
```

---

### 17.3 Pull Request Checklist

**Before opening a PR:**
- [ ] Code passes lint and tests locally
- [ ] No hardcoded secrets or credentials
- [ ] Follows naming conventions
- [ ] Functions have JSDoc comments
- [ ] No commented-out code
- [ ] Commit messages follow convention

**During code review:**
- [ ] Architecture is clean (no circular dependencies)
- [ ] SOLID principles respected
- [ ] Tests cover happy path + error cases
- [ ] No performance regressions
- [ ] Security implications considered
- [ ] API contracts documented
- [ ] Database migrations tested
- [ ] Error messages are user-friendly

---

### 17.4 Architecture Decision Records (ADRs)

**Template:**
```markdown
# ADR-001: Use Clean Architecture

## Context
Our codebase is growing rapidly. We need a clear architecture 
to maintain separation of concerns and testability.

## Decision
We will adopt Clean Architecture with four layers:
- Domain (pure business logic)
- Application (use cases)
- Interface Adapters (controllers, repositories)
- Infrastructure (frameworks, external services)

## Consequences
**Positive:**
- Better testability (domain logic independent of frameworks)
- Clear dependency direction
- Easier to swap implementations

**Negative:**
- More files and folder structure
- Slight complexity for simple operations

## Alternatives Considered
1. Layered (anemic models) - Rejected: Domain logic bleeds into services
2. CQRS - Considered but deferred for Phase 2
3. Microservices - Too early, monolith modular is better

## Implementation Notes
- Use TS path aliases for imports
- Enforce with ESLint rules
- Document in Contributing Guide

## Approval
- Approved by: Architecture Team
- Date: 2023-12-10
- Stakeholders: Backend lead, QA lead
```

---

### 17.5 Knowledge Sharing

**Brown Bag Sessions:**
- Weekly 30-min technical talks
- Topics: patterns used, lessons learned, new tools
- Recorded for async access

**Pair Programming:**
- 2+ devs on complex features or architectural decisions
- Improves knowledge distribution

**Documentation:**
- READMEs for each major component
- Architecture overview diagrams
- Runbook for common operations

---

## SECTION 18: AUDIT CHECKLIST (CONDENSED)

### Quick Assessment (Yes/No/N/A)

#### Design & Architecture
- [ ] SOLID principles clearly applied in codebase
- [ ] Clean Architecture or equivalent pattern evident
- [ ] Domain layer is framework-independent
- [ ] Dependency inversion: services depend on interfaces
- [ ] No circular dependencies
- [ ] Module boundaries enforced

#### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] ESLint + Prettier configured and enforced
- [ ] 0% `any` type usage
- [ ] Naming conventions consistent (camelCase, PascalCase, etc.)
- [ ] No magic numbers/strings
- [ ] No commented-out code or dead code
- [ ] Functions < 50 lines, classes < 300 lines
- [ ] Duplication < 3% (SonarQube metric)

#### Testing
- [ ] Unit tests for domain logic and use cases
- [ ] Integration tests for key workflows
- [ ] E2E tests for critical user journeys
- [ ] Test coverage ≥ 85%
- [ ] Tests run in CI on every PR
- [ ] Build fails on test failures

#### Security
- [ ] All OWASP Top 10 issues addressed
- [ ] Input validation on all external boundaries
- [ ] Authentication implemented (JWT/OAuth2)
- [ ] Authorization checks on sensitive endpoints
- [ ] No secrets in codebase (only env vars)
- [ ] Dependencies scanned for vulnerabilities
- [ ] Error responses don't expose stack traces
- [ ] HTTPS enforced in production
- [ ] CORS configured correctly
- [ ] Security headers set (CSP, HSTS, etc.)

#### Performance
- [ ] Frontend bundle < 250 KB (main), < 100 KB (gzip)
- [ ] Database queries indexed appropriately
- [ ] N+1 query problem avoided
- [ ] Caching implemented for expensive operations
- [ ] API response times < 500ms (p95)
- [ ] Database query times < 100ms
- [ ] Load testing done on critical endpoints

#### Data & Persistence
- [ ] Database schema validated
- [ ] Migrations versioned and tested
- [ ] Backup and restore procedures documented
- [ ] Concurrency handled (transactions, locking)
- [ ] PII encrypted and properly managed
- [ ] Retention and deletion rules implemented

#### APIs
- [ ] API versioned (v1, v2, etc.)
- [ ] Contracts documented (OpenAPI/Swagger)
- [ ] Error responses consistent
- [ ] Deprecation policy for breaking changes
- [ ] Stability: no breaking changes without new version

#### DevOps & CI/CD
- [ ] 12-Factor principles broadly followed
- [ ] CI/CD pipeline automated (lint, test, build)
- [ ] Deployments automated to staging/prod
- [ ] Rollback strategy in place
- [ ] Infrastructure as Code (Docker, Terraform)
- [ ] Secrets managed securely

#### Observability
- [ ] Structured logging implemented
- [ ] Correlation IDs for request tracing
- [ ] Metrics collected and monitored
- [ ] Health checks (liveness, readiness)
- [ ] Distributed tracing in place (if microservices)
- [ ] SLOs defined for critical paths

#### Front-End
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility: WCAG 2.1 AA target
- [ ] Semantic HTML
- [ ] Keyboard navigation
- [ ] Color contrast ≥ 4.5:1 (normal text)
- [ ] Form validation and error messages
- [ ] Loading and error states handled
- [ ] Performance: Core Web Vitals optimized

#### SEO & GEO
- [ ] Semantic HTML (`<h1>`, `<main>`, `<nav>`)
- [ ] Meta tags (`<title>`, description, canonical)
- [ ] Open Graph tags for sharing
- [ ] Sitemaps and robots.txt
- [ ] SSR/SSG for content pages (if needed)
- [ ] Content structured for AI discovery (headings, lists)
- [ ] Authoritative, in-depth content published

#### Compliance & Governance
- [ ] GDPR requirements identified and handled
- [ ] Data inventory maintained
- [ ] Data subject rights implemented (access, erasure, etc.)
- [ ] Privacy policy clear and accessible
- [ ] Consent (cookies, tracking) properly managed
- [ ] Code reviews systematic
- [ ] Conventional commits used
- [ ] ADRs for major decisions
- [ ] Changelog maintained

---

## SECTION 19: SCORING & GRADING

### 19.1 Scoring System (5,600 Total Points)

| Category | Points | Weight | Makefile Command |
|----------|--------|--------|------------------|
| Architecture | 500 | 9% | `make audit-architecture` |
| Code Quality | 600 | 11% | `make audit-code-quality` |
| Testing | 400 | 7% | `make audit-tests` |
| Security | 500 | 9% | `make audit-security` |
| Performance | 550 | 10% | `make audit-performance` |
| Database | 985 | 18% | `make audit-database` |
| Infrastructure | 920 | 16% | `make audit-infrastructure` |
| Documentation | 600 | 11% | `make audit-documentation` |
| Process | 1,355 | 24% | `make audit-process` |
| **TOTAL** | **5,600** | **100%** | `make audit-extended` |

### 19.2 Grade Scale

```
Grade    Score Range    Percentage    Status
────────────────────────────────────────────
A+       5040-5600      90-100%       EXCELLENCE
A        4480-5039      80-89%        VERY GOOD
B        3920-4479      70-79%        GOOD
C        3360-3919      60-69%        ACCEPTABLE
F        < 3360         < 60%         CRITICAL
```

**Target Grade: A (80%+)**

---

## SECTION 20: MAKEFILE AUTOMATION REFERENCE

This section provides a **quick reference** to 50+ make commands that automate audits, testing, and deployment:

### Setup & Installation
```bash
make install              # Install dependencies
make setup                # Complete project setup
make clean                # Clean build artifacts

make dev                  # Start development server
make build                # Production build
```

### Code Quality
```bash
make format               # Auto-format with Prettier
make lint                 # Check with ESLint
make lint-fix             # Fix linting issues
make typescript-check     # Check TypeScript compilation
make lint-and-fix         # All three combined
```

### Testing
```bash
make test                 # Run all tests
make test-unit            # Unit tests only
make test-integration     # Integration tests
make test-e2e             # E2E tests
make coverage             # Coverage report
```

### Audits (14 Categories)
```bash
make audit                # Quick 2-minute audit
make audit-full           # Comprehensive 5-minute audit
make audit-extended       # Deep 10+ minute audit

# Specific audits
make audit-architecture      # Clean, SOLID, DDR patterns
make audit-code-quality      # TypeScript, ESLint, Prettier
make audit-tests             # Unit, Integration, E2E
make audit-security          # OWASP, Secrets, Dependencies
make audit-performance       # Bundles, API, DB response times
make audit-database          # Schema, Migrations, Backup
make audit-infrastructure    # Docker, K8s, CI/CD
make audit-documentation     # API, README, ADR
make audit-process           # Git, Workflow, Release
make audit-ocpp              # OCPP 1.6J compliance
make audit-owasp             # OWASP Top 10 (2021)
make audit-migrations        # Database health
make audit-logging           # Structured logs, APM
make audit-solid             # SOLID principles
```

### Reporting
```bash
make audit-score          # Display current audit score
make report-all           # Generate all reports
make report-summary       # Summary report
make report-scores        # Detailed scores
make audit-compare        # Compare last 2 audits
make audit-export         # Export as JSON
```

### Health & Deployment
```bash
make health               # Quick 30-second health check
make health-full          # Full 60-second health check
make pre-deploy           # Pre-deployment verification
make deploy-staging       # Deploy to staging
make deploy-prod          # Deploy to production
```

### Database
```bash
make db-setup             # Initialize database
make db-migrate-up        # Run pending migrations
make db-migrate-down      # Revert last migration
make db-migrations-list   # List all migrations
```

### Docker
```bash
make docker-build         # Build Docker image
make docker-compose-up    # Start services
make docker-compose-down  # Stop services
```

### Security & Dependencies
```bash
make vulnerabilities      # npm audit
make outdated             # npm outdated packages
make dependencies          # npm dependency tree
```

### Help
```bash
make help                 # Show help message
make help-audit-commands  # Detailed audit commands
```

---

## CONCLUSION

A **professional, modern, and production-ready** full-stack web application is built on:

1. **Solid Foundation:** SOLID, DRY, KISS, YAGNI, SoC principles
2. **Clear Architecture:** Clean, Hexagonal, or DDD patterns
3. **Quality Code:** TypeScript strict, ESLint, Prettier, conventions
4. **Comprehensive Tests:** Unit, Integration, E2E (85%+ coverage)
5. **Security:** OWASP Top 10, input validation, secrets management
6. **Performance:** Optimized bundles, fast APIs, indexed databases
7. **Professional DevOps:** CI/CD automation, IaC, monitoring
8. **Observability:** Structured logging, metrics, tracing
9. **Accessible & Optimized:** WCAG AA, SEO, GEO-ready
10. **Compliant:** GDPR, privacy, legal requirements
11. **Team Excellence:** Git workflow, code reviews, ADRs
12. **Resilience:** Error handling, retries, circuit breakers

**Use this standard to elevate your codebase from "good" to "professional."**

---

## 📚 APPENDICES

### Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **ADR** | Architecture Decision Record – documents major architectural decisions |
| **ABAC** | Attribute-Based Access Control – fine-grained authorization |
| **API** | Application Programming Interface |
| **BFF** | Backend For Frontend – customized backend for specific frontend |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **CQRS** | Command Query Responsibility Segregation |
| **DDD** | Domain-Driven Design |
| **DI** | Dependency Injection |
| **DRY** | Don't Repeat Yourself |
| **E2E** | End-to-End testing |
| **GEO** | Generative Engine Optimization – AI-discovery optimization |
| **GoF** | Gang of Four (design patterns) |
| **IaC** | Infrastructure as Code |
| **JWT** | JSON Web Token |
| **KISS** | Keep It Simple, Stupid |
| **OWASP** | Open Web Application Security Project |
| **RBAC** | Role-Based Access Control |
| **SEO** | Search Engine Optimization |
| **SLA / SLO** | Service Level Agreement / Objective |
| **SoC** | Separation of Concerns |
| **SOLID** | Five design principles (see Section 2) |
| **YAGNI** | You Aren't Gonna Need It |

---

### Appendix B: Recommended Tools & Libraries

**Backend (Node.js/NestJS):**
- NestJS, Express, Fastify
- TypeORM, Prisma, Sequelize
- Jest, Vitest (testing)
- Pino, Winston (logging)
- class-validator (validation)
- Passport (authentication)

**Frontend (React/Next/Angular):**
- React, Next.js, Angular
- Zustand, Redux, NgRx (state management)
- Jest, React Testing Library, Cypress (testing)
- Tailwind CSS, Material UI (styling)
- React Query, SWR (data fetching)

**DevOps:**
- Docker, Docker Compose
- Kubernetes
- GitHub Actions (CI/CD)
- Terraform, Pulumi (IaC)
- Prometheus, Grafana (monitoring)
- ELK Stack, Splunk (logging)
- Jaeger (tracing)

**Security & Analysis:**
- Snyk (dependency scanning)
- SonarQube (code quality)
- OWASP ZAP (security scanning)
- npm audit (vulnerability check)

---

**Document Version:** 6.0  
**Last Updated:** December 10, 2025  
**Status:** ✅ **OFFICIAL ENTERPRISE STANDARD**  
**Maintained By:** Architecture Team  
**Review Frequency:** Quarterly

---

**🚀 Build Clean, Professional, Modern Software!**
