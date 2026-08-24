# ADR 0009: Database Boundary and Persistence Adapters

## Status

Accepted.

## Context

Metonia Admin's MVP data stack is Zod, Drizzle, and PostgreSQL. The architecture must still leave a clear path for Valibot, Prisma, MySQL, SQLite, Neon, Supabase, authentication, and deployment targets without spreading persistence-specific details into UI code.

## Decision

Database implementation lives under `$lib/server`. UI pages, views, components, page state, and page controllers never issue raw database queries.

The database model separates ORM, dialect, provider, and driver. MVP defaults are:

```text
validation: Zod
ORM: Drizzle
dialect: PostgreSQL
provider: generic
```

PostgreSQL is not synonymous with Neon or Supabase. Neon and Supabase are possible providers for a PostgreSQL dialect and may require provider-specific environment, driver, or deployment recipes after verification.

Shared schemas and types live under `$lib/shared` when they are safe for client and server. ORM schema, database client setup, migrations, repositories, seeds, and server services live under `$lib/server`.

## Invariants

- Database clients, migrations, ORM schema, and repositories stay in `$lib/server`.
- Shared schemas are reused where safe; equivalent client/server validation contracts should not be duplicated.
- Server boundaries validate untrusted input before mutation.
- Raw database errors are not exposed to the UI.
- ORM parameterization should be used for database operations.
- Auth is deferred unless implemented; generated docs must not imply production security without auth.

## Extension Procedure

To add Valibot:

1. Add a validation capability and adapter.
2. Generate shared schemas through the validation adapter.
3. Update boundary validation recipes without rewriting UI views.

To add Prisma:

1. Add an ORM capability and adapter.
2. Generate Prisma-specific schema, client setup, and repository implementation under `$lib/server`.
3. Keep shared types, UI pages, views, and routes structurally stable.

To add MySQL or SQLite:

1. Add database dialect capabilities and compatibility rules.
2. Add dialect-specific ORM/database recipes.
3. Verify migrations, seed, generated env, and build/test behavior.

To add Neon or Supabase:

1. Model them as providers, not as dialect replacements.
2. Add provider-specific environment and driver recipes after official verification.
3. Preserve the repository interface exposed to data boundaries.

## Consequences

- Users CRUD proves the persistence boundary with list, search, filter, sort, pagination, detail, create, edit, disable/delete, validation, errors, empty states, and pending states.
- Switching ORM, dialect, provider, or validation library should primarily affect shared schemas and server/database recipes.
- Deployment adapters can add environment and platform wiring without moving database logic into UI code.
- The generated project remains understandable as ordinary SvelteKit plus server-side persistence.

## Verification Gates

- Verify current Zod, Drizzle, PostgreSQL, and driver recommendations against official docs before implementation.
- Verify Neon and Supabase provider details before advertising support.
- Verify migration and seed commands per selected package manager.

## Test Implications

- Unit-test shared validation schemas and server mutation validation.
- Repository tests should cover query, filter, sort, pagination, create, update, and disable/delete behavior.
- Generated-project tests must ensure database files live under `$lib/server`.
- Integration tests must run against PostgreSQL for any stable advertised Drizzle/PostgreSQL stack.
