# Typography Reference

## Current Typography Direction
EchoCampus uses bold, high-contrast headings and compact, utility-first body text. The project favors strong section titles, small supporting copy, and uppercase micro-labels for metadata and status chips.

## Active Typography Patterns
### Page Headings
Most top-level pages use:
- `text-3xl md:text-4xl`
- `font-extrabold`
- `tracking-tight`

Examples:
- dashboards
- announcements
- complaints
- directory
- marketplace
- lost and found
- profile pages

### Section Headings
Common section heading pattern:
- `text-lg md:text-xl`
- `font-semibold`

This is used heavily in dashboard cards and feed sections.

### Body Copy
Most descriptive body copy uses:
- `text-sm`
- `text-base`
- `leading-relaxed`

### Metadata / Microcopy
Common metadata patterns include:
- `text-xs`
- `text-[11px]`
- uppercase tracking-wide labels

These appear in:
- badges
- timestamps
- inline labels
- author/category rows
- room/experience metadata

### Monospace Usage
Monospace text is intentionally used for:
- student anonymous session codes
- some small chat identity markers

## Font Wiring State
`app/globals.css` declares:
- `--font-sans: var(--font-geist-sans)`
- `--font-mono: var(--font-geist-mono)`

However, the root layout does not currently import and attach those font variables through `next/font`. As a result, the application effectively depends on browser fallback fonts unless those variables are being injected elsewhere.

## Typography Characteristics by Surface
### Landing Page
- largest display scale in the app
- aggressive `font-extrabold` usage
- wide spacing between hero copy and CTA

### Dashboards
- large heading
- smaller supportive copy
- medium-weight section labels inside cards

### Cards and Feeds
- title first
- metadata second
- descriptive text clamped for scannability

### Modals
- compact heading
- readable paragraph spacing
- lightweight metadata rows above content

## Known Current Inconsistencies
- micro text sizes vary between `text-xs`, `text-[10px]`, and `text-[11px]`
- some status chips and helper labels use arbitrary font sizes instead of a tighter shared scale
- heading weights are mostly consistent now, but not every card family uses the same type rhythm

## Practical Reference
If a doc or design discussion needs the current implementation baseline, use this:
- page heading: `text-3xl md:text-4xl font-extrabold tracking-tight`
- section heading: `text-lg md:text-xl font-semibold`
- card title: `text-sm` to `text-lg`, usually `font-semibold`
- body copy: `text-sm` or `text-base`
- metadata: `text-xs` or `text-[11px]`
