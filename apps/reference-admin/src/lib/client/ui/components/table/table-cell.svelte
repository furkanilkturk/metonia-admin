<script lang="ts">
	import { cn, type WithElementRef } from "$lib/client/utils/index.js";
	import type { HTMLTdAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLTdAttributes> = $props();
</script>

<td
	{@attach (element) => {
		ref = element;
		return () => {
			if (ref === element) ref = null;
		};
	}}
	data-slot="table-cell"
	class={cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className)}
	{...restProps}
>
	{@render children?.()}
</td>
