# Product Requirements Document

## Product Summary
EchoCampus is a campus utility platform for students and faculty-style users. It centralizes communication, anonymous participation, lightweight commerce, item recovery, discovery of faculty details, and AI-assisted support inside one authenticated web app.

## Primary Product Goals
- Reduce fragmentation between notices, complaints, peer communication, and campus utility workflows
- Give students one place for announcements, complaints, anonymous chat, directory search, marketplace usage, and lost-and-found reporting
- Give faculty-style users one place to publish updates, monitor complaints, and stay aware of campus activity
- Preserve student identity where anonymity is intentional
- Enforce route-level and database-level separation between student-only and faculty-style capabilities

## User Segments
- Students
- Faculty members
- Admin users who currently share the same product path and permissions model as faculty

## Role Model
- `student`
  - Can access all student routes
  - Can participate in anonymous chat
  - Can submit and vote on complaints
  - Can use the marketplace
  - Can browse announcements, directory, and lost-and-found content
- `admin`
  - Represents the current faculty-style role written by signup
  - Can access all faculty routes
  - Can publish announcements
  - Can review complaints
  - Can use directory and lost-and-found features
- `faculty`
  - Treated as a legacy-compatible alias in some frontend guards
  - Not created by the current signup flow, which provisions faculty as `admin`

## Core User-Facing Features
- Role-based login and signup using Supabase Auth
- Faculty access-code validation during signup
- Student and faculty dashboards
- Announcement publishing and browsing
- Complaint submission with optional anonymity
- Complaint voting
- AI complaint enhancement and AI urgency/category analysis
- Faculty AI complaint summary widget
- Anonymous student global chat with live presence
- Student marketplace with image uploads
- Lost-and-found reporting with image uploads and AI autofill from image analysis
- Searchable faculty directory
- Student and faculty profile pages
- Push notifications and PWA installability
- Embedded E.C.H.O AI assistant widget

## Functional Requirements
- Users must be able to sign up and log in with email/password through Supabase Auth
- Faculty-style signup must require a valid `FACULTY_SECRET_CODE`
- Faculty-style signup must collect department, cabin number, phone, and experience metadata
- Student sessions must generate or recover a `session_code` in `student_profiles`
- Unauthenticated users trying to access `/main/*` routes must be redirected to `/auth/login`
- Student users must be blocked from faculty routes
- Faculty-style users must be blocked from student routes
- Faculty-style users must be able to publish announcements with optional external links
- Students must be able to submit complaints with optional anonymity
- Complaint records must be inserted immediately, then enriched asynchronously with AI urgency/category metadata
- Students must be able to vote on complaints
- Students must be able to create marketplace listings, upload optional images, mark their own items as sold, and delete their own items
- Authenticated users must be able to create lost-and-found reports, upload optional images, mark their own reports as resolved, and delete their own reports
- Students must be able to access the anonymous global chat and send messages under their anonymous session code
- The product must provide an embedded AI assistant experience via the E.C.H.O widget
- Authenticated users must be able to opt into push notifications from supported browsers

## Business Rules
- Current persisted role values are `student` and `admin`
- Only faculty-style users (`admin`, plus legacy `faculty` handling in route guards) can access faculty pages
- Only students can access marketplace and anonymous chat
- Only students can submit complaint votes
- Complaint posting is limited to 1 complaint every 7 days per student
- Marketplace posting is limited to 1 listing every 3 days per student
- Lost-and-found posting is limited to 2 reports every 24 hours per user
- Only the creator of a marketplace listing can mark it sold or delete it
- Only the creator of a lost-and-found report can resolve or delete it
- High-urgency complaints can trigger push notifications to subscribed users

## Non-Functional Requirements
- The application must remain responsive across mobile and desktop layouts
- Protected routes must be enforced on both request-time and render-time boundaries
- Database integrity must rely on RLS, constraints, and triggers, not only client validation
- Realtime feeds should update without full page reloads
- AI-assisted workflows must fail gracefully when Gemini or network operations are unavailable
- Browser push flows must degrade safely when service workers or PushManager are unsupported

## Out of Scope / Current Constraints
- There is no dedicated super-admin product surface
- There is no automated moderation dashboard or audit-log UI
- There is no formal payments flow for marketplace activity
- There is no CI/CD pipeline or automated deployment workflow in the repository
- There is no test suite in the repository at the moment

## Product Status Notes
- Announcements, complaints, marketplace, lost and found, directory, profiles, push notifications, and anonymous chat are active implementation areas
- E.C.H.O is implemented as an embedded widget and streaming API path, but its vector-knowledge pipeline should still be treated as an evolving subsystem
