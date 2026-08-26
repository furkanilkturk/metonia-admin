<script lang="ts">
	import {
		adminNavigation,
		isAdminNavigationItemActive
	} from '$lib/client/navigation/adminNavigation.js';
	import AppIcon from '$lib/client/ui/components/app-icon.svelte';

	interface Props {
		mode?: 'desktop' | 'mobile';
		onNavigate?: () => void;
		pathname: string;
	}

	let { mode = 'desktop', onNavigate, pathname }: Props = $props();
	const isActive = (href: string) => isAdminNavigationItemActive(pathname, href);
</script>

<aside
	class={[
		'flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground',
		mode === 'desktop' ? 'border-r border-sidebar-border' : 'rounded-xl'
	]}
>
	<div class="flex min-h-16 items-center gap-3 border-b border-sidebar-border px-4">
		<span
			class="grid size-9 shrink-0 place-items-center rounded-md bg-brand font-heading text-base font-semibold text-brand-foreground"
			aria-hidden="true">M</span
		>
		<div class="min-w-0">
			<p class="truncate font-heading text-sm font-semibold">Metonia Admin</p>
			<p class="truncate font-mono text-[0.6875rem] text-sidebar-foreground/65">Operations console</p>
		</div>
	</div>

	<nav class="min-h-0 flex-1 overflow-y-auto px-3 py-5" aria-label="Primary navigation">
		<p class="mb-2.5 px-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
			Workspace
		</p>
		<ul class="grid list-none gap-1.5 p-0">
			{#each adminNavigation as item (item.href)}
				<li>
					<a
						href={item.href}
						onclick={onNavigate}
						aria-current={isActive(item.href) ? 'page' : undefined}
						class={[
							'group relative flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
							isActive(item.href)
								? 'bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:-left-3 before:h-6 before:w-0.5 before:rounded-r before:bg-brand'
								: 'text-sidebar-foreground/68 hover:bg-sidebar-accent/65 hover:text-sidebar-accent-foreground'
						]}
					>
						<AppIcon name={item.icon} class="size-4 shrink-0" aria-hidden="true" />
						<span class="min-w-0 flex-1 truncate">{item.label}</span>
						{#if isActive(item.href)}
							<AppIcon name="arrow-right" class="size-3.5 shrink-0" aria-hidden="true" />
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="m-3 border-t border-sidebar-border px-1 pt-3.5">
		<p class="flex items-center gap-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-warning">
			<span class="size-1.5 rounded-full bg-warning" aria-hidden="true"></span> Auth deferred
		</p>
		<p class="mt-1.5 text-xs leading-5 text-sidebar-foreground/62">
			Protect admin routes before production use.
		</p>
	</div>
</aside>
