<script lang="ts">
	import { resolve } from '$app/paths';
	import SupportMatrix from '$lib/client/ui/views/website/SupportMatrix.svelte';
</script>

<svelte:head>
	<title>Capability support — Metonia Admin</title>
	<meta
		name="description"
		content="Registry-driven upstream and Metonia integration status for every configurable capability."
	/>
</svelte:head>

<main id="main-content">
	<header class="page-intro">
		<div>
			<p class="eyebrow">Capability support</p>
			<h1>Integration claims, with their limits attached.</h1>
		</div>
		<div>
			<p>
				Upstream maturity and verified Metonia integration are separate facts. This ledger shows
				both, using the same registry as the configurator and CLI.
			</p>
			<a href={resolve('/#configurator')}>Configure the supported stack <span aria-hidden="true">→</span></a>
		</div>
	</header>
	<SupportMatrix />
</main>

<style>
	main {
		margin: 0 auto;
		max-width: var(--page-width);
		padding: 0 var(--page-gutter);
	}

	.page-intro {
		border-bottom: 1px solid var(--color-border-strong);
		display: grid;
		gap: 1.5rem;
		padding: clamp(3rem, 7vw, 6rem) 0 clamp(2.5rem, 5vw, 4rem);
	}

	.eyebrow {
		color: var(--color-primary);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.075em;
		margin: 0;
		text-transform: uppercase;
	}

	h1 {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: clamp(2.6rem, 6vw, 5rem);
		font-weight: 600;
		letter-spacing: -0.035em;
		line-height: 0.96;
		margin: 0.65rem 0 0;
		max-width: 54rem;
	}

	.page-intro > div:last-child {
		align-self: end;
		max-width: 39rem;
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

	@media (min-width: 48rem) {
		.page-intro {
			grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.72fr);
		}
	}
</style>
