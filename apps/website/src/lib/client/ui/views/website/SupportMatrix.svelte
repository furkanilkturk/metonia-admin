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
		{
			label: 'Starter capabilities',
			items: [configuratorCatalog.docker, ...configuratorCatalog.resources]
		}
	];
</script>

<section aria-labelledby="support-title" class="support">
	<div class="section-heading">
		<p class="eyebrow">Registry projection</p>
		<h2 id="support-title">Current capability ledger</h2>
		<p>
			Unavailable choices stay visible. Warnings and blockers are shown directly from the registry
			instead of being translated into marketing claims.
		</p>
	</div>

	<div class="legend" aria-label="Status definitions">
		<span><StatusBadge status="stable" /> integration gate passes</span>
		<span><StatusBadge status="experimental" /> explicit opt-in; change risk remains</span>
		<span><StatusBadge status="unknown" /> no working-generation claim</span>
	</div>

	<div class="ledger">
		{#each groups as group (group.label)}
			<section class="ledger-group" aria-labelledby={`group-${group.label.toLowerCase().replaceAll(' ', '-')}`}>
				<h3 id={`group-${group.label.toLowerCase().replaceAll(' ', '-')}`}>
					{group.label}<span>{group.items.length} entries</span>
				</h3>
				<div class="column-labels" aria-hidden="true">
					<span>Capability</span><span>Upstream</span><span>Metonia</span>
				</div>
				<ul>
					{#each group.items as item (item.id)}
						<li>
							<div class="capability">
								<div class="title-line">
									<strong>{item.label}</strong>
									<code>{item.id}</code>
									{#if !item.selectable}<span class="unavailable">Unavailable</span>{/if}
								</div>
								<p>{item.description}</p>
								{#if item.support.warning}<small>{item.support.warning}</small>{/if}
								{#if item.support.blocker}<small>{item.support.blocker.summary}</small>{/if}
							</div>
							<div class="status-cell"><b>Upstream</b><StatusBadge status={item.support.upstream} /></div>
							<div class="status-cell"><b>Metonia</b><StatusBadge status={item.support.integration} /></div>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</section>

<style>
	.support {
		padding: clamp(3rem, 6vw, 5rem) 0 clamp(4rem, 9vw, 7rem);
	}

	.section-heading {
		max-width: 48rem;
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

	h2 {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: clamp(2rem, 4vw, 3.25rem);
		font-weight: 600;
		letter-spacing: -0.03em;
		line-height: 1;
		margin: 0.55rem 0 0.8rem;
	}

	.section-heading > p:not(.eyebrow) {
		color: var(--color-muted-foreground);
		line-height: 1.55;
	}

	.legend {
		border-bottom: 1px solid var(--color-border-strong);
		border-top: 1px solid var(--color-border-strong);
		color: var(--color-muted-foreground);
		display: grid;
		font-size: 0.76rem;
		gap: 0.7rem;
		margin-top: 1.75rem;
		padding: 0.9rem 0;
	}

	.legend > span {
		align-items: center;
		display: flex;
		gap: 0.5rem;
	}

	.ledger {
		display: grid;
		gap: 1.25rem;
		margin-top: 1.5rem;
	}

	.ledger-group {
		background: var(--color-card);
		border: 1px solid var(--color-border-strong);
		min-width: 0;
	}

	h3 {
		align-items: center;
		border-bottom: 2px solid var(--color-foreground);
		display: flex;
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		justify-content: space-between;
		margin: 0;
		min-height: 3rem;
		padding: 0 0.85rem;
	}

	h3 span {
		color: var(--color-muted-foreground);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.59rem;
		font-weight: 500;
		text-transform: uppercase;
	}

	.column-labels {
		display: none;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		border-top: 1px solid var(--color-border);
		display: grid;
		gap: 0.7rem;
		padding: 0.85rem;
	}

	li:first-child {
		border-top: 0;
	}

	.capability {
		min-width: 0;
	}

	.title-line {
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.55rem;
	}

	.title-line > strong {
		font-family: 'IBM Plex Sans Condensed', sans-serif;
	}

	.title-line code {
		color: var(--color-primary);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.61rem;
		overflow-wrap: anywhere;
	}

	.unavailable {
		border: 1px solid #dfa6af;
		color: var(--color-destructive);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.56rem;
		font-weight: 600;
		padding: 0.14rem 0.28rem;
		text-transform: uppercase;
	}

	p,
	small {
		color: var(--color-muted-foreground);
		display: block;
		font-size: 0.78rem;
		line-height: 1.45;
		margin: 0.25rem 0 0;
	}

	small {
		color: var(--color-warning);
		max-width: 52rem;
	}

	.status-cell {
		align-items: center;
		display: flex;
		gap: 0.5rem;
	}

	.status-cell b {
		color: var(--color-muted-foreground);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.58rem;
		font-weight: 500;
		min-width: 4rem;
		text-transform: uppercase;
	}

	@media (min-width: 42rem) {
		.legend {
			grid-template-columns: repeat(3, 1fr);
		}

		.column-labels {
			background: var(--color-code);
			border-bottom: 1px solid var(--color-border);
			color: var(--color-muted-foreground);
			display: grid;
			font-family: 'IBM Plex Mono', monospace;
			font-size: 0.57rem;
			grid-template-columns: minmax(0, 1fr) 7.8rem 7.8rem;
			letter-spacing: 0.055em;
			padding: 0.5rem 0.85rem;
			text-transform: uppercase;
		}

		li {
			align-items: start;
			grid-template-columns: minmax(0, 1fr) 7.8rem 7.8rem;
		}

		.status-cell b {
			display: none;
		}
	}
</style>
