# {{PROJECT_NAME}} engineering guide

This project is generated as ordinary SvelteKit code. It has no required Metonia runtime.

## Commands

Use {{PACKAGE_MANAGER_LABEL}} `{{PACKAGE_MANAGER_VERSION}}` and commit `{{PACKAGE_MANAGER_LOCKFILE}}`:

```sh
{{COMMAND_INSTALL}}
{{COMMAND_DEV}}
{{COMMAND_CHECK}}
{{COMMAND_LINT}}
{{COMMAND_TEST}}
{{COMMAND_BUILD}}
```

Production output uses `@sveltejs/adapter-node@{{ADAPTER_NODE_VERSION}}`; build first and then use
`{{COMMAND_START}}` to run the generated Node server.

Database schema changes use an explicit reviewed migration workflow:

```sh
{{COMMAND_DB_GENERATE}}
{{COMMAND_DB_MIGRATE}}
```

Never expose `DATABASE_URL` to browser code and never run migrations implicitly at application
startup. {{DOCKER_AGENT_GUIDE}}

## Boundaries

- Keep browser-safe UI, page state, controllers, and client utilities in `src/lib/client`.
- Keep repositories, services, private environment access, and server integrations in
  `src/lib/server`.
- Keep runtime-neutral schemas, types, constants, and pure utilities in `src/lib/shared`.
- Dependencies flow `client -> shared <- server`.
- UI dependencies flow `pages -> views -> components`; routes render page components and stay thin.
- {{DATA_PATTERN_AGENT_GUIDE}}
- Do not introduce a custom router, parallel REST API, or mandatory runtime for normal page/server
  work.

## Recorded configuration

- UI/theme: `{{UI_ADAPTER}}` / `{{UI_THEME}}`; primitives live in
  `src/lib/client/ui/components`
- Validation: `{{VALIDATION}}`; validate mutations authoritatively at the server boundary
- Database: `{{ORM}}`, `{{DATABASE_DIALECT}}`, `{{DATABASE_PROVIDER}}`, `{{DATABASE_DRIVER}}`
- Docker: `{{DOCKER_STATE}}`
- Users resource: `{{USERS_STATE}}`; {{USERS_AGENT_GUIDE}}

Authentication and authorization are deferred. Treat the generated application as
unauthenticated and not production-secure until its security model is implemented and reviewed.
