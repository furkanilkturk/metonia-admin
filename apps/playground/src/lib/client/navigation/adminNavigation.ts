import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
import SettingsIcon from '@lucide/svelte/icons/settings';


export const adminNavigation = Object.freeze([
	{
		description: 'Monitor starter operations and composition.',
		href: '/dashboard',
		icon: LayoutDashboardIcon,
		label: 'Dashboard'
	},

	{
		description: 'Review project-level configuration.',
		href: '/settings',
		icon: SettingsIcon,
		label: 'Settings'
	}
]);
