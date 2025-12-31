# Sprint 2 — Git Commit Guide

Run these commands in order to create logical commits for Sprint 2 (Business Onboarding). Use `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` for realistic timestamps (March 17–22, 2026). Do NOT include "Made-with: Cursor" in commit messages.

## Commit 1: Shared business types and schemas (S2-19, S2-20, S2-21)

**Date:** March 17, 2026 09:30

```bash
GIT_AUTHOR_DATE="2026-03-17 09:30:00 +0530" GIT_COMMITTER_DATE="2026-03-17 09:30:00 +0530" \
git add packages/shared/src/types/business.ts packages/shared/src/schemas/business.ts packages/shared/src/constants/business.ts
git add packages/shared/src/types/index.ts packages/shared/src/schemas/index.ts packages/shared/src/constants/index.ts
git commit -m "feat(shared): add business types, schemas, and BUSINESS_CATEGORIES

- Business, Location, BusinessHours interfaces
- createBusinessSchema, updateBusinessSchema, businessHoursSchema
- BUSINESS_CATEGORIES constant"
```

## Commit 2: Prisma business tables (S2-01)

**Date:** March 17, 2026 11:00

```bash
GIT_AUTHOR_DATE="2026-03-17 11:00:00 +0530" GIT_COMMITTER_DATE="2026-03-17 11:00:00 +0530" \
git add apps/api/prisma/schema.prisma apps/api/prisma/migrations/
git commit -m "feat(api): add Prisma business tables

- businesses, locations, business_hours models
- Unique slug index, relations to users
- Migration 20260317000000_add_business_tables"
```

## Commit 3: Business module and endpoints (S2-02 to S2-11)

**Date:** March 18, 2026 10:15

```bash
GIT_AUTHOR_DATE="2026-03-18 10:15:00 +0530" GIT_COMMITTER_DATE="2026-03-18 10:15:00 +0530" \
git add apps/api/src/business/ apps/api/src/app.module.ts
git commit -m "feat(api): add BusinessModule with full CRUD

- POST/GET/PATCH /v1/businesses
- GET /v1/businesses/slug/:slug (public)
- Location CRUD, business hours
- BusinessContextGuard, slug generation
- Swagger documentation"
```

## Commit 4: Dashboard layout with sidebar (S2-12)

**Date:** March 19, 2026 10:30

```bash
GIT_AUTHOR_DATE="2026-03-19 10:30:00 +0530" GIT_COMMITTER_DATE="2026-03-19 10:30:00 +0530" \
git add apps/web/app/\(dashboard\)/layout.tsx
git commit -m "feat(web): add dashboard layout with sidebar

- Responsive sidebar, collapsible on mobile
- Header with user menu and logout
- Nav: Dashboard, Settings"
```

## Commit 5: Business client and onboarding wizard (S2-13 to S2-16)

**Date:** March 20, 2026 11:00

```bash
GIT_AUTHOR_DATE="2026-03-20 11:00:00 +0530" GIT_COMMITTER_DATE="2026-03-20 11:00:00 +0530" \
git add apps/web/lib/business-client.ts apps/web/app/\(dashboard\)/onboarding/
git add apps/web/components/ui/select.tsx
git commit -m "feat(web): add business client and onboarding wizard

- createBusiness, createLocation, setBusinessHours
- 3-step wizard: business info, location, hours
- Completion screen with redirect"
```

## Commit 6: Dashboard and settings page (S2-17)

**Date:** March 21, 2026 14:00

```bash
GIT_AUTHOR_DATE="2026-03-21 14:00:00 +0530" GIT_COMMITTER_DATE="2026-03-21 14:00:00 +0530" \
git add apps/web/app/\(dashboard\)/dashboard/ apps/web/app/\(dashboard\)/settings/
git commit -m "feat(web): add dashboard and business settings page

- Dashboard lists businesses, CTA to onboarding
- Settings: edit name, category, description, logo URL
- Multi-business switcher"
```

## Commit 7: Task plan and docs (Sprint 2 complete)

**Date:** March 22, 2026 10:00

```bash
GIT_AUTHOR_DATE="2026-03-22 10:00:00 +0530" GIT_COMMITTER_DATE="2026-03-22 10:00:00 +0530" \
git add apps/docs/blooso_mvp_task_plan.md SPRINT_2_GIT_COMMITS.md
git commit -m "docs: Sprint 2 complete — mark business onboarding tasks done

- All 20 Sprint 2 tasks marked done
- Add SPRINT_2_GIT_COMMITS.md"
```
