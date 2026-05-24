# Deployment

Host-agnostic guide for running EchoCampus locally and in production. There is no Docker or IaC in this repository.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run SQL in the SQL editor **in order**:
   - `assets/sql/01_tables_relations.sql`
   - `assets/sql/02_functions_triggers_policies.sql`
3. Seed **`directory`** rows for faculty emails that should sign up as faculty.
4. **Authentication → URL configuration:** add your local and production URLs (e.g. `http://localhost:3000`, `https://your-app.vercel.app`).
5. Copy **Project URL** and **publishable/anon key** into env vars (see below).

Optional: assign `role = 'admin'` in `public.users` for admin accounts.

---

## Firebase setup (chat only)

1. Create a Firebase project.
2. Enable **Authentication → Sign-in method → Anonymous**.
3. Create a **Firestore** database.
4. Register a web app and copy config into `NEXT_PUBLIC_FIREBASE_*`.
5. **Authorized domains:** add localhost and production hostname.
6. **Firestore rules:** define rules for your threat model. This repo does **not** ship `firestore.rules`—misconfiguration can expose or block chat.

Chat writes `expiresAt` (+24h) on messages; schedule TTL or a cleanup job in Firebase if you need automatic deletion.

---

## Local development

```bash
cp .env.example .env.local
# Edit .env.local with real keys

npm install
npm run dev
```

Verify:

- Login/signup and role-based redirect to `/main/student` or `/main/faculty`
- At least one student flow (e.g. complaints) and faculty flow (e.g. announcements)
- Student chat after Firebase env is set

```bash
npm run lint
npm run typecheck
npm run build   # before deploy
```

---

## Production deploy (typical: Vercel)

1. Connect the Git repository.
2. Set **all** environment variables from `.env.example` in the host dashboard (Production + Preview if used).
3. Build command: `npm run build` (default for Next.js).
4. Output: Next.js default.
5. After deploy:
   - Supabase Auth redirect URLs include the production domain
   - Firebase authorized domains include the production domain
6. Keep `assets/sql/` changes applied to the **same** Supabase project you point production at.

### Environment checklist

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same (never service role in `NEXT_PUBLIC_*`) |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase console → Project settings |

---

## What is not in-repo

- CI workflows (e.g. GitHub Actions)
- Automated tests
- Firestore security rules file
- PWA build (see root `PWA.md` — planned only)

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Redirect loop on `/main` | Supabase session cookies; row in `public.users` for `auth.users.id` |
| Faculty cannot post announcements | `faculty_users` maps `user_id` → `directory.id` |
| Marketplace empty/errors for faculty | Expected — RLS blocks faculty from marketplace |
| Chat does not load | Firebase env, anonymous auth enabled, Firestore rules |
| Complaint POST 429 | User hit 7-day complaint limit trigger |

See also [app-flow.md](./app-flow.md) and [database-schema.md](./database-schema.md).
