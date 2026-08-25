<script lang="ts">
	import * as Card from '$lib/client/ui/components/card/index.js';
	import type { DashboardActivity } from '$lib/shared/types/dashboard.js';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';

	let { activities }: { activities: readonly DashboardActivity[] } = $props();
</script>

<Card.Root class="h-fit rounded-2xl">
	<Card.Header class="border-b border-border pb-5">
		<div class="flex items-center justify-between gap-3">
			<div>
				<Card.Title class="font-heading text-lg">Live handoff</Card.Title>
				<Card.Description class="mt-1">The context your team needs next.</Card.Description>
			</div>
			<span class="grid size-9 place-items-center rounded-full bg-brand/10 text-brand" aria-hidden="true">
				<ArrowUpRightIcon class="size-4" />
			</span>
		</div>
	</Card.Header>
	<Card.Content class="pt-1">
		<ol class="grid list-none gap-0 p-0">
			{#each activities as activity, index (activity.id)}
				<li class="relative grid grid-cols-[0.875rem_minmax(0,1fr)] gap-3 pb-6 last:pb-1">
					<span
						class={[
							'relative z-10 mt-1.5 size-2.5 rounded-full ring-4 ring-card',
							index === 1 ? 'bg-warning' : 'bg-brand'
						]}
						aria-hidden="true"
					></span>
					{#if index < activities.length - 1}
						<span class="absolute bottom-0 left-[0.28125rem] top-3 w-px bg-border" aria-hidden="true"></span>
					{/if}
					<div class="min-w-0">
						<div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
							<p class="font-medium">{activity.title}</p>
							<time class="font-mono text-[0.6875rem] text-muted-foreground">{activity.time}</time>
						</div>
						<p class="mt-1.5 text-sm leading-5 text-muted-foreground">{activity.detail}</p>
					</div>
				</li>
			{/each}
		</ol>
	</Card.Content>
</Card.Root>
