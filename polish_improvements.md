# EchoCampus Polish & Professional Improvements Checklist

This document tracks the remaining steps required to take EchoCampus to a highly professional, production-ready application. Completed items have been removed. The list is prioritized from High to Low impact.

## High Priority: Security & Architecture
- [x] **Component Coupling (Bad Engineering):** Forms (`MarketplaceForm`, `ComplaintForm`, `LostFoundForm`) directly execute Supabase DB insertions inside the client components. These should be refactored to use **Next.js Server Actions** or dedicated service utilities to separate UI from business logic.
- [x] **Supabase Row Level Security (RLS):** Audit and enforce strict RLS policies on all Supabase tables so users can only read/write data they are authorized to access.
- [x] **Type Safety Improvements:** Replace lazy `any` casting (found in files like `MarketplaceForm.tsx` during profile fetching) with strictly defined interfaces aligned with the Supabase schema to prevent runtime errors.

## Medium Priority: Data Flow & UX
- [ ] **Custom Hooks for Data Fetching:** Abstract Supabase `useEffect` fetches (e.g., profile data, announcements) into custom hooks (like `useFacultyProfile()`) for reusability and cleaner component code.
- [ ] **Data Fetching Optimization:** Consider implementing React Query or SWR to handle caching, background refetching, and deduping requests.
- [ ] **Empty States:** Design and implement beautiful empty state illustrations for when lists are empty (e.g., no complaints, no marketplace items).
---
**Next Step:** Choose an item from the checklist above to begin implementation.
