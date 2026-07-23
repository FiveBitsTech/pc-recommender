---
inclusion: manual
---

# Skill: Generate Backend Module (NestJS DDD)

## Purpose

Scaffold a complete backend module following the DDD layered architecture.

## Input Required

- **Module name** (singular, e.g., `product`, `recommendation`, `user-requirement`)
- **Entity fields** (name, type, nullable)
- **Use cases needed** (list, create, findById, update, delete, or custom)

## Output Structure

When asked to generate a new backend module, create the following files:

```
server/src/modules/<module-name>/
├── domain/
│   └── repositories/
│       └── <entity>.repository.ts          # Interface + token + record type
├── application/
│   ├── use-cases/
│   │   ├── list-<entities>.use-case.ts     # List all (with filters if needed)
│   │   ├── get-<entity>.use-case.ts        # Find by ID
│   │   ├── create-<entity>.use-case.ts     # Create new record
│   │   ├── update-<entity>.use-case.ts     # Update existing
│   │   └── delete-<entity>.use-case.ts     # Soft/hard delete
│   ├── mappers/
│   │   └── map-<entity>-item.ts            # Record → response DTO
│   └── dtos/
│       ├── create-<entity>.dto.ts          # Input validation (class-validator)
│       └── update-<entity>.dto.ts          # Partial input validation
├── infrastructure/
│   └── prisma/
│       └── prisma-<entity>.repository.ts   # Concrete Prisma implementation
├── presentation/
│   └── controllers/
│       └── <entities>.controller.ts        # REST endpoints
└── <module-name>.module.ts                 # NestJS module wiring
```

## File Templates

### 1. Repository Interface (`domain/repositories/<entity>.repository.ts`)

```typescript
export const <ENTITY>_REPOSITORY = '<ENTITY>_REPOSITORY'

export type <Entity>Record = {
  id: number
  // ... fields matching Prisma model
}

export interface <Entity>Repository {
  findAll(filters?: Partial<Pick<<Entity>Record, 'field1' | 'field2'>>): Promise<<Entity>Record[]>
  findById(id: number): Promise<<Entity>Record | null>
  create(data: Omit<<Entity>Record, 'id'>): Promise<<Entity>Record>
  update(id: number, data: Partial<Omit<<Entity>Record, 'id'>>): Promise<<Entity>Record>
  delete(id: number): Promise<void>
}
```

### 2. Use Case (`application/use-cases/<action>-<entity>.use-case.ts`)

```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { <ENTITY>_REPOSITORY, type <Entity>Repository } from '../../domain/repositories/<entity>.repository'
import { map<Entity>Item } from '../mappers/map-<entity>-item'

@Injectable()
export class <Action><Entity>UseCase {
  constructor(
    @Inject(<ENTITY>_REPOSITORY) private readonly <entity>Repository: <Entity>Repository,
  ) {}

  async execute(/* params */) {
    // Business logic here — NO direct DB access
    // Call repository methods only
  }
}
```

### 3. Prisma Repository (`infrastructure/prisma/prisma-<entity>.repository.ts`)

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import { <Entity>Record, <Entity>Repository } from '../../domain/repositories/<entity>.repository'

@Injectable()
export class Prisma<Entity>Repository implements <Entity>Repository {
  constructor(private readonly prisma: PrismaService) {}

  // Implement all interface methods using this.prisma.<model>
}
```

### 4. Controller (`presentation/controllers/<entities>.controller.ts`)

```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common'
// Import use cases — controller is a THIN intermediary

@Controller('<entities>')
export class <Entities>Controller {
  constructor(
    private readonly listUseCase: List<Entities>UseCase,
    private readonly getUseCase: Get<Entity>UseCase,
    private readonly createUseCase: Create<Entity>UseCase,
    // ...
  ) {}

  @Get()
  findAll() { return this.listUseCase.execute() }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.getUseCase.execute(id) }

  @Post()
  create(@Body() dto: Create<Entity>Dto) { return this.createUseCase.execute(dto) }
}
```

### 5. Module (`<module-name>.module.ts`)

```typescript
import { Module } from '@nestjs/common'

@Module({
  controllers: [<Entities>Controller],
  providers: [
    // Use cases
    List<Entities>UseCase,
    Get<Entity>UseCase,
    Create<Entity>UseCase,
    // Repository binding
    { provide: <ENTITY>_REPOSITORY, useClass: Prisma<Entity>Repository },
  ],
  exports: [<ENTITY>_REPOSITORY],
})
export class <ModuleName>Module {}
```

## Checklist After Generation

1. Register the module in `app.module.ts` imports
2. Verify the Prisma model exists in `schema.prisma`
3. Run `pnpm prisma:generate` if schema was modified
4. Confirm all use cases inject only repositories (never PrismaService)
5. Confirm controller has zero business logic
