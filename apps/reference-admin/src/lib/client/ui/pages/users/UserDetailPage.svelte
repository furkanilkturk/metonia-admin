<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import type { User, UserDangerActionData } from '$lib/shared/types/users.js';

	import UserDangerZone from '../../views/users/UserDangerZone.svelte';
	import UserDetails from '../../views/users/UserDetails.svelte';

	interface Props {
		user: User;
		form?: UserDangerActionData | null;
	}

	let { user, form = null }: Props = $props();
</script>

<svelte:head>
	<title>{user.name} · Metonia Admin</title>
</svelte:head>

<section class="space-y-6" aria-labelledby="user-heading">
	<header class="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
		<div class="space-y-2">
			<a class="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/users">← Users</a>
			<h1 id="user-heading" class="font-heading text-3xl font-semibold tracking-tight">{user.name}</h1>
			<p class="font-mono text-xs text-muted-foreground">{user.email}</p>
		</div>
		<Button href="/users/{user.id}/edit" variant="outline" class="min-h-11">Edit user</Button>
	</header>

	{#if form?.message}
		<div class="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
			{form.message}
		</div>
	{/if}

	<UserDetails {user} />
	<UserDangerZone {user} />
</section>
