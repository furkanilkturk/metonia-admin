# Metonia Admin MVP scope

## Scope statement

The Metonia Admin MVP proves a single composable route from CLI configuration to a tested, native SvelteKit admin application. It prioritizes predictable generated code and an honest support surface over a broad but unverified matrix.

The MVP's standard reference is the combination below, promoted to Stable only when its release gates pass:

```text
Svelte 5 + SvelteKit
Standard SvelteKit data pattern
shadcn-svelte with a verified adapter theme
Zod
Drizzle
generic PostgreSQL
a generated-project package manager with a passing integration matrix
Dashboard + Users + Settings
optional Docker
```

Metonia Admin itself remains Bun-first regardless of the generated project's package-manager selection.

## Included MVP outcomes

### Generator and registry

- A typed, single capability registry for package managers, UI adapters and their themes, data patterns, validation, ORM, database, Docker, and starter examples.
- Configuration resolution and compatibility validation before generation writes to the destination.
- Recipe composition rather than a Cartesian-product template matrix:

  ```text
  SvelteKit base + Metonia architecture + admin core + UI adapter + theme
  + data pattern + validation + ORM + database + Docker + resources
  ```

- A versioned `metonia-admin.config.ts`, generated README, generated `.env.example`, and generated configuration-aware `AGENTS.md`.
- Safe incomplete-generation behavior: stage output, report the failed stage, and avoid a partial final project.

### CLI

- An interactive, conditional wizard with the order: project name, package manager, UI library, UI-specific theme, data pattern, validation, ORM, database, Docker, starter examples, dependency installation, and Git initialization.
- Full non-interactive operation with explicit flags, `--yes`, deterministic configuration, useful standard-error diagnostics, and meaningful exit codes.
- JSON mode that produces machine-readable output without decorative text.
- Clear invalid-combination errors, especially an adapter/theme mismatch.
- An experimental warning and interactive confirmation for Remote Functions; explicit non-interactive selection is consent and does not prompt.

### Generated application

- Native SvelteKit routes and no mandatory parallel API, custom router, tRPC, GraphQL, TanStack Query, or Metonia runtime.
- The locked library boundary:

  ```text
  $lib/client -> $lib/shared <- $lib/server
  ```

  Client code never imports server modules. Shared code does not depend on client or server modules.

- The locked UI composition:

  ```text
  components -> views -> pages -> routes
  ```

  Routes remain parameter/data/mutation adapters and ordinarily render one client page.

- An accessible responsive admin shell with centralized navigation, desktop and mobile navigation, breadcrumbs, account area, and content/page-action locations.
- Dashboard as the canonical page-composition example, with reusable components, Dashboard views, optional page state/controller, and a thin route.
- Users as the canonical CRUD resource: list, search, filter, sort, pagination, detail, create, edit, disable/delete, validation, empty/error/pending states, and real server-side persistence.
- Settings as the third starter page. It is a page example, not an authentication or identity-management implementation.
- Zod schemas and server-authoritative validation; Drizzle, generic PostgreSQL, migrations, repository/service boundaries, and no raw database calls from the UI.
- Optional Docker generation appropriate to the chosen application/database setup, with environment examples and documented local PostgreSQL behavior where generated.

### Data patterns

- **Standard SvelteKit** is the primary data pattern, using `+page.server.ts`, load functions, and form actions.
- **Remote Functions** may be shipped only as Experimental, after current official SvelteKit API verification. Route-level boundary modules validate public inputs and call `$lib/server`; pages, views, schemas, domain types, repositories, layout, and navigation are shared with Standard mode.

## Explicitly excluded from MVP

- Authentication, authorization, users-as-identities integration, sessions, roles enforcement, SSO, audit logs, CSRF strategy, rate limits, and a claim of production security.
- Fluid UI generation, Fluid UI themes, Fluid UI package installation, and invented Fluid UI APIs. It remains Unsupported until authoritative source material is supplied and implemented/tested.
- Named deployment-platform adapters and cloud-provider-specific database adapters; generic PostgreSQL is not Neon, Supabase, or another provider.
- A general `metonia-admin` maintenance command suite (`add resource`, `add page`, `add component`, `doctor`, `info`). The configuration is designed to enable these later.
- Extra starter domains beyond Dashboard, Users, and Settings.
- Additional validation libraries, ORMs, database dialects, UI libraries, and themes unless each is separately verified and promoted through the registry.
- A broad promise that Bun, pnpm, npm, Yarn, and Deno all have equal support. Each package-manager adapter earns its own status through the release matrix; Deno requires specific research and integration tests.
- A framework on top of SvelteKit, a generic backend controller layer, or speculative abstractions unrelated to actual configuration variability.

## Status policy for MVP

| Capability | MVP status | Selection behavior |
| --- | --- | --- |
| Standard SvelteKit + verified default stack | Stable target | Offered as the normal default only after the full release gate passes. |
| SvelteKit Remote Functions | Experimental | Selectable only with visible experimental context; explicit flag selection is permitted in automation. |
| shadcn-svelte and verified adapter themes | Stable target | Theme list derives only from this adapter's verified registry entries. |
| Fluid UI | Unsupported | Not selectable as a functional project path until authoritative sources and integration tests exist. |
| Package-manager adapters | Per-adapter | Stable only after generate/install/check/test/build evidence; otherwise Unknown or Unsupported. |
| Deno | Unknown initially | No compatibility claim until dedicated official research and integration testing are complete. |
| Auth and provider-specific deployments/databases | Unsupported | Absent from generator choices and docs except as future work. |

The labels mean: **Stable** is supported and fully integration-tested; **Experimental** is deliberate opt-in with documented change risk; **Unsupported** is intentionally not offered; **Unknown** is unverified and makes no compatibility promise.

## MVP acceptance criteria

### Configuration and CLI

- The registry rejects an unknown ID and rejects a theme that does not belong to the selected UI adapter.
- Interactive prompts are conditional, never present a global theme list, and ask no irrelevant questions.
- Explicit flags and `--yes` generate the same resolved configuration as equivalent interactive choices.
- `--json` output is valid machine-readable output only, with success and failure details designed for automation.
- A Remote Functions warning appears during interactive selection; `--data-pattern remote-functions` does not wait for a confirmation prompt.
- A generation error identifies the failing stage and leaves no partial final destination.

### Generated app architecture

- `$lib/client`, `$lib/server`, and `$lib/shared` exist with the prescribed dependency direction.
- `$lib/client/ui/components`, `views`, and `pages` demonstrate one-way composition; route files do not compose full admin screens.
- Standard routes use SvelteKit loads/actions rather than a parallel internal REST API.
- Remote Functions, if included, are route boundaries only and reuse all non-boundary architecture.
- `metonia-admin.config.ts`, README, and `AGENTS.md` accurately state the selected configuration and package-manager commands.
- The project runs without the Metonia generator or a Metonia runtime dependency.

### Quality, safety, and release gate

- The Users resource persists through Drizzle/PostgreSQL in `$lib/server`, validates mutation inputs with Zod, and returns actionable non-sensitive failures.
- Generated projects include `.env.example`, do not include secrets, do not leak private environment values, and guard destructive mutations.
- Generated project documentation states that authentication is deferred and the starter is not production-secure by default.
- The admin shell and resource views meet the documented keyboard, focus, labels/errors, table, contrast, responsive-navigation, dialog/menu, and reduced-motion criteria.
- For every capability labelled Stable, automated evidence covers generation, dependency installation, type checking, tests, and build using that generated project's selected package manager.
- The monorepo's Bun commands (`bun install`, `bun run check`, `bun run lint`, `bun test`, and `bun run build`) pass before a release claim.

## Deliberate implementation sequence

1. Establish the Bun monorepo, capability registry, configuration validation, staging generator, and generated-document templates.
2. Prove a minimal native SvelteKit generation path, then apply the locked folders and thin routes.
3. Complete the shadcn-svelte default UI path and the Dashboard composition example.
4. Complete the Standard SvelteKit Users path with Zod, Drizzle, generic PostgreSQL, and Settings.
5. Add optional Docker and validate the selected package-manager adapters individually.
6. Add Remote Functions only as a separately verified Experimental transport variation.
7. Build the website/configurator from the same registry and reconcile public documentation with tests.

This ordering prevents optional adapters and variants from obscuring the first end-to-end proof.

## Post-MVP roadmap

The next increments are intentionally separate from MVP completion:

1. Promote individual package-manager adapters as their end-to-end matrices pass; research Deno before offering support.
2. Integrate Fluid UI from authoritative documentation and promote it only with its own adapter/theme test matrix.
3. Add resource/page/component maintenance commands that consume `metonia-admin.config.ts`.
4. Add further validated UI, validation, ORM, dialect, provider, auth, and deployment adapters.
5. Add a first secure authentication/authorization offering with explicit deployment and threat-model guidance.

## Unresolved questions that may affect a later release

- Confirmation that unscoped CLI package names are publishable.
- The authoritative Fluid UI package, APIs, themes, and licensing/availability.
- The first package-manager adapters that can realistically meet the Stable gate, particularly Deno.
- Whether a named deployment target is needed beyond Node/Docker.
- The desired first authentication and authorization model.

None of these blocks the scoped Standard SvelteKit MVP. They must not be silently filled with invented integration behavior.
