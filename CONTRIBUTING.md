# Contributing to Metonia Admin

Thanks for helping improve Metonia Admin. The project favors focused, verifiable changes that keep generated applications native to SvelteKit and easy to own.

## Before you start

- Search existing issues before opening a new one.
- Use an issue to discuss changes that alter configuration IDs, generator stages, architecture boundaries, published CLI behavior, or support claims.
- Keep unsupported integrations honest. Do not invent third-party APIs or mark a capability stable without executable evidence.

## Local setup

Metonia Admin is a Bun-first monorepo:

```bash
git clone https://github.com/furkanilkturk/metonia-admin.git
cd metonia-admin
bun install
bun run check
bun test
bun run build
```

## Architecture rules

Generated applications use these dependency directions:

```text
client -> shared <- server
pages  -> views  -> components
routes -> client pages
```

- Keep routes thin and use native SvelteKit loads, actions, and data boundaries.
- Keep database clients, repositories, secrets, and private environment access under `$lib/server`.
- Keep `$lib/shared` runtime-neutral.
- Put reusable primitives in `components`, page sections in `views`, and complete screens in `pages`.
- Extend real variability through a focused adapter or recipe rather than duplicating full templates.

Read [AGENTS.md](./AGENTS.md) and the relevant [architecture decisions](./docs/adr/README.md) before editing settled boundaries.

## Changing generated output

Generator assets and recipes are the source of truth. Do not repair `apps/reference-admin` or `apps/playground` by hand. Build the generator and CLI, regenerate the fixtures, and review the resulting diff.

Changed Svelte files must pass the official Svelte autofixer. Changes to registry contracts, generator recipes, CLI behavior, fixtures, lockfiles, migrations, or release configuration require matching tests and documentation.

## Quality gates

Run the checks relevant to your change and report only commands you actually executed:

```bash
bun run check
bun run lint
bun run format:check
bun test
bun run build
bun run test:generator
bun run test:integration
```

UI changes should also be reviewed at representative desktop and mobile widths, including keyboard focus, contrast, loading, empty, and error states.

## Pull requests

A good pull request:

- explains the user-facing problem and the chosen boundary;
- keeps unrelated work out of the diff;
- includes tests for behavioral or contract changes;
- updates README, generated docs, research notes, or ADRs when claims change;
- states verification commands and any remaining limitations;
- does not include generated lockfiles from npm, pnpm, or Yarn in this Bun monorepo.

By contributing, you agree that your contribution is licensed under the repository's [MIT License](./LICENSE).
