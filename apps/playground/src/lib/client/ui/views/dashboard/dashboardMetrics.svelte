<script lang="ts">
	import * as Card from '$lib/client/ui/components/card/index.js';
	import type { DashboardMetric } from '$lib/shared/types/dashboard.js';

	let { metrics }: { metrics: readonly DashboardMetric[] } = $props();
</script>

<Card.Root>
	<Card.Header class="border-b border-border">
		<Card.Title>Readiness ledger</Card.Title>
		<Card.Description>Static starter signals that demonstrate a compact, readable summary.</Card.Description>
	</Card.Header>
	<Card.Content class="p-0">
		<dl class="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
			{#each metrics as metric (metric.label)}
				<div class="grid gap-1 p-4 sm:p-5">
					<dt class="text-sm font-medium text-muted-foreground">{metric.label}</dt>
					<dd class="font-heading text-2xl font-semibold tracking-tight">{metric.value}</dd>
					<dd class="text-sm leading-5 text-muted-foreground">{metric.detail}</dd>
				</div>
			{/each}
		</dl>
	</Card.Content>
</Card.Root>
