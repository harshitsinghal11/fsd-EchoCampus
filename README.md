# EchoCampus

**Meet. Learn. Build.**

EchoCampus is a role-based campus platform that unifies communication and utility flows for students, faculty, and administrators — announcements, complaints, marketplace trading, lost & found, faculty directory, and anonymous chat, all in one place.

---

## What It Does

| Module | Description |
|---|---|
| **Announcements** | Faculty post campus-wide notices; all authenticated users can read them |
| **Complaint Box** | Students submit complaints (optionally anonymous); peers can upvote |
| **Marketplace** | Students list items for sale; owners mark listings as sold |
| **Lost & Found** | Anyone reports lost or found items with contact details and optional images |
| **Faculty Directory** | Searchable faculty cards by name and department |
| **Anonymous Chat** | Real-time chat with session-code-based identity labels — no accounts exposed |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) · React 19 · TypeScript · Tailwind CSS 4 |
| Backend | Next.js Route Handlers |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| Real-time Chat | Firebase (Anonymous Auth + Firestore) |

---

## Role Model

Three roles exist: **student**, **faculty**, and **admin**.

- Role is assigned automatically at signup — if the registering email exists in the faculty directory, the account becomes `faculty`; otherwise `student`.
- `admin` must be set manually and has faculty-equivalent access throughout the app.
- All write restrictions are enforced at the database layer via Supabase RLS policies — not just the UI.

---

## Architecture at a Glance

```
Next.js App (App Router)
├── app/auth/login          → Role-aware sign-in and post-login routing
├── app/main/student/*      → Student dashboard, complaints, marketplace, lost & found, chat, profile
├── app/main/faculty/*      → Faculty/admin dashboard, announcements, complaints, lost & found, profile
├── app/api/complaints/*    → Complaint create/list + upvote toggle
└── app/api/marketplace/*   → Marketplace create/list + mark sold

Supabase (PostgreSQL)
├── Row Level Security on all tables
├── Trigger-enforced usage limits per module
└── Auth sync triggers (public.users ↔ auth.users)

Firebase
└── Anonymous real-time chat (Firestore)
```

---

## Database

Schema is managed through two canonical SQL files, applied in order:

1. `assets/sql/01_tables_relations.sql` — tables, constraints, indexes
2. `assets/sql/02_functions_triggers_policies.sql` — RLS policies, triggers, functions

Human-readable summaries live in `assets/` and are updated after SQL changes — never edited independently.

---

## Project Status

- Lint: passing
- TypeScript: passing
- All stabilization TODOs resolved