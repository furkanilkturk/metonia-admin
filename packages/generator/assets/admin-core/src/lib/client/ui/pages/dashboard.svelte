<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import RecipeTrace from '$lib/client/ui/components/recipe-trace/RecipeTrace.svelte';
	import { DashboardController } from '$lib/client/ui/pages/dashboard/dashboardController.js';
	import { DashboardState } from '$lib/client/ui/pages/dashboard/dashboardState.svelte.js';
	import DashboardActivity from '$lib/client/ui/views/dashboard/dashboardActivity.svelte';
	import DashboardFilter from '$lib/client/ui/views/dashboard/dashboardFilter.svelte';
	import DashboardMetrics from '$lib/client/ui/views/dashboard/dashboardMetrics.svelte';
	import DashboardTable from '$lib/client/ui/views/dashboard/dashboardTable.svelte';
	import type {
		DashboardActivity as Activity,
		DashboardMetric,
		DashboardOperation
	} from '$lib/shared/types/dashboard.js';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';

	const operations: readonly DashboardOperation[] = [
		{
			id: 'deploy-preview',
			name: 'Preview deployment',
			owner: 'Platform',
			status: 'healthy',
			updatedAt: '8 min ago'
		},
		{
			id: 'billing-sync',
			name: 'Billing sync',
			owner: 'Operations',
			status: 'attention',
			updatedAt: '42 min ago'
		},
		{
			id: 'weekly-export',
			name: 'Weekly export',
			owner: 'Data',
			status: 'scheduled',
			updatedAt: 'Tomorrow, 09:00'
		},
		{
			id: 'audit-index',
			name: 'Audit index',
			owner: 'Platform',
			status: 'healthy',
			updatedAt: '2 hr ago'
		}
	];

	const metrics: readonly DashboardMetric[] = [
		{ detail: '2 healthy · 1 scheduled', label: 'Ready operations', value: '3 of 4' },
		{ detail: 'Billing sync needs review', label: 'Needs attention', value: '1' },
		{ detail: 'Standard SvelteKit boundaries', label: 'Data mode', value: 'Standard' }
	];

	const activities: readonly Activity[] = [
		{
			detail: 'The starter build completed against the selected Bun toolchain.',
			id: 'build-complete',
			time: '08:42',
			title: 'Build check completed'
		},
		{
			detail: 'A sample operation moved into the review queue.',
			id: 'review-requested',
			time: '08:18',
			title: 'Review requested'
		},
		{
			detail: 'The next static export example is ready to be wired to your service.',
			id: 'export-planned',
			time: 'Yesterday',
			title: 'Export scheduled'
		}
	];

	const trace = [
		{ label: 'Route', value: '(admin)/dashboard' },
		{ label: 'Page', value: 'dashboard.svelte' },
		{ label: 'Views', value: 'metrics · filters · table · activity' },
		{ label: 'Components', value: 'shadcn-svelte primitives' }
	] as const;

	const state = new DashboardState(operations);
	const controller = new DashboardController(state);
</script>

<svelte:head>
	<title>Dashboard · Metonia Admin</title>
	<meta
		name="description"
		content="A responsive SvelteKit admin dashboard generated with Metonia Admin."
	/>
</svelte:head>

<div class="mx-auto grid w-full max-w-7xl gap-6 lg:gap-8">
	<header class="grid gap-4 border-b border-border pb-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
		<div class="min-w-0">
			<p class="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary">
				Starter workbench
			</p>
			<h1 class="mt-2 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
				Operations dashboard
			</h1>
			<p class="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
				A real composition seam for your data, actions, and domain language—not a claim that
				production services or authentication are already connected.
			</p>
		</div>
		<Button href="/settings" variant="outline" class="h-11 w-fit gap-2 sm:h-9">
			Review configuration
			<ArrowUpRightIcon data-icon="inline-end" aria-hidden="true" />
		</Button>
	</header>

	<RecipeTrace label="Dashboard recipe signature" steps={trace} />

	<DashboardMetrics {metrics} />

	<DashboardFilter
		activeFilterCount={state.activeFilterCount}
		onClear={() => controller.clearFilters()}
		onQueryChange={(query) => controller.setQuery(query)}
		onStatusChange={(status) => controller.setStatus(status)}
		onWindowChange={(window) => controller.setWindow(window)}
		query={state.query}
		status={state.status}
		window={state.window}
	/>

	<div class="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
		<DashboardTable operations={state.filteredOperations} />
		<DashboardActivity {activities} />
	</div>
</div>
