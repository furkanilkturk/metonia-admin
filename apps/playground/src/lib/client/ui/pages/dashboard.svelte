<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import AppIcon from '$lib/client/ui/components/app-icon.svelte';
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

	const operations: readonly DashboardOperation[] = [
		{
			detail: 'Production release · web application',
			id: 'OPS-1048',
			name: 'Preview deployment',
			owner: 'Platform',
			ownerInitials: 'PL',
			status: 'healthy',
			updatedAt: '8 min ago',
			updatedWithin: '24h'
		},
		{
			detail: 'Revenue operations · 14 invoices',
			id: 'OPS-1047',
			name: 'Billing reconciliation',
			owner: 'Finance',
			ownerInitials: 'FI',
			status: 'attention',
			updatedAt: '42 min ago',
			updatedWithin: '24h'
		},
		{
			detail: 'Customer records · scheduled run',
			id: 'OPS-1046',
			name: 'Weekly data export',
			owner: 'Data',
			ownerInitials: 'DA',
			status: 'scheduled',
			updatedAt: 'Yesterday',
			updatedWithin: '7d'
		},
		{
			detail: 'Compliance · search index',
			id: 'OPS-1042',
			name: 'Audit index refresh',
			owner: 'Platform',
			ownerInitials: 'PL',
			status: 'healthy',
			updatedAt: '4 days ago',
			updatedWithin: '7d'
		},
		{
			detail: 'Lifecycle · inactive accounts',
			id: 'OPS-1031',
			name: 'Retention review',
			owner: 'Success',
			ownerInitials: 'CS',
			status: 'healthy',
			updatedAt: '18 days ago',
			updatedWithin: '30d'
		}
	];

	const metrics: readonly DashboardMetric[] = [
		{
			detail: 'Two completed since yesterday',
			label: 'Active workflows',
			tone: 'brand',
			value: '24'
		},
		{
			detail: 'Up 4.8% this week',
			label: 'Completion rate',
			tone: 'success',
			value: '92%'
		},
		{
			detail: 'One item is time-sensitive',
			label: 'Needs review',
			tone: 'warning',
			value: '3'
		}
	];

	const activities: readonly Activity[] = [
		{
			detail: 'The preview is ready for the final release review.',
			id: 'build-complete',
			time: '08:42',
			title: 'Deployment completed'
		},
		{
			detail: 'Fourteen invoices need an owner before the next sync.',
			id: 'review-requested',
			time: '08:18',
			title: 'Review requested'
		},
		{
			detail: 'The customer export will run tomorrow at 09:00.',
			id: 'export-planned',
			time: 'Yesterday',
			title: 'Export scheduled'
		}
	];

	const state = new DashboardState(operations);
	const controller = new DashboardController(state);
</script>

<svelte:head>
	<title>Operations · Metonia Admin</title>
	<meta
		name="description"
		content="Monitor active work, review exceptions, and keep operations moving."
	/>
</svelte:head>

<div class="mx-auto grid w-full max-w-[86rem] gap-5 lg:gap-6">
	<header class="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
		<div class="min-w-0">
			<div class="mb-2 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-success">
				<AppIcon name="circle-check" class="size-4" aria-hidden="true" />
				<span>Workspace is healthy</span>
			</div>
			<h1 class="max-w-3xl text-balance font-heading text-3xl font-semibold tracking-[-0.035em] sm:text-[2.35rem] sm:leading-tight">
				Keep today’s work moving.
			</h1>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
				Monitor active workflows, resolve exceptions, and hand off the next action without losing context.
			</p>
		</div>
		<Button href="/settings" class="h-11 w-fit gap-2 px-4 sm:h-10">
			Configure workspace
			<AppIcon name="arrow-up-right" data-icon="inline-end" aria-hidden="true" />
		</Button>
	</header>

	<DashboardMetrics {metrics} />

	<div class="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
		<section class="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm" aria-labelledby="operations-heading">
			<DashboardFilter
				activeFilterCount={state.activeFilterCount}
				isLoading={state.isLoading}
				lastUpdated={state.lastUpdated}
				onClear={() => controller.clearFilters()}
				onQueryChange={(query) => controller.setQuery(query)}
				onRefresh={() => controller.refresh()}
				onStatusChange={(status) => controller.setStatus(status)}
				onWindowChange={(window) => controller.setWindow(window)}
				query={state.query}
				status={state.status}
				visibleCount={state.filteredOperations.length}
				window={state.window}
			/>
			<DashboardTable
				isLoading={state.isLoading}
				onClear={() => controller.clearFilters()}
				operations={state.filteredOperations}
			/>
		</section>
		<DashboardActivity {activities} />
	</div>
</div>
