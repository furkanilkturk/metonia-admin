<script lang="ts">
	interface Props {
		projectName: string;
	}

	let { projectName }: Props = $props();
</script>

<svelte:head>
	<title>{projectName} | Metonia Admin</title>
	<meta
		name="description"
		content="A native SvelteKit application with explicit client, server, and shared boundaries."
	/>
</svelte:head>

<main>
	<p class="eyebrow">Native SvelteKit base</p>
	<h1>{projectName}</h1>
	<p class="summary">
		This starter keeps application code ordinary and portable. Add product features through the
		prepared client, server, and shared boundaries.
	</p>

	<section aria-labelledby="architecture-heading">
		<h2 id="architecture-heading">Architecture ready for composition</h2>
		<ul>
			<li><code>$lib/client</code> remains browser-safe.</li>
			<li><code>$lib/server</code> owns private integrations.</li>
			<li><code>$lib/shared</code> holds runtime-neutral contracts.</li>
		</ul>
	</section>
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: #f4f7f5;
		color: #15221f;
		font-family: 'Source Sans 3', system-ui, sans-serif;
	}

	:global(:focus-visible) {
		outline: 3px solid color-mix(in oklab, #0b7f79, transparent 20%);
		outline-offset: 2px;
	}

	main {
		display: grid;
		max-width: 52rem;
		min-height: 100vh;
		align-content: center;
		gap: 1.5rem;
		padding: clamp(2rem, 8vw, 6rem);
	}

	.eyebrow {
		margin: 0;
		color: #0b7f79;
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1,
	h2,
	p {
		margin-block: 0;
	}

	h1,
	h2 {
		font-family: 'Space Grotesk', system-ui, sans-serif;
	}

	h1 {
		font-size: clamp(2rem, 7vw, 4.5rem);
		line-height: 1;
	}

	.summary {
		max-width: 42rem;
		color: #52645e;
		font-size: 1.125rem;
		line-height: 1.6;
	}

	section {
		padding: 1.5rem;
		border: 1px solid #c7d3ce;
		border-radius: 0.75rem;
		background: #ffffff;
	}

	h2 {
		font-size: 1.125rem;
	}

	ul {
		display: grid;
		gap: 0.5rem;
		margin: 1rem 0 0;
		padding-left: 1.25rem;
		color: #52645e;
	}

	code {
		color: #0b7f79;
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: 0.875em;
	}

	@media (prefers-color-scheme: dark) {
		:global(body) {
			background: #111816;
			color: #ecf4f0;
		}

		.eyebrow,
		code {
			color: #45c4bb;
		}

		.summary,
		ul {
			color: #a9bbb4;
		}

		section {
			border-color: #344640;
			background: #17211e;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(*),
		:global(*::before),
		:global(*::after) {
			scroll-behavior: auto !important;
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
