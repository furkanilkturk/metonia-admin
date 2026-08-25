/// <reference types="bun" />

import { afterEach, describe, expect, test } from 'bun:test';
import { lstat, mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { basename, delimiter, dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import {
	renderGeneratedConfigModule,
	resolveConfigOrThrow,
	type PackageManagerId,
	type ResolvedConfig
} from '@metonia-admin/registry';
import crossSpawn from 'cross-spawn';

import {
	formatPackageManagerCommand,
	getPackageManagerAdapter
} from './adapters/package-managers/index.js';
import type { Recipe } from './contracts/index.js';
import { generateProject } from './core/index.js';
import { createBunRecipePlan, createRecipePlan, generateConfiguredProject } from './recipe-plan.js';

const temporaryRoots: string[] = [];
const generatedIntegrationTest =
	process.env.METONIA_RUN_GENERATED_PACKAGE_MANAGER_INTEGRATION === '1' ? test : test.skip;
const implementedPackageManagers = ['bun', 'npm', 'pnpm', 'yarn'] as const;

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map(removeTestRoot));
}, 60_000);

describe('generated-project package-manager recipe plan', () => {
	for (const packageManager of implementedPackageManagers) {
		test(`generates a real no-install ${packageManager} project`, async () => {
			const parent = join(await createTestRoot(), 'parent with spaces ü');
			await mkdir(parent);
			const destination = join(parent, `${packageManager} base proof`);
			const config = baseProofConfig(`${packageManager}-proof`, packageManager);
			const result = await generateConfiguredProject({
				config,
				destination,
				install: false,
				git: false
			});

			expect(result.ok).toBeTrue();
			if (!result.ok) throw new Error(JSON.stringify(result.error));
			expect(
				result.stages.filter((stage) => stage.recipeId).map((stage) => stage.recipeId)
			).toEqual([
				'sveltekit-base',
				'metonia-architecture',
				'admin-core',
				'ui-shadcn-svelte',
				'theme-shadcn-svelte',
				'data-pattern-sveltekit-standard',
				'validation-zod',
				'orm-drizzle',
				'database-postgresql-generic-pg',
				'generated-documents'
			]);
			const adapter = getPackageManagerAdapter(packageManager);
			expect(result.facts.documentFacts).toMatchObject({
				'architecture.boundaries': 'client -> shared <- server',
				'architecture.ui': 'components -> views -> pages -> routes',
				'command.install': formatPackageManagerCommand(adapter.installCommand),
				packageManager,
				'packageManager.field': adapter.packageManagerField,
				'packageManager.lockfile': adapter.lockfile,
				'security.authentication': 'deferred',
				'version.adapterNode': '5.5.7',
				'version.svelte': '5.56.10',
				'version.svelteKit': '2.70.3',
				'version.sv': '0.17.0'
			});

			const files = await generatedFiles(destination);
			for (const path of expectedGeneratedFiles) expect(files).toContain(path);
			for (const path of Object.keys(adapter.configurationFiles)) expect(files).toContain(path);
			expect(files).toContain('src/lib/client/ui/pages/dashboard.svelte');
			expect(files).toContain('src/lib/server/db/schema/index.ts');
			expect(files).not.toContain('src/lib/server/db/schema/users.ts');
			expect(files).not.toContain('src/routes/(admin)/users/+page.svelte');
			await expectGeneratedContracts(destination, config);
		}, 30_000);
	}

	test('keeps Deno fail-closed until its complete hybrid matrix passes', () => {
		const config = unavailableDenoConfig('deno-unavailable');
		expect(() => createRecipePlan(config)).toThrow(
			'complete shadcn-svelte, Drizzle, PostgreSQL, adapter-node, and Docker matrix'
		);
		expect(() => createBunRecipePlan(config)).toThrow('Bun recipe plan');
	});

	test('composes implemented variations and keeps unsupported crossings closed', () => {
		expect(
			createBunRecipePlan(baseProofConfig('remote', 'bun', { remote: true })).recipes.map(
				({ id }) => id
			)
		).toContain('data-pattern-sveltekit-remote-functions');
		expect(
			createBunRecipePlan(baseProofConfig('docker', 'bun', { docker: true })).recipes.map(
				({ id }) => id
			)
		).toContain('docker-container');
		expect(
			createBunRecipePlan(baseProofConfig('users', 'bun', { users: true })).recipes.map(
				({ id }) => id
			)
		).toContain('resource-users');

		expect(() => createRecipePlan(remoteUsersConfig('remote-users'))).toThrow(
			'does not implement Users CRUD parity'
		);
		for (const packageManager of implementedPackageManagers) {
			expect(
				createRecipePlan(
					baseProofConfig(`${packageManager}-docker`, packageManager, { docker: true })
				).recipes.map(({ id }) => id)
			).toContain('docker-container');
		}

		const zinc = baseProofConfig('neutral-theme');
		const neutralTheme = {
			...zinc,
			ui: { ...zinc.ui, theme: 'neutral' }
		} as ResolvedConfig;
		expect(createRecipePlan(neutralTheme).recipes.map(({ id }) => id)).toContain(
			'theme-shadcn-svelte'
		);
	});

	test('generates the integrated experimental Remote query proof without Users', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'remote proof');
		const config = baseProofConfig('remote-proof', 'bun', { remote: true });
		const result = await generateConfiguredProject({
			config,
			destination,
			install: false,
			git: false
		});

		expect(result.ok).toBeTrue();
		if (!result.ok) throw new Error(JSON.stringify(result.error));
		expect(result.facts.documentFacts).toMatchObject({
			'dataPattern.remoteFunctions.scope':
				'query boundary proof only; Users CRUD parity is unavailable',
			'dataPattern.remoteFunctions.status': 'experimental'
		});
		expect(
			await exists(
				join(destination, 'src/routes/(admin)/remote-boundary/remote-boundary.remote.ts')
			)
		).toBeTrue();
		expect(await exists(join(destination, 'src/routes/(admin)/users/+page.svelte'))).toBeFalse();
		const docs = `${await readFile(join(destination, 'README.md'), 'utf8')}\n${await readFile(
			join(destination, 'AGENTS.md'),
			'utf8'
		)}`;
		expect(docs).toContain('Experimental');
		expect(docs).toContain('.remote.ts');
		expect(docs).toContain('query proof');
		expect(docs).toContain('roll back');
	}, 30_000);

	test('configured generation rejects unavailable plans before filesystem writes', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'must remain absent');
		const result = await generateConfiguredProject({
			config: unavailableDenoConfig('unsupported-manager'),
			destination,
			install: false,
			git: false
		});

		expect(result).toMatchObject({
			ok: false,
			error: {
				code: 'PACKAGE_MANAGER_NOT_IMPLEMENTED',
				stage: 'resolve-plan'
			}
		});
		expect(await exists(destination)).toBeFalse();
		expect(await readdir(root)).toEqual([]);
	});

	test('preflights unsupported feature crossings before creating staging output', async () => {
		const root = await createTestRoot();
		const cases: readonly [ResolvedConfig, string][] = [
			[remoteUsersConfig('remote-users'), 'USERS_RESOURCE_NOT_IMPLEMENTED']
		];

		for (const [config, code] of cases) {
			const destination = join(root, config.projectName);
			const result = await generateConfiguredProject({
				config,
				destination,
				install: false,
				git: false
			});
			expect(result).toMatchObject({ ok: false, error: { code, stage: 'resolve-plan' } });
			expect(await exists(destination)).toBeFalse();
		}
		expect(await readdir(root)).toEqual([]);
	});

	test('cleans the complete sv scaffold when a later recipe fails', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'failed-project');
		const config = baseProofConfig('failed-project');
		const plan = createBunRecipePlan(config);
		const injectedFailure: Recipe = {
			id: 'injected-later-failure',
			stage: 'admin-core',
			apply() {
				throw new Error('private diagnostic');
			}
		};
		const result = await generateProject({
			config,
			destination,
			recipes: [...plan.recipes, injectedFailure]
		});

		expect(result).toMatchObject({
			ok: false,
			error: {
				code: 'RECIPE_FAILED',
				recipeId: 'injected-later-failure',
				stage: 'run-recipes'
			}
		});
		expect(JSON.stringify(result)).not.toContain('private diagnostic');
		expect(await exists(destination)).toBeFalse();
		expect((await readdir(root)).some((entry) => entry.includes('.metonia-staging-'))).toBeFalse();
	});

	for (const packageManager of implementedPackageManagers) {
		generatedIntegrationTest(
			`installs, freezes, checks, tests, and builds a fresh ${packageManager} project`,
			async () => {
				const destination = join(await createTestRoot(), `${packageManager} integration`);
				const config = baseProofConfig(`${packageManager}-integration`, packageManager);
				const plan = createRecipePlan(config);
				const result = await generateProject({ config, destination, recipes: plan.recipes });
				expect(result.ok).toBeTrue();

				const executable = executableFor(
					packageManager,
					plan.packageManagerAdapter.installCommand.executable
				);
				const records: CommandRecord[] = [];
				records.push(await runCommand(destination, [executable, '--version']));
				records.push(
					await runCommand(destination, [
						process.env.METONIA_GENERATED_NODE_EXECUTABLE ?? 'node',
						'--version'
					])
				);
				records.push(
					await runCommand(destination, [
						executable,
						...plan.packageManagerAdapter.installCommand.arguments
					])
				);
				records.push(
					await runCommand(destination, [
						executable,
						...plan.packageManagerAdapter.frozenInstallCommand.arguments
					])
				);
				for (const script of ['check', 'test', 'build']) {
					const command = plan.packageManagerAdapter.run(script);
					records.push(await runCommand(destination, [executable, ...command.arguments]));
				}

				console.info(
					`generated-package-manager-gate\nos=${process.platform}\narch=${process.arch}\nnode=${process.version}\ndestination=${destination}\n${formatCommandRecords(records)}`
				);
				for (const record of records) expect(record.exitCode).toBe(0);
				expect(records[0]?.stdout.trim()).toBe(plan.packageManagerAdapter.version);
				expect(await exists(join(destination, plan.packageManagerAdapter.lockfile))).toBeTrue();
				expect(await exists(join(destination, 'build', 'index.js'))).toBeTrue();
			},
			600_000
		);
	}
});

const expectedGeneratedFiles = [
	'.env.example',
	'.gitignore',
	'.npmrc',
	'.vscode/extensions.json',
	'AGENTS.md',
	'README.md',
	'metonia-admin.config.ts',
	'package.json',
	'src/app.d.ts',
	'src/app.html',
	'src/lib/assets/favicon.svg',
	'src/lib/client/index.ts',
	'src/lib/client/ui/components/index.ts',
	'src/lib/client/ui/pages/ProjectHomePage.svelte',
	'src/lib/client/ui/views/index.ts',
	'src/lib/index.ts',
	'src/lib/server/index.ts',
	'src/lib/shared/index.ts',
	'src/routes/+layout.svelte',
	'src/routes/+page.svelte',
	'static/robots.txt',
	'tests/base.test.ts',
	'tsconfig.json',
	'vite.config.ts'
].sort((left, right) => left.localeCompare(right));

async function expectGeneratedContracts(
	destination: string,
	config: ResolvedConfig
): Promise<void> {
	const packageJson = JSON.parse(await readFile(join(destination, 'package.json'), 'utf8')) as {
		dependencies: Record<string, string>;
		devDependencies: Record<string, string>;
		packageManager: string;
		scripts: Record<string, string>;
	};
	const packageManager = getPackageManagerAdapter(config.packageManager);
	expect(packageJson.packageManager).toBe(packageManager.packageManagerField);
	expect(packageJson.dependencies).toMatchObject({
		'drizzle-orm': '0.45.2',
		pg: '8.23.0',
		zod: '4.4.3'
	});
	expect(packageJson.devDependencies).toMatchObject({
		'@sveltejs/adapter-node': '5.5.7',
		'@sveltejs/kit': '2.70.3',
		'@sveltejs/vite-plugin-svelte': '7.1.2',
		'@tailwindcss/vite': '4.3.0',
		'drizzle-kit': '0.31.10',
		'shadcn-svelte': '1.5.0',
		svelte: '5.56.10',
		'svelte-check': '4.6.0',
		typescript: '6.0.3',
		vite: '8.0.16',
		vitest: '4.1.11'
	});
	expect(packageJson.scripts).toMatchObject({
		build: 'vite build',
		check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json',
		dev: 'vite dev',
		lint: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --threshold warning',
		test: 'vitest run'
	});
	expect(Object.keys(packageJson.devDependencies)).not.toContain('@metonia-admin/generator');
	expect(Object.keys(packageJson.devDependencies)).not.toContain('@sveltejs/adapter-auto');

	const viteConfig = await readFile(join(destination, 'vite.config.ts'), 'utf8');
	expect(viteConfig).toContain("import adapter from '@sveltejs/adapter-node';");
	expect(viteConfig).not.toContain('@sveltejs/adapter-auto');
	expect(await exists(join(destination, 'svelte.config.js'))).toBeFalse();
	expect(await exists(join(destination, 'svelte.config.ts'))).toBeFalse();

	const route = await readFile(join(destination, 'src/routes/+page.svelte'), 'utf8');
	expect(route).toContain(
		"import ProjectHomePage from '$lib/client/ui/pages/ProjectHomePage.svelte';"
	);
	expect(route).toContain(`<ProjectHomePage projectName="${config.projectName}" />`);
	expect(route).not.toMatch(/<(?:main|section|h1)\b/);

	const configModule = await readFile(join(destination, 'metonia-admin.config.ts'), 'utf8');
	expect(configModule).toBe(renderGeneratedConfigModule(config));
	expect(configModule).not.toMatch(/^\s*import\s/m);
	const docs = `${await readFile(join(destination, 'README.md'), 'utf8')}\n${await readFile(
		join(destination, 'AGENTS.md'),
		'utf8'
	)}`;
	expect(docs).toContain(config.projectName);
	expect(docs).toContain(config.ui.adapter);
	expect(docs).toContain(config.ui.theme);
	expect(docs).toContain(config.dataPattern);
	expect(docs).toContain(formatPackageManagerCommand(packageManager.installCommand));
	expect(docs).toContain(formatPackageManagerCommand(packageManager.run('check')));
	expect(docs).toContain('not production-secure');
	for (const foreign of [...implementedPackageManagers, 'deno'] as const) {
		if (foreign === config.packageManager) continue;
		const foreignAdapter = getPackageManagerAdapter(foreign);
		expect(
			containsCommand(docs, formatPackageManagerCommand(foreignAdapter.installCommand))
		).toBeFalse();
		expect(
			containsCommand(docs, formatPackageManagerCommand(foreignAdapter.run('check')))
		).toBeFalse();
	}

	for (const path of [
		'Dockerfile',
		'.dockerignore',
		'compose.yaml',
		'docker-compose.yml',
		'bun.lock',
		'bun.lockb',
		'package-lock.json',
		'pnpm-lock.yaml',
		'yarn.lock',
		'deno.lock'
	]) {
		if (path === packageManager.lockfile && packageManager.initialLockfileContents !== undefined) {
			expect(await readFile(join(destination, path), 'utf8')).toBe(
				packageManager.initialLockfileContents
			);
			continue;
		}
		expect(await exists(join(destination, path))).toBeFalse();
	}
	for (const [path, contents] of Object.entries(packageManager.configurationFiles)) {
		expect(await readFile(join(destination, path), 'utf8')).toBe(contents);
	}
}

function baseProofConfig(
	projectName: string,
	packageManager: PackageManagerId = 'bun',
	features: { docker?: boolean; remote?: boolean; users?: boolean } = {}
): ResolvedConfig {
	return resolveConfigOrThrow({
		schemaVersion: 1,
		projectName,
		packageManager,
		ui: { adapter: 'shadcn-svelte', theme: 'zinc', iconLibrary: 'lucide' },
		dataPattern: features.remote ? 'sveltekit-remote-functions' : 'sveltekit-standard',
		validation: 'zod',
		orm: 'drizzle',
		database: { dialect: 'postgresql', provider: 'generic', driver: 'pg' },
		docker: features.docker ?? false,
		resources: { users: features.users ?? false }
	});
}

function unavailableDenoConfig(projectName: string): ResolvedConfig {
	return { ...baseProofConfig(projectName), packageManager: 'deno' };
}

function remoteUsersConfig(projectName: string): ResolvedConfig {
	const config = baseProofConfig(projectName);
	return {
		...config,
		dataPattern: 'sveltekit-remote-functions',
		resources: { users: true }
	};
}

async function generatedFiles(root: string): Promise<string[]> {
	const entries = await readdir(root, { recursive: true, withFileTypes: true });
	return entries
		.filter((entry) => entry.isFile())
		.map((entry) => relative(root, join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
		.sort((left, right) => left.localeCompare(right));
}

interface CommandRecord {
	command: string;
	exitCode: number;
	stderr: string;
	stdout: string;
}

async function runCommand(cwd: string, command: string[]): Promise<CommandRecord> {
	const selectedPath = [
		dirname(command[0] ?? globalThis.process.execPath),
		globalThis.process.env.METONIA_GENERATED_NODE_DIRECTORY,
		globalThis.process.env.PATH
	]
		.filter((entry): entry is string => entry !== undefined && entry.length > 0)
		.join(delimiter);
	return new Promise((resolveCommand, rejectCommand) => {
		const child = crossSpawn(command[0] ?? '', command.slice(1), {
			cwd,
			env: { ...globalThis.process.env, PATH: selectedPath },
			shell: false,
			stdio: ['ignore', 'pipe', 'pipe'],
			windowsHide: true
		});
		let stdout = '';
		let stderr = '';
		child.stdout?.setEncoding('utf8');
		child.stderr?.setEncoding('utf8');
		child.stdout?.on('data', (chunk: string) => (stdout += chunk));
		child.stderr?.on('data', (chunk: string) => (stderr += chunk));
		child.once('error', rejectCommand);
		child.once('close', (code) => {
			resolveCommand({ command: command.join(' '), exitCode: code ?? -1, stderr, stdout });
		});
	});
}

function executableFor(packageManager: PackageManagerId, fallback: string): string {
	const key = `METONIA_GENERATED_${packageManager.toUpperCase()}_EXECUTABLE`;
	return process.env[key] ?? fallback;
}

function containsCommand(document: string, command: string): boolean {
	const escaped = command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp(`(?:^|[^A-Za-z0-9])${escaped}(?:$|\\s)`, 'm').test(document);
}

function formatCommandRecords(records: readonly CommandRecord[]): string {
	return records
		.map(
			(record) =>
				`$ ${record.command}\nexit=${record.exitCode}\nstdout:\n${record.stdout.trim()}\nstderr:\n${record.stderr.trim()}`
		)
		.join('\n\n');
}

async function createTestRoot(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'metonia-recipe-plan-test-'));
	temporaryRoots.push(root);
	return root;
}

async function removeTestRoot(root: string): Promise<void> {
	const resolvedRoot = resolve(root);
	if (relative(tmpdir(), resolvedRoot).startsWith('..') || !basenameMatches(resolvedRoot)) {
		throw new Error('Refusing to remove an unexpected test root.');
	}
	await rm(resolvedRoot, { force: true, recursive: true });
}

function basenameMatches(path: string): boolean {
	return basename(path).startsWith('metonia-recipe-plan-test-');
}

async function exists(path: string): Promise<boolean> {
	try {
		await lstat(path);
		return true;
	} catch {
		return false;
	}
}
