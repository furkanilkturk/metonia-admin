# Metonia Admin QA and integration strategy

## Purpose

This document defines the evidence required to trust Metonia Admin from one end to the other: capability selection, configuration resolution, CLI behavior, staged generation, and an application that a developer can install, check, test, build, and run without the generator. It is an executable quality strategy, not a promise that every capability or package-manager path is already supported.

The strategy follows the product and MVP specifications:

- The monorepo is Bun-first, but generated projects select their own package manager.
- The generated application is native SvelteKit with `src/lib/client`, `src/lib/server`, and `src/lib/shared`, and `components -> views -> pages -> routes` composition.
- Standard SvelteKit is the primary data-pattern proof. Remote Functions are a separate Experimental proof and share all non-boundary code.
- The registry is the source of truth for prompts, flags, validation, website configuration, generated configuration, documentation, and tests.
- A status label is a compatibility commitment. Package existence, a mocked recipe, or a successful file write is not integration evidence.

## Evidence language and test boundaries

Every test report must identify whether it exercised a mock, a generated project, or a real external dependency. The following terms have precise meanings:

| Layer | What it proves | What it does not prove |
| --- | --- | --- |
| Unit | Pure registry, config, CLI parsing, recipe, transform, and state behavior in isolation. | That generated files install or that an upstream tool still accepts the emitted configuration. |
| Contract | Agreement between registry consumers and generated artifacts, usually with fake adapters or a minimal filesystem. | A real package-manager install, SvelteKit build, database, or Docker image. |
| Generated-project smoke | A fresh project generated in a temporary directory has expected files, imports, scripts, configuration, and boundaries. | That dependencies resolve or that runtime behavior works. |
| Generated-project integration | A fresh project is installed and its selected `check`, `test`, and `build` commands pass. | Production deployment or every possible capability combination. |
| Runtime/infrastructure | Real PostgreSQL, Docker, browser, or upstream UI tooling is exercised. | Other environments not included in the stated matrix. |
| Manual review | Human inspection of accessibility, visual behavior, documentation meaning, or generated-code maintainability. | Repeatability unless the review is recorded with an artifact and checklist. |

Tests must fail closed for unsupported or unknown capabilities. A test that only asserts that an unsupported option can be serialized is not evidence that it is selectable or usable.

## Test pyramid

Keep the broad base fast and reserve external-process work for a small, explicit matrix.

| Tier | Contents | Typical trigger | Required output |
| --- | --- | --- | --- |
| T0 static | Type checking, lint/import-boundary checks, Svelte autofixer for changed components, secret and generated-file hygiene checks. | Every change | Command output and changed-file scope. |
| T1 unit | Registry IDs/statuses, compatibility, theme lookup, config normalization, conditional prompts, CLI flags/exit codes/JSON serializer, package-manager command plans, recipes and transforms. | Every PR | Named test results and coverage for changed logic. |
| T2 contract/golden | Registry-to-CLI/website/config/docs contracts; generated config, README, `AGENTS.md`, scripts, and canonical folder tree. | Every PR touching registry, generator, templates, or docs | Snapshot or structured diff with an intentional-update review. |
| T3 generated smoke | Fresh projects for representative configurations; no destination writes before validation; no client/server/shared violations; thin routes; no hidden Metonia runtime. | Every generator/template PR | Temporary project manifest, file list, and assertions. |
| T4 generated integration | Fresh generation followed by the selected package manager's install, check, test, and build. Include the real Users path where the stack advertises persistence. | Required stack on PR; promotion/nightly for additional adapters | Logs, versions, generated config, lockfile, and artifact paths. |
| T5 runtime QA | PostgreSQL migrations and Users CRUD, Docker build/compose path, browser keyboard/accessibility/visual checks, and any upstream UI adapter CLI/registry operation. | Release candidate or capability promotion | Database/Docker logs, screenshots/traces, accessibility report, and environment versions. |

Do not replace T4 or T5 with mocks. Mocks are useful for proving orchestration and failure handling, but they cannot promote an integration.

## Registry and configuration units

The registry and resolved configuration are contracts. Unit tests should be small, deterministic, and exhaustive over the registry entries rather than over every generated-project combination.

Recommended test cases (names are illustrative and should map to the repository's test runner):

- `registry exposes unique ids and valid statuses`
- `registry status metadata includes required description and docs evidence`
- `resolveConfig applies documented defaults deterministically`
- `resolveConfig rejects unknown package manager, UI, theme, data pattern, validation, ORM, or database id`
- `validateCompatibility rejects a theme owned by another UI adapter`
- `validateCompatibility rejects unsupported and unknown selections before generation`
- `themeLookup returns only themes from selected adapter`
- `conditionalQuestions asks themes only after UI selection`
- `conditionalQuestions omits irrelevant provider questions`
- `registry consumers expose the same selectable ids`
- `generatedConfig round trips through schema validation`

Test both positive and negative compatibility edges. At minimum, select a verified shadcn-svelte theme successfully and attempt a Fluid/shadcn cross-adapter theme mismatch; if Fluid remains Unsupported, assert that it cannot be selected as a working path rather than inventing a positive fixture.

The config tests must assert that the resolved object contains the versioned `metonia-admin.config.ts` shape and that package manager, UI/theme, data pattern, validation, ORM, database, Docker, and starter-resource choices are not silently dropped. Add a fixture for every registry capability status transition so changing `Experimental` to `Stable` requires a deliberate test update.

## CLI units and black-box behavior

Test argument parsing separately from process execution, then test the actual CLI entry point in a child process. The black-box suite must run with and without a TTY.

Required cases:

- Equivalent interactive answers, explicit flags, and `--yes` resolve the same configuration.
- Every material choice has a non-interactive representation; no test waits for stdin when all required values are explicit.
- `--json` writes exactly one parseable result to stdout on success and failure; decorative/progress output is absent from stdout and human diagnostics go to stderr.
- Invalid IDs, invalid combinations, an adapter/theme mismatch, an existing non-empty destination, and a failed generation stage produce non-zero exits, actionable stage/field information, and no final partial project.
- `--data-pattern remote-functions` is explicit consent in non-interactive mode; interactive mode presents the Experimental warning and confirmation.
- The selected package manager changes generated command instructions and lockfile expectations.
- Paths with spaces, Unicode characters, nested destinations, and Windows separators are handled without shell-specific assumptions.
- Help output and accepted aliases are tested as a user-facing contract; tests should not assert incidental decoration or terminal width.

Use a real subprocess for at least one success and one failure per CLI output mode. A unit test of a JSON formatter alone is insufficient because logs from a subprocess can still corrupt machine output.

## Generator, fixture, and staging strategy

### Fresh temporary projects are the source of truth

Integration tests must generate into a newly-created temporary directory outside the repository's source and fixture trees. Never run dependency installation, migrations, or Docker commands in a checked-in golden fixture. The test records the generated project path and removes it in a `finally`/cleanup step; failed runs may preserve a uniquely named artifact directory when CI diagnostics are needed.

Before generation, resolve and validate the complete config. Then write into a private staging directory on the same filesystem as the requested destination. Prefer the system temporary directory when it is on that filesystem so editor file watchers do not mistake an in-progress tree for the finished project; fall back to the destination parent when necessary. Publish the destination only after all file recipes that precede publication succeed. If a stage fails:

1. Report the stage id and the underlying safe error.
2. Leave the requested destination absent or unchanged.
3. Remove the staging directory, or retain it only as an explicitly reported diagnostic artifact.
4. Never recursively delete a path unless it was created by that test and its resolved absolute path is inside the test's private temp root.

Test an existing empty destination, an existing non-empty destination, a destination whose parent contains spaces, and a destination that differs only by Windows path separators. Test reruns to ensure a failed first run does not make a second valid run look like a collision.

### Fixtures

Maintain a small set of source-controlled fixtures, generated by the generator rather than hand-edited:

- `canonical-standard`: shadcn-svelte, one verified theme, Zod, Drizzle, generic PostgreSQL, Users, Docker off.
- `canonical-standard-docker`: the same stack with Docker enabled.
- `canonical-remote`: the same stack with Remote Functions, only while its official API is verified; always labelled Experimental.
- `package-manager-smoke`: the smallest valid app used to exercise each package-manager adapter without multiplying the complete UI/database fixture.
- `unsupported-or-unknown`: negative configuration cases proving that blocked capabilities are rejected or hidden.

Use structured assertions for paths, imports, scripts, and metadata. Use snapshots only for intentionally stable generated text. A fixture update must come from a generator run and include a review of the diff; do not “fix” a generated fixture by hand.

Generated-project tests must assert at least:

- `src/lib/client`, `src/lib/server`, `src/lib/shared` and `src/lib/client/ui/{components,views,pages}` exist.
- Client modules do not import `$lib/server`; shared modules do not import client or server modules; UI dependency direction is not reversed.
- Routes are thin adapters and use native `+page.server.ts`/loads/actions in Standard mode.
- Remote boundary modules, if present, validate public input and delegate to `$lib/server`; they do not duplicate repositories or business logic.
- `metonia-admin.config.ts`, `.env.example`, README, and `AGENTS.md` agree with the resolved config.
- The generated project has no required Metonia runtime dependency and contains no secrets.
- Dashboard, Users, and Settings are present when selected, and the Users resource has the expected shared schema/server repository/client views and pages.

## Matrix design and package-manager promotion

The matrix is intentionally layered instead of Cartesian. The full release gate applies to every combination that is advertised as Stable; unadvertised combinations are not silently covered by a nearby result.

### Required matrix axes

| Axis | Fast coverage | Promotion/release coverage |
| --- | --- | --- |
| UI adapter/theme | One verified shadcn-svelte theme; negative cross-adapter lookup | Every theme marked Stable at least once; every adapter has its own upstream install/config path. Fluid remains a research gate while authoritative details are unavailable. |
| Data pattern | Standard canonical fixture | Standard full gate; Remote Functions separate Experimental gate with current official API evidence. |
| Package manager | Command-plan units for all registry entries | Generate + install + check + test + build for each adapter labelled Stable; Deno requires dedicated research first. |
| Database | Config/recipe units | Real generic PostgreSQL migration and Users CRUD; provider-specific databases are out of scope. |
| Docker | File/content contract for on/off | Docker-enabled generated project build/compose/health/environment test on supported host/CI runtime. |
| Resources | Dashboard/Users/Settings contract | Users end-to-end persistence; Settings and Dashboard browser checks. |

The default promotion set is one canonical verified theme × Standard × each package-manager candidate × PostgreSQL, with Docker off and on as separate optional paths. Add Remote Functions as one targeted stack, not as a reason to duplicate every package-manager and Docker crossing before the upstream API is stable. Add more themes/adapters only when their own status gate requires them.

### Package-manager status gate

For a package manager to be labelled Stable for a stated stack, attach all of the following evidence from a clean environment or explicitly documented supported host:

1. The CLI generates a fresh project with that adapter, without a TTY, and writes the correct lockfile and command documentation.
2. The adapter installs dependencies from the generated project using its own command and exits successfully.
3. The generated project passes its selected `check`, `test`, and `build` scripts through that package manager.
4. If the stack advertises Docker or PostgreSQL, the corresponding generated path also passes its integration checks.
5. A rerun in a clean temporary directory passes, and a failed stage leaves no destination project.
6. The run records OS, architecture, runtime, package-manager, framework, and relevant upstream-tool versions, plus raw logs and the resolved config.
7. README, `AGENTS.md`, CLI help, registry status, website configurator, and compatibility docs all use the same package-manager status.

One passing Bun run does not promote npm, pnpm, Yarn, or Deno. A package manager may remain `Unknown` or `Experimental` with no compatibility claim. Research-dependent details such as published CLI runtime support, Deno semantics, and upstream package-manager flags are gates: verify them against current official documentation before writing a promotion result.

## Standard and Remote data-pattern tiers

### Standard SvelteKit: primary release tier

The Standard gate must prove native SvelteKit behavior, not a substitute API:

- Fresh generation, install, check, test, and build pass for the canonical stack.
- The Users list/read path uses SvelteKit loads and mutations use form actions or the current documented native mechanism.
- Route files remain thin, with repositories/services and database access under `$lib/server`.
- Browser and server validation produce field/form errors without leaking raw database errors.
- Users CRUD persists against real generic PostgreSQL in the runtime tier.

### Remote Functions: Experimental tier

Remote Functions are offered only after current official SvelteKit documentation confirms the API and semantics. The tier must show:

- Explicit Experimental status in registry, CLI, website, README, and generated `AGENTS.md`.
- Interactive warning/confirmation and no blocking prompt when selected explicitly in non-interactive mode.
- Fresh generation and install/check/test/build for the primary stack.
- Boundary input validation and delegation to shared server services/repositories.
- Shared pages, views, schemas, types, layout, navigation, and Users behavior with Standard; only transport boundary files differ.
- A documented failure/rollback path if upstream Remote Functions change.

Until that official research and generated-project build evidence exists, Remote Functions are a blocked research gate, not a passing test tier. Do not infer support from a model-generated `.remote.ts` file.

## UI and theme compatibility

Theme ownership is tested at three levels:

1. Registry unit tests return only themes owned by the selected adapter.
2. CLI/config tests reject a theme id that belongs to another adapter before staging or writing.
3. A generated-project integration test runs the real adapter initialization/theme application and checks that imports, CSS/tokens, aliases, and representative components compile and render.

For shadcn-svelte, the integration must verify the current official tooling and that generated primitives target `$lib/client/ui/components`, not the unrelated default path. Exact CLI flags, preset behavior, and theme mechanics are ecosystem gates and must be refreshed from current official documentation before a test is promoted.

Fluid UI is Unsupported until its authoritative package, registry, component imports, CSS/theme API, and installation behavior are identified and integration-tested. The QA suite should test truthful rejection/visibility, not fabricate a Fluid happy path.

## Database and Docker integration

### Database

The runtime database proof uses generic PostgreSQL, keeping ORM, dialect, provider, and driver distinct. In a disposable environment:

- Generate the project with the selected database config and `.env.example`.
- Start or provision PostgreSQL using the documented path; never rely on an undeclared developer database.
- Apply migrations using the generated project's documented command.
- Exercise Users create, list/search/filter, edit, disable/delete (as applicable), and invalid-input paths through the generated server boundary.
- Assert persistence, transaction/error behavior, and actionable non-sensitive errors.
- Assert client/browser code cannot import database clients or private environment modules.

The exact migration command, driver, and SvelteKit runtime must be verified against current Drizzle and SvelteKit documentation before being made a stable gate. Provider-specific Neon/Supabase behavior is not covered by generic PostgreSQL evidence.

### Docker

Docker is an optional generated feature, not a requirement for all tests. For Docker-enabled candidates, verify in a disposable project:

- `Dockerfile`, `.dockerignore`, `compose.yaml`/`docker-compose.yml`, scripts, and environment examples are present only when selected and agree with README/`AGENTS.md`.
- The image builds from a clean context without secrets or repository-only paths.
- The documented container starts, reaches its health condition, and exposes the expected app port.
- If the generated path includes PostgreSQL, the service, volume/healthcheck, and `DATABASE_URL` wiring work together and migrations/Users checks pass.
- Docker-off output does not reference Docker-only commands or files.

Host availability, Docker engine version, base images, and SvelteKit adapter behavior are recorded. If an upstream Docker or runtime detail is unresolved, keep the result as a gate or Experimental rather than treating a local build as universal support.

## Documentation drift and generated-artifact consistency

Documentation is part of the product surface. Add a contract test that derives expected selectable IDs, statuses, command names, and theme ownership from the registry, then checks:

- CLI `--help` and non-interactive flag metadata.
- Website configurator choices and Experimental/Unsupported labels.
- Compatibility/status tables and research notes.
- Generated `metonia-admin.config.ts`, README, `AGENTS.md`, `.env.example`, scripts, and actual lockfile.

For each canonical fixture, compare the resolved config to all generated documentation fields and package-manager commands. Fail on contradictions such as a `pnpm` config documenting `bun test`, a Remote project lacking its Experimental warning, authentication being implied, or an Unsupported Fluid path appearing as selectable.

Use a small explicit allowlist for prose that is intentionally broader than the current matrix (for example, future roadmap text). Do not build a brittle full-markdown snapshot. A release reviewer must inspect changes to status words (`Stable`, `Experimental`, `Unsupported`, `Unknown`) and confirm that each has matching evidence.

## Security baseline checks

MVP authentication and authorization are deferred; generated applications must say they are not production-secure by default. QA must still enforce these baseline properties:

- Browser and Remote Function inputs are validated at the server boundary with the selected validation adapter.
- Database clients, repositories, private environment access, and secrets stay under `$lib/server` or another server-only boundary.
- ORM queries are parameterized; no raw user-controlled SQL construction is present in the Users path.
- Raw database errors, stack traces, connection strings, and private environment values are not rendered or returned to users.
- `.env.example` contains placeholders/documented names only; secret scanners find no committed credentials in generated output.
- Destructive disable/delete actions have an explicit guarded flow and are not accidental GET/navigation mutations.
- README and `AGENTS.md` clearly defer authentication, authorization, sessions, CSRF policy, audit logging, rate limiting, and threat modelling.

Prefer targeted static checks plus one runtime negative test over a large security scanner suite. Dependency/vulnerability scanning may be a release-environment gate once the supported tool and policy are selected; it is not evidence of the application-boundary checks above.

## Accessibility and visual QA

Accessibility is a release criterion for the generated admin shell and Dashboard/Users/Settings examples. Automated browser checks should cover representative desktop and mobile viewports, with the exact browser/axe tooling treated as an ecosystem/tooling gate until selected and documented.

Automated and manual checks must cover:

- Semantic landmarks, headings, buttons, links, form labels, descriptions, and field/form error associations.
- Keyboard-only navigation, visible focus, focus order, escape behavior, and focus return for dialogs and mobile navigation.
- Menu and dialog semantics, disabled/pending states, and no keyboard trap.
- Users table headers, row actions, sorting/filter controls, pagination, empty/error/loading states, and a usable narrow viewport presentation.
- Contrast for text, controls, focus indicators, status badges, and selected theme tokens.
- Responsive desktop/mobile navigation, breadcrumbs, page actions, and horizontal overflow behavior.
- Reduced-motion behavior for any introduced transitions or animations.

Record screenshots at fixed viewport sizes and stable seeded data for visual checks. Treat visual snapshots as review aids: allow intentional theme/font/platform differences through scoped thresholds, but do not ignore structural regressions. A visual pass cannot waive keyboard or semantic failures.

## CI tiers and flake controls

Use three practical CI tiers:

### Pull request tier

Run Bun install/cache validation, T0/T1/T2, generated smoke for canonical Standard and negative configs, one representative generated install/check/test/build, and changed-doc drift checks. Keep this tier deterministic and reasonably fast.

### Scheduled/promotion tier

Run the full Stable package-manager matrix, Docker-enabled path, real PostgreSQL Users path, every Stable theme required by the registry, browser accessibility/visual checks, and current-version research gates. Run Remote Functions here as a separate Experimental job when enabled.

### Release tier

Repeat promotion jobs from clean environments, capture versions/logs/artifacts, verify status/docs alignment, and perform the release checklist below. A flaky job is not a pass: quarantine the test with an owner and evidence, or remove the status claim until it is deterministic.

Control environment-dependent flakes by:

- Pinning or recording runtime/tool versions and using disposable directories/databases/volumes.
- Avoiding network-dependent tests in the fast tier; cache only with a lockfile and retain a clean-install job.
- Using unique project/database names and random-free seeded data where possible.
- Waiting on health/readiness signals rather than fixed sleeps.
- Retrying only infrastructure setup, never assertion failures, and reporting all attempts.
- Running Windows path/process smoke separately from POSIX shell assumptions.
- Preserving generated projects, logs, screenshots, and traces on failure.

## Release checklist

Before publishing or promoting a capability:

- [ ] Root Bun install, check, lint, tests, build, website, and playground checks pass.
- [ ] Registry IDs, statuses, compatibility, theme ownership, recipes, transforms, and command plans have unit coverage.
- [ ] Invalid configurations fail before destination writes; failed stages leave no partial final project.
- [ ] Canonical projects are freshly generated in temporary directories and pass artifact/boundary assertions.
- [ ] Every claimed Stable package manager has clean generate/install/check/test/build evidence for the advertised stack, with OS/runtime/tool versions and logs.
- [ ] Standard mode proves native SvelteKit loads/actions and real PostgreSQL Users persistence.
- [ ] Remote Functions, if offered, have current official API evidence, generated-project build evidence, explicit Experimental labels, and a separate report.
- [ ] Each Stable UI/theme path uses verified upstream tooling and compiles/renders representative components; cross-adapter themes fail validation.
- [ ] Docker-on and Docker-off outputs, image/compose/health behavior, and environment wiring match documentation where Docker is advertised.
- [ ] Generated README, `AGENTS.md`, config, CLI help, website, compatibility docs, and tests agree; authentication is clearly deferred.
- [ ] Security baseline checks pass: server validation, server-only imports, no secrets/raw errors, parameterized persistence, and guarded destructive actions.
- [ ] Accessibility and visual review artifacts cover semantic/keyboard/focus/forms/dialogs/menus/tables/contrast/responsive/reduced-motion criteria.
- [ ] Windows/path and non-TTY/JSON CLI checks pass for the release candidate.
- [ ] No capability is labelled Stable based only on a mock, a source fixture, a single OS, or a neighboring adapter's result.

The final release report should link each checked box to a test run or artifact. If evidence is missing, downgrade the capability to `Experimental`, `Unknown`, or `Unsupported` and state the exact gate that remains.
