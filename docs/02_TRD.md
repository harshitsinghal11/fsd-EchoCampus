# Technical Requirements Document

## Stack
- Framework: Next.js 16 App Router
- UI runtime: React 19
- Language: TypeScript 5
- Styling: Tailwind CSS 4 with CSS custom-property tokens in `app/globals.css`
- Auth and relational data: Supabase Auth + Supabase Postgres
- Realtime: Supabase Realtime Channels
- Storage: Supabase Storage
- AI: Google Gemini via `@google/generative-ai`
- Client data caching: SWR
- Motion: Framer Motion
- Notifications/PWA: Serwist + Web Push

## Repository Structure
```text
app/
  api/
    chat/
    complaints/
      upvote/
  auth/
    login/
    signup/
  main/
    faculty/
    student/
  privacy/
  terms/
docs/
public/
scripts/
src/
  actions/
  components/
  hooks/
    data/
  lib/
  types/
  utils/
  middleware.ts
```

## Runtime Architecture
- Public pages and route handlers live in `app/`
- Student and faculty route trees are separated under `app/main/student` and `app/main/faculty`
- Request-time auth gating is handled by `src/middleware.ts`
- Render-time role validation is repeated in the student and faculty root layouts
- Feature reads are mostly client-side through SWR hooks backed by Supabase or local API handlers
- Feature writes are mostly handled through Server Actions in `src/actions/*`
- Complaint voting and E.C.H.O streaming responses use route handlers under `app/api/*`

## Frontend Architecture
- Shared UI primitives live in `src/components/ui/*`
- Shared app shell pieces live in `src/components/shared/*`, `src/components/Navbar/*`, and `src/components/footer/*`
- Each feature has a dedicated component area:
  - `announcements/`
  - `complaints/`
  - `marketplace/`
  - `lost-found/`
  - `directory/`
  - `chat/`
- Mobile navigation uses a bottom nav plus an additional "More" sheet for students
- Desktop navigation uses a top bar that opens a slide-out side panel
- Full-page chat hides the footer and expands into a dedicated full-height layout

## Data Access Model
- Announcements: SWR + Supabase client queries, realtime invalidation
- Complaints: SWR + `/api/complaints`, realtime invalidation, `/api/complaints/upvote` for vote toggling
- Marketplace: SWR + Supabase client queries, realtime invalidation, Server Actions for create/delete
- Lost and found: SWR + Supabase client queries, realtime invalidation, Server Actions for create/delete/resolve
- Directory: SWR + Supabase client query over `users` + `faculty_profiles`
- Chat: Supabase client reads + realtime presence/insert subscriptions, Server Action for moderated insert
- Push subscriptions: Server Action persisting browser subscription data to Supabase

## Authentication and Authorization
- Supabase Auth provides email/password authentication
- Signup writes user metadata that is consumed by a Postgres trigger to populate `public.users`
- Faculty signup is validated through the `verifyFacultyCode` server action before `supabase.auth.signUp`
- Students receive a persisted anonymous `session_code` in `student_profiles`
- Middleware protects `/main/*` routes and redirects users away from the wrong role tree
- Layout-level role checks in `app/main/student/layout.tsx` and `app/main/faculty/layout.tsx` enforce the same separation at render time
- Database RLS policies remain the final authorization boundary for reads and writes

## Database Responsibilities
- `public.users` mirrors the canonical auth identity into app-readable profile data
- `student_profiles` stores anonymous student identifiers
- `faculty_profiles` stores faculty metadata shown in the directory and profile pages
- `announcements`, `complaint_box`, `complaint_upvotes`, `marketplace`, `lost_found`, and `chat_messages` power the main user features
- `push_subscriptions` stores browser push endpoints for notification delivery
- `campus_knowledge` is introduced by the vector migration file for E.C.H.O knowledge retrieval
- Triggers enforce posting limits and sync auth-driven user records

## AI Architecture
- `src/actions/aiActions.ts` contains:
  - announcement enhancement
  - complaint enhancement
  - complaint summary generation
  - lost-item image analysis
- Complaint classification is performed asynchronously after the complaint row is inserted
- Chat moderation uses Gemini in `src/actions/chatActions.ts` before writing a message
- `/api/chat` streams assistant responses and combines vector-search context with live database reads

## Storage and Asset Handling
- Lost-and-found uploads go to the `lost_found_images` bucket
- Marketplace uploads go to the `marketplace_images` bucket
- Uploaded image URLs are stored directly on the corresponding rows
- Delete actions attempt to remove orphaned storage files when the owning row is removed

## PWA and Notifications
- Serwist is configured in `next.config.ts` and `app/sw.ts`
- The service worker precaches app assets and handles push display/click behavior
- `NotificationManager` registers the service worker, requests notification permission, subscribes the user, and stores the subscription through a Server Action
- Broadcast notifications are sent through `web-push` using VAPID keys

## Environment Requirements
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `FACULTY_SECRET_CODE`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

## Operational Notes
- `npm run dev` uses the Next.js webpack dev server
- The service worker is disabled in development mode
- Vercel Speed Insights is mounted globally in `app/layout.tsx`
- The repository currently does not include tests, CI, infrastructure-as-code, or deployment workflows
