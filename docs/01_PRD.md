# Project Vision
EchoCampus is a campus web platform that brings common student and faculty workflows into one authenticated system. The implemented product focuses on announcements, faculty discovery, anonymous student interaction, complaint submission, lost and found reporting, and a student marketplace.

# Problem Statement
Campus communication and day-to-day utility workflows are often split across informal chats, notice boards, and personal contacts. The project solves that by giving students and faculty one shared platform for official updates, issue reporting, item exchange, and campus discovery.

# Goals & Objectives
- Centralize campus utility features in one web application.
- Give students a dashboard for announcements, complaints, chat, lost and found, marketplace, and directory access.
- Give faculty a controlled space to publish announcements and review complaint activity.
- Preserve student privacy through anonymous chat identities and anonymous complaint submission.
- Enforce role-based route access between student and faculty areas.

# Target Audience
- Students
- Faculty members
- Admin users who operate through the same access path as faculty

# User Roles & Permissions
- Student: can access student pages, read announcements, use anonymous chat, submit complaints, upvote complaints, browse faculty directory, create marketplace listings, mark own marketplace listings as sold, create lost and found posts, delete own lost and found posts, and view student profile details.
- Admin (Faculty): can access faculty pages, post announcements, view complaints, browse directory, create lost and found posts, delete own lost and found posts, and view faculty profile details.
- Admin: treated as faculty-like in middleware, protected routes, and profile/announcement permissions. A separate admin interface is not implemented.

# Core Features
- Role-based authentication with student and faculty/admin route separation
- Faculty announcements feed and announcement publishing
- Student complaint box with optional anonymous submission and upvoting
- Student-only marketplace with owner-controlled sold status
- Lost and found feed with posting and owner deletion
- Searchable faculty directory
- Anonymous student chat powered by Supabase Realtime
- Student and faculty profile pages

# Functional Requirements
- The application must allow users to sign up and log in with email and password through Supabase Auth.
- Faculty signup requires explicitly checking the 'I am a Faculty Member' checkbox which dynamically prompts for faculty profile data and assigns the 'admin' role.
- Student logins must generate or reuse a unique anonymous `session_code` stored in `student_profiles`.
- Unauthenticated users attempting to access `/main/*` routes must be redirected to `/auth/login`.
- Students must be blocked from faculty routes and faculty/admin users must be blocked from student routes.
- Admin (Faculty) users must be able to post announcements tied to their user account.
- Authenticated users must be able to read announcements and the faculty directory.
- Students must be able to submit one complaint at a time, with optional anonymous mode, and other students must be able to upvote complaints.
- Students must be able to create one marketplace listing within the configured posting window and mark their own listing as sold.
- Authenticated users must be able to create lost and found posts, and only the owner of a post must be able to delete it.
- Students must be able to access the anonymous chat room and send messages under their session code.
- Users must be able to open a profile page that reflects their role-specific data.

# Non-Functional Requirements
- Protected app areas rely on authenticated sessions and role validation.
- The codebase uses TypeScript with strict mode enabled.
- Core data integrity is enforced through database constraints, RLS policies, and triggers.
- Major screens are responsive and switch between stacked and multi-column layouts.
- Chat updates are delivered in real time through Supabase Realtime subscriptions.
- Form submissions provide visible loading or error feedback through alerts, inline messages, or loading spinners.

# Business Rules
- Only users with role `faculty` or `admin` can use faculty routes.
- Only users with role `student` can use student routes.
- Faculty account recognition depends on users explicitly selecting 'I am a Faculty Member' during signup which provisions them as 'admin'.
- Only mapped faculty records can create announcements.
- Students can submit only 1 complaint every 7 days.
- Students can create only 1 marketplace listing every 3 days.
- Users can create only 2 lost and found posts in 24 hours.
- Only students can create complaints and complaint upvotes.
- Only students can read and create marketplace listings.
- Only the listing owner can mark a marketplace item as sold.
- Only the lost and found post owner can delete the post.

# Assumptions

- Supabase environment variables are configured correctly in the runtime environment.
- Realtime environment variables are configured correctly for anonymous chat.
- Supabase Auth email/password is the active authentication method.
- Users access the application through a modern browser with JavaScript enabled.

# Constraints
- A separate admin dashboard is not implemented.
- Marketplace is unavailable to faculty and admin users because both routing and RLS restrict it to students.
- Lost and found image data is stored directly as text in the database instead of a dedicated storage service.
- Logging, monitoring, analytics, and deployment automation are not implemented in the repository.
- The chat feature is available only on the student side and depends on Supabase Realtime instead of Firebase.
