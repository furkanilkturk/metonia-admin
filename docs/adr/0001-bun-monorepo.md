# ADR 0001: Bun Monorepo and Package Boundaries

## Status

Accepted.

## Context

Metonia Admin is a Bun-first monorepo that produces ordinary native SvelteKit admin applications. The internal toolchain and the generated application's package manager are separate decisions: Metonia itself uses Bun, while generated projects may select Bun, pnpm, npm, Yarn, or Deno after compatibility is verified.

The repository should expose meaningful packages for real variability and ownership boundaries, not a package for every architectural noun.

## Decision

Metonia Admin uses Bun for repository dependency installation, workspace management, script execution, tests, builds, and local tooling. The repository lockfile is `bun.lock`; npm, pnpm, and Yarn lockfiles are not committed to the monorepo root.

Package boundaries are created only for independently useful responsibilities, such as the CLI, generator, shared configuration/registry, UI adapters, validation adapter, ORM adapter, database adapter, and SvelteKit apps. Generated applications remain self-contained SvelteKit projects and must not require a hidden Metonia runtime for normal development or execution.

The published `create-metonia-admin` CLI may be developed with Bun but must have its end-user runtime and package distribution strategy verified before being declared portable through `bunx`, `npx`, `pnpm dlx`, or `yarn dlx`.

## Invariants

- The Metonia Admin monorepo is Bun-first.
- Generated project package-manager selection is configuration, not a consequence of the monorepo toolchain.
- `Deno` is the correct runtime/package-manager label; incorrect variants are invalid.
- New packages must represent real variability, a deployable app, or a stable ownership boundary.
- Generated projects are user-owned native SvelteKit code.

## Extension Procedure

To add a package boundary:

1. Identify the concrete variability or ownership problem it solves.
2. Define the public API that other packages consume.
3. Add it to the Bun workspace only if it reduces coupling or supports an advertised capability.
4. Add tests proving the boundary is used by the CLI, generator, apps, or generated output.

To add or change a generated-project package manager:

1. Add or update a package-manager capability in the shared registry.
2. Implement its adapter for install, add, addDev, run, exec, and lockfile behavior.
3. Verify generate, install, check, test, and build before marking it stable.
4. Update generated README and AGENTS output to use that manager's commands.

## Consequences

- Internal commands are predictable: `bun install`, `bun run check`, `bun run lint`, `bun test`, and `bun run build`.
- Package-manager support for generated projects can expand without making the monorepo itself multi-manager.
- CLI portability remains a verification gate instead of an assumption.
- The project avoids speculative package sprawl while preserving room for UI, validation, ORM, database, Docker, auth, and deployment adapters.

## Verification Gates

- Confirm the current CLI distribution strategy before publishing.
- Confirm Deno support through real generated-project integration tests before assigning stable status.
- Confirm package boundaries after the smallest end-to-end generation path exists, removing packages that only add indirection.

## Test Implications

- Root quality gates use Bun.
- Registry tests must distinguish monorepo package manager from generated-project package manager.
- Package-manager matrix tests must run against generated projects, not only generator internals.
- Generated documentation tests must ensure command examples match the selected package manager.
