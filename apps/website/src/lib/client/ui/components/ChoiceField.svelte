<script lang="ts">
	import StatusBadge from './StatusBadge.svelte';
	import type { ChoiceOption } from '@metonia-admin/registry';

	let {
		id,
		label,
		description,
		value,
		options,
		onchange
	}: {
		id: string;
		label: string;
		description: string;
		value: string;
		options: readonly ChoiceOption[];
		onchange: (value: string) => void;
	} = $props();

	let selected = $derived(options.find((option) => option.id === value));

	function update(event: Event) {
		onchange((event.currentTarget as HTMLSelectElement).value);
	}
</script>

<div class="field">
	<div class="field-copy">
		<label for={id}>{label}</label>
		<p id={`${id}-help`}>{description}</p>
	</div>
	<div class="control">
		<select {id} aria-describedby={`${id}-help`} {value} onchange={update}>
			{#each options as option (option.id)}
				<option disabled={!option.selectable} value={option.id}>
					{option.label}{option.selectable ? '' : ' — unavailable'}
				</option>
			{/each}
		</select>
		{#if selected}
			<StatusBadge status={selected.support.integration} />
		{/if}
	</div>
</div>

<style>
	.field {
		border-top: 1px solid var(--color-border);
		display: grid;
		gap: 0.55rem;
		padding: 0.8rem 0;
	}

	.field:first-child {
		border-top: 0;
	}

	.field-copy {
		min-width: 0;
	}

	label {
		display: block;
		font-family: 'IBM Plex Sans Condensed', sans-serif;
		font-size: 0.92rem;
		font-weight: 600;
	}

	p {
		color: var(--color-muted-foreground);
		font-size: 0.75rem;
		line-height: 1.38;
		margin: 0.16rem 0 0;
	}

	.control {
		align-items: center;
		display: grid;
		gap: 0.45rem;
		grid-template-columns: minmax(0, 1fr) auto;
		min-width: 0;
	}

	select {
		background: var(--color-card);
		border: 1px solid var(--color-border-strong);
		border-radius: 0;
		color: var(--color-foreground);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.74rem;
		min-height: 2.75rem;
		min-width: 0;
		padding: 0 0.55rem;
		width: 100%;
	}

	select:hover {
		border-color: var(--color-primary);
	}

	@media (min-width: 38rem) and (max-width: 69.99rem) {
		.field {
			align-items: center;
			gap: 1rem;
			grid-template-columns: minmax(9rem, 0.85fr) minmax(13rem, 1.15fr);
		}
	}
</style>
