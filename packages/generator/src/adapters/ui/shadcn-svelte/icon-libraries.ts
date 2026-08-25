import type { IconLibraryId } from '@metonia-admin/registry';

const semanticIcons = [
	'arrow-left',
	'arrow-right',
	'arrow-up-right',
	'check',
	'chevron-down',
	'chevron-right',
	'chevron-up',
	'circle-alert',
	'circle-check',
	'clock',
	'dashboard',
	'ellipsis',
	'menu',
	'minus',
	'refresh',
	'search',
	'search-empty',
	'settings',
	'triangle-alert',
	'users',
	'x'
] as const;

type SemanticIcon = (typeof semanticIcons)[number];
type IconMap = Readonly<Record<SemanticIcon, string>>;

interface IconPlan {
	readonly dependencies: Readonly<Record<string, string>>;
	readonly icons: IconMap;
	readonly packageName: string;
	readonly style: 'lucide' | 'named' | 'hugeicons' | 'subpath';
}

const plans = {
	lucide: {
		style: 'lucide',
		packageName: '@lucide/svelte',
		dependencies: { '@lucide/svelte': '1.34.0' },
		icons: mapIcons([
			'arrow-left',
			'arrow-right',
			'arrow-up-right',
			'check',
			'chevron-down',
			'chevron-right',
			'chevron-up',
			'circle-alert',
			'circle-check-big',
			'clock-3',
			'layout-dashboard',
			'ellipsis',
			'menu',
			'minus',
			'refresh-cw',
			'search',
			'search-x',
			'settings',
			'triangle-alert',
			'users',
			'x'
		])
	},
	tabler: {
		style: 'named',
		packageName: '@tabler/icons-svelte',
		dependencies: { '@tabler/icons-svelte': '3.46.0' },
		icons: mapIcons([
			'IconArrowLeft',
			'IconArrowRight',
			'IconArrowUpRight',
			'IconCheck',
			'IconChevronDown',
			'IconChevronRight',
			'IconChevronUp',
			'IconAlertCircle',
			'IconCircleCheck',
			'IconClock',
			'IconLayoutDashboard',
			'IconDots',
			'IconMenu2',
			'IconMinus',
			'IconRefresh',
			'IconSearch',
			'IconSearchOff',
			'IconSettings',
			'IconAlertTriangle',
			'IconUsers',
			'IconX'
		])
	},
	phosphor: {
		style: 'named',
		packageName: 'phosphor-svelte',
		dependencies: { 'phosphor-svelte': '3.1.0' },
		icons: mapIcons([
			'ArrowLeft',
			'ArrowRight',
			'ArrowUpRight',
			'Check',
			'CaretDown',
			'CaretRight',
			'CaretUp',
			'WarningCircle',
			'CheckCircle',
			'Clock',
			'SquaresFour',
			'DotsThree',
			'List',
			'Minus',
			'ArrowClockwise',
			'MagnifyingGlass',
			'MagnifyingGlassMinus',
			'Gear',
			'Warning',
			'Users',
			'X'
		])
	},
	remixicon: {
		style: 'subpath',
		packageName: 'remixicon-svelte',
		dependencies: { 'remixicon-svelte': '0.0.5' },
		icons: mapIcons([
			'arrow-left-line',
			'arrow-right-line',
			'arrow-right-up-line',
			'check-line',
			'arrow-down-s-line',
			'arrow-right-s-line',
			'arrow-up-s-line',
			'error-warning-line',
			'checkbox-circle-line',
			'time-line',
			'dashboard-line',
			'more-2-line',
			'menu-line',
			'subtract-line',
			'refresh-line',
			'search-line',
			'search-eye-line',
			'settings-3-line',
			'alert-line',
			'group-line',
			'close-line'
		])
	},
	hugeicons: {
		style: 'hugeicons',
		packageName: '@hugeicons/core-free-icons',
		dependencies: { '@hugeicons/core-free-icons': '4.3.0', '@hugeicons/svelte': '1.1.5' },
		icons: mapIcons([
			'ArrowLeft01Icon',
			'ArrowRight01Icon',
			'ArrowUpRight01Icon',
			'Tick02Icon',
			'ArrowDown01Icon',
			'ArrowRight01Icon',
			'ArrowUp01Icon',
			'AlertCircleIcon',
			'CheckmarkCircle02Icon',
			'Clock01Icon',
			'DashboardSquare01Icon',
			'MoreHorizontalIcon',
			'Menu01Icon',
			'MinusSignIcon',
			'RefreshIcon',
			'Search01Icon',
			'SearchRemoveIcon',
			'Settings01Icon',
			'Alert02Icon',
			'UserGroupIcon',
			'Cancel01Icon'
		])
	}
} as const satisfies Readonly<Record<IconLibraryId, IconPlan>>;

export function getShadcnIconLibraryDependencies(
	id: IconLibraryId
): Readonly<Record<string, string>> {
	return plans[id].dependencies;
}

export function renderAppIcon(id: IconLibraryId): string {
	const plan = plans[id];
	const typeNames = semanticIcons.map((name) => `'${name}'`).join(' | ');
	const entries = semanticIcons.map((name) => `\t'${name}': ${localName(name)}`).join(',\n');
	const imports = renderImports(plan);

	if (plan.style === 'hugeicons') {
		return `<script lang="ts">\n\timport { HugeiconsIcon } from '@hugeicons/svelte';\n\t${imports}\n\timport type { ComponentProps } from 'svelte';\n\n\texport type AppIconName = ${typeNames};\n\ttype Props = Omit<ComponentProps<typeof HugeiconsIcon>, 'icon'> & { name: AppIconName };\n\tconst icons = {\n${entries}\n\t} as const;\n\tlet { name, ...restProps }: Props = $props();\n</script>\n\n<HugeiconsIcon icon={icons[name]} {...restProps} />\n`;
	}

	return `<script lang="ts">\n\t${imports}\n\n\texport type AppIconName = ${typeNames};\n\ttype Props = {\n\t\tname: AppIconName;\n\t\tclass?: string;\n\t\t'aria-hidden'?: boolean | 'true' | 'false';\n\t\t'data-icon'?: string;\n\t};\n\tconst icons = {\n${entries}\n\t} as const;\n\tlet { name, ...restProps }: Props = $props();\n\tlet Icon = $derived(icons[name]);\n</script>\n\n<Icon {...restProps} />\n`;
}

function mapIcons(values: readonly string[]): IconMap {
	return Object.fromEntries(semanticIcons.map((name, index) => [name, values[index]])) as IconMap;
}

function localName(name: SemanticIcon): string {
	return `${name
		.split('-')
		.map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`)
		.join('')}Icon`;
}

function renderImports(plan: IconPlan): string {
	if (plan.style === 'lucide' || plan.style === 'subpath') {
		return semanticIcons
			.map(
				(name) => `import ${localName(name)} from '${plan.packageName}/icons/${plan.icons[name]}';`
			)
			.join('\n\t');
	}
	return `import { ${semanticIcons.map((name) => `${plan.icons[name]} as ${localName(name)}`).join(', ')} } from '${plan.packageName}';`;
}
