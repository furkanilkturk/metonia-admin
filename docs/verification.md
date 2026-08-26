# Verification ledger

This ledger records evidence executed for the 2026-08-25 MVP build. Capability labels remain conservative: a passing Windows run is evidence, but it is not treated as universal or multi-OS support.

## Environments

| Purpose                                | Environment                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------- |
| Monorepo gates                         | Windows x64, Bun 1.3.14, Node 25.2.1                                        |
| Exact generated-package-manager matrix | Windows x64, Node 24.19.0; Bun 1.4.0, npm 12.0.2, pnpm 11.23.0, Yarn 4.18.0 |
| PostgreSQL runtime                     | Disposable PostgreSQL 17.11 container                                       |
| Docker runtime                         | Docker client/server 29.2.0, Linux amd64 engine                             |

The exact generated versions are also pinned by the generator. Deno 2.9.5 is represented by a fail-closed adapter and was not advertised as a working generated stack.

## Executed evidence

### Control plane and generator safety

- Registry tests cover canonical IDs, support vocabulary, adapter-owned themes and icon libraries, database nesting, serialization, defaults, malformed input, experimental warnings, the incompatible Remote-Users crossing, and Docker availability for every implemented package manager.
- CLI tests cover interactive/flag/`--yes` equivalence, project-name and relative-destination defaults, `./` current-directory generation, concise blocking errors, conditional questions, non-TTY behavior, JSON-only success/failure output, cancellation, stage-preserving errors, Remote consent, destinations containing spaces, and interactive activity-indicator success/failure lifecycles.
- Generator-core tests cover traversal and symlink rejection, owned staging, ordered recipes, validation failures, command timeouts, existing destinations, finalization rollback, and cleanup.
- A Windows-only transient-lock retry is limited to `EACCES`, `EBUSY`, and `EPERM` during publication; every destination and rollback check still runs.

### 2026-08-26 review remediation

- Install-enabled generation now probes the selected package manager and fails during `resolve-plan`, before staging, unless its reported version exactly matches the adapter's pinned `packageManager` version. The ordinary local suite verified the expected Bun 1.3.14 rejection, while a temporary PATH using Bun 1.4.0 completed fresh CLI generation, install, frozen install, Svelte check, Vitest, adapter-node build, and audit.
- Timed-out staged commands now terminate their process tree. A Windows regression launches a descendant that would write a delayed marker; timeout cleanup killed both processes, left no marker, and removed unpublished staging output.
- Root and freshly generated Bun dependency graphs use reviewed patched `cookie@0.7.2` and `esbuild@0.28.2` resolutions. Both `bun audit` runs reported no vulnerabilities.
- pnpm 11 security overrides live in `pnpm-workspace.yaml`, where the current CLI reads them, rather than the retired `package.json#pnpm` field. A fresh pnpm 11.23.0 project completed install, frozen install, check, test, and build without the ignored-configuration warning.
- Yarn's initial install explicitly permits creation of the intentionally empty project lockfile under `CI=true`; the next command still enforces `--immutable` before check, test, and build.
- Compose was rendered with a synthetic password containing spaces and URL/Compose-significant punctuation. The value remained in `PGPASSWORD`, did not enter `DATABASE_URL`, and the Docker recipe tests passed for Bun, npm, pnpm, and Yarn output.
- `apps/reference-admin` and `apps/playground` were regenerated from the built CLI. Their README evidence, icon typing, navigation matching, Dashboard ID search, database client, and package-manifest security policy now match fresh output.
- `.github/workflows/ci.yml` now runs the ordinary Bun-first gates, each exact generated-package-manager matrix row, the opt-in Bun Remote/Users/UI/icon builds, and the disposable PostgreSQL Users runtime gate. The matrix test accepts a CI-only manager selector so each job installs and exercises one exact toolchain without weakening the all-manager local opt-in mode.
- Windows generated-project jobs use the runner's canonical temporary directory instead of its legacy 8.3 alias, preventing SvelteKit/Vite manifest paths from mixing `RUNNER~1` with the long runner account name.

### Portable CLI artifact

npm 12.0.2 packed the CLI into a 1,458,188-byte tarball (5,232,694 bytes unpacked, 190 entries). Installing that tarball produced zero runtime dependencies because the Node-targeted CLI contains its registry and generator implementation plus required runtime assets. Under exact Node 24.19.0, the installed Windows bin shim passed `--help` and generated a real project in a path containing spaces with `--json --no-install --no-git`; stdout contained exactly one JSON line and stderr was empty. Bundle scans found no `Bun.*` runtime use and no external `@metonia-admin/*` imports. POSIX executable-mode verification remains a multi-OS publication gate because Windows reports the packed bin as mode 0644 even though the installed Windows shim works.

`create-metonia-admin@0.1.0` was then published to the public npm registry with `latest` pointing to `0.1.0` and the expected `create-metonia-admin -> dist/create-metonia-admin.js` binary mapping. From a new directory outside the monorepo and an empty npm cache, `npx --yes create-metonia-admin@0.1.0 --help` passed. A second public-registry `npx` invocation generated the default project with `--yes --no-install --no-git --json`; it exited successfully, emitted exactly one valid JSON line with empty stderr, created `package.json`, `metonia-admin.config.ts`, and `AGENTS.md`, and did not create `.git`. That exact generated output then passed `bun install`, Svelte check with 0 errors and 0 warnings, its Vitest suite, and the adapter-node production build.

`create-metonia-admin@0.1.1` was published with a 1,462,827-byte tarball (5,249,944 bytes unpacked, 193 entries) and the same binary mapping. A clean tarball install passed `--help` and generated a Mauve project with matching `components.json`, generated config, and CSS snapshot data. After public-registry propagation, direct `npx`, `npm create metonia-admin`, and `bunx` invocations passed `--help`. A public `npx` run generated a Mist project with matching registry/config output and no Git repository. Finally, a live no-argument `bunx` run accepted both prompt defaults, generated `./my-admin` relative to the current terminal directory, and produced the selected Taupe snapshot without the former blank-destination crash.

`create-metonia-admin@0.1.2` was published with a 1,463,296-byte tarball (5,252,042 bytes unpacked, 193 entries) to address Windows editor locks during finalization. Generator tests prove that same-filesystem staging is kept outside the destination workspace and include a Windows regression that would hold an in-workspace staging directory open like an editor worker. A real built-CLI run and a second public-registry `bunx` run both completed dependency installation and Git initialization while the destination workspace contained no staging entry; the private staging tree appeared only under the same-volume system temporary directory, was atomically published to the final destination, and left no staging residue. The public project contained `package.json`, `node_modules`, and `.git`, and npm reported `latest` as `0.1.2`.

`create-metonia-admin@0.1.3` was published with a 1,466,189-byte tarball (5,262,903 bytes unpacked, 193 entries) to add visible progress during generation. Unit tests verify that interactive runs start and close the activity indicator for both success and failure, while JSON and non-TTY runs never create one. A clean packed-artifact install passed help and single-line JSON generation with empty stderr. An exact public-registry `bunx` run displayed the animated `Creating project, installing dependencies, and initializing Git` status, completed dependency installation and Git initialization, ended with `Project generated successfully`, and left no staging residue. A separate public JSON run emitted one valid line with empty stderr and no animation. npm then reported `latest` as `0.1.3`.

`create-metonia-admin@0.1.4` was published with a 1,468,590-byte tarball (5,273,241 bytes unpacked, 194 entries) containing the redesigned Dashboard, generated shadcn-svelte operations table, refresh skeleton, empty result, navigation progress, custom root 404, and semantic brand/success/warning tokens. A clean packed-artifact install passed help and deterministic generation while confirming that the retired RecipeTrace component was absent. After npm processing completed, the registry reported `latest` as `0.1.4`. An exact public-registry `bunx create-metonia-admin@0.1.4` run in a fresh cache generated the new surfaces, installed 168 packages, reported 0 Svelte errors and 0 warnings, passed Vitest, and completed the adapter-node production build.

`create-metonia-admin@0.1.5` was published with a 1,477,345-byte tarball (5,309,987 bytes unpacked, 199 entries). It adds stage-specific, low-flicker progress messages; lock-aware Docker plans for Bun, npm, pnpm, and Yarn; a denser generated admin shell; token-consistent shadcn-svelte Select filters; and adapter-owned Lucide, Tabler, HugeIcons, Phosphor, and Remix Icon selection. The full generated-project package-manager matrix repeated successfully on Windows: all four managers completed install, frozen/immutable install, check, test, and build. The local Bun 1.3.14 and npm 10.9.8 executions intentionally did not satisfy the separate exact-version assertions for Bun 1.4.0 and npm 12.0.2; pnpm 11.23.0 and Yarn 4.18.0 matched their evidence versions. npm continued to report 10 transitive audit findings (6 low, 4 moderate).

A clean tarball installation under Node 22.23.2 passed `--help` and generated an npm + Docker + Remix Icon project with matching `components.json`, dependency, and Dockerfile output. After npm processing completed, the public registry reported `latest` as `0.1.5`. A fresh-cache public `npx create-metonia-admin@0.1.5` run generated an npm + Docker + Tabler project with one valid JSON result and the expected lock-aware Docker commands; a separate no-cache public `bunx create-metonia-admin@0.1.5 --help` invocation also passed.

### Default Standard project

The bundled Node CLI generated a fresh default application into a path containing spaces with dependency installation enabled. The output included Dashboard, Settings, full Users, zinc shadcn-svelte UI, Zod, Drizzle, generic PostgreSQL/`pg`, configuration-aware documentation, and no Metonia runtime dependency.

Executed successfully:

```text
create-metonia-admin <temporary path> --yes --install --no-git --json
bun run check
bun run test
bun run build
```

The generated check reported 0 errors and 0 warnings; Vitest passed; adapter-node produced a production build. The generated Bun lockfile, Users route, migration, and Node build artifact were asserted.

The committed `apps/reference-admin` was generated by the same CLI with `--no-install --no-git`; it independently passed check, test, and build as a workspace. It is generated output and must be regenerated rather than hand-edited.

### Data and Users runtime

The Standard project applied its checked-in migration to disposable PostgreSQL 17.11 and exercised Users list, search, filter, sort, pagination, detail, create, edit, disable, delete, invalid input, and server-action behavior. The ordinary create/edit path cannot set `disabled`; disabling/deleting uses the exact-email guarded danger action. Database initialization remains lazy, so check/test/build need no live database.

### Remote Functions

Current official SvelteKit documentation was rechecked before implementation. The generated experimental path uses a route-local `.remote.ts` validated `query` boundary delegating to `$lib/server`, with the required compiler and SvelteKit experimental switches.

A fresh Remote project passed install, check, test, build, Node startup, and an HTTP 200 request. `apps/playground` is the CLI-generated Remote reference and also passed check, test, and build. It is deliberately a query-boundary proof: Users CRUD is rejected by central compatibility validation until parity exists.

### Package managers

Each row used the full primary generated graph rather than the earlier base-only graph.

| Manager      | Result  | Notes                                                                                                                                                                                                                                                                  |
| ------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bun 1.4.0    | Pass    | Generate, install, frozen install, check, test, adapter-node build.                                                                                                                                                                                                    |
| npm 12.0.2   | Pass    | Generate, install, `npm ci`, check, test, and adapter-node build passed on the exact stack; a later clean repeat with npm 10.9.8 also passed every behavioral gate. npm reported 10 transitive audit findings (6 low, 4 moderate); the application build still passed. |
| pnpm 11.23.0 | Pass    | Generate, install, frozen install, check, test, adapter-node build. Generated `pnpm-workspace.yaml` narrowly allows esbuild dependency builds; pnpm records the exact current lucide release-age exclusion in its project policy.                                      |
| Yarn 4.18.0  | Pass    | Generate, install, immutable install, check, test, adapter-node build. An empty local lockfile establishes the project boundary and `.yarnrc.yml` preapproves only `@lucide/svelte@1.34.0`; PnP's ESM-loader warning and disabled esbuild scripts were non-fatal.      |
| Deno 2.9.5   | Blocked | No generation claim. The complete shadcn/Drizzle/PostgreSQL/adapter-node/Docker hybrid remains unverified.                                                                                                                                                             |

All four passing managers remain Experimental in the public registry pending repeatable multi-OS release evidence.

### Docker

The Bun Docker path produced a pinned multi-stage build using `oven/bun:1.4.0`, a `node:24.19.0-bookworm-slim` non-root runtime, and PostgreSQL `17.11-bookworm` with health checks and persistent local storage. A clean disposable run verified image build, healthy app/database services, HTTP 200, runtime uid 1000, absence of development dependencies, and teardown.

Docker generation is package-manager-owned. Bun, npm, pnpm, and Yarn each render their own build image, lockfile copy, immutable install, build, and production-dependency command while retaining the same non-root Node runtime and PostgreSQL Compose contract. Structural recipe tests passed for all four and every manager produced a real lockfile during its full generated-project matrix.

The `0.1.6` candidate repeated the complete Docker path for all four managers on Docker Engine 29.2.0. Each freshly generated project installed its dependencies, built a production application image, started PostgreSQL 17.11, applied the checked-in Drizzle SQL from a one-shot non-root migration image, waited for the migration to complete successfully, reached the application health check, returned HTTP 200 from `/users`, and passed a real Users create/delete action against PostgreSQL. The migration images used only Node 24.19.0 plus production dependencies and measured 127,798,501 bytes for Bun, 125,117,840 for npm, 123,534,800 for pnpm, and 84,537,742 for Yarn. All four disposable Compose projects, networks, and volumes were removed after the tests; the unrelated pre-existing Docker workload was left running. Docker remains Experimental pending repeatable multi-OS release evidence.

### UI and accessibility

All generated Svelte files owned by the shadcn/admin and Users workstreams passed the official Svelte autofixer and Svelte diagnostics. Desktop and mobile visual smoke covered the responsive admin shell, Dashboard, Settings, Users, dialogs/menus, and the zinc theme.

The redesigned Dashboard preserves the adapter-neutral `components -> views -> pages -> routes` boundary while its operations view imports the generated shadcn-svelte Table primitive through `$lib/client/ui/components`. Browser review at 1440 × 1000 and 390 × 844 covered the operational-pulse hierarchy, search/status/time-window filtering, the refresh skeleton with an `aria-live` loading announcement, the resettable empty result, mobile navigation, and a custom root 404. The desktop table had no horizontal overflow at 1440 pixels; its narrow-screen container remains intentionally scrollable. The shell also exposes SvelteKit navigation progress and honors reduced-motion preferences. Semantic brand, success, and warning tokens are present in every pinned base-color snapshot rather than hard-coding one theme's palette.

The public website passed browser review at 375, 768, 1024, and 1440 pixel viewports with no horizontal overflow and no console warnings/errors. The 375-pixel pass found no non-checkbox interactive target below 44 pixels. Keyboard review verified the skip link and visible 3-pixel focus outline; the reduced-motion rule is present and the design has no ambient animation. Fluid UI remains visible but disabled. Remote + Users surfaced the registry's authoritative recovery text, while npm + Docker now resolves successfully through the same registry-driven configurator. The configurator consumes the registry's serializable catalog and resolver rather than copying option arrays or compatibility rules.

The generated admin shell was reviewed again at 1440 × 1000 and 375 × 812. The tighter sidebar, compact operational pulse, queue hierarchy, mobile navigation dialog, and shadcn-svelte Select popup had no horizontal overflow; the Select listbox used the same surface, foreground, border, focus, and selected-state tokens as its trigger. All changed Svelte files passed the official autofixer. Lucide passed the default full generated integration, and Tabler, HugeIcons, Phosphor, and Remix Icon each passed a separate real install, Svelte check, Vitest, and adapter-node production build.

All seven official shadcn-svelte 1.5.0 Nova base colors—Neutral, Stone, Zinc, Mauve, Olive, Mist, and Taupe—now have pinned preset codes, checked-in token snapshots, registry lookup coverage, and deterministic generated-output tests. Zinc retains the full responsive visual and generated-project install/check/test/build evidence; repeatable theme-specific visual and multi-OS build evidence for the other base colors remains pending.

## Deliberate limitations

- Authentication, authorization, sessions, CSRF policy, audit logging, rate limiting, and a production threat model are deferred. Generated documentation says the starter is not production-secure until access control is added.
- Fluid UI remains Unknown/Unavailable because an authoritative package, theme registry, component API, CSS contract, and licensing story were not established. No API was invented.
- All seven shadcn-svelte Nova base-color snapshots are selectable and deterministically generated. Zinc has the complete responsive visual and generated-project build evidence; equivalent repeatable multi-OS evidence for every theme remains pending.
- All five shadcn-svelte icon-library choices compile in generated projects on the primary Windows stack; repeatable multi-OS evidence remains pending.
- Remote Functions remain upstream Experimental and implement a validated query proof, not Users CRUD parity.
- No package-manager or Docker result is promoted to universal Stable support from a single host environment.
- Public-registry invocation is verified on Windows through npm/npx. POSIX executable metadata and repeatable multi-OS registry invocation remain release-hardening work rather than claims of universal support.

## Reproduction commands

From the monorepo root:

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

Opt-in package-manager and Docker/runtime matrices are intentionally separate from the fast root tier because they require exact external toolchains, network access, and disposable infrastructure.
