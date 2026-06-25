# EchoCampus Polish & Professional Improvements Checklist

This document tracks the steps required to take EchoCampus from a working MVP to a highly professional, production-ready application. We will tackle these step by step.

## 1. UX Polish & Micro-interactions
- [x] **Skeleton Loaders:** Replace generic loading spinners (e.g., `<Loader2 />`) with Skeleton Loaders that mimic the shape of the content to prevent layout shifts.
- [x] **Framer Motion Integration:** Install and configure `framer-motion` to add smooth page transitions and list entry animations.
- [x] **Global Toast Notifications:** Ensure the `sonner` toast library is used globally to provide feedback for every success (e.g., "Complaint submitted") and failure (e.g., "Network error").

## 2. Code Architecture & Cleanliness
- [ ] **Custom Hooks for Data Fetching:** Abstract Supabase `useEffect` fetches (e.g., profile data, announcements) into custom hooks (like `useFacultyProfile()`) for reusability and cleaner component code.
- [ ] **Data Fetching Optimization:** Consider implementing React Query or SWR to handle caching, background refetching, and deduping requests.

## 3. Error Handling & Edge Cases
- [ ] **Next.js Error Boundaries:** Create global and route-specific `error.tsx` files styled with our glassmorphism theme to gracefully handle crashes.
- [ ] **Custom 404 Page:** Implement a stylized `not-found.tsx` for broken links.
- [ ] **Empty States:** Design and implement beautiful empty state illustrations for when lists are empty (e.g., no complaints, no marketplace items).

## 4. Database Security
- [ ] **Supabase Row Level Security (RLS):** Audit and enforce strict RLS policies on all Supabase tables so users can only read/write data they are authorized to access.

## 5. SEO and Metadata
- [ ] **Dynamic Metadata:** Utilize the Next.js Metadata API to define custom titles, descriptions, and OpenGraph preview images for sharing links on social media/messaging apps.

---

## 6. Code Quality & Technical Debt (Refactoring Needed)
- [ ] **Component Coupling (Bad Engineering):** Forms (`MarketplaceForm`, `ComplaintForm`, `LostFoundForm`) directly execute Supabase DB insertions inside the client components. These should be refactored to use **Next.js Server Actions** or dedicated service utilities to separate UI from business logic.
- [x] **Abstract Navbars into a Shared Component:** `NavBarStudent` and `NavBarAdmin` have highly duplicated structural and animation code for their responsive menus. This should be abstracted into a single `<BaseNavBar />` component that accepts links/roles as props.
- [ ] **Type Safety Improvements:** Replace lazy `any` casting (found in files like `MarketplaceForm.tsx` during profile fetching) with strictly defined interfaces aligned with the Supabase schema to prevent runtime errors.
- [ ] **Centralized Routing:** Eliminate hardcoded href strings (e.g., `href="/main/student/..."`) throughout the app by creating a centralized `routes.ts` constants file. This prevents broken links if a directory is renamed.

---
**Next Step:** Choose an item from the checklist above to begin implementation.
