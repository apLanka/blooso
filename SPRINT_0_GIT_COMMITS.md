# Sprint 0 — Git Commit Guide

Run these commands in order to create logical commits for Sprint 0. If `git` fails due to Xcode license, run `sudo xcodebuild -license` first.

## Commit 1: Clean Next.js app (S0-01)

```bash
git add apps/web/
git commit -m "feat(web): remove Turborepo starter, add Blooso landing page

- Replace starter template with minimal Blooso landing
- Add Tailwind CSS and configure for app
- Use Inter font, update metadata
- Add path alias @/* for imports"
```

## Commit 2: Initialize NestJS API (S0-02)

```bash
git add apps/api/
git commit -m "feat(api): initialize NestJS 11 app with health endpoint

- NestJS 11 with Express
- Health check at GET / returns { status: 'ok' }
- Runs on port 3001
- Add dev script for turbo"
```

## Commit 3: Shared package (S0-04, S0-05)

```bash
git add packages/shared/
git commit -m "feat(shared): add @repo/shared package with Zod schemas

- Pagination types and schemas
- API response wrapper types
- UUID validation schema
- Utility functions for pagination"
```

## Commit 4: shadcn/ui and Tailwind preset (S0-06, S0-07)

```bash
git add apps/web/components/ apps/web/lib/ apps/web/components.json packages/tailwind-config/
git commit -m "feat(ui): add shadcn/ui components and Tailwind preset

- Button and Card components
- lib/utils.ts for cn()
- @repo/tailwind-config with design tokens
- CSS variables for theming"
```

## Commit 5: Docker Compose (S0-08)

```bash
git add docker-compose.yml
git commit -m "chore: add Docker Compose for local development

- PostgreSQL 16 on port 5432
- Redis 7 on port 6379
- Health checks and persistent volumes"
```

## Commit 6: Prisma setup (S0-09)

```bash
git add apps/api/prisma/ apps/api/src/prisma/
git commit -m "feat(api): add Prisma ORM and database layer

- Prisma 6 with PostgreSQL
- PrismaModule and PrismaService for NestJS
- db:migrate, db:push, db:seed, db:studio scripts
- Placeholder seed script"
```

## Commit 7: Environment config (S0-10, S0-11, S0-12)

```bash
git add apps/api/.env.example apps/web/.env.example apps/web/env.ts
git add apps/api/src/app.module.ts
git commit -m "chore: add environment configuration

- @nestjs/config for API
- t3-env for Next.js (type-safe env)
- .env.example files for both apps"
```

## Commit 8: Turborepo and db scripts (S0-03, S0-13)

```bash
git add turbo.json package.json
git commit -m "chore: add Turborepo db scripts

- db:migrate, db:push, db:seed, db:studio at root
- Turbo task config for db commands"
```

## Commit 9: ESLint, Prettier, Husky (S0-14, S0-15, S0-16)

```bash
git add .prettierrc .prettierignore .husky/ package.json packages/shared/eslint.config.mjs
git commit -m "chore: add Prettier, Husky, lint-staged

- Shared Prettier config
- Pre-commit hook runs lint-staged
- Format on commit for staged files"
```

## Commit 10: NestJS filters, validation, CORS (S0-17, S0-18, S0-19, S0-20)

```bash
git add apps/api/src/main.ts apps/api/src/common/ apps/api/tsconfig.json
git commit -m "feat(api): add global exception filter, validation pipe, CORS

- AllExceptionsFilter for consistent error responses
- ValidationPipe with class-validator
- CORS enabled for localhost:3000
- Path alias @/* for src"
```

## Commit 11: Remove backend package

```bash
git status  # Verify packages/backend is removed
git add -A
git commit -m "chore: remove deprecated backend package (replaced by apps/api)"
```

---

## Single combined commit (alternative)

If you prefer one commit for the entire Sprint 0:

```bash
git add -A
git commit -m "feat: Sprint 0 — Foundation complete

- Next.js 15 web app with Tailwind, shadcn/ui
- NestJS 11 API with Prisma, health endpoint
- packages/shared with Zod schemas
- Docker Compose (Postgres + Redis)
- Environment config (t3-env, @nestjs/config)
- Prettier, Husky, lint-staged
- Global exception filter, validation pipe, CORS
- Turborepo db scripts"
```

---

## Verify

```bash
# Start Docker services
docker compose up -d

# Copy env and run migrations (when schema has tables)
cp apps/api/.env.example apps/api/.env
cd apps/api && npx prisma db push

# Run both apps
npm run dev
# Next.js: http://localhost:3000
# NestJS:  http://localhost:3001
```
