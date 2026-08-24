<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import * as Card from '$lib/client/ui/components/card/index.js';
	import * as DropdownMenu from '$lib/client/ui/components/dropdown-menu/index.js';
	import * as Table from '$lib/client/ui/components/table/index.js';
	import type {
		DashboardOperation,
		DashboardOperationStatus
	} from '$lib/shared/types/dashboard.js';
	import CheckCircle2Icon from '@lucide/svelte/icons/circle-check-big';
	import Clock3Icon from '@lucide/svelte/icons/clock-3';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';

	let { operations }: { operations: readonly DashboardOperation[] } = $props();

	const statusLabels: Record<DashboardOperationStatus, string> = {
		healthy: 'Healthy',
		attention: 'Needs attention',
		scheduled: 'Scheduled'
	};
</script>

<Card.Root>
	<Card.Header class="border-b border-border">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div>
				<Card.Title>Operations</Card.Title>
				<Card.Description>Example workbench rows for replacing with your domain data.</Card.Description>
			</div>
			<span class="rounded-full bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
				{operations.length} visible
			</span>
		</div>
	</Card.Header>
	<Card.Content class="p-0">
		<div class="overflow-x-auto">
			<Table.Root class="min-w-[42rem]">
				<Table.Caption class="sr-only">
					Starter operations with owners, statuses, update times, and row actions.
				</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.Head scope="col">Operation</Table.Head>
						<Table.Head scope="col">Owner</Table.Head>
						<Table.Head scope="col">Status</Table.Head>
						<Table.Head scope="col">Updated</Table.Head>
						<Table.Head scope="col" class="w-16 text-right">
							<span class="sr-only">Actions</span>
						</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each operations as operation (operation.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{operation.name}</Table.Cell>
							<Table.Cell>{operation.owner}</Table.Cell>
							<Table.Cell>
								<span
									class={[
										'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium',
										operation.status === 'healthy' && 'bg-primary/10 text-primary',
										operation.status === 'attention' && 'bg-signal/10 text-signal',
										operation.status === 'scheduled' && 'bg-muted text-muted-foreground'
									]}
								>
									{#if operation.status === 'healthy'}
										<CheckCircle2Icon class="size-3.5" aria-hidden="true" />
									{:else if operation.status === 'attention'}
										<TriangleAlertIcon class="size-3.5" aria-hidden="true" />
									{:else}
										<Clock3Icon class="size-3.5" aria-hidden="true" />
									{/if}
									{statusLabels[operation.status]}
								</span>
							</Table.Cell>
							<Table.Cell class="font-mono text-xs text-muted-foreground">
								{operation.updatedAt}
							</Table.Cell>
							<Table.Cell class="text-right">
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
												<EllipsisIcon class="size-4" aria-hidden="true" />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item>
											{#snippet child({ props })}
												<a {...props} href="/settings" class="flex w-full items-center">
													Review configuration
												</a>
											{/snippet}
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={5} class="h-28 text-center text-muted-foreground">
								No operations match these filters. Clear the filters to restore the starter rows.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</Card.Content>
</Card.Root>
