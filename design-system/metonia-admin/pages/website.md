# Metonia Admin website override

This file overrides `../MASTER.md` only for the public website (`/`, `/docs`, and `/support`). The admin application direction remains unchanged.

## Product frame

- Subject: assembling a native SvelteKit admin project from explicit capabilities.
- Audience: experienced Svelte teams evaluating the generated architecture, not a hosted dashboard product.
- Single job: configure a real stack, inspect its project boundary, and start it with `npx`.

The public website is a compact project-assembly surface. The live configurator is the hero and its generated source topology is the one memorable visual. Marketing copy, documentation, and support status stay restrained around it.

## Visual system

| Role                 |     Value |
| -------------------- | --------: |
| Drafting mist        | `#EEF2F4` |
| Sheet white          | `#FFFFFF` |
| Graphite             | `#17232B` |
| Blueprint cobalt     | `#2458E6` |
| Svelte action orange | `#FF3E00` |
| Warning ochre        | `#8A5300` |

Use IBM Plex Sans Condensed for compact thesis and blueprint headings, IBM Plex Sans for controls and prose, and IBM Plex Mono for paths, capability IDs, status metadata, configuration, and commands. Corners are square. Small status tags may use a two-pixel radius, never a pill.

## Signature element: project blueprint

The configurator preview visualizes the actual SvelteKit output: a route boundary feeding `$lib/client`, `$lib/shared`, and `$lib/server`, with selected UI, data-boundary, validation, ORM, database, Docker, and resource choices placed at their relevant nodes. Cobalt guide lines and a faint drafting grid are confined to this diagram. The orange `npx` command is its finish line.

Do not introduce a second competing diagram elsewhere on the site. Supporting sections may use plain path lists, rules, and text.

## Layout

- Keep the public frame at a maximum width of 90rem with fluid 16–48px gutters.
- Lead with a short, product-specific thesis and place the configurator immediately below it.
- At desktop widths, controls occupy a compact left rail and the blueprint remains visible on the right. On mobile, show the blueprint summary before the controls so the product artifact is immediate.
- Documentation uses a narrow index and readable technical sections. Support uses a ledger, not a card grid.
- Do not use oversized editorial headlines, decorative numbering, bento cards, glass, ornamental gradients, or repeated marketing panels.

## Interaction and truth

- The registry is authoritative. Render `selectable` directly; unavailable choices remain visible and disabled.
- Resolver issues and warnings provide all compatibility copy. Do not duplicate Remote/Users or Docker/package-manager validation in the website.
- Preserve selections when conflicts occur and show a direct recovery message next to resolver output.
- Every target is at least 44px, focus is unmistakable, and narrow layouts never overflow horizontally.
- Reduced motion removes smooth scrolling and transitions without changing content or state.
