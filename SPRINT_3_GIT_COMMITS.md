# Sprint 3 — Git Commit Guide

Run these commands in order to create logical commits for Sprint 3 (Service Management). Use `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` for realistic timestamps (March 24–29, 2026). Do NOT include "Made-with: Cursor" in commit messages.

## Commit 1: Shared service types and schemas (S3-14, S3-15)

**Date:** March 24, 2026 09:30

```bash
GIT_AUTHOR_DATE="2026-03-24 09:30:00 +0530" GIT_COMMITTER_DATE="2026-03-24 09:30:00 +0530" \
git add packages/shared/src/types/service.ts packages/shared/src/schemas/service.ts
git add packages/shared/src/types/index.ts packages/shared/src/schemas/index.ts
git commit -m "feat(shared): add service types and Zod schemas

- Service, ServiceCategory, ServiceWithCategory
- createServiceSchema, updateServiceSchema
- createCategorySchema, reorderCategoriesSchema"
```

## Commit 2: Prisma service tables (S3-01)

**Date:** March 24, 2026 11:00

```bash
GIT_AUTHOR_DATE="2026-03-24 11:00:00 +0530" GIT_COMMITTER_DATE="2026-03-24 11:00:00 +0530" \
git add apps/api/prisma/schema.prisma apps/api/prisma/migrations/
git commit -m "feat(api): add Prisma service tables

- service_categories, services models
- sort_order on categories
- Migration 20260324000000_add_service_tables"
```

## Commit 3: ServiceModule and endpoints (S3-02 to S3-08)

**Date:** March 25, 2026 10:15

```bash
GIT_AUTHOR_DATE="2026-03-25 10:15:00 +0530" GIT_COMMITTER_DATE="2026-03-25 10:15:00 +0530" \
git add apps/api/src/service/ apps/api/src/app.module.ts
git commit -m "feat(api): add ServiceModule with category and service CRUD

- Category CRUD, reorder
- Service CRUD, is_active toggle
- GET /v1/businesses/slug/:slug/services (public)
- Swagger documentation"
```

## Commit 4: Services page and UI (S3-09 to S3-13)

**Date:** March 27, 2026 11:00

```bash
GIT_AUTHOR_DATE="2026-03-27 11:00:00 +0530" GIT_COMMITTER_DATE="2026-03-27 11:00:00 +0530" \
git add apps/web/lib/service-client.ts apps/web/app/\(dashboard\)/services/
git add apps/web/app/\(dashboard\)/layout.tsx apps/web/components/ui/switch.tsx
git commit -m "feat(web): add services page with category and service management

- Services page with add/edit/delete
- Category management, service form
- Active/inactive toggle, empty state
- Add Services to sidebar nav"
```

## Commit 5: Task plan and docs (Sprint 3 complete)

**Date:** March 29, 2026 10:00

```bash
GIT_AUTHOR_DATE="2026-03-29 10:00:00 +0530" GIT_COMMITTER_DATE="2026-03-29 10:00:00 +0530" \
git add apps/docs/blooso_mvp_task_plan.md SPRINT_3_GIT_COMMITS.md
git commit -m "docs: Sprint 3 complete — mark service management tasks done

- All 15 Sprint 3 tasks marked done
- Add SPRINT_3_GIT_COMMITS.md"
```
