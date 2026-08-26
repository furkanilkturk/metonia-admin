# ADR 0010: Docker Generation

## Status

Accepted.

## Context

Metonia Admin can generate Docker support for applications, especially for local PostgreSQL development and deployable production builds. Docker files are writable source files, but Docker support should be useful rather than decorative.

## Decision

Docker support is an optional generated-project capability controlled by configuration. When enabled, the generator may create an appropriate subset of:

```text
Dockerfile
.dockerignore
compose.yaml
```

For the MVP PostgreSQL stack, Docker generation includes a PostgreSQL service, persistent volume, healthcheck, `DATABASE_URL` wiring, and a one-shot migration service. Compose keeps the raw password out of the URL and passes it through the standard `PGPASSWORD` environment variable; the Node PostgreSQL client supplies that value as a separate pool option. This preserves passwords containing URL-significant characters without committing or logging an encoded credential. The application waits for the migration service to complete successfully before starting. A small Node runner applies committed Drizzle migrations with production `drizzle-orm` and `pg` dependencies; it does not carry the selected package manager's development toolchain. This applies migrations explicitly as part of the Compose workflow without coupling schema changes to ordinary application process startup. Node/runtime and production deployment provider details remain neutral until verified.

The architecture remains open to separating two future choices:

```text
Dockerize application?
Run development PostgreSQL through Docker?
```

The MVP may use a single simpler Docker option if the generated README and AGENTS clearly explain what it does.

## Invariants

- Docker files are writable source files.
- Docker generation is configuration-aware.
- Docker support must not introduce unrelated application complexity.
- Database secrets are represented through environment examples, not committed secret values.
- Destructive Docker cleanup requires resolved, validated targets.
- Docker does not change the client/server/shared or components/views/pages architecture.
- Compose must not report the application ready before committed migrations have completed successfully.

## Extension Procedure

To add a deployment adapter:

1. Add a deployment capability to the registry with support status.
2. Verify provider build/runtime/environment requirements through official docs.
3. Add focused generator recipes for provider-specific files and config.
4. Keep Docker and deployment concerns separate unless the provider explicitly uses Docker.

To separate application Docker from database Docker:

1. Split the registry capability into independent options.
2. Add compatibility rules and generated docs for each combination.
3. Keep PostgreSQL provider/dialect configuration explicit.
4. Add integration tests for each stable option.

## Consequences

- Local PostgreSQL setup can be made reproducible without forcing Docker on every project.
- Generated Docker assets remain easy for the project owner to edit.
- Future deployment support can grow through capabilities instead of hardcoded assumptions.
- Docker is kept provider-neutral until current deployment targets are chosen and researched.

## Verification Gates

- Verify current Docker and SvelteKit production build recommendations before finalizing generated Dockerfiles.
- Verify selected Node runtime image strategy or alternate runtime strategy before stable support.
- Verify PostgreSQL image, healthcheck, and volume choices before stable generated Docker support.

## Test Implications

- Unit-test Docker config validation and recipe selection.
- Generated-project tests must assert Docker files appear only when enabled.
- Integration tests should run Docker-enabled generated projects where the environment supports Docker.
- Documentation tests must ensure Docker setup and `DATABASE_URL` instructions match generated files.
