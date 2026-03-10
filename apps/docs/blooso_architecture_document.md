# Blooso - Technical Architecture Document

**Version:** 1.0  
**Date:** March 9, 2026  
**Status:** Reference Architecture  
**Related:** [Project Specification Document](./blooso_project_specification_document.md)

---

## 1. Overview

### 1.1 Purpose

This document defines the technical architecture for Blooso — a premium booking platform for beauty and wellness businesses. It serves as the single source of truth for system design, technology choices, and implementation patterns.

### 1.2 Architecture Principles

- **Separation of Concerns:** Frontend (Next.js) and Backend (NestJS) are decoupled; communication via REST API
- **Type Safety:** End-to-end TypeScript with shared types and validation schemas
- **Multi-Tenancy:** Row-level isolation using `business_id` on tenant-scoped tables
- **Scalability:** Stateless API design; horizontal scaling via multiple NestJS instances
- **Security:** JWT-based auth, RBAC, input validation, and PCI compliance for payments

### 1.3 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                        │
│   Web Browser (Next.js)              Future: Mobile App (React Native)   │
└─────────────────────┬───────────────────────────────┬────────────────────┘
                      │                               │
                      │ HTTP / WebSocket              │ REST API
                      ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     APPLICATIONS (Monorepo)                               │
│                                                                          │
│  ┌─────────────────────┐              ┌─────────────────────┐          │
│  │     apps/web        │              │     apps/api          │          │
│  │     (Next.js 15)    │◄────────────►│     (NestJS 11)       │          │
│  │                     │   REST API   │                     │          │
│  │  • App Router       │              │  • REST Controllers   │          │
│  │  • Server Components│              │  • Services           │          │
│  │  • Server Actions   │              │  • WebSocket Gateway  │          │
│  │  • TanStack Query   │              │  • BullMQ Workers    │          │
│  └─────────────────────┘              └──────────┬────────────┘          │
│            │                                    │                        │
│            │                                    │                        │
│  ┌─────────┴─────────┐              ┌───────────┴───────────┐            │
│  │  packages/ui      │              │  packages/shared      │            │
│  │  packages/shared  │              │  (types, schemas)     │            │
│  └───────────────────┘              └───────────┬───────────┘            │
└─────────────────────────────────────────────────┼────────────────────────┘
                                                  │
                      ┌───────────────────────────┼───────────────────────────┐
                      │                           │                           │
                      ▼                           ▼                           ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │     Redis        │  │   Stripe         │  │   Resend        │
│   (Neon)        │  │   (Upstash)      │  │   (Payments)     │  │   (Email)       │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 2. Monorepo Structure

### 2.1 Directory Layout

```
blooso/
├── apps/
│   ├── web/                          # Next.js 15 - Frontend Application
│   │   ├── app/
│   │   │   ├── (auth)/               # Auth pages: login, register, forgot-password
│   │   │   ├── (marketing)/          # Landing, pricing, about, contact
│   │   │   ├── (dashboard)/          # Business dashboard (protected)
│   │   │   │   ├── calendar/
│   │   │   │   ├── clients/
│   │   │   │   ├── services/
│   │   │   │   ├── staff/
│   │   │   │   ├── settings/
│   │   │   │   └── reports/
│   │   │   ├── (booking)/            # Client-facing booking flow
│   │   │   │   ├── [businessSlug]/
│   │   │   │   └── search/
│   │   │   └── (client)/             # Client dashboard
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   │
│   ├── api/                          # NestJS 11 - Backend API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── business/
│   │   │   │   ├── booking/
│   │   │   │   ├── client/
│   │   │   │   ├── service/
│   │   │   │   ├── staff/
│   │   │   │   ├── payment/
│   │   │   │   ├── review/
│   │   │   │   ├── notification/
│   │   │   │   └── report/
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── filters/
│   │   │   │   └── pipes/
│   │   │   ├── config/
│   │   │   ├── database/
│   │   │   │   ├── migrations/
│   │   │   │   └── seeds/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── test/
│   │
│   └── docs/                         # Documentation
│       ├── blooso_project_specification_document.md
│       └── blooso_architecture_document.md
│
├── packages/
│   ├── ui/                           # Shared design system (shadcn/ui + custom)
│   ├── shared/                       # Shared types, schemas, constants, utils
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── schemas/
│   │   │   ├── constants/
│   │   │   └── utils/
│   │   └── package.json
│   ├── eslint-config/
│   └── typescript-config/
│
├── tooling/
│   └── tailwind/                     # Shared Tailwind preset
│
├── docker-compose.yml                # Local dev: Postgres + Redis
├── turbo.json
└── package.json
```

### 2.2 Package Dependencies

| Package           | Depends On                 | Purpose                       |
| ----------------- | -------------------------- | ----------------------------- |
| `apps/web`        | `@repo/ui`, `@repo/shared` | Frontend application          |
| `apps/api`        | `@repo/shared`             | Backend API                   |
| `packages/ui`     | `@repo/shared` (optional)  | Reusable UI components        |
| `packages/shared` | —                          | Types, Zod schemas, constants |

---

## 3. Technology Stack

### 3.1 Frontend (apps/web)

| Category       | Technology              | Version | Purpose                               |
| -------------- | ----------------------- | ------- | ------------------------------------- |
| Framework      | Next.js                 | 15+     | App Router, RSC, Server Actions       |
| Styling        | Tailwind CSS            | 4.x     | Utility-first CSS                     |
| Components     | shadcn/ui               | Latest  | Design system components              |
| State (Client) | Zustand                 | 5.x     | Global client state                   |
| State (Server) | TanStack Query          | 5.x     | API data fetching, caching            |
| Forms          | React Hook Form         | 7.x     | Form state management                 |
| Validation     | Zod                     | 3.x     | Schema validation (from @repo/shared) |
| Auth           | Custom (JWT in cookies) | —       | Session management                    |

### 3.2 Backend (apps/api)

| Category   | Technology            | Version | Purpose                     |
| ---------- | --------------------- | ------- | --------------------------- |
| Framework  | NestJS                | 11.x    | API server, DI, modules     |
| ORM        | Prisma                | 6.x     | Database access, migrations |
| Validation | class-validator       | 0.14+   | DTO validation              |
| Auth       | Passport.js + JWT     | —       | Authentication strategy     |
| API Docs   | Swagger (OpenAPI)     | —       | Auto-generated API docs     |
| Jobs       | BullMQ                | —       | Background job processing   |
| Real-time  | Socket.IO / WebSocket | —       | Live updates                |
| Config     | @nestjs/config        | —       | Environment configuration   |

### 3.3 Infrastructure

| Service       | Provider           | Purpose                             |
| ------------- | ------------------ | ----------------------------------- |
| Database      | PostgreSQL (Neon)  | Primary data store                  |
| Cache         | Redis (Upstash)    | Sessions, rate limiting, job queues |
| Payments      | Stripe             | Checkout, subscriptions, Connect    |
| Email         | Resend             | Transactional emails                |
| File Storage  | Uploadthing or S3  | Images, documents                   |
| Hosting (Web) | Vercel             | Next.js deployment                  |
| Hosting (API) | Railway / Render   | NestJS deployment                   |
| Monitoring    | Sentry             | Error tracking                      |
| Analytics     | PostHog (optional) | Product analytics                   |

### 3.4 Development Tools

| Tool       | Purpose                      |
| ---------- | ---------------------------- |
| Turborepo  | Monorepo build orchestration |
| TypeScript | Type safety across stack     |
| ESLint     | Linting                      |
| Prettier   | Code formatting              |
| Vitest     | Unit tests (web)             |
| Jest       | Unit tests (API)             |
| Playwright | E2E tests                    |

---

## 4. Database Architecture

### 4.1 Multi-Tenancy Strategy

**Approach:** Shared database with row-level isolation

- All tenant-scoped tables include `business_id` as a foreign key
- Every query filters by `business_id` (enforced via NestJS guards and service layer)
- No schema-per-tenant or database-per-tenant — simpler operations, lower cost

### 4.2 Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION                                │
├─────────────────────────────────────────────────────────────────┤
│  users              sessions           refresh_tokens             │
│  ─────              ────────           ─────────────             │
│  id (uuid)          id                 id                         │
│  email              user_id (FK)       user_id (FK)               │
│  name               token              token                      │
│  avatar_url         expires_at         expires_at                 │
│  role (enum)        ip_address                                   │
│  created_at         user_agent                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS DOMAIN                              │
├─────────────────────────────────────────────────────────────────┤
│  businesses         locations          business_hours             │
│  ──────────         ─────────         ──────────────             │
│  id                 id                 location_id (FK)           │
│  owner_id (FK)      business_id (FK)   day_of_week                │
│  name               name               open_time                  │
│  slug (unique)      address            close_time                 │
│  description        lat, lng           is_closed                  │
│  logo_url           timezone                                     │
│  category           phone                                         │
│  settings (jsonb)                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     STAFF & SCHEDULES                             │
├─────────────────────────────────────────────────────────────────┤
│  staff_members      staff_schedules   staff_services              │
│  ─────────────      ──────────────    ──────────────             │
│  id                 staff_id (FK)     staff_id (FK)               │
│  user_id (FK)       day_of_week       service_id (FK)             │
│  business_id (FK)   start_time        custom_duration            │
│  role (enum)        end_time          custom_price                │
│  commission_rate    is_available                                  │
│  bio                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     SERVICES                                      │
├─────────────────────────────────────────────────────────────────┤
│  service_categories  services                                     │
│  ─────────────────   ────────                                     │
│  id                  id                                           │
│  business_id (FK)    category_id (FK)                             │
│  name                business_id (FK)                             │
│  sort_order          name                                         │
│                      description                                  │
│                      duration_minutes                             │
│                      price                                        │
│                      buffer_before, buffer_after                  │
│                      is_active                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     BOOKINGS                                      │
├─────────────────────────────────────────────────────────────────┤
│  appointments       appointment_services   availability_overrides │
│  ────────────       ───────────────────    ────────────────────  │
│  id                 appointment_id (FK)     staff_id (FK)         │
│  business_id (FK)   service_id (FK)         date                   │
│  client_id (FK)     staff_id (FK)           start_time             │
│  location_id (FK)   price_charged           end_time               │
│  status (enum)      duration               is_available           │
│  start_time         status                  reason                 │
│  end_time                                                          │
│  total_price                                                       │
│  notes                                                             │
│  source (enum)                                                     │
│  cancellation_reason                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTS (CRM)                                 │
├─────────────────────────────────────────────────────────────────┤
│  clients            client_notes         client_tags              │
│  ───────            ────────────        ───────────             │
│  id                 client_id (FK)       client_id (FK)           │
│  user_id (FK, opt)  staff_id (FK)        tag                      │
│  business_id (FK)   content              business_id (FK)          │
│  first_name         is_private                                    │
│  last_name          created_at                                    │
│  email                                                             │
│  phone                                                             │
│  date_of_birth                                                     │
│  preferences (jsonb)                                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     PAYMENTS & REVIEWS                            │
├─────────────────────────────────────────────────────────────────┤
│  payments           invoices           reviews                    │
│  ────────           ────────           ───────                   │
│  id                 id                 id                         │
│  appointment_id(FK) business_id (FK)   business_id (FK)           │
│  amount             client_id (FK)     client_id (FK)             │
│  method (enum)      total              appointment_id (FK)        │
│  stripe_payment_id  status             rating (1-5)                │
│  status             due_date           comment                    │
│  tip_amount         paid_at            reply                      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Key Enums

| Enum                | Values                                                                     |
| ------------------- | -------------------------------------------------------------------------- |
| `UserRole`          | `client`, `staff`, `manager`, `owner`, `admin`                             |
| `AppointmentStatus` | `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show` |
| `PaymentMethod`     | `card`, `cash`, `transfer`, `other`                                        |
| `BookingSource`     | `web`, `mobile`, `walk_in`, `phone`, `marketplace`                         |

### 4.4 Indexing Strategy

| Table             | Index                       | Purpose                |
| ----------------- | --------------------------- | ---------------------- |
| `appointments`    | `(business_id, start_time)` | Calendar range queries |
| `appointments`    | `(client_id, start_time)`   | Client booking history |
| `appointments`    | `(staff_id, start_time)`    | Staff schedule queries |
| `businesses`      | `(slug)` UNIQUE             | Public profile lookup  |
| `clients`         | `(business_id, email)`      | Client lookup          |
| `staff_schedules` | `(staff_id, day_of_week)`   | Availability checks    |

---

## 5. API Design

### 5.1 API Conventions

- **Base URL:** `https://api.blooso.com/v1` (or `http://localhost:3001/v1` in dev)
- **Format:** JSON request/response
- **Authentication:** Bearer JWT in `Authorization` header
- **Versioning:** URL path (`/v1/`) for future compatibility

### 5.2 REST Endpoint Structure

```
/v1/auth
  POST   /register
  POST   /login
  POST   /logout
  POST   /refresh
  GET    /me

/v1/businesses
  GET    /                    # List (admin) or current user's business
  POST   /                    # Create business
  GET    /:id                 # Get by ID
  PATCH  /:id                 # Update
  GET    /:slug               # Public profile (no auth)

/v1/businesses/:id/locations
  GET    /
  POST   /
  PATCH  /:locationId

/v1/businesses/:id/services
  GET    /
  POST   /
  PATCH  /:serviceId
  DELETE /:serviceId

/v1/businesses/:id/staff
  GET    /
  POST   /
  PATCH  /:staffId
  DELETE /:staffId

/v1/businesses/:id/appointments
  GET    /                    # Query: date, staffId, status
  POST   /                    # Create (internal/walk-in)
  PATCH  /:appointmentId
  POST   /:appointmentId/cancel

/v1/availability
  GET    /                    # Query: businessId, staffId?, serviceId, date
                              # Returns available time slots

/v1/bookings
  POST   /                    # Create (client booking flow)
  GET    /:id                 # Get booking details

/v1/clients
  GET    /                    # List (business context)
  POST   /
  GET    /:id
  PATCH  /:id

/v1/payments
  POST   /checkout            # Create Stripe checkout session
  POST   /webhook             # Stripe webhook (signature verified)

/v1/reviews
  GET    /                    # Query: businessId
  POST   /                    # Create review (post-appointment)
  PATCH  /:id/reply           # Business reply
```

### 5.3 Response Format

**Success:**

```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

**Error:**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

### 5.4 Swagger Documentation

- **URL:** `GET /api/docs` (when API is running)
- **Generated from:** NestJS decorators (`@ApiTags`, `@ApiResponse`, etc.)
- **Includes:** Request/response schemas, auth requirements, example payloads

---

## 6. Authentication & Authorization

### 6.1 Auth Flow

```
1. User submits credentials (email + password) via Next.js login form
2. Next.js forwards to NestJS POST /v1/auth/login
3. NestJS validates credentials, checks user exists
4. NestJS generates:
   - Access token (JWT, 15min expiry)
   - Refresh token (stored in DB, 7 day expiry)
5. Next.js receives tokens, stores in httpOnly cookies
6. All subsequent requests: Next.js middleware attaches Bearer token
7. NestJS AuthGuard validates JWT on protected routes
8. RolesGuard checks user role against route requirements
```

### 6.2 Role-Based Access Control (RBAC)

| Role      | Scope    | Permissions                                                          |
| --------- | -------- | -------------------------------------------------------------------- |
| `client`  | —        | Book appointments, view own bookings, manage profile, submit reviews |
| `staff`   | Business | View own schedule, check-in clients, view assigned appointments      |
| `manager` | Business | All staff + manage staff, services, view reports                     |
| `owner`   | Business | Full control: billing, settings, delete business                     |
| `admin`   | Platform | Cross-business access, platform configuration                        |

### 6.3 Business Context Guard

For business-scoped routes (e.g., `/v1/businesses/:id/appointments`):

1. Extract `businessId` from URL
2. Verify user has access to that business (owner, manager, or staff)
3. Inject `businessId` into request for service layer
4. All queries automatically scoped to `business_id`

---

## 7. Frontend Architecture

### 7.1 Route Groups

| Group         | Path                          | Purpose                        |
| ------------- | ----------------------------- | ------------------------------ |
| `(auth)`      | `/login`, `/register`         | Unauthenticated auth pages     |
| `(marketing)` | `/`, `/pricing`, `/about`     | Public marketing pages         |
| `(dashboard)` | `/calendar`, `/clients`, etc. | Business dashboard (protected) |
| `(booking)`   | `/b/[slug]`, `/search`        | Client booking flow            |
| `(client)`    | `/my-bookings`, `/profile`    | Client dashboard (protected)   |

### 7.2 API Client Pattern

```typescript
// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken(); // From cookie or context

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
}
```

### 7.3 Data Fetching Strategies

| Scenario                        | Approach                                             |
| ------------------------------- | ---------------------------------------------------- |
| Server Component (initial load) | `fetch()` with `apiClient`                           |
| Client Component (interactive)  | TanStack Query `useQuery` / `useMutation`            |
| Form submission                 | TanStack Query `useMutation` or Server Action        |
| Real-time updates               | WebSocket subscription + TanStack Query invalidation |

### 7.4 Shared Package Usage

```typescript
// Import types
import type { Appointment, Business } from '@repo/shared/types';

// Import validation schemas for forms
import { createBookingSchema } from '@repo/shared/schemas';

// Import constants
import { APPOINTMENT_STATUS } from '@repo/shared/constants';
```

---

## 8. Real-Time & Background Jobs

### 8.1 WebSocket Gateway (NestJS)

**Namespace:** `/calendar`

**Events:**

- `calendar:update` — Emitted when appointment is created, updated, or cancelled
- **Room:** `business:{businessId}` — Clients join room when viewing that business's calendar

**Flow:**

1. Business dashboard connects to WebSocket with JWT
2. On connection, client joins `business:{businessId}` room
3. When any user creates/updates/cancels appointment, server emits to room
4. Frontend receives event, invalidates TanStack Query cache, refetches

### 8.2 Background Job Queues (BullMQ)

| Queue               | Jobs                                          | Trigger                   |
| ------------------- | --------------------------------------------- | ------------------------- |
| `booking-reminders` | Send SMS/email 24h and 1h before appointment  | On booking creation       |
| `review-requests`   | Send review request email 2h after completion | On appointment completion |
| `report-generation` | Generate daily/weekly reports                 | Cron (scheduled)          |
| `campaign-sender`   | Send marketing emails/SMS in batches          | On campaign trigger       |

**Redis:** Required for BullMQ; use Upstash Redis in production.

---

## 9. Third-Party Integrations

### 9.1 Stripe

- **Checkout:** Create session for appointment deposit/full payment
- **Webhooks:** `checkout.session.completed`, `payment_intent.succeeded`
- **Connect (future):** For marketplace payouts to businesses

### 9.2 Resend (Email)

- **Templates:** React Email for beautiful HTML templates
- **Use cases:** Booking confirmation, reminders, review requests, password reset

### 9.3 File Storage (Uploadthing or S3)

- **Use cases:** Business logo, service images, staff photos, client consultation forms

---

## 10. Deployment Architecture

### 10.1 Environment Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCTION                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Vercel                    Railway / Render                     │
│  ┌─────────────┐           ┌─────────────┐                      │
│  │ apps/web    │           │ apps/api    │                      │
│  │ Next.js     │ ──HTTP──► │ NestJS      │                      │
│  │             │           │             │                      │
│  └─────────────┘           └──────┬──────┘                      │
│         │                         │                              │
│         │                         │                              │
│         ▼                         ▼                              │
│  ┌─────────────────────────────────────────┐                    │
│  │  Neon PostgreSQL  │  Upstash Redis      │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  External: Stripe, Resend, Uploadthing, Sentry                   │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Environment Variables

**apps/web (.env.local):**

```
NEXT_PUBLIC_API_URL=https://api.blooso.com/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

**apps/api (.env):**

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
UPLOADTHING_TOKEN=...
CORS_ORIGIN=https://blooso.com
```

### 10.3 CI/CD (Recommended)

- **Vercel:** Auto-deploy `apps/web` on push to `main`
- **Railway/Render:** Auto-deploy `apps/api` on push to `main`
- **Migrations:** Run Prisma migrate as part of API deploy step
- **Preview:** Vercel preview deployments for PRs

---

## 11. Security Considerations

| Area         | Measures                                                                          |
| ------------ | --------------------------------------------------------------------------------- |
| **Auth**     | JWT with short expiry; refresh token rotation; httpOnly cookies                   |
| **API**      | Rate limiting (per IP, per user); CORS whitelist                                  |
| **Input**    | Validation on all DTOs; sanitization for user-generated content                   |
| **Payments** | Stripe handles card data; never store raw card numbers; verify webhook signatures |
| **Data**     | Row-level isolation; audit logging for sensitive operations                       |
| **Headers**  | Helmet.js (NestJS); CSP, HSTS, X-Frame-Options                                    |

---

## 12. MVP Feature Scope

For portfolio/initial launch, prioritize:

| #   | Feature                                       | Module       |
| --- | --------------------------------------------- | ------------ |
| 1   | Auth (register, login, JWT, roles)            | auth         |
| 2   | Business onboarding (create, slug, settings)  | business     |
| 3   | Service management (CRUD, categories)         | service      |
| 4   | Staff management + schedules                  | staff        |
| 5   | Appointment calendar (CRUD, drag-drop)        | booking      |
| 6   | Client booking flow (search → book → pay)     | booking      |
| 7   | Stripe checkout + webhooks                    | payment      |
| 8   | Email notifications (confirmation, reminders) | notification |
| 9   | Client CRM (profiles, notes, history)         | client       |
| 10  | Reviews + ratings                             | review       |
| 11  | Dashboard + basic reports                     | report       |
| 12  | Swagger API docs                              | —            |

---

## 13. Document History

| Version | Date          | Changes                       |
| ------- | ------------- | ----------------------------- |
| 1.0     | March 9, 2026 | Initial architecture document |

---

**Next Steps:**

1. Initialize NestJS app in `apps/api`
2. Set up Prisma schema and initial migrations
3. Create `packages/shared` with types and schemas
4. Implement auth module (register, login, JWT)
5. Build business onboarding flow
6. Implement core booking flow
