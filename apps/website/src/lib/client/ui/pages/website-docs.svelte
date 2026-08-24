<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Documentation — Metonia Admin</title>
	<meta name="description" content="Architecture and getting-started documentation for Metonia Admin." />
</svelte:head>

<main id="main-content">
	<header class="page-intro">
		<p class="eyebrow">Documentation / Architecture</p>
		<h1>Start native.<br /><em>Stay legible.</em></h1>
		<p>Metonia is a generator and a set of conventions—not an application runtime. The project it leaves behind still reads like SvelteKit.</p>
		<a href={resolve('/#configurator')}>Open the configurator <span aria-hidden="true">↗</span></a>
	</header>

	<div class="docs-grid">
		<nav aria-label="Documentation topics">
			<span>On this page</span>
			<a href="#first-project"><b>01</b> First project</a>
			<a href="#boundaries"><b>02</b> Boundaries</a>
			<a href="#composition"><b>03</b> Composition</a>
			<a href="#data"><b>04</b> Data modes</a>
			<a href="#security"><b>05</b> Security baseline</a>
		</nav>

		<article>
			<section id="first-project">
				<div class="section-index">01</div>
				<div><p class="eyebrow">First project</p><h2>Generate the default recipe.</h2><div class="command"><span>Shell</span><code>bunx create-metonia-admin@latest acme-admin --yes<br />cd acme-admin<br />bun install<br />bun run dev</code></div><p>The generated project records its capabilities in <code>metonia-admin.config.ts</code>. Its README and AGENTS.md use the package-manager commands you selected.</p></div>
			</section>

			<section id="boundaries">
				<div class="section-index">02</div>
				<div><p class="eyebrow">Application boundary</p><h2>Client points inward. Server points inward.</h2><div class="boundary-rule"><span>$lib/client</span><b aria-hidden="true">→</b><strong>$lib/shared</strong><b aria-hidden="true">←</b><span>$lib/server</span></div><p><code>$lib/client</code> contains browser-safe UI and page coordination. <code>$lib/server</code> contains persistence, services, and private values. <code>$lib/shared</code> holds runtime-neutral schemas, types, and pure utilities.</p></div>
			</section>

			<section id="composition">
				<div class="section-index">03</div>
				<div><p class="eyebrow">UI composition</p><h2>Routes adapt. Pages compose.</h2><ol><li><span>01</span><strong>Components</strong><p>Reusable primitives with explicit props and callbacks.</p></li><li><span>02</span><strong>Views</strong><p>Meaningful sections assembled from components.</p></li><li><span>03</span><strong>Pages</strong><p>Complete client-side screens and coordination.</p></li><li><span>04</span><strong>Routes</strong><p>URL, data, mutation, and page-adapter boundaries.</p></li></ol><p>Dashboard is the reference composition. Users is the reference shared, server, and client CRUD resource.</p></div>
			</section>

			<section id="data">
				<div class="section-index">04</div>
				<div><p class="eyebrow">Data modes</p><h2>One application, two boundary choices.</h2><div class="mode-list"><div><strong>Standard SvelteKit</strong><span>Default</span><p>Server load functions and form actions keep page-to-server communication native.</p></div><div><strong>Remote Functions</strong><span class="warning">Experimental</span><p>A separate route-boundary variation. It does not create a second UI or persistence architecture.</p></div></div></div>
			</section>

			<section id="security">
				<div class="section-index">05</div>
				<div><p class="eyebrow">Security baseline</p><h2>Deferred does not mean invisible.</h2><div class="security-note"><strong>Authentication and authorization are not included yet.</strong><p>The generated starter is not production-secure by default. Before deployment, protect routes and mutations for your own threat model.</p></div><p>The architecture still keeps private environment access and persistence server-only, validates untrusted mutations at the server boundary, and avoids returning raw database errors.</p></div>
			</section>
		</article>
	</div>
</main>

<style>
	main { margin: 0 auto; max-width: var(--page-width); padding: 0 var(--page-gutter) clamp(5rem, 10vw, 8rem); }
	.page-intro { border-bottom: 1px solid var(--color-border-strong); display: grid; gap: 1rem; padding: clamp(4rem, 9vw, 8rem) 0 clamp(2.5rem, 6vw, 5rem); }
	.eyebrow, nav > span, .command > span { color: var(--color-primary); font-family: 'IBM Plex Mono', monospace; font-size: 0.67rem; font-weight: 600; letter-spacing: 0.09em; margin: 0; text-transform: uppercase; }
	h1, h2 { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.055em; }
	h1 { font-size: clamp(3rem, 8vw, 7rem); line-height: 0.88; margin: 0.5rem 0; }
	h1 em { color: var(--color-primary); font-style: normal; }
	.page-intro > p:not(.eyebrow) { color: var(--color-muted-foreground); font-size: 1.15rem; line-height: 1.55; max-width: 42rem; }
	.page-intro > a { align-items: center; display: inline-flex; font-weight: 600; gap: 0.5rem; justify-self: start; min-height: 2.75rem; text-underline-offset: 0.3rem; }
	.docs-grid { display: grid; gap: clamp(2rem, 5vw, 5rem); }
	.docs-grid > nav { align-self: start; display: grid; padding-top: 2rem; }
	.docs-grid > nav > span { margin-bottom: 0.75rem; }
	.docs-grid > nav a { align-items: center; border-top: 1px solid var(--color-border); color: var(--color-muted-foreground); display: grid; font-size: 0.88rem; gap: 0.6rem; grid-template-columns: 1.6rem 1fr; min-height: 2.75rem; text-decoration: none; }
	.docs-grid > nav a:hover { color: var(--color-primary); }
	.docs-grid > nav b { color: var(--color-primary); font-family: 'IBM Plex Mono', monospace; font-size: 0.62rem; }
	article { min-width: 0; }
	article section { display: grid; gap: 1rem; grid-template-columns: 2rem minmax(0, 1fr); padding: clamp(2.5rem, 6vw, 5rem) 0; scroll-margin-top: 2rem; }
	article section + section { border-top: 1px solid var(--color-border-strong); }
	.section-index { color: var(--color-border-strong); font-family: 'IBM Plex Mono', monospace; font-size: 0.72rem; padding-top: 0.2rem; }
	h2 { font-size: clamp(1.8rem, 4vw, 3.4rem); line-height: 1.04; margin: 0.5rem 0 1.25rem; text-wrap: balance; }
	article p { color: var(--color-muted-foreground); line-height: 1.6; max-width: 48rem; }
	article code { font-family: 'IBM Plex Mono', monospace; font-size: 0.84em; overflow-wrap: anywhere; }
	.command { background: var(--color-code); border: 1px solid var(--color-border-strong); display: grid; gap: 0.75rem; margin: 1.5rem 0; padding: 1rem; }
	.command code { line-height: 1.75; }
	.boundary-rule { align-items: center; background: var(--color-primary-soft); border: 1px solid color-mix(in srgb, var(--color-primary), white 48%); display: flex; flex-wrap: wrap; font-family: 'IBM Plex Mono', monospace; font-size: clamp(0.7rem, 2vw, 0.82rem); gap: 0.5rem; justify-content: center; margin: 1.5rem 0; padding: 1.25rem; }
	.boundary-rule b { color: var(--color-primary); }
	ol { display: grid; list-style: none; margin: 1.5rem 0; padding: 0; }
	ol li { border-top: 1px solid var(--color-border); display: grid; gap: 0.6rem; grid-template-columns: 2rem minmax(0, 1fr); padding: 0.9rem 0; }
	ol li > span { color: var(--color-primary); font-family: 'IBM Plex Mono', monospace; font-size: 0.65rem; }
	ol li > strong { font-family: 'Space Grotesk', sans-serif; }
	ol li p { grid-column: 2; margin: -0.35rem 0 0; }
	.mode-list { border: 1px solid var(--color-border-strong); margin: 1.5rem 0; }
	.mode-list > div { display: grid; gap: 0.4rem; padding: 1rem; }
	.mode-list > div + div { border-top: 1px solid var(--color-border); }
	.mode-list strong { font-family: 'Space Grotesk', sans-serif; }
	.mode-list span { color: var(--color-primary); font-family: 'IBM Plex Mono', monospace; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; }
	.mode-list .warning { color: var(--color-warning); }
	.mode-list p { margin: 0; }
	.security-note { background: var(--color-warning-soft); border-left: 3px solid var(--color-warning); margin: 1.5rem 0; padding: 1rem; }
	.security-note strong { font-family: 'Space Grotesk', sans-serif; }
	.security-note p { margin-bottom: 0; }
	@media (min-width: 52rem) { .docs-grid { grid-template-columns: 13rem minmax(0, 1fr); } .docs-grid > nav { position: sticky; top: 0; } article section { gap: 1.5rem; grid-template-columns: 3rem minmax(0, 1fr); } ol { grid-template-columns: repeat(2, 1fr); } ol li:nth-child(even) { border-left: 1px solid var(--color-border); padding-left: 1rem; } .mode-list { display: grid; grid-template-columns: repeat(2, 1fr); } .mode-list > div + div { border-left: 1px solid var(--color-border); border-top: 0; } }
</style>
