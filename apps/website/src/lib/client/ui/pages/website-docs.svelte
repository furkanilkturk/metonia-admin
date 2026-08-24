<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Documentation — Metonia Admin</title>
	<meta
		name="description"
		content="How Metonia Admin assembles native SvelteKit projects and preserves client, shared, and server boundaries."
	/>
</svelte:head>

<main id="main-content">
	<header class="page-intro">
		<div>
			<p class="eyebrow">Architecture reference</p>
			<h1>Generated code, explained.</h1>
		</div>
		<div>
			<p>
				Metonia is a generator and a set of project conventions, not an application runtime. The
				output remains recognizable SvelteKit.
			</p>
			<a href={resolve('/#configurator')}>Open the project assembler <span aria-hidden="true">→</span></a>
		</div>
	</header>

	<div class="docs-grid">
		<nav aria-label="Documentation topics">
			<span>On this page</span>
			<a href="#first-project">First project</a>
			<a href="#boundaries">Source boundaries</a>
			<a href="#composition">UI composition</a>
			<a href="#data">Data modes</a>
			<a href="#security">Security baseline</a>
		</nav>

		<article>
			<section id="first-project">
				<p class="eyebrow">First project</p>
				<h2>Generate the default recipe.</h2>
				<div class="command">
					<span>shell</span>
					<code>npx create-metonia-admin@latest acme-admin --yes<br />cd acme-admin<br />bun install<br />bun run dev</code>
				</div>
				<p>
					The project records its resolved capabilities in <code>metonia-admin.config.ts</code>.
					Its README and AGENTS.md use the package-manager commands you selected.
				</p>
			</section>

			<section id="boundaries">
				<p class="eyebrow">Source boundaries</p>
				<h2>Browser and server code meet through shared contracts.</h2>
				<div class="boundary-ledger">
					<div><code>$lib/client</code><span>browser-safe UI, page state, controllers, client utilities</span></div>
					<div class="shared"><code>$lib/shared</code><span>schemas, types, constants, pure utilities</span></div>
					<div><code>$lib/server</code><span>database clients, repositories, services, private environment</span></div>
				</div>
				<p class="dependency"><code>client → shared ← server</code> is the required dependency direction.</p>
			</section>

			<section id="composition">
				<p class="eyebrow">UI composition</p>
				<h2>Routes adapt. Pages compose.</h2>
				<dl>
					<div><dt>Components</dt><dd>Reusable primitives with explicit props and callbacks.</dd></div>
					<div><dt>Views</dt><dd>Meaningful sections composed from components.</dd></div>
					<div><dt>Pages</dt><dd>Complete screens and their client-side coordination.</dd></div>
					<div><dt>Routes</dt><dd>URL, data, mutation, and page-adapter boundaries.</dd></div>
				</dl>
				<p>
					Dashboard is the reference composition. Users is the reference shared, server, and client
					CRUD resource.
				</p>
			</section>

			<section id="data">
				<p class="eyebrow">Data modes</p>
				<h2>One application, two boundary choices.</h2>
				<div class="mode-ledger">
					<div>
						<strong>Standard SvelteKit</strong><span>stable default</span>
						<p>Server load functions and form actions keep page-to-server communication native.</p>
					</div>
					<div>
						<strong>Remote Functions</strong><span class="warning">experimental</span>
						<p>A distinct route-boundary option. It does not create another UI or persistence architecture.</p>
					</div>
				</div>
			</section>

			<section id="security">
				<p class="eyebrow">Security baseline</p>
				<h2>Add authentication and authorization before production.</h2>
				<div class="security-note">
					<strong>The generated starter is not production-secure by default.</strong>
					<p>Protect routes and mutations for your threat model before deployment.</p>
				</div>
				<p>
					The architecture still keeps persistence and private environment access server-only,
					validates untrusted mutations at the boundary, and avoids returning raw database errors.
				</p>
			</section>
		</article>
	</div>
</main>

<style>
	main {
		margin: 0 auto;
		max-width: var(--page-width);
		padding: 0 var(--page-gutter) clamp(4rem, 8vw, 7rem);
	}

	.page-intro {
		border-bottom: 1px solid var(--color-border-strong);
		display: grid;
		gap: 1.5rem;
		padding: clamp(3rem, 7vw, 6rem) 0 clamp(2.5rem, 5vw, 4rem);
	}

	.eyebrow,
	.docs-grid > nav > span,
	.command > span {
		color: var(--color-primary);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.075em;
		margin: 0;
		text-transform: uppercase;
	}

	h1,
	h2 {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-weight: 600;
		letter-spacing: -0.032em;
	}

	h1 {
		font-size: clamp(2.7rem, 6vw, 5.2rem);
		line-height: 0.95;
		margin: 0.65rem 0 0;
	}

	.page-intro > div:last-child {
		align-self: end;
		max-width: 38rem;
	}

	.page-intro > div:last-child p {
		color: var(--color-muted-foreground);
		font-size: 1.03rem;
		line-height: 1.55;
		margin: 0;
	}

	.page-intro a {
		align-items: center;
		display: inline-flex;
		font-weight: 600;
		gap: 0.6rem;
		margin-top: 1rem;
		min-height: 2.75rem;
		text-underline-offset: 0.3rem;
	}

	.docs-grid {
		display: grid;
		gap: clamp(2rem, 5vw, 5rem);
	}

	.docs-grid > nav {
		align-self: start;
		display: grid;
		padding-top: 2rem;
	}

	.docs-grid > nav > span {
		margin-bottom: 0.6rem;
	}

	.docs-grid > nav a {
		align-items: center;
		border-top: 1px solid var(--color-border);
		color: var(--color-muted-foreground);
		display: flex;
		font-size: 0.82rem;
		min-height: 2.75rem;
		text-decoration: none;
	}

	.docs-grid > nav a:hover {
		color: var(--color-primary);
	}

	article {
		min-width: 0;
	}

	article section {
		padding: clamp(2.5rem, 6vw, 5rem) 0;
		scroll-margin-top: 1rem;
	}

	article section + section {
		border-top: 1px solid var(--color-border-strong);
	}

	h2 {
		font-size: clamp(1.8rem, 4vw, 3.2rem);
		line-height: 1.03;
		margin: 0.5rem 0 1.25rem;
		max-width: 47rem;
	}

	article p {
		color: var(--color-muted-foreground);
		line-height: 1.62;
		max-width: 48rem;
	}

	article code {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.84em;
		overflow-wrap: anywhere;
	}

	.command {
		background: var(--color-code);
		border: 1px solid var(--color-border-strong);
		display: grid;
		gap: 0.7rem;
		margin: 1.4rem 0;
		padding: 0.9rem;
	}

	.command code {
		line-height: 1.75;
	}

	.boundary-ledger,
	dl,
	.mode-ledger {
		border-top: 2px solid var(--color-foreground);
		margin: 1.5rem 0;
	}

	.boundary-ledger > div,
	dl > div,
	.mode-ledger > div {
		border-bottom: 1px solid var(--color-border);
		display: grid;
		gap: 0.4rem;
		padding: 0.85rem 0;
	}

	.boundary-ledger code {
		color: var(--color-primary);
		font-weight: 600;
	}

	.boundary-ledger span,
	dd {
		color: var(--color-muted-foreground);
		font-size: 0.84rem;
		line-height: 1.45;
	}

	.dependency {
		border-left: 3px solid var(--color-primary);
		padding: 0.7rem 0.8rem;
	}

	dl {
		margin-bottom: 1.5rem;
	}

	dt {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-weight: 600;
	}

	dd {
		margin: 0;
	}

	.mode-ledger strong {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
	}

	.mode-ledger span {
		color: var(--color-primary);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.62rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.mode-ledger .warning {
		color: var(--color-warning);
	}

	.mode-ledger p {
		margin: 0;
	}

	.security-note {
		background: var(--color-warning-soft);
		border-left: 3px solid var(--color-warning);
		margin: 1.5rem 0;
		padding: 0.9rem;
	}

	.security-note strong {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
	}

	.security-note p {
		margin-bottom: 0;
	}

	@media (min-width: 48rem) {
		.page-intro {
			grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.72fr);
		}

		.boundary-ledger > div,
		dl > div {
			grid-template-columns: minmax(9rem, 0.55fr) minmax(0, 1.45fr);
		}

		.mode-ledger {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
		}

		.mode-ledger > div {
			padding: 1rem;
		}

		.mode-ledger > div + div {
			border-left: 1px solid var(--color-border);
		}
	}

	@media (min-width: 56rem) {
		.docs-grid {
			grid-template-columns: 12rem minmax(0, 1fr);
		}

		.docs-grid > nav {
			position: sticky;
			top: 1rem;
		}
	}
</style>
