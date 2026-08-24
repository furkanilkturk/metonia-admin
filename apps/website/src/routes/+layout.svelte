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
			<span class="topology-mark" aria-hidden="true"><i></i><i></i><i></i></span>
			<span><strong>Metonia</strong><small>admin project assembler</small></span>
		</a>
		<nav aria-label="Primary navigation">
			<a href={resolve('/docs')}>Docs</a>
			<a href={resolve('/support')}>Support</a>
			<a class="configure-link" href={resolve('/#configurator')}>Configure</a>
		</nav>
	</div>
</header>

{@render children()}

<footer>
	<div class="footer-inner">
		<div>
			<strong>Metonia Admin</strong>
			<p>Generate native SvelteKit code. Keep the project.</p>
		</div>
		<nav aria-label="Footer navigation">
			<a href={resolve('/#configurator')}>Configurator</a>
			<a href={resolve('/docs')}>Documentation</a>
			<a href={resolve('/support')}>Support ledger</a>
		</nav>
		<p class="security"><span>Production note</span> Authentication and authorization are deferred; add both before deployment.</p>
	</div>
	<div class="footer-base"><span>MIT licensed</span><span>No Metonia runtime required</span></div>
</footer>

<style>
	.skip-link {
		background: var(--color-foreground);
		color: white;
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
		background: var(--color-card);
		border-bottom: 1px solid var(--color-border);
	}

	.header-inner {
		align-items: center;
		display: flex;
		justify-content: space-between;
		margin: 0 auto;
		max-width: var(--page-width);
		min-height: 4.25rem;
		padding: 0 var(--page-gutter);
	}

	.wordmark {
		align-items: center;
		display: inline-flex;
		gap: 0.75rem;
		min-height: 2.75rem;
		text-decoration: none;
	}

	.wordmark > span:last-child {
		display: grid;
		line-height: 1.05;
	}

	.wordmark strong {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: 1.08rem;
		font-weight: 600;
	}

	.wordmark small {
		color: var(--color-muted-foreground);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.58rem;
		letter-spacing: 0.035em;
		margin-top: 0.16rem;
	}

	.topology-mark {
		display: grid;
		grid-template-columns: repeat(2, 0.48rem);
		grid-template-rows: repeat(2, 0.48rem);
		height: 1.7rem;
		position: relative;
		width: 1.7rem;
	}

	.topology-mark::before,
	.topology-mark::after {
		background: var(--color-primary);
		content: '';
		position: absolute;
	}

	.topology-mark::before {
		height: 1px;
		left: 0.45rem;
		top: 0.43rem;
		width: 0.48rem;
	}

	.topology-mark::after {
		height: 0.48rem;
		left: 0.9rem;
		top: 0.43rem;
		width: 1px;
	}

	.topology-mark i {
		background: var(--color-card);
		border: 2px solid var(--color-primary);
		height: 0.48rem;
		position: relative;
		width: 0.48rem;
		z-index: 1;
	}

	.topology-mark i:first-child {
		grid-column: 1;
		grid-row: 1;
	}

	.topology-mark i:nth-child(2) {
		grid-column: 2;
		grid-row: 1;
	}

	.topology-mark i:last-child {
		grid-column: 2;
		grid-row: 2;
	}

	.header-inner nav {
		align-items: center;
		display: flex;
		gap: 0.2rem;
	}

	.header-inner nav a {
		align-items: center;
		display: inline-flex;
		font-size: 0.85rem;
		font-weight: 500;
		min-height: 2.75rem;
		padding: 0 0.72rem;
		text-decoration: none;
	}

	.header-inner nav a:hover {
		color: var(--color-primary);
		text-decoration: underline;
		text-underline-offset: 0.3rem;
	}

	.header-inner nav .configure-link {
		background: var(--color-accent);
		color: white;
		font-weight: 600;
		margin-left: 0.35rem;
	}

	.header-inner nav .configure-link:hover {
		background: var(--color-foreground);
		color: white;
		text-decoration: none;
	}

	footer {
		background: var(--color-foreground);
		color: white;
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
		padding-bottom: 2.25rem;
		padding-top: 2.5rem;
	}

	.footer-inner strong {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: 1.1rem;
	}

	.footer-inner p {
		color: #b8c2c8;
		font-size: 0.86rem;
		line-height: 1.45;
		margin: 0.4rem 0 0;
		max-width: 25rem;
	}

	.footer-inner nav {
		display: grid;
	}

	.footer-inner nav a {
		align-items: center;
		display: inline-flex;
		min-height: 2.75rem;
		text-underline-offset: 0.28rem;
	}

	.security span {
		color: white;
		display: block;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.62rem;
		letter-spacing: 0.07em;
		margin-bottom: 0.3rem;
		text-transform: uppercase;
	}

	.footer-base {
		border-top: 1px solid #40505a;
		color: #9cabb4;
		display: flex;
		flex-wrap: wrap;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.61rem;
		gap: 0.5rem 1rem;
		justify-content: space-between;
		letter-spacing: 0.055em;
		padding-bottom: 1rem;
		padding-top: 1rem;
		text-transform: uppercase;
	}

	@media (min-width: 48rem) {
		.footer-inner {
			grid-template-columns: minmax(0, 1.15fr) minmax(10rem, 0.65fr) minmax(16rem, 1fr);
		}
	}

	@media (max-width: 39.99rem) {
		.header-inner {
			min-height: 3.75rem;
		}

		.header-inner nav a:not(.configure-link) {
			display: none;
		}
	}

	@media (max-width: 23rem) {
		.wordmark small {
			display: none;
		}
	}
</style>
