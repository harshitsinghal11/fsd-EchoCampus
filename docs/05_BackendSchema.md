# Database Overview
- Primary relational backend: Supabase Postgres
- Authentication source: Supabase Auth
- Realtime chat backend: Supabase Realtime
- Supabase stores user identity, profiles, faculty records, announcements, complaints, marketplace data, lost and found data, and anonymous chat messages.

# ER Diagram
```text
auth.users
  -> public.users
       -> public.student_profiles
       -> public.faculty_profiles
       -> public.complaint_box
       -> public.complaint_upvotes
       -> public.marketplace
       -> public.lost_found
       -> public.announcements
       -> public.chat_messages

public.complaint_box
  -> public.complaint_upvotes
```

# Tables
- `public.users`: public application user record with `id`, `email`, `full_name`, `role`, and `created_at`
- `public.student_profiles`: student-only profile record keyed by `user_id`, storing `session_code`
- `public.faculty_profiles`: faculty-only profile record keyed by `user_id`, storing department, phone, cabin, and experience
- `public.announcements`: faculty-authored announcements linked to `users.id` through `author_id`
- `public.complaint_box`: complaint records with `user_id`, `content`, `is_anonymous`, and `created_at`
- `public.complaint_upvotes`: one-row-per-user-per-complaint vote table
- `public.marketplace`: student marketplace listings with owner data, price, contact info, sold state, and timestamps
- `public.lost_found`: lost and found records with owner, title, description, location, contact info, image data, resolve flag, and timestamp
- `public.chat_messages`: Supabase table with `id`, `random_code`, `message`, and `created_at`

# Relationships
- `users.id` references `auth.users.id`
- `student_profiles.user_id` references `users.id`
- `faculty_profiles.user_id` references `users.id`
- `announcements.author_id` references `users.id`
- `complaint_box.user_id` references `users.id`
- `complaint_upvotes.complaint_id` references `complaint_box.id`
- `complaint_upvotes.user_id` references `users.id`
- `marketplace.owner_id` references `users.id`
- `lost_found.user_id` references `users.id`

# Constraints
- `users.role` must be `student` or `admin`
- `users.email` is unique and required
- `student_profiles.session_code` is unique
- `faculty_profiles.experience_years` must be `>= 0`
- `complaint_upvotes` enforces `unique (complaint_id, user_id)`
- `marketplace.price` must be greater than `0` and less than or equal to `99999`
- `marketplace.contact_info` must match a 10-digit numeric format

# Indexes
- `idx_users_role`
- `idx_student_profiles_session_code`
- `idx_faculty_profiles_department`
- `idx_announcements_created_at`
- `idx_announcements_author`
- `idx_complaint_box_created_at`
- `idx_complaint_box_user`
- `idx_complaint_upvotes_complaint`
- `idx_complaint_upvotes_user`
- `idx_marketplace_created_at`
- `idx_marketplace_owner`
- `idx_marketplace_is_sold`
- `idx_lost_found_created_at`
- `idx_lost_found_user`

# RLS Policies
- `users`: authenticated users can select their own row AND any row where `role = 'admin'` (for the directory); authenticated users can insert only their own row with matching auth email and valid role rules; no direct client update policy exists
- `student_profiles`: authenticated users can read profiles, insert their own row, and update their own row
- `faculty_profiles`: authenticated users can select all rows (for the directory); admin users can insert, and update only their own row
- `announcements`: authenticated users can read all rows; only users with role `admin` can insert
- `complaint_box`: authenticated users can read all complaints; only students can insert their own complaints
- `complaint_upvotes`: authenticated users can read all votes; only students can insert their own votes and any authenticated user can delete only their own vote row
- `marketplace`: only students can read and insert marketplace rows; only the owner can update a row
- `lost_found`: authenticated users can read all rows, insert only their own rows, and delete only their own rows
- `chat_messages`: anyone can select, but only authenticated users can insert (anonymous inserts rely on session_code instead of user_id linking)

# Triggers
- `enforce_lost_found_limit`: blocks more than 2 lost and found posts per user in 24 hours
- `enforce_complaint_limit`: blocks more than 1 complaint per user in 7 days
- `enforce_marketplace_limit`: blocks more than 1 marketplace listing per user in 3 days
- `on_auth_user_created`: copies auth user data and extracts `role` and faculty profile data from metadata into `public.users` and `public.faculty_profiles`
- `on_auth_user_email_updated`: syncs updated auth email into `public.users`

# Functions
- `check_lost_found_limit()`: trigger function for lost and found rate limiting
- `check_complaint_limit()`: trigger function for complaint rate limiting
- `check_marketplace_limit()`: trigger function for marketplace rate limiting
- `handle_new_auth_user()`: dynamically extracts `role` from signup metadata and inserts user into `public.users`. If role is `admin`, it automatically extracts profile metadata and inserts into `public.faculty_profiles`
- `handle_auth_user_email_update()`: sync function for auth email changes

# Storage Structure
The repository implements Supabase Storage for object storage workflows. Lost and found images are securely uploaded to the `lost_found_images` storage bucket, and their public URLs are stored in `public.lost_found.image_url`. Orphaned images are securely cleaned up via Server Actions upon row deletion.

# API Models
- `GET /api/complaints` -> `{ complaints: [{ id, complaint, created_at, session_code, author_id, upvotes, current_user_has_upvoted }] }`
- `POST /api/complaints` body -> `{ complaint: string, isAnonymous: boolean }`
- `POST /api/complaints/upvote` body -> `{ complaintId: string }`
- `POST /api/complaints/upvote` response -> `{ message, added, current_user_has_upvoted }`
- `GET /api/marketplace` -> `{ listings: [{ id, owner_id, owner_name, owner_email, product_title, description, price, contact_info, is_sold, created_at }] }`
- `POST /api/marketplace` body -> `{ product_title, description, price, owner_name, contact_info }`
- `POST /api/marketplace/sold` body -> `{ id: string }`

# Audit Strategy
The repository does not implement audit tables, change history, moderation logs, or actor-based event tracking.

