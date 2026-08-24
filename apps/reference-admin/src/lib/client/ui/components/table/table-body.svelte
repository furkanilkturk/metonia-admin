<script lang="ts">
	import { cn, type WithElementRef } from "$lib/client/utils/index.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableSectionElement>> = $props();
</script>

<tbody
	{@attach (element) => {
		ref = element;
		return () => {
			if (ref === element) ref = null;
		};
	}}
	data-slot="table-body"
	class={cn("[&_tr:last-child]:border-0", className)}
	{...restProps}
>
	{@render children?.()}
</tbody>
