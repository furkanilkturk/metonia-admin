<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import { Input } from '$lib/client/ui/components/input/index.js';
	import { userStatusLabels } from '$lib/shared/constants/users.js';
	import type { UserListQuery } from '$lib/shared/types/users.js';

	interface Props {
		query: UserListQuery;
	}

	let { query }: Props = $props();
</script>

<form action="/users" method="GET" class="grid gap-4 rounded-xl border border-border bg-card p-4 lg:grid-cols-[minmax(14rem,1fr)_repeat(3,minmax(9rem,0.45fr))_auto] lg:items-end">
	<div class="space-y-1.5">
		<label class="text-sm font-medium" for="user-search">Search users</label>
		<Input id="user-search" name="q" type="search" value={query.q} placeholder="Name or email" class="min-h-11" />
	</div>
	<div class="space-y-1.5">
		<label class="text-sm font-medium" for="user-status">Status</label>
		<select id="user-status" name="status" class="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:ring-3 focus-visible:ring-ring/50">
			<option value="all" selected={query.status === 'all'}>All statuses</option>
			{#each Object.entries(userStatusLabels) as [value, label] (value)}
				<option {value} selected={query.status === value}>{label}</option>
			{/each}
		</select>
	</div>
	<div class="space-y-1.5">
		<label class="text-sm font-medium" for="user-sort">Sort by</label>
		<select id="user-sort" name="sort" class="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:ring-3 focus-visible:ring-ring/50">
			<option value="createdAt" selected={query.sort === 'createdAt'}>Created</option>
			<option value="name" selected={query.sort === 'name'}>Name</option>
			<option value="email" selected={query.sort === 'email'}>Email</option>
			<option value="status" selected={query.sort === 'status'}>Status</option>
		</select>
	</div>
	<div class="space-y-1.5">
		<label class="text-sm font-medium" for="user-direction">Direction</label>
		<select id="user-direction" name="direction" class="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:ring-3 focus-visible:ring-ring/50">
			<option value="asc" selected={query.direction === 'asc'}>Ascending</option>
			<option value="desc" selected={query.direction === 'desc'}>Descending</option>
		</select>
	</div>
	<input type="hidden" name="pageSize" value={query.pageSize} />
	<div class="flex gap-2">
		<Button type="submit" class="min-h-11">Apply filters</Button>
		<Button href="/users" variant="ghost" class="min-h-11">Clear</Button>
	</div>
</form>
