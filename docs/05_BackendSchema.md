# Database Overview
- Primary relational backend: Supabase Postgres
- Authentication source: Supabase Auth
- Realtime chat backend: Firebase Firestore
- Supabase stores user identity, profiles, faculty directory records, announcements, complaints, marketplace data, and lost and found data.
- Firestore stores anonymous chat messages in the `chat_messages` collection.

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
       -> public.faculty_users

public.directory
  -> public.faculty_users
  -> public.announcements

public.complaint_box
  -> public.complaint_upvotes
```

# Tables
- `public.users`: public application user record with `id`, `email`, `full_name`, `role`, and `created_at`
- `public.student_profiles`: student-only profile record keyed by `user_id`, storing `session_code`
- `public.faculty_profiles`: faculty-only profile record keyed by `user_id`, storing department, phone, cabin, and experience
- `public.directory`: seeded faculty directory with name, email, department, phone, cabin, experience, and date of birth
- `public.faculty_users`: mapping table between authenticated users and faculty directory records
- `public.announcements`: faculty-authored announcements linked to `directory.id` through `author_id`
- `public.complaint_box`: complaint records with `user_id`, `content`, `is_anonymous`, and `created_at`
- `public.complaint_upvotes`: one-row-per-user-per-complaint vote table
- `public.marketplace`: student marketplace listings with owner data, price, contact info, sold state, and timestamps
- `public.lost_found`: lost and found records with owner, title, description, location, contact info, image data, resolve flag, and timestamp
- `firebase.chat_messages`: Firestore collection with `random_code`, `message`, `createdAt`, and `expiresAt`

# Relationships
- `users.id` references `auth.users.id`
- `student_profiles.user_id` references `users.id`
- `faculty_profiles.user_id` references `users.id`
- `faculty_users.user_id` references `users.id`
- `faculty_users.faculty_id` references `directory.id`
- `announcements.author_id` references `directory.id`
- `complaint_box.user_id` references `users.id`
- `complaint_upvotes.complaint_id` references `complaint_box.id`
- `complaint_upvotes.user_id` references `users.id`
- `marketplace.owner_id` references `users.id`
- `lost_found.user_id` references `users.id`

# Constraints
- `users.role` must be `student`, `faculty`, or `admin`
- `users.email` is unique and required
- `student_profiles.session_code` is unique
- `faculty_profiles.experience_years` must be `>= 0`
- `directory.email` is unique and required
- `directory.experience` must be `>= 0`
- `complaint_upvotes` enforces `unique (complaint_id, user_id)`
- `marketplace.price` must be greater than `0` and less than or equal to `99999`
- `marketplace.contact_info` must match a 10-digit numeric format
- `faculty_users.user_id` is unique
- `faculty_users.faculty_id` is unique

# Indexes
- `idx_users_role`
- `idx_student_profiles_session_code`
- `idx_faculty_profiles_department`
- `idx_directory_name`
- `idx_directory_department`
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
- `users`: authenticated users can select only their own row and insert only their own row with matching auth email and valid role rules; no direct client update policy exists
- `student_profiles`: authenticated users can read profiles, insert their own row, and update their own row
- `faculty_profiles`: faculty/admin users can select, insert, and update only their own row
- `faculty_users`: faculty/admin users can select their own mapping and insert a mapping only when their auth email matches the linked directory record
- `directory`: authenticated users can read all rows
- `announcements`: authenticated users can read all rows; only mapped faculty users can insert
- `complaint_box`: authenticated users can read all complaints; only students can insert their own complaints
- `complaint_upvotes`: authenticated users can read all votes; only students can insert their own votes and any authenticated user can delete only their own vote row
- `marketplace`: only students can read and insert marketplace rows; only the owner can update a row
- `lost_found`: authenticated users can read all rows, insert only their own rows, and delete only their own rows

# Triggers
- `enforce_lost_found_limit`: blocks more than 2 lost and found posts per user in 24 hours
- `enforce_complaint_limit`: blocks more than 1 complaint per user in 7 days
- `enforce_marketplace_limit`: blocks more than 1 marketplace listing per user in 3 days
- `on_auth_user_created`: copies auth user data into `public.users` and creates faculty mappings when directory data matches
- `on_auth_user_email_updated`: syncs updated auth email into `public.users`

# Functions
- `is_faculty_email(input_email text)`: checks whether an email exists in the faculty directory
- `check_lost_found_limit()`: trigger function for lost and found rate limiting
- `check_complaint_limit()`: trigger function for complaint rate limiting
- `check_marketplace_limit()`: trigger function for marketplace rate limiting
- `handle_new_auth_user()`: bootstrap and sync function for newly created auth users
- `handle_auth_user_email_update()`: sync function for auth email changes

# Storage Structure
Project not Supported. The repository does not implement Supabase Storage, Firebase Storage, or any other object storage workflow. Lost and found images are stored directly in `public.lost_found.image_url` as text data.

# API Models
- `GET /api/complaints` -> `{ complaints: [{ id, complaint, created_at, session_code, author_id, upvotes, current_user_has_upvoted }] }`
- `POST /api/complaints` body -> `{ complaint: string, isAnonymous: boolean }`
- `POST /api/complaints/upvote` body -> `{ complaintId: string }`
- `POST /api/complaints/upvote` response -> `{ message, added, current_user_has_upvoted }`
- `GET /api/marketplace` -> `{ listings: [{ id, owner_id, owner_name, owner_email, product_title, description, price, contact_info, is_sold, created_at }] }`
- `POST /api/marketplace` body -> `{ product_title, description, price, owner_name, contact_info }`
- `POST /api/marketplace/sold` body -> `{ id: string }`

# Audit Strategy
Project not Supported. The repository does not implement audit tables, change history, moderation logs, or actor-based event tracking.
