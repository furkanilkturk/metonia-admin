<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import AppIcon from '$lib/client/ui/components/app-icon.svelte';
	import * as DropdownMenu from '$lib/client/ui/components/dropdown-menu/index.js';
	import * as Table from '$lib/client/ui/components/table/index.js';
	import type {
		DashboardOperation,
		DashboardOperationStatus
	} from '$lib/shared/types/dashboard.js';

	interface Props {
		isLoading: boolean;
		onClear: () => void;
		operations: readonly DashboardOperation[];
	}

	let { isLoading, onClear, operations }: Props = $props();

	const statusLabels: Record<DashboardOperationStatus, string> = {
		healthy: 'Healthy',
		attention: 'Needs attention',
		scheduled: 'Scheduled'
	};
	const skeletonRows = ['one', 'two', 'three', 'four'] as const;
</script>

<div aria-busy={isLoading}>
	<p class="sr-only" aria-live="polite">
		{isLoading ? 'Loading operations' : `${operations.length} operations loaded`}
	</p>
	<Table.Root class="min-w-[42rem]">
		<Table.Caption class="sr-only">
			Operations with owners, statuses, update times, and row actions.
		</Table.Caption>
		<Table.Header>
			<Table.Row class="hover:bg-transparent">
				<Table.Head scope="col" class="h-11 pl-6">Operation</Table.Head>
				<Table.Head scope="col">Owner</Table.Head>
				<Table.Head scope="col">Status</Table.Head>
				<Table.Head scope="col">Updated</Table.Head>
				<Table.Head scope="col" class="w-16 pr-4 text-right">
					<span class="sr-only">Actions</span>
				</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if isLoading}
				{#each skeletonRows as row (row)}
					<Table.Row class="hover:bg-transparent">
						<Table.Cell class="py-4 pl-6">
							<div class="grid gap-2">
								<span class="h-3.5 w-36 animate-pulse rounded bg-muted"></span>
								<span class="h-3 w-48 animate-pulse rounded bg-muted/70"></span>
							</div>
						</Table.Cell>
						<Table.Cell><span class="block h-8 w-28 animate-pulse rounded-full bg-muted"></span></Table.Cell>
						<Table.Cell><span class="block h-7 w-24 animate-pulse rounded-full bg-muted"></span></Table.Cell>
						<Table.Cell><span class="block h-3.5 w-16 animate-pulse rounded bg-muted"></span></Table.Cell>
						<Table.Cell></Table.Cell>
					</Table.Row>
				{/each}
			{:else}
				{#each operations as operation (operation.id)}
					<Table.Row>
						<Table.Cell class="py-4 pl-6">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<span class="font-medium">{operation.name}</span>
									<span class="font-mono text-[0.625rem] text-muted-foreground">{operation.id}</span>
								</div>
								<p class="mt-1 text-xs text-muted-foreground">{operation.detail}</p>
							</div>
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2.5">
								<span class="grid size-7 place-items-center rounded-full bg-muted font-mono text-[0.625rem] font-semibold text-muted-foreground" aria-hidden="true">
									{operation.ownerInitials}
								</span>
								<span>{operation.owner}</span>
							</div>
						</Table.Cell>
						<Table.Cell>
							<span
								class={[
									'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
									operation.status === 'healthy' && 'bg-success/10 text-success',
									operation.status === 'attention' && 'bg-warning/12 text-warning',
									operation.status === 'scheduled' && 'bg-brand/10 text-brand'
								]}
							>
								{#if operation.status === 'healthy'}
									<AppIcon name="circle-check" class="size-3.5" aria-hidden="true" />
								{:else if operation.status === 'attention'}
									<AppIcon name="triangle-alert" class="size-3.5" aria-hidden="true" />
								{:else}
									<AppIcon name="clock" class="size-3.5" aria-hidden="true" />
								{/if}
								{statusLabels[operation.status]}
							</span>
						</Table.Cell>
						<Table.Cell class="font-mono text-xs text-muted-foreground">
							{operation.updatedAt}
						</Table.Cell>
						<Table.Cell class="pr-4 text-right">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Button
											{...props}
											variant="ghost"
											size="icon-lg"
											class="size-11 sm:size-9"
											aria-label={`Open actions for ${operation.name}`}
										>
											<AppIcon name="ellipsis" class="size-4" aria-hidden="true" />
										</Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end">
									<DropdownMenu.Label>{operation.name}</DropdownMenu.Label>
									<DropdownMenu.Separator />
									<DropdownMenu.Item>
										{#snippet child({ props })}
											<a {...props} href="/settings" class="flex w-full items-center">Review configuration</a>
										{/snippet}
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row class="hover:bg-transparent">
						<Table.Cell colspan={5} class="h-64 p-6 text-center">
							<div class="mx-auto grid max-w-sm justify-items-center">
								<span class="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
									<AppIcon name="search-empty" class="size-5" aria-hidden="true" />
								</span>
								<h3 class="mt-4 font-heading text-base font-semibold">No operations found</h3>
								<p class="mt-1.5 text-sm leading-6 text-muted-foreground">
									Try a broader search or reset the filters to bring the work queue back.
								</p>
								<Button variant="outline" onclick={onClear} class="mt-4 h-10">Reset filters</Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
