# Metonia Admin engineering constitution

## Purpose

Metonia Admin is a Bun-first monorepo for creating consistent, production-quality, agent-friendly Svelte 5 and SvelteKit admin applications. It includes a portable `create-metonia-admin` CLI, a composable generator, a shared capability registry, generated reference applications, and a public website/configurator.

The generated application is ordinary, native SvelteKit code owned by its user. Do not introduce a mandatory Metonia runtime, custom router, parallel REST API, tRPC/GraphQL layer, client query framework, or backend framework for normal page-to-server communication.

## Read before editing

- Read this file and any nearer scoped `AGENTS.md` before changing files.
- Read the relevant ADRs and research notes under `docs/` before changing a settled boundary.
- Preserve user changes and unrelated work. Never rewrite broad areas merely for consistency.
- Treat the shared registry and generated-project fixtures as contracts. Update their tests and documentation whenever their behavior changes.

## Internal toolchain

This repository is Bun-first. Use Bun for dependency installation, workspace management, scripts, tests, and local tooling:

```bash
bun install
bun run dev
bun run check
bun run lint
bun test
bun run build
bun run test:generator
bun run test:integration
```

The repository lockfile is `bun.lock`. Never add `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` to this monorepo. Generated applications may select Bun, pnpm, npm, Yarn, or Deno; never confuse the monorepo package manager with generated-project output.

## Native SvelteKit rule

- Use current supported Svelte 5 and SvelteKit APIs verified against official documentation.
- Standard data mode uses `+page.server.ts`, `+layout.server.ts`, load functions, form actions, and `$lib/server`.
- Remote Functions are a distinct, explicitly experimental data-boundary option while SvelteKit documents them as experimental. Boundary modules validate untrusted input and delegate to `$lib/server`.
- Standard and Remote modes share UI, schemas, domain types, repositories, layout, and navigation. Only boundary glue differs.
- Keep route components thin: they adapt route data and actions to client page components rather than composing entire screens.

## Application boundaries

Every SvelteKit application in this repository and every generated application uses:

```text
src/lib/
├── client/
├── server/
└── shared/
```

- `$lib/client` contains browser-safe UI, page state, controllers, and client utilities. It must never import `$lib/server`, database clients, private environment values, repositories, or secrets.
- `$lib/server` contains database clients and schemas, repositories, services, authorization, private environment access, and server integrations.
- `$lib/shared` contains runtime-neutral schemas, types, constants, enums, domain contracts, and pure utilities. It must not depend on client or server modules.
- Dependency direction is `client -> shared <- server`. Enforce it statically where practical.

## UI composition

The mandatory dependency direction is:

```text
components -> views -> pages -> routes
```

The folders are:

```text
src/lib/client/ui/
├── components/
├── views/
└── pages/
```

- Components are reusable primitives with explicit props/callbacks and no route-specific or database logic.
- Views are meaningful page sections composed from components. They accept data, state, and callbacks; they do not import server modules or own whole-screen orchestration.
- Pages compose views into complete screens.
- Page-specific reactive state lives in `pages/<page>/<page>State.svelte.ts` only when needed.
- Page controllers live in `pages/<page>/<page>Controller.ts` and coordinate UI actions, navigation, and boundary callbacks. They are not backend MVC controllers and never query the database.
- Routes are URL, parameter, data, mutation, and page-adapter boundaries. A route should normally render one client page component.
- Within UI code, dependencies flow `pages -> views -> components`; never reverse this direction.

## Generator and registry

- Generate projects by composing recipes: SvelteKit base + Metonia architecture + admin core + UI adapter + theme + data pattern + validation + ORM + database + Docker + resources.
- Never create a Cartesian-product template matrix.
- The generator pipeline must resolve and validate configuration before writing, report the failing stage clearly, avoid leaving partial projects, and emit configuration-aware `README.md`, `AGENTS.md`, and `metonia-admin.config.ts`.
- The typed capability registry is the single source of truth for CLI prompts/flags, config validation, the website configurator, compatibility docs, generated configuration, and matrix tests.
- Themes belong to their UI adapters. UI selection always precedes theme selection, and invalid cross-adapter themes must fail validation.
- Package-manager behavior belongs behind adapters rather than scattered conditionals.
- Abstract only real variability: package manager, UI/theme, data pattern, validation, ORM, database, Docker, and generator recipes.

## Adapter rules

- Verify external APIs against current official documentation before implementation. Record decisions and support status under `docs/research/`.
- `shadcn-svelte` is the first fully verified UI adapter. Configure its component alias for `$lib/client/ui/components`, not its unrelated default path.
- Fluid UI must use its real package, registry, components, CSS, and theme APIs. If authoritative information is unavailable, retain an honest unavailable/blocked adapter contract and document the blocker; never invent APIs.
- Zod, Drizzle, PostgreSQL, package managers, and data modes remain replaceable capabilities without spreading tool-specific logic into unrelated packages.
- Never mark an integration stable until its advertised generation/install/check/test/build path is integration-tested.

## Data, validation, and security

- Treat browser and Remote Function input as untrusted. Validate mutations at the server boundary and return actionable, non-sensitive errors.
- Keep Drizzle clients, queries, migrations, and repositories in `$lib/server`.
- Keep ORM, dialect, provider, and driver as separate concepts. PostgreSQL is not synonymous with Neon or Supabase.
- Reuse shared schemas and types where safe; do not duplicate equivalent client/server contracts.
- Never expose private environment variables or raw database errors, commit secrets, or make destructive actions unguarded.
- Generated projects include `.env.example`. If authentication is deferred, say so clearly; never present an unauthenticated starter as production-secure.

## Docker permission

`Dockerfile`, `.dockerignore`, `compose.yaml`, `docker-compose.yml`, Docker scripts, and Docker environment examples are writable source files. Agents may create and update them whenever product or infrastructure requirements change. Resolve and validate targets before destructive Docker cleanup.

## Tests and quality gates

- Unit-test config validation, registry compatibility, theme lookup, conditional prompts, package-manager commands, recipes, and transforms.
- Generate projects into temporary directories and test the actual result, not only generator internals.
- For every package manager advertised as stable, test generate, install, check, test, and build.
- Test Standard SvelteKit and Remote Functions against the primary supported stack; keep experimental tiers explicit.
- Verify accessibility: semantic structure, keyboard navigation, visible focus, labels and field errors, menu/dialog behavior, table usability, contrast, responsive navigation, and reduced motion.
- Run the official Svelte autofixer on every changed `.svelte` file before finalizing it.
- Do not claim unexecuted checks. Keep README, AGENTS files, website docs, CLI help, generated config, actual file layout, and tests aligned.

## Documentation

- Record architecture decisions under `docs/adr/` and time-sensitive ecosystem findings under `docs/research/` with source links and dates.
- Root documentation describes Metonia Admin itself; generated documentation describes the selected project configuration and uses that project's package-manager commands.
- Architecture examples must show Dashboard as the canonical components/views/pages composition and Users as the canonical shared/server/client CRUD resource.
- Update this constitution as decisions stabilize, without duplicating scoped instructions unnecessarily.

## Files requiring deliberate changes

Do not casually modify:

- `AGENTS.md` and scoped AGENTS files
- shared configuration schema and capability identifiers
- registry compatibility/status definitions
- generator pipeline stage ordering and recipe contracts
- base/generated templates and golden fixtures
- published CLI package metadata and binary names
- lockfiles, migrations, CI/release configuration, or architecture ADRs

Changes to these surfaces require corresponding tests and documentation. Never edit generated fixtures by hand when the generator is their source; regenerate them and review the diff.

## Git hygiene

- Never create a branch beginning with `codex/` or any AI/agent/tool identity prefix unless the user provides that exact name.
- Never add `Co-authored-by` or other AI, agent, or tool attribution to commits, pull requests, or repository content.
- Before publishing, inspect the branch name and commit trailers and remove prohibited attribution.
