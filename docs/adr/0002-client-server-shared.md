# ADR 0002: Client, Server, and Shared Boundaries

## Status

Accepted.

## Context

Metonia Admin generated apps and internal SvelteKit apps need a predictable boundary model that protects secrets, keeps browser code portable, and gives coding agents an obvious place to add resources. The canonical dependency direction is `client -> shared <- server`.

## Decision

Every SvelteKit application in the monorepo and every generated SvelteKit application organizes `$lib` as:

```text
src/lib/
|-- client/
|-- server/
`-- shared/
```

`$lib/client` contains browser-safe UI, page state, page controllers, and client utilities. It must not import `$lib/server`, database clients, repositories, private environment modules, or secrets.

`$lib/server` contains server-only implementation: database clients, schemas when they are ORM-specific, repositories, services, authorization, private environment access, and server integrations.

`$lib/shared` contains runtime-neutral schemas, types, constants, enums, domain contracts, filters, and pure utilities. It must not depend on client or server modules and must not become a dumping ground.

SvelteKit route files, form actions, server loads, and Remote Function modules are boundary adapters. They validate input, call `$lib/server` where needed, and pass data into `$lib/client` pages.

## Invariants

- Client code may import shared code.
- Server code may import shared code.
- Shared code may not import client or server code.
- Client code may not import server code.
- Private environment values and database access stay in `$lib/server`.
- Browser and Remote Function inputs are untrusted and validated at the public server boundary.

## Extension Procedure

To add a resource such as Products:

1. Add shared schemas, types, constants, and filters under `$lib/shared`.
2. Add repositories and server services under `$lib/server`.
3. Add UI views, pages, state, and controllers under `$lib/client`.
4. Add route or Remote Function boundary files that connect SvelteKit to the page and server modules.
5. Add static import-boundary checks where practical.

To add authentication:

1. Place auth providers, session storage, policy checks, and private config under `$lib/server/auth`.
2. Put public user/session display types in `$lib/shared` only when browser-safe.
3. Expose authenticated state through load data, actions, or Remote Function boundaries.
4. Do not present unauthenticated starters as production-secure while auth is deferred.

## Consequences

- New resources have a low-entropy path through shared contracts, server implementation, client UI, and thin routes.
- Database and secret leakage into browser bundles is treated as an architecture failure.
- Internal apps dogfood the same structure as generated apps unless an ADR documents a specific exception.
- Future changes like Valibot, Prisma, MySQL, SQLite, Neon, Supabase, auth, or deployment adapters can attach to the appropriate layer without rewriting UI pages.

## Verification Gates

- Establish import-boundary enforcement once lint/tooling is available.
- Verify current SvelteKit server-only behavior against official documentation during implementation.
- Confirm generated output contains configuration-aware AGENTS guidance for these boundaries.

## Test Implications

- Add static or unit checks rejecting `$lib/client` imports from `$lib/server`.
- Add checks rejecting `$lib/shared` imports from `$lib/client` or `$lib/server`.
- Generated project tests must inspect actual file layout.
- Security tests should ensure private environment values and raw database errors are not exposed to UI code.
