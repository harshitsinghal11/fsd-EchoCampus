# EchoCampus Codebase Polish & Refactoring Plan

Based on a thorough analysis of the codebase, here are the identified areas for improvement, ranging from high-priority architectural fixes to low-priority production polishing.

## Phase 1: High Priority (Architecture & Code Organization)

### 1. Reorganize Feature Components
- **Issue:** Major feature components like `LostFound` and `Directory` are currently located inside `src/components/shared/`.
- **Solution:** Move them to their own dedicated domain folders (`src/components/lost-found` and `src/components/directory`) to match the clean structure of `announcements`, `marketplace`, and `complaints`.
- **Impact:** Improves maintainability and keeps domain logic decoupled.

### 2. Standardize Reusable UI Components
- **Issue:** `AnnouncementForm.tsx` uses a raw hardcoded `<button>` with Tailwind classes instead of the reusable `<SubmitBtn>` component found in `src/components/shared/SubmitBtn.tsx` (which is correctly used by `MarketplaceForm` and `ComplaintForm`).
- **Solution:** Replace the hardcoded button in `AnnouncementForm` with the shared `<SubmitBtn>` component to ensure visual consistency across the app.
- **Impact:** Eliminates duplicate code and unifies UI interactions.

### 3. Remove Dead Code & Unused APIs
- **Issue:** The file `app/api/complaints/route.ts` contains a `POST` handler for complaint submission. However, the frontend actually uses the Server Action `submitComplaint` from `src/actions/complaintActions.ts`.
- **Solution:** Safely remove the unused `POST` handler from the route file to prevent confusion and reduce the API surface area.
- **Impact:** Cleaner, more predictable codebase and adherence to a single source of truth for mutations.

## Phase 2: Medium Priority (Optimization & Performance)

### 1. Abstract Form Wrappers and Inputs
- **Issue:** Input layouts and the glassmorphism card wrappers are highly duplicated across `MarketplaceForm`, `ComplaintForm`, `LostFoundForm`, and `AnnouncementForm`.
- **Solution:** Abstract the Form Wrapper and Input fields into reusable UI components inside `src/components/shared/ui/` (e.g., `<GlassCard>`, `<FormInput>`, `<FormTextarea>`).
- **Impact:** Massive reduction in boilerplate code and ensures UI styling changes happen in one place.

### 2. Add Pagination & Infinite Scroll
- **Issue:** Currently, lists like Announcements, Marketplace, and Complaints fetch *all* records at once (with a simple limit for widgets). There is no server-side pagination, cursor, or infinite scroll.
- **Solution:** Implement Supabase `.range(from, to)` queries combined with an Intersection Observer or "Load More" button on the client side.
- **Impact:** Prevents performance bottlenecks and excessive bandwidth usage as the platform scales.

### 3. Server-Side Filtering for Directory & Lost Items
- **Issue:** The Directory and Lost & Found search/filter behavior is handled entirely on the client side after fetching the whole dataset.
- **Solution:** Shift filtering to Server-Side rendering or parameterized Supabase queries.
- **Impact:** Reduces initial payload size and improves time-to-interactive for end-users.

## Phase 3: Low Priority (Production Readiness & Polish)

### 1. Centralized Error Logging
- **Issue:** Errors are currently handled via simple `console.error` logs or `toast.error` popups.
- **Solution:** Integrate an error tracking service (e.g., Sentry or LogRocket) to monitor unhandled frontend exceptions and API failures in production.
- **Impact:** Faster debugging and visibility into real user issues.

### 2. Image Optimization Pipeline
- **Issue:** Marketplace and Lost & Found enforce a 200KB limit client-side before uploading directly to Supabase Storage. There's no server-side compression, resizing, or WebP conversion.
- **Solution:** Integrate a lightweight client-side compressor (like `browser-image-compression`) before upload, or configure Supabase Storage image transformations.
- **Impact:** Saves storage costs and significantly improves image loading speeds on mobile networks.

### 3. Edge Rate Limiting
- **Issue:** Supabase Postgres Triggers elegantly prevent database spam (e.g., 1 complaint/week limit), but malicious requests still hit the database before being rejected.
- **Solution:** Add basic rate limiting (e.g., Upstash Redis or Vercel Edge rate limiting) in the Next.js middleware or Server Actions to drop abusive traffic early.
- **Impact:** Enhances security and protects database resources from DDoS or spam scripts.

### 4. SEO & Metadata Definitions
- **Issue:** Next.js `metadata` exports (Open Graph tags, dynamic titles) are likely missing, generic, or hardcoded.
- **Solution:** Add centralized `generateMetadata` exports to all major pages.
- **Impact:** Improves link-sharing previews (WhatsApp/iMessage, Twitter) and search engine visibility.
