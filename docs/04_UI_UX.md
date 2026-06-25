# Design Principles
- Separate the student and faculty experiences visually so the role context is obvious.
- Use dashboard cards and feature-colored accents to make feature entry points easy to scan.
- Keep forms close to their related feed or list so users can act without leaving the page.
- Favor simple, direct interaction patterns over deep navigation.

# Brand Guidelines
- Brand name: EchoCampus
- Wordmark pattern: `Echo` in neutral text and `Campus` in blue accent
- Student-side visual language: dark glassmorphism surfaces with vivid feature accents
- Faculty-side visual language: light administrative surfaces with neutral cards and blue action accents

# Color System
- Student base background: slate and black gradients
- Student text: white and light slate
- Announcements accent: blue
- Marketplace accent: purple
- Complaints accent: orange
- Primary Brand / Lost and found accent: teal/emerald (used for primary CTAs like Login/Signup)
- Faculty base surfaces: white, gray, and soft blue
- Destructive action accent: red
- Success or active state accents: teal and yellow depending on feature

# Typography
- Global font stack: `Arial, Helvetica, sans-serif`
- Headings use bold or extra-bold weights
- Supporting copy uses regular to medium weight text
- Monospace styling appears for student anonymous session code and chat identity labels

# Spacing & Layout
- Main application pages commonly use `p-4`, `p-6`, or `p-8`
- Content widths commonly cap at `max-w-4xl` or `max-w-7xl`
- Auth pages dynamically use `min-h-[100dvh]` to perfectly fit the exact viewport without unwanted scrolling on mobile.
- Dashboard and feature screens use 1-column mobile layouts that expand into 2-column or 3-column grids on larger screens
- Form panels become sticky on large screens for marketplace, lost and found, and faculty announcements
- Rounded cards and panels rely heavily on `rounded-xl`, `rounded-2xl`, and `rounded-3xl`

# Design Tokens
- Implemented tokens in `app/globals.css`: `--background` and `--foreground`
- Formal shared design tokens for color scale, spacing scale, radius scale, shadows, or typography are not implemented. Project not Supported.

# Component Library
- `ProtectedRoute`
- `BaseNavBar` (Shared component used by both Student and Admin NavBars)
- `NavBarStudent` (Wrapper defining student links)
- `NavBarAdmin` (Wrapper defining admin links)
- `FooterStudent`
- `FooterAdmin`
- `AnnouncementList`
- `AnnouncementForm`
- `ComplaintList`
- `ComplaintForm`
- `MarketplaceList`
- `MarketplaceForm`
- `LostFoundList`
- `LostFoundForm`
- `DirectoryPage`

# Page Inventory
- Public pages: landing, privacy policy, terms of service
- Auth pages: login, signup
- Student pages: dashboard, announcements, anonymous chat, complaints, directory, lost and found, marketplace, profile
- Faculty/admin pages: dashboard, announcements, complaints, directory, lost and found, profile

# Page Specifications
- Landing page: hero section, login CTA, feature cards, student footer
- Login page: email/password form with password visibility toggle
- Signup page: full name, email, password, faculty checkbox, inline success/error messaging
- Student dashboard: announcement widget, marketplace widget, complaint widget, quick actions, lost and found widget
- Student announcements page: full announcement feed with search input UI
- Student chat page: full-height anonymous message feed and send bar
- Student complaint page: complaint list and complaint submission form side by side on larger screens
- Student directory page: searchable and filterable faculty directory
- Student lost and found page: searchable feed plus sticky report form
- Student marketplace page: marketplace feed plus sticky create form
- Student profile page: email, anonymous code, role label, joined date
- Faculty dashboard: complaints widget, announcements widget, lost items widget, quick navigation
- Faculty announcements page: live feed plus sticky publish form
- Faculty complaints page: complaint feed only
- Faculty directory page: same directory component as student side
- Faculty lost and found page: feed plus report form
- Faculty profile page: name, department, email, phone, cabin, experience

# Responsive Design Rules
- Major content grids collapse to a single column on small screens.
- Side forms become sticky only on large screens.
- The student and faculty navigation systems use slide-out side panels from a top bar.
- Student chat uses a dedicated full-height layout and hides the footer on that route.
- Widget versions of list components use reduced item counts and tighter card layouts.

# Loading States
- Protected routes show a full-screen access verification spinner.
- Directory shows a full-page loading spinner before data is available.
- Announcement, complaint, marketplace, and lost and found lists use `Skeleton Loaders` matching their actual card layout, wrapped in React `<Suspense>` boundaries to prevent cumulative layout shift (CLS).
- Submit buttons switch into loading states (spinners) during form actions.

# Animations & Transitions
- **Page Transitions:** All pages gently fade and slide up on enter via `framer-motion` integrated into `app/template.tsx`.
- **List Cascades:** Items in the Announcements, Marketplace, Complaints, and Lost & Found feeds load sequentially (staggered animation) to create a dynamic cascading effect.
- **Micro-Interactions:** Action buttons (e.g., Submit) slightly scale up on hover and scale down on tap to provide tactile feedback.

# Empty States
- Announcements: `No announcements yet.`
- Complaints: `No active complaints.`
- Marketplace: `No items found.`
- Lost and found: empty feed and no-search-match cards
- Directory: `No faculty members found`
- Chat: `No messages yet`

# Error States
- Login failures use toast notification popups.
- Signup failures use inline error cards and toast notifications.
- Marketplace form uses inline error messaging.
- Complaint form uses inline success and error messaging.
- Data fetching failures (e.g. lists, profiles, directory, chat) use global toast notification popups from the `sonner` library.
- Directory fetch errors additionally render a retry card.
- Unauthorized route access redirects instead of rendering an error page.
- **(Phase 6 Refinement):** Global `error.tsx` boundaries will be implemented to gracefully catch React runtime errors.

# Accessibility Guidelines
- Most form fields include visible labels.
- Action buttons generally have clear text labels and visible focus styles.
- Chat input and send button include explicit `aria-label` attributes.
- Social icon links in footers include `aria-label` attributes.
- A formal accessibility audit, keyboard interaction spec, contrast audit, and screen-reader validation process are not implemented. Project not Supported.
