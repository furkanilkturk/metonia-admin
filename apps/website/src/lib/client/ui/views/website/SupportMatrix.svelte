<script lang="ts">
	import StatusBadge from '$lib/client/ui/components/StatusBadge.svelte';
	import { configuratorCatalog } from '$lib/shared/configurator';

	const groups = [
		{ label: 'Package managers', items: configuratorCatalog.packageManagers },
		{ label: 'UI adapters', items: configuratorCatalog.uiAdapters },
		{ label: 'UI themes', items: configuratorCatalog.uiAdapters.flatMap((adapter) => adapter.themes) },
		{ label: 'Data boundaries', items: configuratorCatalog.dataPatterns },
		{ label: 'Validation', items: configuratorCatalog.validations },
		{ label: 'ORMs', items: configuratorCatalog.orms },
		{ label: 'Database dialects', items: configuratorCatalog.databaseDialects },
		{ label: 'Starter capabilities', items: [configuratorCatalog.docker, ...configuratorCatalog.resources] }
	];
</script>

<section aria-labelledby="support-title" class="support">
	<div class="section-heading">
		<p class="eyebrow">Registry projection</p>
		<h2 id="support-title">Capability by capability.</h2>
		<p>Upstream maturity and Metonia integration are different claims. The catalog reports both, including warnings and blockers for work that has not crossed its release gate.</p>
	</div>

	<div class="legend" aria-label="Status definitions">
		<span><StatusBadge status="stable" /> Advertised integration gate passes.</span>
		<span><StatusBadge status="experimental" /> Explicit opt-in; change risk remains.</span>
		<span><StatusBadge status="unknown" /> No working-generation claim.</span>
	</div>

	<div class="matrix">
		{#each groups as group (group.label)}
			<section class="matrix-group" aria-labelledby={`group-${group.label.toLowerCase().replaceAll(' ', '-')}`}>
				<h3 id={`group-${group.label.toLowerCase().replaceAll(' ', '-')}`}>{group.label}<span>{group.items.length}</span></h3>
				<ul>
					{#each group.items as item (item.id)}
						<li>
							<div class="capability">
								<div class="title-line"><strong>{item.label}</strong>{#if !item.selectable}<span class="unavailable">Unavailable</span>{/if}</div>
								<p>{item.description}</p>
								{#if item.support.warning}<small>{item.support.warning}</small>{/if}
								{#if item.support.blocker}<small>{item.support.blocker.summary}</small>{/if}
							</div>
							<div class="statuses">
								<span><b>Upstream</b><StatusBadge status={item.support.upstream} /></span>
								<span><b>Metonia</b><StatusBadge status={item.support.integration} /></span>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</section>

<style>
	.support { padding: clamp(3rem, 7vw, 6rem) 0 clamp(5rem, 10vw, 8rem); }
	.section-heading { max-width: 54rem; }
	.eyebrow { color: var(--color-primary); font-family: 'IBM Plex Mono', monospace; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.09em; margin: 0; text-transform: uppercase; }
	h2 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(2rem, 4vw, 3.8rem); letter-spacing: -0.055em; line-height: 1.02; margin: 0.6rem 0 0.8rem; }
	.section-heading > p:not(.eyebrow) { color: var(--color-muted-foreground); line-height: 1.55; }
	.legend { border-bottom: 1px solid var(--color-border-strong); border-top: 1px solid var(--color-border-strong); color: var(--color-muted-foreground); display: grid; font-size: 0.8rem; gap: 0.75rem; margin-top: 2rem; padding: 1rem 0; }
	.legend > span { align-items: center; display: flex; gap: 0.55rem; }
	.matrix { display: grid; gap: 1.25rem; margin-top: 2rem; }
	.matrix-group { background: var(--color-raised); border: 1px solid var(--color-border-strong); min-width: 0; }
	h3 { align-items: center; background: var(--color-foreground); color: var(--color-raised); display: flex; font-family: 'Space Grotesk', sans-serif; font-size: 1rem; justify-content: space-between; letter-spacing: -0.02em; margin: 0; min-height: 3rem; padding: 0 0.9rem; }
	h3 span { color: #99aaa2; font-family: 'IBM Plex Mono', monospace; font-size: 0.65rem; }
	ul { list-style: none; margin: 0; padding: 0; }
	li { align-items: flex-start; border-top: 1px solid var(--color-border); display: grid; gap: 1rem; padding: 1rem 0.9rem; }
	li:first-child { border-top: 0; }
	.capability { min-width: 0; }
	.title-line { align-items: center; display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.title-line > strong { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.015em; }
	.unavailable { border: 1px solid color-mix(in srgb, var(--color-destructive), white 60%); color: var(--color-destructive); font-family: 'IBM Plex Mono', monospace; font-size: 0.6rem; font-weight: 600; padding: 0.15rem 0.3rem; text-transform: uppercase; }
	p, small { color: var(--color-muted-foreground); display: block; font-size: 0.82rem; line-height: 1.45; margin: 0.3rem 0 0; }
	small { color: var(--color-warning); max-width: 46rem; }
	.statuses { display: grid; gap: 0.45rem; min-width: 13rem; }
	.statuses > span { align-items: center; display: grid; gap: 0.45rem; grid-template-columns: 4rem auto; justify-content: start; }
	.statuses b { color: var(--color-muted-foreground); font-family: 'IBM Plex Mono', monospace; font-size: 0.62rem; font-weight: 500; text-transform: uppercase; }
	@media (min-width: 42rem) { .legend { grid-template-columns: repeat(3, 1fr); } li { grid-template-columns: minmax(0, 1fr) auto; } }
	@media (min-width: 68rem) { .matrix { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
