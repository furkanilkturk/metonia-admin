# ADR 0003: Components, Views, Pages, and Thin Routes

## Status

Accepted.

## Context

Metonia Admin needs generated UI that is easy for humans and coding agents to extend. A contributor adding a Products page should be able to inspect Dashboard or Users and know where reusable primitives, sections, page orchestration, and route adapters belong.

## Decision

Every SvelteKit application uses this client UI structure:

```text
src/lib/client/ui/
|-- components/
|-- views/
`-- pages/
```

Dependency direction within client UI is `pages -> views -> components`.

Components are reusable primitives with explicit props and callbacks. They do not contain route-specific behavior, database logic, or server imports.

Views are meaningful page sections composed from components. They accept data, state, and callbacks through props. They do not own whole-screen orchestration and do not import server modules.

Pages compose views into complete screens. Page-specific reactive state lives in `pages/<page>/<page>State.svelte.ts` when needed. Page orchestration lives in `pages/<page>/<page>Controller.ts` when needed. Controllers coordinate UI actions, navigation, boundary callbacks, and state updates; they are not backend MVC controllers and never query the database.

Routes are thin SvelteKit adapters for URL parameters, load/action or Remote Function boundaries, and rendering a client page.

## Invariants

- UI dependencies flow from pages to views to components, not in reverse.
- Route `+page.svelte` files should normally render one client page component.
- Dashboard is the canonical composition example.
- Users is the canonical CRUD resource example.
- Do not create empty state or controller files when a page genuinely does not need them.
- Accessibility is part of the UI contract: semantic structure, keyboard behavior, focus, labels, field errors, contrast, responsive navigation, and reduced motion must be considered.

## Extension Procedure

To add a new page:

1. Add reusable primitives under `components` only when they are useful beyond one section.
2. Add page sections under `views/<resource-or-page>/`.
3. Add the complete screen under `pages/<page>.svelte`.
4. Add state and controller files only for real page state or orchestration.
5. Add thin SvelteKit routes that pass data and callbacks into the page.
6. Keep form views reusable between create and edit flows.

To add a UI library or theme:

1. Map its primitives into `src/lib/client/ui/components`.
2. Keep page and view architecture unchanged.
3. Use adapter-specific theme definitions rather than a global theme list.

## Consequences

- Dashboard can prove the composition pattern with metrics, filters, tables, and activity views.
- Users can prove resource list, detail, create, edit, validation, pending, error, and empty states.
- Adding Prisma, Valibot, MySQL, SQLite, Neon, Supabase, auth, or a deployment adapter should not require rewriting Dashboard views.
- Generated apps remain ordinary SvelteKit apps, with routes that are easy to inspect.

## Verification Gates

- Confirm current Svelte 5 page-state patterns and official autofixer behavior before writing Svelte files.
- Verify shadcn-svelte component aliasing can target `$lib/client/ui/components`.
- Confirm Fluid UI component and theme APIs before enabling Fluid-generated UI.

## Test Implications

- Generated project tests must assert the components, views, and pages directories exist.
- Tests should check that routes render client page components instead of rebuilding full screens.
- UI tests should cover accessibility, responsive behavior, focus handling, form errors, tables, menus, dialogs, and reduced motion where applicable.
- Svelte files changed by implementation must pass the official Svelte autofixer.
