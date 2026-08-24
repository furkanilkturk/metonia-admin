<script lang="ts">
	import { cn, type WithElementRef } from "$lib/client/utils/index.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	{@attach (element) => {
		ref = element;
		return () => {
			if (ref === element) ref = null;
		};
	}}
	data-slot="card-action"
	class={cn(
		"cn-card-action col-start-2 row-span-2 row-start-1 self-start justify-self-end",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
