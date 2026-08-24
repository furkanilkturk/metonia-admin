<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import { Input } from '$lib/client/ui/components/input/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import type {
		DashboardStatusFilter,
		DashboardWindow
	} from '$lib/shared/types/dashboard.js';

	interface Props {
		activeFilterCount: number;
		onClear: () => void;
		onQueryChange: (query: string) => void;
		onStatusChange: (status: DashboardStatusFilter) => void;
		onWindowChange: (window: DashboardWindow) => void;
		query: string;
		status: DashboardStatusFilter;
		window: DashboardWindow;
	}

	let {
		activeFilterCount,
		onClear,
		onQueryChange,
		onStatusChange,
		onWindowChange,
		query,
		status,
		window
	}: Props = $props();

	function handleQuery(event: Event): void {
		onQueryChange((event.currentTarget as HTMLInputElement).value);
	}

	function handleStatus(event: Event): void {
		onStatusChange((event.currentTarget as HTMLSelectElement).value as DashboardStatusFilter);
	}

	function handleWindow(event: Event): void {
		onWindowChange((event.currentTarget as HTMLSelectElement).value as DashboardWindow);
	}
</script>

<section class="rounded-xl border border-border bg-card p-4" aria-labelledby="dashboard-filter-heading">
	<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 id="dashboard-filter-heading" class="flex items-center gap-2 text-base font-semibold">
				<SlidersHorizontalIcon class="size-4 text-primary" aria-hidden="true" />
				Operation filters
			</h2>
			<p class="mt-1 text-sm text-muted-foreground">Narrow the starter data without leaving the page.</p>
		</div>
		<Button variant="ghost" onclick={onClear} disabled={activeFilterCount === 0} class="min-h-11 sm:min-h-8">
			Clear filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
		</Button>
	</div>

	<div class="grid gap-4 md:grid-cols-[minmax(14rem,1fr)_minmax(10rem,0.45fr)_minmax(9rem,0.35fr)]">
		<label class="grid gap-1.5 text-sm font-medium" for="operation-search">
			Search operations
			<span class="relative">
				<SearchIcon class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
				<Input
					id="operation-search"
					class="h-11 pl-9 sm:h-9"
					value={query}
					oninput={handleQuery}
					placeholder="Name or owner"
				/>
			</span>
		</label>

		<label class="grid gap-1.5 text-sm font-medium" for="operation-status">
			Status
			<select
				id="operation-status"
				class="h-11 rounded-lg border border-input bg-background px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-9"
				value={status}
				onchange={handleStatus}
			>
				<option value="all">All statuses</option>
				<option value="healthy">Healthy</option>
				<option value="attention">Needs attention</option>
				<option value="scheduled">Scheduled</option>
			</select>
		</label>

		<label class="grid gap-1.5 text-sm font-medium" for="operation-window">
			Time window
			<select
				id="operation-window"
				class="h-11 rounded-lg border border-input bg-background px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-9"
				value={window}
				onchange={handleWindow}
			>
				<option value="24h">Last 24 hours</option>
				<option value="7d">Last 7 days</option>
				<option value="30d">Last 30 days</option>
			</select>
		</label>
	</div>
</section>
