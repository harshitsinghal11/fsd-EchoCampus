# Application Overview
EchoCampus has a public entry flow and two protected application areas. Students receive the broader day-to-day campus toolkit, while faculty and admin users receive announcement management, complaint visibility, directory access, lost and found access, and a profile page.

# Navigation Structure
- All route strings are centralized in `src/lib/routes.ts` via the `ROUTES` constant.
- Public routes: `/`, `/privacy`, `/terms`
- Auth routes: `/auth/login`, `/auth/signup`
- Student routes: `/main/student/dashboard`, `/main/student/announcements`, `/main/student/chat`, `/main/student/complaint`, `/main/student/directory`, `/main/student/lost-found`, `/main/student/marketplace`, `/main/student/profile`
- Faculty routes: `/main/faculty/dashboard`, `/main/faculty/announcements`, `/main/faculty/complaints`, `/main/faculty/directory`, `/main/faculty/lost-found`, `/main/faculty/profile`

# Authentication Flow
- User opens a public page and navigates to login or signup.
- On signup, the user enters full name, email, password, and optionally selects faculty mode.
- If faculty mode is selected, the app calls `is_faculty_email(input_email)` before account creation.
- Supabase Auth creates the account and may either return an active session immediately or require email confirmation first.
- After successful authenticated login or immediate signup session, the app ensures the `users` row exists and resolves the user role.
- Student logins generate or reuse a `session_code` and store it in `sessionStorage`.
- Faculty and admin users are redirected to `/main/faculty/dashboard`.
- Students are redirected to `/main/student/dashboard`.
- Middleware and `ProtectedRoute` keep role access aligned on future requests.

# Role Based Flows
- Student flow: dashboard -> announcements/chat/complaints/directory/lost and found/marketplace/profile
- Faculty flow: dashboard -> announcements/complaints/directory/lost and found/profile
- Admin flow: same route path and access pattern as faculty

# Feature Workflows
- Announcements: faculty opens announcement center -> fills title, optional link, and content -> app resolves `faculty_users.faculty_id` -> announcement is inserted into `announcements` -> students and faculty read the updated feed.
- Complaints: student opens complaints page -> writes complaint text and selects anonymous mode -> form calls `submitComplaint` server action -> action validates auth -> record is inserted into `complaint_box` -> complaint appears in complaint feeds.
- Complaint upvote: student presses vote button -> request goes to `POST /api/complaints/upvote` -> route checks existing vote -> inserts or deletes vote -> UI updates vote count locally.
- Marketplace: student opens marketplace page -> list loads from Supabase -> student submits listing form -> `addMarketplaceItem` server action validates ownership and fields -> listing is saved.
- Announcement creation: faculty submits form -> `addAnnouncement` server action validates auth -> record inserted into `announcements`.
- Lost and Found reporting: student submits form -> image uploaded to Supabase storage -> `addLostFoundItem` server action validates auth and inserts record.

# Data Flow
- Auth data flow: browser -> Supabase Auth -> `public.users` and profile helpers -> middleware and protected routes -> role-specific page
- Direct Supabase feature flow: browser client -> Supabase JS -> RLS-protected tables -> UI render
- API-backed feature flow: browser -> Next.js route handler -> Supabase server client -> Postgres -> JSON response -> UI update
- Chat flow: browser -> Supabase client -> Postgres `chat_messages` table -> realtime channel subscription -> UI render

# Error Handling Flow
- Missing or expired authenticated session redirects the user to `/auth/login`.
- Missing or invalid role data causes logout or redirect back to the correct area.
- Form validation errors are shown through inline text, alert popups, or disabled buttons.
- API validation failures return JSON error messages and are surfaced in the UI.
- Database trigger limits return human-readable error messages for complaints, marketplace, and lost and found posting limits.
- Directory fetch failure shows an error card with a retry button.

# Edge Cases
- If `public.users` is missing after authentication, client-side auth helpers recreate it.

- If a student profile has no `session_code`, the app generates one on demand.
- Duplicate complaint upvotes are safely handled through unique constraints and toggle logic.
- Faculty and admin users are blocked from student routes, including marketplace and chat.
- Complaint API returns anonymous-safe author data, but the current complaint UI does not display author identity even for non-anonymous complaints.
- `lost_found.is_resolved` exists in the schema, but the current UI resolves posts by deletion instead of updating that flag.

# User Journey Maps
- Student first use: landing page -> signup -> role resolved as student -> session code generated -> student dashboard -> feature navigation
- Returning student: login -> session restored -> student dashboard -> chat or marketplace or complaint action
- Faculty use: login or faculty signup -> role resolved as faculty/admin -> faculty dashboard -> announcement posting or complaint review
