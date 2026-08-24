# ADR 0007: Remote Functions Boundary

## Status

Accepted.

## Context

SvelteKit Remote Functions can let UI code call server functions, but they are still server boundary modules. Placing database logic in client UI or treating Remote Functions as a replacement architecture would violate Metonia's client/server/shared model.

## Decision

Remote Function support is generated only when the `sveltekit-remote-functions` data pattern is selected. While official SvelteKit documentation marks Remote Functions experimental, Metonia exposes them as experimental and warns interactive users before continuing.

Remote Function modules live at SvelteKit route/data boundaries, not under `$lib/client`. A route-local convention such as `src/routes/(admin)/users/users.remote.ts` is the preferred shape subject to current SvelteKit API verification.

Remote Function modules validate public input, call `$lib/server` services or repositories, and translate expected errors into safe UI-facing results. They do not duplicate ORM queries or business logic.

## Invariants

- Remote Function modules may import `$lib/server`; `$lib/client` modules may not.
- Remote Function input is untrusted.
- Shared schemas are reused where safe.
- Dynamic admin records are not treated as prerendered/static data.
- Remote mode reuses Standard mode UI, shared contracts, server repositories, admin shell, forms, navigation, and resource structure.
- Remote support status follows official SvelteKit status.

## Extension Procedure

To add Remote support for a resource:

1. Reuse the resource's shared schemas and server repositories.
2. Add route-local Remote Function boundary files for reads and mutations using the currently verified API.
3. Validate inputs at each externally callable function.
4. Return actionable, non-sensitive errors.
5. Wire the existing client page/controller to the Remote boundary.

To update Remote APIs:

1. Record current official findings under `docs/research/`.
2. Update this ADR or add a superseding ADR if the boundary model changes.
3. Update generator recipes and tests together.

## Consequences

- Remote Functions remain a contained experiment rather than a second admin framework.
- The same Users page can prove that Remote mode only changes boundary glue.
- Official API drift is handled through documented research and test updates.
- Client/server import rules remain intact even when UI can call Remote Function exports.

## Verification Gates

- Verify current SvelteKit Remote Function filename conventions, exports, primitives, and experimental status.
- Verify whether concepts such as query, form, command, and prerender still apply and how they map to CRUD.
- Verify generated Remote projects build and pass tests before advertising the option beyond experimental.

## Test Implications

- Unit-test generated warning/consent behavior for interactive and non-interactive CLI modes.
- Integration-test Remote Function generated projects against the MVP stack.
- Test that Remote modules validate inputs and do not expose raw database errors.
- Static checks should prevent `$lib/client` from importing Remote modules in a way that bypasses SvelteKit conventions if such enforcement is practical.
