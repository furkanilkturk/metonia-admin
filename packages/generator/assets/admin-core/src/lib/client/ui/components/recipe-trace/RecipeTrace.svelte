<script lang="ts">
	export interface RecipeTraceStep {
		label: string;
		value: string;
	}

	interface Props {
		label?: string;
		steps: readonly RecipeTraceStep[];
	}

	let { label = 'Composition trace', steps }: Props = $props();
</script>

<div class="trace" aria-label={label}>
	<p class="trace-label">{label}</p>
	<ol>
		{#each steps as step (step.label)}
			<li>
				<span class="node" aria-hidden="true"></span>
				<span class="copy">
					<span class="step-label">{step.label}</span>
					<strong>{step.value}</strong>
				</span>
			</li>
		{/each}
	</ol>
</div>

<style>
	.trace {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: color-mix(in oklab, var(--card), var(--primary) 3%);
	}

	.trace-label {
		margin: 0;
		color: var(--muted-foreground);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	ol {
		display: grid;
		gap: 0;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		position: relative;
		display: grid;
		grid-template-columns: 0.75rem 1fr;
		gap: 0.625rem;
		min-width: 0;
		padding-bottom: 1rem;
	}

	li:last-child {
		padding-bottom: 0;
	}

	li:not(:last-child)::after {
		position: absolute;
		top: 0.75rem;
		bottom: 0;
		left: 0.3125rem;
		width: 1px;
		background: var(--border);
		content: '';
	}

	.node {
		position: relative;
		z-index: 1;
		width: 0.6875rem;
		height: 0.6875rem;
		margin-top: 0.2rem;
		border: 2px solid var(--card);
		border-radius: 50%;
		background: var(--primary);
		box-shadow: 0 0 0 1px var(--primary);
	}

	.copy {
		display: grid;
		gap: 0.125rem;
		min-width: 0;
	}

	.step-label {
		color: var(--muted-foreground);
		font-size: 0.75rem;
		line-height: 1.35;
	}

	strong {
		overflow: hidden;
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.35;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (min-width: 48rem) {
		ol {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		li {
			grid-template-columns: 0.75rem minmax(0, 1fr);
			padding: 0 1rem 0 0;
		}

		li:not(:last-child)::after {
			top: 0.3125rem;
			right: 0;
			bottom: auto;
			left: 0.75rem;
			width: auto;
			height: 1px;
		}
	}
</style>
