import type { AppIconName } from '$lib/client/ui/components/app-icon.svelte';

interface AdminNavigationItem {
	readonly description: string;
	readonly href: string;
	readonly icon: AppIconName;
	readonly label: string;
}

export const adminNavigation = Object.freeze([
	{
		description: 'Monitor starter operations and composition.',
		href: '/dashboard',
		icon: 'dashboard',
		label: 'Dashboard'
	},

	{
		description: 'Review project-level configuration.',
		href: '/settings',
		icon: 'settings',
		label: 'Settings'
	}
] satisfies readonly AdminNavigationItem[]);
