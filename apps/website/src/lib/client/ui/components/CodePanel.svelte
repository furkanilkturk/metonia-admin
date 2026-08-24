<script lang="ts">
	let {
		label,
		code,
		oncopy
	}: { label: string; code: string; oncopy: () => void } = $props();
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
		border: 1px solid var(--color-border-strong);
		color: var(--color-foreground);
		overflow: hidden;
	}

	.panel-header {
		align-items: center;
		background: var(--color-raised);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.67rem;
		font-weight: 600;
		justify-content: space-between;
		letter-spacing: 0.06em;
		min-height: 2.8rem;
		padding: 0 0.45rem 0 0.8rem;
		text-transform: uppercase;
	}

	button {
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: 0.2rem;
		color: var(--color-foreground);
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.8rem;
		font-weight: 600;
		min-height: 2.75rem;
		padding: 0 0.65rem;
		text-transform: none;
	}

	button:hover {
		background: var(--color-primary-soft);
		border-color: var(--color-primary);
	}

	pre {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.73rem;
		line-height: 1.6;
		margin: 0;
		max-height: 18rem;
		overflow: auto;
		overflow-wrap: anywhere;
		padding: 1rem;
		white-space: pre-wrap;
	}
</style>
