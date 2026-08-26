/// <reference types="bun" />

import { afterEach, describe, expect, test } from 'bun:test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as delay } from 'node:timers/promises';

import { resolveConfig, type ResolvedConfig } from '@metonia-admin/registry';

import type { Recipe, StagedValidator } from '../contracts/index.js';
import { generateProject } from './generate-project.js';

const temporaryRoots: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map(removeTestRoot));
});

describe('generateProject', () => {
	test('publishes a staged project to paths containing spaces and Unicode', async () => {
		const parent = join(await createTestRoot(), 'parent with spaces', 'üretim');
		await mkdir(parent, { recursive: true });
		const destination = join(parent, 'my admin ü');
		const validator: StagedValidator = {
			id: 'contains-readme',
			async validate(context) {
				expect(await context.readFile('README.md')).toBe('# Admin');
			}
		};
		const result = await generateProject({
			config: testConfig(),
			destination,
			recipes: [
				{
					id: 'documents',
					stage: 'documents',
					async apply(context) {
						await context.writeFile('README.md', '# Admin');
						context.addDependency({ kind: 'dependencies', name: 'zod', version: '^4.0.0' });
						context.addDependency({
							kind: 'devDependencies',
							name: 'typescript',
							version: '^6.0.0'
						});
						context.addScript({ command: 'svelte-kit sync', name: 'prepare' });
						context.addDocumentFact({ key: 'packageManager', value: 'bun' });
						context.addCheck(validator);
					}
				}
			]
		});

		expect(result.ok).toBeTrue();
		if (result.ok) {
			expect(result.facts).toEqual({
				checks: ['contains-readme'],
				dependencies: {
					dependencies: { zod: '^4.0.0' },
					devDependencies: { typescript: '^6.0.0' }
				},
				documentFacts: { packageManager: 'bun' },
				scripts: { prepare: 'svelte-kit sync' }
			});
		}
		expect(await readFile(join(destination, 'README.md'), 'utf8')).toBe('# Admin');
	});

	test('orders recipes by stable stage and then id', async () => {
		const sequence: string[] = [];
		const recipes: Recipe[] = [
			recipe('z-documents', 'documents', sequence),
			recipe('b-base', 'base', sequence),
			recipe('a-base', 'base', sequence),
			recipe('architecture', 'architecture', sequence)
		];
		const result = await generateProject({
			config: testConfig(),
			destination: join(await createTestRoot(), 'out'),
			recipes
		});

		expect(result.ok).toBeTrue();
		expect(sequence).toEqual(['a-base', 'b-base', 'architecture', 'z-documents']);
	});

	test('rejects traversal attempts and leaves no destination', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'out');
		const result = await generateProject({
			config: testConfig(),
			destination,
			recipes: [
				{
					id: 'escape',
					stage: 'base',
					async apply(context) {
						await context.writeFile('../outside.txt', 'no');
					}
				}
			]
		});

		expect(result).toMatchObject({
			ok: false,
			error: { code: 'RECIPE_FAILED', recipeId: 'escape', stage: 'run-recipes' }
		});
		expect(await exists(destination)).toBeFalse();
		expect(await exists(join(root, 'outside.txt'))).toBeFalse();
	});

	test('rejects symlink traversal through the staged tree', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'out');
		const outside = join(root, 'outside');
		await mkdir(outside);
		const result = await generateProject({
			config: testConfig(),
			destination,
			recipes: [
				{
					id: 'symlink-escape',
					stage: 'base',
					async apply(context) {
						await symlink(outside, context.pathFor('linked'), 'junction');
						await context.writeFile('linked/outside.txt', 'no');
					}
				}
			]
		});

		expect(result).toMatchObject({
			ok: false,
			error: { code: 'RECIPE_FAILED', recipeId: 'symlink-escape', stage: 'run-recipes' }
		});
		expect(await exists(destination)).toBeFalse();
		expect(await exists(join(outside, 'outside.txt'))).toBeFalse();
	});

	test('rejects destination parents reached through a symlink', async () => {
		const root = await createTestRoot();
		const actualParent = join(root, 'actual-parent');
		const linkedParent = join(root, 'linked-parent');
		await mkdir(join(actualParent, 'nested'), { recursive: true });
		await symlink(actualParent, linkedParent, 'junction');
		const result = await generateProject({
			config: testConfig(),
			destination: join(linkedParent, 'nested', 'out'),
			recipes: [writeRecipe('base')]
		});

		expect(result).toMatchObject({
			ok: false,
			error: { code: 'INVALID_DESTINATION', stage: 'validate-destination' }
		});
		expect(await exists(join(actualParent, 'nested', 'out'))).toBeFalse();
	});

	test('contains injected recipe and staged-validator failures', async () => {
		const root = await createTestRoot();
		const recipeFailure = await generateProject({
			config: testConfig(),
			destination: join(root, 'recipe-failure'),
			recipes: [
				{
					id: 'throws-secret',
					stage: 'base',
					apply() {
						throw new Error('DATABASE_URL=secret-value');
					}
				}
			]
		});
		const validatorFailure = await generateProject({
			config: testConfig(),
			destination: join(root, 'validator-failure'),
			recipes: [writeRecipe('base')],
			validators: [
				{
					id: 'throws-secret',
					validate() {
						throw new Error('DATABASE_URL=secret-value');
					}
				}
			]
		});

		expect(recipeFailure).toMatchObject({
			ok: false,
			error: { code: 'RECIPE_FAILED', stage: 'run-recipes' }
		});
		expect(validatorFailure).toMatchObject({
			ok: false,
			error: { checkId: 'throws-secret', code: 'VALIDATION_FAILED', stage: 'validate-staging' }
		});
		expect(JSON.stringify([recipeFailure, validatorFailure])).not.toContain('secret-value');
		expect(await exists(join(root, 'recipe-failure'))).toBeFalse();
		expect(await exists(join(root, 'validator-failure'))).toBeFalse();
	});

	test('leaves existing non-empty destinations untouched', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'existing');
		await mkdir(destination);
		await writeFile(join(destination, 'keep.txt'), 'keep');
		const result = await generateProject({
			config: testConfig(),
			destination,
			recipes: [writeRecipe('base')]
		});

		expect(result).toMatchObject({
			ok: false,
			error: { code: 'DESTINATION_EXISTS', stage: 'validate-destination' }
		});
		expect(await readFile(join(destination, 'keep.txt'), 'utf8')).toBe('keep');
	});

	test('publishes safely into an existing empty destination', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'empty');
		await mkdir(destination);
		const result = await generateProject({
			config: testConfig(),
			destination,
			recipes: [writeRecipe('base')]
		});

		expect(result.ok).toBeTrue();
		expect(await readFile(join(destination, 'generated.txt'), 'utf8')).toBe('generated');
	});

	test('restores an existing empty destination after a publication conflict', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'empty');
		await mkdir(destination);
		const result = await generateProject({
			config: testConfig(),
			destination,
			recipes: [writeRecipe('base')],
			validators: [
				{
					id: 'inject-publication-conflict',
					async validate() {
						await writeFile(join(destination, 'generated.txt'), 'external');
					}
				}
			]
		});

		expect(result).toMatchObject({
			ok: false,
			error: {
				code: 'FINALIZATION_FAILED',
				message: expect.stringContaining('Close tools watching the destination'),
				stage: 'finalize'
			}
		});
		expect(await readFile(join(destination, 'generated.txt'), 'utf8')).toBe('external');
	});

	test('runs install and Git operations inside staging before publication', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'published project');
		const invocations: Array<{ arguments: readonly string[]; cwd: string; executable: string }> =
			[];
		const result = await generateProject(
			{
				config: testConfig(),
				destination,
				operations: {
					install: { executable: 'bun', arguments: ['install'] },
					initializeGit: { executable: 'git', arguments: ['init', '--quiet'] }
				},
				recipes: [writeRecipe('base')]
			},
			{
				runCommand: async (invocation) => {
					invocations.push(invocation);
					expect(invocation.cwd).not.toBe(destination);
					expect(dirname(invocation.cwd)).not.toBe(dirname(destination));
					expect(basename(invocation.cwd)).toContain('.metonia-staging-');
					return 0;
				}
			}
		);

		expect(result.ok).toBeTrue();
		expect(invocations.map(({ executable, arguments: args }) => [executable, ...args])).toEqual([
			['bun', 'install'],
			['git', 'init', '--quiet']
		]);
		expect(result.stages.map(({ stage }) => stage)).toContain('install-dependencies');
		expect(result.stages.map(({ stage }) => stage)).toContain('initialize-git');
		expect(await readFile(join(destination, 'generated.txt'), 'utf8')).toBe('generated');
	});

	test('reports high-level lifecycle progress without exposing recipe-level churn', async () => {
		const events: string[] = [];
		const result = await generateProject(
			{
				config: testConfig(),
				destination: join(await createTestRoot(), 'progress project'),
				operations: {
					install: { executable: 'bun', arguments: ['install'] },
					initializeGit: { executable: 'git', arguments: ['init'] }
				},
				recipes: [writeRecipe('first'), writeRecipe('second')]
			},
			{
				runCommand: async () => 0,
				onProgress: ({ stage, status }) => events.push(`${status}:${stage}`)
			}
		);

		expect(result.ok).toBeTrue();
		expect(events).toEqual([
			'started:validate-destination',
			'completed:validate-destination',
			'started:create-staging',
			'completed:create-staging',
			'started:run-recipes',
			'completed:run-recipes',
			'started:validate-staging',
			'completed:validate-staging',
			'started:install-dependencies',
			'completed:install-dependencies',
			'started:initialize-git',
			'completed:initialize-git',
			'started:finalize',
			'completed:finalize'
		]);
	});

	test('keeps same-filesystem staging outside the destination workspace', async () => {
		const root = await createTestRoot();
		const workspace = join(root, 'open editor workspace');
		const destination = join(workspace, 'generated project');
		await mkdir(workspace);
		let observedStaging = '';

		const result = await generateProject(
			{
				config: testConfig(),
				destination,
				operations: { install: { executable: 'bun', arguments: ['install'] } },
				recipes: [writeRecipe('base')]
			},
			{
				runCommand: async ({ cwd }) => {
					observedStaging = cwd;
					expect(relative(workspace, cwd).startsWith('..')).toBeTrue();
					expect(
						(await readdir(workspace)).some((entry) => entry.includes('.metonia-staging-'))
					).toBeFalse();
					return 0;
				}
			}
		);

		expect(result.ok).toBeTrue();
		expect(observedStaging).not.toBe('');
		expect(await exists(observedStaging)).toBeFalse();
		expect(await readFile(join(destination, 'generated.txt'), 'utf8')).toBe('generated');
	});

	test('avoids Windows editor locks on a staging directory discovered inside the workspace', async () => {
		if (process.platform !== 'win32') return;

		const root = await createTestRoot();
		const workspace = join(root, 'watched workspace');
		const destination = join(workspace, 'generated project');
		await mkdir(workspace);
		let editorWorker: ReturnType<typeof spawn> | undefined;
		let result: Awaited<ReturnType<typeof generateProject>>;

		try {
			result = await generateProject(
				{
					config: testConfig(),
					destination,
					operations: { install: { executable: 'bun', arguments: ['install'] } },
					recipes: [writeRecipe('base')]
				},
				{
					runCommand: async () => {
						const stagingEntry = (await readdir(workspace)).find((entry) =>
							entry.includes('.metonia-staging-')
						);
						if (stagingEntry !== undefined) {
							editorWorker = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
								cwd: join(workspace, stagingEntry),
								stdio: 'ignore',
								windowsHide: true
							});
							await once(editorWorker, 'spawn');
						}
						return 0;
					}
				}
			);
		} finally {
			if (editorWorker !== undefined && editorWorker.exitCode === null) {
				editorWorker.kill();
				await Promise.race([once(editorWorker, 'exit'), delay(2_000)]);
			}
		}

		expect(editorWorker).toBeUndefined();
		expect(result!.ok).toBeTrue();
		expect(await readFile(join(destination, 'generated.txt'), 'utf8')).toBe('generated');
	});

	for (const operation of ['install', 'git'] as const) {
		test(`${operation} failure removes staging and leaves an existing empty destination unchanged`, async () => {
			const root = await createTestRoot();
			const destination = join(root, 'existing empty');
			await mkdir(destination);
			const result = await generateProject(
				{
					config: testConfig(),
					destination,
					operations:
						operation === 'install'
							? { install: { executable: 'bun', arguments: ['install'] } }
							: { initializeGit: { executable: 'git', arguments: ['init'] } },
					recipes: [writeRecipe('base')]
				},
				{
					runCommand: async () => {
						throw new Error('DATABASE_URL=secret-from-command');
					}
				}
			);

			expect(result).toMatchObject({
				ok: false,
				error: {
					code: operation === 'install' ? 'INSTALL_FAILED' : 'GIT_INIT_FAILED',
					stage: operation === 'install' ? 'install-dependencies' : 'initialize-git'
				}
			});
			expect(JSON.stringify(result)).not.toContain('secret-from-command');
			expect(await readdir(destination)).toEqual([]);
			expect(
				(await readdir(root)).some((entry) => entry.includes('.metonia-staging-'))
			).toBeFalse();
		});
	}

	test('terminates a timed-out production command and removes unpublished output', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'timed out');
		const result = await generateProject(
			{
				config: testConfig(),
				destination,
				operations: {
					install: {
						executable: process.execPath,
						arguments: ['-e', 'setInterval(() => {}, 1000)']
					}
				},
				recipes: [writeRecipe('base')]
			},
			{ commandTimeoutMs: 50 }
		);

		expect(result).toMatchObject({
			ok: false,
			error: { code: 'INSTALL_FAILED', stage: 'install-dependencies' }
		});
		expect(await exists(destination)).toBeFalse();
		expect((await readdir(root)).some((entry) => entry.includes('.metonia-staging-'))).toBeFalse();
	});

	test('terminates descendants of a timed-out production command', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'timed out tree');
		const survivorMarker = join(root, 'descendant-survived.txt');
		const descendantScript = `setTimeout(() => require('node:fs').writeFileSync(${JSON.stringify(survivorMarker)}, 'alive'), 500); setInterval(() => {}, 1000);`;
		const parentScript = `require('node:child_process').spawn(process.execPath, ['-e', ${JSON.stringify(descendantScript)}], { stdio: 'ignore' }); setInterval(() => {}, 1000);`;
		const result = await generateProject(
			{
				config: testConfig(),
				destination,
				operations: {
					install: { executable: process.execPath, arguments: ['-e', parentScript] }
				},
				recipes: [writeRecipe('base')]
			},
			{ commandTimeoutMs: 100 }
		);

		expect(result).toMatchObject({
			ok: false,
			error: { code: 'INSTALL_FAILED', stage: 'install-dependencies' }
		});
		await delay(650);
		expect(await exists(survivorMarker)).toBeFalse();
		expect(await exists(destination)).toBeFalse();
	});
});

function recipe(id: string, stage: Recipe['stage'], sequence: string[]): Recipe {
	return { id, stage, apply: () => void sequence.push(id) };
}

function writeRecipe(id: string): Recipe {
	return {
		id,
		stage: 'base',
		async apply(context) {
			await context.writeFile('generated.txt', 'generated');
		}
	};
}

function testConfig(): ResolvedConfig {
	const resolution = resolveConfig({
		projectName: 'generator-test',
		resources: { users: false }
	});
	if (!resolution.ok) throw new Error('The generator test configuration must resolve.');
	return resolution.config;
}

async function createTestRoot(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'metonia-generator-test-'));
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
	return basename(path).startsWith('metonia-generator-test-');
}

async function exists(path: string): Promise<boolean> {
	try {
		await lstat(path);
		return true;
	} catch {
		return false;
	}
}
