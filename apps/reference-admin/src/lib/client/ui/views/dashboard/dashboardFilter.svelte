<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import { Input } from '$lib/client/ui/components/input/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import XIcon from '@lucide/svelte/icons/x';
	import type {
		DashboardStatusFilter,
		DashboardWindow
	} from '$lib/shared/types/dashboard.js';

	interface Props {
		activeFilterCount: number;
		isLoading: boolean;
		lastUpdated: string;
		onClear: () => void;
		onQueryChange: (query: string) => void;
		onRefresh: () => Promise<void> | void;
		onStatusChange: (status: DashboardStatusFilter) => void;
		onWindowChange: (window: DashboardWindow) => void;
		query: string;
		status: DashboardStatusFilter;
		visibleCount: number;
		window: DashboardWindow;
	}

	let {
		activeFilterCount,
		isLoading,
		lastUpdated,
		onClear,
		onQueryChange,
		onRefresh,
		onStatusChange,
		onWindowChange,
		query,
		status,
		visibleCount,
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

<div class="border-b border-border px-4 py-5 sm:px-6">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<div class="flex flex-wrap items-center gap-2.5">
				<h2 id="operations-heading" class="font-heading text-lg font-semibold tracking-tight">Operations</h2>
				<span class="rounded-full bg-brand/10 px-2.5 py-1 font-mono text-[0.6875rem] font-semibold text-brand">
					{visibleCount} visible
				</span>
			</div>
			<p class="mt-1 text-sm text-muted-foreground">Monitor ownership, status, and the next handoff.</p>
		</div>

		<div class="flex items-center gap-2">
			<span class="hidden text-xs text-muted-foreground sm:inline" aria-live="polite">
				{isLoading ? 'Refreshing operations' : lastUpdated}
			</span>
			<Button
				variant="outline"
				size="icon-lg"
				class="size-11 sm:size-9"
				onclick={onRefresh}
				disabled={isLoading}
				aria-label={isLoading ? 'Refreshing operations' : 'Refresh operations'}
			>
				<RefreshCwIcon class={['size-4', isLoading && 'animate-spin']} aria-hidden="true" />
			</Button>
		</div>
	</div>

	<div class="mt-5 grid gap-3 lg:grid-cols-[minmax(15rem,1fr)_11rem_10rem_auto]">
		<label class="relative block" for="operation-search">
			<span class="sr-only">Search operations</span>
			<SearchIcon class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
			<Input
				id="operation-search"
				class="h-11 bg-background pl-9 sm:h-10"
				value={query}
				oninput={handleQuery}
				placeholder="Search name, owner, or ID"
			/>
		</label>

		<label for="operation-status">
			<span class="sr-only">Filter by status</span>
			<select
				id="operation-status"
				class="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-10"
				value={status}
				onchange={handleStatus}
			>
				<option value="all">All statuses</option>
				<option value="healthy">Healthy</option>
				<option value="attention">Needs attention</option>
				<option value="scheduled">Scheduled</option>
			</select>
		</label>

		<label for="operation-window">
			<span class="sr-only">Filter by time window</span>
			<select
				id="operation-window"
				class="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-10"
				value={window}
				onchange={handleWindow}
			>
				<option value="24h">Last 24 hours</option>
				<option value="7d">Last 7 days</option>
				<option value="30d">Last 30 days</option>
			</select>
		</label>

		{#if activeFilterCount > 0}
			<Button variant="ghost" onclick={onClear} class="h-11 justify-start gap-2 px-3 lg:justify-center sm:h-10">
				<XIcon class="size-4" aria-hidden="true" />
				Reset
			</Button>
		{/if}
	</div>
</div>
