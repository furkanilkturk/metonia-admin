<script lang="ts">
	import * as Card from '$lib/client/ui/components/card/index.js';
	import AppIcon from '$lib/client/ui/components/app-icon.svelte';

	interface SettingSummary {
		detail: string;
		label: string;
		value: string;
	}

	let { settings }: { settings: readonly SettingSummary[] } = $props();
</script>

<Card.Root>
	<Card.Header class="border-b border-border">
		<Card.Title>Generated configuration</Card.Title>
		<Card.Description>
			These values describe code generation choices, not live infrastructure health.
		</Card.Description>
	</Card.Header>
	<Card.Content class="p-0">
		<dl class="divide-y divide-border">
			{#each settings as setting (setting.label)}
				<div class="grid gap-1 px-4 py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4 sm:px-6">
					<dt class="text-sm font-medium text-muted-foreground">{setting.label}</dt>
					<dd class="min-w-0">
						<p class="font-mono text-sm font-semibold">{setting.value}</p>
						<p class="mt-1 text-sm leading-5 text-muted-foreground">{setting.detail}</p>
					</dd>
				</div>
			{/each}
		</dl>
	</Card.Content>
	<Card.Footer class="border-t border-border">
		<div class="grid gap-3 text-sm sm:grid-cols-2">
			<div class="flex gap-2 rounded-lg bg-primary/10 p-3 text-primary">
				<AppIcon name="circle-check" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
				<p>UI and application boundaries are generated as ordinary SvelteKit source.</p>
			</div>
			<div class="flex gap-2 rounded-lg bg-signal/10 p-3 text-signal">
				<AppIcon name="circle-alert" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
				<p>Authentication and authorization are intentionally not configured.</p>
			</div>
		</div>
	</Card.Footer>
</Card.Root>
