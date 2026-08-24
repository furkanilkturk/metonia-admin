<script lang="ts">
	import * as Card from '$lib/client/ui/components/card/index.js';
	import { userRoleLabels, userStatusLabels } from '$lib/shared/constants/users.js';
	import type { User } from '$lib/shared/types/users.js';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	function dateTime(value: Date): string {
		return new Intl.DateTimeFormat('en', { dateStyle: 'long', timeStyle: 'short' }).format(value);
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Directory record</Card.Title>
		<Card.Description>Identity and access metadata stored for this user.</Card.Description>
	</Card.Header>
	<Card.Content>
		<dl class="grid gap-x-8 gap-y-5 sm:grid-cols-2">
			<div><dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</dt><dd class="mt-1 font-medium">{user.name}</dd></div>
			<div><dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt><dd class="mt-1">{user.email}</dd></div>
			<div><dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</dt><dd class="mt-1"><span class="inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium">{userStatusLabels[user.status]}</span></dd></div>
			<div><dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</dt><dd class="mt-1">{userRoleLabels[user.role]}</dd></div>
			<div><dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</dt><dd class="mt-1">{dateTime(user.createdAt)}</dd></div>
			<div><dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last updated</dt><dd class="mt-1">{dateTime(user.updatedAt)}</dd></div>
		</dl>
	</Card.Content>
</Card.Root>
