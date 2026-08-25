# ADR 0008: UI Adapters and Theme Ownership

## Status

Accepted.

## Context

Metonia Admin supports UI-library-specific generation while preserving one admin architecture. shadcn-svelte is the first fully verified MVP UI adapter. Fluid UI is planned but blocked until authoritative details are available.

## Decision

UI libraries are modeled as adapters. A UI adapter owns its install behavior, component mapping, theme definitions, theme application, required CSS, icon integration, and support status.

Theme and icon-library selection are nested under the selected UI adapter. The CLI and website ask for UI library first, then themes and icon families valid for that library only. Invalid cross-adapter selections fail config validation.

The shadcn-svelte adapter exposes the five icon-library IDs supported by its current configuration schema: `lucide`, `tabler`, `hugeicons`, `phosphor`, and `remixicon`. Generated shell code consumes a semantic icon component so the selected family applies to both Metonia views and checked-in shadcn primitives.

shadcn-svelte is the first complete adapter once verified against current official tooling. Its generated primitives must live in or map to `$lib/client/ui/components`, not an unrelated default component path.

Fluid UI remains blocked/unavailable until its authoritative package name, installation instructions, component imports, theme API, theme registry, CSS requirements, Tailwind integration, icon integration, and form/table/dialog/menu primitives are known. Metonia must not invent Fluid APIs.

## Invariants

- UI adapter choice must not change the components/views/pages layering.
- Themes belong to adapters.
- Icon libraries belong to adapters.
- No global theme list.
- UI selection precedes theme selection.
- UI selection precedes icon-library selection.
- shadcn-svelte primitives target `$lib/client/ui/components`.
- Accessibility primitives from the UI library should be used where available.
- Fluid UI capabilities remain blocked until verified.

## Extension Procedure

To add a theme:

1. Verify the theme exists for the selected UI library.
2. Add it to that adapter's theme definitions.
3. Add validation and theme-lookup tests.
4. Confirm CLI and website pick it up from the registry.

To add a UI library:

1. Create an adapter with explicit support status.
2. Verify package, install, components, CSS, theming, icons, and accessibility primitives.
3. Map primitives to `$lib/client/ui/components`.
4. Add generator recipes and integration tests.
5. Keep Dashboard, Users, views, pages, and routes structurally unchanged.

To add an icon family:

1. Verify that the selected UI adapter officially supports it.
2. Add its exact packages and semantic icon mapping to that adapter.
3. Generate, install, check, test, and build a project using the family.
4. Keep application views importing only the adapter-owned semantic icon component.

## Consequences

- Another UI library can be added without rewriting data or resource architecture.
- Adding another Fluid theme does not require editing CLI prompts manually.
- The first stable path can proceed through shadcn-svelte while Fluid UI remains honestly blocked.
- UI-specific variability is real and contained; generic Svelte development is not abstracted away.

## Verification Gates

- Verify current shadcn-svelte CLI commands, init/add behavior, presets, themes, registry behavior, non-interactive flags, and alias configuration.
- Verify current Fluid UI authoritative details before enabling generation.
- Verify all stable UI/theme/icon combinations through generated-project install, check, test, and build.

## Test Implications

- Unit-test theme/icon lookup and invalid cross-adapter ownership rejection.
- Integration-test shadcn-svelte output path and component imports.
- Website configurator tests must prove changing UI library changes available themes and icon families.
- Accessibility tests must cover generated menus, dialogs, forms, tables, focus states, and responsive navigation.
