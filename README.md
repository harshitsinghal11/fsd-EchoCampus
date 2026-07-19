# EchoCampus

## Overview
EchoCampus is a role-based campus utility platform built with Next.js, Supabase, and Gemini. It combines announcements, anonymous student complaints, anonymous global chat, lost and found reporting, a student marketplace, faculty discovery, profile pages, push notifications, and an embedded AI assistant into one authenticated product.

## Current Feature Set
- Role-based authentication with student and faculty-style access separation
- Faculty onboarding gated by a server-validated faculty access code
- Student dashboard with announcement, marketplace, complaint, and lost-and-found widgets
- Faculty dashboard with complaint monitoring, announcement visibility, lost-and-found visibility, and AI complaint insights
- Announcement publishing with optional link attachment and AI rewrite assistance
- Complaint submission with optional anonymity, voting, AI enhancement, background urgency/category classification, and high-urgency push alerts
- Anonymous student global chat with Supabase Realtime presence, optimistic messages, and AI toxicity moderation before insert
- Student-only marketplace with image upload, posting limits, sold-state toggling, and owner deletion
- Lost and found reporting with image upload, AI image-assisted autofill, resolved-state toggling, and owner deletion
- Searchable faculty directory backed by `users` + `faculty_profiles`
- Student and faculty profile pages
- Installable PWA setup via Serwist service worker
- Browser push notification subscription and broadcast delivery
- Embedded E.C.H.O AI widget with streamed responses from vector-search scaffolding plus live Supabase data

## Tech Stack
- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase Auth
- Supabase Postgres
- Supabase Realtime
- Supabase Storage
- SWR
- Framer Motion
- Google Gemini (`@google/generative-ai`)
- Serwist
- Sonner
- Vercel Speed Insights

## Architecture Snapshot
- Public pages live under `app/`
- Protected student routes live under `app/main/student/*`
- Protected faculty routes live under `app/main/faculty/*`
- Most writes go through Next.js Server Actions in `src/actions/*`
- Complaint voting and the E.C.H.O streaming assistant use route handlers in `app/api/*`
- Reads are primarily client-side through SWR hooks in `src/hooks/data/*`
- Route protection is enforced by both Next middleware and server layouts
- Supabase Realtime updates announcements, complaints, marketplace, lost and found, and anonymous chat

## Important Role Model Note
The persisted database role model is currently `student` and `admin`. Faculty users are provisioned as `admin` during signup. Some frontend helpers still accept `faculty` as a legacy-compatible alias, but the active signup flow writes `admin`.

## Project Structure
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
      announcements/
      complaints/
      dashboard/
      directory/
      lost-found/
      profile/
    student/
      announcements/
      chat/
      complaint/
      dashboard/
      directory/
      lost-found/
      marketplace/
      profile/
  privacy/
  terms/
  error.tsx
  not-found.tsx
  sw.ts
docs/
public/
scripts/
src/
  actions/
  components/
  hooks/
  lib/
  types/
  utils/
  middleware.ts
README.md
polish.md
```

## Environment Variables
Create `.env.local` with the values required by the active code paths:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# Optional legacy fallback used by some older code paths/scripts:
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
FACULTY_SECRET_CODE=

NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

## Local Development
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Notes:
- The service worker is disabled in development by `next.config.ts`.
- Push notifications and some service-worker behavior are best validated from a production build.

## Available Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`

## Documentation
- [01_PRD.md](docs/01_PRD.md)
- [02_TRD.md](docs/02_TRD.md)
- [03_AppFlow.md](docs/03_AppFlow.md)
- [04_UI_UX.md](docs/04_UI_UX.md)
- [05_BackendSchema.md](docs/05_BackendSchema.md)
- [06_Auth.md](docs/06_Auth.md)
- [07_VectorMigration.sql](docs/06_VectorMigration.sql)
- [color.md](docs/color.md)
- [text.md](docs/text.md)
- [database.sql](docs/database.sql)

## Current Implementation Notes
- The app is broader than the root metadata description in `app/layout.tsx`; the real feature surface includes complaints, chat, announcements, marketplace, lost and found, directory, push notifications, and AI helpers.
- The E.C.H.O assistant is present in the UI today, but its vector/knowledge tooling should be treated as an evolving area rather than the most mature part of the repo.
- The repository does not currently include automated tests, CI workflows, or deployment automation.

## License
MIT

## Contact
Built by Harshit Singhal.

- [GitHub](https://github.com/harshitsinghal11)
- [LinkedIn](https://linkedin.com/in/harshitsinghal11)
