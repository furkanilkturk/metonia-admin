<script lang="ts">
	import * as Card from '$lib/client/ui/components/card/index.js';
	import type { DashboardActivity } from '$lib/shared/types/dashboard.js';

	let { activities }: { activities: readonly DashboardActivity[] } = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Recent activity</Card.Title>
		<Card.Description>Static examples of the concise context this space can hold.</Card.Description>
	</Card.Header>
	<Card.Content>
		<ol class="grid list-none gap-0 p-0">
			{#each activities as activity, index (activity.id)}
				<li class="relative grid grid-cols-[0.75rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0">
					<span class="relative z-10 mt-1.5 size-2.5 rounded-full bg-primary ring-4 ring-card" aria-hidden="true"></span>
					{#if index < activities.length - 1}
						<span class="absolute bottom-0 left-[0.28125rem] top-3 w-px bg-border" aria-hidden="true"></span>
					{/if}
					<div class="min-w-0">
						<div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
							<p class="font-medium">{activity.title}</p>
							<time class="font-mono text-xs text-muted-foreground">{activity.time}</time>
						</div>
						<p class="mt-1 text-sm leading-5 text-muted-foreground">{activity.detail}</p>
					</div>
				</li>
			{/each}
		</ol>
	</Card.Content>
</Card.Root>
