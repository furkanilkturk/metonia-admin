<script lang="ts">
	import AppIcon from '$lib/client/ui/components/app-icon.svelte';
	import { cn, type WithoutChild } from '$lib/client/utils/index.js';
	import { Select as SelectPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	class={cn(
		'h-10 w-full gap-2 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-colors hover:bg-accent/55 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 data-placeholder:text-muted-foreground dark:bg-input/20 dark:hover:bg-input/35 flex items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...restProps}
>
	<span class="min-w-0 truncate">{@render children?.()}</span>
	<AppIcon name="chevron-down" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
</SelectPrimitive.Trigger>
