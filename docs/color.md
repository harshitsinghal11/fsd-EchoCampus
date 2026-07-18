# EchoCampus UI Color System
## Design Philosophy

EchoCampus should feel like one cohesive product rather than multiple
mini-applications.

### Core Principles

-   85% Neutral colors
-   10% Brand color
-   5% Semantic colors
-   One brand color across the entire application.
-   Do not assign colors to individual features.
-   Gradients should be avoided except where absolutely necessary.
-   Every color should communicate hierarchy or state.

------------------------------------------------------------------------

# Semantic Design Tokens

These are the design tokens every component should consume.

## Foundation

-   background
-   surface
-   surface-elevated
-   surface-hover
-   border

## Typography

-   text-primary
-   text-secondary
-   text-muted
-   text-disabled

## Brand

-   primary
-   primary-hover
-   primary-light

## Forms

-   input-background
-   input-border
-   input-focus

## Buttons

-   button-primary
-   button-secondary
-   button-ghost

## Status

-   success
-   warning
-   danger
-   info

------------------------------------------------------------------------

# Token Values

Background → Zinc 950

Surface → Zinc 900/60

Surface Hover → Zinc 800/60

Border → Zinc 800

Text Primary → Zinc 50

Text Secondary → Zinc 300

Text Muted → Zinc 400

Disabled → Zinc 500

Primary → Emerald 500

Primary Hover → Emerald 600

Primary Light → Emerald 400

Success → Emerald

Warning → Amber

Danger → Red

Information → Sky

------------------------------------------------------------------------

# Component Guidelines

Cards - Neutral surfaces - Neutral borders

Buttons - Solid Emerald primary - Neutral secondary - Neutral ghost

Inputs - Neutral background - Emerald focus

Icons - Neutral by default - Brand color only when active

Badges - Neutral - Success - Warning - Error

------------------------------------------------------------------------

# Expected Result

A clean, professional, production-ready interface with a centralized
token system. Future rebranding should require changing only token
values rather than component implementations.
