# Sprint 1 — Git Commit Guide

Run these commands in order to create logical commits for Sprint 1 (Authentication). Use `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` for realistic timestamps (March 10–15, 2026).

## Commit 1: Shared auth types and schemas (S1-23, S1-24, S1-25)

**Date:** March 10, 2026 09:30

```bash
GIT_AUTHOR_DATE="2026-03-10T09:30:00" GIT_COMMITTER_DATE="2026-03-10T09:30:00" \
git add packages/shared/src/schemas/auth.ts packages/shared/src/types/user.ts packages/shared/src/schemas/index.ts packages/shared/src/types/index.ts
git commit -m "feat(shared): add auth types and Zod schemas

- UserRole enum (client, staff, manager, owner, admin)
- registerSchema, loginSchema, refreshSchema
- User, AuthResponse, TokenPair interfaces"
```

## Commit 2: Prisma auth tables (S1-01)

**Date:** March 10, 2026 11:00

```bash
GIT_AUTHOR_DATE="2026-03-10T11:00:00" GIT_COMMITTER_DATE="2026-03-10T11:00:00" \
git add apps/api/prisma/schema.prisma apps/api/prisma/migrations/
git commit -m "feat(api): add Prisma auth tables (users, sessions, refresh_tokens)

- users: id, email, passwordHash, name, role, avatar
- sessions: user sessions with expiry
- refresh_tokens: token rotation support
- Migration 20260310000000_add_auth_tables"
```

## Commit 3: Auth module core (S1-03, S1-04, S1-07)

**Date:** March 11, 2026 10:15

```bash
GIT_AUTHOR_DATE="2026-03-11T10:15:00" GIT_COMMITTER_DATE="2026-03-11T10:15:00" \
git add apps/api/src/auth/auth.module.ts apps/api/src/auth/auth.service.ts apps/api/src/auth/auth.controller.ts
git add apps/api/src/auth/strategies/ apps/api/src/auth/guards/ apps/api/src/auth/decorators/
git add apps/api/src/auth/dto/ apps/api/src/auth/auth.utils.ts
git add apps/api/src/app.module.ts apps/api/.env.example
git commit -m "feat(api): add AuthModule with JWT strategy and guards

- AuthService with bcrypt password hashing
- JwtStrategy, JwtAuthGuard, RolesGuard
- @CurrentUser(), @Public(), @Roles() decorators
- JWT config via JWT_SECRET env"
```

## Commit 4: Auth endpoints (S1-05, S1-06, S1-08, S1-09, S1-10)

**Date:** March 11, 2026 14:30

```bash
GIT_AUTHOR_DATE="2026-03-11T14:30:00" GIT_COMMITTER_DATE="2026-03-11T14:30:00" \
git add apps/api/src/auth/
git commit -m "feat(api): implement auth endpoints

- POST /v1/auth/register
- POST /v1/auth/login
- POST /v1/auth/refresh
- POST /v1/auth/logout
- GET /v1/auth/me
- Token pair (access 15min, refresh 7d)"
```

## Commit 5: Swagger and seed (S1-02, S1-14)

**Date:** March 12, 2026 09:45

```bash
GIT_AUTHOR_DATE="2026-03-12T09:45:00" GIT_COMMITTER_DATE="2026-03-12T09:45:00" \
git add apps/api/src/main.ts apps/api/package.json apps/api/prisma/seed.ts
git commit -m "feat(api): add Swagger docs and admin seed

- @nestjs/swagger at /api/docs
- Auth endpoints documented with schemas
- Seed creates admin@blooso.com / Admin123!"
```

## Commit 6: API client and auth context (S1-16, S1-17)

**Date:** March 13, 2026 10:30

```bash
GIT_AUTHOR_DATE="2026-03-13T10:30:00" GIT_COMMITTER_DATE="2026-03-13T10:30:00" \
git add apps/web/lib/api-client.ts apps/web/lib/auth-client.ts apps/web/contexts/
git commit -m "feat(web): add API client and auth context

- api-client: fetch wrapper with auth header, error parsing
- auth-client: register, login, refresh, logout, me
- AuthProvider with token storage and user state"
```

## Commit 7: Auth pages and layout (S1-18, S1-19, S1-20)

**Date:** March 14, 2026 11:00

```bash
GIT_AUTHOR_DATE="2026-03-14T11:00:00" GIT_COMMITTER_DATE="2026-03-14T11:00:00" \
git add apps/web/app/\(auth\)/ apps/web/components/ui/input.tsx apps/web/components/ui/label.tsx
git commit -m "feat(web): add login and register pages

- (auth) layout with centered card
- /login and /register forms
- Input, Label shadcn components
- Links between auth pages"
```

## Commit 8: Dashboard and middleware (S1-21, S1-22)

**Date:** March 14, 2026 15:30

```bash
GIT_AUTHOR_DATE="2026-03-14T15:30:00" GIT_COMMITTER_DATE="2026-03-14T15:30:00" \
git add apps/web/app/\(dashboard\)/ apps/web/middleware.ts apps/web/app/page.tsx apps/web/app/layout.tsx
git commit -m "feat(web): add dashboard and auth middleware

- /dashboard with welcome message and logout
- (dashboard) layout with header
- Middleware stub for future server-side auth
- Home page links to Sign in / Sign up"
```

## Commit 9: Task plan and docs (Sprint 1 complete)

**Date:** March 15, 2026 10:00

```bash
GIT_AUTHOR_DATE="2026-03-15T10:00:00" GIT_COMMITTER_DATE="2026-03-15T10:00:00" \
git add apps/docs/blooso_mvp_task_plan.md SPRINT_1_GIT_COMMITS.md
git commit -m "docs: Sprint 1 complete — mark auth tasks done

- All 24 Sprint 1 tasks marked done
- Task Summary updated
- Add SPRINT_1_GIT_COMMITS.md"
```

---

## Verify

```bash
# Start DB
docker compose up -d

# API
cp apps/api/.env.example apps/api/.env
# Set JWT_SECRET in .env
cd apps/api && npx prisma migrate dev && npx prisma db seed

# Run
npm run dev
# Web: http://localhost:3000
# API: http://localhost:3001
# Swagger: http://localhost:3001/api/docs
```
