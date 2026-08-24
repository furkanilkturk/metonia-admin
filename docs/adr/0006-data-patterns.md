# ADR 0006: SvelteKit Data Patterns as Boundary Variants

## Status

Accepted.

## Context

Metonia Admin supports native SvelteKit data architecture while allowing an optional experimental Remote Functions path. These are data-boundary variants, not separate admin frameworks.

## Decision

The generator models data access with:

```ts
type DataPattern =
  | "sveltekit-standard"
  | "sveltekit-remote-functions";
```

Standard SvelteKit mode uses stable native SvelteKit server loads, layout loads, form actions, and `$lib/server` modules. It does not create a REST, tRPC, GraphQL, TanStack Query, custom router, or custom backend layer solely for pages to talk to their own server.

Remote Functions mode is a separate data-boundary choice and remains experimental while SvelteKit marks it experimental. It uses official current Remote Function APIs after verification and delegates real business and database work to `$lib/server`.

Both modes share UI pages, views, components, schemas, domain types, repositories, layouts, navigation, forms, tables, and resource concepts. Only the SvelteKit boundary glue differs.

## Invariants

- Both data patterns are Svelte 5 and SvelteKit.
- Standard mode is the default stable path.
- Remote Functions require explicit selection and warning in interactive mode.
- Explicit non-interactive Remote Function flags count as consent.
- Browser-facing mutation input is untrusted in both modes.
- Data pattern choice must not fork Dashboard, Users UI, shared schemas, or server repositories.

## Extension Procedure

To add a new data pattern:

1. Verify that it is a native SvelteKit-compatible boundary option.
2. Add it to the registry with support status and compatibility rules.
3. Add boundary recipes only for route/data glue.
4. Reuse existing shared, server, and client UI resources where practical.
5. Add tests showing generated resource UI remains shared across data patterns.

To add auth later:

1. Integrate auth checks in server loads/actions or Remote Function boundary modules.
2. Keep auth implementation under `$lib/server/auth`.
3. Expose only browser-safe session state to client pages.

## Consequences

- Standard mode stays simple and idiomatic for ordinary SvelteKit developers.
- Remote Functions can be explored without splitting Metonia into two product architectures.
- Users CRUD becomes the proving ground for shared UI and server implementation across both modes.
- Future data-boundary variants are constrained to boundary glue.

## Verification Gates

- Verify current SvelteKit load/action APIs before implementation.
- Verify current Remote Functions status and API before implementation.
- Verify Remote Function primitive semantics before deciding how to map reads, forms, commands, and prerendered data.

## Test Implications

- Generated-project tests must cover Standard mode against the MVP stack.
- Remote mode gets an explicit experimental test tier while experimental.
- Tests should compare file output to ensure shared UI/domain/server code is not duplicated by data pattern.
- Mutation tests must prove server-side validation happens in both modes.
