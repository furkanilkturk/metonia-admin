# Metonia Admin product specification

## Product intent

**Metonia Admin** is a public, MIT-licensed, Bun-first monorepo and generator for creating ordinary, production-quality Svelte 5 and SvelteKit admin applications. It gives developers and coding agents a repeatable architecture without adding a mandatory Metonia runtime or concealing normal SvelteKit patterns.

The primary outcome is a generated application that its owner can understand, run, and extend without Metonia Admin being installed. A developer adding a resource should be able to read the generated `AGENTS.md`, inspect the Users example, and follow an evident pattern.

Metonia Admin's own development environment uses Bun. That does not make Bun a requirement for every generated application or necessarily for invoking the published CLI.

## Product principles

- Generated applications are native SvelteKit: no mandatory custom router, REST layer, tRPC, GraphQL, client query framework, or backend MVC framework.
- Generated code is user-owned and has no hidden runtime dependency on Metonia Admin.
- Architecture is explicit: `$lib/client`, `$lib/server`, and `$lib/shared`; client code never imports server code.
- UI composition is explicit: reusable components are composed into views, views into pages, and routes are thin SvelteKit boundaries.
- Selection is registry-driven. The CLI, validation, generated config, website configurator, documentation matrix, and integration tests use the same capability definitions.
- Themes belong to their selected UI adapter. A theme from one adapter cannot be selected for another.
- Stability is earned through generation and integration tests, not inferred from a package's existence.
- Accessibility and server-boundary validation are release requirements, not optional polish.

## Canonical generated application

The MVP application is an admin shell with Dashboard, Users, and Settings. Dashboard demonstrates the `components -> views -> pages -> routes` composition. Users demonstrates the `$lib/shared`, `$lib/server`, and `$lib/client` CRUD boundary. Settings provides the third canonical page category, not a generalized settings platform.

The normal generated layout is:

```text
src/lib/
  client/ui/{components,views,pages}
  server/{db,repositories,services,...}
  shared/{schemas,types,constants,utils}
src/routes/
  (admin)/...
```

In Standard SvelteKit mode, routes use `+page.server.ts`, loads, and form actions. In Remote Functions mode, route-level `.remote.ts` modules are boundary glue only; real validation, services, and database access remain in `$lib/server`. The two modes share UI, schemas, domain types, repositories, layout, navigation, and resource behavior.

## Configuration model and documented defaults

Every project has a versioned `metonia-admin.config.ts` containing its selected package manager, UI library and theme, data pattern, validation, ORM, database, Docker setting, and starter resources. It is the durable input for future commands such as `metonia-admin add resource products`.

The following are product defaults, not claims that every option is already stable:

| Decision | Default / assumption |
| --- | --- |
| Product and repository | Metonia Admin; public; MIT license |
| Internal toolchain | Bun and `bun.lock` only |
| CLI packages | Prefer unscoped `create-metonia-admin` and future `metonia-admin`, subject to registry availability |
| Framework | Current supported Svelte 5 and SvelteKit, verified before implementation |
| UI | shadcn-svelte is the first complete adapter; Fluid UI is unavailable until an authoritative package/API source is supplied |
| Data pattern | Standard SvelteKit by default; Remote Functions only as explicit experimental opt-in while SvelteKit labels them experimental |
| Validation and persistence | Zod, Drizzle, generic PostgreSQL |
| Starter surface | Dashboard, Users, Settings; Users example included by default |
| Docker | Optional, off by default |
| Authentication | Deferred; no security claim beyond the documented baseline |
| Deployment | Provider-neutral Node/Docker output; no platform deployment adapter in MVP |

Package-manager choice is separate from the monorepo's Bun-first rule. Bun, pnpm, npm, Yarn, and Deno may appear in the registry, but each has an independent status. Deno is never represented as `Dynamo` or `Dynoma`.

## Support-status vocabulary

Status is capability-specific and combination-specific. A status label is a public compatibility commitment, not a forecast.

| Status | Meaning | What may be promised |
| --- | --- | --- |
| **Stable** | Implemented against current authoritative documentation and covered by the release integration gate for the advertised combination: generate, install, check, test, and build. | Normal interactive and non-interactive selection; documented as supported. |
| **Experimental** | Implemented and deliberately selectable, but its upstream API or Metonia integration may change. It has targeted validation/build coverage and an explicit warning. | Opt-in use only; change risk is documented. |
| **Unsupported** | Intentionally unavailable for generation or blocked until required research, implementation, and tests are complete. | It must not be selectable as a working combination. |
| **Unknown** | Information or compatibility has not been verified; no product conclusion has been made. | No compatibility or installation claim. Resolve it before promoting to any other status. |

"Available in a package ecosystem" does not establish compatibility. A capability cannot become Stable merely because the CLI can write a configuration file for it.

## Support matrix and promotion gates

This is the planned MVP matrix. “Stable target” means it may be labelled Stable only after the gate stated below has passed; this document does not assert that validation has already occurred.

| Dimension | MVP status | Product rule / promotion gate |
| --- | --- | --- |
| Standard SvelteKit data pattern | Stable target | Use native loads and form actions; prove the default generated stack end to end. |
| SvelteKit Remote Functions | Experimental | Explicit selection; show warning interactively; no extra prompt when selected by non-interactive flag; verify current official API and build the generated project. |
| shadcn-svelte | Stable target | Use verified official tooling and configure primitives for `$lib/client/ui/components`; only verified adapter themes are selectable. |
| Fluid UI | Unsupported | No authoritative package, registry, component, CSS, or theme API is available. Keep a truthful unavailable adapter contract; do not invent themes or commands. |
| Zod | Stable target | Shared schemas where safe and authoritative validation at every server/mutation boundary. |
| Drizzle + generic PostgreSQL | Stable target | Server-only database client, schema, migrations, repositories, and real Users persistence validation. |
| Docker feature | Stable target | Optional; generated Node/Docker workflow and, when applicable, PostgreSQL local development have documented environment wiring and validation. |
| Generated package managers | Per adapter | Each may be Stable only after its own generate/install/check/test/build matrix passes. Unverified adapters remain Unknown or Unsupported; Deno requires dedicated research and testing before any Stable label. |
| Provider-specific databases (Neon, Supabase, etc.) | Unsupported | PostgreSQL dialect is not a provider. No provider integration is implied by the generic PostgreSQL option. |
| Authentication | Unsupported | Deferred from MVP; generated apps must say so plainly. |

The primary release proof is the Standard SvelteKit + shadcn-svelte + verified theme + Zod + Drizzle + generic PostgreSQL stack, with the selected package-manager adapter and optional Docker paths tested as advertised. Remote Functions are an additional experimental proof, not a second admin architecture.

## CLI experience

The recommended creation command is `create-metonia-admin`, subject to package-name availability. The published runtime/distribution strategy must preserve practical invocation through `bunx`, `npx`, `pnpm dlx`, and `yarn dlx` where technically feasible; this is separate from developing the CLI with Bun and TypeScript.

### Interactive mode

The wizard is concise, modern, and conditional. Its logical order is:

1. Project name
2. Generated-project package manager
3. UI library
4. Theme supplied by that UI adapter
5. Data pattern
6. Validation
7. ORM
8. Database dialect and any relevant provider choice
9. Docker support
10. Starter examples (including Users)
11. Dependency installation
12. Git initialization

The UI selection always precedes theme selection. The wizard never asks a question that cannot affect the resolved configuration. Choosing Remote Functions presents an experimental warning and asks to continue only in interactive mode.

### Non-interactive and agent mode

Every material choice has a flag. A canonical shape is:

```bash
create-metonia-admin acme-admin \
  --package-manager bun \
  --ui shadcn-svelte \
  --theme zinc \
  --data-pattern standard \
  --validation zod \
  --orm drizzle \
  --database postgresql \
  --docker \
  --yes
```

Exact flag spellings may evolve, but semantics may not: explicit flags resolve the configuration deterministically, `--yes` accepts safe defaults without a TTY, and an explicit `--data-pattern remote-functions` is informed consent without a blocking prompt. `--json` is a product requirement target: on success or failure it emits one machine-readable result to standard output and decorative output goes nowhere in that mode. Human errors go to standard error, exit codes are meaningful, and errors name the failed validation or pipeline stage.

## CLI acceptance criteria

The CLI is done for a supported combination when all of the following hold:

- Interactive generation resolves conditional questions correctly, including UI-specific theme filtering.
- Non-interactive generation can express every material choice and works without a TTY.
- `--yes` produces a documented deterministic default configuration; `--json` is parseable without decorative output.
- Invalid IDs and invalid combinations, including cross-adapter themes, fail before writes with actionable messages and a non-zero exit code.
- The pipeline resolves and validates before writing to a staging location; a failure identifies its stage and does not leave a partial destination project.
- The selected package-manager adapter controls generated commands, README, and generated `AGENTS.md`.
- `metonia-admin.config.ts`, configuration-aware `AGENTS.md`, `.env.example`, and README are written and agree.
- A generated project is native SvelteKit, has the locked folder boundaries and thin routes, and does not require Metonia Admin to run.

## Security and accessibility baseline

Metonia Admin is a generator for security-sensitive admin interfaces, but MVP authentication is deferred. Generated projects are **not production-secure by default** and must say so in their README and `AGENTS.md`. They must not imply that the starter is access-controlled.

The baseline nevertheless includes server-side validation of browser and Remote Function input, server-only database and private-environment access, parameterized ORM usage, non-sensitive error messages, `.env.example` rather than secrets, and guarded destructive mutations. Authentication, authorization, session handling, CSRF policy, audit logging, rate limiting, and production threat modelling remain work the consuming project must add until a future authenticated adapter is implemented.

Accessibility acceptance covers semantic landmarks and controls, keyboard operation, visible focus, labelled fields and field errors, usable dialogs and menus, table usability, contrast, responsive navigation, and reduced-motion treatment where motion is introduced.

## Definition of done and release evidence

MVP release evidence is traceable to these outcomes:

| Area | Evidence required |
| --- | --- |
| Repository | Bun install, lockfile, check, lint, tests, and build pass; website and playground build. |
| Registry | IDs, statuses, compatibility, conditional prompts, theme lookup, package-manager commands, recipes, and transforms have unit coverage. |
| Generator | Real projects are generated in temporary directories; config is validated before writing and output artifacts match selection. |
| Default stack | Generate, install, check, test, and build the primary Standard stack with Users CRUD and configured optional Docker path. |
| Data patterns | Standard mode uses native loads/actions. Remote Functions, if offered, are separately built and clearly Experimental. |
| Package managers | Repeat the generated-project quality commands for every adapter advertised as Stable. |
| UX and safety | Invalid combinations, machine output, no-TTY operation, incomplete-generation handling, accessibility criteria, and security baseline are tested. |

Documentation, CLI help, registry output, website configurator, generated files, and tests must describe the same capabilities. No document may elevate a target or unexecuted path to Stable.

## Future direction (not MVP)

- `metonia-admin` maintenance commands: `init`, `add resource`, `add page`, `add component`, `doctor`, and `info`.
- Additional UI adapters and verified Fluid UI integration once authoritative source material is provided.
- Additional validation libraries (for example, Valibot), ORMs (for example, Prisma), dialects (MySQL and SQLite), and PostgreSQL providers (such as Neon and Supabase) as separate capabilities.
- Authentication and authorization adapters, audit trails, and hardened deployment guidance.
- Deployment adapters for named platforms, without replacing provider-neutral Node/Docker output.
- Additional starter resources, resource generators, and richer examples.

Each future capability must extend the registry and recipe composition without requiring Dashboard views, generated app ownership, or the core SvelteKit architecture to be rewritten.

## Genuinely unresolved product questions

The following are intentionally not decided by this specification and should be resolved in one grouped discovery round when they become implementation-blocking:

1. Are the preferred unscoped npm package names (`create-metonia-admin` and later `metonia-admin`) available and acceptable for publishing? If not, choose the smallest compatible naming change.
2. What authoritative Fluid UI package/repository/docs, installation flow, component imports, CSS/Tailwind requirements, and theme registry should Metonia Admin use?
3. Which generated package-manager adapters can satisfy the full Stable promotion gate at first release, especially Deno?
4. Does the initial public release need a named deployment target beyond provider-neutral Node/Docker output?
5. What authentication/authorization model should the first secure adapter support, and which threat-model commitments belong to it?

Public/MIT licensing, deferred authentication, provider-neutral deployment, and the Dashboard/Users/Settings starter surface are settled defaults for the MVP rather than questions to re-open.
