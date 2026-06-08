# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Repository Overview

**Blooso** is a premium booking platform for beauty and wellness businesses — a SaaS product positioned as a Fresha alternative. It's a two-sided marketplace connecting service providers (salons, barbershops, spas, nail studios, tattoo studios) with clients.

## Tech Stack

- **Monorepo:** Turborepo with npm workspaces
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui, Lucide icons
- **Backend:** NestJS 11, Prisma 6 (ORM), PostgreSQL 16, Redis 7 (BullMQ)
- **Auth:** Passport.js + JWT (access + refresh tokens), RBAC (client/staff/manager/owner/admin)
- **Payments:** Stripe
- **Email:** Resend
- **Shared:** `@repo/shared` (types, Zod schemas, constants, utils)
- **Testing:** Jest (API unit/e2e), Playwright (web e2e)

## Project Structure

```
blooso/
├── apps/
│   ├── api/          # NestJS REST API (port 3001)
│   │   ├── src/      # 12 domain modules (auth, booking, business, client, etc.)
│   │   └── prisma/   # Schema (22 models), migrations, seeds
│   ├── web/          # Next.js frontend (port 3000)
│   │   ├── app/      # Route groups: (auth), (booking), (customer), (dashboard)
│   │   ├── components/  # Landing + UI components
│   │   ├── contexts/ # AuthContext (JWT in localStorage)
│   │   └── lib/      # API client modules (one per domain)
│   └── docs/         # Product spec, architecture, MVP planning docs
├── packages/
│   ├── shared/       # @repo/shared — types, schemas, constants, utils
│   ├── ui/           # @repo/ui — reusable React components
│   ├── eslint-config/
│   ├── typescript-config/
│   └── tailwind-config/
├── docker-compose.yml  # PostgreSQL + Redis for local dev
├── turbo.json
└── package.json
```

## Development Commands

### Root Level

```bash
npm run dev          # Start API + Web concurrently
npm run dev:web      # Start Next.js only (port 3000)
npm run dev:api      # Start NestJS only (port 3001)
npm run build        # Build all apps via Turborepo
npm run lint         # Lint all apps
npm run format       # Format with Prettier
npm run check-types  # Type-check all apps
npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push schema changes (dev shortcut)
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### API (`apps/api`)

```bash
npm run dev          # nest start --watch
npm run build        # nest build
npm run test         # Jest unit tests
npm run test:e2e     # Jest e2e tests
npm run test:cov     # Jest with coverage
npm run db:generate  # prisma generate
npm run db:migrate   # prisma migrate dev
npm run db:seed      # ts-node prisma/seed.ts
```

### Web (`apps/web`)

```bash
npm run dev          # next dev --port 3000
npm run build        # next build
npm run test:e2e     # Playwright e2e tests
npm run lint         # ESLint (max 0 warnings)
npm run check-types  # next typegen && tsc --noEmit
```

### Docker

```bash
docker compose up -d   # Start PostgreSQL (5432) + Redis (6379)
docker compose down    # Stop containers
```

## Architecture Conventions

### Backend (NestJS)

- Each domain module has: controller, service, DTOs, and optionally guards/decorators
- Global `JwtAuthGuard` applies to all routes — use `@Public()` to exempt
- Multi-tenancy via row-level `businessId` isolation on all tenant-scoped tables
- Validation via `class-validator` + `class-transformer` (global ValidationPipe)
- Swagger docs auto-generated at `/api/docs`

### Frontend (Next.js)

- Route groups: `(auth)` — login/register, `(booking)` — public booking flow, `(customer)` — client dashboard, `(dashboard)` — protected business dashboard
- API client pattern: one file per domain in `lib/` (e.g., `lib/api/business.ts`)
- Auth state via React Context (`contexts/auth-context.tsx`) — JWT stored in localStorage
- UI components from shadcn/ui (base-nova style) — use `components/ui/` directory

### Shared Package

- `@repo/shared` contains: TypeScript interfaces, Zod validation schemas, constants, and utility functions
- Import as `@repo/shared` in both API and Web apps

### Database

- 22 Prisma models with 8 enums
- Key enums: `UserRole`, `StaffRole`, `AppointmentStatus`, `PaymentMethod`, `BookingSource`
- Migrations organized by feature domain in `apps/api/prisma/migrations/`

## Code Style

- **Prettier:** Single quotes, trailing commas, 100 char width
- **Pre-commit hook:** Husky + lint-staged runs linting on staged files
- **TypeScript:** Strict mode, ES2022 target (API), path alias `@/*`

## Environment Variables

### API

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT signing
- `REDIS_URL` — Redis connection string
- `STRIPE_SECRET_KEY` — Stripe API key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `RESEND_API_KEY` — Resend email API key
- `CORS_ORIGIN` — Allowed CORS origin

### Web

- `NEXT_PUBLIC_API_URL` — Backend API URL (default: `http://localhost:3001`)

## Default Dev Credentials

- **Admin:** admin@blooso.com / Admin123!
- **Demo (production):** demo@blooso.com / Demo123!

## Deployment

- **API:** Railway (Nixpacks builder)
- **Web:** Vercel (Next.js, IAD1 region)

## Available Skills

Use the `skill` tool to load specialized workflows when applicable:

| Skill                           | When to Use                                                 |
| ------------------------------- | ----------------------------------------------------------- |
| `api-and-interface-design`      | Designing REST endpoints, defining type contracts           |
| `frontend-ui-engineering`       | Building/modifying UI components, layouts, state management |
| `fullstack-dev`                 | Backend architecture, frontend-backend integration          |
| `spec-driven-development`       | Starting new features, unclear requirements                 |
| `planning-and-task-breakdown`   | Breaking work into implementable tasks                      |
| `test-driven-development`       | Writing tests, fixing bugs, proving code works              |
| `debugging-and-error-recovery`  | Systematic root-cause debugging                             |
| `code-review-and-quality`       | Reviewing code before merge                                 |
| `code-simplification`           | Refactoring for clarity                                     |
| `git-workflow-and-versioning`   | Commits, branching, conflict resolution                     |
| `security-and-hardening`        | Auth, input handling, external integrations                 |
| `performance-optimization`      | Profiling, load time improvement                            |
| `ci-cd-and-automation`          | Build/deploy pipeline setup                                 |
| `shipping-and-launch`           | Production deployment, monitoring, rollback                 |
| `deprecation-and-migration`     | Removing old systems, migrating users                       |
| `documentation-and-adrs`        | Recording architectural decisions                           |
| `source-driven-development`     | Framework/correctness-focused implementation                |
| `browser-testing-with-devtools` | Browser testing, DOM inspection, network analysis           |
| `incremental-implementation`    | Large changes across multiple files                         |
| `idea-refine`                   | Iterative idea refinement                                   |
| `frontend-dev`                  | Landing pages, media assets, cinematic animations           |
| `context-engineering`           | Agent context setup, rules configuration                    |
