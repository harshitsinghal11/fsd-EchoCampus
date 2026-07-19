# UI / UX Reference

## Current Visual Direction
EchoCampus currently ships as a dark, high-contrast interface shared by both student and faculty areas. The design language is built around neutral zinc surfaces, an emerald primary accent, dense card-based layouts, modal-heavy actions, and motion-enhanced list rendering.

This means the earlier "student dark / faculty light" split no longer reflects the codebase. Both role experiences now live inside the same dark shell.

## Design Principles Visible in the Current Build
- One shared app shell across roles
- Card-first feature presentation
- Mobile-first layouts that expand to multi-column sections on larger screens
- Floating action buttons for create/report flows
- Inline search and quick filtering on list-heavy screens
- Modal expansion for viewing full content without route changes
- Realtime-feeling feedback through optimistic updates, toasts, and animated entrances

## Theme Tokens in `app/globals.css`
### Foundation
- `--background: #09090b`
- `--foreground: #fafafa`
- `--color-surface: #18181b`
- `--color-surface-hover: #27272a`
- `--color-border: #27272a`

### Typography
- `--color-text-primary: #fafafa`
- `--color-text-secondary: #d4d4d8`
- `--color-text-muted: #a1a1aa`
- `--color-text-disabled: #71717a`

### Brand / Semantic
- `--color-primary: #10b981`
- `--color-primary-hover: #059669`
- `--color-primary-light: #34d399`
- `--color-success: #10b981`
- `--color-warning: #f59e0b`
- `--color-danger: #ef4444`
- `--color-info: #0ea5e9`

### Buttons / Inputs
- `--color-button-primary: #10b981`
- `--color-button-secondary: #27272a`
- `--color-button-ghost: transparent`
- `--color-input-background: #18181b`
- `--color-input-border: #27272a`
- `--color-input-focus: #10b981`

## PWA Color Metadata
The web app manifest currently uses:
- `background_color: #020617`
- `theme_color: #0d9488`

Those values are close to the main UI palette but are not identical to the primary accent token in `globals.css`.

## Typography System
- Headings primarily use `text-3xl md:text-4xl font-extrabold tracking-tight`
- Card titles are mostly `text-base` or `text-lg` with `font-semibold`
- Body copy is generally `text-sm` or `text-base`
- Metadata and badges often use uppercase micro text such as `text-[11px]`
- Student anonymous IDs and some chat labels use mono styling

### Current Font Wiring Note
`app/globals.css` defines `--font-sans` and `--font-mono` as custom-property wrappers around Geist variables, but the root layout does not import or inject Next font variables. In practice, the UI currently depends on browser fallback fonts unless those variables are defined elsewhere.

## Layout Patterns
- App pages commonly use `max-w-7xl mx-auto`
- Public legal pages use `max-w-4xl`
- Main content padding usually falls in the `p-4 / md:p-6 / lg:p-8` range
- Dashboard cards use responsive grid compositions
- Chat uses a full-height split layout with a participant sidebar on large screens
- Bottom navigation is mobile-only
- Footer is hidden on the student chat route

## Interaction Patterns
- Announcements, marketplace, complaints, and lost-and-found items open inside shared modal shells
- Search bars are reused across announcements, complaints, directory, marketplace, and lost and found
- Floating action buttons open compose/report modals for announcements, marketplace, and lost and found
- Complaint votes use optimistic UI updates
- Chat messages use optimistic UI updates plus realtime reconciliation
- Push opt-in appears as a floating bell button when the browser supports it

## Motion Patterns
- Student and faculty route templates fade and slide in
- Shared list wrappers (`MotionList`, `MotionItem`) stagger item entrances
- FABs and buttons use hover/tap scaling
- Empty states, not-found, error, chat overlays, and assistant UI also add motion on mount/open

## Major Screens
- Public landing page
- Login and signup
- Student dashboard
- Faculty dashboard
- Announcements center
- Complaints
- Anonymous global chat
- Directory
- Lost and found
- Marketplace
- Student profile
- Faculty profile
- Privacy policy
- Terms of service
- Error and 404 states

## Shared Components That Shape the Experience
- `Button`
- `FormInput`
- `FormTextarea`
- `ImageUpload`
- `Modal`
- `MagicButton`
- `GlassCard`
- `SearchBar`
- `EmptyStates`
- `Skeletons`
- `AppNavbar`
- `AppBottomNav`
- `AppFooter`
- `EchoWidget`

## Current UX Characteristics
- High action density, especially on dashboards and list screens
- Frequent card reuse with minor per-feature variations
- Strong reliance on iconography for feature framing
- Consistent toast-based feedback through Sonner
- Realtime freshness across most list surfaces
- Modal-driven detail views rather than detail pages

## Known Documentation Boundary
This file reflects the UI that is implemented today. A deeper quality critique and polish backlog now lives in the root-level `polish.md`.
