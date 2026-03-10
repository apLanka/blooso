# Blooso - MVP Planning Document

**Version:** 1.0  
**Date:** March 9, 2026  
**Status:** Active  
**Related:**

- [Project Specification](./blooso_project_specification_document.md)
- [Architecture Document](./blooso_architecture_document.md)

---

## 1. MVP Philosophy

### 1.1 Goal

Ship a working booking platform that demonstrates **end-to-end engineering quality** across 12 core features. Every feature should be production-grade — proper validation, error handling, loading states, and responsive design.

### 1.2 What "Done" Means for Each Feature

- Backend: API endpoint with validation, auth guard, error handling, Swagger docs
- Frontend: Responsive UI, loading/error states, optimistic updates where appropriate
- Shared: Types and Zod schemas in `@repo/shared`
- Tested: At minimum, API endpoint tests for critical paths

### 1.3 What's Excluded from MVP

| Excluded Feature                       | Reason                      | Phase   |
| -------------------------------------- | --------------------------- | ------- |
| Mobile apps (React Native)             | Validate web first          | Phase 2 |
| Marketing campaigns (email/SMS blasts) | Not core loop               | Phase 2 |
| Loyalty programs                       | Nice-to-have                | Phase 2 |
| Inventory management                   | Not core loop               | Phase 2 |
| Multi-location support                 | Complexity                  | Phase 3 |
| Waitlist management                    | Not core loop               | Phase 2 |
| Group bookings / classes               | Not core loop               | Phase 3 |
| Team Pay / payroll                     | Complex, standalone product | Phase 3 |
| Social media integrations              | Not core loop               | Phase 2 |
| Google Calendar sync                   | Integration complexity      | Phase 2 |
| AI features                            | Future                      | Phase 3 |
| White-label / franchise                | Enterprise                  | Phase 3 |

---

## 2. MVP Feature Breakdown

### 2.1 Core Booking Loop (Must Work End-to-End)

```
Business registers → Sets up services → Adds staff → Configures schedule
                                                           │
Client discovers business → Selects service → Picks slot → Books appointment
                                                           │
Business views calendar → Checks in client → Completes → Collects payment
                                                           │
                                              Client receives confirmation
                                              Client leaves review
```

This loop is the **single most important thing**. Every feature in the MVP either directly supports this loop or provides essential supporting infrastructure.

---

## 3. Sprint Plan

**Sprint duration:** 2 weeks  
**Total sprints:** 10 (20 weeks)  
**Working assumption:** Solo developer, part-time to full-time

---

### Sprint 0 — Foundation (Week 1–2)

**Goal:** Monorepo setup, database, dev environment, CI

| #    | Task                     | Details                                                                  |
| ---- | ------------------------ | ------------------------------------------------------------------------ |
| 0.1  | Initialize NestJS app    | `apps/api` — NestJS 11 with Express                                      |
| 0.2  | Configure Next.js app    | Clean `apps/web` — remove Turborepo starter, set up App Router structure |
| 0.3  | Set up `packages/shared` | Types, schemas, constants, utils — configured for both apps              |
| 0.4  | Set up `packages/ui`     | Initialize shadcn/ui, configure Tailwind preset                          |
| 0.5  | Docker Compose           | PostgreSQL 16 + Redis 7 for local development                            |
| 0.6  | Prisma setup             | Initialize Prisma in `apps/api`, connect to local Postgres               |
| 0.7  | Environment config       | t3-env (web), @nestjs/config (api), `.env.example` files                 |
| 0.8  | Turborepo scripts        | `dev`, `build`, `lint`, `test`, `db:migrate`, `db:seed`                  |
| 0.9  | ESLint + Prettier        | Shared config across all packages                                        |
| 0.10 | Git hooks                | Husky + lint-staged for pre-commit checks                                |

**Database tables created:**

- None yet (schema designed but not migrated)

**Deliverable:** Running monorepo — `turbo dev` starts Next.js on :3000 and NestJS on :3001

---

### Sprint 1 — Authentication (Week 3–4)

**Goal:** Users can register, login, and maintain sessions

#### Backend (NestJS)

| #    | Task                                           | Details                                                 |
| ---- | ---------------------------------------------- | ------------------------------------------------------- |
| 1.1  | Prisma schema: users, sessions, refresh_tokens | Migration + seed script                                 |
| 1.2  | Auth module                                    | `AuthController`, `AuthService`                         |
| 1.3  | Register endpoint                              | `POST /v1/auth/register` — email, password, name        |
| 1.4  | Login endpoint                                 | `POST /v1/auth/login` — returns access + refresh tokens |
| 1.5  | Refresh endpoint                               | `POST /v1/auth/refresh` — rotate refresh token          |
| 1.6  | Logout endpoint                                | `POST /v1/auth/logout` — invalidate session             |
| 1.7  | Me endpoint                                    | `GET /v1/auth/me` — return current user                 |
| 1.8  | Auth guard                                     | `JwtAuthGuard` — validates Bearer token                 |
| 1.9  | Roles guard                                    | `RolesGuard` — checks user role                         |
| 1.10 | Password hashing                               | bcrypt, minimum 10 rounds                               |
| 1.11 | Swagger setup                                  | `@nestjs/swagger` configured, auth endpoints documented |

#### Frontend (Next.js)

| #    | Task                  | Details                                                    |
| ---- | --------------------- | ---------------------------------------------------------- |
| 1.12 | API client utility    | `lib/api-client.ts` — fetch wrapper with auth header       |
| 1.13 | Auth context/provider | Session state, token refresh logic                         |
| 1.14 | Register page         | `/register` — form with validation (React Hook Form + Zod) |
| 1.15 | Login page            | `/login` — email + password form                           |
| 1.16 | Auth middleware       | Next.js middleware — redirect unauthenticated users        |
| 1.17 | Layout: auth pages    | Clean centered layout for auth forms                       |

#### Shared

| #    | Task            | Details                                        |
| ---- | --------------- | ---------------------------------------------- |
| 1.18 | `UserRole` enum | `client`, `staff`, `manager`, `owner`, `admin` |
| 1.19 | Auth schemas    | `registerSchema`, `loginSchema` (Zod)          |
| 1.20 | User types      | `User`, `Session`, `AuthResponse` interfaces   |

**Deliverable:** Full register → login → authenticated dashboard redirect flow

---

### Sprint 2 — Business Onboarding (Week 5–6)

**Goal:** Business owners can create and configure their business

#### Backend

| #    | Task                                                 | Details                                                       |
| ---- | ---------------------------------------------------- | ------------------------------------------------------------- |
| 2.1  | Prisma schema: businesses, locations, business_hours | Migration                                                     |
| 2.2  | Business module                                      | `BusinessController`, `BusinessService`, `BusinessRepository` |
| 2.3  | Create business                                      | `POST /v1/businesses` — name, category, auto-generate slug    |
| 2.4  | Get business                                         | `GET /v1/businesses/:id`                                      |
| 2.5  | Update business                                      | `PATCH /v1/businesses/:id` — settings, description, logo      |
| 2.6  | Public profile                                       | `GET /v1/businesses/slug/:slug` — no auth required            |
| 2.7  | Location CRUD                                        | `POST/PATCH /v1/businesses/:id/locations`                     |
| 2.8  | Business hours                                       | `PUT /v1/businesses/:id/locations/:locId/hours`               |
| 2.9  | Slug uniqueness                                      | Auto-generate from name, handle conflicts                     |
| 2.10 | Business context guard                               | Verify user belongs to business on scoped routes              |

#### Frontend

| #    | Task                   | Details                                           |
| ---- | ---------------------- | ------------------------------------------------- |
| 2.11 | Onboarding wizard      | Multi-step form: business info → location → hours |
| 2.12 | Dashboard layout       | Sidebar navigation, header with user menu         |
| 2.13 | Business settings page | Edit business info, logo upload, hours            |
| 2.14 | File upload            | Uploadthing integration for logo/images           |

#### Shared

| #    | Task               | Details                                        |
| ---- | ------------------ | ---------------------------------------------- |
| 2.15 | Business types     | `Business`, `Location`, `BusinessHours`        |
| 2.16 | Business schemas   | `createBusinessSchema`, `updateBusinessSchema` |
| 2.17 | Category constants | `BUSINESS_CATEGORIES` list                     |

**Deliverable:** Register → create business → configure hours → see dashboard

---

### Sprint 3 — Service Management (Week 7–8)

**Goal:** Businesses can create and manage their service menu

#### Backend

| #   | Task                                        | Details                                                       |
| --- | ------------------------------------------- | ------------------------------------------------------------- |
| 3.1 | Prisma schema: service_categories, services | Migration                                                     |
| 3.2 | Service module                              | Controller, Service, Repository                               |
| 3.3 | Category CRUD                               | `POST/GET/PATCH/DELETE /v1/businesses/:id/service-categories` |
| 3.4 | Service CRUD                                | `POST/GET/PATCH/DELETE /v1/businesses/:id/services`           |
| 3.5 | Reorder categories                          | `PATCH /v1/businesses/:id/service-categories/reorder`         |
| 3.6 | Service activation                          | Toggle `is_active`                                            |
| 3.7 | Public service list                         | `GET /v1/businesses/slug/:slug/services` — for booking page   |

#### Frontend

| #    | Task                    | Details                                          |
| ---- | ----------------------- | ------------------------------------------------ |
| 3.8  | Service categories page | List, add, edit, reorder (drag-and-drop)         |
| 3.9  | Service form            | Name, description, duration, price, buffer times |
| 3.10 | Service list            | Grouped by category, toggle active/inactive      |
| 3.11 | Service detail modal    | View/edit service details                        |

#### Shared

| #    | Task            | Details                                      |
| ---- | --------------- | -------------------------------------------- |
| 3.12 | Service types   | `Service`, `ServiceCategory`                 |
| 3.13 | Service schemas | `createServiceSchema`, `updateServiceSchema` |

**Deliverable:** Business can create categories and services with pricing/duration

---

### Sprint 4 — Staff Management (Week 9–10)

**Goal:** Businesses can add staff, assign services, and set schedules

#### Backend

| #   | Task                                                          | Details                                                              |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| 4.1 | Prisma schema: staff_members, staff_schedules, staff_services | Migration                                                            |
| 4.2 | Staff module                                                  | Controller, Service, Repository                                      |
| 4.3 | Add staff member                                              | `POST /v1/businesses/:id/staff` — creates user + staff record        |
| 4.4 | Staff CRUD                                                    | `GET/PATCH/DELETE /v1/businesses/:id/staff`                          |
| 4.5 | Assign services                                               | `PUT /v1/businesses/:id/staff/:staffId/services`                     |
| 4.6 | Set schedule                                                  | `PUT /v1/businesses/:id/staff/:staffId/schedule` — weekly hours      |
| 4.7 | Staff profile                                                 | `GET /v1/businesses/:id/staff/:staffId` — with services and schedule |

#### Frontend

| #    | Task               | Details                                            |
| ---- | ------------------ | -------------------------------------------------- |
| 4.8  | Staff list page    | All staff with role badges, service count          |
| 4.9  | Add staff form     | Name, email, role, commission rate                 |
| 4.10 | Staff detail page  | Profile, assigned services, weekly schedule editor |
| 4.11 | Schedule editor    | Visual weekly grid — set start/end times per day   |
| 4.12 | Service assignment | Checkbox list of available services                |

#### Shared

| #    | Task          | Details                                     |
| ---- | ------------- | ------------------------------------------- |
| 4.13 | Staff types   | `StaffMember`, `StaffSchedule`, `StaffRole` |
| 4.14 | Staff schemas | `createStaffSchema`, `updateScheduleSchema` |

**Deliverable:** Business can add staff, assign services, configure weekly schedules

---

### Sprint 5 — Availability Engine & Booking API (Week 11–12)

**Goal:** Build the core availability calculation and booking creation logic

This is the **most technically complex sprint** — the availability engine is the heart of the platform.

#### Backend

| #    | Task                                                                      | Details                                                                  |
| ---- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 5.1  | Prisma schema: appointments, appointment_services, availability_overrides | Migration                                                                |
| 5.2  | Availability module                                                       | `AvailabilityService` — core engine                                      |
| 5.3  | Get available slots                                                       | `GET /v1/availability?businessId&staffId&serviceId&date`                 |
| 5.4  | Slot calculation logic                                                    | Consider: staff schedule, existing appointments, buffer times, overrides |
| 5.5  | Booking module                                                            | `BookingController`, `BookingService`                                    |
| 5.6  | Create booking                                                            | `POST /v1/bookings` — validate availability, create appointment          |
| 5.7  | Optimistic locking                                                        | Prevent double-booking of same slot                                      |
| 5.8  | Appointment CRUD                                                          | `GET/PATCH /v1/businesses/:id/appointments`                              |
| 5.9  | Cancel appointment                                                        | `POST /v1/businesses/:id/appointments/:id/cancel`                        |
| 5.10 | Availability overrides                                                    | `POST /v1/businesses/:id/staff/:id/overrides` — time off, special hours  |

**Availability Algorithm (Pseudocode):**

```
getAvailableSlots(staffId, serviceId, date):
  1. Get staff schedule for day_of_week
  2. Get availability overrides for date
  3. Generate all possible slots (based on service duration + buffer)
  4. Get existing appointments for staff on date
  5. Remove conflicting slots
  6. Return available slots
```

#### Shared

| #    | Task               | Details                                        |
| ---- | ------------------ | ---------------------------------------------- |
| 5.11 | Appointment types  | `Appointment`, `AppointmentStatus`, `TimeSlot` |
| 5.12 | Booking schemas    | `createBookingSchema`, `cancelBookingSchema`   |
| 5.13 | Availability types | `AvailableSlot`, `AvailabilityQuery`           |

**Deliverable:** API returns available time slots and can create/cancel bookings with conflict prevention

---

### Sprint 6 — Calendar & Client Booking Flow (Week 13–14)

**Goal:** Business calendar view + client-facing booking page

#### Frontend — Business Calendar

| #   | Task                     | Details                                            |
| --- | ------------------------ | -------------------------------------------------- |
| 6.1 | Calendar page            | Day/week view with time grid                       |
| 6.2 | Appointment display      | Color-coded by status, shows client + service      |
| 6.3 | Create appointment       | Click time slot → form → save                      |
| 6.4 | Drag-and-drop reschedule | Move appointment to new slot                       |
| 6.5 | Appointment detail       | Click → side panel with full details               |
| 6.6 | Status updates           | Mark as confirmed, in-progress, completed, no-show |
| 6.7 | Staff filter             | View calendar for specific staff or all staff      |
| 6.8 | Date navigation          | Previous/next day/week, date picker                |

#### Frontend — Client Booking Flow

| #    | Task                 | Details                                                   |
| ---- | -------------------- | --------------------------------------------------------- |
| 6.9  | Business public page | `/b/[slug]` — profile, services, reviews                  |
| 6.10 | Service selection    | Choose service(s) from categorized list                   |
| 6.11 | Staff selection      | Optional — choose preferred staff or "any available"      |
| 6.12 | Date/time picker     | Show available slots for selected service + staff         |
| 6.13 | Booking confirmation | Summary page before confirming                            |
| 6.14 | Guest or login       | Allow booking as guest (email + name) or logged-in client |
| 6.15 | Confirmation page    | Booking confirmed — details + add to calendar link        |

#### Frontend — Search/Discovery

| #    | Task           | Details                                               |
| ---- | -------------- | ----------------------------------------------------- |
| 6.16 | Search page    | `/search` — search by service type, name, or location |
| 6.17 | Search results | Business cards with rating, price range, distance     |
| 6.18 | Filters        | Category, price range, rating, availability           |

**Deliverable:** Full booking loop — client finds business, books appointment, business sees it on calendar

---

### Sprint 7 — Payments & Notifications (Week 15–16)

**Goal:** Stripe payment processing + email notifications

#### Backend — Payments

| #   | Task                              | Details                                                                 |
| --- | --------------------------------- | ----------------------------------------------------------------------- |
| 7.1 | Prisma schema: payments, invoices | Migration                                                               |
| 7.2 | Payment module                    | Controller, Service                                                     |
| 7.3 | Stripe integration                | Initialize Stripe SDK, configure API keys                               |
| 7.4 | Create checkout session           | `POST /v1/payments/checkout` — for appointment deposits                 |
| 7.5 | Webhook handler                   | `POST /v1/payments/webhook` — handle `checkout.session.completed`       |
| 7.6 | Payment recording                 | Save payment record on successful charge                                |
| 7.7 | Appointment checkout              | `POST /v1/businesses/:id/appointments/:id/checkout` — in-person payment |

#### Backend — Notifications

| #    | Task                 | Details                                                   |
| ---- | -------------------- | --------------------------------------------------------- |
| 7.8  | Notification module  | Service + BullMQ queue setup                              |
| 7.9  | Email templates      | React Email: booking confirmation, reminder, cancellation |
| 7.10 | Send confirmation    | Trigger on booking creation                               |
| 7.11 | Send reminder        | BullMQ delayed job — 24h and 1h before appointment        |
| 7.12 | Send cancellation    | Trigger on booking cancellation                           |
| 7.13 | Redis + BullMQ setup | Connect to Redis, configure queues and workers            |

#### Frontend

| #    | Task                      | Details                                                      |
| ---- | ------------------------- | ------------------------------------------------------------ |
| 7.14 | Stripe checkout redirect  | Redirect to Stripe Checkout, handle success/cancel callbacks |
| 7.15 | Payment confirmation page | After successful payment                                     |
| 7.16 | In-person checkout        | Dashboard: mark appointment as paid (cash/card)              |
| 7.17 | Payment history           | List of payments on appointment detail                       |

**Deliverable:** Clients can pay via Stripe, businesses can record in-person payments, automated emails sent

---

### Sprint 8 — Client CRM (Week 17–18)

**Goal:** Businesses can manage client profiles, notes, and history

#### Backend

| #   | Task                                              | Details                                                       |
| --- | ------------------------------------------------- | ------------------------------------------------------------- |
| 8.1 | Prisma schema: clients, client_notes, client_tags | Migration                                                     |
| 8.2 | Client module                                     | Controller, Service, Repository                               |
| 8.3 | Client CRUD                                       | `POST/GET/PATCH /v1/businesses/:id/clients`                   |
| 8.4 | Client notes                                      | `POST/GET/DELETE /v1/businesses/:id/clients/:id/notes`        |
| 8.5 | Client tags                                       | `POST/DELETE /v1/businesses/:id/clients/:id/tags`             |
| 8.6 | Client search                                     | `GET /v1/businesses/:id/clients?search=` — name, email, phone |
| 8.7 | Auto-create client                                | On first booking, create client record if not exists          |
| 8.8 | Client appointment history                        | `GET /v1/businesses/:id/clients/:id/appointments`             |

#### Frontend

| #    | Task                 | Details                                                     |
| ---- | -------------------- | ----------------------------------------------------------- |
| 8.9  | Clients list page    | Searchable table with name, email, last visit, total visits |
| 8.10 | Client detail page   | Profile info, tags, notes, appointment history              |
| 8.11 | Add/edit client form | Name, email, phone, date of birth, preferences              |
| 8.12 | Notes section        | Add private/shared notes on client profile                  |
| 8.13 | Tag management       | Add/remove tags for segmentation                            |

**Deliverable:** Full client CRM — profiles, notes, tags, appointment history

---

### Sprint 9 — Reviews & Dashboard (Week 19–20)

**Goal:** Review system + business dashboard with KPIs

#### Backend — Reviews

| #   | Task                       | Details                                                           |
| --- | -------------------------- | ----------------------------------------------------------------- |
| 9.1 | Prisma schema: reviews     | Migration                                                         |
| 9.2 | Review module              | Controller, Service                                               |
| 9.3 | Create review              | `POST /v1/reviews` — rating (1-5), comment, linked to appointment |
| 9.4 | List reviews               | `GET /v1/reviews?businessId` — paginated, sorted by date          |
| 9.5 | Business reply             | `PATCH /v1/reviews/:id/reply` — owner can reply                   |
| 9.6 | Review request email       | BullMQ job — send 2h after appointment completion                 |
| 9.7 | Average rating calculation | Stored on business record, updated on new review                  |

#### Backend — Reports

| #    | Task              | Details                                                     |
| ---- | ----------------- | ----------------------------------------------------------- |
| 9.8  | Report module     | Controller, Service                                         |
| 9.9  | Dashboard stats   | `GET /v1/businesses/:id/reports/dashboard`                  |
| 9.10 | Revenue report    | `GET /v1/businesses/:id/reports/revenue?period=`            |
| 9.11 | Appointment stats | `GET /v1/businesses/:id/reports/appointments?period=`       |
| 9.12 | Client stats      | `GET /v1/businesses/:id/reports/clients` — new vs returning |

#### Frontend — Reviews

| #    | Task                          | Details                                  |
| ---- | ----------------------------- | ---------------------------------------- |
| 9.13 | Reviews on public profile     | Star ratings, comments, business replies |
| 9.14 | Review submission page        | Post-appointment review form             |
| 9.15 | Review management (dashboard) | List reviews, reply to reviews           |

#### Frontend — Dashboard

| #    | Task                | Details                                                      |
| ---- | ------------------- | ------------------------------------------------------------ |
| 9.16 | Dashboard home page | Today's appointments, recent bookings, quick actions         |
| 9.17 | KPI cards           | Today's revenue, bookings count, new clients, average rating |
| 9.18 | Revenue chart       | Line chart — daily/weekly/monthly revenue                    |
| 9.19 | Appointment chart   | Bar chart — bookings per day                                 |
| 9.20 | Top services        | Table — most booked services                                 |
| 9.21 | Recent reviews      | Latest reviews with ratings                                  |

**Deliverable:** Clients can leave reviews, businesses see dashboard with real metrics

---

### Sprint 10 — Polish, Testing & Deploy (Week 21–22)

**Goal:** Production-ready — error handling, testing, deployment, documentation

#### Quality & Polish

| #    | Task                | Details                                                         |
| ---- | ------------------- | --------------------------------------------------------------- |
| 10.1 | Error boundaries    | Global error boundary + per-page error handling                 |
| 10.2 | Loading states      | Skeleton loaders on all data-fetching pages                     |
| 10.3 | Empty states        | Meaningful empty states for lists (clients, appointments, etc.) |
| 10.4 | Toast notifications | Success/error toasts for all mutations                          |
| 10.5 | Responsive design   | Test and fix all pages on mobile/tablet                         |
| 10.6 | Dark mode           | Optional — Tailwind dark mode support                           |
| 10.7 | SEO                 | Meta tags, OG images for public pages                           |
| 10.8 | 404/500 pages       | Custom error pages                                              |

#### Testing

| #     | Task                   | Details                                                     |
| ----- | ---------------------- | ----------------------------------------------------------- |
| 10.9  | API unit tests (Jest)  | Auth, booking, availability, payment modules                |
| 10.10 | E2E tests (Playwright) | Register → create business → add service → book appointment |
| 10.11 | API integration tests  | Full booking flow against test database                     |

#### Deployment

| #     | Task                      | Details                                             |
| ----- | ------------------------- | --------------------------------------------------- |
| 10.12 | Provision Neon PostgreSQL | Production database                                 |
| 10.13 | Provision Upstash Redis   | Production cache + queues                           |
| 10.14 | Deploy NestJS to Railway  | With Prisma migrations in deploy step               |
| 10.15 | Deploy Next.js to Vercel  | Connected to monorepo                               |
| 10.16 | Configure Stripe (live)   | Switch to live keys                                 |
| 10.17 | Configure Resend (live)   | Verify domain, switch to live keys                  |
| 10.18 | Environment variables     | Set all production env vars                         |
| 10.19 | Seed demo data            | Demo business with services, staff, sample bookings |

#### Documentation

| #     | Task                   | Details                                               |
| ----- | ---------------------- | ----------------------------------------------------- |
| 10.20 | README.md              | Setup instructions, tech stack, architecture overview |
| 10.21 | Swagger docs           | Verify all endpoints are documented                   |
| 10.22 | Demo video/screenshots | For portfolio presentation                            |

**Deliverable:** Deployed, tested, documented application ready for portfolio

---

## 4. Database Migration Plan

Migrations are created incrementally per sprint:

| Sprint | Migration      | Tables Added                                               |
| ------ | -------------- | ---------------------------------------------------------- |
| 1      | `001_auth`     | users, sessions, refresh_tokens                            |
| 2      | `002_business` | businesses, locations, business_hours                      |
| 3      | `003_services` | service_categories, services                               |
| 4      | `004_staff`    | staff_members, staff_schedules, staff_services             |
| 5      | `005_bookings` | appointments, appointment_services, availability_overrides |
| 7      | `006_payments` | payments, invoices                                         |
| 8      | `007_clients`  | clients, client_notes, client_tags                         |
| 9      | `008_reviews`  | reviews                                                    |

**Total:** ~20 tables across 8 migrations

---

## 5. Seed Data Plan

For development and demo purposes:

| Entity       | Seed Data                                              |
| ------------ | ------------------------------------------------------ |
| Users        | 1 owner, 2 staff, 3 clients                            |
| Business     | "Luxe Beauty Studio" — full profile with logo          |
| Location     | 1 location with full address and business hours        |
| Services     | 3 categories, 10 services (Hair, Nails, Skin)          |
| Staff        | 3 staff members with schedules and service assignments |
| Appointments | 20 appointments across past week and next week         |
| Clients      | 5 client profiles with notes and tags                  |
| Reviews      | 8 reviews with ratings and replies                     |
| Payments     | Payment records for completed appointments             |

---

## 6. Risk Register

| Risk                                        | Impact | Likelihood | Mitigation                                                         |
| ------------------------------------------- | ------ | ---------- | ------------------------------------------------------------------ |
| Availability engine bugs (double bookings)  | High   | Medium     | Optimistic locking, thorough testing, edge case coverage           |
| Stripe webhook reliability                  | High   | Low        | Idempotency keys, retry logic, webhook signature verification      |
| Calendar performance with many appointments | Medium | Medium     | Pagination, date-range queries, proper indexing                    |
| Auth token management complexity            | Medium | Medium     | Short-lived access tokens, httpOnly cookies, refresh rotation      |
| Scope creep beyond MVP                      | High   | High       | Strict adherence to this document, no new features until Sprint 10 |
| File upload issues (size, format)           | Low    | Medium     | Client-side validation, server-side limits, image compression      |

---

## 7. Definition of Done

A feature is "done" when:

- [ ] Backend endpoint works correctly (tested via Swagger)
- [ ] Frontend UI is functional and responsive
- [ ] Validation works on both client and server
- [ ] Error states are handled gracefully
- [ ] Loading states are implemented
- [ ] TypeScript has zero type errors
- [ ] ESLint passes with no warnings
- [ ] Swagger documentation is updated
- [ ] Shared types/schemas are in `@repo/shared`

---

## 8. Sprint Summary

| Sprint | Focus                      | Key Deliverable                               |
| ------ | -------------------------- | --------------------------------------------- |
| 0      | Foundation                 | Monorepo running, DB connected                |
| 1      | Authentication             | Register, login, JWT, roles                   |
| 2      | Business Onboarding        | Create business, location, hours              |
| 3      | Service Management         | Service menu with categories                  |
| 4      | Staff Management           | Staff profiles, schedules, service assignment |
| 5      | Availability & Booking API | Slot calculation, booking creation            |
| 6      | Calendar & Booking UI      | Business calendar + client booking flow       |
| 7      | Payments & Notifications   | Stripe checkout, email notifications          |
| 8      | Client CRM                 | Client profiles, notes, history               |
| 9      | Reviews & Dashboard        | Reviews, ratings, KPI dashboard               |
| 10     | Polish & Deploy            | Testing, deployment, documentation            |

**Total estimated timeline:** 20–22 weeks (5–5.5 months)

---

## 9. Post-MVP Roadmap (Phase 2)

After MVP is live and portfolio-ready, consider adding:

1. **Real-time calendar updates** — WebSocket gateway for live appointment changes
2. **Google Calendar sync** — Two-way sync via Google Calendar API
3. **SMS notifications** — Twilio integration for appointment reminders
4. **Marketing campaigns** — Email blast builder for client segments
5. **Loyalty programs** — Points-based rewards system
6. **Inventory management** — Product catalog and stock tracking
7. **Advanced analytics** — Staff performance, client lifetime value
8. **Mobile app** — React Native client app
9. **Waitlist management** — Auto-notify on cancellations
10. **Multi-location** — Support businesses with multiple locations

---

## 10. Document History

| Version | Date          | Changes                       |
| ------- | ------------- | ----------------------------- |
| 1.0     | March 9, 2026 | Initial MVP planning document |
