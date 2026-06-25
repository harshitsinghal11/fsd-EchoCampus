# Tech Stack
- Framework: Next.js 16 with App Router
- UI: React 19
- Language: TypeScript 5
- Styling: Tailwind CSS 4
- Auth and primary database: Supabase Auth and Supabase Postgres
- Server-side Supabase session support: `@supabase/ssr`
- Realtime anonymous chat: Supabase Realtime Channels (Phase 4)
- Icons: `lucide-react`

# Project Structure
```text
app/
  api/
    auth/
      faculty-status/
    complaints/
    marketplace/
  auth/
    login/
    signup/
  main/
    student/
    faculty/
  privacy/
  terms/
src/
  components/
    announcements/
    complaints/
    marketplace/
    NavBar/
    Footer/
    shared/
  hooks/
  lib/
  types/
  utils/
assets/
  sql/
docs/
public/
```

# System Architecture
- The app uses a hybrid client-heavy Next.js architecture.
- Page rendering and navigation live in the Next.js App Router under `app/`.
- Supabase handles authentication, role data, profiles, announcements, complaints, marketplace records, lost and found records, and the directory (via faculty profiles).
- Supabase Realtime handles the anonymous chat stream.
- Middleware and protected client layouts enforce route access by role.
- Complaint and marketplace writes are routed through Next.js route handlers, while announcements, directory, lost and found, and profile reads/writes mostly use the Supabase browser client directly.

# Frontend Architecture
- Route groups are split into public pages, auth pages, student pages, and faculty pages.
- Shared feature logic lives in reusable client components under `src/components`.
- Layout files wrap student and faculty areas with role-protected navigation and footers.
- Feature pages mostly compose list and form components rather than owning full business logic.
- Local React state with `useState`, `useEffect`, `useCallback`, and `useMemo` manages UI interactions.
- Session-specific client values such as the student anonymous code are read from `sessionStorage`.

# Backend Architecture
- Supabase Postgres is the primary relational backend.
- Supabase RLS policies are the main authorization layer for direct client database access.
- Supabase triggers enforce posting limits and bootstrap public profile data from `auth.users`.
- Next.js route handlers under `app/api` wrap complaint and marketplace server-side operations that require auth-aware validation.
- Supabase Realtime powers the student chat room, sharing the primary authentication state.

# Authentication & Authorization
- Authentication uses Supabase email/password sign-in and sign-up.
- Faculty signup utilizes a dynamic form that passes metadata into Supabase Auth. A backend Postgres trigger handles row creation without RLS obstruction.
- After login or signup, `ensureOwnUserRow` creates or restores the matching `public.users` record and fills faculty mapping data when applicable.
- Students receive a generated `session_code` from `student_profiles` for anonymous identity usage.
- `src/middleware.ts` blocks unauthenticated access to `/main/*` and redirects users away from the wrong role area.
- `src/components/ProtectedRoute.tsx` repeats session and role validation on the client side.
- Authorization inside the database is enforced through RLS policies per table.

# API Design Standards
- APIs are implemented as local Next.js route handlers under `app/api`.
- Endpoints return JSON objects and use standard HTTP status codes such as `200`, `201`, `400`, `401`, `403`, `429`, and `500`.
- Complaint endpoints own server-side aggregation and upvote toggle logic.
- Marketplace endpoints own server-side validation and owner-based sold updates.
- Validation is split across route handlers, database constraints, RLS policies, and triggers.
- API versioning, OpenAPI documentation, pagination contracts, and formal schema generation are not implemented. Project not Supported.

# State Management
- UI state is local to each page or component through React hooks.
- Auth state is read from Supabase session helpers on demand.
- Student anonymous identity is cached in `sessionStorage` as `userSessionCode`.
- No global store such as Redux, Zustand, Context-based app state, or React Query cache is implemented.

# Caching Strategy
Project not Supported. The repository does not implement Redis, SWR, React Query, server-side cache tags, or application-level caching. Data is fetched on demand, and chat uses Supabase Realtime subscriptions instead of a cache layer.

# Security Considerations
- Supabase public key validation rejects accidental service role usage in `supabaseConfig.ts`.
- Middleware and protected routes prevent unauthorized page access.
- RLS policies restrict reads and writes by role and record ownership.
- Marketplace and complaint APIs check the authenticated user before writing data.
- Database constraints validate values such as role, price, phone number format, and unique vote combinations.
- Posting limits are enforced in the database through triggers rather than only in the client.

# Performance Strategy
- Dashboard widgets fetch limited subsets of data instead of full collections.
- SQL indexes are present on the main foreign keys and time-based sort columns.
- Lists are ordered in the database before rendering.
- Directory and lost and found search/filter behavior is handled on the client after fetch.
- Chat reads are capped to the latest 500 ordered messages.
- Pagination, background jobs, image optimization pipelines, and server caching are not implemented.

# Logging & Monitoring
Project not Supported. The codebase currently relies on `console.error`, `console.log`, alerts, and simple inline messages. There is no centralized logging, metrics, tracing, or monitoring integration.

# Deployment Strategy
Project not Supported. The repository does not contain CI/CD workflows, container definitions, infrastructure-as-code, or platform-specific deployment configuration beyond standard Next.js project files and environment variable usage.
