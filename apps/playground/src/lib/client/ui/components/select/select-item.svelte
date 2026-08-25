<script lang="ts">
	import AppIcon from '$lib/client/ui/components/app-icon.svelte';
	import { cn, type WithoutChild } from '$lib/client/utils/index.js';
	import { Select as SelectPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		value,
		label,
		children: childrenProp,
		...restProps
	}: WithoutChild<SelectPrimitive.ItemProps> = $props();
</script>

<SelectPrimitive.Item
	bind:ref
	{value}
	{label}
	data-slot="select-item"
	class={cn(
		'relative flex w-full cursor-default select-none items-center rounded-md py-2 pl-2.5 pr-8 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		className
	)}
	{...restProps}
>
	{#snippet children({ selected, highlighted })}
		<span class="min-w-0 flex-1 truncate">
			{#if childrenProp}
				{@render childrenProp({ selected, highlighted })}
			{:else}
				{label || value}
			{/if}
		</span>
		{#if selected}
			<AppIcon name="check" class="absolute right-2.5 size-4" aria-hidden="true" />
		{/if}
	{/snippet}
</SelectPrimitive.Item>
