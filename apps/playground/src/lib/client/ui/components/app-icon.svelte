<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check-big';
	import ClockIcon from '@lucide/svelte/icons/clock-3';
	import DashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import RefreshIcon from '@lucide/svelte/icons/refresh-cw';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SearchEmptyIcon from '@lucide/svelte/icons/search-x';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import UsersIcon from '@lucide/svelte/icons/users';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Component, ComponentProps } from 'svelte';

	export type AppIconName = 'arrow-left' | 'arrow-right' | 'arrow-up-right' | 'check' | 'chevron-down' | 'chevron-right' | 'chevron-up' | 'circle-alert' | 'circle-check' | 'clock' | 'dashboard' | 'ellipsis' | 'menu' | 'minus' | 'refresh' | 'search' | 'search-empty' | 'settings' | 'triangle-alert' | 'users' | 'x';
	type IconComponent = Component<Record<string, unknown>>;
	type Props = ComponentProps<IconComponent> & { name: AppIconName };
	const icons = {
	'arrow-left': ArrowLeftIcon,
	'arrow-right': ArrowRightIcon,
	'arrow-up-right': ArrowUpRightIcon,
	'check': CheckIcon,
	'chevron-down': ChevronDownIcon,
	'chevron-right': ChevronRightIcon,
	'chevron-up': ChevronUpIcon,
	'circle-alert': CircleAlertIcon,
	'circle-check': CircleCheckIcon,
	'clock': ClockIcon,
	'dashboard': DashboardIcon,
	'ellipsis': EllipsisIcon,
	'menu': MenuIcon,
	'minus': MinusIcon,
	'refresh': RefreshIcon,
	'search': SearchIcon,
	'search-empty': SearchEmptyIcon,
	'settings': SettingsIcon,
	'triangle-alert': TriangleAlertIcon,
	'users': UsersIcon,
	'x': XIcon
	} satisfies Record<AppIconName, IconComponent>;
	let { name, ...restProps }: Props = $props();
	let Icon = $derived(icons[name]);
</script>

<Icon {...restProps} />
