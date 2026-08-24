<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Button } from '$lib/client/ui/components/button/index.js';
	import * as Card from '$lib/client/ui/components/card/index.js';
	import { Input } from '$lib/client/ui/components/input/index.js';
	import {
		editableUserStatuses,
		userRoleLabels,
		userStatusLabels
	} from '$lib/shared/constants/users.js';
	import type { User, UserFormActionData, UserFormField } from '$lib/shared/types/users.js';
	import type { Attachment } from 'svelte/attachments';

	interface Props {
		action: string;
		submitLabel: string;
		user?: User;
		form?: UserFormActionData | null;
	}

	let { action, submitLabel, user, form = null }: Props = $props();
	let pending = $state(false);
	let errorSummary: HTMLDivElement | undefined;
	let values = $derived({
		name: form?.values.name ?? user?.name ?? '',
		email: form?.values.email ?? user?.email ?? '',
		status: form?.values.status ?? user?.status ?? 'invited',
		role: form?.values.role ?? user?.role ?? 'viewer'
	});
	let fieldErrors = $derived(form?.fieldErrors ?? {});
	let errorEntries = $derived(Object.entries(fieldErrors) as [UserFormField, string][]);

	const captureErrorSummary: Attachment<HTMLDivElement> = (element) => {
		errorSummary = element;
		return () => {
			if (errorSummary === element) errorSummary = undefined;
		};
	};

	const enhanceUserForm: SubmitFunction = () => {
		pending = true;
		return async ({ result, update }) => {
			await update({ reset: false });
			pending = false;
			if (result.type === 'failure') queueMicrotask(() => errorSummary?.focus());
		};
	};
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>User details</Card.Title>
		<Card.Description>All fields are required. Server validation is authoritative.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" {action} use:enhance={enhanceUserForm} aria-busy={pending} class="space-y-5">
			{#if form?.message || errorEntries.length > 0}
				<div {@attach captureErrorSummary} class="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive" role="alert" tabindex="-1" aria-labelledby="user-form-error-title">
					<h2 id="user-form-error-title" class="font-heading font-semibold">Review the highlighted fields</h2>
					{#if form?.message}<p class="mt-1">{form.message}</p>{/if}
					{#if errorEntries.length > 0}
						<ul class="mt-2 list-disc space-y-1 pl-5">
							{#each errorEntries as [field, message] (field)}
								<li><a class="underline" href="#{field}">{message}</a></li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}

			<div class="grid gap-5 sm:grid-cols-2">
				<div class="space-y-1.5 sm:col-span-2">
					<label class="text-sm font-medium" for="name">Name</label>
					<Input id="name" name="name" value={values.name} autocomplete="name" required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'name-error' : 'name-help'} class="min-h-11" />
					<p id="name-help" class="text-xs text-muted-foreground">Use the name administrators will recognize.</p>
					{#if fieldErrors.name}<p id="name-error" class="text-sm text-destructive">{fieldErrors.name}</p>{/if}
				</div>

				<div class="space-y-1.5 sm:col-span-2">
					<label class="text-sm font-medium" for="email">Email</label>
					<Input id="email" name="email" type="email" value={values.email} autocomplete="email" required aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} class="min-h-11" />
					{#if fieldErrors.email}<p id="email-error" class="text-sm text-destructive">{fieldErrors.email}</p>{/if}
				</div>

				{#if user}
					<div class="space-y-1.5">
						<p class="text-sm font-medium">Status</p>
						<p class="flex min-h-11 items-center rounded-lg border border-border bg-muted px-3 text-sm">
							{userStatusLabels[user.status]}
						</p>
						<p class="text-xs text-muted-foreground">Status is not editable here. Disabling requires confirmation from the user detail page.</p>
					</div>
				{:else}
					<div class="space-y-1.5">
						<label class="text-sm font-medium" for="status">Status</label>
						<select id="status" name="status" required aria-invalid={Boolean(fieldErrors.status)} aria-describedby={fieldErrors.status ? 'status-error' : undefined} class="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:ring-3 focus-visible:ring-ring/50">
							{#each editableUserStatuses as value (value)}
								<option {value} selected={values.status === value}>{userStatusLabels[value]}</option>
							{/each}
						</select>
						{#if fieldErrors.status}<p id="status-error" class="text-sm text-destructive">{fieldErrors.status}</p>{/if}
					</div>
				{/if}

				<div class="space-y-1.5">
					<label class="text-sm font-medium" for="role">Role</label>
					<select id="role" name="role" required aria-invalid={Boolean(fieldErrors.role)} aria-describedby={fieldErrors.role ? 'role-error' : undefined} class="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:ring-3 focus-visible:ring-ring/50">
						{#each Object.entries(userRoleLabels) as [value, label] (value)}
							<option {value} selected={values.role === value}>{label}</option>
						{/each}
					</select>
					{#if fieldErrors.role}<p id="role-error" class="text-sm text-destructive">{fieldErrors.role}</p>{/if}
				</div>
			</div>

			<div class="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
				<Button href={user ? `/users/${user.id}` : '/users'} variant="ghost" class="min-h-11">Cancel</Button>
				<Button type="submit" class="min-h-11" disabled={pending}>{pending ? 'Saving…' : submitLabel}</Button>
			</div>
		</form>
	</Card.Content>
</Card.Root>
