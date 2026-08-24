<script lang="ts">
	import type { User, UserFormActionData } from '$lib/shared/types/users.js';

	import UserForm from '../../views/users/UserForm.svelte';

	interface Props {
		user: User;
		form?: UserFormActionData | null;
	}

	let { user, form = null }: Props = $props();
</script>

<svelte:head>
	<title>Edit {user.name} · Metonia Admin</title>
</svelte:head>

<section class="mx-auto max-w-3xl space-y-6" aria-labelledby="edit-user-heading">
	<header class="space-y-2 border-b border-border pb-5">
		<a class="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/users/{user.id}">
			← {user.name}
		</a>
		<h1 id="edit-user-heading" class="font-heading text-3xl font-semibold tracking-tight">Edit user</h1>
		<p class="text-sm text-muted-foreground">Update the directory record and save the changes.</p>
	</header>
	<UserForm action="?/update" submitLabel="Save changes" {user} {form} />
</section>
