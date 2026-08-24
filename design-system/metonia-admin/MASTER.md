# Metonia Admin design system

> When building a page, read `pages/<page-name>.md` first. A page file overrides this master only where it is explicit.

**Project:** Metonia Admin  
**Direction:** Native SvelteKit workbench  
**Density:** 8/10 for admin surfaces, 5/10 for documentation and marketing  
**Motion:** restrained, functional, and fully removed when reduced motion is requested

## Thesis

Metonia Admin should feel like a calibrated engineering workbench: clear enough to understand at a glance, dense enough for real administration, and visibly compositional. It is not a generic analytics dashboard and not a neon developer console.

The signature element is the **recipe trace**: a thin routed line joining labeled capability blocks such as SvelteKit, UI, theme, data boundary, database, and Docker. It makes the generator's additive architecture visible in the website hero, configurator summary, progress output, and selective empty/loading states. Use it only where composition is the subject; ordinary cards and tables remain quiet.

## Color tokens

| Role | Light | Dark | CSS variable |
|---|---:|---:|---|
| Canvas | `#F4F7F5` | `#111816` | `--color-background` |
| Surface | `#FFFFFF` | `#17211E` | `--color-card` |
| Raised surface | `#F9FBFA` | `#1D2925` | `--color-raised` |
| Ink | `#15221F` | `#ECF4F0` | `--color-foreground` |
| Muted ink | `#52645E` | `#A9BBB4` | `--color-muted-foreground` |
| Muted surface | `#E7EDEA` | `#25332E` | `--color-muted` |
| Border | `#C7D3CE` | `#344640` | `--color-border` |
| Primary | `#0B7F79` | `#45C4BB` | `--color-primary` |
| On primary | `#FFFFFF` | `#081412` | `--color-on-primary` |
| Signal accent | `#C64F1A` | `#F28A57` | `--color-accent` |
| On accent | `#FFFFFF` | `#201009` | `--color-on-accent` |
| Warning | `#9B6508` | `#F2C15B` | `--color-warning` |
| Destructive | `#B4232D` | `#F77680` | `--color-destructive` |
| Focus ring | `#0B7F79` | `#67D7CF` | `--color-ring` |

Teal communicates the selected path and healthy system state. Burnt orange is reserved for the primary generative action or one high-value call to action per surface. Never rely on color alone for status.

## Typography

- **Display and section headings:** Space Grotesk, 500–650. Its engineered shapes carry product identity; reserve it for hierarchy rather than body copy.
- **Body and interface:** Source Sans 3, 400–650. Default to 16px/1.5 for prose and 14px/1.4 for dense controls where context remains clear.
- **Utility, commands, configuration, and data labels:** IBM Plex Mono, 400–600. Use sparingly; never set long explanatory prose in mono.

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Source+Sans+3:opsz,wght@8..60,400;500;600&family=Space+Grotesk:wght@500;600&display=swap');
```

Suggested scale:

| Token | Size / line height | Use |
|---|---|---|
| `--text-display` | `clamp(2.75rem, 7vw, 6.5rem) / 0.96` | Website thesis only |
| `--text-h1` | `clamp(2rem, 4vw, 3.75rem) / 1.02` | Page title |
| `--text-h2` | `clamp(1.5rem, 2.5vw, 2.25rem) / 1.12` | Major section |
| `--text-h3` | `1.125rem / 1.25` | Admin section/card title |
| `--text-body` | `1rem / 1.5` | Prose and forms |
| `--text-ui` | `0.875rem / 1.4` | Dense interface copy |
| `--text-utility` | `0.75rem / 1.35` | Metadata and code labels |

## Spacing and geometry

Use a 4px base grid. Dense admin surfaces use 8–24px gaps; documentation and landing sections use 24–96px vertical rhythm.

| Token | Value |
|---|---:|
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-6` | `1.5rem` |
| `--space-8` | `2rem` |
| `--space-12` | `3rem` |
| `--space-16` | `4rem` |
| `--space-24` | `6rem` |

- Controls and cards: 8–12px radius.
- Dialogs and large feature panels: 14px radius.
- Pills only for statuses, filters, and truly compact selections.
- Prefer borders and surface changes to shadows. Use `0 10px 30px rgb(21 34 31 / 0.08)` only for overlays or a single raised interactive demo.

## Layout

Admin surfaces use a stable navigation rail, compact header, and a fluid content column capped only where readability requires it. Tables may scroll inside a labeled region; the page itself must not create horizontal overflow.

Website thesis layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ wordmark                     Docs  GitHub  Create an admin   │
├────────────────────────────┬────────────────────────────────┤
│ Native SvelteKit,          │ SvelteKit ─ UI ─ Theme         │
│ composed with intent.      │      └ Data ─ DB ─ Docker      │
│ concise proof + CTA        │ live configuration/command     │
└────────────────────────────┴────────────────────────────────┘
```

On narrow screens, the configurator follows the thesis and the trace becomes a vertically routed sequence. Avoid decorative bento grids unless the content genuinely has independent modules.

## Components and interaction

- Interactive targets are at least 44×44px on touch layouts, with at least 8px separation for adjacent destructive/primary actions.
- Every input has a persistent visible label. Put errors beside the field and focus the first invalid field after submit.
- Icon-only buttons require an accessible name and tooltip where the icon is not universally obvious.
- Use one Lucide icon family; never use emoji as interface icons.
- Cards are not clickable by default. Interactive cards need semantic links/buttons and a visible focus treatment.
- Tables retain headers, expose row actions to keyboard users, and provide non-color status labels.
- Empty states state what is absent and offer the next valid action. Errors identify what failed and how to recover.
- Destructive actions require clear wording and confirmation proportional to reversibility.

Focus ring:

```css
:focus-visible {
  outline: 3px solid color-mix(in oklab, var(--color-ring), transparent 20%);
  outline-offset: 2px;
}
```

## Motion

Use 140–220ms transitions for hover, focus, disclosure, and selection. Prefer opacity and transform; do not animate layout dimensions on dense screens.

The recipe trace may reveal once as capability blocks resolve, using a 40–70ms stagger and no overshoot. Data tables, forms, and routine navigation do not cascade into view. Loading feedback begins immediately and does not fake progress.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Content voice

Write from the administrator's or developer's side of the screen. Use active, exact verbs: “Create project,” “Save changes,” “Disable user,” and “Copy command.” Keep action names consistent through button, pending state, success message, and error recovery.

Describe behavior, not internal implementation, unless the surface is explicitly technical documentation. Experimental and unauthenticated capabilities must be plainly labeled.

## Anti-patterns

- Generic metric-card hero sections, ornamental gradients, glass effects, and arbitrary bento layouts.
- Mono body copy, low-contrast gray-on-gray text, or raw hex values scattered through components.
- Hover-only affordances, removed focus rings, placeholder-only labels, or color-only status.
- Scale-on-hover treatments that shift or blur dense content.
- Animation on every card, row, or route transition.
- Hiding mobile overflow instead of fixing it.
- Mixing icon families or using emoji as controls.

## Pre-delivery checklist

- [ ] The recipe trace appears only where it explains composition.
- [ ] Semantic landmarks, heading order, form labels, field errors, and accessible names are correct.
- [ ] Keyboard navigation and visible focus work through menus, dialogs, tables, and forms.
- [ ] Text and meaningful UI meet WCAG AA contrast; status never relies on color alone.
- [ ] Interactive targets and spacing work at 375px; layouts are checked at 375, 768, 1024, and 1440px.
- [ ] No horizontal page overflow or fixed navigation covering content.
- [ ] Loading, empty, error, success, and destructive states give a clear next action.
- [ ] Reduced motion is respected and the final state remains understandable without animation.
- [ ] Changed Svelte files pass the official Svelte autofixer, project checks, and visual screenshot review.
