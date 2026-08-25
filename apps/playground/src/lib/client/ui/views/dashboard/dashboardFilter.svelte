<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import AppIcon from '$lib/client/ui/components/app-icon.svelte';
	import { Input } from '$lib/client/ui/components/input/index.js';
	import * as Select from '$lib/client/ui/components/select/index.js';
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

	const statuses = [
		{ label: 'All statuses', value: 'all' },
		{ label: 'Healthy', value: 'healthy' },
		{ label: 'Needs attention', value: 'attention' },
		{ label: 'Scheduled', value: 'scheduled' }
	] as const;
	const windows = [
		{ label: 'Last 24 hours', value: '24h' },
		{ label: 'Last 7 days', value: '7d' },
		{ label: 'Last 30 days', value: '30d' }
	] as const;
	let statusLabel = $derived(statuses.find((option) => option.value === status)?.label ?? 'Status');
	let windowLabel = $derived(windows.find((option) => option.value === window)?.label ?? 'Window');
</script>

<div class="border-b border-border px-4 py-4 sm:px-5">
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
				<AppIcon
					name="refresh"
					class={isLoading ? 'size-4 animate-spin' : 'size-4'}
					aria-hidden="true"
				/>
			</Button>
		</div>
	</div>

	<div class="mt-4 grid gap-2.5 lg:grid-cols-[minmax(15rem,1fr)_11rem_10rem_auto]">
		<label class="relative block" for="operation-search">
			<span class="sr-only">Search operations</span>
			<AppIcon name="search" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
			<Input
				id="operation-search"
				class="h-11 bg-background pl-9 sm:h-10"
				value={query}
				oninput={handleQuery}
				placeholder="Search name, owner, or ID"
			/>
		</label>

		<Select.Root
			type="single"
			value={status}
			onValueChange={(value) => onStatusChange(value as DashboardStatusFilter)}
		>
			<Select.Trigger aria-label="Filter by status" class="h-11 sm:h-10">{statusLabel}</Select.Trigger>
			<Select.Content>
				{#each statuses as option (option.value)}
					<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<Select.Root
			type="single"
			value={window}
			onValueChange={(value) => onWindowChange(value as DashboardWindow)}
		>
			<Select.Trigger aria-label="Filter by time window" class="h-11 sm:h-10">{windowLabel}</Select.Trigger>
			<Select.Content>
				{#each windows as option (option.value)}
					<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		{#if activeFilterCount > 0}
			<Button variant="ghost" onclick={onClear} class="h-11 justify-start gap-2 px-3 lg:justify-center sm:h-10">
				<AppIcon name="x" class="size-4" aria-hidden="true" />
				Reset
			</Button>
		{/if}
	</div>
</div>
