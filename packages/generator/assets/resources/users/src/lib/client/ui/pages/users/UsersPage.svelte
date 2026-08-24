<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import type { UserListResult, UserListQuery } from '$lib/shared/types/users.js';

	import UserFilters from '../../views/users/UserFilters.svelte';
	import UsersPagination from '../../views/users/UsersPagination.svelte';
	import UsersTable from '../../views/users/UsersTable.svelte';
	import { UsersController } from './usersController.js';

	interface Props {
		result: UserListResult;
	}

	let { result }: Props = $props();
	let controller = $derived(new UsersController(result.query));

	function sortHref(sort: UserListQuery['sort']): string {
		return controller.sortHref(sort);
	}

	function pageHref(page: number): string {
		return controller.pageHref(page);
	}
</script>

<svelte:head>
	<title>Users · Metonia Admin</title>
</svelte:head>

<section class="space-y-6" aria-labelledby="users-heading">
	<header class="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
		<div class="space-y-1">
			<p class="font-mono text-xs font-medium uppercase tracking-[0.14em] text-primary">Directory / users</p>
			<h1 id="users-heading" class="font-heading text-3xl font-semibold tracking-tight">Users</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage access records. Authentication and authorization are not included in this starter.
			</p>
		</div>
		<Button href="/users/new" class="min-h-11 bg-signal text-signal-foreground hover:bg-signal/90">
			Create user
		</Button>
	</header>

	<UserFilters query={result.query} />
	<UsersTable users={result.items} query={result.query} {sortHref} />
	<UsersPagination
		page={result.page}
		pageCount={result.pageCount}
		total={result.total}
		{pageHref}
	/>
</section>
