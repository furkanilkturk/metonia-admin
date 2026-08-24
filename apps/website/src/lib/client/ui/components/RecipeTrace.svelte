<script lang="ts">
	let { labels, compact = false }: { labels: readonly string[]; compact?: boolean } = $props();
</script>

<ol class:compact class="trace" aria-label="Configuration recipe trace">
	{#each labels as label, index (`${index}-${label}`)}
		<li>
			<span class="step">{String(index + 1).padStart(2, '0')}</span>
			<span class="label">{label}</span>
		</li>
	{/each}
</ol>

<style>
	.trace {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem 1.55rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		align-items: center;
		background: var(--color-raised);
		border: 1px solid var(--color-border-strong);
		display: flex;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.72rem;
		font-weight: 500;
		gap: 0.45rem;
		letter-spacing: -0.01em;
		min-height: 2.25rem;
		padding: 0 0.65rem 0 0.4rem;
		position: relative;
	}

	li:not(:last-child)::after {
		background: var(--color-primary);
		content: '';
		height: 1px;
		left: 100%;
		position: absolute;
		width: 1.6rem;
	}

	.step {
		align-items: center;
		background: var(--color-primary-soft);
		color: var(--color-primary);
		display: inline-flex;
		font-size: 0.62rem;
		height: 1.4rem;
		justify-content: center;
		width: 1.65rem;
	}

	.label {
		overflow-wrap: anywhere;
	}

	.compact {
		gap: 0.4rem 1rem;
	}

	.compact li {
		font-size: 0.65rem;
		min-height: 1.8rem;
		padding-right: 0.45rem;
	}

	.compact li:not(:last-child)::after {
		width: 1.05rem;
	}

	.compact .step {
		font-size: 0.55rem;
		height: 1.15rem;
		width: 1.35rem;
	}

	@media (max-width: 39.99rem) {
		.trace {
			align-items: flex-start;
			flex-direction: column;
			gap: 0.65rem;
		}

		li {
			max-width: 100%;
		}

		li:not(:last-child)::after,
		.compact li:not(:last-child)::after {
			height: 0.7rem;
			left: 1rem;
			top: 100%;
			width: 1px;
		}
	}
</style>
