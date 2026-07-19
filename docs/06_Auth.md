# Authentication and Authorization

## Auth Stack
- Provider: Supabase Auth
- Method in current repo: email + password
- App-side session helpers:
  - browser client: `src/lib/supabaseClient.ts`
  - server client: `src/utils/supabaseServer.ts`
  - middleware server client: `src/middleware.ts`

## Identity Model
Supabase owns the canonical identity in `auth.users`. EchoCampus mirrors that identity into `public.users` through a database trigger so the app can join user records with role data and profile tables.

## Persisted Role Model
- `student`
- `admin`

Important note:
- the current faculty signup flow stores faculty-style users as `admin`
- some frontend helpers and route guards still accept `faculty` as a compatibility alias

## Signup Flow
### Student Signup
1. User enters name, email, and password
2. `supabase.auth.signUp()` is called with metadata:
   - `full_name`
   - `role: "student"`
3. `handle_new_auth_user()` inserts the mirrored `public.users` row
4. If a session is returned immediately:
   - role is resolved
   - a `student_profiles.session_code` row is created or recovered
   - the user is redirected to the student dashboard

### Faculty-Style Signup
1. User enables the "I am a Faculty Member" option
2. Additional metadata fields are collected:
   - department
   - cabin number
   - phone number
   - experience years
   - faculty access code
3. `verifyFacultyCode()` compares the entered code against `FACULTY_SECRET_CODE`
4. On success, `supabase.auth.signUp()` is called with metadata:
   - `role: "admin"`
   - faculty profile metadata
5. `handle_new_auth_user()` inserts:
   - the `public.users` row
   - the matching `faculty_profiles` row
6. If a session is returned immediately, the user is redirected to the faculty dashboard

## Login Flow
1. The login page first checks `sessionStorage` for `userRole`
2. If that hint is missing, it checks for an active Supabase session
3. On submit, the app calls `supabase.auth.signInWithPassword()`
4. `ensureOwnUserRow()` verifies that the mirrored app row exists
5. `fetchUserRole()` resolves the current app role from `public.users`
6. Students get or restore their anonymous `session_code`
7. The resolved role is stored in `sessionStorage`
8. The user is redirected to the correct dashboard

## Session Persistence
- Supabase manages the underlying authenticated session
- EchoCampus stores lightweight client hints in `sessionStorage`:
  - `userRole`
  - `userSessionCode` for students
- Those values are used only to speed up redirects and anonymous-chat identity reuse

## Student Anonymous Identity
Students use a persistent anonymous code stored in `student_profiles.session_code`.

Usage:
- complaint author masking/display
- anonymous global chat sender identity
- marketplace owner alias generation for student listings

Current implementation detail:
- `generateUniqueCode(7)` returns a stylized format such as `@ABCD_#`
- the code is stored in the database and also cached in `sessionStorage`

## Request-Time Protection
`src/middleware.ts` protects `/main/*` routes.

It performs:
1. session lookup
2. role resolution from metadata or `public.users`
3. redirect of unauthenticated users to `/auth/login`
4. redirect of students away from faculty routes
5. redirect of faculty-style users away from student routes

## Render-Time Protection
The root layouts for each protected tree repeat role validation:
- `app/main/student/layout.tsx`
- `app/main/faculty/layout.tsx`

This ensures that even after middleware routing, the wrong route tree does not render for an authenticated user with the wrong role.

## Database Side Auth Support
### Trigger Functions
- `handle_new_auth_user()`
- `handle_auth_user_email_update()`

### Tables Involved
- `auth.users`
- `public.users`
- `public.student_profiles`
- `public.faculty_profiles`

## Authorization Boundaries
- Middleware: request-time route separation
- Root layouts: render-time route separation
- RLS policies: database authorization
- Server Actions / API routes: mutation validation, user checks, and side effects

## Logout Flow
`ProfileActions` signs the user out through Supabase and clears cached local/session storage values before routing back to `/auth/login`.

## Environment Variables Used by Auth
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- optional legacy fallback: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `FACULTY_SECRET_CODE`

## Practical Limitations
- There is no dedicated password-reset flow implemented in the repository
- There is no profile-edit UI for student or faculty details
- There is no admin-only control panel beyond faculty-style access
