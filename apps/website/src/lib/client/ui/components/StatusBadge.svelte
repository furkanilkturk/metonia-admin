<script lang="ts">
	import { statusLabel, type SupportStatus } from '$lib/shared/configurator';

	let { status }: { status: SupportStatus } = $props();
</script>

<span
	class:stable={status === 'stable'}
	class:experimental={status === 'experimental'}
	class:blocked={status === 'unsupported' || status === 'unknown'}
	class="badge"
>
	<span aria-hidden="true" class="marker"></span>{statusLabel[status]}
</span>

<style>
	.badge {
		align-items: center;
		background: var(--color-muted);
		border: 1px solid var(--color-border);
		border-radius: 2px;
		color: var(--color-muted-foreground);
		display: inline-flex;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.59rem;
		font-weight: 600;
		gap: 0.32rem;
		letter-spacing: 0.035em;
		line-height: 1;
		padding: 0.3rem 0.4rem;
		white-space: nowrap;
	}

	.marker {
		background: currentColor;
		height: 0.36rem;
		width: 0.36rem;
	}

	.stable {
		background: var(--color-primary-soft);
		border-color: #9eb2f5;
		color: var(--color-primary);
	}

	.experimental {
		background: var(--color-warning-soft);
		border-color: #d9b56c;
		color: var(--color-warning);
	}

	.blocked {
		background: #fbeaed;
		border-color: #dfa6af;
		color: var(--color-destructive);
	}
</style>
