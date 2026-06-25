# Authentication & Routing Flow

This document details the EchoCampus authentication flow, explaining how identities, roles, and routing are managed. The entire system relies on **Supabase Auth** paired with automated Postgres Database Triggers.

## 1. The Core: Supabase Auth & `public.users`
When anyone (student or faculty) signs up via email and password, their identity is created in Supabase's hidden `auth.users` table. 

We have a Postgres Trigger (`on_auth_user_created`) that instantly catches this signup and creates a mirrored record in our own **`public.users`** table. This is the central table for all users.

**Fields in `public.users`:**
- `id` (UUID - Exactly matches the Supabase Auth ID)
- `email` (String)
- `full_name` (String)
- `role` (String: `'student'`, `'faculty'`, or `'admin'`)

## 2. How the System Knows Who is Faculty
We don't trust a user clicking a "I am a faculty member" checkbox because anyone could falsify their role. Instead, the system uses an **Auto-Detection mechanism**:
- There is a table called **`public.directory`**. This is a pre-populated "whitelist" of verified faculty members containing their `email`, `department`, `cabin`, etc.
- When a user signs up, the backend trigger checks if their email exists in the `public.directory`. 
- **If it matches:** The user is given the `'faculty'` role. The system also creates a row in the **`public.faculty_users`** table, which is a bridge linking their `users.id` to their official `directory.id`. This mapping gives them permission to post official Announcements.

## 3. How the System Knows Who is a Student
- **If the email does NOT match** the `public.directory`, the user is automatically given the `'student'` role.
- **Anonymous Identity (`student_profiles`):** Because students need to use the Anonymous Global Chat and Anonymous Complaints, they are assigned a `session_code` (a random 6-character string like `AX79B2`).
- When a student logs in, the app checks the **`public.student_profiles`** table. If they don't have a session code yet, it generates one and saves it. This code is stored in the database and also in their browser's `sessionStorage`. When they send a chat message, the client sends the `session_code` instead of their `user.id`.

## 4. The Login & Routing Flow
When a user logs in (`app/auth/login/page.tsx`), the application performs the following steps:
1. Authenticates them via Supabase Auth.
2. Checks their `role` in the `public.users` table.
3. If they are `'faculty'` or `'admin'`, they are instantly routed to `/main/faculty/dashboard`.
4. If they are `'student'`, their `session_code` is fetched, and they are routed to `/main/student/dashboard`.

## 5. Client-Side Auth Protection (Login / Signup)
To prevent authenticated users from repeatedly viewing the login and signup forms, a client-side `useEffect` hook checks for an active session upon mounting `app/auth/login/page.tsx` and `app/auth/signup/page.tsx`.
1. It first checks `sessionStorage` for an existing `userRole`. If found, it routes them directly to their respective dashboard.
2. As a fallback, it queries `supabase.auth.getSession()` natively in case `sessionStorage` was cleared but the browser cookie/local storage persists.

## 6. Route Protection (Middleware)
Once inside the `/main/*` area, a Next.js Edge Middleware actively monitors their session. 
- If a student tries to manually type `/main/faculty/dashboard` into their URL bar, the middleware detects their `'student'` role and kicks them out. 
- Similarly, faculty cannot access student routes like the Marketplace or Global Chat.

**Why this structure?**
It guarantees that faculty privileges are strictly locked behind official email addresses while providing students with anonymous identifiers that keep their identities safe in chat and complaints.
