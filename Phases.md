# NexHack 2.0 AI Integration Roadmap (Detailed Specification)

*This document contains the finalized technical roadmap for integrating AI into EchoCampus. All design decisions have been settled. It tracks our completed progress and remaining tasks.*

---

## 🚀 The Winning Pitch Angle
> *"EchoCampus uses AI to bridge the gap between student issues and administration. It automatically routes and prioritizes complaints, helps students instantly find faculty information using generative AI, and provides a centralized, real-time hub for all campus activities."*

---

## 🛠️ Phase 0: Technical Cleanup (Pre-AI Optimization) ✅
**Goal:** Resolve technical debt, improve performance, and harden security before adding complex AI features.

### ✅ 0.1 Fix Brittle Error Handling (Rate Limits)
- **Files Affected:** `src/actions/complaintActions.ts`, `src/actions/marketplaceActions.ts`, `src/actions/lostFoundActions.ts`
- **Technical Detail:** Update Postgres triggers to throw a specific `ERRCODE` (e.g., `P0001`). The server actions will catch this code instead of string matching.

### ✅ 0.2 Asynchronous Push Notifications
- **Files Affected:** `src/actions/*.ts`
- **Technical Detail:** Wrap `sendPushNotificationBroadcast` in `Promise.all` or remove the `await` so the Next.js action returns immediately.

### ✅ 0.3 Optimize Client-Side Protection
- **Files Affected:** `src/components/ProtectedRoute.tsx`
- **Technical Detail:** Optimize `ProtectedRoute.tsx` to trust the middleware, removing the spinner.

### ✅ 0.4 Strict Schema Validation (Zod)
- **Files Affected:** `src/actions/*.ts`, `package.json`
- **Technical Detail:** Install `zod` and validate all `formData` inside Server Actions.

### ✅ 0.5 Lost & Found Resolution
- **Technical Detail:** Build a proper "Resolved" state to show successful matches instead of deleting posts.

### ✅ 0.6 Complaint Anonymity UI
- **Technical Detail:** Ensure the UI visually shows when a complaint is anonymous.

### ✅ 0.7 Dummy Data Script
- **Technical Detail:** Write a script to populate the database with highly realistic dummy data before the hackathon demo.

---

## ✅ Phase 1: Setup & Faculty Announcement Professionalizer 
**Goal:** Integrate the base AI API and create a feature that rewrites quick notes into formal faculty announcements.

### ✅ 1.1 AI Infrastructure Setup
- **Dependencies:** Install `@google/generative-ai` (Gemini API).
- **Environment:** Add `GEMINI_API_KEY` to `.env.local`.

### ✅ 1.2 "AI Enhance" UI Integration
- **File:** `src/components/announcements/AnnouncementForm.tsx`
- **Technical Detail:** Added a "✨ AI Enhance" button.

### ✅ 1.3 Enhance Server Action
- **File:** `src/actions/aiActions.ts`
- **Technical Detail:** Prompt the AI to rewrite brief notes into formal campus announcements.

---

## ✅ Phase 2: AI-Powered Complaint Intelligence
**Goal:** Automatically analyze student complaints for urgency and categories.

### ✅ 2.1 Database Schema Updates
- **Supabase changes:** Added `urgency` and `category` columns to `public.complaint_box`.

### ✅ 2.2 AI Interception Logic
- **File:** `src/actions/complaintActions.ts`
- **Technical Detail:** Passed the text to the AI for categorization and urgency before inserting into Supabase.

### ✅ 2.3 Campus-Wide Alert for High Urgency
- **File:** `src/actions/complaintActions.ts`
- **Technical Detail:** Triggered `sendPushNotificationBroadcast` for `HIGH` urgency.

### ✅ 2.4 Faculty Dashboard UI Updates
- **File:** `src/components/complaints/ComplaintList.tsx`
- **Technical Detail:** UI highlights high urgency and displays the AI-generated category.

### ✅ 2.5 Admin Summarization Widget
- **Technical Detail:** Add an AI summary widget to the Faculty dashboard: *"This week, 60% of complaints are about Library WiFi. Trend is increasing."*

---

## ✅ Phase 3: Smart Image Recognition for Lost & Found
**Goal:** Use AI Vision to automatically generate titles and descriptions for uploaded images.

### ✅ 3.1 AI Vision Server Action
- **File:** `src/actions/aiActions.ts`
- **Technical Detail:** Used Gemini multimodal capabilities to generate title and description.

### ✅ 3.2 UI Auto-Fill Flow
- **File:** `src/components/lost-found/LostFoundForm.tsx`
- **Technical Detail:** "✨ Auto-Fill Details from Image" button populates the input fields automatically.

### ⏭️ 3.3 Auto-Matching System (SKIPPED)
- **Technical Detail:** AI analyzes the description and proactively notifies students who recently reported losing a similar item.

---

## ❌ Phase 4: E.C.H.O - Every Command Has Outcomes (Campus RAG)
**Goal:** A smart chatbot (ECHO) that answers student questions based on actual campus data.

### ❌ 4.1 Database Vector Setup (pgvector)
- **Supabase SQL:** Run `CREATE EXTENSION vector;`. Create table `campus_knowledge`.

### ❌ 4.2 Knowledge Ingestion Script
- **File:** `scripts/embedData.ts`
- **Technical Detail:** Fetch all Faculty Profiles and recent Announcements to generate vectors and store them in `campus_knowledge`.

### ❌ 4.3 ECHO Dedicated Page & API
- **File:** `app/main/student/echo/page.tsx` & `app/api/chat/route.ts`
- **Technical Detail:** Student asks a question -> API generates embedding -> queries `campus_knowledge` -> sends to Gemini -> streams response.

### ❌ 4.4 AI Chat Moderator
- **File:** `src/actions/chatActions.ts`
- **Technical Detail:** An AI safety layer intercepts real-time chat messages. If Gemini flags the text as abusive/toxic, the message is blocked and rolled back before inserting into the DB.

---

## 🎨 Phase 5: Aesthetic & UI/UX Improvements (The "Wow" Factor) ✅
**Goal:** Make the application feel premium and dynamic for the hackathon judges.

### ✅ 5.1 Micro-interactions
- **Technical Detail:** Add `framer-motion` layout animations when filtering the faculty directory, deleting items, or upvoting complaints. (Already implemented via MotionList)

### ⏭️ 5.2 AI UI States (SKIPPED)
- **Technical Detail:** When the AI is processing, show a beautiful glowing "AI Thinking..." state instead of a standard spinner.

### ✅ 5.3 Premium Empty States
- **Technical Detail:** Upgrade the `BaseEmptyState` with Framer Motion layout animations, background aesthetic blobs, and actionable CTA buttons (e.g., "File a Complaint") for empty pages.

### ✅ 5.4 Global Chat UI Overhaul
- **File:** `app/main/student/chat/page.tsx`
- **Technical Detail:** Rebuilt the chat interface to feature a professional side-by-side layout (75% chat, 25% active participants sidebar), smooth auto-scrolling, mobile participant popups via an overlay modal, and modernized bubble aesthetics (`bg-primary`).
