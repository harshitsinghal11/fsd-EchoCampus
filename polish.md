# EchoCampus - Foundational Optimization & Polish Roadmap

This document outlines the core structural, performance, and security optimizations required to ensure the application scales robustly. These should be prioritized over new feature development.

## 1. Asynchronous Server Actions & AI Processing
**The Problem:** 
Currently, AI interactions (e.g., categorizing complaints via Gemini API) occur synchronously within Next.js Server Actions (`src/actions/complaintActions.ts`). If the AI takes 3-5 seconds to respond, the entire UI blocks, leaving the user staring at a frozen screen or spinner. If the API fails, the record might not be inserted at all.

**The Solution:**
Decouple data insertion from AI processing.
1. Insert the basic record (e.g., the complaint) into Supabase immediately so the UI can respond instantly.
2. Trigger the AI analysis asynchronously. This can be done via:
   - **Supabase Webhooks / Database Triggers:** A Postgres trigger fires on `INSERT` which calls a Supabase Edge Function to process the AI categorization in the background.
   - **Background Queues:** Using something like Inngest or Upstash QStash.

## 2. Missing Next.js Cache Invalidation (`revalidatePath`)
**The Problem:**
Across `src/actions/`, mutations (like submitting a complaint or adding a lost item) return `{ success: true }` but do not invalidate the Next.js router cache. Because the App Router caches aggressively, users may not see their new data appear until they hard refresh the page.

**The Solution:**
Import and use `revalidatePath` from `next/cache` at the end of every successful server action that modifies data displayed on a page.
```typescript
import { revalidatePath } from "next/cache";

// inside your action, after successful DB insert:
revalidatePath('/main/student/complaint');
revalidatePath('/main/faculty/complaints');
```

## 3. Strict Row Level Security (RLS) & Database Policies
**The Problem:**
Without proper Row Level Security, API keys exposed to the client (even anon keys) can be used to query or manipulate data they shouldn't have access to. 

**The Solution:**
Ensure all tables (`complaint_box`, `lost_and_found`, `users`, etc.) have RLS enabled and strict policies attached.
- *Example:* Students can only `SELECT` their own complaints (unless public).
- *Example:* Only authenticated users can `INSERT` into tables.

## 4. Proper Client/Server Component Boundary Usage
**The Problem:**
While the app splits actions into `src/actions`, ensure that large components are properly leveraging Server Components where possible to reduce JavaScript bundle sizes sent to the client. Avoid placing `"use client"` at the top of layout wrappers if only small interactive pieces (like navbars) need it.

## 5. UI Optimizations for Data Fetching
**The Problem:**
Ensure that when data is being mutated or fetched, optimistic UI updates (e.g., using React's `useOptimistic` hook) are used to make the app feel instant, rather than relying solely on loading spinners.
