# Backend Schema and Data Model

## Backend Overview
EchoCampus uses Supabase as the primary backend platform:
- Supabase Auth for identity
- Supabase Postgres for product data
- Supabase Realtime for chat presence and list invalidation
- Supabase Storage for uploaded marketplace and lost-and-found images

## Role Storage Model
- Persisted roles in the current signup flow: `student`, `admin`
- `admin` currently represents the faculty-style user role
- Some frontend code still accepts `faculty` as a compatibility alias, but the database-facing role written by signup is `admin`

## Core Tables
### `public.users`
- `id`
- `email`
- `full_name`
- `role`
- `created_at`

This table mirrors Supabase auth users into app-readable profile data.

### `public.student_profiles`
- `user_id`
- `session_code`

Stores the anonymous student identifier used in chat and complaint display.

### `public.faculty_profiles`
- `user_id`
- `department`
- `phone_no`
- `cabin_no`
- `experience_years`

Stores faculty metadata for the directory and faculty profile page.

### `public.announcements`
- `id`
- `title`
- `content`
- `link`
- `author_id`
- `created_at`
- `event_start_date`
- `event_end_date`

### `public.starred_announcements`
- `id`
- `user_id`
- `announcement_id`
- `created_at`

### `public.complaint_box`
- `id`
- `user_id`
- `content`
- `is_anonymous`
- `urgency`
- `category`
- `created_at`

Implementation note:
- complaints are inserted immediately and then enriched asynchronously
- a transitional state such as `PENDING` can exist before AI classification settles

### `public.complaint_upvotes`
- `id`
- `complaint_id`
- `user_id`

### `public.marketplace`
- `id`
- `owner_id`
- `owner_name`
- `owner_email`
- `product_title`
- `description`
- `price`
- `contact_info`
- `image_url`
- `is_sold`
- `created_at`

### `public.lost_found`
- `id`
- `user_id`
- `title`
- `description`
- `location_found`
- `contact_info`
- `image_url`
- `is_resolved`
- `created_at`

### `public.chat_messages`
- `id`
- `random_code`
- `message`
- `created_at`

### `public.push_subscriptions`
- `id`
- `user_id`
- `endpoint`
- `p256dh`
- `auth`
- `created_at`

### `public.campus_knowledge`
Defined in `docs/06_VectorMigration.sql`.

Used by the E.C.H.O assistant for vector-search retrieval.

## Relationships
- `users.id -> auth.users.id`
- `student_profiles.user_id -> users.id`
- `faculty_profiles.user_id -> users.id`
- `announcements.author_id -> users.id`
- `announcement_id -> public.announcements.id`
- `complaint_box.user_id -> users.id`
- `complaint_upvotes.complaint_id -> complaint_box.id`
- `complaint_upvotes.user_id -> users.id`
- `marketplace.owner_id -> users.id`
- `lost_found.user_id -> users.id`
- `push_subscriptions.user_id -> users.id`

## Storage Buckets
- `marketplace_images`
- `lost_found_images`

The application stores the final public URL on the owning row and attempts file cleanup during owner-driven deletion flows.

## Realtime Usage
- `announcements`
- `complaint_box`
- `complaint_upvotes`
- `marketplace`
- `lost_found`
- `chat_messages` plus presence state

## RLS Intent
- `users`: users can read their own row, and directory-safe faculty/admin rows are exposed for discovery
- `student_profiles`: students can read and manage their own anonymous code row
- `faculty_profiles`: authenticated users can read directory data; faculty/admin profile writes are owner-scoped
- `announcements`: authenticated users can read; faculty-style users can write
- `complaint_box`: authenticated users can read; students can create
- `complaint_upvotes`: students can create/delete their own votes
- `marketplace`: student-only read/write surface with owner update/delete
- `lost_found`: authenticated read/write surface with owner update/delete
- `chat_messages`: student-only chat read/write surface
- `push_subscriptions`: authenticated users can store their own push subscription

## Constraints and Limits
- `users.role` is constrained to the active stored role set
- `student_profiles.session_code` is unique
- `marketplace.price` is positive and bounded
- `marketplace.contact_info` is a 10-digit string
- `complaint_upvotes` is unique per `(complaint_id, user_id)`
- faculty experience is non-negative

Posting limits enforced in the database:
- complaints: 1 every 7 days
- marketplace listings: 1 every 3 days
- lost-and-found reports: 2 every 24 hours

## Auth-Driven Database Functions
- `handle_new_auth_user()`
- `handle_auth_user_email_update()`

These functions mirror auth users into `public.users` and keep email synchronized.

## App-Level Server Actions Touching the Schema
- `addAnnouncement`
- `submitComplaint`
- `addMarketplaceItem`
- `deleteMarketplaceItem`
- `addLostFoundItem`
- `deleteLostFoundItem`
- `resolveLostFoundItem`
- `savePushSubscription`
- `sendChatMessage`

## API Routes Touching the Schema
- `GET /api/complaints`
- `POST /api/complaints/upvote`
- `POST /api/chat`

## AI/Data Integration Notes
- complaint urgency/category is generated asynchronously after insert
- announcement text can be AI-rewritten before publish
- complaint text can be AI-rewritten before submit
- lost-and-found title/description can be AI-suggested from an image
- E.C.H.O uses vector retrieval plus live Supabase data reads

## Important Accuracy Notes
- The active codebase uses `location_found` for lost-and-found records, not `location`
- The marketplace implementation expects `image_url` on listing rows
- The repo includes vector-search scaffolding, but that subsystem should still be treated as evolving compared with the rest of the CRUD feature set
