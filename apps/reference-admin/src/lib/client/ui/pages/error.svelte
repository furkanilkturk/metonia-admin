<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import AppIcon from '$lib/client/ui/components/app-icon.svelte';

	interface Props {
		message?: string;
		status: number;
	}

	let { message, status }: Props = $props();
	let isNotFound = $derived(status === 404);
	let title = $derived(isNotFound ? 'This page is off the map.' : 'The workspace hit a snag.');
	let description = $derived(
		isNotFound
			? 'The address may have changed, or the page may no longer exist. Return to the dashboard to keep working.'
			: 'Your data is safe. Return to the dashboard and try the action again.'
	);
</script>

<svelte:head>
	<title>{status} · Metonia Admin</title>
	<meta name="description" content={description} />
</svelte:head>

<main class="relative grid min-h-dvh place-items-center overflow-hidden bg-background p-5 sm:p-8">
	<div class="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
		<div class="absolute left-[12%] top-[18%] size-32 rounded-full border border-brand/15 sm:size-48"></div>
		<div class="absolute bottom-[12%] right-[10%] size-48 rounded-full border border-foreground/10 sm:size-72"></div>
		<div class="absolute bottom-[22%] right-[22%] size-16 rounded-full bg-brand/8 sm:size-24"></div>
	</div>

	<section class="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10" aria-labelledby="error-heading">
		<div class="grid sm:grid-cols-[10rem_minmax(0,1fr)]">
			<div class="grid content-between gap-10 bg-foreground p-6 text-background sm:p-7">
				<span class="grid size-10 place-items-center rounded-xl bg-background/10" aria-hidden="true">
					{#if isNotFound}
						<AppIcon name="arrow-left" class="size-5" />
					{:else}
						<AppIcon name="triangle-alert" class="size-5" />
					{/if}
				</span>
				<p class="font-mono text-5xl font-semibold tracking-[-0.08em] sm:text-6xl">{status}</p>
			</div>

			<div class="p-6 sm:p-9">
				<p class="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand">
					{isNotFound ? 'Page not found' : 'Unexpected error'}
				</p>
				<h1 id="error-heading" class="mt-3 text-balance font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
					{title}
				</h1>
				<p class="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
				{#if !isNotFound && message && message !== 'Internal Error'}
					<p class="mt-3 rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">{message}</p>
				{/if}
				<div class="mt-7 flex flex-wrap gap-3">
					<Button href="/dashboard" class="h-11 gap-2 sm:h-10">
						<AppIcon name="dashboard" class="size-4" aria-hidden="true" />
						Back to dashboard
					</Button>
					<Button href="/settings" variant="outline" class="h-11 sm:h-10">Workspace settings</Button>
				</div>
			</div>
		</div>
	</section>
</main>
