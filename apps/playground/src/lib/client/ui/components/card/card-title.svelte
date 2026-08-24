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
	data-slot="card-title"
	class={cn("text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", className)}
	{...restProps}
>
	{@render children?.()}
</div>
