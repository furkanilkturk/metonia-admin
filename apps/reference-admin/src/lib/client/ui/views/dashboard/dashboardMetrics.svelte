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

<section class="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10" aria-labelledby="pulse-heading">
	<div class="grid lg:grid-cols-[minmax(18rem,0.78fr)_minmax(24rem,1.22fr)]">
		<div class="relative overflow-hidden bg-foreground p-6 text-background sm:p-7">
			<div class="absolute -right-12 -top-16 size-44 rounded-full border border-background/10" aria-hidden="true"></div>
			<div class="absolute -right-2 -top-6 size-24 rounded-full border border-background/10" aria-hidden="true"></div>
			<p class="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-background/60">
				Operational pulse
			</p>
			<h2 id="pulse-heading" class="mt-6 max-w-md text-balance font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
				Work is moving without blockers.
			</h2>
			<p class="mt-3 max-w-md text-sm leading-6 text-background/65">
				One workflow needs attention. Everything else is healthy or already scheduled.
			</p>
			<div class="mt-7 flex items-center gap-2 text-sm font-medium">
				<span class="relative flex size-2.5" aria-hidden="true">
					<span class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-50"></span>
					<span class="relative inline-flex size-2.5 rounded-full bg-success"></span>
				</span>
				Live overview
			</div>
		</div>

		<div class="grid content-between gap-8 p-6 sm:p-7">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-sm font-semibold">Throughput, last 7 days</p>
					<p class="mt-1 text-sm text-muted-foreground">Completed workflow volume</p>
				</div>
				<div class="rounded-full bg-success/10 px-2.5 py-1 font-mono text-xs font-semibold text-success">
					+12.4%
				</div>
			</div>

			<div class="grid h-32 grid-cols-7 items-end gap-2 sm:gap-3" role="img" aria-label="Workflow throughput increased over the last seven days">
				{#each pulse as point (point.day)}
					<div class="grid h-full grid-rows-[1fr_auto] items-end gap-2">
						<span
							class={[
								'w-full min-w-3 rounded-t-md',
								point.tone === 'success' && 'bg-success',
								point.tone === 'brand' && 'bg-brand',
								point.tone === 'muted' && 'bg-muted'
							]}
							style:height={`${point.height}%`}
							aria-hidden="true"
						></span>
						<span class="text-center font-mono text-[0.625rem] uppercase text-muted-foreground">{point.day}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<dl class="grid border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
		{#each metrics as metric (metric.label)}
			<div class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 border-b border-border p-5 last:border-b-0 sm:border-b-0 sm:p-6">
				<span
					class={[
						'mt-1.5 size-2 rounded-full',
						metric.tone === 'brand' && 'bg-brand',
						metric.tone === 'success' && 'bg-success',
						metric.tone === 'warning' && 'bg-warning'
					]}
					aria-hidden="true"
				></span>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">{metric.label}</dt>
					<dd class="mt-1 font-heading text-2xl font-semibold tracking-tight">{metric.value}</dd>
					<dd class="mt-1 text-sm leading-5 text-muted-foreground">{metric.detail}</dd>
				</div>
			</div>
		{/each}
	</dl>
</section>
