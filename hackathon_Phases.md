# NexHack 2.0 AI Integration Roadmap (Detailed Specification)

*This document contains the finalized technical roadmap for integrating AI into EchoCampus. All design decisions have been settled.*

---

## Phase 0: Technical Cleanup (Pre-AI Optimization)
**Goal:** Resolve technical debt, improve performance, and harden security before adding complex AI features.

### 0.1 Fix Brittle Error Handling (Rate Limits)
- **Files Affected:** `src/actions/complaintActions.ts`, `src/actions/marketplaceActions.ts`, `src/actions/lostFoundActions.ts`
- **Technical Detail:** Currently, rate limit errors rely on matching the exact string `"Weekly limit reached!"` returned by the Supabase trigger. We will update the Postgres triggers to throw a specific `ERRCODE` (e.g., `P0001`). The server actions will catch this code instead of string matching.

### 0.2 Asynchronous Push Notifications
- **Files Affected:** `src/actions/*.ts`
- **Technical Detail:** Moving `await sendPushNotificationBroadcast({...})` out of the synchronous request block. We will wrap it in `Promise.all` or remove the `await` so the Next.js action returns immediately, preventing the UI from freezing during broadcast.

### 0.3 Optimize Client-Side Protection
- **Files Affected:** `src/components/ProtectedRoute.tsx`
- **Technical Detail:** Next.js Edge Middleware (`src/middleware.ts`) already strictly enforces role-based routing (Student vs. Faculty) on the server before the page loads. Therefore, the client-side `ProtectedRoute.tsx` check is redundant and causes a slow "Verifying Access..." spinner. We will optimize `ProtectedRoute.tsx` to trust the middleware, removing the spinner and making page loads instantaneous while maintaining perfect security.

### 0.4 Strict Schema Validation (Zod)
- **Files Affected:** `src/actions/*.ts`, `package.json`
- **Technical Detail:** Install `zod`. Create schemas (e.g., `ComplaintSchema = z.object({ complaint: z.string().min(10) })`). Validate all `formData` inside Server Actions before running any Supabase insert logic.

---

## Phase 1: Setup & Faculty Announcement Professionalizer
**Goal:** Integrate the base AI API and create a feature that rewrites quick notes into formal faculty announcements.

### 1.1 AI Infrastructure Setup
- **Dependencies:** Install `@google/generative-ai` (Gemini API).
- **Environment:** Add `GEMINI_API_KEY` to `.env.local`.
- **Utility:** Create `src/utils/ai.ts` exporting a `generateAIResponse(systemPrompt: string, userText: string)` function using the `gemini-1.5-flash` model for high speed.

### 1.2 "AI Enhance" UI Integration
- **File:** `src/components/announcements/AnnouncementForm.tsx`
- **Technical Detail:** Add a "✨ AI Enhance" button next to the Submit button. When clicked, it disables the textarea and shows a glowing loading state.

### 1.3 Enhance Server Action
- **File:** `src/actions/aiActions.ts` (New)
- **Technical Detail:** Create `enhanceAnnouncement(text: string)`. Prompt the AI: *"You are a professional university secretary. Rewrite the following brief note into a formal, polite campus announcement suitable for students."* Return the enhanced string to the client.

---

## Phase 2: AI-Powered Complaint Intelligence
**Goal:** Automatically analyze student complaints for urgency and categories.

### 2.1 Database Schema Updates
- **Supabase changes:** Add `urgency` (text: HIGH, MEDIUM, LOW) and `category` (text) columns to `public.complaint_box`. Update TypeScript types in `src/types/`.

### 2.2 AI Interception Logic
- **File:** `src/actions/complaintActions.ts`
- **Technical Detail:** In `submitComplaint`, before inserting into Supabase, pass the text to the AI.
- **AI Prompt:** *"Analyze this campus complaint. Return ONLY a JSON object with two keys: 'urgency' (HIGH, MEDIUM, LOW) and 'category' (e.g., Infrastructure, Academics, Hostel, Admin, Harassment)."*

### 2.3 Campus-Wide Alert for High Urgency
- **File:** `src/actions/complaintActions.ts`
- **Technical Detail:** If the AI determines the urgency is `HIGH`, trigger `sendPushNotificationBroadcast` to **ALL** users (both students and faculty) to ensure maximum awareness of critical campus issues.

### 2.4 Faculty Dashboard UI Updates
- **File:** `src/components/complaints/ComplaintList.tsx` (Faculty View)
- **Technical Detail:** Map over the complaints. If `urgency === 'HIGH'`, add a pulsating red border or a prominent "🔥 HIGH URGENCY" badge. Display the AI-generated category as a pill tag.

---

## Phase 3: Smart Image Recognition for Lost & Found
**Goal:** Use AI Vision to automatically generate titles and descriptions for uploaded images.

### 3.1 AI Vision Server Action
- **File:** `src/actions/aiActions.ts`
- **Technical Detail:** Create `analyzeLostItem(imageUrl: string)`. Use Gemini 1.5 Pro/Flash's multimodal capabilities.
- **AI Prompt:** *"Identify the main object in this image. Return a JSON object with 'title' (a short, clear name like 'Blue Milton Water Bottle') and 'description' (a 2-sentence visual description focusing on brand, color, and defining marks)."*

### 3.2 UI Auto-Fill Flow
- **File:** `src/components/lost-found/LostFoundForm.tsx`
- **Technical Detail:** After the user uploads an image to Supabase Storage, display a "✨ Auto-Fill Details from Image" button. When clicked, it calls `analyzeLostItem`, parses the JSON, and populates the Title and Description input fields automatically.

---

## Phase 4: HUGO - Highly Utility Generative Oracle (Campus RAG)
**Goal:** A smart chatbot (HUGO) that answers student questions based on actual campus data on a dedicated page.

### 4.1 Database Vector Setup (pgvector)
- **Supabase SQL:** Run `CREATE EXTENSION vector;`.
- **Schema:** Create table `campus_knowledge` (id, content text, embedding vector(768), source string).

### 4.2 Knowledge Ingestion Script
- **File:** `scripts/embedData.ts` or a hidden API route.
- **Technical Detail:** Fetch all Faculty Profiles (names, departments, cabins) and recent Announcements. Use the AI embedding model to generate vectors for each block of text and store them in `campus_knowledge`.

### 4.3 HUGO Dedicated Page & API
- **File:** `app/main/student/hugo/page.tsx` (New Dedicated Page)
- **File:** `app/api/chat/route.ts`
- **Technical Detail:**
  1. Student navigates to the dedicated `/main/student/hugo` page and asks: "Who teaches Data Structures?"
  2. API generates embedding for the question.
  3. API queries `campus_knowledge` for the 3 most similar text chunks using cosine similarity.
  4. API sends chunks + question to Gemini: *"You are HUGO (Highly Utility Generative Oracle). Answer the student's question politely using ONLY the provided context."*
  5. Stream the response back to the HUGO UI.
