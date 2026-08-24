import {
	getShadcnSvelteThemePreset,
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
				'src/lib/client/utils/index.ts',
				await readUiAsset('src/lib/client/utils/index.ts')
			);
			await context.ensureDirectory('src/lib/client/hooks');
			await context.writeFile(
				'components.json',
				(await readUiAsset('components.json')).replace('__SHADCN_BASE_COLOR__', preset.baseColor)
			);
			await context.writeFile(
				'src/routes/+layout.svelte',
				await readUiAsset('src/routes/+layout.svelte')
			);
			await mergePackageManifest(context);
			await enableTailwindVitePlugin(context);

			context.addDocumentFact({ key: 'ui.shadcn.preset', value: preset.presetCode });
			context.addDocumentFact({ key: 'ui.shadcn.style', value: 'nova' });
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
			if (preset.snapshot === null) {
				throw new Error(
					`The shadcn-svelte ${preset.id} preset is pinned but does not yet have a checked-in theme snapshot.`
				);
			}

			await context.writeFile(
				'src/routes/layout.css',
				await readUiAsset(`themes/${preset.snapshot}/layout.css`)
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
	const manifest = parseJsonObject(await context.readFile('package.json'));
	manifest.dependencies = sortedRecord({
		...getStringRecord(manifest.dependencies),
		...shadcnSvelteDependencies
	});
	manifest.devDependencies = sortedRecord({
		...getStringRecord(manifest.devDependencies),
		...shadcnSvelteDevDependencies
	});
	await context.writeFile('package.json', `${JSON.stringify(manifest, null, '\t')}\n`);

	for (const [name, version] of Object.entries(shadcnSvelteDependencies)) {
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
		components.iconLibrary !== 'lucide'
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
	if (
		Object.entries(shadcnSvelteDependencies).some(
			([name, version]) => dependencies[name] !== version
		) ||
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
	const css = await context.readFile('src/routes/layout.css');
	const expectedFragments = [
		"@import 'tailwindcss';",
		"@import 'shadcn-svelte/tailwind.css';",
		'--primary: #0b7f79;',
		'--signal: #c64f1a;',
		"--font-heading: 'Space Grotesk'",
		'@media (prefers-reduced-motion: reduce)'
	];
	if (expectedFragments.some((fragment) => !css.includes(fragment))) {
		throw new Error('The checked-in shadcn-svelte zinc theme snapshot is incomplete.');
	}
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
