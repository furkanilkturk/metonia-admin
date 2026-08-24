<script lang="ts">
	import { resolve } from '$app/paths';
	import ArchitectureMap from '$lib/client/ui/views/website/ArchitectureMap.svelte';
	import Configurator from '$lib/client/ui/views/website/Configurator.svelte';
	import RecipeTrace from '$lib/client/ui/components/RecipeTrace.svelte';
</script>

<svelte:head>
	<title>Metonia Admin — Compose a native SvelteKit admin</title>
	<meta name="description" content="Configure and generate a native SvelteKit admin application with explicit architecture, registry-backed capabilities, and ordinary code you own." />
</svelte:head>

<main id="main-content">
	<section class="hero" aria-labelledby="hero-title">
		<div class="hero-intro">
			<div class="hero-copy">
				<p class="kicker"><span>Native SvelteKit</span><span>Registry driven</span><span>Code you own</span></p>
				<h1 id="hero-title">Compose the admin.<br /><em>Keep the SvelteKit.</em></h1>
				<p class="thesis">Choose the UI, data boundary, and persistence recipe. Metonia assembles a production-minded starting point without adding another runtime or hiding the framework underneath.</p>
				<div class="actions"><a class="primary" href="#configurator">Build your starter <span aria-hidden="true">↓</span></a><a class="secondary" href={resolve('/docs')}>Understand the architecture</a></div>
			</div>
			<aside class="hero-proof" aria-label="What Metonia generates">
				<p class="proof-label">The output</p>
				<strong>One native project.</strong>
				<ul><li><span>01</span>Thin SvelteKit routes</li><li><span>02</span>Explicit client / shared / server boundaries</li><li><span>03</span>Configuration-aware documentation</li></ul>
				<p class="security"><strong>Before production</strong> Authentication and authorization are deliberately deferred.</p>
			</aside>
		</div>

		<div class="assembly-ribbon" aria-label="Generator recipe assembly">
			<p><span>Recipe assembly</span><strong>Each block adds ordinary project code.</strong></p>
			<RecipeTrace labels={['SvelteKit base', 'Metonia architecture', 'UI + theme', 'Data boundary', 'Persistence', 'Resources']} />
		</div>

		<div id="configurator"><Configurator /></div>
	</section>

	<section class="principles" aria-label="Metonia Admin principles">
		<article><span>01 / Source</span><h2>One catalog</h2><p>The CLI, generator, configurator, and support surface read the same typed capability registry.</p></article>
		<article><span>02 / Output</span><h2>Ordinary code</h2><p>Generated projects remain understandable and runnable without a Metonia application runtime.</p></article>
		<article><span>03 / Support</span><h2>Claims with evidence</h2><p>Upstream availability and verified Metonia integration are shown as separate facts.</p></article>
	</section>

	<ArchitectureMap />

	<section class="getting-started" aria-labelledby="start-title">
		<div>
			<p class="kicker">Start with the default recipe</p>
			<h2 id="start-title">Generate it. Read it. Make it yours.</h2>
			<p>The starter records every selected capability and gives you the commands for the package manager you chose.</p>
		</div>
		<div class="command"><span>Run in your shell</span><code>bunx create-metonia-admin@latest acme-admin --yes</code></div>
		<div class="start-actions"><a class="primary" href="#configurator">Configure first</a><a class="secondary" href={resolve('/support')}>Check capability support</a></div>
	</section>
</main>

<style>
	main { margin: 0 auto; max-width: var(--page-width); padding: 0 var(--page-gutter); }
	.hero { padding: clamp(3.5rem, 8vw, 7.5rem) 0 clamp(5rem, 10vw, 8rem); }
	.hero-intro { display: grid; gap: clamp(2rem, 6vw, 5rem); }
	.hero-copy { max-width: 58rem; }
	.kicker { color: var(--color-primary); display: flex; flex-wrap: wrap; font-family: 'IBM Plex Mono', monospace; font-size: 0.66rem; font-weight: 600; gap: 0.45rem 1.25rem; letter-spacing: 0.08em; margin: 0; text-transform: uppercase; }
	.kicker span:not(:last-child)::after { color: var(--color-border-strong); content: ' /'; margin-left: 1.25rem; }
	h1 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(3.15rem, 8.6vw, 8rem); font-weight: 600; letter-spacing: -0.082em; line-height: 0.86; margin: clamp(1.4rem, 3vw, 2.5rem) 0 1.5rem; text-wrap: balance; }
	h1 em { color: var(--color-primary); font-style: normal; }
	.thesis { font-size: clamp(1.08rem, 2vw, 1.35rem); line-height: 1.52; max-width: 44rem; }
	.actions, .start-actions { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 1.75rem; }
	.primary, .secondary { align-items: center; border: 1px solid var(--color-border-strong); display: inline-flex; font-weight: 600; gap: 0.65rem; justify-content: center; min-height: 2.85rem; padding: 0.55rem 0.9rem; text-decoration: none; transition: background 160ms ease, border-color 160ms ease, color 160ms ease; }
	.primary { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-on-accent); }
	.primary:hover { background: var(--color-foreground); border-color: var(--color-foreground); }
	.secondary { background: var(--color-raised); }
	.secondary:hover { background: var(--color-primary-soft); border-color: var(--color-primary); }
	.hero-proof { align-self: end; border-left: 1px solid var(--color-border-strong); padding-left: clamp(1rem, 3vw, 2rem); }
	.proof-label, .hero-proof li span, .assembly-ribbon > p span, .principles article > span, .command span { color: var(--color-primary); font-family: 'IBM Plex Mono', monospace; font-size: 0.66rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
	.hero-proof > strong { display: block; font-family: 'Space Grotesk', sans-serif; font-size: clamp(1.4rem, 2.5vw, 2rem); letter-spacing: -0.04em; margin-top: 0.5rem; }
	.hero-proof ul { list-style: none; margin: 1rem 0; padding: 0; }
	.hero-proof li { border-top: 1px solid var(--color-border); display: grid; font-size: 0.9rem; gap: 0.65rem; grid-template-columns: 2rem minmax(0, 1fr); line-height: 1.35; padding: 0.7rem 0; }
	.security { background: var(--color-warning-soft); border-left: 3px solid var(--color-warning); color: var(--color-muted-foreground); font-size: 0.82rem; line-height: 1.4; margin: 1.2rem 0 0; padding: 0.7rem 0.8rem; }
	.security strong { color: var(--color-foreground); }
	.assembly-ribbon { align-items: center; border-bottom: 1px solid var(--color-border-strong); border-top: 1px solid var(--color-border-strong); display: grid; gap: 1rem; margin: clamp(3rem, 7vw, 6rem) 0 1.5rem; padding: 1rem 0; }
	.assembly-ribbon > p { margin: 0; }
	.assembly-ribbon > p strong { display: block; font-size: 0.85rem; margin-top: 0.15rem; }
	#configurator { scroll-margin-top: 2rem; }
	.principles { border-bottom: 1px solid var(--color-border-strong); border-top: 1px solid var(--color-border-strong); display: grid; }
	.principles article { padding: 1.5rem 0; }
	.principles article + article { border-top: 1px solid var(--color-border); }
	.principles h2 { font-family: 'Space Grotesk', sans-serif; font-size: 1.35rem; letter-spacing: -0.035em; margin: 0.6rem 0 0.4rem; }
	.principles p { color: var(--color-muted-foreground); font-size: 0.92rem; line-height: 1.5; margin: 0; max-width: 24rem; }
	.getting-started { background: var(--color-primary-soft); border: 1px solid color-mix(in srgb, var(--color-primary), white 42%); display: grid; gap: 1.5rem; margin-bottom: clamp(5rem, 10vw, 8rem); padding: clamp(1.25rem, 4vw, 3rem); }
	.getting-started h2 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(2rem, 4vw, 3.8rem); letter-spacing: -0.055em; line-height: 1.02; margin: 0.7rem 0; }
	.getting-started > div > p:not(.kicker) { color: var(--color-muted-foreground); line-height: 1.5; max-width: 38rem; }
	.command { background: var(--color-raised); border: 1px solid var(--color-border-strong); display: grid; gap: 0.6rem; min-width: 0; padding: 1rem; }
	.command code { font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; line-height: 1.5; overflow-wrap: anywhere; }
	.start-actions { margin-top: 0; }
	@media (min-width: 52rem) { .hero-intro { align-items: end; grid-template-columns: minmax(0, 1.55fr) minmax(19rem, 0.45fr); } .assembly-ribbon { grid-template-columns: minmax(11rem, 0.35fr) minmax(0, 1.65fr); } .principles { grid-template-columns: repeat(3, 1fr); } .principles article { padding: 2rem; } .principles article:first-child { padding-left: 0; } .principles article + article { border-left: 1px solid var(--color-border); border-top: 0; } }
	@media (min-width: 68rem) { .getting-started { align-items: end; grid-template-columns: minmax(0, 1fr) minmax(25rem, 0.8fr); } .start-actions { grid-column: 1 / -1; } }
	@media (max-width: 39.99rem) { .hero { padding-top: 3rem; } h1 { font-size: clamp(3rem, 16vw, 4.2rem); line-height: 0.9; } .hero-proof { border-left: 0; border-top: 1px solid var(--color-border-strong); padding-left: 0; padding-top: 1.5rem; } .actions, .start-actions { align-items: stretch; flex-direction: column; } .actions a, .start-actions a { width: 100%; } }
</style>
