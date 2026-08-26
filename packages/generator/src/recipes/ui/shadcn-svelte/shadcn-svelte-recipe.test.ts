/// <reference types="bun" />

import { afterEach, describe, expect, test } from 'bun:test';
import { spawn } from 'node:child_process';
import { lstat, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';

import { resolveConfigOrThrow, type IconLibraryId, type ThemeId } from '@metonia-admin/registry';

import { generateProject } from '../../../core/index.js';
import { createAdminCoreRecipe } from '../../admin-core/index.js';
import { createArchitectureRecipe } from '../../architecture/index.js';
import { createBaseRecipe } from '../../base/index.js';
import { createDocumentsRecipe } from '../../documents/index.js';
import {
	createShadcnSvelteThemeRecipe,
	createShadcnSvelteUiRecipe
} from './shadcn-svelte-recipe.js';

const temporaryRoots: string[] = [];
const generatedIntegrationTest =
	process.env.METONIA_RUN_GENERATED_UI_INTEGRATION === '1' ? test : test.skip;
const generatedIconIntegrationTest =
	process.env.METONIA_RUN_GENERATED_ICON_INTEGRATION === '1' ? test : test.skip;

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map(removeTestRoot));
}, 60_000);

describe('shadcn-svelte admin workbench recipes', () => {
	test('generates deterministic Nova zinc files, aliases, boundaries, and thin routes', async () => {
		const destination = join(await createTestRoot(), 'generated workbench');
		const result = await generateWorkbench(destination);

		expect(result.ok).toBeTrue();
		if (!result.ok) throw new Error(JSON.stringify(result.error));
		expect(result.stages.filter((stage) => stage.recipeId).map((stage) => stage.recipeId)).toEqual([
			'sveltekit-base',
			'metonia-architecture',
			'admin-core',
			'ui-shadcn-svelte',
			'theme-shadcn-svelte',
			'generated-documents'
		]);

		const components = JSON.parse(await readFile(join(destination, 'components.json'), 'utf8'));
		expect(components).toMatchObject({
			aliases: {
				components: '$lib/client/ui/components',
				ui: '$lib/client/ui/components',
				utils: '$lib/client/utils'
			},
			iconLibrary: 'lucide',
			style: 'nova',
			tailwind: { baseColor: 'zinc', css: 'src/routes/layout.css' }
		});
		expect(await exists(join(destination, 'src/lib/components/ui'))).toBeFalse();

		for (const primitive of [
			'button',
			'card',
			'dialog',
			'dropdown-menu',
			'input',
			'select',
			'table'
		]) {
			expect(
				await exists(join(destination, 'src/lib/client/ui/components', primitive, 'index.ts'))
			).toBeTrue();
		}

		const packageJson = JSON.parse(await readFile(join(destination, 'package.json'), 'utf8'));
		expect(packageJson.dependencies).toMatchObject({
			'@internationalized/date': '3.12.3',
			'@lucide/svelte': '1.34.0',
			'bits-ui': '2.16.3',
			clsx: '2.1.1',
			'tailwind-merge': '3.6.0',
			'tailwind-variants': '3.3.1'
		});
		expect(packageJson.devDependencies).toMatchObject({
			'@tailwindcss/vite': '4.3.0',
			'shadcn-svelte': '1.5.0',
			tailwindcss: '4.3.0',
			'tw-animate-css': '1.4.0'
		});

		const dashboardRoute = await readFile(
			join(destination, 'src/routes/(admin)/dashboard/+page.svelte'),
			'utf8'
		);
		const settingsRoute = await readFile(
			join(destination, 'src/routes/(admin)/settings/+page.svelte'),
			'utf8'
		);
		expect(dashboardRoute).toContain(
			"import DashboardPage from '$lib/client/ui/pages/dashboard.svelte';"
		);
		expect(dashboardRoute).toContain('<DashboardPage />');
		expect(settingsRoute).toContain(
			"import SettingsPage from '$lib/client/ui/pages/settings.svelte';"
		);
		expect(settingsRoute).toContain('<SettingsPage />');
		expect(`${dashboardRoute}\n${settingsRoute}`).not.toMatch(/<(?:main|section|header|h1)\b/);
		expect(await readFile(join(destination, 'src/routes/+page.server.ts'), 'utf8')).toContain(
			"redirect(307, '/dashboard');"
		);

		const view = await readFile(
			join(destination, 'src/lib/client/ui/views/dashboard/dashboardFilter.svelte'),
			'utf8'
		);
		expect(view).not.toContain('$lib/client/ui/pages');
		expect(view).not.toContain('$lib/server');
		const navigation = await readFile(
			join(destination, 'src/lib/client/navigation/adminNavigation.ts'),
			'utf8'
		);
		expect(navigation).not.toContain("href: '/users'");
		expect(navigation).toContain('pathname.startsWith(`${href}/`)');
		expect(
			await readFile(
				join(destination, 'src/lib/client/ui/pages/dashboard/dashboardState.svelte.ts'),
				'utf8'
			)
		).toContain('operation.id.toLocaleLowerCase().includes(query)');
		expect(
			await readFile(join(destination, 'src/lib/client/ui/pages/dashboard.svelte'), 'utf8')
		).toContain('<DashboardMetrics');
		expect(await readFile(join(destination, 'src/routes/+error.svelte'), 'utf8')).toContain(
			"import ErrorPage from '$lib/client/ui/pages/error.svelte';"
		);
		expect(
			await readFile(join(destination, 'src/lib/client/ui/pages/error.svelte'), 'utf8')
		).toContain('This page is off the map.');
		const dashboardTable = await readFile(
			join(destination, 'src/lib/client/ui/views/dashboard/dashboardTable.svelte'),
			'utf8'
		);
		expect(dashboardTable).toContain("from '$lib/client/ui/components/table/index.js'");
		expect(dashboardTable).toContain('Loading operations');
		expect(dashboardTable).toContain('No operations found');
		expect(
			await readFile(join(destination, 'src/lib/client/ui/pages/layout/AdminShell.svelte'), 'utf8')
		).toContain("import { navigating, page } from '$app/state';");
	});

	test('generates every pinned Nova base-color snapshot', async () => {
		const root = await createTestRoot();
		const themes = [
			'neutral',
			'stone',
			'zinc',
			'mauve',
			'olive',
			'mist',
			'taupe'
		] as const satisfies readonly ThemeId[];
		const foregrounds: Readonly<Record<ThemeId, string>> = {
			neutral: 'oklch(0.145 0 0)',
			stone: 'oklch(0.147 0.004 49.25)',
			zinc: 'oklch(0.141 0.005 285.823)',
			mauve: 'oklch(0.145 0.008 326)',
			olive: 'oklch(0.153 0.006 107.1)',
			mist: 'oklch(0.148 0.004 228.8)',
			taupe: 'oklch(0.147 0.004 49.3)'
		};
		const generatedStyles = new Set<string>();

		for (const theme of themes) {
			const destination = join(root, theme);
			const result = await generateWorkbench(destination, theme);
			if (!result.ok) throw new Error(`${theme}: ${JSON.stringify(result.error)}`);
			expect(result.ok).toBeTrue();

			const components = JSON.parse(await readFile(join(destination, 'components.json'), 'utf8'));
			expect(components.tailwind.baseColor).toBe(theme);

			const css = await readFile(join(destination, 'src/routes/layout.css'), 'utf8');
			expect(css).toContain(`/* shadcn-svelte Nova base color: ${theme} */`);
			expect(css).toContain(`--foreground: ${foregrounds[theme]};`);
			expect(css).not.toContain('__LIGHT_THEME_VARIABLES__');
			generatedStyles.add(css);
		}

		expect(generatedStyles.size).toBe(themes.length);
	}, 60_000);

	test('renders every shadcn-svelte icon-library choice into config, code, and dependencies', async () => {
		const root = await createTestRoot();
		const libraries = {
			lucide: '@lucide/svelte',
			tabler: '@tabler/icons-svelte',
			hugeicons: '@hugeicons/svelte',
			phosphor: 'phosphor-svelte',
			remixicon: 'remixicon-svelte'
		} as const satisfies Readonly<Record<IconLibraryId, string>>;

		for (const [iconLibrary, dependency] of Object.entries(libraries) as [
			IconLibraryId,
			string
		][]) {
			const destination = join(root, iconLibrary);
			const result = await generateWorkbench(destination, 'zinc', iconLibrary);
			if (!result.ok) throw new Error(`${iconLibrary}: ${JSON.stringify(result.error)}`);
			const components = JSON.parse(await readFile(join(destination, 'components.json'), 'utf8'));
			const packageJson = JSON.parse(await readFile(join(destination, 'package.json'), 'utf8'));
			const appIcon = await readFile(
				join(destination, 'src/lib/client/ui/components/app-icon.svelte'),
				'utf8'
			);
			expect(components.iconLibrary).toBe(iconLibrary);
			expect(packageJson.dependencies[dependency]).toBeString();
			expect(appIcon).toContain(dependency);
			if (iconLibrary === 'remixicon') {
				expect(appIcon).toContain(
					"import DashboardIcon from 'remixicon-svelte/icons/dashboard-line';"
				);
				expect(appIcon).not.toContain("from 'remixicon-svelte';");
			}
		}
	}, 60_000);

	generatedIntegrationTest(
		'installs, checks, tests, and builds the fresh Bun workbench',
		async () => {
			const destination = join(await createTestRoot(), 'generated workbench integration');
			const result = await generateWorkbench(destination);
			expect(result.ok).toBeTrue();
			if (!result.ok) throw new Error(JSON.stringify(result.error));

			const bunExecutable = process.env.METONIA_GENERATED_BUN_EXECUTABLE ?? 'bun';
			for (const arguments_ of [['install'], ['run', 'check'], ['run', 'test'], ['run', 'build']]) {
				const command = await runCommand(bunExecutable, arguments_, destination);
				if (command.exitCode !== 0) {
					console.info(
						`$ ${bunExecutable} ${arguments_.join(' ')}\n${command.stdout}\n${command.stderr}`
					);
				}
				expect(command.exitCode).toBe(0);
			}
			expect(await exists(join(destination, 'bun.lock'))).toBeTrue();
			expect(await exists(join(destination, 'build/index.js'))).toBeTrue();
		},
		180_000
	);

	generatedIconIntegrationTest(
		'checks and builds every non-default shadcn-svelte icon library',
		async () => {
			const root = await createTestRoot();
			const bunExecutable = process.env.METONIA_GENERATED_BUN_EXECUTABLE ?? 'bun';

			for (const iconLibrary of [
				'tabler',
				'hugeicons',
				'phosphor',
				'remixicon'
			] as const satisfies readonly IconLibraryId[]) {
				const destination = join(root, iconLibrary);
				const result = await generateWorkbench(destination, 'zinc', iconLibrary);
				expect(result.ok).toBeTrue();
				if (!result.ok) throw new Error(`${iconLibrary}: ${JSON.stringify(result.error)}`);

				for (const arguments_ of [
					['install'],
					['run', 'check'],
					['run', 'test'],
					['run', 'build']
				]) {
					const command = await runCommand(bunExecutable, arguments_, destination);
					if (command.exitCode !== 0) {
						console.info(
							`[${iconLibrary}] $ ${bunExecutable} ${arguments_.join(' ')}\n${command.stdout}\n${command.stderr}`
						);
					}
					expect(command.exitCode).toBe(0);
				}
			}
		},
		600_000
	);
});

function generateWorkbench(
	destination: string,
	theme: ThemeId = 'zinc',
	iconLibrary: IconLibraryId = 'lucide'
) {
	const config = resolveConfigOrThrow({
		projectName: 'metonia-workbench',
		packageManager: 'bun',
		ui: { adapter: 'shadcn-svelte', theme, iconLibrary },
		dataPattern: 'sveltekit-standard',
		docker: false,
		resources: { users: false }
	});
	return generateProject({
		config,
		destination,
		recipes: [
			createBaseRecipe(),
			createArchitectureRecipe(),
			createAdminCoreRecipe(),
			createShadcnSvelteUiRecipe(),
			createShadcnSvelteThemeRecipe(),
			createDocumentsRecipe()
		]
	});
}

interface CommandResult {
	exitCode: number;
	stderr: string;
	stdout: string;
}

function runCommand(
	executable: string,
	arguments_: readonly string[],
	cwd: string
): Promise<CommandResult> {
	return new Promise((resolveCommand, rejectCommand) => {
		const child = spawn(executable, arguments_, {
			cwd,
			shell: false,
			stdio: ['ignore', 'pipe', 'pipe'],
			windowsHide: true
		});
		let stdout = '';
		let stderr = '';
		let timedOut = false;
		const timeout = setTimeout(() => {
			timedOut = true;
			child.kill('SIGKILL');
		}, 120_000);
		child.stdout.setEncoding('utf8');
		child.stderr.setEncoding('utf8');
		child.stdout.on('data', (chunk: string) => (stdout += chunk));
		child.stderr.on('data', (chunk: string) => (stderr += chunk));
		child.once('error', (error) => {
			clearTimeout(timeout);
			rejectCommand(error);
		});
		child.once('close', (code) => {
			clearTimeout(timeout);
			resolveCommand({ exitCode: timedOut ? -1 : (code ?? -1), stderr, stdout });
		});
	});
}

async function createTestRoot(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'metonia-shadcn-recipe-test-'));
	temporaryRoots.push(root);
	return root;
}

async function removeTestRoot(root: string): Promise<void> {
	const resolvedRoot = resolve(root);
	if (
		relative(tmpdir(), resolvedRoot).startsWith('..') ||
		!basename(resolvedRoot).startsWith('metonia-shadcn-recipe-test-')
	) {
		throw new Error('Refusing to remove an unexpected recipe test root.');
	}
	await rm(resolvedRoot, { force: true, recursive: true });
}

async function exists(path: string): Promise<boolean> {
	try {
		await lstat(path);
		return true;
	} catch {
		return false;
	}
}
