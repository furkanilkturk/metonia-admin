# ADR 0005: Configuration and Capability Registry

## Status

Accepted.

## Context

The CLI wizard, non-interactive flags, website configurator, generated config, compatibility documentation, and tests all depend on the same set of selectable options. Duplicated option arrays would drift quickly, especially for UI-specific themes and experimental capabilities.

## Decision

Metonia Admin uses a typed capability registry as the single source of truth for package managers, UI adapters, themes, data patterns, validation libraries, ORMs, database dialects/providers/drivers, Docker, examples, and future features.

Each generated project writes a versioned `metonia-admin.config.ts` derived from the resolved registry-backed configuration. The config stores project choices such as package manager, UI library and theme, data pattern, validation library, ORM, database dialect/provider/driver, Docker support, and selected examples.

The registry powers CLI prompts, CLI flags, configuration validation, website configurator choices, compatibility docs, generated config, and integration-test matrices.

## Invariants

- Themes belong to UI adapters; there is no global `ALL_THEMES`.
- UI selection precedes theme selection.
- Invalid cross-adapter themes fail validation.
- Support status is explicit, such as stable, experimental, unsupported, or blocked.
- Fluid UI remains blocked or unavailable until authoritative package, registry, component, CSS, and theme APIs are known.
- Remote Functions remain experimental while official SvelteKit documentation marks them experimental.
- Auth is deferred/stubbed unless explicitly implemented and documented.

## Extension Procedure

To add another Fluid UI theme:

1. Verify the theme exists in authoritative Fluid UI sources.
2. Add it to the Fluid UI adapter's theme list.
3. Add theme lookup and compatibility tests.
4. Confirm the CLI and website pick it up from the registry without local option edits.

To add another UI library:

1. Add a UI adapter definition with its own themes, install behavior, component mapping, docs links, and support status.
2. Add recipes and tests for the adapter.
3. Keep pages and views unchanged.

To add Valibot, Prisma, MySQL, SQLite, Neon, Supabase, auth, or deployment adapters:

1. Add capability definitions and compatibility rules.
2. Add focused recipes only for the relevant layer.
3. Add integration tests before marking the capability stable.

## Consequences

- The website configurator and CLI cannot silently diverge if they consume the registry.
- Future commands can read `metonia-admin.config.ts` instead of re-asking project-wide choices.
- Compatibility failures can be reported before generation begins.
- The registry becomes a contract and requires deliberate test coverage when changed.

## Verification Gates

- Verify current external option sets through official documentation before assigning stable status.
- Verify shadcn-svelte theme and component behavior before publishing its stable adapter.
- Verify Fluid UI authoritative details before enabling Fluid UI generation.
- Verify package publication and deployment target capabilities before advertising them.

## Test Implications

- Unit-test registry schema, IDs, support statuses, dependencies, and compatibility rules.
- Unit-test conditional CLI prompts, especially UI-specific themes and Remote Function warnings.
- Test that website configurator options are imported from the registry rather than duplicated.
- Test that generated `metonia-admin.config.ts`, README, and AGENTS content match the resolved registry config.
