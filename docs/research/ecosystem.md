# Ecosystem verification — 2026-08-24

This is a point-in-time verification for Metonia Admin. It uses project-owned documentation, package metadata from the public npm registry, and official project documentation or repositories. It does not treat blog posts, search snippets, or similarly named packages as authority.

The version numbers below mean “observed on 2026-08-24”, not “float to this version forever”. Generator fixtures must use one centrally recorded, integration-tested version set. Refreshing a dependency is a deliberate compatibility change.

## Status vocabulary

| Status         | Meaning in this document                                                                                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stable`       | The upstream feature is documented without an experimental warning and has a current non-prerelease release. A Metonia integration may be advertised as stable only after its generated install/check/test/build path passes. |
| `experimental` | Upstream labels the feature experimental, or the proposed cross-runtime combination is not ready for a stable support promise.                                                                                                |
| `unsupported`  | Deliberately excluded from the supported Metonia path.                                                                                                                                                                        |
| `unknown`      | There is not enough authoritative evidence or integration-test evidence to promise support.                                                                                                                                   |

“Upstream status” and “Metonia integration status” are separate. A stable package does not make a not-yet-tested generator recipe stable.

## Version and support snapshot

| Surface                                  | Verified version or API                                                                                                                        | Upstream status                       | Metonia decision on 2026-08-24                                                                                                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Svelte                                   | [`5.56.10`](https://registry.npmjs.org/svelte/5.56.10)                                                                                         | `stable`                              | Stable baseline; generate Svelte 5 runes-mode code.                                                                                                                                     |
| SvelteKit                                | [`2.70.3`](https://registry.npmjs.org/%40sveltejs%2Fkit/2.70.3)                                                                                | `stable`                              | Stable baseline. Do not select the `next`/3.x prerelease line for the stable matrix.                                                                                                    |
| Standard SvelteKit data boundary         | Server `load` plus form actions                                                                                                                | `stable`                              | Default data mode.                                                                                                                                                                      |
| Remote Functions                         | Available since Kit 2.27; still explicitly experimental                                                                                        | `experimental`                        | Explicit opt-in capability only; never imply parity with the stable default.                                                                                                            |
| `sv`                                     | [`0.17.0`](https://registry.npmjs.org/sv/0.17.0)                                                                                               | `stable` (current 0.x release)        | Pin the exact tested version; its public `create` API is preferable to a nested package-runner process.                                                                                 |
| `shadcn-svelte`                          | [`1.5.0`](https://registry.npmjs.org/shadcn-svelte/1.5.0), Svelte 5 peer                                                                       | `stable`                              | Intended first stable UI adapter, but the Metonia adapter remains `unknown` until its generation matrix passes.                                                                         |
| shadcn-svelte custom registry authoring  | Current registry builder documentation                                                                                                         | `experimental`                        | Do not make a custom registry a stable generator dependency. Adding components from a reviewed registry URL is a separate operation.                                                    |
| Fluid UI adapter                         | Intended package/registry/theme identity not established                                                                                       | `unknown`                             | Blocked and unavailable; do not invent imports, components, CSS, theme IDs, or registry URLs.                                                                                           |
| Bun                                      | [`1.4.0`](https://api.github.com/repos/oven-sh/bun/releases/latest) latest release                                                             | `stable`                              | Stable internal monorepo toolchain; public CLI runtime portability is a separate concern.                                                                                               |
| npm                                      | [`12.0.2`](https://registry.npmjs.org/npm/12.0.2)                                                                                              | `stable`                              | Generated-project candidate; integration support remains below Stable until the full multi-OS matrix passes.                                                                            |
| pnpm                                     | [`11.23.0`](https://registry.npmjs.org/pnpm/11.23.0)                                                                                           | `stable`                              | Generated-project candidate with manager-owned build-script approvals; integration support remains below Stable until the full multi-OS matrix passes.                                  |
| Yarn                                     | [`4.18.0`](https://registry.npmjs.org/%40yarnpkg%2Fcli-dist/4.18.0)                                                                            | `stable`                              | Generated-project candidate with a local project boundary and narrowly scoped release-gate preapproval; integration support remains below Stable until the full multi-OS matrix passes. |
| Deno                                     | [`2.9.5`](https://api.github.com/repos/denoland/deno/releases/latest) latest release                                                           | `stable` package manager/runtime      | Metonia generated-project combination is `unknown` and unavailable until the complete hybrid matrix passes.                                                                             |
| Zod                                      | [`4.4.3`](https://registry.npmjs.org/zod/4.4.3)                                                                                                | `stable`                              | Stable validation candidate; Metonia recipe still needs integration tests.                                                                                                              |
| Drizzle ORM / Kit                        | [`drizzle-orm@0.45.2`](https://registry.npmjs.org/drizzle-orm/0.45.2), [`drizzle-kit@0.31.10`](https://registry.npmjs.org/drizzle-kit/0.31.10) | `stable` releases                     | Use the stable dist-tag line for the stable matrix; do not silently take 1.0 release candidates.                                                                                        |
| PostgreSQL `pg` driver                   | [`pg@8.23.0`](https://registry.npmjs.org/pg/8.23.0)                                                                                            | `stable`                              | Recommended generic Node/PostgreSQL default, subject to generated-project tests.                                                                                                        |
| PostgreSQL.js driver                     | [`postgres@3.4.9`](https://registry.npmjs.org/postgres/3.4.9)                                                                                  | `stable`                              | Supported only as a distinct driver capability after its own tests.                                                                                                                     |
| Neon serverless driver                   | [`@neondatabase/serverless@1.1.0`](https://registry.npmjs.org/%40neondatabase%2Fserverless/1.1.0)                                              | `stable` package, provider-specific   | Not the generic PostgreSQL default; its package requires Node 19 or newer.                                                                                                              |
| `@sveltejs/adapter-node`                 | [`5.5.7`](https://registry.npmjs.org/%40sveltejs%2Fadapter-node/5.5.7)                                                                         | `stable`                              | Node/Docker deployment target, subject to generated container tests.                                                                                                                    |
| `adapter-static` for native dynamic CRUD | Static output only                                                                                                                             | `stable` adapter, incompatible target | `unsupported` for the normal Metonia admin backend; it would need a separate external API.                                                                                              |

The current Svelte package declares Node `>=18`, and Kit declares Node `>=18.13`, but Node 18 and 20 are already end-of-life on the snapshot date. Node 22 and 24 are LTS, and Node 24.19.0 is the latest LTS, so generated Node deployments and the published CLI should target and test supported LTS releases rather than merely Kit’s historical engine floor. See the official [Node release table](https://nodejs.org/en/about/previous-releases) and [Node 24.19.0 release directory](https://nodejs.org/download/release/latest-v24.x/).

## Svelte 5 and stable SvelteKit boundaries

Svelte 5 runes are supported in `.svelte`, `.svelte.js`, and `.svelte.ts` files; they are compiler syntax rather than imported functions. Legacy syntax remains supported, but it is not the right default for newly generated Metonia code. See [What are runes?](https://svelte.dev/docs/svelte/what-are-runes).

The stable server boundary remains native SvelteKit:

- Put database/private-environment reads in `+page.server.ts` or `+layout.server.ts` server `load` functions. SvelteKit explicitly distinguishes universal and server load functions and documents generated `PageProps` for route components in [Loading data](https://svelte.dev/docs/kit/load).
- Put ordinary POST mutations in named or default actions exported from `+page.server.ts`; enhance forms when the UX needs it. Form actions remain documented and feature-complete in [Form actions](https://svelte.dev/docs/kit/form-actions).
- Keep database modules, private environment imports, repositories, and services server-only. SvelteKit prevents server-only imports from reaching browser code as documented in [Server-only modules](https://svelte.dev/docs/kit/server-only-modules).

Implementation implication: Standard mode is the default and uses thin routes that delegate to `$lib/server` services/repositories and share Zod schemas/domain contracts from `$lib/shared`. It does not add REST, tRPC, GraphQL, or a client query framework.

## Remote Functions: experimental, opt-in, and boundary-only

The current [Remote Functions documentation](https://svelte.dev/docs/kit/remote-functions) says the feature is experimental and can change without notice. Enable it only when the user explicitly selects the experimental data mode. Both flags are required. A current `sv@0.17.0` scaffold puts configuration in the `sveltekit({...})` Vite plugin call, so its concrete shape is:

```ts
// vite.config.ts
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				experimental: {
					async: true
				}
			},
			adapter: adapter(),
			experimental: {
				remoteFunctions: true
			}
		})
	]
});
```

SvelteKit has accepted configuration through the Vite plugin since 2.62.0. In that form the former `kit` members, including `adapter` and Kit’s `experimental.remoteFunctions`, are flattened into the `sveltekit` argument while `compilerOptions` remains alongside them. The official [configuration reference](https://svelte.dev/docs/kit/configuration) shows this exact Remote Functions shape and says an existing `svelte.config.js` is ignored when plugin configuration is present. Generator transforms must detect the scaffold’s active configuration location rather than create a second, ineffective config file.

Remote modules use `.remote.js` or `.remote.ts`. Upstream permits them anywhere under `src` except `src/lib/server`; placing route-specific files beside their routes is a Metonia convention, not an upstream requirement. They execute on the server but are transformed into client-callable wrappers. The current server exports are documented under [`$app/server`](https://svelte.dev/docs/kit/%24app-server):

| API           | Appropriate Metonia use                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `query`       | Dynamic reads. Results are cached/deduplicated per argument and expose refresh/update operations.                                     |
| `query.batch` | Batch same-macrotask reads to prevent N+1 database access.                                                                            |
| `query.live`  | Async-iterable live data. Keep outside the MVP unless there is a tested need and cleanup/reconnect policy.                            |
| `form`        | Create/edit mutations that should retain native form behavior and progressive enhancement.                                            |
| `command`     | Imperative, JavaScript-required operations such as disable/delete when a form is not appropriate. Prefer `form` for form-shaped work. |
| `prerender`   | Build-time data that changes no more often than a deployment; not dynamic admin records.                                              |

The first argument can be a [Standard Schema](https://standardschema.dev/) validator, and the SvelteKit docs specifically include Zod and Valibot. Every mutation still validates untrusted input and performs authorization inside the server boundary. A remote file may import a repository from `$lib/server`; it must not move the repository or database client into the remote module.

Mutation consistency uses the query instance APIs documented on the same page: call `.refresh()` when the server should refetch, `.set(value)` when the mutation already has the authoritative value, and client-side `.withOverride(...)` for a scoped optimistic override. For filtered/list queries requested by the client, a `form` or `command` can inspect `requested(query, limit)` and refresh the returned bound instances. The numeric limit is mandatory because the client controls the requested list; use a small domain-specific bound, never an unexamined `Infinity`.

Implementation implications:

- Standard and Remote modes share page/view/component code, schemas, types, services, repositories, and database configuration. Only boundary glue differs.
- Keep remote files thin and call `getRequestEvent()` where request state is required.
- Show the experimental label in CLI help, config, generated README, capability registry, and tests.
- Test both data modes against the primary stack. Do not promise compatibility for every UI/database/package-manager cross-product until tested.
- Dynamic CRUD needs a server runtime. [`adapter-static`](https://svelte.dev/docs/kit/adapter-static) is not a native replacement for the Standard or Remote server boundary.

## `sv` scaffolding and non-interactive use

The current [`sv create` reference](https://svelte.dev/docs/cli/sv-create) documents:

```text
npx sv create [options] [path]
```

Relevant options are `--template minimal|demo|library`, `--types ts|jsdoc` or `--no-types`, `--add`, `--no-add-ons`, `--install npm|pnpm|yarn|bun|deno`, `--no-install`, and `--no-dir-check`. It does not document a general `--yes` flag for `create`.

A fully specified shell scaffold is therefore:

```text
<package-runner> sv@0.17.0 create <verified-empty-staging-directory> \
  --template minimal \
  --types ts \
  --no-add-ons \
  --no-install
```

Do not use `--no-dir-check` to bypass safeguards on the user’s destination. Create into a verified empty temporary directory, apply generator recipes, validate the result, and move it into place only after success. `--no-install` prevents an early install and an unintended lockfile before the selected package-manager adapter has completed all recipes.

A 2026-08-24 probe of that exact `sv@0.17.0` command generated `vite.config.ts` and no `svelte.config` file. Its template ranges were `@sveltejs/adapter-auto ^7.0.1`, `@sveltejs/kit ^2.63.0`, `@sveltejs/vite-plugin-svelte ^7.1.2`, `svelte ^5.56.1`, `svelte-check ^4.6.0`, TypeScript `^6.0.3`, and Vite `^8.0.16`. The official [`sv` changelog](https://github.com/sveltejs/cli/blob/main/packages/sv/CHANGELOG.md#0160) records the template’s move to Vite-plugin configuration. Treat scaffold output as an upstream input to inspect/transform; do not assume `svelte.config.js` or rewrite its package ranges to registry `latest` without a tested upgrade decision.

Even with `--no-install`, that probe printed pnpm-flavored next steps because `sv` detected the ancestor repository’s package-manager metadata. Metonia must generate next steps, README commands, and the final lockfile from its resolved package-manager capability rather than copying `sv`’s ambient suggestion.

For the portable published CLI, prefer `sv`’s documented public API over spawning `npx`, `pnpm dlx`, `yarn dlx`, or `bunx` from inside the generator. The [`sv@0.17.0` API snapshot](https://raw.githubusercontent.com/sveltejs/cli/sv%400.17.0/packages/sv/api-surface.md) exports:

```ts
import { create } from 'sv';

create({
	cwd: stagingDirectory,
	name: projectName,
	template: 'minimal',
	types: 'typescript'
});
```

This removes nested package-manager detection, download prompts, and a hidden Bun requirement. Keep `sv` on an exact tested dependency version because it is still pre-1.0, and treat a version bump as a generator-input change. The official [0.15.0 changelog](https://github.com/sveltejs/cli/blob/main/packages/sv/CHANGELOG.md#0150) records the current object-form `create({ cwd, ...options })` API and deprecates the older overload.

The fact that `sv create --install deno` exists proves only that `sv` can select Deno for dependency installation. It does not prove that every generated dependency, script, adapter, database driver, or runtime works under Deno.

## shadcn-svelte adapter

### Initialization and component installation

The official [CLI reference](https://www.shadcn-svelte.com/docs/cli) and a live `shadcn-svelte@1.5.0 init --help` check expose explicit flags for the configuration Metonia needs. `init` supports `--preset`, `--cwd`, `--no-deps-install`, `--skip-preflight`, base color, CSS path, and aliases; it does **not** expose `--yes`. `add` and `apply` do expose `-y`/`--yes`.

Use the package-manager command adapter to supply `<exec>`, but provide all init inputs so a fresh staged project does not prompt:

```text
<exec> shadcn-svelte@1.5.0 init \
  --cwd <staging-directory> \
  --base-color zinc \
  --css src/routes/layout.css \
  --lib-alias '$lib' \
  --components-alias '$lib/client/ui/components' \
  --ui-alias '$lib/client/ui/components' \
  --utils-alias '$lib/client/utils' \
  --hooks-alias '$lib/client/hooks' \
  --no-deps-install

<exec> shadcn-svelte@1.5.0 add button card dialog dropdown-menu input table \
  --cwd <staging-directory> \
  --yes \
  --no-deps-install
```

`--no-deps-install` lets the selected package-manager adapter perform one final install after all recipes have contributed dependencies. Because `init` has no `--yes`, prompt-free operation must be proven in an integration test against a fresh scaffold; do not assume `CI=1` will invent missing answers.

### Custom aliases

The official [`components.json` reference](https://www.shadcn-svelte.com/docs/components-json) says aliases control both generated-file placement and generated imports and must also resolve in the Svelte/Vite alias configuration. The important Metonia fragment is:

```json
{
	"aliases": {
		"components": "$lib/client/ui/components",
		"ui": "$lib/client/ui/components",
		"utils": "$lib/client/utils",
		"hooks": "$lib/client/hooks",
		"lib": "$lib"
	}
}
```

Setting only `components` is insufficient: registry UI primitives use the dedicated `ui` alias. Set both aliases before `add`, then assert that generated primitives land under `src/lib/client/ui/components` and that none are written to the unrelated default `src/lib/components/ui` path. `$lib` already resolves in SvelteKit; any more specific custom aliases must be reflected in project configuration.

### Themes, presets, and registries are different concepts

- shadcn-svelte’s [theming guide](https://www.shadcn-svelte.com/docs/theming) uses CSS custom properties. The current init base-color choices are `neutral`, `stone`, `zinc`, `mauve`, `olive`, `mist`, and `taupe`; these are suitable as explicit adapter-owned theme choices after snapshot tests.
- The current CLI can `apply <preset>` and limit an application with `--only theme` or `--only font`. Preset codes are opaque inputs, not durable Metonia theme identifiers. Metonia pins one reviewed Nova preset code for each of the seven official base colors and checks in the decoded color tokens rather than depending on a live preset response during generation.
- The official [registry overview](https://www.shadcn-svelte.com/docs/registry) and [registry item schema](https://www.shadcn-svelte.com/docs/registry/registry-item-json) describe URL-installable items, including `registry:theme` and `registry:style`. The site explicitly labels building a custom registry experimental. Do not make Metonia’s stable adapter depend on operating its own shadcn registry until upstream removes that warning and the full path is tested.

Themes belong to the shadcn adapter. Store the selected stable Metonia theme ID separately from the upstream base color or opaque preset code, resolve it through the typed registry, and fail invalid cross-adapter combinations before writing files.

### shadcn-svelte icon libraries (verified 2026-08-25)

The pinned `shadcn-svelte@1.5.0` schema and preset API expose exactly five icon-library IDs: `lucide`, `tabler`, `hugeicons`, `phosphor`, and `remixicon`. The current [components.json documentation](https://www.shadcn-svelte.com/docs/components-json) defines `iconLibrary` as the project-level choice used when registry components are generated. Metonia therefore stores the selected ID under the shadcn adapter, writes it to `components.json`, installs only its required icon package or packages, and renders the generated shell through a semantic icon adapter. This avoids leaving the starter on Lucide while later `shadcn-svelte add` commands use another family.

`remixicon-svelte@0.0.5` publishes per-icon exports under `remixicon-svelte/icons/*`. The semantic adapter imports those subpaths directly; importing named icons from the package root caused the complete icon set to remain in the client bundle and produced a multi-megabyte chunk during the Docker release gate.

The operational filters use the current [shadcn-svelte Select](https://www.shadcn-svelte.com/docs/components/select) contract instead of raw browser selects, so the trigger, popup, focus state, and selected indicator share the generated design tokens. Native selects remain appropriate for simple form fields where platform-native mobile behavior is preferable.

## Fluid UI: public candidate found, intended integration still unverified

Research found a public package named [`fluid-ui-svelte@0.3.5`](https://registry.npmjs.org/fluid-ui-svelte/0.3.5), a linked [GitHub repository](https://github.com/ayazemre/fluid-ui-svelte), and [documentation](https://fluidui.io/documentation/getting-started). Those sources describe a Svelte 5 library with `fluid-ui-svelte`, `fluid-ui-svelte/base`, and `fluid-ui-svelte/components` exports and a separate stylesheet.

That name match is not enough to establish that it is the “first-party/internal Fluid UI” intended by the Metonia specification. The public [how-to documentation](https://fluidui.io/documentation/how-to) still contains unfinished theming/customization material, and no authoritative registry, CLI contract, preset/theme catalog, or ownership link to Metonia was found. Other products named Fluid UI are unrelated.

Decision: the Metonia Fluid adapter is `unknown`/blocked and should remain unavailable. Before implementation, an owner must supply or confirm the exact package, repository, documentation version, component inventory, CSS entry point, registry/install mechanism, theme IDs/tokens, licensing, and accessibility expectations. Do not adopt the public candidate or invent an API from its name alone.

## Bun monorepo, testing, and publishing

### Internal repository

Bun’s [workspace documentation](https://bun.com/docs/pm/workspaces) supports root `workspaces`, `workspace:*` dependencies, filters, and a root `bun.lock`. That matches the constitution: use Bun for this repository and do not introduce npm, pnpm, or Yarn lockfiles here.

Use `bun test` for Bun-native unit/integration coverage. Bun documents a Jest-like API but explicitly says it is not completely compatible with Jest in the [test runner guide](https://bun.com/docs/test). Consequently, a passing Bun test suite is not evidence that a published CLI works under Node or every package runner.

### Public CLI artifact

Build a regular Node-compatible JavaScript CLI, not a platform-specific Bun executable:

- Compile TypeScript to ESM JavaScript using `bun build --target=node` as documented in the [bundler guide](https://bun.com/docs/bundler).
- Publish exactly one explicit binary mapping, for example `"bin": { "create-metonia-admin": "dist/cli.js" }`, and begin that file with `#!/usr/bin/env node`. npm documents bin linking and Windows command shims in the [`package.json` `bin` field](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#bin).
- Keep `Bun.*` and `bun:*` APIs out of the published runtime path. Use portable Node APIs and a normal JS bundle/dependency graph. If `sv` remains external, import its public API as a declared runtime dependency rather than spawning a package runner.
- Set `files`, `type`, and a supported `engines.node` range deliberately. On this snapshot, Node 22 and 24 are the LTS test targets.
- Inspect the packed tarball, preserve the executable bit, test install/run from the tarball, and use Bun’s documented [`bun publish --dry-run`](https://bun.com/docs/pm/cli/publish) before publishing.

On 2026-08-24, direct `npm view create-metonia-admin ...` and `npm view metonia-admin ...` queries returned registry `E404` ([`create-metonia-admin` endpoint](https://registry.npmjs.org/create-metonia-admin), [`metonia-admin` endpoint](https://registry.npmjs.org/metonia-admin)). That means neither name was visible at that moment; it is not a reservation or a guarantee of future availability. Confirm ownership immediately before release.

### Package-runner portability

| User-facing invocation                          | Official behavior                                                                                                                                                                    | Runtime implication                                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `npx --yes create-metonia-admin@latest [args]`  | [`npx`](https://docs.npmjs.com/cli/v11/commands/npx/) fetches a missing package, exposes its bin, and otherwise prompts before installing unless `--yes` is before the package name. | Runs the Node shebang.                                                                                        |
| `pnpm dlx create-metonia-admin@latest [args]`   | Current pnpm docs call the command [`pnx`](https://pnpm.io/cli/pnx) and list `pnpm dlx` and `pnpx` as aliases.                                                                       | Runs the package’s declared bin; test pnpm’s isolated layout.                                                 |
| `yarn dlx create-metonia-admin@latest [args]`   | [`yarn dlx`](https://yarnpkg.com/cli/dlx) installs a package in a temporary environment and runs its binary.                                                                         | Test with modern Yarn/Corepack, not only Yarn Classic.                                                        |
| `bunx create-metonia-admin@latest [args]`       | [`bunx`](https://bun.com/docs/pm/bunx) resolves an npm package but respects its shebang. A Node shebang starts `node`.                                                               | Plain `bunx` therefore still requires Node for a Node-shebang CLI.                                            |
| `bunx --bun create-metonia-admin@latest [args]` | Bun’s `--bun` flag overrides a Node shebang and must precede the package name.                                                                                                       | This is the Bun-only path, and it is supported only after the same packaged CLI passes under the Bun runtime. |

There is no single shebang that makes plain `npx` and plain `bunx` both use their host runtime: a Bun shebang would break Node-only environments, while a Node shebang makes plain `bunx` start Node. The portable default is the Node shebang plus a Node-compatible artifact; offer `bunx --bun` as an additional tested path, not an assumption.

The support gate must exercise the packed/published artifact—not a TypeScript workspace entry point—on Windows, Linux, and macOS where advertised. For each runner, cover interactive and fully flag-driven creation, cancellation, existing/non-empty destination handling, failure cleanup, selected package-manager install, check, test, and build. Do not mark npm, pnpm, Yarn, or Bun invocation stable until that matrix passes.

### Generated-project package-manager safety configuration

Current manager defaults require project-owned policy rather than ambient machine configuration. pnpm 11’s [`strictDepBuilds`](https://pnpm.io/settings/build#strictdepbuilds) defaults to true and rejects unreviewed dependency build scripts. Its documented [`allowBuilds`](https://pnpm.io/settings/build#allowbuilds) map is the narrow review mechanism, so the generated pnpm project owns a `pnpm-workspace.yaml` that approves `esbuild` and the exact `@hugeicons/svelte@1.1.5` build when that icon adapter is installed rather than disabling script checks globally. The same file records only the exact icon-package versions supported by the shadcn adapter in [`minimumReleaseAgeExclude`](https://pnpm.io/settings/dependency-resolution#minimumreleaseageexclude), preventing the first install from silently mutating project policy while leaving the age gate in force for other releases.

Yarn 4’s [security guidance](https://yarnpkg.com/features/security) documents its default npm release-age gate and the [`npmPreapprovedPackages`](https://yarnpkg.com/configuration/yarnrc#npmPreapprovedPackages) escape hatch. The generated `.yarnrc.yml` preapproves only the exact supported icon-package descriptors; packages not selected are not installed. An empty local `yarn.lock` is also written before the first install so Yarn does not capture an unrelated ancestor project. These are adapter-owned generated-project files; they are not monorepo lockfiles or global configuration.

On 2026-08-26, `bun audit` identified the reviewed [`cookie` bounds-validation advisory](https://github.com/advisories/GHSA-pxg6-pf52-xh8x) through SvelteKit's `cookie@^0.6.0` range and the reviewed [`esbuild` development-server advisory](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99) through Drizzle Kit's legacy `@esbuild-kit/esm-loader` dependency. The fixed floors are `cookie@0.7.0` and `esbuild@0.25.0`. Metonia pins the current verified patched releases `cookie@0.7.2` and `esbuild@0.28.2` through manager-native root manifest fields: Bun/npm `overrides`, pnpm `pnpm.overrides`, and Yarn `resolutions`. Bun currently supports only top-level overrides, so its generated project deliberately uses the tested shared `esbuild@0.28.2`; npm, pnpm, and Yarn scope the replacements to the affected parent packages. Refresh or remove these resolutions when upstream dependency ranges no longer select vulnerable releases, and rerun each manager's install/check/test/build/audit gate.

## Deno viability without overclaiming

Deno 2 has substantial npm/package-manager support:

- Deno documents `package.json`, npm packages, `node_modules` modes, `deno install`, and `deno ci` in [Packages](https://docs.deno.com/runtime/packages/), [Node and npm compatibility](https://docs.deno.com/runtime/fundamentals/node/), and the [`deno install` reference](https://docs.deno.com/runtime/reference/cli/install/).
- It can run `package.json` scripts with `deno task`, although npm lifecycle `pre`/`post` scripts are not automatically chained; see [`deno task`](https://docs.deno.com/runtime/reference/cli/task/).
- It supports both `deno.json` and `package.json` workspaces and the workspace protocol; see [Deno workspaces](https://docs.deno.com/runtime/fundamentals/workspaces/).
- Dependency lifecycle scripts are security-sensitive and opt-in. Packages that need install scripts must be explicitly allowed and tested rather than assumed to work.

This does not yet establish the Metonia stack:

- SvelteKit’s published package declares a Node engine, and `adapter-node` emits a Node server.
- shadcn-svelte’s official command examples cover npm, pnpm, Yarn, and Bun, not Deno.
- Vite/native optional dependencies, Tailwind tooling, shadcn initialization, Drizzle Kit, the selected PostgreSQL driver, and Docker production install have not been exercised together with Deno.
- A Deno package-manager selection paired with a Node production runtime is a hybrid that must clearly document both prerequisites.

Decision: keep Deno `unknown` and unavailable. Its fail-closed adapter records the intended `deno.lock`, `deno install`/`deno ci`, and `deno task` contract, but it must not become selectable until generate, install, check, test, build, migration, and actual server/container startup pass on current Deno and Node versions. Merely accepting Deno in `sv --install` is not sufficient.

## Zod validation

[Zod 4](https://zod.dev/v4) is the current stable major. Its [basic API](https://zod.dev/basics) documents `parse`, `safeParse`, async variants, and `z.infer`; Zod’s official [library-author guidance](https://github.com/colinhacks/zod/blob/main/packages/docs/content/library-authors.mdx) states that Zod implements Standard Schema.

Implementation implications:

- Put runtime-neutral domain/input schemas and inferred types under `$lib/shared` when both client and server can safely import them.
- Validate every mutation again at the server boundary. Browser validation improves UX but is not a security boundary.
- Use `safeParse`/`safeParseAsync` where actionable field errors are required; map issues to a stable, non-sensitive application error shape.
- Standard actions validate decoded `FormData` deliberately, including string/number/boolean coercion. Remote Functions can take the same Zod schema directly as their Standard Schema validator.
- Never return raw Zod internals, database errors, or private input in production error payloads.

## Drizzle, PostgreSQL drivers, and migrations

Drizzle’s official [PostgreSQL guide](https://orm.drizzle.team/docs/get-started-postgresql) supports both `node-postgres` via `drizzle-orm/node-postgres` and Postgres.js via `drizzle-orm/postgres-js`. Keep these concepts independent in configuration:

```text
dialect: PostgreSQL
provider: generic PostgreSQL | Neon | Supabase | other
driver: pg | postgres.js | provider-specific driver
```

For the generic adapter-node/Docker baseline, prefer `pg` and a pool:

```ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool });
```

Postgres.js is a valid separate driver choice; it prepares statements by default, which matters for proxies/poolers that do not support that mode. Neon’s serverless driver is provider-specific and has a higher Node engine floor, so PostgreSQL must not be treated as synonymous with Neon or Supabase.

The current Drizzle documentation prominently shows 1.0 release-candidate install commands, while the npm `latest` dist-tags observed for `drizzle-orm` and `drizzle-kit` remain the stable 0.x versions listed above. A stable generator must not copy `@rc` snippets accidentally. Store the tested ORM/Kit/driver set centrally and test an RC only behind an explicit experimental upgrade.

A suitable configuration boundary is:

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/lib/server/db/schema/**/*.ts',
	out: './drizzle',
	dbCredentials: {
		url: process.env.DATABASE_URL!
	}
});
```

Keep runtime clients, schema, repositories, and queries under `$lib/server`; keep generated SQL migrations in the configured migrations directory. The Drizzle Kit docs distinguish [`generate`](https://orm.drizzle.team/docs/drizzle-kit-generate), [`migrate`](https://orm.drizzle.team/docs/drizzle-kit-migrate), and [`push`](https://orm.drizzle.team/docs/drizzle-kit-push):

- Stable application workflow: generate reviewed SQL, commit it, and run migrations as an explicit deployment job.
- Local/disposable prototype convenience: `push` may synchronize directly, but it is not the default production workflow.
- Do not run migrations implicitly on every application process startup; parallel replicas can race. Inject `DATABASE_URL` into the migration job and application runtime without exposing it to client code or committing it.

## adapter-node and Docker

The official [`adapter-node` guide](https://svelte.dev/docs/kit/adapter-node) builds a standalone Node server in `build`; production starts it with `node build` and must include the output, `package.json`, and production dependencies. It listens on `0.0.0.0:3000` by default. Production `.env` files are not loaded automatically.

Proxy/origin handling is security-relevant: set `ORIGIN` to the public origin, or configure only trusted forwarded host/protocol headers. The adapter docs warn that blindly trusting spoofable forwarded headers can allow forged absolute URLs. Preserve graceful shutdown behavior and give the container an adequate stop timeout.

Docker implications:

- Use a multi-stage build, a small trusted Node 24 LTS runtime image, an explicit non-root user, and a `.dockerignore`, following Docker’s [build best practices](https://docs.docker.com/build/building/best-practices/). Pin the tested image version (and digest where release policy permits) rather than floating silently.
- The selected package-manager adapter owns its lockfile, frozen install, production-dependency packaging, scripts, and cache mounts. A copied pnpm install, a Bun install, and an npm install are not interchangeable recipes.
- Copy the adapter-node output plus the exact production dependency layout it needs, set runtime environment variables rather than baking secrets into the image, expose port 3000, and use `CMD ["node", "build"]`.
- When local PostgreSQL is selected, Compose may use the [official Postgres image](https://hub.docker.com/_/postgres) with a named volume and required password supplied through environment configuration. Add a `pg_isready` healthcheck and make the app depend on `service_healthy`, as documented in [Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/). Do not commit real credentials.
- “Docker” and “local PostgreSQL container” must remain separate configuration facts. A user may containerize an app that connects to a managed database, or run a local database without containerizing the app.

The container gate is not only `docker build`: start the image, connect to a health-checked PostgreSQL service, run migrations once, exercise a read and mutation, verify shutdown, and test proxy/origin configuration. Compose uses a dedicated one-shot migration service and gates the application with `service_completed_successfully`; this follows Docker Compose's documented dependency conditions while preserving an application runtime that does not mutate schemas during normal server startup. The migration image reuses only production `drizzle-orm` and `pg` dependencies plus reviewed SQL and a small Node runner. Copying the complete development dependency tree made pnpm's migration image export unacceptably large during the Windows Docker gate.

## Required implementation gates

Before a capability is marked stable in the registry:

1. Generate from a pinned Svelte/Kit/`sv` version set into a temporary directory.
2. Apply the selected UI/theme/data/validation/ORM/database/Docker recipes without prompts.
3. Assert architecture paths and forbidden imports, including the shadcn alias destination.
4. Install with the selected package manager and its own lockfile/frozen mode.
5. Run check, tests, and production build under the declared runtime.
6. For Standard and Remote modes, exercise real reads, validation failures, mutations, authorization hooks, and non-sensitive errors.
7. For Drizzle/PostgreSQL, generate/apply migrations against a clean database and test the selected driver.
8. For adapter-node/Docker, start and smoke-test the built server, environment injection, origin/proxy handling, and graceful shutdown.
9. For the public CLI, install the packed artifact through each advertised runner and verify success, cancellation, failure cleanup, and destination safety on supported operating systems.

## Unresolved blockers and follow-ups

1. **Fluid identity:** exact first-party package/repository/docs/registry/theme contract is not confirmed. The adapter stays unavailable.
2. **shadcn theme matrix:** the seven official base colors now have curated Metonia IDs, pinned Nova preset codes, and deterministic snapshots. Repeatable theme-specific visual, accessibility, and multi-OS build evidence remains pending; custom registry infrastructure remains experimental upstream.
3. **Deno matrix:** no end-to-end evidence yet for shadcn, native/tooling install scripts, Drizzle Kit, the chosen PostgreSQL driver, adapter-node output, and Docker together.
4. **CLI runtime matrix:** plain `bunx` follows the Node shebang; Bun-only execution requires `bunx --bun` and its own packaged-artifact tests. Nested `sv`/shadcn execution must not assume the caller’s package manager.
5. **npm names:** `create-metonia-admin` and `metonia-admin` were absent only at the observation time. Ownership/reservation is still a release prerequisite.
6. **Integration certification:** this research verified APIs, current releases, and live CLI help; it did not run the repository’s not-yet-implemented generator matrix. Stable upstream rows are not yet claims of stable Metonia integrations.
