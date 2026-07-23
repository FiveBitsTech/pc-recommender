---
inclusion: always
---

# Backend Architecture Rules — Domain-Driven Design (NestJS + Prisma)

## Project Structure

Every module in `server/src/modules/<module-name>/` MUST follow this layered structure:

```
<module-name>/
├── domain/
│   ├── repositories/         # Abstract interfaces (ports)
│   └── entities/             # Domain entities / value objects (optional)
├── application/
│   ├── use-cases/            # Business logic orchestrators
│   ├── mappers/              # Data transformation functions
│   └── dtos/                 # Input/output data transfer objects
├── infrastructure/
│   └── prisma/               # Concrete repository implementations
├── presentation/
│   └── controllers/          # HTTP layer (routes, validation)
└── <module-name>.module.ts   # NestJS module wiring
```

## Layer Rules

### 1. Domain Layer (`domain/`)

- Contains **repository interfaces** (ports) and optional **entities/value objects**.
- Repository interfaces define the contract. They MUST NOT import Prisma, NestJS, or any infrastructure dependency.
- Each repository file exports:
  - A `const` token string (e.g., `COMPANY_REPOSITORY = 'COMPANY_REPOSITORY'`).
  - A TypeScript `type` for the record shape (e.g., `CompanyRecord`).
  - An `interface` with the method signatures.
- Domain layer has **ZERO external dependencies**.

### 2. Application Layer (`application/`)

#### Use Cases

- Each use case is a single class with one public `execute(...)` method.
- Use cases are `@Injectable()` and receive dependencies via constructor injection.
- **FORBIDDEN:** Use cases MUST NEVER import or use `PrismaService`, `PrismaClient`, or any database client directly. All data access goes through injected repository interfaces.
- **FORBIDDEN:** Use cases MUST NEVER inject other use cases. If shared logic is needed, extract it into the repository interface or create a domain service.
- Use cases orchestrate business logic: call repositories, apply rules, map output.
- Use cases MUST return a well-defined DTO or plain object, never a raw Prisma model.

#### Mappers

- Pure functions that transform domain records into response DTOs.
- Named with pattern: `map-<entity>-<purpose>.ts` (e.g., `map-company-item.ts`).
- No side effects, no dependencies.

#### DTOs

- Input DTOs use `class-validator` decorators for validation.
- Output DTOs are plain TypeScript types or interfaces.

### 3. Infrastructure Layer (`infrastructure/`)

- Contains **concrete implementations** of domain repository interfaces.
- Only this layer may import and use `PrismaService`.
- Classes are `@Injectable()` and implement the domain interface.
- Named with pattern: `prisma-<entity>.repository.ts`.
- Responsible for query construction, data selection, and mapping from Prisma types to domain record types.

### 4. Presentation Layer (`presentation/`)

- Controllers are **thin intermediaries** between HTTP and use cases.
- Controllers MUST NOT contain business logic, data transformation, or direct database calls.
- Controllers only: parse request params/body, call a use case, return the result.
- Use NestJS decorators for routing, HTTP method, and parameter extraction.
- Validation is handled by DTOs + `ValidationPipe`, not manually in controllers.
- **FORBIDDEN:** Duplicating logic that already exists in a use case or mapper.

### 5. Module File (`<module>.module.ts`)

- Registers controllers, provides use cases, and binds repository interfaces to implementations using `{ provide: TOKEN, useClass: Implementation }`.
- Exports repository tokens if other modules need them.

## General Rules

- **No code duplication.** If logic is repeated, extract to a shared service, utility, or repository method.
- **Single Responsibility.** Each file has one purpose: one use case, one mapper, one controller method per route concept.
- **Dependency direction:** `presentation → application → domain ← infrastructure`. Infrastructure implements domain, never the reverse.
- **Naming conventions:**
  - Use cases: `<verb>-<entity>.use-case.ts` (e.g., `create-requirement.use-case.ts`)
  - Repositories: `<entity>.repository.ts` (interface), `prisma-<entity>.repository.ts` (implementation)
  - Controllers: `<entity>.controller.ts`
  - Mappers: `map-<entity>-<context>.ts`
- **All code in English** (variable names, class names, comments).
- **Error handling:** Use NestJS exceptions (`NotFoundException`, `BadRequestException`) in use cases. Never let Prisma errors leak to the client.
- **Shared module:** `src/shared/prisma/` provides `PrismaService` globally. Do not create new Prisma instances.
