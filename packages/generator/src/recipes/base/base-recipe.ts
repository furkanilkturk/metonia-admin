import { readdir } from 'node:fs/promises';

import { create } from 'sv';

import {
	getImplementedPackageManagerAdapter,
	packageManagerLockfiles
} from '../../adapters/package-managers/index.js';
import type { Recipe, RecipeContext } from '../../contracts/index.js';
import { readGeneratorAsset } from '../assets.js';
import { generatedToolVersions } from './versions.js';

const scaffoldDependencies = Object.freeze({
	'@sveltejs/adapter-auto': '^7.0.1',
	'@sveltejs/kit': '^2.63.0',
	'@sveltejs/vite-plugin-svelte': '^7.1.2',
	svelte: '^5.56.1',
	'svelte-check': '^4.6.0',
	typescript: '^6.0.3',
	vite: '^8.0.16'
});

const generatedScripts = Object.freeze({
	build: 'vite build',
	check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json',
	'check:watch': 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch',
	dev: 'vite dev',
	lint: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --threshold warning',
	prepare: 'svelte-kit sync',
	preview: 'vite preview',
	start: 'node build',
	test: 'vitest run'
});

const generatedDevDependencies = Object.freeze({
	'@sveltejs/adapter-node': generatedToolVersions.adapterNode,
	'@sveltejs/kit': generatedToolVersions.svelteKit,
	'@sveltejs/vite-plugin-svelte': generatedToolVersions.vitePluginSvelte,
	svelte: generatedToolVersions.svelte,
	'svelte-check': generatedToolVersions.svelteCheck,
	typescript: generatedToolVersions.typeScript,
	vite: generatedToolVersions.vite,
	vitest: generatedToolVersions.vitest
});

export function createBaseRecipe(): Recipe {
	return {
		id: 'sveltekit-base',
		stage: 'base',
		async apply(context) {
			const packageManager = getImplementedPackageManagerAdapter(context.config.packageManager);
			await assertEmptyStagingDirectory(context);
			create({
				cwd: context.stagingDirectory,
				name: context.config.projectName,
				template: 'minimal',
				types: 'typescript'
			});

			await assertExpectedScaffold(context);
			await context.writeFile(
				'package.json',
				renderPackageManifest(context.config.projectName, packageManager.packageManagerField)
			);
			await context.writeFile('vite.config.ts', await readCommonAsset('vite.config.ts'));
			await context.writeFile(
				'tests/base.test.ts',
				await readCommonAsset('tests/base-test.template')
			);
			for (const [path, contents] of Object.entries(packageManager.configurationFiles)) {
				await context.writeFile(path, contents);
			}
			if (packageManager.initialLockfileContents !== undefined) {
				await context.writeFile(packageManager.lockfile, packageManager.initialLockfileContents);
			}

			for (const [name, command] of Object.entries(generatedScripts)) {
				context.addScript({ command, name });
			}
			for (const [name, version] of Object.entries(generatedDevDependencies)) {
				context.addDependency({ kind: 'devDependencies', name, version });
			}
			for (const [key, value] of Object.entries(generatedToolVersions)) {
				context.addDocumentFact({ key: `version.${key}`, value });
			}
			context.addDocumentFact({ key: 'packageManager', value: packageManager.id });
			context.addDocumentFact({
				key: 'packageManager.field',
				value: packageManager.packageManagerField
			});
			context.addDocumentFact({ key: 'packageManager.lockfile', value: packageManager.lockfile });
			context.addDocumentFact({ key: 'packageManager.version', value: packageManager.version });

			context.addCheck({
				id: 'base-pinned-sveltekit',
				validate: validatePinnedBase
			});
		}
	};
}

async function assertEmptyStagingDirectory(context: RecipeContext): Promise<void> {
	if ((await readdir(context.stagingDirectory)).length !== 0) {
		throw new Error('The SvelteKit base recipe requires an empty owned staging directory.');
	}
}

async function assertExpectedScaffold(context: RecipeContext): Promise<void> {
	if (
		!(await context.exists('package.json')) ||
		!(await context.exists('vite.config.ts')) ||
		(await context.exists('svelte.config.js')) ||
		(await context.exists('svelte.config.ts'))
	) {
		throw new Error('sv produced an unexpected configuration layout.');
	}

	const packageJson = parseJsonObject(await context.readFile('package.json'));
	const dependencies = getStringRecord(packageJson.devDependencies);
	if (
		packageJson.name !== context.config.projectName ||
		Object.entries(scaffoldDependencies).some(([name, version]) => dependencies[name] !== version)
	) {
		throw new Error('sv produced dependency metadata that does not match the pinned scaffold.');
	}

	const viteConfig = await context.readFile('vite.config.ts');
	if (
		!viteConfig.includes("import adapter from '@sveltejs/adapter-auto';") ||
		!viteConfig.includes('sveltekit({')
	) {
		throw new Error('sv produced an unexpected active Vite configuration.');
	}
}

function renderPackageManifest(projectName: string, packageManagerField: string): string {
	return `${JSON.stringify(
		{
			name: projectName,
			private: true,
			version: '0.0.1',
			type: 'module',
			packageManager: packageManagerField,
			engines: { node: '^22.22.2 || ^24.15.0 || >=26.0.0' },
			scripts: generatedScripts,
			devDependencies: generatedDevDependencies
		},
		null,
		'\t'
	)}\n`;
}

async function validatePinnedBase(context: RecipeContext): Promise<void> {
	const packageManager = getImplementedPackageManagerAdapter(context.config.packageManager);
	const packageJson = parseJsonObject(await context.readFile('package.json'));
	const scripts = getStringRecord(packageJson.scripts);
	const devDependencies = getStringRecord(packageJson.devDependencies);
	if (
		packageJson.packageManager !== packageManager.packageManagerField ||
		Object.entries(generatedScripts).some(([name, command]) => scripts[name] !== command) ||
		Object.entries(generatedDevDependencies).some(
			([name, version]) => devDependencies[name] !== version
		) ||
		'@sveltejs/adapter-auto' in devDependencies
	) {
		throw new Error('The generated package manifest is not pinned to the supported base set.');
	}

	const viteConfig = await context.readFile('vite.config.ts');
	if (
		!viteConfig.includes("import adapter from '@sveltejs/adapter-node';") ||
		viteConfig.includes('@sveltejs/adapter-auto')
	) {
		throw new Error('The active Vite configuration does not use adapter-node.');
	}

	if (packageManager.initialLockfileContents !== undefined) {
		if (
			!(await context.exists(packageManager.lockfile)) ||
			(await context.readFile(packageManager.lockfile)) !== packageManager.initialLockfileContents
		) {
			throw new Error('The package-manager project-boundary lockfile is missing or invalid.');
		}
	}
	for (const [path, contents] of Object.entries(packageManager.configurationFiles)) {
		if (!(await context.exists(path)) || (await context.readFile(path)) !== contents) {
			throw new Error('The package-manager project configuration is missing or invalid.');
		}
	}
	const packageManagerConfigurationFiles = ['pnpm-workspace.yaml', '.yarnrc.yml'];
	const forbiddenFiles = [
		...packageManagerLockfiles.filter(
			(lockfile) =>
				lockfile !== packageManager.lockfile || packageManager.initialLockfileContents === undefined
		),
		...packageManagerConfigurationFiles.filter(
			(path) => !(path in packageManager.configurationFiles)
		),
		'svelte.config.js',
		'svelte.config.ts'
	];
	if ((await Promise.all(forbiddenFiles.map((path) => context.exists(path)))).some(Boolean)) {
		throw new Error('The no-install base unexpectedly contains a lockfile or ignored config.');
	}
}

async function readCommonAsset(name: string): Promise<string> {
	return readGeneratorAsset(`common/${name}`);
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
