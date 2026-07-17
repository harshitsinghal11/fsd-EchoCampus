# EchoCampus

## Overview
EchoCampus is a campus web platform that centralizes common student and faculty workflows into one authenticated system. The current implementation focuses on announcements, faculty discovery, anonymous student interaction, complaint submission, lost and found reporting, and a student-only marketplace.

## Key Features
- Role-based authentication with student and faculty/admin route separation
- Client-side auth redirection to prevent login screen loops for active sessions
- Full-screen dynamic UI using 100dvh for optimal mobile viewport fitting
- Faculty announcement publishing and announcement feed
- Student complaint submission with anonymous mode and upvoting
- Student-only marketplace with owner-controlled sold status
- Lost and found posting, browsing, and owner deletion
- AI-Powered Announcement Enhancement using Gemini (transforms quick notes into professional announcements)
- AI-Powered Complaint Intelligence (auto-detects urgency and category, sending campus-wide alerts for HIGH urgency, plus AI Summarization Widget on Faculty Dashboard)
- Smart Image Recognition for Lost & Found (auto-fills title and description via Gemini Vision)
- Unified Expanded View Modals for seamless browsing of lengthy content
- Searchable faculty directory
- Anonymous student chat powered by Supabase Realtime
- Student and faculty profile pages
- Installable Progressive Web App (PWA) functionality
- Native Web Push Notifications (Desktop & Mobile)

## Tech Stack
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase Auth
- Supabase Postgres
- Supabase Realtime
- Google Gemini AI SDK (@google/generative-ai)
- Zod
- Lucide React

## Screenshots (Optional)
No screenshots are included in the repository yet.

## Project Structure
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
README.md
```

## Documentation
- [01_PRD.md](docs/01_PRD.md)
- [02_TRD.md](docs/02_TRD.md)
- [03_AppFlow.md](docs/03_AppFlow.md)
- [04_UI_UX.md](docs/04_UI_UX.md)
- [05_BackendSchema.md](docs/05_BackendSchema.md)
- [06_Auth.md](docs/06_Auth.md)
- [colors.md](docs/new_color.md)

## Getting Started

### Prerequisites
- Node.js 20 or later recommended
- npm
- A Supabase project with the required schema and policies

### Installation
```bash
npm install
```

### Environment Variables
Create a local environment file and configure these values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Faculty Secret Code
FACULTY_SECRET_CODE=

# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

### Running Locally
```bash
npm run dev
```
*Note: To prevent infinite compilation loops, the Service Worker (PWA) is disabled in development mode. If you need to test Push Notifications locally, run `npm run build && npm start` instead.*

Open `http://localhost:3000` in your browser.

## Available Scripts
- `npm run dev` - start the local Next.js development server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript type checking

## Deployment
The repository does not currently include a defined deployment pipeline, CI/CD workflow, or platform-specific deployment configuration.

## Project Status
EchoCampus has reached a stable production-ready phase with all core features fully implemented. 
- **Core Architecture:** Global Chat and Live Feeds are powered by Supabase Realtime. Form submissions strictly use Next.js Server Actions with hardened RLS security and strict **Zod** schema validation. Layouts use instantaneous Server-Component role verification.
- **AI Integration (Phase 1-3 Completed):** Successfully integrated Google Gemini AI into four major workflows: transforming casual faculty notes into professional announcements, intelligently analyzing student complaints for urgency (triggering push notifications for high urgency), generating AI-driven complaint summaries on the Faculty Dashboard, and using Multimodal Vision AI to automatically generate titles and descriptions for uploaded Lost & Found items.
- **Progressive Web App:** Fully installable PWA with a custom Service Worker and asynchronous Native Push Notifications wired directly into Supabase.
- **UI/UX:** A unified dark-mode design system (featuring glassmorphism, custom empty states, tabular-nums, expanded view modals, and responsive grids) is implemented across all Faculty and Student pages.
- **Performance:** Implemented custom SWR hooks with **Optimistic UI** updates for all primary features, providing instant, highly responsive interactions synchronized with background revalidation. Additionally, strictly enforced **Client/Server Component boundaries** across all page layouts to dramatically reduce the JavaScript bundle size shipped to the client.
- **Type Safety:** Strict TypeScript interfaces and Zod schemas align perfectly with the Supabase schema to reduce runtime errors.

## Contributing (Optional)
No formal contributing guide is defined in the repository yet.

## License
MIT7

## Contact

Built by **Harshit Singhal** — B.Tech CSE, Manav Rachna University

- [GitHub](https://github.com/harshitsinghal11)
- [LinkedIn](https://linkedin.com/in/harshitsinghal11)

> _Feel free to reach out if you're building something similar or have questions about the implementation._

