<script lang="ts">
	let { label, code, oncopy }: { label: string; code: string; oncopy: () => void } = $props();
</script>

<section class="panel" aria-label={label}>
	<div class="panel-header">
		<span>{label}</span>
		<button onclick={oncopy} type="button">Copy</button>
	</div>
	<pre><code>{code}</code></pre>
</section>

<style>
	.panel {
		background: var(--color-code);
		border: 1px solid var(--color-border);
		color: var(--color-foreground);
		min-width: 0;
		overflow: hidden;
	}

	.panel-header {
		align-items: center;
		background: var(--color-card);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.62rem;
		font-weight: 600;
		justify-content: space-between;
		letter-spacing: 0.055em;
		min-height: 2.75rem;
		padding-left: 0.75rem;
		text-transform: uppercase;
	}

	button {
		align-self: stretch;
		background: transparent;
		border: 0;
		border-left: 1px solid var(--color-border);
		color: var(--color-foreground);
		font-size: 0.76rem;
		font-weight: 600;
		min-height: 2.75rem;
		padding: 0 0.8rem;
	}

	button:hover {
		background: var(--color-primary-soft);
		color: var(--color-primary);
	}

	pre {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.7rem;
		line-height: 1.58;
		margin: 0;
		max-height: 18rem;
		overflow: auto;
		overflow-wrap: anywhere;
		padding: 0.85rem;
		white-space: pre-wrap;
	}
</style>
