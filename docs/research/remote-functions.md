# SvelteKit Remote Functions verification — 2026-08-24

## Sources and status

The current official [Remote Functions documentation](https://svelte.dev/docs/kit/remote-functions)
still labels the feature experimental and subject to change without notice. It documents Remote
Functions as available since SvelteKit 2.27 and requires both experimental switches:

- Svelte compiler async support: `compilerOptions.experimental.async`
- SvelteKit Remote Functions: `kit.experimental.remoteFunctions`

Metonia's pinned `sv@0.17.0` scaffold uses the active `sveltekit({...})` Vite plugin configuration.
The current official [configuration reference](https://svelte.dev/docs/kit/configuration) documents
that plugin form, where Kit options are flattened into the plugin argument while `compilerOptions`
remains a sibling. The generator therefore enables `compilerOptions.experimental.async` and
`experimental.remoteFunctions` in `vite.config.ts`. It deliberately fails if the reviewed active
configuration shape changes; it does not create an ignored `svelte.config.*` file.

## Verified boundary semantics

The official docs still define route-callable exports in `.remote.js` or `.remote.ts` modules and
the four primitives below:

| Primitive   | Current purpose                                | Metonia policy                                                                           |
| ----------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `query`     | Read dynamic server data                       | Use a Standard Schema validator for every public argument and delegate to `$lib/server`. |
| `form`      | Progressive-enhancement-friendly form mutation | Prefer for real HTML forms once shared Users form UI has a transport-neutral contract.   |
| `command`   | Imperative mutation not tied to a form         | Use only when a form is not appropriate; it cannot run during render.                    |
| `prerender` | Build-time/static remote data                  | Do not use for mutable admin records.                                                    |

Remote files may live under `src` except `src/lib/server`. They execute on the server but are
transformed into client-callable wrappers. Metonia keeps them route-local and keeps persistence,
private environment access, services, repositories, and authorization implementation under
`$lib/server`. SvelteKit's official [`$app/server` reference](https://svelte.dev/docs/kit/%24app-server)
is the authority for the exports used by these modules.

## W11 implementation boundary

The first generated Remote Functions slice is intentionally narrower than Standard Users CRUD. It
proves one dynamic `query` with a Zod Standard Schema argument, a route-local `.remote.ts` boundary,
a server service delegation, and a thin route-to-client-page adapter. It generates no REST layer,
Metonia runtime, database query in the boundary module, or new runtime dependency.

Remote mode currently rejects `resources.users: true`. The shared Users forms were authored around
SvelteKit actions and do not yet expose a transport-neutral form contract that can honestly support
Remote `form` objects without duplicating UI. Until that contract exists and real create/update/
disable/delete behavior passes generated-project and database tests, Metonia does not claim Remote
Users CRUD parity or production readiness. Authentication and authorization remain deferred.
