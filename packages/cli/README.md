<p align="center">
  <img src="https://raw.githubusercontent.com/furkanilkturk/metonia-admin/main/docs/assets/metonia-admin-hero.svg" alt="Metonia Admin — native SvelteKit admin apps without a hidden runtime" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/create-metonia-admin"><img alt="npm version" src="https://img.shields.io/npm/v/create-metonia-admin?style=for-the-badge&logo=npm&color=CB3837" /></a>
  <a href="https://github.com/furkanilkturk/metonia-admin"><img alt="GitHub repository" src="https://img.shields.io/badge/GitHub-source-181717?style=for-the-badge&logo=github" /></a>
  <a href="https://github.com/furkanilkturk/metonia-admin/blob/main/LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-42C777?style=for-the-badge" /></a>
  <img alt="Svelte 5" src="https://img.shields.io/badge/Svelte-5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" />
</p>

<p align="center">
  <strong>Create a polished, native SvelteKit admin application in minutes.</strong><br />
  The generated code is ordinary SvelteKit, has no required Metonia runtime, and belongs completely to you.
</p>

## Create your admin app

```bash
npx create-metonia-admin@latest
```

The wizard asks for a project name, suggests `./<project-name>` relative to your terminal, and then shows only options relevant to the stack you select.

You can launch the same wizard with any supported package runner:

```bash
bunx create-metonia-admin@latest
npm create metonia-admin@latest
pnpm dlx create-metonia-admin@latest
yarn dlx create-metonia-admin@latest
```

> npm displays `npm i create-metonia-admin` because this is a package. That command installs it; use one of the runner commands above to create a project.

## Included by default

- Svelte 5 + SvelteKit with Adapter Node
- responsive shadcn-svelte Nova admin shell
- operational Dashboard with a real Table primitive
- search, status, and time-window filters
- refresh skeleton, actionable empty state, navigation feedback, and custom 404
- native SvelteKit loads and form actions
- Zod + Drizzle + PostgreSQL + `pg`
- complete Users CRUD example
- generated migration, `.env.example`, README, `AGENTS.md`, and typed config
- optional Bun-tested Docker output

Authentication and authorization are intentionally not generated yet. Add access control before production use.

## Deterministic generation

Pass every choice explicitly for CI or repeatable scaffolding:

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

Add `--json` to emit one versioned machine-readable result. Run `npx create-metonia-admin@latest --help` for the complete flag reference.

## Native architecture

Generated applications stay understandable without learning a framework inside the framework:

```text
src/lib/
├── client/
│   └── ui/
│       ├── components/
│       ├── views/
│       └── pages/
├── server/
└── shared/
```

```text
client -> shared <- server
pages  -> views  -> components
routes -> client pages
```

The Dashboard uses the generated shadcn-svelte Table through `$lib/client/ui/components`. Page, view, and route ownership stays adapter-neutral so future verified UI adapters can replace primitives without changing the application boundary.

## Current status

Version `0.1.x` is an early public release. Bun, npm, pnpm, and Yarn generated-project paths have substantive Windows x64 evidence but remain Experimental pending repeatable multi-OS verification. Seven shadcn-svelte Nova base colors are selectable. Fluid UI and Deno remain visible but unavailable until their full contracts are verified.

See the [GitHub repository](https://github.com/furkanilkturk/metonia-admin) for architecture decisions, exact verification evidence, development instructions, and issue tracking.

## License

[MIT](https://github.com/furkanilkturk/metonia-admin/blob/main/LICENSE)
