import type { ThemeId } from '@metonia-admin/registry';

import {
	getShadcnSvelteThemePreset,
	getShadcnIconLibraryDependencies,
	renderAppIcon,
	shadcnSvelteDependencies,
	shadcnSvelteDevDependencies
} from '../../../adapters/ui/shadcn-svelte/index.js';
import type { Recipe, RecipeContext, StagedValidationContext } from '../../../contracts/index.js';
import { readGeneratorAsset } from '../../assets.js';

const componentSnapshotFiles = Object.freeze([
	'button/button.svelte',
	'button/index.ts',
	'card/card-action.svelte',
	'card/card-content.svelte',
	'card/card-description.svelte',
	'card/card-footer.svelte',
	'card/card-header.svelte',
	'card/card-title.svelte',
	'card/card.svelte',
	'card/index.ts',
	'dialog/dialog-close.svelte',
	'dialog/dialog-content.svelte',
	'dialog/dialog-description.svelte',
	'dialog/dialog-footer.svelte',
	'dialog/dialog-header.svelte',
	'dialog/dialog-overlay.svelte',
	'dialog/dialog-portal.svelte',
	'dialog/dialog-title.svelte',
	'dialog/dialog-trigger.svelte',
	'dialog/dialog.svelte',
	'dialog/index.ts',
	'dropdown-menu/dropdown-menu-checkbox-group.svelte',
	'dropdown-menu/dropdown-menu-checkbox-item.svelte',
	'dropdown-menu/dropdown-menu-content.svelte',
	'dropdown-menu/dropdown-menu-group-heading.svelte',
	'dropdown-menu/dropdown-menu-group.svelte',
	'dropdown-menu/dropdown-menu-item.svelte',
	'dropdown-menu/dropdown-menu-label.svelte',
	'dropdown-menu/dropdown-menu-portal.svelte',
	'dropdown-menu/dropdown-menu-radio-group.svelte',
	'dropdown-menu/dropdown-menu-radio-item.svelte',
	'dropdown-menu/dropdown-menu-separator.svelte',
	'dropdown-menu/dropdown-menu-shortcut.svelte',
	'dropdown-menu/dropdown-menu-sub-content.svelte',
	'dropdown-menu/dropdown-menu-sub-trigger.svelte',
	'dropdown-menu/dropdown-menu-sub.svelte',
	'dropdown-menu/dropdown-menu-trigger.svelte',
	'dropdown-menu/dropdown-menu.svelte',
	'dropdown-menu/index.ts',
	'input/index.ts',
	'input/input.svelte',
	'select/index.ts',
	'select/select-content.svelte',
	'select/select-item.svelte',
	'select/select-trigger.svelte',
	'select/select.svelte',
	'table/index.ts',
	'table/table-body.svelte',
	'table/table-caption.svelte',
	'table/table-cell.svelte',
	'table/table-footer.svelte',
	'table/table-head.svelte',
	'table/table-header.svelte',
	'table/table-row.svelte',
	'table/table.svelte'
]);

const componentRoot = 'src/lib/client/ui/components';

export function createShadcnSvelteUiRecipe(): Recipe {
	return {
		id: 'ui-shadcn-svelte',
		stage: 'ui',
		async apply(context) {
			assertShadcnSelection(context);
			const preset = getShadcnSvelteThemePreset(context.config.ui.theme);

			for (const path of componentSnapshotFiles) {
				await context.writeFile(
					`${componentRoot}/${path}`,
					await readUiAsset(`components/${path}`)
				);
			}
			await context.writeFile(
				`${componentRoot}/app-icon.svelte`,
				renderAppIcon(context.config.ui.iconLibrary)
			);
			await context.writeFile(
				'src/lib/client/utils/index.ts',
				await readUiAsset('src/lib/client/utils/index.ts')
			);
			await context.ensureDirectory('src/lib/client/hooks');
			await context.writeFile(
				'components.json',
				(await readUiAsset('components.json'))
					.replace('__SHADCN_BASE_COLOR__', preset.baseColor)
					.replace('__SHADCN_ICON_LIBRARY__', context.config.ui.iconLibrary)
			);
			await context.writeFile(
				'src/routes/+layout.svelte',
				await readUiAsset('src/routes/+layout.svelte')
			);
			await mergePackageManifest(context);
			await enableTailwindVitePlugin(context);

			context.addDocumentFact({ key: 'ui.shadcn.preset', value: preset.presetCode });
			context.addDocumentFact({ key: 'ui.shadcn.style', value: 'nova' });
			context.addDocumentFact({
				key: 'ui.shadcn.iconLibrary',
				value: context.config.ui.iconLibrary
			});
			context.addCheck({ id: 'shadcn-svelte-adapter', validate: validateShadcnAdapter });
		}
	};
}

export function createShadcnSvelteThemeRecipe(): Recipe {
	return {
		id: 'theme-shadcn-svelte',
		stage: 'theme',
		async apply(context) {
			assertShadcnSelection(context);
			const preset = getShadcnSvelteThemePreset(context.config.ui.theme);
			const snapshot = await readThemeSnapshot(preset.snapshot);

			await context.writeFile(
				'src/routes/layout.css',
				renderThemeCss(await readUiAsset('themes/layout.css'), preset.id, snapshot)
			);
			context.addCheck({ id: 'shadcn-svelte-theme', validate: validateShadcnTheme });
		}
	};
}

function assertShadcnSelection(context: RecipeContext): void {
	if (context.config.ui.adapter !== 'shadcn-svelte') {
		throw new Error('The shadcn-svelte recipe received another UI adapter selection.');
	}
}

async function mergePackageManifest(context: RecipeContext): Promise<void> {
	const iconDependencies = getShadcnIconLibraryDependencies(context.config.ui.iconLibrary);
	const manifest = parseJsonObject(await context.readFile('package.json'));
	manifest.dependencies = sortedRecord({
		...getStringRecord(manifest.dependencies),
		...shadcnSvelteDependencies,
		...iconDependencies
	});
	manifest.devDependencies = sortedRecord({
		...getStringRecord(manifest.devDependencies),
		...shadcnSvelteDevDependencies
	});
	await context.writeFile('package.json', `${JSON.stringify(manifest, null, '\t')}\n`);

	for (const [name, version] of Object.entries(shadcnSvelteDependencies)) {
		context.addDependency({ kind: 'dependencies', name, version });
	}
	for (const [name, version] of Object.entries(iconDependencies)) {
		context.addDependency({ kind: 'dependencies', name, version });
	}
	for (const [name, version] of Object.entries(shadcnSvelteDevDependencies)) {
		context.addDependency({ kind: 'devDependencies', name, version });
	}
}

async function enableTailwindVitePlugin(context: RecipeContext): Promise<void> {
	const source = await context.readFile('vite.config.ts');
	if (source.includes("from '@tailwindcss/vite'")) return;
	const withImport = `import tailwindcss from '@tailwindcss/vite';\n${source}`;
	const transformed = withImport.replace('plugins: [', 'plugins: [\n\t\ttailwindcss(),');
	if (transformed === withImport) {
		throw new Error('The active Vite configuration does not expose its plugin list.');
	}
	await context.writeFile('vite.config.ts', transformed);
}

async function validateShadcnAdapter(context: StagedValidationContext): Promise<void> {
	const preset = getShadcnSvelteThemePreset(context.config.ui.theme);
	const components = parseJsonObject(await context.readFile('components.json'));
	const aliases = getStringRecord(components.aliases);
	const tailwind = getStringRecord(components.tailwind);
	if (
		aliases.components !== '$lib/client/ui/components' ||
		aliases.ui !== '$lib/client/ui/components' ||
		aliases.utils !== '$lib/client/utils' ||
		tailwind.baseColor !== preset.baseColor ||
		components.style !== 'nova' ||
		components.iconLibrary !== context.config.ui.iconLibrary
	) {
		throw new Error('The shadcn-svelte adapter configuration does not match the pinned snapshot.');
	}
	if (await context.exists('src/lib/components/ui')) {
		throw new Error('shadcn-svelte wrote to its unrelated default component directory.');
	}

	const requiredFiles = [
		`${componentRoot}/button/button.svelte`,
		`${componentRoot}/card/card.svelte`,
		`${componentRoot}/dialog/dialog-content.svelte`,
		`${componentRoot}/dropdown-menu/dropdown-menu-content.svelte`,
		`${componentRoot}/input/input.svelte`,
		`${componentRoot}/select/select.svelte`,
		`${componentRoot}/app-icon.svelte`,
		`${componentRoot}/table/table.svelte`,
		'src/lib/client/utils/index.ts',
		'src/routes/+layout.svelte'
	];
	if (
		(await Promise.all(requiredFiles.map((path) => context.exists(path)))).some((exists) => !exists)
	) {
		throw new Error('The checked-in shadcn-svelte component snapshot is incomplete.');
	}

	for (const path of componentSnapshotFiles) {
		const source = await context.readFile(`${componentRoot}/${path}`);
		if (
			source.includes('$lib/server') ||
			source.includes('$lib/components') ||
			source.includes('$lib/client/ui/views') ||
			source.includes('$lib/client/ui/pages')
		) {
			throw new Error(`The shadcn-svelte snapshot violates an import boundary: ${path}`);
		}
	}

	const packageJson = parseJsonObject(await context.readFile('package.json'));
	const dependencies = getStringRecord(packageJson.dependencies);
	const devDependencies = getStringRecord(packageJson.devDependencies);
	const iconDependencies = getShadcnIconLibraryDependencies(context.config.ui.iconLibrary);
	if (
		Object.entries(shadcnSvelteDependencies).some(
			([name, version]) => dependencies[name] !== version
		) ||
		Object.entries(iconDependencies).some(([name, version]) => dependencies[name] !== version) ||
		Object.entries(shadcnSvelteDevDependencies).some(
			([name, version]) => devDependencies[name] !== version
		)
	) {
		throw new Error('The generated package manifest does not pin the shadcn-svelte stack.');
	}

	const viteConfig = await context.readFile('vite.config.ts');
	if (
		!viteConfig.includes("import tailwindcss from '@tailwindcss/vite';") ||
		!viteConfig.includes('tailwindcss(),')
	) {
		throw new Error('Tailwind integration is missing from the generated project.');
	}
}

async function validateShadcnTheme(context: StagedValidationContext): Promise<void> {
	const preset = getShadcnSvelteThemePreset(context.config.ui.theme);
	const snapshot = await readThemeSnapshot(preset.snapshot);
	const css = await context.readFile('src/routes/layout.css');
	const expectedFragments = [
		`/* shadcn-svelte Nova base color: ${preset.id} */`,
		"@import 'tailwindcss';",
		"@import 'shadcn-svelte/tailwind.css';",
		`--foreground: ${snapshot.foreground};`,
		'--signal: #c64f1a;',
		"--font-heading: 'Space Grotesk'",
		'@media (prefers-reduced-motion: reduce)'
	];
	if (
		expectedFragments.some((fragment) => !css.includes(fragment)) ||
		css.includes('__SHADCN_') ||
		css.includes('__LIGHT_THEME_VARIABLES__') ||
		css.includes('__DARK_THEME_VARIABLES__')
	) {
		throw new Error(`The checked-in shadcn-svelte ${preset.id} theme snapshot is incomplete.`);
	}
}

const baseColorSnapshotFields = [
	'foreground',
	'primary',
	'primaryForeground',
	'secondary',
	'mutedForeground',
	'border',
	'ring',
	'darkSecondary'
] as const;

type BaseColorSnapshot = Readonly<Record<(typeof baseColorSnapshotFields)[number], string>>;

async function readThemeSnapshot(theme: ThemeId): Promise<BaseColorSnapshot> {
	const snapshots = parseJsonObject(await readUiAsset('themes/base-colors.json'));
	const snapshot = getStringRecord(snapshots[theme]);
	if (baseColorSnapshotFields.some((field) => !snapshot[field])) {
		throw new Error(`The checked-in shadcn-svelte ${theme} base-color snapshot is incomplete.`);
	}
	return snapshot as BaseColorSnapshot;
}

function renderThemeCss(template: string, theme: ThemeId, snapshot: BaseColorSnapshot): string {
	const rendered = template
		.replace('__SHADCN_BASE_COLOR__', theme)
		.replace('__LIGHT_THEME_VARIABLES__', formatThemeVariables(lightTheme(snapshot), '\t'))
		.replace('__DARK_THEME_VARIABLES__', formatThemeVariables(darkTheme(snapshot), '\t\t'));
	if (
		rendered.includes('__SHADCN_BASE_COLOR__') ||
		rendered.includes('__LIGHT_THEME_VARIABLES__') ||
		rendered.includes('__DARK_THEME_VARIABLES__')
	) {
		throw new Error(`The shadcn-svelte ${theme} theme template contains unresolved fields.`);
	}
	return rendered;
}

function lightTheme(snapshot: BaseColorSnapshot): readonly (readonly [string, string])[] {
	return [
		['background', 'oklch(1 0 0)'],
		['foreground', snapshot.foreground],
		['card', 'oklch(1 0 0)'],
		['card-foreground', snapshot.foreground],
		['popover', 'oklch(1 0 0)'],
		['popover-foreground', snapshot.foreground],
		['primary', snapshot.primary],
		['primary-foreground', snapshot.primaryForeground],
		['secondary', snapshot.secondary],
		['secondary-foreground', snapshot.primary],
		['muted', snapshot.secondary],
		['muted-foreground', snapshot.mutedForeground],
		['accent', snapshot.secondary],
		['accent-foreground', snapshot.primary],
		['destructive', 'oklch(0.577 0.245 27.325)'],
		['border', snapshot.border],
		['input', snapshot.border],
		['ring', snapshot.ring],
		['radius', '0.625rem'],
		...chartTheme(),
		['sidebar', snapshot.primaryForeground],
		['sidebar-foreground', snapshot.foreground],
		['sidebar-primary', snapshot.primary],
		['sidebar-primary-foreground', snapshot.primaryForeground],
		['sidebar-accent', snapshot.secondary],
		['sidebar-accent-foreground', snapshot.primary],
		['sidebar-border', snapshot.border],
		['sidebar-ring', snapshot.ring]
	];
}

function darkTheme(snapshot: BaseColorSnapshot): readonly (readonly [string, string])[] {
	return [
		['background', snapshot.foreground],
		['foreground', snapshot.primaryForeground],
		['card', snapshot.primary],
		['card-foreground', snapshot.primaryForeground],
		['popover', snapshot.primary],
		['popover-foreground', snapshot.primaryForeground],
		['primary', snapshot.border],
		['primary-foreground', snapshot.primary],
		['secondary', snapshot.darkSecondary],
		['secondary-foreground', snapshot.primaryForeground],
		['muted', snapshot.darkSecondary],
		['muted-foreground', snapshot.ring],
		['accent', snapshot.darkSecondary],
		['accent-foreground', snapshot.primaryForeground],
		['destructive', 'oklch(0.704 0.191 22.216)'],
		['border', 'oklch(1 0 0 / 10%)'],
		['input', 'oklch(1 0 0 / 15%)'],
		['ring', snapshot.mutedForeground],
		...chartTheme(),
		['sidebar', snapshot.primary],
		['sidebar-foreground', snapshot.primaryForeground],
		['sidebar-primary', '#45c4bb'],
		['sidebar-primary-foreground', snapshot.primaryForeground],
		['sidebar-accent', snapshot.darkSecondary],
		['sidebar-accent-foreground', snapshot.primaryForeground],
		['sidebar-border', 'oklch(1 0 0 / 10%)'],
		['sidebar-ring', snapshot.mutedForeground]
	];
}

function chartTheme(): readonly (readonly [string, string])[] {
	return [
		['chart-1', 'oklch(0.855 0.138 181.071)'],
		['chart-2', 'oklch(0.704 0.14 182.503)'],
		['chart-3', 'oklch(0.6 0.118 184.704)'],
		['chart-4', 'oklch(0.511 0.096 186.391)'],
		['chart-5', 'oklch(0.437 0.078 188.216)']
	];
}

function formatThemeVariables(
	variables: readonly (readonly [string, string])[],
	indent: string
): string {
	return variables.map(([name, value]) => `${indent}--${name}: ${value};`).join('\n');
}

function parseJsonObject(serialized: string): Record<string, unknown> {
	const value: unknown = JSON.parse(serialized);
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error('Expected a JSON object.');
	}
	return value as Record<string, unknown>;
}

function getStringRecord(value: unknown): Record<string, string> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
	return Object.fromEntries(
		Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
	);
}

function sortedRecord(values: Readonly<Record<string, string>>): Record<string, string> {
	return Object.fromEntries(
		Object.entries(values).sort(([left], [right]) => left.localeCompare(right))
	);
}

async function readUiAsset(path: string): Promise<string> {
	return readGeneratorAsset(`ui/shadcn-svelte/${path}`);
}
