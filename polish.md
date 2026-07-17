# EchoCampus - Foundational Optimization & Polish Roadmap

This document outlines the core structural, performance, and security optimizations required to ensure the application scales robustly. These should be prioritized over new feature development.

## ~~1. Asynchronous Server Actions & AI Processing~~ (COMPLETED)
**The Problem:** 
Currently, AI interactions occur synchronously within Next.js Server Actions.
**The Solution:**
Decouple data insertion from AI processing using Next.js 15 `after()` API to perform the long-running AI categorization in the background while the UI updates instantly. (Implemented in `complaintActions.ts`).

## ~~2. Missing Next.js Cache Invalidation (`revalidatePath`)~~ (COMPLETED)
**The Problem:**
Mutations do not invalidate the Next.js router cache, forcing hard refreshes.
**The Solution:**
Imported and used `revalidatePath` across all major action files (`complaintActions`, `announcementActions`, `lostFoundActions`, `marketplaceActions`) and fixed API route caching with `export const dynamic = 'force-dynamic'`.

## ~~3. Strict Row Level Security (RLS) & Database Policies~~ (COMPLETED)
**The Problem:**
Without proper Row Level Security, data could be vulnerable.
**The Solution:**
Verified that Supabase tables have robust RLS policies in place (e.g., read/write rules for authenticated users).

## 4. Proper Client/Server Component Boundary Usage
**The Problem:**
While the app splits actions into `src/actions`, ensure that large components are properly leveraging Server Components where possible to reduce JavaScript bundle sizes sent to the client. Avoid placing `"use client"` at the top of layout wrappers if only small interactive pieces (like navbars) need it.

## 5. UI Optimizations for Data Fetching
**The Problem:**
Ensure that when data is being mutated or fetched, optimistic UI updates (e.g., using React's `useOptimistic` hook) are used to make the app feel instant, rather than relying solely on loading spinners.
