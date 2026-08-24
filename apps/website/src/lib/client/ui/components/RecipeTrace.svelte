<script lang="ts">
	let { labels, compact = false }: { labels: readonly string[]; compact?: boolean } = $props();
</script>

<ul class:compact class="trace" aria-label="Selected project capabilities">
	{#each labels as label, index (`${index}-${label}`)}
		<li>{label}</li>
	{/each}
</ul>

<style>
	.trace {
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		border: 1px solid var(--color-border-strong);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.68rem;
		margin: 0 -1px -1px 0;
		min-height: 2.4rem;
		padding: 0.65rem 0.75rem;
	}

	li::before {
		color: var(--color-primary);
		content: '/';
		margin-right: 0.4rem;
	}

	.compact li {
		font-size: 0.62rem;
		min-height: 2rem;
		padding: 0.5rem 0.6rem;
	}
</style>
