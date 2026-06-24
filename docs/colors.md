# EchoCampus UI Color Schema

This document defines the official, consistent color palette to be used across the entire EchoCampus platform. Following this schema ensures that the UI looks highly professional, cohesive, and visually stunning. 

We are adopting a **modern dark theme** by default, using Tailwind CSS colors.

## 1. Backgrounds & Surfaces
To create depth and hierarchy, we use a dark slate background with slightly lighter, semi-transparent overlays for cards and modals.

- **App Background (`bg-slate-950`):** The absolute bottom layer of the application (e.g., `#020617`).
- **Primary Card/Surface (`bg-slate-900/50` or `bg-slate-900/40`):** Used for standard containers, lists, and forms. Accompanied by a subtle blur `backdrop-blur-xl`.
- **Hover States (`hover:bg-slate-800/60`):** For interactive cards or rows to provide tactile feedback.
- **Borders (`border-slate-700/50`):** Used to softly define edges of cards and inputs without harsh contrast.

## 2. Text & Typography
Text needs high contrast for readability, using shades of gray/slate, while keeping primary actions distinct.

- **Primary Heading (`text-white`):** Main titles, module headers, and primary data points.
- **Secondary Text (`text-slate-300`):** Standard paragraph text, labels, and descriptions.
- **Muted/Helper Text (`text-slate-400` or `text-slate-500`):** Subtitles, timestamps, and placeholder text inside inputs.

## 3. Brand Accents & Actions
Different features get specific accent colors to help users subconsciously distinguish between modules, while maintaining a premium feel.

- **Primary Brand (Teal/Emerald) — Used in Lost & Found, Primary Buttons:**
  - `text-teal-400` / `text-teal-500` for icons and highlights.
  - `bg-gradient-to-r from-teal-600 to-emerald-600` for primary CTA buttons.
  - `focus:ring-teal-500/50` for inputs.

- **Marketplace Accent (Purple/Blue):**
  - `text-purple-400` for icons and highlights.
  - `bg-gradient-to-r from-purple-600 to-blue-600` for submit buttons.
  
- **Complaints Accent (Orange/Amber):**
  - `text-orange-400` for icons and upvotes.
  - `bg-orange-500/20` for active states.

- **Announcements Accent (Blue/Indigo):**
  - `text-blue-400` for links and accents.
  - `bg-blue-600` for buttons.

## 4. Status Colors (Feedback & Validation)
Standard semantic colors used in Sonner toasts, forms, and badges.

- **Success (`text-teal-400` / `bg-teal-500/10`):** Successful operations, item found, account created.
- **Error/Destructive (`text-red-400` / `bg-red-500/10`):** Form errors, destructive actions (Delete post).
- **Warning (`text-amber-400`):** Soft warnings or limits reached.
- **Information (`text-blue-400`):** Informational banners.

## 5. UI Spacing & Gap Principles
To fix the "unfinished" or "wide gap" issues, we will standardize padding and margins:
- **Page Wrapper:** Standard `p-4 md:p-8` (padding) and `max-w-7xl mx-auto` (centering).
- **Cards/Forms:** Internal padding of `p-6` or `p-8`.
- **Element Spacing:** Consistent `space-y-4` or `space-y-5` between form fields.
- **Flex/Grid Gaps:** `gap-4` or `gap-6` between columns, never arbitrary large values.

---
**Next Step:** Apply these classes strictly to both Student and Faculty (Admin) layouts so they look identical, then refactor individual components to align with this schema.
