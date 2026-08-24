# Metonia Admin website override

This file overrides `../MASTER.md` only for the public website (`/`, `/docs`, and `/support`). The admin application direction remains unchanged.

## Direction

Use a light-first, modular editorial workbench. The website should make the generator's real job tangible before it explains the architecture: visitors assemble a registry-backed project recipe and inspect the resulting command, config, and folder boundaries in the hero.

The signature element is the **exploded assembly ribbon**. Capability blocks are separate, numbered pieces joined by a thin trace. It appears only around configuration and generation; documentation and support surfaces use plain rules and columns.

## Website tokens

| Role | Value |
|---|---:|
| Canvas | `#F2F4EF` |
| Paper | `#FBFCFA` |
| Raised paper | `#FFFFFF` |
| Ink | `#17231F` |
| Muted ink | `#53615B` |
| Rule | `#C8D0CA` |
| Strong rule | `#9CA9A1` |
| Selected path | `#08756D` |
| Selected wash | `#DCECE8` |
| Generative action | `#C84D23` |
| Warning | `#875600` |

Use Space Grotesk for decisive headings, Source Sans 3 for interface and prose, and IBM Plex Mono only for recipe indices, paths, commands, and status metadata. Avoid dark code panels; commands and configuration belong on light utility paper.

## Layout and geometry

- Keep the public frame at a maximum width of 88rem with fluid 16–56px gutters.
- The homepage thesis uses an oversized type block followed immediately by the assembly ribbon and live configurator.
- The configurator becomes a two-pane workbench at wide sizes: numbered selection stations on the left, sticky resolved output on the right.
- At narrow sizes, preserve source order: thesis, artifact, controls, output. No horizontal page overflow.
- Use square or 2–4px control corners. Rounded pills are reserved for compact status labels.
- Use hard borders, paper changes, and one offset shadow on the interactive workbench. Do not use glass, gradients, or repeated floating cards.

## Interaction

- The registry remains authoritative. Unsupported choices stay visible and disabled; warnings and blockers remain plain text.
- Selection updates the recipe, folder preview, command, and config without decorative motion.
- All touch targets are at least 44px. Focus rings remain visible and offset.
- Reduced motion removes scrolling and transition effects without changing information or final state.
