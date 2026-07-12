# Typography Audit & Standardization Plan

## 1. Current Project Overview
The following features, pages, and components have been scanned for typography usage:
- **Pages**: Landing Page, Auth (Login/Signup), Student Dashboard, Faculty Dashboard, Announcements, Complaints, Directory, Lost & Found, Marketplace, Profiles, Privacy, Terms, Error/404 Pages.
- **Shared Components**: NavBar, Footer, Modals, EmptyStates, Skeletons.
- **UI Atoms**: Button, FormInput, FormTextarea, MagicButton, GlassCard, ImageUpload.

## 2. Typography Usage Audit

### Landing Page (`app/page.tsx`)
- **Hero Title**: `text-4xl md:text-6xl lg:text-7xl tracking-tighter font-extrabold`
- **Section Heading**: `text-3xl md:text-5xl font-extrabold tracking-tight`
- **Body Text**: `text-lg md:text-xl leading-relaxed`

### Auth Pages (`app/auth/`)
- **Page Heading**: `text-3xl md:text-4xl font-extrabold tracking-tight`
- **Labels/Body**: `text-sm font-semibold`, `text-xs font-bold tracking-wider`

### App Layouts & General Pages (`app/main/`)
- **Standard Page Headings** (Dashboard, Complaints, etc.): `text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight`
- **Profile Headings**: `text-4xl font-bold font-extrabold tracking-tight` (Duplicate font weights detected)
- **Legal Pages (Privacy/Terms)**: `text-3xl font-bold`

### List Components (Cards)
- **MarketplaceList**:
  - Title: `text-xs sm:text-sm md:text-lg font-semibold`
  - Desc: `text-[10px] sm:text-xs md:text-sm leading-relaxed`
  - Price: `text-base sm:text-lg font-bold tracking-wider`
- **LostFoundList**:
  - Title: `text-xs sm:text-base md:text-lg font-semibold`
  - Desc: `text-[10px] sm:text-xs md:text-sm leading-relaxed`
  - Badge/Tiny Text: `text-[9px] sm:text-[10px] uppercase font-bold tracking-wider`
- **AnnouncementList**:
  - Title: `text-base md:text-lg font-bold`
  - Desc: `text-sm md:text-base leading-relaxed`
- **DirectoryList**:
  - Name: `text-lg font-bold`
  - Subtitle: `text-xs font-semibold tracking-wider`

### UI Components
- **Inputs/Textareas**: `text-sm font-semibold`
- **Buttons (General)**: `text-sm font-medium` or `font-semibold`
- **Modals**: `text-lg font-semibold` (Header)

## 3. Identify Inconsistencies

1. **Heading Weight Mismatch**: Profile pages use `font-bold font-extrabold` (conflicting classes), Legal pages use `font-bold`, while main dashboards use `font-extrabold`.
2. **Card Title Inconsistencies**: 
   - Directory/Announcements use `text-lg font-bold`.
   - Complaints uses `text-lg font-semibold`.
   - Marketplace/LostFound use heavy responsive ladders (`text-xs sm:text-sm md:text-lg`).
3. **Hardcoded / Arbitrary Values**: Marketplace and LostFound extensively use non-standard Tailwind values like `text-[10px]` and `text-[9px]`. This breaks accessibility and scaling rules.
4. **Subtitles/Badges**: Some use `text-xs font-semibold tracking-wider`, while others use `text-[10px] font-bold uppercase tracking-wider`.
5. **Body Text Mismatches**: Some pages use standard `text-sm`, while some cards drop to `text-[10px]` or scale up to `text-base`.

## 4. Proposed Unified Typography System

We will implement a clean, semantic typography scale using standard Tailwind tokens.

### Headings
- **Hero Heading (H1 - Landing)**: `text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter`
- **Page Heading (H1 - App)**: `text-3xl md:text-4xl font-extrabold tracking-tight`
- **Section Heading (H2)**: `text-2xl md:text-3xl font-bold tracking-tight`
- **Subsection Heading (H3)**: `text-xl font-bold tracking-tight`

### Cards
- **Card Title**: `text-base md:text-lg font-semibold text-text-primary`
- **Card Subtitle**: `text-sm font-medium text-text-secondary`
- **Card Body**: `text-sm leading-relaxed text-text-muted`

### UI Elements
- **Body Text**: `text-base leading-relaxed text-text-primary`
- **Secondary Text (Captions)**: `text-xs text-text-secondary`
- **Labels (Forms)**: `text-sm font-semibold text-text-primary`
- **Button Text**: `text-sm font-medium`
- **Input Text**: `text-sm text-text-primary`
- **Badges/Tags**: `text-[11px] font-bold uppercase tracking-wider` (The only acceptable arbitrary size, explicitly defined for micro-badges)

## 5. Migration Plan

**Checklist for Implementation Phase:**
- [ ] **Pages:** Standardize all page `H1` tags to `text-3xl md:text-4xl font-extrabold tracking-tight`. Fix Profile and Legal pages.
- [ ] **MarketplaceList.tsx:** Remove `text-[10px]` and replace with `text-xs` (badges) and `text-sm` (descriptions). Standardize titles to `text-base md:text-lg font-semibold`.
- [ ] **LostFoundList.tsx:** Standardize titles, remove `text-[9px]` in favor of the `text-[11px]` badge standard.
- [ ] **AnnouncementList.tsx:** Change `font-bold` to `font-semibold` for Card Titles to match Marketplace/Complaints.
- [ ] **DirectoryList.tsx:** Change `font-bold` to `font-semibold` for Card Titles.
- [ ] **Modals/Forms:** Ensure all `FormInput` and labels correctly apply `text-sm font-semibold`.