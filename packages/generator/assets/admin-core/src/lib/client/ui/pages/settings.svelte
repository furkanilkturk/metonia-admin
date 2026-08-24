<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import SettingsSummary from '$lib/client/ui/views/settings/settingsSummary.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';

	const settings = [
		{
			detail: 'Native load functions and form actions remain the application boundary.',
			label: 'Data pattern',
			value: 'Standard SvelteKit'
		},
		{
			detail: 'Nova components are checked into the generated project for direct ownership.',
			label: 'UI adapter',
			value: 'shadcn-svelte · zinc'
		},
		{
			detail: 'The generated application does not require a Metonia runtime package.',
			label: 'Runtime',
			value: 'SvelteKit'
		},
		{
			detail: 'Add your own identity provider and enforce authorization at server boundaries.',
			label: 'Authentication',
			value: 'Not configured'
		}
	] as const;
</script>

<svelte:head>
	<title>Settings · Metonia Admin</title>
	<meta name="description" content="Review the generated Metonia Admin starter configuration." />
</svelte:head>

<div class="mx-auto grid w-full max-w-5xl gap-6 lg:gap-8">
	<header class="grid gap-4 border-b border-border pb-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
		<div>
			<p class="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary">
				Project settings
			</p>
			<h1 class="mt-2 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
				Know what the starter includes
			</h1>
			<p class="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
				Use this thin page as a place to expose real project preferences once you add their
				server boundaries.
			</p>
		</div>
		<Button href="/dashboard" variant="outline" class="h-11 w-fit gap-2 sm:h-9">
			<ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
			Back to dashboard
		</Button>
	</header>

	<SettingsSummary {settings} />
</div>
