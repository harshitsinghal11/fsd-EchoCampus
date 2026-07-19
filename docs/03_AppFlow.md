# Application Flow

## Route Map
- Public
  - `/`
  - `/privacy`
  - `/terms`
- Auth
  - `/auth/login`
  - `/auth/signup`
- Student
  - `/main/student/dashboard`
  - `/main/student/announcements`
  - `/main/student/chat`
  - `/main/student/complaint`
  - `/main/student/directory`
  - `/main/student/lost-found`
  - `/main/student/marketplace`
  - `/main/student/profile`
- Faculty-style
  - `/main/faculty/dashboard`
  - `/main/faculty/announcements`
  - `/main/faculty/complaints`
  - `/main/faculty/directory`
  - `/main/faculty/lost-found`
  - `/main/faculty/profile`

## Entry Flow
1. A user lands on `/`
2. `CheckAuthRedirect` checks for an active Supabase session
3. If a valid session exists, the user is redirected to the correct dashboard
4. Otherwise the user stays on the public landing page and can move to login or signup

## Signup Flow
1. User opens `/auth/signup`
2. User enters full name, email, password, and optionally enables faculty mode
3. If faculty mode is enabled:
   - the form collects department, cabin number, phone number, experience, and faculty access code
   - `verifyFacultyCode` validates the entered secret against `FACULTY_SECRET_CODE`
4. `supabase.auth.signUp` is called with metadata
5. Supabase trigger `handle_new_auth_user()` mirrors the auth identity into `public.users`
6. If the role is faculty-style, the same trigger also inserts the row into `faculty_profiles`
7. If Supabase returns an immediate session:
   - the app verifies the user row
   - resolves the role
   - generates or restores a student `session_code` if needed
   - redirects to the student or faculty dashboard
8. If email confirmation is required, the UI shows a confirmation message and the user returns later through login

## Login Flow
1. User opens `/auth/login`
2. The page first checks `sessionStorage` for `userRole`
3. If local session hints are missing, the page checks `supabase.auth.getSession()`
4. On submit, the app calls `supabase.auth.signInWithPassword`
5. `ensureOwnUserRow()` verifies that the mirrored `public.users` record exists
6. `fetchUserRole()` resolves the app role
7. If the user is a student:
   - `ensureStudentSessionCode()` creates or restores `student_profiles.session_code`
   - `userRole` and `userSessionCode` are stored in `sessionStorage`
   - redirect to `/main/student/dashboard`
8. If the user is faculty-style:
   - `userRole` is stored in `sessionStorage`
   - redirect to `/main/faculty/dashboard`

## Protected App Flow
1. Any request to `/main/*` hits `src/middleware.ts`
2. Middleware checks auth state through a Supabase server client
3. Unauthenticated users are redirected to `/auth/login`
4. Authenticated users have their role resolved from metadata or `public.users`
5. Students trying to open faculty pages are redirected to the student dashboard
6. Faculty-style users trying to open student pages are redirected to the faculty dashboard
7. The corresponding root layout repeats the role validation before rendering the route tree

## Student Navigation Flow
- Dashboard -> announcements, chat, complaints, directory, lost and found, marketplace, profile
- Mobile uses a bottom navigation with an additional "More" sheet
- Desktop uses a top bar with a right-side slide-out navigation panel

## Faculty Navigation Flow
- Dashboard -> announcements, complaints, directory, lost and found, profile
- Shares the same shell components, but with faculty route targets

## Announcement Flow
1. Faculty-style user opens the announcement center
2. The announcement feed is loaded with `useAnnouncements`
3. User opens the floating action button modal
4. User optionally runs AI rewrite assistance through `enhanceAnnouncement`
5. `addAnnouncement` validates data with Zod
6. The announcement is inserted into `announcements`
7. A push notification broadcast is triggered
8. Realtime invalidation refreshes the announcement feed for active users

## Complaint Flow
1. Student opens `/main/student/complaint`
2. Existing complaints are loaded from `/api/complaints`
3. Student writes a complaint and can optionally run `enhanceComplaint`
4. `submitComplaint` validates the payload and inserts a complaint row immediately
5. The inserted row starts with a transitional AI-processing state (`urgency`/`category` still settling)
6. A background task classifies urgency and category with Gemini
7. If urgency resolves to `HIGH`, a push notification broadcast is sent
8. Revalidation and realtime updates refresh student and faculty complaint views

## Complaint Voting Flow
1. Student presses the vote button in a complaint card or complaint modal
2. The UI applies an optimistic count update
3. `POST /api/complaints/upvote` toggles the vote row in `complaint_upvotes`
4. SWR revalidates and Supabase realtime also keeps the list in sync

## Marketplace Flow
1. Student opens `/main/student/marketplace`
2. `useMarketplace` loads listings ordered by `created_at DESC`
3. User opens the floating action button modal
4. Optional image upload is stored in the `marketplace_images` bucket
5. `addMarketplaceItem` validates the payload and inserts the listing
6. Listing cards can be opened in a detail modal
7. The owner can mark an item sold or active
8. The owner can delete the listing, which also attempts to remove the image file

## Lost and Found Flow
1. User opens `/main/*/lost-found`
2. `useLostFound` loads the latest reports
3. User opens the floating action button modal
4. Optional image upload is stored in the `lost_found_images` bucket
5. User can run `analyzeLostItem` to auto-fill title and description from the uploaded image
6. `addLostFoundItem` validates and inserts the row
7. The owner can later mark the item resolved or active
8. The owner can delete the report, which also attempts to remove the uploaded file

## Directory Flow
1. User opens the directory page
2. `useDirectory` loads `users` joined with `faculty_profiles`
3. Search filters by faculty name
4. A department dropdown filters the in-memory result set

## Anonymous Global Chat Flow
1. Student opens `/main/student/chat`
2. The page fetches the latest 500 chat messages
3. A realtime channel subscribes to:
   - `chat_messages` inserts
   - presence sync updates
4. Presence data drives the participant panel and online counters
5. Message send uses `sendChatMessage`
6. The Server Action performs AI toxicity screening before inserting the message
7. The UI uses optimistic messages and then reconciles them with the inserted row
8. Chat activity can trigger a push notification if the cooldown window allows it

## E.C.H.O Assistant Flow
1. User opens the floating E.C.H.O widget from any non-chat route
2. The widget posts the prompt to `/api/chat`
3. The API:
   - generates an embedding
   - searches `campus_knowledge` through `match_campus_knowledge`
   - fetches selected live marketplace, lost-and-found, announcement, complaint, and directory data
   - constructs a bounded system prompt
   - streams the Gemini response back to the client
4. The widget renders the streamed answer incrementally

## Push Notification Flow
1. `NotificationManager` registers the service worker
2. If PushManager is supported and the user is not already subscribed, the floating subscribe button appears
3. User grants browser notification permission
4. Browser subscription data is sent to `savePushSubscription`
5. The subscription is upserted into `push_subscriptions`
6. Server actions can broadcast notifications through `web-push`

## PWA Flow
- Manifest metadata is exposed from `public/manifest.json`
- `app/sw.ts` provides runtime caching plus push/notification-click handling
- The service worker is enabled outside development mode
