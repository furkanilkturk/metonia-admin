<script lang="ts">
	import { Button, buttonVariants } from '$lib/client/ui/components/button/index.js';
	import * as Dialog from '$lib/client/ui/components/dialog/index.js';
	import { Input } from '$lib/client/ui/components/input/index.js';
	import type { User } from '$lib/shared/types/users.js';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();
	let disableConfirmation = $state('');
	let deleteConfirmation = $state('');
</script>

<section class="rounded-xl border border-destructive/40 bg-card p-5" aria-labelledby="danger-zone-heading">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="max-w-2xl space-y-1">
			<h2 id="danger-zone-heading" class="font-heading text-lg font-semibold text-destructive">Danger zone</h2>
			<p class="text-sm text-muted-foreground">Disabling preserves the record. Deleting permanently removes it. Authentication and authorization must be added before production use.</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<Dialog.Root>
				<Dialog.Trigger class={buttonVariants({ variant: 'outline', class: 'min-h-11' })} disabled={user.status === 'disabled'}>
					{user.status === 'disabled' ? 'Already disabled' : 'Disable user'}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Disable {user.name}?</Dialog.Title>
						<Dialog.Description>This blocks the record without deleting its history. Type the email address to continue.</Dialog.Description>
					</Dialog.Header>
					<form method="POST" action="?/disable" class="space-y-4">
						<div class="space-y-1.5">
							<label class="text-sm font-medium" for="disable-confirmation">Type {user.email}</label>
							<Input id="disable-confirmation" name="confirmation" bind:value={disableConfirmation} autocomplete="off" class="min-h-11" />
						</div>
						<Dialog.Footer>
							<Dialog.Close class={buttonVariants({ variant: 'ghost', class: 'min-h-11' })}>Cancel</Dialog.Close>
							<Button type="submit" variant="destructive" class="min-h-11" disabled={disableConfirmation !== user.email}>Disable user</Button>
						</Dialog.Footer>
					</form>
				</Dialog.Content>
			</Dialog.Root>

			<Dialog.Root>
				<Dialog.Trigger class={buttonVariants({ variant: 'destructive', class: 'min-h-11' })}>Delete user</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Delete {user.name} permanently?</Dialog.Title>
						<Dialog.Description>This cannot be undone. Type the email address to confirm deletion.</Dialog.Description>
					</Dialog.Header>
					<form method="POST" action="?/delete" class="space-y-4">
						<div class="space-y-1.5">
							<label class="text-sm font-medium" for="delete-confirmation">Type {user.email}</label>
							<Input id="delete-confirmation" name="confirmation" bind:value={deleteConfirmation} autocomplete="off" class="min-h-11" />
						</div>
						<Dialog.Footer>
							<Dialog.Close class={buttonVariants({ variant: 'ghost', class: 'min-h-11' })}>Cancel</Dialog.Close>
							<Button type="submit" variant="destructive" class="min-h-11" disabled={deleteConfirmation !== user.email}>Delete user</Button>
						</Dialog.Footer>
					</form>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</div>
</section>
