<script lang="ts">
	import * as Table from '$lib/client/ui/components/table/index.js';
	import { userRoleLabels, userStatusLabels } from '$lib/shared/constants/users.js';
	import type { User, UserListQuery } from '$lib/shared/types/users.js';

	interface Props {
		users: readonly User[];
		query: UserListQuery;
		sortHref: (sort: UserListQuery['sort']) => string;
	}

	let { users, query, sortHref }: Props = $props();

	function sortLabel(field: UserListQuery['sort'], label: string): string {
		if (query.sort !== field) return `Sort by ${label}`;
		return `Sort by ${label}, currently ${query.direction === 'asc' ? 'ascending' : 'descending'}`;
	}

	function dateLabel(value: Date): string {
		return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(value);
	}
</script>

<section class="overflow-hidden rounded-xl border border-border bg-card" aria-labelledby="users-table-heading">
	<div class="border-b border-border px-4 py-3">
		<h2 id="users-table-heading" class="font-heading text-lg font-semibold">Directory records</h2>
	</div>
	{#if users.length === 0}
		<div class="grid min-h-56 place-items-center p-6 text-center">
			<div class="max-w-md space-y-2">
				<h3 class="font-heading text-lg font-semibold">No users match these filters</h3>
				<p class="text-sm text-muted-foreground">Clear the filters or create the first user record.</p>
				<div class="pt-2">
					<a class="font-medium text-primary underline-offset-4 hover:underline" href="/users/new">Create user</a>
				</div>
			</div>
		</div>
	{:else}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="overflow-x-auto" tabindex="0" role="region" aria-label="Users table, scroll horizontally on narrow screens">
			<Table.Root class="min-w-[48rem]">
				<Table.Caption class="sr-only">Users matching the current search and filters.</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.Head>
							<a class="inline-flex min-h-11 items-center gap-1 font-medium hover:text-primary" href={sortHref('name')} aria-label={sortLabel('name', 'name')}>Name</a>
						</Table.Head>
						<Table.Head>
							<a class="inline-flex min-h-11 items-center font-medium hover:text-primary" href={sortHref('email')} aria-label={sortLabel('email', 'email')}>Email</a>
						</Table.Head>
						<Table.Head>
							<a class="inline-flex min-h-11 items-center font-medium hover:text-primary" href={sortHref('status')} aria-label={sortLabel('status', 'status')}>Status</a>
						</Table.Head>
						<Table.Head>Role</Table.Head>
						<Table.Head>
							<a class="inline-flex min-h-11 items-center font-medium hover:text-primary" href={sortHref('createdAt')} aria-label={sortLabel('createdAt', 'created date')}>Created</a>
						</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each users as user (user.id)}
						<Table.Row>
							<Table.Cell class="font-medium"><a class="hover:text-primary hover:underline" href="/users/{user.id}">{user.name}</a></Table.Cell>
							<Table.Cell>{user.email}</Table.Cell>
							<Table.Cell><span class="inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium">{userStatusLabels[user.status]}</span></Table.Cell>
							<Table.Cell>{userRoleLabels[user.role]}</Table.Cell>
							<Table.Cell>{dateLabel(user.createdAt)}</Table.Cell>
							<Table.Cell class="text-right"><a class="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline" href="/users/{user.id}/edit">Edit <span class="sr-only">{user.name}</span></a></Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</section>
