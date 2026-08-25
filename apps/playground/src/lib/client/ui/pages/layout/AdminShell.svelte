<script lang="ts">
	import { adminNavigation } from '$lib/client/navigation/adminNavigation.js';
	import { Button } from '$lib/client/ui/components/button/index.js';
	import * as Dialog from '$lib/client/ui/components/dialog/index.js';
	import AdminHeader from '$lib/client/ui/views/layout/adminHeader.svelte';
	import AdminSidebar from '$lib/client/ui/views/layout/adminSidebar.svelte';
	import { navigating, page } from '$app/state';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
	let navigationOpen = $state(false);
	let pathname = $derived(page.url.pathname);
	let isNavigating = $derived(Boolean(navigating.to));
	let currentLabel = $derived(
		adminNavigation.find((item) => item.href === pathname)?.label ?? 'Workspace'
	);
</script>

{#if isNavigating}
	<div class="route-progress fixed inset-x-0 top-0 z-[80] h-0.5 overflow-hidden bg-brand/15" role="progressbar" aria-label="Loading page">
		<span class="block h-full w-1/3 bg-brand"></span>
	</div>
{/if}

<a
	href="#admin-content"
	class="fixed left-3 top-3 z-[70] -translate-y-20 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-transform focus:translate-y-0"
>
	Skip to content
</a>

<div class="min-h-dvh bg-background lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
	<div class="sticky top-0 hidden h-dvh lg:block">
		<AdminSidebar {pathname} />
	</div>

	<div class="min-w-0">
		<AdminHeader {currentLabel} onOpenNavigation={() => (navigationOpen = true)} />
		<main id="admin-content" class="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8" tabindex="-1">
			{@render children()}
		</main>
	</div>
</div>

<Dialog.Root bind:open={navigationOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="inset-y-2 left-2 top-2 h-[calc(100dvh-1rem)] w-[min(20rem,calc(100vw-1rem))] max-w-none -translate-x-0 -translate-y-0 gap-0 overflow-hidden rounded-xl p-0 sm:max-w-none lg:hidden"
	>
		<Dialog.Title class="sr-only">Primary navigation</Dialog.Title>
		<Dialog.Description class="sr-only">
			Navigate between the admin dashboard, resources, and settings.
		</Dialog.Description>
		<AdminSidebar mode="mobile" {pathname} onNavigate={() => (navigationOpen = false)} />
		<Dialog.Close>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="ghost"
					size="icon-lg"
					class="absolute right-2 top-2 size-11 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
					aria-label="Close primary navigation"
				>
					<XIcon class="size-5" aria-hidden="true" />
				</Button>
			{/snippet}
		</Dialog.Close>
	</Dialog.Content>
</Dialog.Root>

<style>
	.route-progress span {
		animation: route-progress 1.1s ease-in-out infinite;
	}

	@keyframes route-progress {
		0% {
			transform: translateX(-110%);
		}
		100% {
			transform: translateX(410%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.route-progress span {
			width: 100%;
			animation: none;
		}
	}
</style>
