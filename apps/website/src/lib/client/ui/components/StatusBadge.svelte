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
		border-radius: 999px;
		color: var(--color-muted-foreground);
		display: inline-flex;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.65rem;
		font-weight: 600;
		gap: 0.35rem;
		letter-spacing: 0.035em;
		line-height: 1;
		padding: 0.35rem 0.5rem;
		white-space: nowrap;
	}

	.marker {
		background: currentColor;
		border-radius: 50%;
		height: 0.38rem;
		width: 0.38rem;
	}

	.stable {
		background: var(--color-primary-soft);
		border-color: color-mix(in srgb, var(--color-primary), white 52%);
		color: var(--color-primary);
	}

	.experimental {
		background: var(--color-warning-soft);
		border-color: color-mix(in srgb, var(--color-warning), white 58%);
		color: var(--color-warning);
	}

	.blocked {
		background: color-mix(in srgb, var(--color-destructive), white 90%);
		border-color: color-mix(in srgb, var(--color-destructive), white 65%);
		color: var(--color-destructive);
	}
</style>
