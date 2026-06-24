# EchoCampus

## Project Title
EchoCampus

## Overview
EchoCampus is a campus web platform that centralizes common student and faculty workflows into one authenticated system. The current implementation focuses on announcements, faculty discovery, anonymous student interaction, complaint submission, lost and found reporting, and a student-only marketplace.

## Key Features
- Role-based authentication with student and faculty/admin route separation
- Faculty announcement publishing and announcement feed
- Student complaint submission with anonymous mode and upvoting
- Student-only marketplace with owner-controlled sold status
- Lost and found posting, browsing, and owner deletion
- Searchable faculty directory
- Anonymous student chat powered by Supabase Realtime
- Student and faculty profile pages

## Tech Stack
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase Auth
- Supabase Postgres
- Supabase Realtime
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
# Optional legacy fallback:
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Running Locally
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts
- `npm run dev` - start the local Next.js development server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript type checking

## Deployment
Project not Supported. The repository does not currently include a defined deployment pipeline, CI/CD workflow, or platform-specific deployment configuration.

## Project Status
Implemented core student and faculty flows are present in the repository. The tech stack has been successfully consolidated by migrating Global Chat and Live Feeds entirely to Supabase Realtime (removing Firebase). The project is now undergoing UI/UX polish (Phases 5-6) including Toast notifications, Suspense loading states, and SEO metadata.

## Contributing (Optional)
No formal contributing guide is defined in the repository yet.

## License
ISC

## Contact

Built by **Harshit** — B.Tech CSE, Manav Rachna University

- [GitHub](https://github.com/harshitsinghal11)
- [LinkedIn](https://linkedin.com/in/harshitsinghal11)

> _Feel free to reach out if you're building something similar or have questions about the implementation._
