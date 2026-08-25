# create-metonia-admin

Generate a native Svelte 5 + SvelteKit admin application with predictable client/server boundaries, thin routes, an accessible admin shell, and configuration-aware documentation.

## Create a project

```bash
npx create-metonia-admin@latest
```

With no destination argument, the wizard asks for a project name and suggests
`./<project-name>` relative to the terminal's current directory. Enter `./` as the
destination to generate into the current directory, which must be empty, or type
another relative or absolute path.

Interactive terminals show a live activity indicator while the project is generated,
dependencies are installed, and Git is initialized. JSON and non-TTY modes remain free
of terminal animation.

The same CLI can be launched with any of these package-runner forms:

```bash
npm create metonia-admin@latest
bunx create-metonia-admin@latest
pnpm dlx create-metonia-admin@latest
yarn dlx create-metonia-admin@latest
```

The `npm i create-metonia-admin` command shown automatically by npm installs the
package; use one of the runner commands above to create a project.

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

The generated Dashboard includes a real shadcn-svelte operations table, responsive filters, a refresh skeleton, an actionable empty state, navigation feedback, and a custom root 404 page. These surfaces stay behind the UI adapter's canonical component aliases so a future verified Fluid UI adapter can replace primitives without changing page, view, or route ownership.

## Current release status

Version 0.1 is an early public test release. Bun, npm, pnpm, and Yarn generated-project paths have Windows integration evidence but remain Experimental pending repeatable multi-OS verification. Deno and Fluid UI are visible but unavailable. The shadcn-svelte adapter offers the pinned Neutral, Stone, Zinc, Mauve, Olive, Mist, and Taupe Nova base colors. Authentication and authorization are deliberately deferred; add access control before production use.

Metonia Admin is licensed under MIT.
