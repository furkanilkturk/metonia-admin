<script lang="ts">
	import { resolve } from '$app/paths';
	import Configurator from '$lib/client/ui/views/website/Configurator.svelte';
</script>

<svelte:head>
	<title>Metonia Admin — Assemble a native SvelteKit admin</title>
	<meta
		name="description"
		content="Configure a native SvelteKit admin project, inspect its source boundaries, and start it with npx."
	/>
</svelte:head>

<main id="main-content">
	<section class="intro" aria-labelledby="hero-title">
		<div>
			<p class="eyebrow">Native SvelteKit admin project assembler</p>
			<h1 id="hero-title">Choose the stack.<br />Keep the framework.</h1>
		</div>
		<div class="intro-copy">
			<p>
				Compose UI, data boundary, validation, persistence, and starter resources into ordinary
				SvelteKit code your team owns.
			</p>
			<a href="#configurator">Configure a project <span aria-hidden="true">↓</span></a>
		</div>
	</section>

	<div class="facts" aria-label="Generator guarantees">
		<span><b>output</b> native SvelteKit source</span>
		<span><b>boundary</b> client → shared ← server</span>
		<span><b>start</b> npx create-metonia-admin@latest</span>
	</div>

	<div id="configurator"><Configurator /></div>

	<section class="handoff" aria-labelledby="handoff-title">
		<div class="handoff-copy">
			<p class="eyebrow">After generation</p>
			<h2 id="handoff-title">Metonia leaves. Your project stays legible.</h2>
			<p>
				There is no required application runtime between your routes and SvelteKit. The generated
				README, configuration, and source boundaries explain what was assembled.
			</p>
		</div>
		<div class="path-ledger" aria-label="Generated project handoff">
			<div><code>src/routes</code><span>thin URL, data, and mutation adapters</span></div>
			<div><code>$lib/client/ui</code><span>components, views, pages, coordination</span></div>
			<div><code>$lib/shared</code><span>schemas, domain types, pure utilities</span></div>
			<div><code>$lib/server</code><span>repositories, services, private values</span></div>
			<div><code>metonia-admin.config.ts</code><span>the resolved capability record</span></div>
		</div>
	</section>

	<section class="next" aria-labelledby="next-title">
		<div>
			<p class="eyebrow">Verify before you generate</p>
			<h2 id="next-title">Read the boundary rules and current integration evidence.</h2>
		</div>
		<nav aria-label="Learn more">
			<a href={resolve('/docs')}>Architecture documentation <span aria-hidden="true">→</span></a>
			<a href={resolve('/support')}>Capability support ledger <span aria-hidden="true">→</span></a>
		</nav>
	</section>
</main>

<style>
	main {
		margin: 0 auto;
		max-width: var(--page-width);
		padding: 0 var(--page-gutter);
	}

	.intro {
		display: grid;
		gap: 1.5rem;
		padding: clamp(2.75rem, 6vw, 5.5rem) 0 clamp(2rem, 4vw, 3.5rem);
	}

	.eyebrow {
		color: var(--color-primary);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.63rem;
		font-weight: 600;
		letter-spacing: 0.075em;
		margin: 0;
		text-transform: uppercase;
	}

	h1,
	h2 {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-weight: 600;
		letter-spacing: -0.035em;
	}

	h1 {
		font-size: clamp(2.7rem, 7vw, 5.8rem);
		line-height: 0.91;
		margin: 0.75rem 0 0;
		max-width: 50rem;
	}

	.intro-copy {
		align-self: end;
		max-width: 34rem;
	}

	.intro-copy p {
		color: var(--color-muted-foreground);
		font-size: clamp(1rem, 1.7vw, 1.15rem);
		line-height: 1.52;
		margin: 0;
	}

	.intro-copy a {
		align-items: center;
		background: var(--color-accent);
		color: white;
		display: inline-flex;
		font-weight: 600;
		gap: 0.65rem;
		margin-top: 1.25rem;
		min-height: 2.75rem;
		padding: 0 0.9rem;
		text-decoration: none;
	}

	.intro-copy a:hover {
		background: var(--color-foreground);
	}

	.facts {
		border: 1px solid var(--color-border-strong);
		display: grid;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.67rem;
		margin-bottom: 0.75rem;
	}

	.facts span {
		background: var(--color-card);
		min-width: 0;
		overflow-wrap: anywhere;
		padding: 0.75rem;
	}

	.facts span + span {
		border-top: 1px solid var(--color-border);
	}

	.facts b {
		color: var(--color-primary);
		font-weight: 600;
		margin-right: 0.5rem;
		text-transform: uppercase;
	}

	#configurator {
		scroll-margin-top: 1rem;
	}

	.handoff {
		border-bottom: 1px solid var(--color-border-strong);
		border-top: 1px solid var(--color-border-strong);
		display: grid;
		gap: clamp(2rem, 6vw, 5rem);
		margin-top: clamp(4rem, 8vw, 7rem);
		padding: clamp(3rem, 7vw, 6rem) 0;
	}

	.handoff-copy {
		max-width: 38rem;
	}

	h2 {
		font-size: clamp(2rem, 4.3vw, 3.7rem);
		line-height: 1;
		margin: 0.55rem 0 1rem;
	}

	.handoff-copy > p:last-child {
		color: var(--color-muted-foreground);
		line-height: 1.58;
	}

	.path-ledger {
		border-top: 2px solid var(--color-foreground);
	}

	.path-ledger > div {
		border-bottom: 1px solid var(--color-border);
		display: grid;
		gap: 0.35rem;
		padding: 0.85rem 0;
	}

	.path-ledger code {
		color: var(--color-primary);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.73rem;
		font-weight: 500;
		overflow-wrap: anywhere;
	}

	.path-ledger span {
		color: var(--color-muted-foreground);
		font-size: 0.83rem;
		line-height: 1.4;
	}

	.next {
		align-items: end;
		display: grid;
		gap: 2rem;
		padding: clamp(3rem, 7vw, 6rem) 0 clamp(4rem, 9vw, 7rem);
	}

	.next h2 {
		font-size: clamp(1.8rem, 3.5vw, 3rem);
		max-width: 42rem;
	}

	.next nav {
		border-top: 1px solid var(--color-border-strong);
		display: grid;
	}

	.next nav a {
		align-items: center;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		font-size: 0.88rem;
		font-weight: 600;
		justify-content: space-between;
		min-height: 3rem;
		text-decoration: none;
	}

	.next nav a:hover {
		color: var(--color-primary);
	}

	@media (min-width: 48rem) {
		.intro {
			align-items: end;
			grid-template-columns: minmax(0, 1.3fr) minmax(18rem, 0.7fr);
		}

		.facts {
			grid-template-columns: repeat(3, 1fr);
		}

		.facts span + span {
			border-left: 1px solid var(--color-border);
			border-top: 0;
		}

		.handoff,
		.next {
			grid-template-columns: minmax(0, 0.85fr) minmax(26rem, 1.15fr);
		}

		.path-ledger > div {
			grid-template-columns: minmax(11rem, 0.8fr) minmax(0, 1.2fr);
		}
	}
</style>
