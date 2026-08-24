# create-metonia-admin

Generate a native Svelte 5 + SvelteKit admin application with predictable client/server boundaries, thin routes, an accessible admin shell, and configuration-aware documentation.

## Create a project

```bash
npx create-metonia-admin@latest acme-admin
```

The same CLI can be launched with:

```bash
bunx create-metonia-admin@latest acme-admin
pnpm dlx create-metonia-admin@latest acme-admin
yarn dlx create-metonia-admin@latest acme-admin
```

For deterministic automation:

```bash
npx create-metonia-admin@latest acme-admin \
  --package-manager bun \
  --ui shadcn-svelte \
  --theme zinc \
  --data-pattern standard \
  --validation zod \
  --orm drizzle \
  --database postgresql \
  --provider generic \
  --driver pg \
  --no-docker \
  --users \
  --install \
  --no-git
```

Add `--json` to emit exactly one versioned machine-readable result. Run `npx create-metonia-admin@latest --help` for every flag.

## Generated architecture

Applications use native SvelteKit and remain maintainable without a Metonia runtime:

```text
src/lib
├── client
│   └── ui
│       ├── components
│       ├── views
│       └── pages
├── server
└── shared
```

The dependency rules are `client -> shared <- server` and `pages -> views -> components`. Standard mode uses SvelteKit loads and form actions. Remote Functions are an explicit Experimental query-boundary option.

## Current release status

Version 0.1 is an early public test release. Bun, npm, pnpm, and Yarn generated-project paths have Windows integration evidence but remain Experimental pending repeatable multi-OS verification. Deno and Fluid UI are visible but unavailable. Only the shadcn-svelte zinc preset is currently selectable. Authentication and authorization are deliberately deferred; add access control before production use.

Metonia Admin is licensed under MIT.
