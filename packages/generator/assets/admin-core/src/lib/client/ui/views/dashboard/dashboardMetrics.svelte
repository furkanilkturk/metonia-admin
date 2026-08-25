<script lang="ts">
	import type { DashboardMetric } from '$lib/shared/types/dashboard.js';

	let { metrics }: { metrics: readonly DashboardMetric[] } = $props();

	const pulse = [
		{ day: 'Mon', height: 46, tone: 'brand' },
		{ day: 'Tue', height: 62, tone: 'brand' },
		{ day: 'Wed', height: 54, tone: 'brand' },
		{ day: 'Thu', height: 79, tone: 'success' },
		{ day: 'Fri', height: 68, tone: 'brand' },
		{ day: 'Sat', height: 38, tone: 'muted' },
		{ day: 'Sun', height: 58, tone: 'brand' }
	] as const;
</script>

<section class="overflow-hidden rounded-xl border border-border bg-card shadow-sm" aria-labelledby="pulse-heading">
	<div class="grid lg:grid-cols-[minmax(0,1fr)_24rem]">
		<div class="p-5 sm:p-6">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p class="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand">
						Today / operational pulse
					</p>
					<h2 id="pulse-heading" class="mt-2 font-heading text-xl font-semibold tracking-tight">
						No blockers in the active queue
					</h2>
					<p class="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
						One review is time-sensitive. The remaining work is healthy or scheduled.
					</p>
				</div>
				<span class="inline-flex items-center gap-2 rounded-md border border-success/25 bg-success/8 px-2.5 py-1.5 text-xs font-semibold text-success">
					<span class="size-1.5 rounded-full bg-success" aria-hidden="true"></span>
					Live overview
				</span>
			</div>

			<dl class="mt-5 grid border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
				{#each metrics as metric (metric.label)}
					<div class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 border-b border-border py-4 last:border-b-0 sm:border-b-0 sm:px-4 sm:first:pl-0">
						<span class={['mt-1.5 h-8 w-0.5 rounded-full', metric.tone === 'brand' && 'bg-brand', metric.tone === 'success' && 'bg-success', metric.tone === 'warning' && 'bg-warning']} aria-hidden="true"></span>
						<div>
							<dt class="text-xs font-medium text-muted-foreground">{metric.label}</dt>
							<dd class="mt-0.5 font-heading text-2xl font-semibold tracking-tight">{metric.value}</dd>
							<dd class="mt-0.5 text-xs text-muted-foreground">{metric.detail}</dd>
						</div>
					</div>
				{/each}
			</dl>
		</div>

		<div class="border-t border-border bg-muted/25 p-5 lg:border-l lg:border-t-0 sm:p-6">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-sm font-semibold">7-day throughput</p>
					<p class="mt-0.5 text-xs text-muted-foreground">Completed workflow volume</p>
				</div>
				<span class="font-mono text-xs font-semibold text-success">+12.4%</span>
			</div>
			<div class="mt-5 grid h-20 grid-cols-7 items-end gap-2" role="img" aria-label="Workflow throughput increased over the last seven days">
				{#each pulse as point (point.day)}
					<div class="grid h-full grid-rows-[1fr_auto] items-end gap-1.5">
						<span class={['w-full min-w-2 rounded-sm', point.tone === 'success' && 'bg-success', point.tone === 'brand' && 'bg-brand/75', point.tone === 'muted' && 'bg-muted']} style:height={`${point.height}%`} aria-hidden="true"></span>
						<span class="text-center font-mono text-[0.5625rem] uppercase text-muted-foreground">{point.day}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
