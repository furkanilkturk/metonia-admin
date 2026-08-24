<script lang="ts">
	import { resolve } from '$app/paths';
	import SupportMatrix from '$lib/client/ui/views/website/SupportMatrix.svelte';
</script>

<svelte:head>
	<title>Capability support — Metonia Admin</title>
	<meta name="description" content="The registry-driven capability and integration status for Metonia Admin." />
</svelte:head>

<main id="main-content">
	<header class="page-intro">
		<p class="eyebrow">Capability support</p>
		<h1>Visible limits.<br /><em>Useful confidence.</em></h1>
		<p>A package existing upstream is not enough. Metonia separates ecosystem maturity from the integration evidence required to generate, install, check, test, and build.</p>
		<a href={resolve('/#configurator')}>Try the supported recipe <span aria-hidden="true">↗</span></a>
	</header>
	<SupportMatrix />
</main>

<style>
	main { margin: 0 auto; max-width: var(--page-width); padding: 0 var(--page-gutter); }
	.page-intro { border-bottom: 1px solid var(--color-border-strong); padding: clamp(4rem, 9vw, 8rem) 0 clamp(2.5rem, 5vw, 4rem); }
	.eyebrow { color: var(--color-primary); font-family: 'IBM Plex Mono', monospace; font-size: 0.67rem; font-weight: 600; letter-spacing: 0.09em; margin: 0; text-transform: uppercase; }
	h1 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(3rem, 8vw, 7rem); letter-spacing: -0.075em; line-height: 0.88; margin: 1rem 0 1.2rem; }
	h1 em { color: var(--color-primary); font-style: normal; }
	.page-intro > p:not(.eyebrow) { color: var(--color-muted-foreground); font-size: 1.12rem; line-height: 1.55; max-width: 46rem; }
	.page-intro a { align-items: center; display: inline-flex; font-weight: 600; gap: 0.5rem; min-height: 2.75rem; text-underline-offset: 0.3rem; }
</style>
