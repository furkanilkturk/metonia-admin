<script lang="ts">
	import type { UserFormActionData } from '$lib/shared/types/users.js';

	import UserForm from '../../views/users/UserForm.svelte';

	interface Props {
		form?: UserFormActionData | null;
	}

	let { form = null }: Props = $props();
</script>

<svelte:head>
	<title>Create user · Metonia Admin</title>
</svelte:head>

<section class="mx-auto max-w-3xl space-y-6" aria-labelledby="create-user-heading">
	<header class="space-y-2 border-b border-border pb-5">
		<a class="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/users">← Users</a>
		<h1 id="create-user-heading" class="font-heading text-3xl font-semibold tracking-tight">Create user</h1>
		<p class="text-sm text-muted-foreground">Add a directory record. Access enforcement is deferred.</p>
	</header>
	<UserForm action="?/create" submitLabel="Create user" {form} />
</section>
