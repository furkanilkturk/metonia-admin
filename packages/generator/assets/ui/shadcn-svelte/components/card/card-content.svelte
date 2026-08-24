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
	data-slot="card-content"
	class={cn("px-(--card-spacing)", className)}
	{...restProps}
>
	{@render children?.()}
</div>
