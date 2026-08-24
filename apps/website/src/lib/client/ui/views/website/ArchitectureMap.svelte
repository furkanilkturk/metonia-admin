<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<section aria-labelledby="architecture-title" class="architecture">
	<div class="section-copy">
		<p class="eyebrow">The code you receive</p>
		<h2 id="architecture-title">A boundary you can see in the folder tree.</h2>
		<p>
			Metonia composes a starter; it does not insert itself between your routes and SvelteKit. The
			generated structure makes browser-safe, shared, and server-only code difficult to confuse.
		</p>
		<a href={resolve('/docs#boundaries')}>Read the boundary rules <span aria-hidden="true">→</span></a>
	</div>

	<div class="blueprint" aria-label="Generated source architecture">
		<div class="blueprint-head"><span>Generated source map</span><span>src/lib</span></div>
		<div class="branch client">
			<div class="branch-label"><span>Browser</span><strong>$lib/client</strong></div>
			<ul><li>ui/components</li><li>ui/views</li><li>ui/pages</li><li>page controllers</li></ul>
		</div>
		<div class="shared-core">
			<span>Runtime-neutral join</span>
			<strong>$lib/shared</strong>
			<p>Schemas · domain types · pure utilities</p>
		</div>
		<div class="branch server">
			<div class="branch-label"><span>Server</span><strong>$lib/server</strong></div>
			<ul><li>repositories</li><li>services</li><li>database clients</li><li>private environment</li></ul>
		</div>
		<p class="direction"><span>client</span><b aria-hidden="true">→</b><strong>shared</strong><b aria-hidden="true">←</b><span>server</span></p>
	</div>

	<div class="composition">
		<div><span class="eyebrow">UI composition</span><strong>Small pieces, one direction.</strong></div>
		<ol><li><span>01</span>Components</li><li><span>02</span>Views</li><li><span>03</span>Pages</li><li><span>04</span>Routes</li></ol>
		<p>Routes adapt URLs, data, and mutations to a client page. They do not become entire screens.</p>
	</div>
</section>

<style>
	.architecture { display: grid; gap: clamp(2rem, 5vw, 4rem); padding: clamp(5rem, 10vw, 9rem) 0; }
	.section-copy { max-width: 42rem; }
	.eyebrow, .blueprint-head, .branch-label span, .shared-core > span { color: var(--color-primary); font-family: 'IBM Plex Mono', monospace; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.09em; margin: 0; text-transform: uppercase; }
	h2 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(2rem, 4vw, 3.8rem); letter-spacing: -0.055em; line-height: 1.02; margin: 0.7rem 0 1rem; text-wrap: balance; }
	.section-copy > p:not(.eyebrow) { color: var(--color-muted-foreground); font-size: 1.05rem; line-height: 1.55; max-width: 38rem; }
	.section-copy a { align-items: center; display: inline-flex; font-weight: 600; gap: 0.55rem; min-height: 2.75rem; text-underline-offset: 0.3rem; }
	.blueprint { background: var(--color-raised); border: 1px solid var(--color-border-strong); min-width: 0; padding: clamp(0.85rem, 2vw, 1.4rem); }
	.blueprint-head { border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; padding-bottom: 0.75rem; }
	.branch, .shared-core { border-left: 3px solid var(--color-border-strong); margin-left: 0.7rem; padding: 1rem 0 1rem 1rem; position: relative; }
	.branch::before, .shared-core::before { background: var(--color-border-strong); content: ''; height: 1px; left: 0; position: absolute; top: 1.9rem; width: 0.75rem; }
	.branch-label { display: grid; gap: 0.15rem; padding-left: 0.4rem; }
	.branch-label strong, .shared-core strong { font-family: 'Space Grotesk', sans-serif; font-size: 1.05rem; }
	ul { display: grid; gap: 0.4rem; list-style: none; margin: 0.85rem 0 0; padding: 0; }
	li { border-bottom: 1px solid var(--color-border); font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; padding: 0 0 0.4rem 0.4rem; }
	.shared-core { background: var(--color-primary-soft); border: 1px solid color-mix(in srgb, var(--color-primary), white 48%); border-left: 3px solid var(--color-primary); margin-bottom: 0.4rem; margin-top: 0.4rem; padding: 1rem; }
	.shared-core::before { display: none; }
	.shared-core strong { display: block; margin-top: 0.2rem; }
	.shared-core p { color: var(--color-muted-foreground); font-size: 0.82rem; margin: 0.35rem 0 0; }
	.direction { align-items: center; border-top: 1px solid var(--color-border); display: flex; font-family: 'IBM Plex Mono', monospace; font-size: 0.7rem; gap: 0.55rem; justify-content: center; margin: 0.4rem 0 0; padding-top: 1rem; text-transform: uppercase; }
	.direction b { color: var(--color-primary); }
	.composition { background: var(--color-foreground); color: var(--color-raised); display: grid; gap: 1.25rem; grid-column: 1 / -1; padding: clamp(1.25rem, 3vw, 2rem); }
	.composition > div > strong { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 1.3rem; margin-top: 0.35rem; }
	.composition .eyebrow { color: #80c8c1; }
	ol { display: grid; gap: 0; grid-template-columns: repeat(2, 1fr); list-style: none; margin: 0; padding: 0; }
	ol li { border: 1px solid #59645f; font-family: 'Source Sans 3', sans-serif; font-size: 0.9rem; padding: 0.75rem; }
	ol span { color: #80c8c1; display: block; font-family: 'IBM Plex Mono', monospace; font-size: 0.62rem; margin-bottom: 0.2rem; }
	.composition > p { color: #bdc8c2; font-size: 0.9rem; line-height: 1.45; margin: 0; }
	@media (min-width: 58rem) { .architecture { align-items: center; grid-template-columns: minmax(0, 0.85fr) minmax(30rem, 1.15fr); } .composition { align-items: center; grid-template-columns: minmax(12rem, 0.7fr) minmax(24rem, 1.3fr) minmax(14rem, 0.7fr); } ol { grid-template-columns: repeat(4, 1fr); } }
</style>
