# Metonia Admin

Metonia Admin is a composable generator for native Svelte 5 + SvelteKit admin applications. It produces ordinary, user-owned application code with predictable client/server boundaries, thin routes, an accessible admin shell, and configuration-aware documentation. Generated projects do not depend on a hidden Metonia runtime.

The MVP includes a portable `create-metonia-admin` Node CLI, a transactional recipe generator, a shared capability registry, a CLI-generated Standard reference admin, an experimental Remote Functions playground, and a public website/configurator.

## Quick start

Generate a project from the public npm release:

```bash
npx create-metonia-admin@latest
```

The interactive flow asks for a project name, then suggests `./<project-name>`
relative to the current terminal directory. Enter `./` to use an empty current
directory. `npm create metonia-admin@latest` and
`bunx create-metonia-admin@latest` launch the same wizard.

For local CLI development inside this Bun-first monorepo:

```bash
bun install
bun run --cwd packages/cli build
node packages/cli/dist/create-metonia-admin.js acme-admin --yes
```

The interactive form asks only relevant questions. The same configuration can be automated from the registry:

```bash
npx create-metonia-admin@latest acme-admin \
  --package-manager bun \
  --ui shadcn-svelte \
  --theme zinc \
  --data-pattern standard \
  --validation zod \
  --orm drizzle \
  --database postgresql \
  --provider generic \
  --driver pg \
  --no-docker \
  --users \
  --install \
  --no-git
```

Use `--json` for a single versioned machine-readable result. Invalid combinations fail before a destination is written. `create-metonia-admin@0.1.1` is published on npm with the `latest` tag; clean external `npx`, `npm create`, and `bunx` invocations passed, including a live no-argument wizard run and a real non-default-theme generation from the public registry.

## What is generated

The default project contains:

- Svelte 5.56.10, SvelteKit 2.70.3, adapter-node, and Vite 8;
- a responsive shadcn-svelte Nova admin shell with Neutral, Stone, Zinc, Mauve, Olive, Mist, and Taupe base-color choices;
- Dashboard, full PostgreSQL-backed Users CRUD, and Settings;
- Zod boundary validation, Drizzle, generic PostgreSQL, and `pg`;
- native SvelteKit server loads and form actions;
- migrations, `.env.example`, and explicit database scripts;
- `metonia-admin.config.ts`, README, and a configuration-aware `AGENTS.md`;
- optional Bun-tested Docker output.

Authentication and authorization are deliberately deferred. Generated projects state clearly that access control must be added before production use.

## Architecture

Every SvelteKit application in this repository dogfoods the same boundary:

```text
src/lib/
├── client/
│   └── ui/
│       ├── components/   reusable primitives
│       ├── views/        screen sections
│       └── pages/        complete screen composition
├── server/               DB, repositories, services, secrets
└── shared/               schemas, types, constants, pure code
```

Dependencies flow as:

```text
client -> shared <- server
pages -> views -> components
routes -> client pages
```

Routes own SvelteKit parameters, loads, actions, and Remote boundaries; they do not become screen implementations. Client code never imports `$lib/server`.

The generator mirrors the variable dimensions rather than maintaining a template Cartesian product:

```text
SvelteKit base
+ architecture
+ admin core
+ UI adapter + owned theme
+ data pattern
+ validation
+ ORM
+ database
+ optional Docker
+ resources
+ generated documents
```

## Current support surface

The registry is the source of truth used by the CLI, website, generator, and tests.

| Capability                                       | Current status                                                                                                                                                                                                                                     |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bun 1.4.0, npm 12.0.2, pnpm 11.23.0, Yarn 4.18.0 | Experimental; each full primary graph completed the substantive generate/install/frozen install/check/test/build commands on Windows x64, with manager-specific safety config where required. npm still has a repeat-harness Windows cleanup gate. |
| Deno 2.9.5                                       | Unknown and fail-closed; the complete hybrid stack is unverified.                                                                                                                                                                                  |
| shadcn-svelte Nova base colors                   | Experimental; Neutral, Stone, Zinc, Mauve, Olive, Mist, and Taupe have pinned deterministic snapshots. Zinc retains the complete generated build and responsive-review evidence; repeatable theme-specific multi-OS evidence remains pending.      |
| Fluid UI                                         | Unknown/unavailable pending an authoritative package/API/theme contract.                                                                                                                                                                           |
| Standard SvelteKit                               | Experimental selectable default; full generated stack and real PostgreSQL Users behavior passed on Windows.                                                                                                                                        |
| Remote Functions                                 | Experimental upstream and in Metonia; validated query-boundary proof only, with Users disabled.                                                                                                                                                    |
| Zod, Drizzle, generic PostgreSQL/`pg`, Users     | Experimental; generated and real PostgreSQL 17.11 behavior passed, while repeatable multi-OS release evidence remains pending.                                                                                                                     |
| Docker                                           | Experimental and Bun-only; image, non-root runtime, PostgreSQL health wiring, HTTP request, and teardown passed locally.                                                                                                                           |

This intentionally avoids turning a single-host result into a universal Stable claim. See [the verification ledger](docs/verification.md) for exact evidence and limitations.

## Reference applications

- `apps/reference-admin` is the CLI-generated default Standard project with Dashboard, Users, and Settings.
- `apps/playground` is the CLI-generated experimental Remote query-boundary project.
- `apps/website` is the public product/configurator surface and consumes the same serializable registry and resolver as the CLI.

Generated application output is not repaired by hand. Regenerate it through the built CLI after recipe or registry-document changes.

## Monorepo development

This repository is Bun-first and has one root `bun.lock`:

```bash
bun install
bun run check
bun run lint
bun run format:check
bun test
bun run build
bun run test:generator
bun run test:integration
```

Generated-project package managers are an independent configuration choice; they do not change the monorepo toolchain.

Important documentation:

- [Engineering constitution](AGENTS.md)
- [Product specification](docs/product-spec.md)
- [MVP scope](docs/mvp-scope.md)
- [Implementation plan](docs/implementation-plan.md)
- [QA strategy](docs/qa-strategy.md)
- [Architecture decisions](docs/adr/README.md)
- [Ecosystem research](docs/research/ecosystem.md)
- [Executed verification](docs/verification.md)

## Extension points

New capabilities extend the registry and one focused adapter/recipe boundary. A Valibot adapter changes validation contributions; Prisma changes server persistence recipes; MySQL/SQLite add dialect branches; Neon/Supabase add provider/driver definitions; a new UI library owns its own themes and component recipe; auth and deployment targets add explicit features. None requires rewriting Dashboard views or the native SvelteKit route model.

Adding a new theme does not add a hard-coded CLI option: it becomes available when its UI adapter exposes verified theme metadata. Adding a Products resource follows the neighboring Users shared schema → server repository/service → views → page/controller → thin route pattern documented in generated `AGENTS.md`.

## Roadmap

The next release work is repeatable multi-OS promotion evidence, Remote Users parity if the upstream API remains suitable, authoritative Fluid UI integration, authentication/authorization, additional validated adapters, and public CLI publication. Unsupported integrations stay visible as honest future boundaries rather than fabricated implementations.
