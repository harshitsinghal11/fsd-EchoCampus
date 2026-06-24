# Polish & Fix Phases

This document outlines the codebase issues, inconsistent logic, and UX flaws discovered during the initial analysis of the EchoCampus project. They are grouped into phases by priority (High to Low) so they can be addressed sequentially without breaking the application flow.

## Phase 1: Critical Architecture & Security (High Priority)

### 1.1 Middleware Database Query Bottleneck
*   **Location:** `src/middleware.ts`
*   **Problem:** The Edge middleware queries the Postgres `users` table via `supabase.from("users").select("role")` on **every single page request** to `/main/*`. This is an anti-pattern that introduces significant latency and unnecessary database load.
*   **Solution:** Store the user's `role` directly in the Supabase Auth JWT `user_metadata` or `app_metadata` during signup/trigger. Update the middleware to read the role directly from the decoded JWT session rather than querying the database.

### 1.2 Base64 Image Storage Bloat
*   **Location:** `docs/01_PRD.md` / `public.lost_found` table
*   **Problem:** Lost & Found images are stored as Base64 text directly in the database. This will rapidly bloat the database size, slow down backups, and degrade query performance for the feed.
*   **Solution:** Integrate Supabase Storage. Upload images to a public bucket and store only the resulting image URL in the `image_url` column.

### 1.3 Marketplace Identity Spoofing
*   **Location:** `app/api/marketplace/route.ts` & `src/components/marketplace/MarketplaceForm.tsx`
*   **Problem:** The API blindly trusts the `owner_name` provided in the client request body. Since the user is authenticated, a malicious user could spoof another student's name on a listing.
*   **Solution:** Remove the manual `owner_name` input field from the frontend. In the API, fetch the `full_name` from the authenticated user's `public.users` record and enforce it during the insert.

---

## Phase 2: Logic Bugs & Data Integrity (Medium Priority)

### 2.1 False Positives on "Mark as Sold"
*   **Location:** `app/api/marketplace/sold/route.ts`
*   **Problem:** The API runs an update query `update({ is_sold: true }).eq("id", id).eq("owner_id", user.id)`. If the `id` is invalid or the user doesn't own it, Supabase returns no error, but 0 rows are updated. The API still returns `{ success: true }`.
*   **Solution:** Check the `count` or returned `data` array length from the Supabase query to ensure exactly 1 row was modified before sending a success response. Return `404 Not Found` or `403 Forbidden` if 0 rows are updated.

### 2.2 Inaccurate Complaint Error Handling
*   **Location:** `app/api/complaints/route.ts`
*   **Problem:** The POST route catches generic database errors (`insertError.code === "23505"`) and hardcodes the response: `"Daily limit reached! 1 Complaint per Week"`. This masks true errors (like DB down or constraint failure) and falsely labels them as rate limits.
*   **Solution:** Parse the specific Postgres exception string thrown by the `check_complaint_limit()` trigger to return an accurate message to the user.

### 2.3 Redundant Faculty Signup Flow
*   **Location:** `app/auth/signup/page.tsx` & `assets/sql/02_functions_triggers_policies.sql`
*   **Problem:** The frontend has a "Faculty Checkbox". However, the Postgres trigger `handle_new_auth_user` automatically promotes a user to `faculty` if their email exists in the `directory` table, regardless of whether the box was checked. This creates a disconnect between user intent and backend behavior.
*   **Solution:** Either make the backend rely on `user_metadata.role` passed from the signup form (validated against the directory), OR completely remove the faculty checkbox from the UI and simply inform users that faculty status is auto-detected.

---

## Phase 3: Code Quality, DX, & UI/UX (Low Priority)

### 3.1 Duplicate Supabase Server Client Code
*   **Location:** `app/api/complaints/route.ts`, `app/api/marketplace/route.ts`, `app/api/marketplace/sold/route.ts`
*   **Problem:** Every API route repeats the same ~20 lines of `createServerClient` and cookie-handling logic.
*   **Solution:** Extract this logic into a reusable utility file like `src/utils/supabaseServer.ts` to keep the codebase DRY and maintainable.

### 3.2 Client-Side Rendering (CSR) Overhead
*   **Location:** Main feeds (e.g., Dashboard, Announcements, Marketplace)
*   **Problem:** The project heavily relies on client-side fetching for data feeds, missing out on Next.js 16 App Router's Server Components capabilities.
*   **Solution:** Refactor read-only data lists to use React Server Components (RSC) to fetch data on the server. This will reduce client bundle size and drastically improve load times.

### 3.3 Contact Info Validation Gap
*   **Location:** `src/components/marketplace/MarketplaceForm.tsx` & API
*   **Problem:** The phone number validation strictly demands exactly 10 digits (`/^\d{10}$/`). This breaks if users want to add country codes (e.g., `+91`) or formats.
*   **Solution:** Update the regex to support optional country codes, or clearly document in the UI placeholder that only the local 10-digit format is accepted.
