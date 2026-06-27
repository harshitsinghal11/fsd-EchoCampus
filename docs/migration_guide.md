# EchoCampus Color Migration Guide (For Coding Agent)

## Objective

Refactor the existing color system into a semantic token-based design
system BEFORE changing any colors.

The migration MUST be completed in two distinct phases.

------------------------------------------------------------------------

# Phase 1 --- Analyze

1.  Scan the entire project.
2.  Identify every hardcoded Tailwind color.
3.  Group repeated colors by semantic purpose.
4.  Do NOT replace colors blindly.

Important:

Map colors by PURPOSE, not by VALUE.

Example:

-   Blue link -\> Primary
-   Blue info badge -\> Info

Never assume two identical colors have the same semantic meaning.

------------------------------------------------------------------------

# Phase 2 --- Create Semantic Tokens

Create centralized tokens.

Suggested token names:

-   background

-   surface

-   surface-elevated

-   surface-hover

-   border

-   text-primary

-   text-secondary

-   text-muted

-   text-disabled

-   primary

-   primary-hover

-   primary-light

-   input-background

-   input-border

-   input-focus

-   button-primary

-   button-secondary

-   button-ghost

-   success

-   warning

-   danger

-   info

Implement them using the project's preferred theming approach (CSS
variables, Tailwind theme, semantic utility classes, etc.).

Replace every hardcoded color with semantic tokens.

The UI MUST remain visually identical after this phase.

------------------------------------------------------------------------

# Phase 3 --- Update Token Values

Only edit the token definitions.

  Current                 New
  ----------------------- -----------------------------------------
  bg-slate-950            background = bg-zinc-950
  bg-slate-900/50         surface = bg-zinc-900/60
  bg-slate-900/40         surface = bg-zinc-900/60
  hover:bg-slate-800/60   surface-hover = bg-zinc-800/60
  border-slate-700/50     border = border-zinc-800
  text-white              text-primary = text-zinc-50
  text-slate-300          text-secondary = text-zinc-300
  text-slate-400          text-muted = text-zinc-400
  text-slate-500          text-disabled = text-zinc-500
  teal colors             primary = emerald
  blue buttons            button-primary = emerald
  purple accents          primary or neutral depending on purpose
  orange accents          warning only
  blue informational      info = sky

Remove: - Feature-specific accent colors - Decorative gradients -
Multiple CTA colors

------------------------------------------------------------------------

# Verification Checklist

Before finishing:

-   Every repeated color uses semantic tokens.
-   No unnecessary hardcoded Tailwind colors remain.
-   UI after Phase 2 matches the old design.
-   UI after Phase 3 matches the new design.
-   There is exactly one brand color.
-   Semantic colors are only used for feedback.
-   Future theme changes require editing only the token definitions.

Do not modify business logic, layouts, spacing, or typography beyond
what is required for the color migration.
