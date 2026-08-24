<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';

	interface Props {
		page: number;
		pageCount: number;
		total: number;
		pageHref: (page: number) => string;
	}

	let { page, pageCount, total, pageHref }: Props = $props();
</script>

<nav class="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between" aria-label="Users pages">
	<p class="text-muted-foreground">{total} {total === 1 ? 'user' : 'users'} · Page {page} of {pageCount}</p>
	<div class="flex gap-2">
		<Button href={pageHref(page - 1)} variant="outline" class="min-h-11" disabled={page <= 1}>Previous</Button>
		<Button href={pageHref(page + 1)} variant="outline" class="min-h-11" disabled={page >= pageCount}>Next</Button>
	</div>
</nav>
