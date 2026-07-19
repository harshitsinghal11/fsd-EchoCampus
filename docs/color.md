# EchoCampus Color Reference

## Current Color Strategy
EchoCampus currently uses a dark neutral foundation with a single strong emerald primary accent and a small semantic palette for warning, danger, and info states.

The implementation has largely moved away from feature-specific color families. Most product areas now rely on the same shared token set.

## Core Tokens from `app/globals.css`
### Base
- `background`: `#09090b`
- `surface`: `#18181b`
- `surface-hover`: `#27272a`
- `border`: `#27272a`

### Text
- `text-primary`: `#fafafa`
- `text-secondary`: `#d4d4d8`
- `text-muted`: `#a1a1aa`
- `text-disabled`: `#71717a`

### Brand
- `primary`: `#10b981`
- `primary-hover`: `#059669`
- `primary-light`: `#34d399`

### Semantic
- `success`: `#10b981`
- `warning`: `#f59e0b`
- `danger`: `#ef4444`
- `info`: `#0ea5e9`

### Buttons / Inputs
- `button-primary`: `#10b981`
- `button-secondary`: `#27272a`
- `button-ghost`: `transparent`
- `input-background`: `#18181b`
- `input-border`: `#27272a`
- `input-focus`: `#10b981`

## Where Colors Show Up
### Primary Accent
Used for:
- wordmark highlight (`Campus`)
- major CTAs
- floating action buttons
- active badges
- focus rings
- chat self-message bubbles
- push-subscribe button

### Neutral Surfaces
Used for:
- layout shells
- cards
- modals
- nav bars
- dropdowns
- empty states

### Semantic Colors
Used for:
- danger/error fallback states
- urgency labels
- destructive actions
- notification and insight emphasis

## Manifest Colors
`public/manifest.json` currently uses:
- `background_color: #020617`
- `theme_color: #0d9488`

These are close to the main runtime palette but not exactly the same as the `background` and `primary` tokens defined in CSS.

## Practical Usage Rules Reflected in the Repo
- Backgrounds are mostly zinc/near-black
- Primary actions are emerald
- Borders are subtle and low-contrast
- Status colors are used sparingly compared with the neutral base
- Feature sections are separated more by iconography and content than by distinct feature palettes

## Current State Summary
The live implementation is much more unified than the older docs implied:
- no faculty light theme
- no strong per-feature color families
- one shared dark system for both major user roles
