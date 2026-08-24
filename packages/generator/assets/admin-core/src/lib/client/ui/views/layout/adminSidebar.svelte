<script lang="ts">
	import { adminNavigation } from '$lib/client/navigation/adminNavigation.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	interface Props {
		mode?: 'desktop' | 'mobile';
		onNavigate?: () => void;
		pathname: string;
	}

	let { mode = 'desktop', onNavigate, pathname }: Props = $props();
</script>

<aside
	class={[
		'flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground',
		mode === 'desktop' ? 'border-r border-sidebar-border' : 'rounded-xl'
	]}
>
	<div class="flex min-h-16 items-center gap-3 border-b border-sidebar-border px-4">
		<span
			class="grid size-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary font-heading text-base font-semibold text-sidebar-primary-foreground"
			aria-hidden="true">M</span
		>
		<div class="min-w-0">
			<p class="truncate font-heading text-sm font-semibold">Metonia Admin</p>
			<p class="truncate font-mono text-[0.6875rem] text-sidebar-foreground/65">Native workbench</p>
		</div>
	</div>

	<nav class="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Primary navigation">
		<p class="mb-2 px-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/55">
			Workspace
		</p>
		<ul class="grid list-none gap-1 p-0">
			{#each adminNavigation as item (item.href)}
				<li>
					<a
						href={item.href}
						onclick={onNavigate}
						aria-current={pathname === item.href ? 'page' : undefined}
						class={[
							'group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
							pathname === item.href
								? 'bg-sidebar-accent text-sidebar-accent-foreground'
								: 'text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
						]}
					>
						<item.icon class="size-4 shrink-0" aria-hidden="true" />
						<span class="min-w-0 flex-1 truncate">{item.label}</span>
						{#if pathname === item.href}
							<ArrowRightIcon class="size-3.5 shrink-0" aria-hidden="true" />
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="m-3 rounded-lg border border-sidebar-border bg-sidebar-accent/45 p-3">
		<p class="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-sidebar-primary">
			Auth deferred
		</p>
		<p class="mt-1 text-xs leading-5 text-sidebar-foreground/70">
			This starter does not protect admin routes. Add authentication before production use.
		</p>
	</div>
</aside>
