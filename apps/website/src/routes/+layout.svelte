<script lang="ts">
	import '../app.css';
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<a class="skip-link" href="#main-content">Skip to content</a>

<header class="site-header">
	<div class="header-inner">
		<a class="wordmark" href={resolve('/')} aria-label="Metonia Admin home">
			<span aria-hidden="true" class="mark"><i></i><i></i><i></i></span>
			<span class="wordmark-copy"><strong>Metonia</strong><span>Admin</span></span>
		</a>
		<nav aria-label="Primary navigation">
			<a href={resolve('/docs')}>Docs</a>
			<a href={resolve('/support')}>Support</a>
			<a class="create-link" href={resolve('/#configurator')}>Build a starter <span aria-hidden="true">↘</span></a>
		</nav>
	</div>
</header>

{@render children()}

<footer>
	<div class="footer-inner">
		<div>
			<a class="footer-name" href={resolve('/')}>Metonia Admin</a>
			<p>Compose a native SvelteKit admin, then own every line.</p>
		</div>
		<nav aria-label="Footer navigation"><a href={resolve('/docs')}>Documentation</a><a href={resolve('/support')}>Capability support</a></nav>
		<p class="security"><strong>Security note</strong> Authentication is deferred. Verify authorization before production use.</p>
	</div>
	<div class="footer-base"><span>Open source · MIT</span><span>Native SvelteKit workbench</span></div>
</footer>

<style>
	.skip-link {
		background: var(--color-foreground);
		color: var(--color-raised);
		left: 1rem;
		padding: 0.75rem 1rem;
		position: fixed;
		top: -5rem;
		z-index: 100;
	}

	.skip-link:focus {
		top: 1rem;
	}

	.site-header {
		background: color-mix(in srgb, var(--color-background), white 28%);
		border-bottom: 1px solid var(--color-border-strong);
		position: relative;
		z-index: 20;
	}

	.header-inner {
		align-items: center;
		display: flex;
		justify-content: space-between;
		margin: 0 auto;
		max-width: var(--page-width);
		min-height: 5rem;
		padding: 0 var(--page-gutter);
	}

	.wordmark {
		align-items: center;
		display: inline-flex;
		gap: 0.7rem;
		min-height: 2.75rem;
		text-decoration: none;
	}

	.mark {
		align-items: flex-end;
		border: 1px solid var(--color-foreground);
		display: inline-flex;
		gap: 0.17rem;
		height: 2rem;
		justify-content: center;
		padding: 0.34rem;
		width: 2rem;
	}

	.mark i {
		background: var(--color-primary);
		display: block;
		width: 0.25rem;
	}

	.mark i:first-child {
		height: 40%;
	}

	.mark i:nth-child(2) {
		height: 85%;
	}

	.mark i:last-child {
		height: 62%;
	}

	.wordmark-copy {
		display: flex;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1rem;
		gap: 0.3rem;
		letter-spacing: -0.025em;
	}

	.wordmark-copy strong {
		font-weight: 600;
	}

	.wordmark-copy span {
		color: var(--color-muted-foreground);
	}

	.header-inner nav {
		align-items: center;
		display: flex;
		gap: 0.25rem;
	}

	.header-inner nav a {
		align-items: center;
		border: 1px solid transparent;
		display: inline-flex;
		font-size: 0.9rem;
		font-weight: 600;
		min-height: 2.75rem;
		padding: 0 0.8rem;
		text-decoration: none;
		transition: background 160ms ease, border-color 160ms ease;
	}

	.header-inner nav a:hover {
		background: var(--color-raised);
		border-color: var(--color-border);
	}

	.header-inner nav .create-link {
		background: var(--color-foreground);
		border-color: var(--color-foreground);
		color: var(--color-raised);
		gap: 0.55rem;
		margin-left: 0.35rem;
	}

	.header-inner nav .create-link:hover {
		background: var(--color-primary);
		border-color: var(--color-primary);
	}

	footer {
		background: var(--color-foreground);
		color: var(--color-raised);
	}

	.footer-inner,
	.footer-base {
		margin: 0 auto;
		max-width: var(--page-width);
		padding-left: var(--page-gutter);
		padding-right: var(--page-gutter);
	}

	.footer-inner {
		display: grid;
		gap: 2rem;
		padding-bottom: 2.5rem;
		padding-top: 3rem;
	}

	.footer-name {
		align-items: center;
		display: inline-flex;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 1.15rem;
		font-weight: 600;
		min-height: 2.75rem;
		text-decoration: none;
	}

	.footer-inner p {
		color: #bdc8c2;
		line-height: 1.45;
		margin: 0.5rem 0 0;
		max-width: 24rem;
	}

	.footer-inner nav {
		display: grid;
		gap: 0.1rem;
	}

	.footer-inner nav a {
		align-items: center;
		display: inline-flex;
		min-height: 2.75rem;
		text-underline-offset: 0.25rem;
	}

	.security {
		font-size: 0.88rem;
	}

	.security strong {
		color: var(--color-raised);
		display: block;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.footer-base {
		border-top: 1px solid #44504b;
		color: #a8b5af;
		display: flex;
		flex-wrap: wrap;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.68rem;
		gap: 0.5rem 1rem;
		justify-content: space-between;
		letter-spacing: 0.04em;
		padding-bottom: 1.2rem;
		padding-top: 1.2rem;
		text-transform: uppercase;
	}

	@media (min-width: 48rem) {
		.footer-inner {
			grid-template-columns: minmax(0, 1.2fr) minmax(10rem, 0.7fr) minmax(16rem, 1fr);
		}
	}

	@media (max-width: 39.99rem) {
		.header-inner {
			min-height: 4rem;
		}

		.header-inner nav a:not(.create-link) {
			display: none;
		}

		.header-inner nav .create-link {
			margin-left: 0;
			padding: 0 0.7rem;
		}

		.create-link span {
			display: none;
		}
	}

	@media (max-width: 23rem) {
		.wordmark-copy span {
			display: none;
		}
	}
</style>
