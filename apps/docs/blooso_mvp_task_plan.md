# Blooso — MVP Standard Task Plan

**Version:** 1.1  
**Date:** March 9, 2026  
**Status:** Active  
**Total Tasks:** 218  
**Completed:** Sprint 0 (20 tasks), Sprint 1 (24 tasks), Sprint 2 (20 tasks), Sprint 3 (15 tasks), Sprint 4 (18 tasks)  
**Estimated Duration:** 22 weeks (11 sprints × 2 weeks)  
**Related:**

- [Project Specification](./blooso_project_specification_document.md)
- [Architecture Document](./blooso_architecture_document.md)
- [MVP Planning Document](./blooso_mvp_planning_document.md)

---

## Task Legend

**Priority:** `P0` Critical | `P1` High | `P2` Medium | `P3` Low  
**Type:** `setup` | `backend` | `frontend` | `shared` | `infra` | `test` | `docs`  
**Status:** `todo` | `in-progress` | `done` | `blocked`  
**Estimate:** Story points (1 = ~2 hours, 2 = ~4 hours, 3 = ~1 day, 5 = ~2 days, 8 = ~3-4 days)

---

## Sprint 0 — Foundation ✅ Complete

**Goal:** Monorepo boots with `turbo dev`, database connected, CI ready  
**Duration:** Week 1–2  
**Total Points:** 34  
**Completed:** March 9, 2026

| ID    | Task                                                                   | Type    | Priority | Estimate | Depends On   | Acceptance Criteria                                                        | Status |
| ----- | ---------------------------------------------------------------------- | ------- | -------- | -------- | ------------ | -------------------------------------------------------------------------- | ------ |
| S0-01 | Remove Turborepo starter content from `apps/web`                       | setup   | P0       | 1        | —            | Clean Next.js app with empty home page, no starter template content        | done   |
| S0-02 | Initialize NestJS 11 app in `apps/api`                                 | setup   | P0       | 3        | —            | NestJS app starts on port 3001, health endpoint returns `{ status: "ok" }` | done   |
| S0-03 | Configure Turborepo to run both apps                                   | setup   | P0       | 2        | S0-01, S0-02 | `turbo dev` starts both Next.js (:3000) and NestJS (:3001) concurrently    | done   |
| S0-04 | Create `packages/shared` package                                       | setup   | P0       | 2        | —            | Package exports from `@repo/shared`, importable by both apps, compiles     | done   |
| S0-05 | Create shared Zod base schemas and utility types                       | shared  | P1       | 2        | S0-04        | Pagination types, API response wrapper types, base ID schema exported      | done   |
| S0-06 | Initialize shadcn/ui in `apps/web`                                     | setup   | P0       | 3        | S0-01        | Button, Card components in `apps/web/components/ui`, Tailwind configured   | done   |
| S0-07 | Create shared Tailwind preset in `packages/tailwind-config`            | setup   | P1       | 2        | S0-06        | Design tokens in `@repo/tailwind-config`, CSS variables for theming        | done   |
| S0-08 | Create `docker-compose.yml` with PostgreSQL 16 + Redis 7               | infra   | P0       | 2        | —            | `docker compose up` starts Postgres on 5432 and Redis on 6379              | done   |
| S0-09 | Initialize Prisma in `apps/api`                                        | setup   | P0       | 2        | S0-02, S0-08 | Prisma client generated, connects to local Postgres, PrismaModule wired    | done   |
| S0-10 | Configure `@nestjs/config` with env validation                         | setup   | P0       | 2        | S0-02        | Env vars validated on startup, app fails fast if required vars missing     | done   |
| S0-11 | Configure `t3-env` in `apps/web`                                       | setup   | P1       | 1        | S0-01        | Type-safe env vars with runtime validation, `.env.example` created         | done   |
| S0-12 | Create `.env.example` files for both apps                              | setup   | P1       | 1        | S0-10, S0-11 | Both apps have documented `.env.example` with all required variables       | done   |
| S0-13 | Add Turborepo scripts: `db:migrate`, `db:push`, `db:seed`, `db:studio` | setup   | P1       | 1        | S0-09        | Scripts work from monorepo root via `turbo db:migrate` etc.                | done   |
| S0-14 | Configure shared ESLint config for NestJS                              | setup   | P1       | 2        | S0-02        | `apps/api` uses ESLint config, `packages/shared` has ESLint                | done   |
| S0-15 | Configure Prettier across monorepo                                     | setup   | P2       | 1        | —            | Consistent formatting, `.prettierrc` at root, works with all packages      | done   |
| S0-16 | Set up Husky + lint-staged                                             | setup   | P2       | 2        | S0-14, S0-15 | Pre-commit hook runs lint-staged, format on staged files                   | done   |
| S0-17 | Configure path aliases for both apps                                   | setup   | P1       | 1        | S0-01, S0-02 | `@/` alias works in both `apps/web` and `apps/api`                         | done   |
| S0-18 | Set up NestJS global exception filter                                  | backend | P1       | 2        | S0-02        | All API errors return consistent `{ statusCode, message, errors }` format  | done   |
| S0-19 | Set up NestJS global validation pipe                                   | backend | P1       | 1        | S0-02        | class-validator decorators auto-validate all DTOs                          | done   |
| S0-20 | Set up CORS configuration in NestJS                                    | backend | P0       | 1        | S0-02        | NestJS accepts requests from `localhost:3000`, configurable via env        | done   |

---

## Sprint 1 — Authentication ✅ Complete

**Goal:** Full register → login → session → protected routes  
**Duration:** Week 3–4  
**Total Points:** 52  
**Completed:** March 15, 2026

### Backend

| ID    | Task                                                        | Type    | Priority | Estimate | Depends On   | Acceptance Criteria                                                       | Status |
| ----- | ----------------------------------------------------------- | ------- | -------- | -------- | ------------ | ------------------------------------------------------------------------- | ------ |
| S1-01 | Design Prisma schema: `users`, `sessions`, `refresh_tokens` | backend | P0       | 3        | S0-09        | Schema includes all fields from architecture doc, migration runs clean    | done   |
| S1-02 | Create seed script for default admin user                   | backend | P1       | 1        | S1-01        | `turbo db:seed` creates admin user with known credentials                 | done   |
| S1-03 | Create `AuthModule` with controller, service                | backend | P0       | 2        | S1-01        | Module registered in `AppModule`, DI wired correctly                      | done   |
| S1-04 | Implement password hashing utility (bcrypt)                 | backend | P0       | 1        | —            | Hash and compare functions, minimum 10 salt rounds                        | done   |
| S1-05 | Implement `POST /v1/auth/register`                          | backend | P0       | 3        | S1-03, S1-04 | Creates user with hashed password, returns tokens, validates unique email | done   |
| S1-06 | Implement `POST /v1/auth/login`                             | backend | P0       | 3        | S1-03, S1-04 | Validates credentials, returns access token (15min) + refresh token (7d)  | done   |
| S1-07 | Implement JWT token generation and validation               | backend | P0       | 3        | S1-03        | Access token with user ID + role in payload, configurable expiry          | done   |
| S1-08 | Implement `POST /v1/auth/refresh`                           | backend | P0       | 3        | S1-07        | Rotates refresh token, old token invalidated, returns new pair            | done   |
| S1-09 | Implement `POST /v1/auth/logout`                            | backend | P1       | 2        | S1-07        | Invalidates session and refresh token in DB                               | done   |
| S1-10 | Implement `GET /v1/auth/me`                                 | backend | P0       | 1        | S1-07        | Returns current user profile (id, email, name, role, avatar)              | done   |
| S1-11 | Create `JwtAuthGuard`                                       | backend | P0       | 3        | S1-07        | Extracts Bearer token, validates JWT, attaches user to request            | done   |
| S1-12 | Create `RolesGuard` with `@Roles()` decorator               | backend | P0       | 3        | S1-11        | Restricts routes by role, returns 403 if insufficient permissions         | done   |
| S1-13 | Create `@CurrentUser()` parameter decorator                 | backend | P1       | 1        | S1-11        | Extracts user from request in controller methods                          | done   |
| S1-14 | Set up `@nestjs/swagger` and document auth endpoints        | backend | P1       | 2        | S1-05, S1-06 | Swagger UI at `/api/docs`, all auth endpoints documented with schemas     | done   |
| S1-15 | Implement rate limiting on auth endpoints                   | backend | P2       | 2        | S1-05, S1-06 | Max 5 login attempts per minute per IP, 429 response on exceed            | todo   |

### Frontend

| ID    | Task                                               | Type     | Priority | Estimate | Depends On   | Acceptance Criteria                                                                                | Status |
| ----- | -------------------------------------------------- | -------- | -------- | -------- | ------------ | -------------------------------------------------------------------------------------------------- | ------ |
| S1-16 | Create API client utility (`lib/api-client.ts`)    | frontend | P0       | 3        | S0-20        | Fetch wrapper with: base URL config, auth header injection, error parsing, type generics           | done   |
| S1-17 | Create auth context/provider with token management | frontend | P0       | 3        | S1-16        | Stores tokens in localStorage, auto-refreshes on load, provides `user` state                       | done   |
| S1-18 | Create `(auth)` layout                             | frontend | P1       | 2        | S0-06        | Centered card layout, responsive                                                                   | done   |
| S1-19 | Build register page (`/register`)                  | frontend | P0       | 3        | S1-17, S1-18 | Form: name, email, password. Validation errors shown inline. Success → redirect to dashboard       | done   |
| S1-20 | Build login page (`/login`)                        | frontend | P0       | 3        | S1-17, S1-18 | Form: email, password. Validation errors inline. Success → redirect to dashboard. Link to register | done   |
| S1-21 | Implement Next.js auth middleware                  | frontend | P0       | 3        | S1-17        | Client-side redirects (tokens in localStorage)                                                     | done   |
| S1-22 | Create placeholder dashboard page                  | frontend | P1       | 1        | S1-21        | `/dashboard` — shows "Welcome, {name}" with logout button, protected                               | done   |

### Shared

| ID    | Task                        | Type   | Priority | Estimate | Depends On | Acceptance Criteria                                                          | Status |
| ----- | --------------------------- | ------ | -------- | -------- | ---------- | ---------------------------------------------------------------------------- | ------ |
| S1-23 | Define `UserRole` enum      | shared | P0       | 1        | S0-04      | Enum: `client`, `staff`, `manager`, `owner`, `admin` — used by both apps     | done   |
| S1-24 | Define auth Zod schemas     | shared | P0       | 1        | S0-04      | `registerSchema`, `loginSchema`, `refreshSchema` with field-level validation | done   |
| S1-25 | Define user type interfaces | shared | P0       | 1        | S0-04      | `User`, `AuthResponse`, `TokenPair` interfaces                               | done   |

---

## Sprint 2 — Business Onboarding ✅ Complete

**Goal:** Business owners create and configure their business  
**Duration:** Week 5–6  
**Total Points:** 46  
**Completed:** March 22, 2026

### Backend

| ID    | Task                                                               | Type    | Priority | Estimate | Depends On | Acceptance Criteria                                                                | Status |
| ----- | ------------------------------------------------------------------ | ------- | -------- | -------- | ---------- | ---------------------------------------------------------------------------------- | ------ |
| S2-01 | Prisma schema: `businesses`, `locations`, `business_hours`         | backend | P0       | 3        | S1-01      | Migration runs, relations defined, indexes on `slug` (unique)                      | done   |
| S2-02 | Create `BusinessModule` (controller, service, repository)          | backend | P0       | 2        | S2-01      | Module registered, DI wired, imports PrismaModule                                  | done   |
| S2-03 | Implement `POST /v1/businesses`                                    | backend | P0       | 3        | S2-02      | Creates business, auto-generates unique slug from name, sets current user as owner | done   |
| S2-04 | Implement slug generation utility                                  | backend | P1       | 2        | —          | Converts name to URL-safe slug, appends number if duplicate exists                 | done   |
| S2-05 | Implement `GET /v1/businesses/:id`                                 | backend | P0       | 2        | S2-02      | Returns business with locations and hours, requires auth + ownership               | done   |
| S2-06 | Implement `PATCH /v1/businesses/:id`                               | backend | P1       | 2        | S2-02      | Updates business fields (name, description, logo_url, category, settings)          | done   |
| S2-07 | Implement `GET /v1/businesses/slug/:slug`                          | backend | P0       | 2        | S2-02      | Public endpoint (no auth), returns business profile for booking page               | done   |
| S2-08 | Create `BusinessContextGuard`                                      | backend | P0       | 3        | S1-11      | Verifies user is owner/manager/staff of the business in URL, injects `businessId`  | done   |
| S2-09 | Implement location CRUD: `POST/PATCH /v1/businesses/:id/locations` | backend | P1       | 3        | S2-08      | Create/update location with address, phone, timezone, lat/lng                      | done   |
| S2-10 | Implement `PUT /v1/businesses/:id/locations/:locId/hours`          | backend | P1       | 2        | S2-09      | Set/update business hours for each day of week (open_time, close_time, is_closed)  | done   |
| S2-11 | Swagger documentation for business endpoints                       | backend | P2       | 1        | S2-03      | All business endpoints documented with request/response schemas                    | done   |

### Frontend

| ID    | Task                                                | Type     | Priority | Estimate | Depends On | Acceptance Criteria                                               | Status |
| ----- | --------------------------------------------------- | -------- | -------- | -------- | ---------- | ----------------------------------------------------------------- | ------ |
| S2-12 | Create `(dashboard)` layout with sidebar navigation | frontend | P0       | 5        | S0-06      | Responsive sidebar (collapsible on mobile), header with user menu | done   |
| S2-13 | Build onboarding wizard — Step 1: Business info     | frontend | P0       | 3        | S2-03      | Name, category (select), description. Validation. Next button     | done   |
| S2-14 | Build onboarding wizard — Step 2: Location          | frontend | P0       | 3        | S2-13      | Address, phone, timezone                                          | done   |
| S2-15 | Build onboarding wizard — Step 3: Business hours    | frontend | P0       | 3        | S2-14      | Weekly grid: set open/close times per day, toggle day off         | done   |
| S2-16 | Build onboarding wizard — Completion                | frontend | P1       | 1        | S2-15      | Success screen, redirect to dashboard                             | done   |
| S2-17 | Build business settings page                        | frontend | P1       | 3        | S2-12      | Edit business info, location. Logo URL input                      | done   |
| S2-18 | Integrate Uploadthing for image uploads             | frontend | P1       | 3        | —          | Business logo upload, preview, remove. Max 5MB, image types only  | todo   |

### Shared

| ID    | Task                                  | Type   | Priority | Estimate | Depends On | Acceptance Criteria                                                        | Status |
| ----- | ------------------------------------- | ------ | -------- | -------- | ---------- | -------------------------------------------------------------------------- | ------ |
| S2-19 | Define business types and interfaces  | shared | P0       | 1        | S0-04      | `Business`, `Location`, `BusinessHours`, `BusinessCategory`                | done   |
| S2-20 | Define business Zod schemas           | shared | P0       | 1        | S0-04      | `createBusinessSchema`, `updateBusinessSchema`, `businessHoursSchema`      | done   |
| S2-21 | Define `BUSINESS_CATEGORIES` constant | shared | P1       | 1        | S0-04      | Array of categories: salon, barbershop, spa, wellness, nails, tattoo, etc. | done   |

---

## Sprint 3 — Service Management ✅ Complete

**Goal:** Businesses create and manage their service menu  
**Duration:** Week 7–8  
**Total Points:** 36  
**Completed:** March 29, 2026

### Backend

| ID    | Task                                                                    | Type    | Priority | Estimate | Depends On | Acceptance Criteria                                                      | Status |
| ----- | ----------------------------------------------------------------------- | ------- | -------- | -------- | ---------- | ------------------------------------------------------------------------ | ------ |
| S3-01 | Prisma schema: `service_categories`, `services`                         | backend | P0       | 2        | S2-01      | Migration runs, `business_id` FK, `sort_order` on categories             | done   |
| S3-02 | Create `ServiceModule` (controller, service, repository)                | backend | P0       | 2        | S3-01      | Module registered, guarded by `BusinessContextGuard`                     | done   |
| S3-03 | Implement category CRUD: `POST/GET/PATCH/DELETE`                        | backend | P0       | 3        | S3-02      | Full CRUD at `/v1/businesses/:id/service-categories`, scoped to business | done   |
| S3-04 | Implement category reorder: `PATCH .../service-categories/reorder`      | backend | P2       | 2        | S3-03      | Accepts array of `{ id, sort_order }`, updates in transaction            | done   |
| S3-05 | Implement service CRUD: `POST/GET/PATCH/DELETE`                         | backend | P0       | 3        | S3-02      | Full CRUD at `/v1/businesses/:id/services`, includes category relation   | done   |
| S3-06 | Implement service activation toggle                                     | backend | P1       | 1        | S3-05      | `PATCH .../services/:id` with `{ is_active: boolean }`                   | done   |
| S3-07 | Implement public service list: `GET /v1/businesses/slug/:slug/services` | backend | P0       | 2        | S3-05      | No auth, returns active services grouped by category, for booking page   | done   |
| S3-08 | Swagger documentation for service endpoints                             | backend | P2       | 1        | S3-05      | All service endpoints documented                                         | done   |

### Frontend

| ID    | Task                                   | Type     | Priority | Estimate | Depends On | Acceptance Criteria                                                   | Status |
| ----- | -------------------------------------- | -------- | -------- | -------- | ---------- | --------------------------------------------------------------------- | ------ |
| S3-09 | Build services page (dashboard)        | frontend | P0       | 3        | S2-12      | Lists all services grouped by category, with add/edit/delete actions  | done   |
| S3-10 | Build category management UI           | frontend | P1       | 3        | S3-09      | Add, rename, delete categories                                        | done   |
| S3-11 | Build service form (create/edit)       | frontend | P0       | 3        | S3-09      | Form: name, description, category, duration, price, buffer, is_active | done   |
| S3-12 | Active/inactive toggle on service list | frontend | P1       | 1        | S3-09      | Switch component, optimistic update, visual indicator for inactive    | done   |
| S3-13 | Empty state for services page          | frontend | P2       | 1        | S3-09      | Illustration + CTA when no services exist                             | done   |

### Shared

| ID    | Task                       | Type   | Priority | Estimate | Depends On | Acceptance Criteria                                                  | Status |
| ----- | -------------------------- | ------ | -------- | -------- | ---------- | -------------------------------------------------------------------- | ------ |
| S3-14 | Define service types       | shared | P0       | 1        | S0-04      | `Service`, `ServiceCategory`, `ServiceWithCategory`                  | done   |
| S3-15 | Define service Zod schemas | shared | P0       | 1        | S0-04      | `createServiceSchema`, `updateServiceSchema`, `createCategorySchema` | done   |

---

## Sprint 4 — Staff Management ✅ Complete

**Goal:** Businesses add staff, assign services, configure schedules  
**Duration:** Week 9–10  
**Total Points:** 42  
**Completed:** April 5, 2026

### Backend

| ID    | Task                                                                | Type    | Priority | Estimate | Depends On | Acceptance Criteria                                                         | Status |
| ----- | ------------------------------------------------------------------- | ------- | -------- | -------- | ---------- | --------------------------------------------------------------------------- | ------ |
| S4-01 | Prisma schema: `staff_members`, `staff_schedules`, `staff_services` | backend | P0       | 3        | S3-01      | Migration runs, relations to users, services, businesses                    | done   |
| S4-02 | Create `StaffModule` (controller, service, repository)              | backend | P0       | 2        | S4-01      | Module registered, guarded by `BusinessContextGuard`                        | done   |
| S4-03 | Implement `POST /v1/businesses/:id/staff`                           | backend | P0       | 3        | S4-02      | Creates user account (if new) + staff_member record, sends invite email     | done   |
| S4-04 | Implement `GET /v1/businesses/:id/staff`                            | backend | P0       | 2        | S4-02      | Lists all staff with role, service count, schedule status                   | done   |
| S4-05 | Implement `GET /v1/businesses/:id/staff/:staffId`                   | backend | P1       | 2        | S4-02      | Full staff profile: info + assigned services + weekly schedule              | done   |
| S4-06 | Implement `PATCH /v1/businesses/:id/staff/:staffId`                 | backend | P1       | 2        | S4-02      | Update name, role, commission_rate, bio                                     | done   |
| S4-07 | Implement `DELETE /v1/businesses/:id/staff/:staffId`                | backend | P1       | 2        | S4-02      | Soft delete, reassign/cancel future appointments check                      | done   |
| S4-08 | Implement `PUT .../staff/:staffId/services`                         | backend | P0       | 2        | S4-02      | Replace service assignments (array of service IDs)                          | done   |
| S4-09 | Implement `PUT .../staff/:staffId/schedule`                         | backend | P0       | 3        | S4-02      | Set weekly schedule: array of `{ day, start_time, end_time, is_available }` | done   |
| S4-10 | Swagger documentation for staff endpoints                           | backend | P2       | 1        | S4-04      | All staff endpoints documented                                              | done   |

### Frontend

| ID    | Task                                   | Type     | Priority | Estimate | Depends On | Acceptance Criteria                                                       | Status |
| ----- | -------------------------------------- | -------- | -------- | -------- | ---------- | ------------------------------------------------------------------------- | ------ |
| S4-11 | Build staff list page (dashboard)      | frontend | P0       | 3        | S2-12      | Table/grid: name, role badge, assigned services count, schedule indicator | done   |
| S4-12 | Build add staff form                   | frontend | P0       | 3        | S4-11      | Dialog: name, email, role (select), commission rate                       | done   |
| S4-13 | Build staff detail page                | frontend | P0       | 3        | S4-11      | Tabs: profile info, assigned services, weekly schedule                    | done   |
| S4-14 | Build weekly schedule editor component | frontend | P0       | 5        | S4-13      | Visual grid: 7 days, set start/end time per day, toggle day off           | done   |
| S4-15 | Build service assignment UI            | frontend | P1       | 2        | S4-13      | Checkbox list of all business services, save assignments                  | done   |

### Shared

| ID    | Task                     | Type   | Priority | Estimate | Depends On | Acceptance Criteria                                             | Status |
| ----- | ------------------------ | ------ | -------- | -------- | ---------- | --------------------------------------------------------------- | ------ |
| S4-16 | Define staff types       | shared | P0       | 1        | S0-04      | `StaffMember`, `StaffSchedule`, `StaffWithDetails`              | done   |
| S4-17 | Define staff Zod schemas | shared | P0       | 1        | S0-04      | `createStaffSchema`, `updateStaffSchema`, `staffScheduleSchema` | done   |
| S4-18 | Define `StaffRole` enum  | shared | P0       | 1        | S0-04      | `owner`, `manager`, `senior_staff`, `staff`, `junior_staff`     | done   |

---

## Sprint 5 — Availability Engine & Booking API

**Goal:** Core availability algorithm + booking creation with conflict prevention  
**Duration:** Week 11–12  
**Total Points:** 47

### Backend

| ID    | Task                                                                            | Type    | Priority | Estimate | Depends On   | Acceptance Criteria                                                                                               | Status |
| ----- | ------------------------------------------------------------------------------- | ------- | -------- | -------- | ------------ | ----------------------------------------------------------------------------------------------------------------- | ------ |
| S5-01 | Prisma schema: `appointments`, `appointment_services`, `availability_overrides` | backend | P0       | 3        | S4-01        | Migration runs, composite indexes on `(business_id, start_time)` and `(staff_id, start_time)`                     | todo   |
| S5-02 | Create `AvailabilityModule` with `AvailabilityService`                          | backend | P0       | 2        | S5-01        | Module registered, service injectable                                                                             | todo   |
| S5-03 | Implement slot generation algorithm                                             | backend | P0       | 8        | S5-02        | Given staff + service + date → generates all possible start times based on duration + buffer, respecting schedule | todo   |
| S5-04 | Implement conflict detection                                                    | backend | P0       | 5        | S5-03        | Filters out slots that overlap with existing appointments (query by staff + date range)                           | todo   |
| S5-05 | Implement availability override support                                         | backend | P1       | 3        | S5-03        | Overrides (time off, special hours) modify available slots for specific dates                                     | todo   |
| S5-06 | Implement `GET /v1/availability`                                                | backend | P0       | 3        | S5-04        | Query params: `businessId`, `staffId` (optional), `serviceId`, `date` → returns `TimeSlot[]`                      | todo   |
| S5-07 | Create `BookingModule` (controller, service)                                    | backend | P0       | 2        | S5-01        | Module registered, imports AvailabilityModule                                                                     | todo   |
| S5-08 | Implement `POST /v1/bookings`                                                   | backend | P0       | 5        | S5-07, S5-06 | Validates slot still available (re-check), creates appointment + services in transaction                          | todo   |
| S5-09 | Implement double-booking prevention (optimistic lock)                           | backend | P0       | 3        | S5-08        | Transaction with row-level lock, returns 409 Conflict if slot taken                                               | todo   |
| S5-10 | Implement `GET /v1/businesses/:id/appointments`                                 | backend | P0       | 3        | S5-07        | Query: `date`, `staffId`, `status`. Returns appointments with relations                                           | todo   |
| S5-11 | Implement `PATCH /v1/businesses/:id/appointments/:id`                           | backend | P1       | 2        | S5-07        | Update status, notes, reschedule (with availability re-check)                                                     | todo   |
| S5-12 | Implement `POST .../appointments/:id/cancel`                                    | backend | P0       | 2        | S5-07        | Sets status to `cancelled`, records reason, triggers notification                                                 | todo   |
| S5-13 | Implement `POST .../staff/:id/overrides`                                        | backend | P1       | 2        | S5-02        | Create availability override: date, start/end time, is_available, reason                                          | todo   |
| S5-14 | Swagger documentation for availability + booking                                | backend | P2       | 1        | S5-06, S5-08 | All endpoints documented with query params and response schemas                                                   | todo   |

### Shared

| ID    | Task                        | Type   | Priority | Estimate | Depends On | Acceptance Criteria                                           | Status |
| ----- | --------------------------- | ------ | -------- | -------- | ---------- | ------------------------------------------------------------- | ------ |
| S5-15 | Define appointment types    | shared | P0       | 1        | S0-04      | `Appointment`, `AppointmentService`, `AppointmentStatus` enum | todo   |
| S5-16 | Define booking Zod schemas  | shared | P0       | 1        | S0-04      | `createBookingSchema`, `cancelBookingSchema`                  | todo   |
| S5-17 | Define availability types   | shared | P0       | 1        | S0-04      | `TimeSlot`, `AvailabilityQuery`, `AvailabilityOverride`       | todo   |
| S5-18 | Define `BookingSource` enum | shared | P1       | 1        | S0-04      | `web`, `mobile`, `walk_in`, `phone`, `marketplace`            | todo   |

---

## Sprint 6 — Calendar UI & Client Booking Flow

**Goal:** Business calendar + full client booking experience  
**Duration:** Week 13–14  
**Total Points:** 55

### Frontend — Business Calendar

| ID    | Task                                            | Type     | Priority | Estimate | Depends On | Acceptance Criteria                                                                 | Status |
| ----- | ----------------------------------------------- | -------- | -------- | -------- | ---------- | ----------------------------------------------------------------------------------- | ------ |
| S6-01 | Build calendar page layout with day/week toggle | frontend | P0       | 3        | S2-12      | Date header, view toggle, staff filter dropdown, time grid column layout            | todo   |
| S6-02 | Build time grid component                       | frontend | P0       | 5        | S6-01      | Vertical time axis (business hours), horizontal staff columns, 15min row increments | todo   |
| S6-03 | Render appointments on calendar                 | frontend | P0       | 5        | S6-02      | Positioned by time, colored by status, shows service name + client name             | todo   |
| S6-04 | Click-to-create appointment                     | frontend | P0       | 3        | S6-02      | Click empty slot → open form pre-filled with time + staff → save                    | todo   |
| S6-05 | Appointment creation form (walk-in)             | frontend | P0       | 3        | S6-04      | Select client (search/create), service, staff, time. Uses availability API          | todo   |
| S6-06 | Appointment detail side panel                   | frontend | P1       | 3        | S6-03      | Click appointment → slide-over with: client info, services, status, actions         | todo   |
| S6-07 | Status update buttons                           | frontend | P1       | 2        | S6-06      | Confirm, check-in, complete, no-show, cancel — with confirmation dialog             | todo   |
| S6-08 | Drag-and-drop reschedule                        | frontend | P2       | 5        | S6-03      | Drag appointment to new time/staff, calls reschedule API, snaps to grid             | todo   |
| S6-09 | Date navigation                                 | frontend | P0       | 2        | S6-01      | Previous/next buttons, date picker, "Today" shortcut                                | todo   |
| S6-10 | Staff filter                                    | frontend | P1       | 2        | S6-01      | Dropdown to show single staff or all staff columns                                  | todo   |

### Frontend — Client Booking Flow

| ID    | Task                                             | Type     | Priority | Estimate | Depends On | Acceptance Criteria                                                                   | Status |
| ----- | ------------------------------------------------ | -------- | -------- | -------- | ---------- | ------------------------------------------------------------------------------------- | ------ |
| S6-11 | Build business public profile page (`/b/[slug]`) | frontend | P0       | 3        | S2-07      | Business name, logo, description, category, hours, rating, service list               | todo   |
| S6-12 | Build service selection step                     | frontend | P0       | 3        | S6-11      | Categorized service list, select one or more, running total, "Continue" button        | todo   |
| S6-13 | Build staff selection step                       | frontend | P1       | 2        | S6-12      | Optional: choose staff or "Any available". Show staff photo, name, bio                | todo   |
| S6-14 | Build date/time selection step                   | frontend | P0       | 5        | S6-13      | Calendar date picker + time slot grid, fetches availability API, highlights available | todo   |
| S6-15 | Build booking summary & confirmation step        | frontend | P0       | 3        | S6-14      | Summary: business, service(s), staff, date/time, price. Guest form or login prompt    | todo   |
| S6-16 | Build booking success page                       | frontend | P1       | 2        | S6-15      | Confirmation: booking details, "Add to Calendar" link, "Book Again" button            | todo   |

### Frontend — Search/Discovery

| ID    | Task                                              | Type     | Priority | Estimate | Depends On | Acceptance Criteria                                                     | Status |
| ----- | ------------------------------------------------- | -------- | -------- | -------- | ---------- | ----------------------------------------------------------------------- | ------ |
| S6-17 | Build search page (`/search`)                     | frontend | P1       | 3        | S0-06      | Search bar, category filters, results grid                              | todo   |
| S6-18 | Build search backend: `GET /v1/businesses/search` | backend  | P1       | 3        | S2-02      | Query: `q`, `category`, `page`, `limit`. PostgreSQL `ILIKE` + `pg_trgm` | todo   |
| S6-19 | Build business card component for search results  | frontend | P1       | 2        | S6-17      | Business logo, name, category, rating, price range, CTA button          | todo   |

---

## Sprint 7 — Payments & Notifications

**Goal:** Stripe payments + transactional email notifications  
**Duration:** Week 15–16  
**Total Points:** 48

### Backend — Payments

| ID    | Task                                         | Type    | Priority | Estimate | Depends On | Acceptance Criteria                                                                    | Status |
| ----- | -------------------------------------------- | ------- | -------- | -------- | ---------- | -------------------------------------------------------------------------------------- | ------ |
| S7-01 | Prisma schema: `payments`, `invoices`        | backend | P0       | 2        | S5-01      | Migration runs, FK to appointments, payment method enum                                | todo   |
| S7-02 | Create `PaymentModule` (controller, service) | backend | P0       | 2        | S7-01      | Module registered, Stripe SDK initialized via config                                   | todo   |
| S7-03 | Implement `POST /v1/payments/checkout`       | backend | P0       | 5        | S7-02      | Creates Stripe Checkout Session with line items from appointment services              | todo   |
| S7-04 | Implement Stripe webhook handler             | backend | P0       | 5        | S7-02      | `POST /v1/payments/webhook` — verifies signature, handles `checkout.session.completed` | todo   |
| S7-05 | Record payment on webhook success            | backend | P0       | 3        | S7-04      | Creates payment record, updates appointment status to `confirmed`                      | todo   |
| S7-06 | Implement in-person checkout                 | backend | P1       | 3        | S7-02      | `POST /v1/businesses/:id/appointments/:id/checkout` — record cash/card payment         | todo   |
| S7-07 | Implement tip recording                      | backend | P2       | 1        | S7-06      | `tip_amount` field on payment record                                                   | todo   |

### Backend — Notifications

| ID    | Task                                              | Type    | Priority | Estimate | Depends On   | Acceptance Criteria                                                   | Status |
| ----- | ------------------------------------------------- | ------- | -------- | -------- | ------------ | --------------------------------------------------------------------- | ------ |
| S7-08 | Set up Redis connection + BullMQ in NestJS        | infra   | P0       | 3        | S0-08        | `@nestjs/bullmq` configured, Redis connects, test queue works         | todo   |
| S7-09 | Create `NotificationModule` with email service    | backend | P0       | 2        | S7-08        | Module with Resend SDK, `sendEmail()` method                          | todo   |
| S7-10 | Create React Email template: booking confirmation | backend | P0       | 3        | S7-09        | Beautiful HTML email with business logo, service, date/time, location | todo   |
| S7-11 | Create React Email template: appointment reminder | backend | P1       | 2        | S7-09        | Reminder email with appointment details, cancel/reschedule link       | todo   |
| S7-12 | Create React Email template: cancellation notice  | backend | P1       | 2        | S7-09        | Cancellation email with reason and re-booking CTA                     | todo   |
| S7-13 | Implement booking confirmation email trigger      | backend | P0       | 2        | S7-10, S5-08 | Sends on `POST /v1/bookings` success                                  | todo   |
| S7-14 | Implement appointment reminder queue job          | backend | P1       | 3        | S7-11, S7-08 | BullMQ delayed job: scheduled 24h and 1h before appointment           | todo   |
| S7-15 | Implement cancellation email trigger              | backend | P1       | 1        | S7-12, S5-12 | Sends on appointment cancellation                                     | todo   |

### Frontend

| ID    | Task                                      | Type     | Priority | Estimate | Depends On | Acceptance Criteria                                                            | Status |
| ----- | ----------------------------------------- | -------- | -------- | -------- | ---------- | ------------------------------------------------------------------------------ | ------ |
| S7-16 | Integrate Stripe Checkout in booking flow | frontend | P0       | 3        | S7-03      | After booking confirmation → redirect to Stripe → return to success page       | todo   |
| S7-17 | Build payment success callback page       | frontend | P1       | 2        | S7-16      | `/booking/success?session_id=` — verifies payment, shows confirmation          | todo   |
| S7-18 | Build payment cancel callback page        | frontend | P2       | 1        | S7-16      | `/booking/cancel` — message + retry booking link                               | todo   |
| S7-19 | Build in-person checkout in dashboard     | frontend | P1       | 3        | S7-06      | On appointment detail → "Checkout" button → select method (cash/card) → record | todo   |
| S7-20 | Show payment status on appointment detail | frontend | P1       | 1        | S7-19      | Badge: paid, unpaid, refunded. Payment amount and method                       | todo   |

---

## Sprint 8 — Client CRM

**Goal:** Business can manage client profiles, notes, tags, history  
**Duration:** Week 17–18  
**Total Points:** 36

### Backend

| ID    | Task                                                            | Type    | Priority | Estimate | Depends On   | Acceptance Criteria                                                                      | Status |
| ----- | --------------------------------------------------------------- | ------- | -------- | -------- | ------------ | ---------------------------------------------------------------------------------------- | ------ |
| S8-01 | Prisma schema: `clients`, `client_notes`, `client_tags`         | backend | P0       | 2        | S5-01        | Migration runs, unique constraint on `(business_id, email)`                              | todo   |
| S8-02 | Create `ClientModule` (controller, service, repository)         | backend | P0       | 2        | S8-01        | Module registered, guarded by `BusinessContextGuard`                                     | todo   |
| S8-03 | Implement client CRUD: `POST/GET/PATCH`                         | backend | P0       | 3        | S8-02        | Create, list (paginated + search), get by ID, update profile                             | todo   |
| S8-04 | Implement client search: `GET .../clients?search=`              | backend | P0       | 3        | S8-02        | Searches across first_name, last_name, email, phone using `ILIKE`                        | todo   |
| S8-05 | Implement client notes: `POST/GET/DELETE .../clients/:id/notes` | backend | P1       | 2        | S8-02        | Create note (with `is_private` flag), list notes, delete own notes                       | todo   |
| S8-06 | Implement client tags: `POST/DELETE .../clients/:id/tags`       | backend | P1       | 2        | S8-02        | Add/remove string tags on client profile                                                 | todo   |
| S8-07 | Auto-create client on first booking                             | backend | P0       | 2        | S8-02, S5-08 | If no client record exists for email when booking created, auto-create from booking data | todo   |
| S8-08 | Implement `GET .../clients/:id/appointments`                    | backend | P1       | 2        | S8-02        | Client appointment history: past + upcoming, sorted by date                              | todo   |
| S8-09 | Swagger documentation for client endpoints                      | backend | P2       | 1        | S8-03        | All client endpoints documented                                                          | todo   |

### Frontend

| ID    | Task                       | Type     | Priority | Estimate | Depends On | Acceptance Criteria                                                       | Status |
| ----- | -------------------------- | -------- | -------- | -------- | ---------- | ------------------------------------------------------------------------- | ------ |
| S8-10 | Build clients list page    | frontend | P0       | 3        | S2-12      | Searchable data table: name, email, phone, last visit, total visits, tags | todo   |
| S8-11 | Build client detail page   | frontend | P0       | 5        | S8-10      | Tabs: overview (stats + info), appointments (history), notes, tags        | todo   |
| S8-12 | Build add/edit client form | frontend | P0       | 3        | S8-10      | Dialog: first name, last name, email, phone, DOB, preferences             | todo   |
| S8-13 | Build client notes section | frontend | P1       | 2        | S8-11      | Add note (text area + private toggle), list with date and author, delete  | todo   |
| S8-14 | Build client tags UI       | frontend | P1       | 2        | S8-11      | Tag input: type to add, click X to remove, shows colored badges           | todo   |

### Shared

| ID    | Task                      | Type   | Priority | Estimate | Depends On | Acceptance Criteria                                            | Status |
| ----- | ------------------------- | ------ | -------- | -------- | ---------- | -------------------------------------------------------------- | ------ |
| S8-15 | Define client types       | shared | P0       | 1        | S0-04      | `Client`, `ClientNote`, `ClientWithStats`                      | todo   |
| S8-16 | Define client Zod schemas | shared | P0       | 1        | S0-04      | `createClientSchema`, `updateClientSchema`, `createNoteSchema` | todo   |

---

## Sprint 9 — Reviews & Dashboard

**Goal:** Review system + business analytics dashboard  
**Duration:** Week 19–20  
**Total Points:** 48

### Backend — Reviews

| ID    | Task                                         | Type    | Priority | Estimate | Depends On | Acceptance Criteria                                                                            | Status |
| ----- | -------------------------------------------- | ------- | -------- | -------- | ---------- | ---------------------------------------------------------------------------------------------- | ------ |
| S9-01 | Prisma schema: `reviews`                     | backend | P0       | 2        | S5-01      | Migration runs, FK to business, client, appointment. Rating 1-5 check constraint               | todo   |
| S9-02 | Create `ReviewModule` (controller, service)  | backend | P0       | 2        | S9-01      | Module registered, public read + auth-required write                                           | todo   |
| S9-03 | Implement `POST /v1/reviews`                 | backend | P0       | 3        | S9-02      | Client submits: rating, comment, appointment_id. Validates appointment exists and is completed | todo   |
| S9-04 | Implement `GET /v1/reviews?businessId=`      | backend | P0       | 2        | S9-02      | Paginated, sorted by date, includes client name and business reply                             | todo   |
| S9-05 | Implement `PATCH /v1/reviews/:id/reply`      | backend | P1       | 2        | S9-02      | Business owner/manager can reply to review (one reply per review)                              | todo   |
| S9-06 | Update business average rating on new review | backend | P0       | 2        | S9-03      | Recalculate `avg_rating` and `review_count` on business record                                 | todo   |
| S9-07 | Implement review request email job           | backend | P1       | 2        | S7-08      | BullMQ job: send email 2h after appointment marked completed                                   | todo   |

### Backend — Reports

| ID    | Task                                             | Type    | Priority | Estimate | Depends On | Acceptance Criteria                                                                       | Status |
| ----- | ------------------------------------------------ | ------- | -------- | -------- | ---------- | ----------------------------------------------------------------------------------------- | ------ |
| S9-08 | Create `ReportModule` (controller, service)      | backend | P0       | 2        | S5-01      | Module registered, guarded by `BusinessContextGuard`                                      | todo   |
| S9-09 | Implement `GET .../reports/dashboard`            | backend | P0       | 5        | S9-08      | Returns: today's appointments, today's revenue, week's revenue, total clients, avg rating | todo   |
| S9-10 | Implement `GET .../reports/revenue?period=`      | backend | P1       | 3        | S9-08      | Revenue by day/week/month for given period, grouped for chart data                        | todo   |
| S9-11 | Implement `GET .../reports/appointments?period=` | backend | P1       | 3        | S9-08      | Appointment count by day, by status, by service for given period                          | todo   |
| S9-12 | Implement `GET .../reports/clients`              | backend | P2       | 2        | S9-08      | New vs returning clients by period, top clients by visits                                 | todo   |

### Frontend — Reviews

| ID    | Task                                 | Type     | Priority | Estimate | Depends On | Acceptance Criteria                                                     | Status |
| ----- | ------------------------------------ | -------- | -------- | -------- | ---------- | ----------------------------------------------------------------------- | ------ |
| S9-13 | Show reviews on business public page | frontend | P0       | 3        | S6-11      | Star rating display, review list with client name, date, comment, reply | todo   |
| S9-14 | Build review submission page         | frontend | P0       | 3        | S9-03      | `/review/[appointmentId]` — star select, comment textarea, submit       | todo   |
| S9-15 | Build review management in dashboard | frontend | P1       | 2        | S2-12      | List reviews, click to reply, filter by rating                          | todo   |

### Frontend — Dashboard

| ID    | Task                         | Type     | Priority | Estimate | Depends On | Acceptance Criteria                                                                         | Status |
| ----- | ---------------------------- | -------- | -------- | -------- | ---------- | ------------------------------------------------------------------------------------------- | ------ |
| S9-16 | Build dashboard home page    | frontend | P0       | 3        | S2-12      | Grid layout: KPI cards, today's schedule, recent reviews, quick actions                     | todo   |
| S9-17 | Build KPI cards component    | frontend | P0       | 2        | S9-16      | 4 cards: today's revenue, bookings count, new clients, average rating. With trend indicator | todo   |
| S9-18 | Build revenue line chart     | frontend | P1       | 3        | S9-16      | Recharts or Chart.js line chart, period selector (7d, 30d, 90d)                             | todo   |
| S9-19 | Build appointments bar chart | frontend | P1       | 2        | S9-16      | Bar chart: bookings per day for selected period                                             | todo   |
| S9-20 | Build top services table     | frontend | P2       | 2        | S9-16      | Table: service name, booking count, revenue, sorted by popularity                           | todo   |

### Shared

| ID    | Task                      | Type   | Priority | Estimate | Depends On | Acceptance Criteria                                    | Status |
| ----- | ------------------------- | ------ | -------- | -------- | ---------- | ------------------------------------------------------ | ------ |
| S9-21 | Define review types       | shared | P0       | 1        | S0-04      | `Review`, `ReviewWithClient`                           | todo   |
| S9-22 | Define review Zod schemas | shared | P0       | 1        | S0-04      | `createReviewSchema`, `replyReviewSchema`              | todo   |
| S9-23 | Define report types       | shared | P1       | 1        | S0-04      | `DashboardStats`, `RevenueReport`, `AppointmentReport` | todo   |

---

## Sprint 10 — Polish, Testing & Deployment

**Goal:** Production-ready, tested, deployed, documented  
**Duration:** Week 21–22  
**Total Points:** 44

### Quality & Polish

| ID     | Task                                             | Type     | Priority | Estimate | Depends On | Acceptance Criteria                                                       | Status |
| ------ | ------------------------------------------------ | -------- | -------- | -------- | ---------- | ------------------------------------------------------------------------- | ------ |
| S10-01 | Add global error boundary (Next.js)              | frontend | P0       | 2        | —          | Catches unhandled errors, shows friendly error page with retry            | todo   |
| S10-02 | Add skeleton loading states to all list pages    | frontend | P1       | 3        | —          | Clients, services, staff, appointments pages show skeletons while loading | todo   |
| S10-03 | Add empty states to all list pages               | frontend | P1       | 2        | —          | Custom illustration + CTA for each empty page                             | todo   |
| S10-04 | Add toast notifications for all mutations        | frontend | P0       | 2        | —          | Success/error toasts via sonner or radix-toast on create, update, delete  | todo   |
| S10-05 | Responsive audit: fix all pages on mobile/tablet | frontend | P0       | 5        | —          | All dashboard and booking pages usable on 375px–768px widths              | todo   |
| S10-06 | Add meta tags + OG images for public pages       | frontend | P2       | 2        | —          | Title, description, OG image on landing, search, business profile pages   | todo   |
| S10-07 | Build custom 404 and 500 error pages             | frontend | P2       | 1        | —          | Branded error pages with navigation back to home                          | todo   |

### Testing

| ID     | Task                                           | Type | Priority | Estimate | Depends On | Acceptance Criteria                                                            | Status |
| ------ | ---------------------------------------------- | ---- | -------- | -------- | ---------- | ------------------------------------------------------------------------------ | ------ |
| S10-08 | Write API unit tests: auth module              | test | P0       | 3        | S1-05      | Register, login, refresh, guard tests pass                                     | todo   |
| S10-09 | Write API unit tests: availability engine      | test | P0       | 5        | S5-03      | Slot generation, conflict detection, edge cases (day boundaries, buffer times) | todo   |
| S10-10 | Write API unit tests: booking creation         | test | P0       | 3        | S5-08      | Happy path, double-booking prevention, invalid slot                            | todo   |
| S10-11 | Write API unit tests: payment webhook          | test | P1       | 2        | S7-04      | Signature verification, idempotency, status update                             | todo   |
| S10-12 | Write E2E test: full booking flow (Playwright) | test | P0       | 5        | —          | Register → create business → add service → add staff → client books → payment  | todo   |

### Deployment

| ID     | Task                                       | Type  | Priority | Estimate | Depends On     | Acceptance Criteria                                               | Status |
| ------ | ------------------------------------------ | ----- | -------- | -------- | -------------- | ----------------------------------------------------------------- | ------ |
| S10-13 | Provision Neon PostgreSQL (production)     | infra | P0       | 1        | —              | Database created, connection string secured                       | todo   |
| S10-14 | Provision Upstash Redis (production)       | infra | P0       | 1        | —              | Redis instance created, connection string secured                 | todo   |
| S10-15 | Deploy NestJS to Railway                   | infra | P0       | 3        | S10-13, S10-14 | API accessible at production URL, Prisma migrations run on deploy | todo   |
| S10-16 | Deploy Next.js to Vercel                   | infra | P0       | 2        | S10-15         | Web app accessible at production URL, connected to production API | todo   |
| S10-17 | Configure production environment variables | infra | P0       | 1        | S10-15, S10-16 | All env vars set in Railway and Vercel dashboards                 | todo   |
| S10-18 | Configure Stripe live keys                 | infra | P1       | 1        | S10-17         | Live Stripe keys in production, test keys in development          | todo   |
| S10-19 | Configure Resend production domain         | infra | P1       | 1        | S10-17         | Domain verified, production API key set                           | todo   |
| S10-20 | Create and run production seed script      | infra | P1       | 2        | S10-15         | Demo business with services, staff, appointments, reviews seeded  | todo   |

### Documentation

| ID     | Task                                           | Type | Priority | Estimate | Depends On | Acceptance Criteria                                                          | Status |
| ------ | ---------------------------------------------- | ---- | -------- | -------- | ---------- | ---------------------------------------------------------------------------- | ------ |
| S10-21 | Write root README.md                           | docs | P0       | 2        | —          | Project overview, tech stack, setup instructions, screenshots                | todo   |
| S10-22 | Verify Swagger docs completeness               | docs | P1       | 1        | —          | All endpoints have descriptions, request/response schemas, auth requirements | todo   |
| S10-23 | Create demo walkthrough (screenshots or video) | docs | P1       | 2        | S10-16     | Visual walkthrough of key features for portfolio                             | todo   |

---

## Task Summary

| Sprint                       | Tasks   | Points  | Focus                         | Status  |
| ---------------------------- | ------- | ------- | ----------------------------- | ------- |
| 0 — Foundation               | 20      | 34      | Monorepo, DB, dev environment | ✅ done |
| 1 — Authentication           | 25      | 52      | Register, login, JWT, RBAC    | ✅ done |
| 2 — Business Onboarding      | 21      | 46      | Business creation, settings   | ✅ done |
| 3 — Service Management       | 15      | 36      | Service menu CRUD             | ✅ done |
| 4 — Staff Management         | 18      | 42      | Staff profiles, schedules     | todo    |
| 5 — Availability & Booking   | 18      | 47      | Core availability engine      | todo    |
| 6 — Calendar & Booking UI    | 19      | 55      | Calendar + booking flow       | todo    |
| 7 — Payments & Notifications | 20      | 48      | Stripe + email                | todo    |
| 8 — Client CRM               | 16      | 36      | Client management             | todo    |
| 9 — Reviews & Dashboard      | 23      | 48      | Reviews + analytics           | todo    |
| 10 — Polish & Deploy         | 23      | 44      | Testing, deploy, docs         | todo    |
| **Total**                    | **218** | **488** | —                             | —       |

---

## Critical Path

Tasks on the critical path — delays here delay the entire project:

```
S0-02 (NestJS init)
  └► S0-09 (Prisma setup)
       └► S1-01 (User schema)
            └► S1-05 (Register API)
                 └► S1-07 (JWT tokens)
                      └► S1-11 (Auth guard)
                           └► S2-08 (Business context guard)
                                └► S3-02 (Service module)
                                     └► S4-01 (Staff schema)
                                          └► S5-01 (Appointment schema)
                                               └► S5-03 (Availability engine)  ← HIGHEST RISK
                                                    └► S5-08 (Create booking)
                                                         └► S6-14 (Date/time picker)
                                                              └► S7-03 (Stripe checkout)
```

---

## Document History

| Version | Date           | Changes                                                                        |
| ------- | -------------- | ------------------------------------------------------------------------------ |
| 1.0     | March 9, 2026  | Initial task plan                                                              |
| 1.1     | March 9, 2026  | Sprint 0 complete — all 20 tasks marked done, Task Summary status column added |
| 1.2     | March 15, 2026 | Sprint 1 complete — auth backend + frontend, 24 tasks marked done              |
| 1.3     | March 22, 2026 | Sprint 2 complete — business onboarding, 20 tasks marked done                  |
| 1.4     | March 29, 2026 | Sprint 3 complete — service management, 15 tasks marked done                   |
