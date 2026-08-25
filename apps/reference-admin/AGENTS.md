# reference-admin engineering guide

This project is generated as ordinary SvelteKit code. It has no required Metonia runtime.

## Commands

Use Bun `1.4.0` and commit `bun.lock`:

```sh
bun install
bun run dev
bun run check
bun run lint
bun run test
bun run build
```

Production output uses `@sveltejs/adapter-node@5.5.7`; build first and then use
`bun run start` to run the generated Node server.

Database schema changes use an explicit reviewed migration workflow:

```sh
bun run db:generate
bun run db:migrate
```

Never expose `DATABASE_URL` to browser code and never run migrations implicitly at application
startup. Docker support is disabled, so do not add Docker-only commands or files without first changing the project configuration.

## Boundaries

- Keep browser-safe UI, page state, controllers, and client utilities in `src/lib/client`.
- Keep repositories, services, private environment access, and server integrations in
  `src/lib/server`.
- Keep runtime-neutral schemas, types, constants, and pure utilities in `src/lib/shared`.
- Dependencies flow `client -> shared <- server`.
- UI dependencies flow `pages -> views -> components`; routes render page components and stay thin.
- Use native SvelteKit `+page.server.ts` load functions and form actions for the selected Standard boundary.
- Do not introduce a custom router, parallel REST API, or mandatory runtime for normal page/server
  work.

## Recorded configuration

- UI/theme/icons: `shadcn-svelte` / `zinc` / `lucide`; primitives live in
  `src/lib/client/ui/components`
- Validation: `zod`; validate mutations authoritatively at the server boundary
- Database: `drizzle`, `postgresql`, `generic`, `pg`
- Docker: `disabled`
- Users resource: `enabled`; follow the neighboring shared schemas, server repository/service, client views/pages, and thin routes when adding resources

Authentication and authorization are deferred. Treat the generated application as
unauthenticated and not production-secure until its security model is implemented and reviewed.
