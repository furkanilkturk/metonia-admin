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
		gap: 0.65rem;
		padding: 1rem 0;
	}

	.field:first-child {
		border-top: 0;
		padding-top: 0;
	}

	.field-copy {
		min-width: 0;
	}

	label {
		display: block;
		font-family: 'Space Grotesk', sans-serif;
		font-size: 0.92rem;
		font-weight: 600;
		letter-spacing: -0.015em;
	}

	p {
		color: var(--color-muted-foreground);
		font-size: 0.8rem;
		line-height: 1.4;
		margin: 0.22rem 0 0;
	}

	.control {
		align-items: center;
		display: grid;
		gap: 0.4rem;
		grid-template-columns: minmax(0, 1fr) auto;
		min-width: 0;
	}

	select {
		appearance: auto;
		background: var(--color-raised);
		border: 1px solid var(--color-border-strong);
		border-radius: 0.25rem;
		color: var(--color-foreground);
		min-height: 2.75rem;
		min-width: 0;
		padding: 0 0.65rem;
		width: 100%;
	}

	select:hover {
		border-color: var(--color-primary);
	}

	@media (min-width: 38rem) {
		.field {
			align-items: center;
			gap: 1.25rem;
			grid-template-columns: minmax(9.5rem, 0.9fr) minmax(13rem, 1.1fr);
		}
	}
</style>
