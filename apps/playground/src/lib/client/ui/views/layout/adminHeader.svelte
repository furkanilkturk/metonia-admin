<script lang="ts">
	import { Button } from '$lib/client/ui/components/button/index.js';
	import * as DropdownMenu from '$lib/client/ui/components/dropdown-menu/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import SettingsIcon from '@lucide/svelte/icons/settings';

	interface Props {
		currentLabel: string;
		onOpenNavigation: () => void;
	}

	let { currentLabel, onOpenNavigation }: Props = $props();
</script>

<header class="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
	<div class="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
		<Button
			variant="outline"
			size="icon-lg"
			class="size-11 lg:hidden"
			onclick={onOpenNavigation}
			aria-label="Open primary navigation"
		>
			<MenuIcon class="size-5" aria-hidden="true" />
		</Button>

		<nav class="min-w-0 flex-1" aria-label="Breadcrumb">
			<ol class="flex list-none items-center gap-2 p-0 text-sm">
				<li><a class="text-muted-foreground hover:text-foreground" href="/dashboard">Workspace</a></li>
				<li class="text-muted-foreground" aria-hidden="true">/</li>
				<li class="truncate font-medium" aria-current="page">{currentLabel}</li>
			</ol>
		</nav>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="ghost"
						class="h-11 max-w-56 justify-start gap-2 px-2 sm:px-3"
						aria-label="Open workspace menu"
					>
						<span class="grid size-7 shrink-0 place-items-center rounded-md bg-brand text-xs font-semibold text-brand-foreground" aria-hidden="true">
							MA
						</span>
						<span class="hidden min-w-0 text-left sm:block">
							<span class="block truncate text-sm font-medium">Operations workspace</span>
							<span class="block truncate text-xs font-normal text-muted-foreground">5 active workflows</span>
						</span>
						<ChevronDownIcon class="hidden size-4 shrink-0 sm:block" aria-hidden="true" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-64">
				<DropdownMenu.Label>Operations workspace</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					{#snippet child({ props })}
						<a {...props} href="/settings" class="flex w-full items-center gap-2">
							<SettingsIcon class="size-4" aria-hidden="true" />
							Project settings
						</a>
					{/snippet}
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<p class="px-2 py-1.5 text-xs leading-5 text-muted-foreground">
					Add authentication and authorization before exposing this admin application.
				</p>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
