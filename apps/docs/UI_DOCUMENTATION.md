# Blooso UI Documentation

This document describes the UI architecture, design system, components, and page structure of the Blooso web application.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Design System](#design-system)
3. [Project Structure](#project-structure)
4. [Layouts](#layouts)
5. [Pages & Routes](#pages--routes)
6. [Page-by-Page Documentation](#page-by-page-documentation)
7. [UI Components](#ui-components)
8. [Shared Components](#shared-components)
9. [State & Context](#state--context)
10. [Utilities](#utilities)
11. [Accessibility & Best Practices](#accessibility--best-practices)

---

## Tech Stack

| Technology                         | Purpose                                               |
| ---------------------------------- | ----------------------------------------------------- |
| **Next.js 16**                     | React framework, App Router, server/client components |
| **React 19**                       | UI library                                            |
| **Tailwind CSS 3.4**               | Utility-first styling                                 |
| **shadcn/ui**                      | Component primitives (Base UI)                        |
| **@base-ui/react**                 | Headless UI primitives                                |
| **Lucide React**                   | Icon library                                          |
| **Recharts**                       | Charts (dashboard)                                    |
| **React Hook Form**                | Form state & validation                               |
| **Zod**                            | Schema validation (via `@repo/shared`)                |
| **Sonner**                         | Toast notifications                                   |
| **class-variance-authority (cva)** | Component variants                                    |
| **tailwind-merge**                 | Class merging                                         |

---

## Design System

### Typography

- **Font**: Geist (Google Font) via `next/font/google`
- **CSS variable**: `--font-sans` for font family
- **Base**: `font-sans antialiased` on body

### Color Palette (OKLCH)

Colors are defined as CSS variables in `app/globals.css` and mapped in `tailwind.config.ts`.

| Token                | Light Mode            | Usage                        |
| -------------------- | --------------------- | ---------------------------- |
| `background`         | `oklch(1 0 0)`        | Page background              |
| `foreground`         | `oklch(0.145 0 0)`    | Primary text                 |
| `primary`            | `oklch(0.205 0 0)`    | Buttons, links, accents      |
| `primary-foreground` | `oklch(0.985 0 0)`    | Text on primary              |
| `secondary`          | `oklch(0.97 0 0)`     | Secondary surfaces           |
| `muted`              | `oklch(0.97 0 0)`     | Muted backgrounds            |
| `muted-foreground`   | `oklch(0.556 0 0)`    | Secondary text               |
| `accent`             | `oklch(0.97 0 0)`     | Hover states                 |
| `destructive`        | `oklch(0.58 0.22 27)` | Errors, destructive actions  |
| `border`             | `oklch(0.922 0 0)`    | Borders                      |
| `input`              | `oklch(0.922 0 0)`    | Input borders                |
| `ring`               | `oklch(0.708 0 0)`    | Focus rings                  |
| `card`               | `oklch(1 0 0)`        | Card backgrounds             |
| `popover`            | `oklch(1 0 0)`        | Popover/dropdown backgrounds |

**Dark mode** is supported via `.dark` class with corresponding variable overrides.

### Border Radius

| Token      | Value                       |
| ---------- | --------------------------- |
| `--radius` | `0.625rem`                  |
| `lg`       | `var(--radius)`             |
| `md`       | `calc(var(--radius) - 2px)` |
| `sm`       | `calc(var(--radius) - 4px)` |

### Spacing & Layout

- **Max width**: `max-w-4xl` for search/booking flows, `max-w-2xl` for business profile
- **Padding**: `p-4` / `p-6` for main content
- **Gap**: `gap-4` / `gap-6` for grids and flex layouts

---

## Project Structure

```
apps/web/
├── app/
│   ├── layout.tsx           # Root layout (font, AuthProvider, Toaster)
│   ├── page.tsx             # Home (landing)
│   ├── globals.css          # Tailwind + CSS variables
│   ├── (auth)/              # Auth route group
│   │   ├── layout.tsx       # Centered auth layout
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (booking)/            # Public booking flow
│   │   ├── layout.tsx       # Header with Blooso + Find link
│   │   ├── search/          # Business search
│   │   ├── b/[slug]/        # Business profile + book
│   │   ├── booking/         # Success/cancel pages
│   │   └── review/           # Post-appointment review
│   └── (dashboard)/          # Business owner dashboard
│       ├── layout.tsx       # Sidebar + header
│       ├── dashboard/
│       ├── calendar/
│       ├── clients/
│       ├── services/
│       ├── staff/
│       ├── reviews/
│       ├── settings/
│       └── onboarding/
├── components/
│   ├── ui/                  # Base UI components
│   ├── empty-state.tsx
│   └── skeletons.tsx
├── contexts/
│   └── auth-context.tsx
├── lib/
│   ├── utils.ts
│   ├── api-client.ts
│   ├── auth-client.ts
│   ├── business-client.ts
│   ├── booking-client.ts
│   ├── availability-client.ts
│   ├── payment-client.ts
│   ├── review-client.ts
│   ├── service-client.ts
│   ├── staff-client.ts
│   ├── client-client.ts
│   ├── appointments-client.ts
│   └── report-client.ts
└── tailwind.config.ts
```

---

## Layouts

### Root Layout (`app/layout.tsx`)

- Wraps entire app with `AuthProvider`
- Applies Geist font via `--font-sans`
- Renders `Toaster` (Sonner) for notifications
- Imports `globals.css`

### Auth Layout (`app/(auth)/layout.tsx`)

- Centered, full-height flex
- `min-h-screen`, `bg-muted/30`
- Max width `max-w-md` for forms

### Booking Layout (`app/(booking)/layout.tsx`)

- Header: Blooso logo + "Find a business" link
- `min-h-screen bg-background`
- `max-w-4xl` container for main content

### Dashboard Layout (`app/(dashboard)/layout.tsx`)

- **Desktop**: Sidebar (256px) + main content
- **Mobile**: Hamburger menu, slide-out sidebar overlay
- **Header**: User name, Sign out button
- **Nav items**: Dashboard, Calendar, Clients, Services, Staff, Reviews, Settings
- Auth required; redirects to `/login` if not authenticated

### Search Layout (`app/(booking)/search/layout.tsx`)

- Metadata only: title "Find a Business", description for SEO/OpenGraph
- Renders `children` directly

### Business Layout (`app/(booking)/b/[slug]/layout.tsx`)

- **Server component** – `generateMetadata` fetches business by slug for dynamic title, description, OpenGraph image
- Renders `children` directly

---

## Pages & Routes

| Route                     | Description                                    | Auth     |
| ------------------------- | ---------------------------------------------- | -------- |
| `/`                       | Landing, CTA links                             | Public   |
| `/search`                 | Search businesses by name/category             | Public   |
| `/b/[slug]`               | Business profile (services, location, reviews) | Public   |
| `/b/[slug]/book`          | Multi-step booking flow                        | Public   |
| `/booking/success`        | Post-booking success                           | Public   |
| `/booking/cancel`         | Payment cancelled                              | Public   |
| `/review/[appointmentId]` | Submit review                                  | Public   |
| `/login`                  | Sign in                                        | Public   |
| `/register`               | Sign up                                        | Public   |
| `/dashboard`              | Business overview, KPIs, charts                | Required |
| `/calendar`               | Appointment calendar                           | Required |
| `/clients`                | Client list                                    | Required |
| `/clients/[clientId]`     | Client detail                                  | Required |
| `/services`               | Service management                             | Required |
| `/staff`                  | Staff list                                     | Required |
| `/staff/[staffId]`        | Staff detail                                   | Required |
| `/reviews`                | Reviews management                             | Required |
| `/settings`               | Business settings                              | Required |
| `/onboarding`             | Create first business                          | Required |
| `/500`                    | Server error page                              | Public   |

---

## Page-by-Page Documentation

### Public Pages

#### Home (`app/page.tsx`)

- **Layout**: Centered flex, `min-h-screen`, `gap-6`, `p-8`
- **Elements**: Blooso logo (h1, `text-4xl font-bold`), tagline (`text-muted-foreground`), three CTA links
- **Links**: Find a business (outline), Sign in (primary), Sign up (outline)
- **Components**: `Link`, `Button` (via Link classes)

#### Search (`app/(booking)/search/page.tsx`)

- **Client component** with `Suspense` for `useSearchParams`
- **Search form**: Input with Search icon, category `<select>`, Search button
- **Results**: Grid (`sm:grid-cols-2`) of `BusinessCard` components
- **BusinessCard**: Logo/initial, name, category, city, "Book now" button
- **States**: Loading, empty ("No businesses found"), results with meta (total, page, limit)
- **URL params**: `q`, `category` synced to form and search

#### Business Profile (`app/(booking)/b/[slug]/page.tsx`)

- **Layout**: `app/(booking)/b/[slug]/layout.tsx` – generates metadata from business slug
- **Content**: Logo, name, category, rating (Star icons), description
- **Location card**: Address, business hours by day
- **Services card**: Grouped by category, each with name, duration, price
- **Reviews card**: Star rating, client name, date, comment, business reply
- **CTA**: Full-width "Book now" button
- **Loading**: Centered "Loading..."; 404: "Business not found"

#### Book (`app/(booking)/b/[slug]/book/page.tsx`)

- **Multi-step wizard**: `services` → `staff` → `datetime` → `confirm` → `success`
- **Step 1**: Select services (checkboxes), shows duration + price
- **Step 2**: Select staff or "Any available"
- **Step 3**: Date picker, time slot grid (from availability API)
- **Step 4**: Summary, guest name/email/phone, notes
- **Payment**: Stripe Checkout redirect or in-person
- **Components**: `Button`, `Card`, `Input`, `Label`, `ChevronLeft`/`ChevronRight` for navigation

#### Booking Success (`app/(booking)/booking/success/page.tsx`)

- **URL param**: `session_id` from Stripe redirect
- **States**: Loading, success (green check, "Payment successful"), error (no session_id)
- **Actions**: "Find another business", "Back to home"

#### Booking Cancel (`app/(booking)/booking/cancel/page.tsx`)

- **Content**: "Payment cancelled" message, "No charges have been made"
- **Actions**: "Find a business", "Back to home"

#### Review (`app/(booking)/review/[appointmentId]/page.tsx`)

- **Form**: 1–5 star rating (clickable Star icons), optional comment textarea
- **Submit**: Calls `createReview` API
- **Success state**: Green check, "Thank you for your review!", "Find another business" button

#### Login (`app/(auth)/login/page.tsx`)

- **Form**: Email, password (React Hook Form + Zod)
- **Error**: Red banner for invalid credentials
- **Redirect**: If authenticated → `/dashboard`
- **Link**: "Sign up" to `/register`
- **Components**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Input`, `Label`, `Button`

#### Register (`app/(auth)/register/page.tsx`)

- **Form**: Name, email, password (min 8 chars)
- **Error**: Red banner for registration failure
- **Redirect**: If authenticated → `/dashboard`
- **Link**: "Sign in" to `/login`

### Error & Special Pages

#### Not Found (`app/not-found.tsx`)

- **Layout**: Centered Card, 404 in muted circle
- **Content**: "Page not found", "The page you're looking for doesn't exist or has been moved"
- **Actions**: "Go home" (primary), "Find a business" (outline)
- **Icons**: Home, Search

#### Error (`app/error.tsx`)

- **Client component** – receives `error`, `reset`
- **Layout**: Card with AlertCircle icon (destructive)
- **Content**: Error message or fallback
- **Actions**: "Try again" (calls reset), "Go home"

#### Global Error (`app/global-error.tsx`)

- **Catches root layout errors** – must render own `<html>` and `<body>`
- **Styling**: Inline styles (no Tailwind – layout may be broken)
- **Actions**: "Try again", "Go home"

#### 500 Page (`app/500/page.tsx`)

- **Content**: "Server error", "Something went wrong on our end"
- **Actions**: "Go home", "Refresh" (window.location.reload)

#### Dashboard Error (`app/(dashboard)/error.tsx`)

- **Same pattern as `app/error.tsx`** but "Back to dashboard" instead of "Go home"

#### Dashboard Not Found (`app/(dashboard)/not-found.tsx`)

- **Content**: "This dashboard page doesn't exist or you don't have access"
- **Action**: "Back to dashboard" with LayoutDashboard icon

### Dashboard Pages (Auth Required)

#### Dashboard (`app/(dashboard)/dashboard/page.tsx`)

- **Business selector**: Buttons when user has multiple businesses
- **KPI cards**: Today's revenue, today's bookings, total clients, average rating
- **Charts**: Revenue (7 days) LineChart, Bookings (7 days) BarChart – Recharts
- **Today's schedule**: Up to 5 upcoming appointments with service names, time, staff
- **Top services table**: Service name, bookings count, revenue
- **Empty state**: "Create your business" → `/onboarding`
- **Links**: View calendar, Manage reviews

#### Calendar (`app/(dashboard)/calendar/page.tsx`)

- **Day view**: Time rows (8am–8pm, 15-min slots), staff columns
- **Navigation**: Prev/Next day, Today, Staff filter (Select)
- **Appointments**: Colored blocks by status (pending=amber, confirmed=blue, in_progress=green, completed=slate, cancelled=red)
- **Click empty slot**: "New appointment" modal – staff, services (checkboxes), start time, client search, guest fields, notes
- **Click appointment**: Detail modal – guest, time, services, status, payment (Paid/Unpaid), actions (Confirm, Check-in, Complete, No-show, Checkout, Cancel)
- **In-person checkout modal**: Payment method (card/cash/transfer/other), Record payment
- **Skeleton**: `CalendarSkeleton`

#### Clients (`app/(dashboard)/clients/page.tsx`)

- **Search**: Debounced input (300ms), "Add client" button
- **Add client modal**: First name, last name, email, phone, date of birth
- **Table**: Name (link to detail), email, phone, last visit, visits, tags, chevron
- **Empty state**: "No clients yet" with "Add your first client"
- **Skeleton**: `ClientsListSkeleton`

#### Client Detail (`app/(dashboard)/clients/[clientId]/page.tsx`)

- **Tabs**: Overview, Appointments, Notes, Tags
- **Overview**: Editable profile (name, email, phone, DOB), total visits, last visit
- **Appointments**: List with service, date/time, staff, status, "View" link to calendar
- **Notes**: Add note (content, private checkbox), list with delete
- **Tags**: Add tag input, tag chips with remove

#### Services (`app/(dashboard)/services/page.tsx`)

- **Actions**: Add category, Add service (disabled if no categories)
- **Category form**: Name input, Add, Cancel
- **Service form**: Name, description, category (Select), duration, price, Active (Switch)
- **List**: Categories as Cards, each with services (name, duration, price, Active toggle, Edit, Delete)
- **Empty state**: "No services yet" with "Add your first category"
- **Skeleton**: `ServicesListSkeleton`

#### Staff (`app/(dashboard)/staff/page.tsx`)

- **Add staff form**: Name, email, role (Select), commission %, bio
- **List**: Grid of Cards – name, email, role, service count, chevron to detail
- **Empty state**: "No staff yet" with "Add your first staff member"
- **Skeleton**: `StaffListSkeleton`

#### Staff Detail (`app/(dashboard)/staff/[staffId]/page.tsx`)

- **Tabs**: Profile, Services, Schedule
- **Profile**: Name, role, commission %, bio, Active (Switch)
- **Services**: Checkboxes per category for assigned services
- **Schedule**: Per day (Sun–Sat) – Available checkbox, start/end time inputs

#### Reviews (`app/(dashboard)/reviews/page.tsx`)

- **Filter**: Rating dropdown (All, 5–1 stars)
- **List**: Cards with stars, client name, date, comment, business reply
- **Reply**: Inline form (Input, Send reply, Cancel) when replying
- **Empty state**: "No reviews yet" or "No reviews match the filter"
- **Skeleton**: `ReviewsListSkeleton`

#### Settings (`app/(dashboard)/settings/page.tsx`)

- **Form**: Business name, category (Select), description, logo URL
- **Locations**: Read-only list (name, address, phone)
- **Business selector**: When multiple businesses

#### Onboarding (`app/(dashboard)/onboarding/page.tsx`)

- **Step 1**: Business name, category (Select), description
- **Step 2**: Location name, address, city, country, timezone, phone
- **Step 3**: Business hours per day – Closed checkbox, open/close time inputs
- **Step 4**: "All set!" success, "Go to Dashboard" button

---

## UI Components

### Button (`components/ui/button.tsx`)

Built on `@base-ui/react/button` with `cva` variants.

**Variants**: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`

**Sizes**: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

```tsx
<Button variant="default" size="lg">Book now</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

### Input (`components/ui/input.tsx`)

- Wraps `@base-ui/react/input`
- Styled with `border-input`, `focus-visible:ring-ring`
- Supports `aria-invalid` for validation feedback

### Label (`components/ui/label.tsx`)

- Standard `label` with `text-sm font-medium`
- Used with form inputs

### Card (`components/ui/card.tsx`)

Composed of:

- `Card` – container with `rounded-xl`, `bg-card`
- `CardHeader` – title area
- `CardTitle` – heading
- `CardDescription` – subtitle
- `CardContent` – content area
- `CardFooter` – footer (often for actions)
- `CardAction` – optional action slot

**Sizes**: `default`, `sm`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Welcome back</CardTitle>
    <CardDescription>Sign in to your account</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

### Select (`components/ui/select.tsx`)

Base UI Select primitive with:

- `Select` (root)
- `SelectTrigger`, `SelectValue`
- `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`
- `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`

### Skeleton (`components/ui/skeleton.tsx`)

- `animate-pulse` + `bg-muted` for loading placeholders
- Accepts `className` and standard `div` props

```tsx
<Skeleton className="h-8 w-32" />
```

### Switch (`components/ui/switch.tsx`)

- Wraps `@base-ui/react/switch`
- **Sizes**: `sm`, `default`
- **Props**: `checked`, `onCheckedChange`, `disabled`, `className`
- Styled with `data-checked:bg-primary`, `data-unchecked:bg-input`

```tsx
<Switch checked={isActive} onCheckedChange={(v) => setIsActive(v)} />
```

---

## Shared Components

### EmptyState (`components/empty-state.tsx`)

Props: `icon`, `title`, `description`, `action`, `className`

Used when lists are empty (e.g. no clients, no services).

```tsx
<EmptyState
  icon={<Users className="h-8 w-8" />}
  title="No clients yet"
  description="Add your first client to get started."
  action={<Button>Add client</Button>}
/>
```

### Skeletons (`components/skeletons.tsx`)

Pre-built loading skeletons:

- `ClientsListSkeleton`
- `ServicesListSkeleton`
- `StaffListSkeleton`
- `ReviewsListSkeleton`
- `CalendarSkeleton`

---

## State & Context

### AuthContext (`contexts/auth-context.tsx`)

Provides:

- `user`, `accessToken`, `refreshToken`
- `isLoading`, `isAuthenticated`
- `login(email, password)`
- `register(email, password, name)`
- `logout()`
- `getToken()`

Tokens stored in `localStorage` (`blooso_access_token`, `blooso_refresh_token`). On mount, attempts refresh if token exists.

---

## Utilities

### `cn()` (`lib/utils.ts`)

```ts
import { cn } from '@/lib/utils';
```

Merges class names with `clsx` + `tailwind-merge` to avoid Tailwind conflicts.

```tsx
<div className={cn('base-class', condition && 'conditional', className)} />
```

---

## Accessibility & Best Practices

1. **Focus**: Components use `focus-visible:ring-ring` for keyboard focus
2. **Invalid state**: `aria-invalid` for form validation errors
3. **Disabled**: `disabled:opacity-50 disabled:pointer-events-none`
4. **Labels**: Form inputs use `Label` with `htmlFor`
5. **Toasts**: Sonner for success/error feedback
6. **Responsive**: Mobile-first; sidebar collapses to hamburger on small screens

---

## API Client Usage

All API calls go through `lib/api-client.ts` (base URL, auth headers). Feature-specific clients:

- `auth-client` – login, register, refresh, logout, getMe
- `business-client` – search, getBySlug, CRUD (for dashboard)
- `booking-client` – create booking
- `availability-client` – get slots
- `payment-client` – create checkout session
- `review-client` – list, create
- `service-client`, `staff-client`, `client-client`, `appointments-client`, `report-client` – dashboard

---

## Environment Variables

| Variable              | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | API base URL (e.g. `http://localhost:3001`) |

---

## Component Usage Reference

| Component                                              | Used In                                                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                               | All pages – CTAs, forms, navigation                                                                                                   |
| `Input`                                                | Login, Register, Search, Clients, Services, Staff, Settings, Onboarding, Calendar, Review                                             |
| `Label`                                                | All forms                                                                                                                             |
| `Card` (+ Header, Content, Footer, Title, Description) | Login, Register, Search, Business profile, Booking, Reviews, Dashboard, Clients, Services, Staff, Settings, Onboarding, Error/404/500 |
| `Select`                                               | Search (native), Calendar, Services, Staff, Settings, Onboarding                                                                      |
| `Switch`                                               | Services (active toggle), Staff (active toggle)                                                                                       |
| `Skeleton`                                             | Skeletons (ClientsList, ServicesList, StaffList, ReviewsList, Calendar)                                                               |
| `EmptyState`                                           | Not used directly; inline empty states in Clients, Services, Staff                                                                    |
| `ClientsListSkeleton`                                  | Clients page                                                                                                                          |
| `ServicesListSkeleton`                                 | Services page                                                                                                                         |
| `StaffListSkeleton`                                    | Staff page                                                                                                                            |
| `ReviewsListSkeleton`                                  | Reviews page                                                                                                                          |
| `CalendarSkeleton`                                     | Calendar page                                                                                                                         |

---

## Running the App

```bash
# From monorepo root
npm run dev

# Or from apps/web
cd apps/web && npm run dev
```

Web app runs on `http://localhost:3000` by default.
