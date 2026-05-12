# EchoCampus PWA TODO Plan

## Overview

- [ ] Goal
  - [ ] Convert EchoCampus into a stable installable PWA without breaking current auth, routing, role-based access, Supabase-backed features, or Firebase chat.
  - [ ] Keep the first implementation conservative: installability first, selective offline support second, push notifications last.
  - [ ] Prefer built-in Next.js App Router conventions plus a small custom service worker over a heavy plugin-first approach.

- [x] Current app audit snapshot
  - [x] This is a Next.js App Router app on `next@16` with routes under `app/`.
  - [x] Root metadata currently lives in `app/layout.tsx` and only sets `title` and `description`.
  - [x] There is no existing manifest, no service worker, no PWA install prompt, and no offline fallback page.
  - [x] `next.config.ts` is currently empty.
  - [x] `public/` only contains default SVG assets; there are no PWA icons, maskable icons, screenshots, or notification badge assets.
  - [x] Auth and role gating are handled in both `src/middleware.ts` and `src/components/ProtectedRoute.tsx`.
  - [x] Student and faculty areas are split under `app/main/student/*` and `app/main/faculty/*`.
  - [x] Supabase is the primary app/auth data source for announcements, complaints, marketplace, lost & found, directory, and profiles.
  - [x] Firebase is already used for anonymous chat in `app/main/student/chat/page.tsx`, with anonymous auth configured in `src/lib/firebase.ts`.
  - [x] Student anonymous chat identity depends on `sessionStorage` via `src/hooks/useSessionCode.ts`.
  - [x] Several feature screens read directly from Supabase on the client instead of going through same-origin route handlers:
    - [x] `src/components/announcements/AnnouncementList.tsx`
    - [x] `src/components/shared/Directory/page.tsx`
    - [x] `src/components/shared/LostFound/LostFoundList.tsx`
    - [x] `app/main/student/profile/page.tsx`
    - [x] `app/main/faculty/profile/page.tsx`
  - [x] Some feature flows use same-origin Next route handlers and should be treated as dynamic/authenticated:
    - [x] `app/api/complaints/route.ts`
    - [x] `app/api/complaints/upvote/route.ts`
    - [x] `app/api/marketplace/route.ts`
    - [x] `app/api/marketplace/sold/route.ts`
  - [x] Public pages currently safe for first-pass installability and limited offline work are:
    - [x] `app/page.tsx`
    - [x] `app/privacy/page.tsx`
    - [x] `app/terms/page.tsx`

- [ ] Guardrails for the later implementation
  - [ ] Do not cache role-protected HTML or authenticated API responses in v1.
  - [ ] Do not make `/main/*` available offline until auth/session handling is proven safe.
  - [ ] Do not cache Supabase or Firebase traffic in the first service worker version.
  - [ ] Do not add offline mutation queues for complaints, marketplace, or lost & found in v1.
  - [ ] Do not tie push subscriptions to Firebase anonymous chat auth.
  - [ ] Do not hardcode a student-only or faculty-only `start_url`.

- [ ] Likely existing files to modify later
  - [ ] `app/layout.tsx`
  - [ ] `app/globals.css`
  - [ ] `next.config.ts`
  - [ ] `src/middleware.ts`
  - [ ] `app/page.tsx`
  - [ ] `app/auth/login/page.tsx`
  - [ ] `app/auth/signup/page.tsx`
  - [ ] `src/hooks/useSessionCode.ts`
  - [ ] `src/components/NavBar/NavBarStudent.tsx`
  - [ ] `src/components/NavBar/NavBarAdmin.tsx`
  - [ ] `app/main/student/layout.tsx`
  - [ ] `app/main/faculty/layout.tsx`
  - [ ] `app/api/complaints/route.ts`
  - [ ] `app/api/marketplace/route.ts`
  - [ ] `src/lib/firebase.ts`
  - [ ] `app/main/student/chat/page.tsx`

## Phase 1: Audit Current Setup

- [ ] Reconfirm the current routing and auth boundaries before adding any PWA files
  - [ ] Trace root entry paths: `/`, `/auth/login`, `/auth/signup`, `/main/student/*`, `/main/faculty/*`.
  - [ ] Confirm that role enforcement still happens in both `src/middleware.ts` and `src/components/ProtectedRoute.tsx`.
  - [ ] Document which routes must stay online-only in v1.

- [ ] Record the current PWA blockers in implementation notes
  - [ ] No `app/manifest.ts` or `app/manifest.json`.
  - [ ] No `public/sw.js`.
  - [ ] No install UX, no standalone-mode checks, no iOS home-screen guidance.
  - [ ] No PWA icon set in `public/`.
  - [ ] No push subscription storage model.
  - [ ] No explicit service-worker cache rules for auth-sensitive screens or APIs.

- [ ] Audit storage/session assumptions that may break in an installed PWA
  - [ ] Review `src/hooks/useSessionCode.ts` because `sessionStorage` is fragile on cold reopen.
  - [ ] Review `app/auth/login/page.tsx` and `app/auth/signup/page.tsx` because they seed role/session data after login.
  - [ ] Review `src/components/NavBar/NavBarStudent.tsx` and `src/components/NavBar/NavBarAdmin.tsx` because logout clears `sessionStorage` and `localStorage` inconsistently.
  - [ ] Confirm whether the app still behaves correctly if the installed PWA is fully closed and reopened.

- [ ] Audit which data flows can never be blindly cached
  - [ ] `GET /api/complaints` is user-aware because it returns `current_user_has_upvoted`.
  - [ ] `GET /api/marketplace` changes often and sold-state must stay fresh.
  - [ ] Direct Supabase reads for announcements, directory, lost & found, and profiles should stay network-first/no-cache initially.
  - [ ] Firebase chat in `app/main/student/chat/page.tsx` is real-time and should remain online-only in v1.

- [ ] Acceptance criteria
  - [ ] There is a written route-by-route list of what is safe to cache, what is safe to pre-render, and what must remain online-only.
  - [ ] The implementation branch has a short risk note for auth cookies, role redirects, Supabase data, and Firebase chat.

## Phase 2: PWA Foundation

- [ ] Add a rollout switch before enabling any PWA behavior
  - [ ] Introduce a single feature flag such as `NEXT_PUBLIC_ENABLE_PWA`.
  - [ ] Keep service worker registration disabled by default until QA passes.
  - [ ] Make rollback possible without touching feature code or database schema.

- [ ] Create the manifest using App Router conventions
  - [ ] Add `app/manifest.ts`.
  - [ ] Set `name`, `short_name`, `description`, `display`, `background_color`, `theme_color`, and `start_url`.
  - [ ] Prefer `start_url: '/'` for the first version.
  - [ ] Do not use a role-specific `start_url` such as `/main/student/dashboard` or `/main/faculty/dashboard`.
  - [ ] Add at least `192x192`, `512x512`, and maskable icons in `public/`.
  - [ ] Decide whether to keep `app/favicon.ico` as-is or regenerate it from the same icon set.

- [ ] Extend root metadata and viewport behavior
  - [ ] Update `app/layout.tsx` to include PWA-safe metadata and viewport settings.
  - [ ] Add theme color and mobile viewport handling that matches the current dark/light surfaces.
  - [ ] Verify that manifest and icon metadata are emitted correctly in production builds.

- [ ] Prepare PWA assets and file placement
  - [ ] Add icon files under `public/` instead of inventing custom asset paths.
  - [ ] Add optional splash/screenshot assets only after the basic install flow works.
  - [ ] Add badge/icon assets for notifications later if Phase 6 is approved.

- [ ] Update middleware exclusions before enabling the manifest and worker
  - [ ] Update the `matcher` in `src/middleware.ts` so PWA assets do not trigger unnecessary auth work.
  - [ ] Exclude at minimum:
    - [ ] `/sw.js`
    - [ ] manifest output
    - [ ] icon files
    - [ ] apple-touch assets
    - [ ] notification badge assets
    - [ ] screenshot assets
  - [ ] Re-test that protected route redirects still only apply to actual app pages.

- [ ] Add service-worker-specific headers
  - [ ] Update `next.config.ts` to serve `sw.js` with `Content-Type: application/javascript` and `Cache-Control: no-cache, no-store, must-revalidate`.
  - [ ] Add any safe global security headers without changing existing auth behavior.

- [ ] Acceptance criteria
  - [ ] A production build exposes a valid manifest and icon set.
  - [ ] PWA assets are reachable without auth redirects.
  - [ ] No existing route behavior changes when the feature flag is off.

## Phase 3: Offline and Caching

- [ ] Build a conservative first service worker
  - [ ] Add `public/sw.js`.
  - [ ] Use explicit cache versioning and cleanup logic.
  - [ ] Cache same-origin static assets, icons, and low-risk public pages only.
  - [ ] Do not cache POST, PUT, PATCH, or DELETE requests.
  - [ ] Do not cache authenticated HTML responses in the first release.

- [ ] Keep high-risk app areas online-only in v1
  - [ ] Use network-only for `/auth/*`.
  - [ ] Use network-only for `/main/*`.
  - [ ] Use network-only for `/api/*`.
  - [ ] Bypass Supabase requests entirely in the service worker.
  - [ ] Bypass Firebase requests entirely in the service worker.

- [ ] Add a safe offline fallback for public routes
  - [ ] Add a lightweight offline document later, preferably a static fallback that does not depend on auth or hydrated app state.
  - [ ] Make the offline fallback available for `/`, `/privacy`, and `/terms`.
  - [ ] Do not serve a fake cached dashboard to logged-out users.
  - [ ] Do not serve student content to faculty or faculty content to students from cache.

- [ ] Revisit session persistence before any protected offline support
  - [ ] Replace or harden the `sessionStorage` dependency in `src/hooks/useSessionCode.ts`.
  - [ ] Decide whether student session code should be reloaded from Supabase on mount, mirrored into persistent storage, or both.
  - [ ] Keep the server as the source of truth for roles and auth.
  - [ ] Do not let cached client state override middleware or Supabase auth state.

- [ ] Mark specific feature flows as online-required until proven otherwise
  - [ ] Anonymous chat remains online-only because it depends on Firebase anonymous auth and Firestore live snapshots.
  - [ ] Complaint submission stays online-only; no background queue in v1.
  - [ ] Marketplace creation and "mark sold" stay online-only; no background queue in v1.
  - [ ] Lost & found creation stays online-only; the current base64 image flow is too risky for first-pass background sync.

- [ ] Audit route handlers for explicit no-store rules where useful
  - [ ] Review `app/api/complaints/route.ts`.
  - [ ] Review `app/api/complaints/upvote/route.ts`.
  - [ ] Review `app/api/marketplace/route.ts`.
  - [ ] Review `app/api/marketplace/sold/route.ts`.
  - [ ] Add explicit `Cache-Control: no-store` or dynamic config later if browser/service-worker caching could become ambiguous.

- [ ] Acceptance criteria
  - [ ] Public landing and legal pages have a tested offline fallback.
  - [ ] Protected pages never render stale cached HTML when the network is unavailable.
  - [ ] Logout/login as different users does not expose stale role-based data from cache.

## Phase 4: Installable App Setup

- [ ] Register the service worker from a client-only component
  - [ ] Add a small client component later, such as `src/components/pwa/ServiceWorkerRegistrar.tsx`.
  - [ ] Mount it from `app/layout.tsx`.
  - [ ] Only register when `NEXT_PUBLIC_ENABLE_PWA` is enabled and the browser supports service workers.
  - [ ] Avoid adding a third auth/redirection layer inside the registration logic.

- [ ] Add install UX without interrupting existing flows
  - [ ] Add an install prompt component later, such as `src/components/pwa/InstallPrompt.tsx`.
  - [ ] Use display-mode checks so the prompt disappears once the app is installed.
  - [ ] Add iOS-specific manual "Add to Home Screen" guidance because `beforeinstallprompt` is not cross-browser.
  - [ ] Prefer showing install UX on `app/page.tsx` and optionally after authenticated dashboard load.
  - [ ] Do not show the install prompt in a way that blocks login or signup.

- [ ] Validate standalone launch behavior
  - [ ] Launch the installed app from the home screen.
  - [ ] Confirm it opens to `/` and still reaches the correct student/faculty area after login.
  - [ ] Confirm direct relaunch does not trap users on a stale cached login or dashboard screen.

- [ ] Acceptance criteria
  - [ ] The app is installable on supported browsers over HTTPS.
  - [ ] Install UX works on Chromium browsers and provides sane fallback instructions on iOS.
  - [ ] Installed launches still respect current auth and role redirects.

## Phase 5: Mobile UI Improvements

- [ ] Add standalone/mobile viewport hardening
  - [ ] Update `app/globals.css` with safe-area padding helpers using `env(safe-area-inset-*)`.
  - [ ] Prefer `dvh`-based sizing where full-height app shells are used.
  - [ ] Confirm keyboard and address-bar changes do not clip chat input or footer actions.

- [ ] Review high-risk layout files for installed-mode issues
  - [ ] Review `app/main/student/layout.tsx`, especially the special-case chat layout.
  - [ ] Review `app/main/faculty/layout.tsx`, which currently uses `h-screen`.
  - [ ] Review long profile/directory pages that use `min-h-screen`.
  - [ ] Confirm sticky nav/menu overlays do not hide under device notches or OS chrome.

- [ ] Improve navigation polish for home-screen use
  - [ ] Confirm the student and faculty menu drawers still feel correct in standalone mode.
  - [ ] Confirm footer links and action buttons remain reachable above device safe areas.
  - [ ] Replace only the most problematic blocking browser dialogs later if installed-mode UX feels broken on mobile.

- [ ] Acceptance criteria
  - [ ] Student and faculty shells are usable on iOS and Android in standalone mode.
  - [ ] Chat input, nav menus, and footer actions are not clipped by safe areas or viewport resizing.
  - [ ] No page requires pinch/zoom or horizontal scrolling in installed mode.

## Phase 6: Notifications

- [ ] Choose the notification architecture that matches this repo
  - [ ] Prefer standard Web Push plus VAPID for the first implementation.
  - [ ] Store subscriptions in Supabase because user identity and roles already live there.
  - [ ] Do not use Firebase anonymous chat auth as the notification identity model.
  - [ ] Only evaluate Firebase Cloud Messaging later if the project intentionally expands Firebase beyond chat.

- [ ] Keep the server pattern consistent with the current app
  - [ ] Prefer new route handlers under `app/api/` over introducing unrelated notification infrastructure patterns.
  - [ ] Add subscribe/unsubscribe/test endpoints or equivalent server-side handlers later.
  - [ ] Add VAPID environment variables only when this phase begins.

- [ ] Define notification use cases before writing code
  - [ ] Student users: new announcements are the safest first notification target.
  - [ ] Faculty/admin users: optional confirmation or reminder notifications can come later.
  - [ ] Do not ship anonymous chat notifications in v1.
  - [ ] Do not promise complaint or marketplace notifications until a clear product rule exists.

- [ ] Add a subscription data model in Supabase
  - [ ] Create a table keyed by authenticated `user_id`.
  - [ ] Store endpoint, keys, browser metadata, role, and active status.
  - [ ] Support multiple devices per user.
  - [ ] Add a cleanup path for expired subscriptions.

- [ ] Add permission UX carefully
  - [ ] Ask for notification permission only after a clear user action.
  - [ ] Never prompt on first paint of the login page.
  - [ ] Add settings UI later so users can unsubscribe cleanly.

- [ ] Acceptance criteria
  - [ ] A logged-in user can subscribe and unsubscribe without breaking auth state.
  - [ ] Notification deep-links reopen the correct EchoCampus route and still pass role checks.
  - [ ] No notification flow depends on anonymous Firebase chat state.

## Phase 7: Testing and QA

- [ ] Run core regression checks before and after enabling PWA mode
  - [ ] Login as student.
  - [ ] Login as faculty/admin.
  - [ ] Logout from both shells.
  - [ ] Verify redirects from `src/middleware.ts`.
  - [ ] Verify client-side blocking from `src/components/ProtectedRoute.tsx`.
  - [ ] Verify public landing, privacy, and terms pages.

- [ ] Re-test every major existing feature online
  - [ ] Announcements load and faculty posting still works.
  - [ ] Complaints list, create, and upvote still work.
  - [ ] Marketplace list, create, and mark-sold still work.
  - [ ] Lost & found list, create, and delete still work.
  - [ ] Faculty directory still loads and filters.
  - [ ] Student and faculty profile pages still load.
  - [ ] Anonymous chat still authenticates anonymously, loads messages, and sends messages.

- [ ] Run PWA-specific validation
  - [ ] Confirm manifest loads correctly.
  - [ ] Confirm `sw.js` registers only when enabled.
  - [ ] Confirm cache version upgrades replace the old worker cleanly.
  - [ ] Confirm offline fallback works only where intended.
  - [ ] Confirm protected routes fail safely offline instead of showing stale private content.
  - [ ] Confirm installed relaunch does not lose role routing or produce blank shells.

- [ ] Test on real browser/platform combinations
  - [ ] Chrome on Android.
  - [ ] Safari on iOS 16.4+.
  - [ ] Desktop Chromium.
  - [ ] At least one browser with notifications disabled to confirm graceful fallback.

- [ ] Run local technical checks
  - [ ] Run `npm run build`.
  - [ ] Check browser console for service worker, cookie, CSP, and mixed-content errors.
  - [ ] Inspect the browser Application panel for manifest, service worker, and cache state.
  - [ ] Test local HTTPS when validating notifications and installability.

- [ ] Acceptance criteria
  - [ ] Core app behavior is unchanged online after PWA mode is enabled.
  - [ ] Installability, offline fallback, and service worker lifecycle are verified on target browsers.
  - [ ] There is no stale cross-user or cross-role data leak after login/logout cycles.

## Phase 8: Deployment

- [ ] Roll out behind the feature flag first
  - [ ] Keep PWA registration off in production until staging QA is complete.
  - [ ] Enable it first in a staging or preview environment with HTTPS.
  - [ ] Verify manifest and `sw.js` behavior in a real production-like build, not only dev mode.

- [ ] Prepare environment and hosting
  - [ ] Keep current Supabase and Firebase environment variables unchanged.
  - [ ] Add VAPID keys only if Phase 6 ships.
  - [ ] Confirm the host serves HTTPS and does not aggressively cache `sw.js`.
  - [ ] Confirm `next.config.ts` headers are applied in the deployed environment.

- [ ] Plan the production release window
  - [ ] Release during a low-risk period.
  - [ ] Watch for auth redirect issues immediately after rollout.
  - [ ] Watch for complaints/marketplace API failures and chat regressions.
  - [ ] Watch for install or update complaints from users already carrying an older worker version.

- [ ] Acceptance criteria
  - [ ] Production serves a valid manifest, icon set, and service worker only when the flag is enabled.
  - [ ] Auth, role-based routing, and API behavior remain stable after deployment.
  - [ ] The team has a simple rollback path ready before enabling the feature globally.

## Risks and Rollback Plan

- [ ] Known risks to protect against
  - [ ] Caching `/auth/*` can trap users in stale sessions.
  - [ ] Caching `/main/*` can leak role-specific UI across users.
  - [ ] Caching `/api/complaints` can leak stale vote state or user-specific view state.
  - [ ] Caching Supabase client reads can surface stale role/profile data after logout/login.
  - [ ] Installed relaunch can lose the student session code because it currently depends on `sessionStorage`.
  - [ ] Aggressive offline support can break Firebase chat expectations.
  - [ ] Service worker scope mistakes can interfere with future routing or asset delivery.

- [ ] Rollback checklist
  - [ ] Disable PWA registration via the single feature flag.
  - [ ] Ship a no-op or cleanup service worker if a worker is already in the wild.
  - [ ] Clear versioned caches during rollback.
  - [ ] Keep `sw.js` served with no-cache headers so rollback reaches clients quickly.
  - [ ] Re-test login, logout, student/faculty redirects, complaints, marketplace, lost & found, announcements, directory, profiles, and chat immediately after rollback.

- [ ] Final acceptance criteria for the whole migration
  - [ ] EchoCampus becomes installable without introducing stale auth or role-based routing bugs.
  - [ ] Public offline behavior is helpful, while protected online-only behavior fails safely.
  - [ ] Notification support, if added, uses authenticated user identity from Supabase rather than anonymous chat identity.
  - [ ] The PWA can be turned off cleanly without schema loss, broken routes, or lingering cached private content.
