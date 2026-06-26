# Authentication & Routing Flow

This document details the EchoCampus authentication flow, explaining how identities, roles, and routing are managed. The entire system relies on **Supabase Auth** paired with automated Postgres Database Triggers.

## 1. The Core: Supabase Auth & `public.users`
When anyone (student or faculty) signs up via email and password, their identity is created in Supabase's hidden `auth.users` table. 

We have a Postgres Trigger (`on_auth_user_created` or similar) that instantly catches this signup and creates a mirrored record in our own **`public.users`** table. This is the central table for all users.

**Fields in `public.users`:**
- `id` (UUID - Exactly matches the Supabase Auth ID)
- `email` (String)
- `full_name` (String)
- `role` (String: `'student'` or `'admin'`)

## 2. How the System Knows Who is Faculty
Users can explicitly select their role during signup using the **"I am a Faculty Member"** checkbox on the registration page.
- When checked, the frontend passes `role: 'admin'` securely inside the Supabase Auth metadata (`raw_user_meta_data`), along with their **Department**, **Cabin Number**, **Experience**, and **Phone**.
- A Postgres trigger (`handle_new_auth_user`) dynamically extracts this role from the metadata and assigns it in the `public.users` table.
- If the role is `admin`, the trigger *also* extracts the additional faculty fields from the metadata and securely inserts them into the `public.faculty_profiles` table automatically, bypassing the need for client-side queries and bypassing email-confirmation session blockages.

## 3. How the System Knows Who is a Student
- By default, if the faculty checkbox is not checked, the system assigns the `'student'` role.
- **Anonymous Identity (`student_profiles`):** Because students need to use the Anonymous Global Chat and Anonymous Complaints, they are assigned a `session_code` (a random 6-character string like `AX79B2`).
- When a student logs in, the app checks the **`public.student_profiles`** table. If they don't have a session code yet, it generates one and saves it. This code is stored in the database and also in their browser's `sessionStorage`. When they send a chat message, the client sends the `session_code` instead of their `user.id`.

## 4. The Login & Routing Flow
When a user logs in (`app/auth/login/page.tsx`), the application performs the following steps:
1. Authenticates them via Supabase Auth.
2. Checks their `role` securely via the JWT session metadata.
3. If they are `'admin'`, they are instantly routed to `/main/faculty/dashboard`.
4. If they are `'student'`, their `session_code` is fetched, and they are routed to `/main/student/dashboard`.

## 5. Client-Side Auth Protection (Login / Signup)
To prevent authenticated users from repeatedly viewing the login and signup forms, a client-side `useEffect` hook checks for an active session upon mounting `app/auth/login/page.tsx` and `app/auth/signup/page.tsx`.
1. It first checks `sessionStorage` for an existing `userRole`. If found, it routes them directly to their respective dashboard.
2. As a fallback, it queries `supabase.auth.getSession()` natively in case `sessionStorage` was cleared but the browser cookie/local storage persists.

## 6. Route Protection (Middleware)
Once inside the `/main/*` area, a Next.js Edge Middleware actively monitors their session. 
- **Optimized Performance:** The middleware reads the user's role directly from their encrypted JWT `user_metadata` instead of querying the database on every page load. (If missing in older accounts, it gracefully falls back to a DB query).
- If a student tries to manually type `/main/faculty/dashboard` into their URL bar, the middleware detects their `'student'` role and kicks them out. 
- Similarly, faculty cannot access student routes like the Marketplace or Global Chat.

**Why this structure?**
It provides an fast routing experience (zero DB hits for role verification) while ensuring role boundaries are strictly enforced across the portal.

