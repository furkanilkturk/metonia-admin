/// <reference types="bun" />

import { afterEach, describe, expect, test } from 'bun:test';
import { spawn } from 'node:child_process';
import { lstat, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';

import { resolveConfigOrThrow, type ResolvedConfig } from '@metonia-admin/registry';

import type {
	DependencyContribution,
	DocumentFact,
	Recipe,
	RecipeContext,
	ScriptContribution,
	StagedValidator
} from '../../../contracts/index.js';
import { generateProject } from '../../../core/index.js';
import { createAdminCoreRecipe } from '../../admin-core/index.js';
import { createArchitectureRecipe } from '../../architecture/index.js';
import { createBaseRecipe } from '../../base/index.js';
import { createPostgresqlDatabaseRecipe } from '../../database/postgresql/index.js';
import { createSvelteKitStandardRecipe } from '../../data-patterns/sveltekit-standard/index.js';
import { createDocumentsRecipe } from '../../documents/index.js';
import { createDrizzleOrmRecipe } from '../../orm/drizzle/index.js';
import {
	createShadcnSvelteThemeRecipe,
	createShadcnSvelteUiRecipe
} from '../../ui/shadcn-svelte/index.js';
import { createZodValidationRecipe } from '../../validation/zod/index.js';
import { createUsersResourceRecipe } from './users-resource-recipe.js';

const temporaryRoots: string[] = [];
const generatedIntegrationTest =
	process.env.METONIA_RUN_GENERATED_USERS_INTEGRATION === '1' ? test : test.skip;
const postgresIntegrationTest =
	process.env.METONIA_RUN_USERS_POSTGRES_INTEGRATION === '1' ? test : test.skip;

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map(removeTestRoot));
}, 60_000);

describe('Standard Users recipe slice', () => {
	test('renders a deterministic manifest, migration, and native SvelteKit boundary', async () => {
		const first = await applyPrimarySlice(usersConfig());
		const second = await applyPrimarySlice(usersConfig());
		expect([...first.files.entries()].sort()).toEqual([...second.files.entries()].sort());

		const manifest = JSON.parse(requiredFile(first, 'package.json')) as {
			dependencies: Record<string, string>;
			devDependencies: Record<string, string>;
			scripts: Record<string, string>;
		};
		expect(manifest.dependencies).toMatchObject({
			'drizzle-orm': '0.45.2',
			pg: '8.23.0',
			zod: '4.4.3'
		});
		expect(manifest.devDependencies).toMatchObject({
			'@types/pg': '8.23.1',
			'drizzle-kit': '0.31.10'
		});
		expect(manifest.scripts).toMatchObject({
			'db:check': 'drizzle-kit check',
			'db:generate': 'drizzle-kit generate',
			'db:migrate': 'drizzle-kit migrate'
		});

		expect(requiredFile(first, 'drizzle/0000_create_users.sql')).toContain(
			'CONSTRAINT "users_email_unique" UNIQUE'
		);
		expect(requiredFile(first, 'src/lib/server/db/client.ts')).toContain(
			'export function getDatabase()'
		);
		expect(requiredFile(first, 'src/routes/(admin)/users/+page.server.ts')).toContain(
			'loadUsers(url)'
		);
		expect(requiredFile(first, 'src/routes/(admin)/users/[id]/+page.server.ts')).toContain(
			'confirmation !== user.email'
		);
		expect([...first.checks.keys()].sort()).toEqual([
			'data-pattern-sveltekit-standard',
			'database-postgresql',
			'orm-drizzle',
			'resource-users',
			'validation-zod'
		]);
	});

	test('keeps client/shared imports one-way and route components thin', async () => {
		const output = await applyPrimarySlice(usersConfig());
		for (const [path, source] of output.files) {
			if (path.includes('/client/')) {
				expect(source).not.toContain('$lib/server');
				expect(source).not.toContain('$env/');
			}
			if (path.includes('/shared/')) {
				expect(source).not.toContain('$lib/client');
				expect(source).not.toContain('$lib/server');
			}
			if (path.endsWith('+page.svelte')) {
				expect(source).not.toMatch(/<(?:main|section|form|table)\b/);
				expect(source).toContain('$lib/client/ui/pages/users/');
			}
		}
	});

	test('uses parameterized Drizzle APIs and redacts unexpected database errors', async () => {
		const output = await applyPrimarySlice(usersConfig());
		const repository = requiredFile(output, 'src/lib/server/repositories/usersRepository.ts');
		expect(repository).toContain('ilike(users.name, search)');
		expect(repository).toContain('eq(users.id, id)');
		expect(repository).not.toContain('sql.raw');
		expect(repository).not.toContain('execute(');

		const service = requiredFile(output, 'src/lib/server/services/usersService.ts');
		expect(service).toContain('User data is temporarily unavailable.');
		expect(service).not.toContain('error.message');
		expect(service).not.toContain('String(error)');
		expect(service).not.toContain('cause:');
		expect(service).not.toContain('DATABASE_URL');

		const actions = requiredFile(output, 'src/lib/server/actions/users.ts');
		expect(actions).toContain('toFieldErrors<UserFormField>(parsed.error)');
		expect(actions).not.toContain('drizzle-orm');
		expect(actions).not.toContain("from 'pg'");
	});

	test('requires the guarded danger action for disabling and preserves disabled users on edit', async () => {
		const output = await applyPrimarySlice(usersConfig());
		const constants = requiredFile(output, 'src/lib/shared/constants/users.ts');
		const schema = requiredFile(output, 'src/lib/shared/schemas/users.ts');
		expect(constants).toContain("editableUserStatuses = ['active', 'invited']");
		expect(schema).toContain('userCreateInputSchema.omit({ status: true })');

		const form = requiredFile(output, 'src/lib/client/ui/views/users/UserForm.svelte');
		expect(form).toContain('{#if user}');
		expect(form).toContain('Status is not editable here.');
		expect(form).toContain('{#each editableUserStatuses as value');

		const dangerRoute = requiredFile(output, 'src/routes/(admin)/users/[id]/+page.server.ts');
		expect(dangerRoute).toContain('confirmation !== user.email');
		expect(dangerRoute).toContain('usersService.disable(user.id)');
	});

	test('fails closed when the Users resource is not selected', async () => {
		const config = usersConfig(false);
		const context = createMemoryContext(config);
		await expect(createUsersResourceRecipe().apply(context.context)).rejects.toThrow(
			'while the resource is disabled'
		);
	});

	test('keeps the selected Drizzle and PostgreSQL boundary buildable without resources', async () => {
		const memory = createMemoryContext(usersConfig(false));
		for (const recipe of [createDrizzleOrmRecipe(), createPostgresqlDatabaseRecipe()]) {
			await recipe.apply(memory.context);
		}
		for (const check of memory.output.checks.values()) await check.validate(memory.context);

		expect(requiredFile(memory.output, 'src/lib/server/db/schema/index.ts')).toContain(
			'export {};'
		);
		expect(memory.output.files.has('src/lib/server/db/schema/users.ts')).toBeFalse();
		expect(memory.output.files.has('drizzle/0000_create_users.sql')).toBeFalse();
		expect(requiredFile(memory.output, 'src/lib/server/db/client.ts')).toContain(
			"import * as schema from './schema/index.js';"
		);
	});

	generatedIntegrationTest(
		'installs, checks, tests, and builds a fresh Bun Standard Users project without DATABASE_URL',
		async () => {
			const destination = join(await createTestRoot(), 'generated users integration');
			const result = await generateUsersProject(destination);
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
		240_000
	);

	postgresIntegrationTest(
		'migrates and exercises Users CRUD through Standard actions against disposable PostgreSQL',
		async () => {
			const destination = join(await createTestRoot(), 'generated users postgres');
			const result = await generateUsersProject(destination);
			expect(result.ok).toBeTrue();
			if (!result.ok) throw new Error(JSON.stringify(result.error));

			const bunExecutable = process.env.METONIA_GENERATED_BUN_EXECUTABLE ?? 'bun';
			expect((await runCommand(bunExecutable, ['install'], destination)).exitCode).toBe(0);
			expect((await runCommand(bunExecutable, ['run', 'build'], destination)).exitCode).toBe(0);

			const containerName = `metonia-users-runtime-${process.pid}-${Date.now()}`;
			let server: ReturnType<typeof spawn> | undefined;
			try {
				const started = await runExternal(
					'docker',
					[
						'run',
						'--detach',
						'--name',
						containerName,
						'--env',
						'POSTGRES_USER=metonia',
						'--env',
						'POSTGRES_PASSWORD=metonia_runtime_test',
						'--env',
						'POSTGRES_DB=metonia_runtime',
						'--publish',
						'127.0.0.1::5432',
						'postgres:17.11-bookworm'
					],
					destination,
					240_000
				);
				expect(started.exitCode).toBe(0);
				await waitForPostgresql(containerName, destination);

				const portResult = await runExternal(
					'docker',
					['port', containerName, '5432/tcp'],
					destination
				);
				const databasePort = Number(portResult.stdout.trim().split(':').at(-1));
				expect(Number.isInteger(databasePort) && databasePort > 0).toBeTrue();
				const databaseUrl = `postgresql://metonia:metonia_runtime_test@127.0.0.1:${databasePort}/metonia_runtime`;
				const migration = await runCommand(bunExecutable, ['run', 'db:migrate'], destination, {
					DATABASE_URL: databaseUrl
				});
				if (migration.exitCode !== 0) console.info(migration.stderr);
				expect(migration.exitCode).toBe(0);

				const appPort = await availablePort();
				const origin = `http://127.0.0.1:${appPort}`;
				server = spawn('node', ['build'], {
					cwd: destination,
					env: {
						...process.env,
						DATABASE_URL: databaseUrl,
						HOST: '127.0.0.1',
						ORIGIN: origin,
						PORT: String(appPort)
					},
					shell: false,
					stdio: ['ignore', 'pipe', 'pipe'],
					windowsHide: true
				});
				let serverLogs = '';
				server.stdout?.on('data', (chunk: Buffer) => (serverLogs += chunk.toString()));
				server.stderr?.on('data', (chunk: Buffer) => (serverLogs += chunk.toString()));
				await waitForApplication(`${origin}/users`, () => serverLogs);

				const invalid = await postUserForm(`${origin}/users/new?/create`, {
					name: 'A',
					email: 'not-an-email',
					status: 'active',
					role: 'admin'
				});
				expect([200, 422]).toContain(invalid.status);
				expect(await invalid.text()).toContain('Enter a valid email address.');

				const created = await postUserForm(`${origin}/users/new?/create`, {
					name: 'Ada Lovelace',
					email: 'ada@example.test',
					status: 'active',
					role: 'admin'
				});
				expect(created.status).toBe(303);
				const location = created.headers.get('location') ?? '';
				expect(location).toMatch(/^\/users\/[0-9a-f-]{36}$/);
				const detailUrl = new URL(location, origin).toString();
				expect(await (await fetch(detailUrl)).text()).toContain('ada@example.test');

				const list = await fetch(`${origin}/users?q=Ada&status=active&sort=name&direction=asc`);
				expect(list.status).toBe(200);
				expect(await list.text()).toContain('Ada Lovelace');

				const updated = await postUserForm(`${detailUrl}/edit?/update`, {
					name: 'Ada Byron',
					email: 'ada@example.test',
					status: 'active',
					role: 'editor'
				});
				expect(updated.status).toBe(303);
				expect(await (await fetch(detailUrl)).text()).toContain('Ada Byron');

				const disabled = await postUserForm(`${detailUrl}?/disable`, {
					confirmation: 'ada@example.test'
				});
				expect(disabled.status).toBe(303);
				expect(await (await fetch(detailUrl)).text()).toContain('Disabled');

				const unguardedDelete = await postUserForm(`${detailUrl}?/delete`, {
					confirmation: 'wrong@example.test'
				});
				expect(unguardedDelete.status).toBe(400);

				const deleted = await postUserForm(`${detailUrl}?/delete`, {
					confirmation: 'ada@example.test'
				});
				expect(deleted.status).toBe(303);
				expect((await fetch(detailUrl)).status).toBe(404);
			} finally {
				if (server && !server.killed) server.kill('SIGTERM');
				if (containerName.startsWith('metonia-users-runtime-')) {
					await runExternal('docker', ['rm', '--force', containerName], destination);
				}
			}
		},
		360_000
	);
});

interface MemoryOutput {
	files: Map<string, string>;
	checks: Map<string, StagedValidator>;
	dependencies: DependencyContribution[];
	documentFacts: DocumentFact[];
	scripts: ScriptContribution[];
}

async function applyPrimarySlice(config: ResolvedConfig): Promise<MemoryOutput> {
	const memory = createMemoryContext(config);
	const recipes: Recipe[] = [
		createSvelteKitStandardRecipe(),
		createZodValidationRecipe(),
		createDrizzleOrmRecipe(),
		createPostgresqlDatabaseRecipe(),
		createUsersResourceRecipe()
	];
	for (const recipe of recipes) await recipe.apply(memory.context);
	for (const check of [...memory.output.checks.values()].sort((left, right) =>
		left.id.localeCompare(right.id)
	)) {
		await check.validate(memory.context);
	}
	return memory.output;
}

function createMemoryContext(config: ResolvedConfig): {
	context: RecipeContext;
	output: MemoryOutput;
} {
	const output: MemoryOutput = {
		files: new Map([
			[
				'package.json',
				`${JSON.stringify({ name: config.projectName, scripts: { check: 'check' } }, null, '\t')}\n`
			]
		]),
		checks: new Map(),
		dependencies: [],
		documentFacts: [],
		scripts: []
	};
	const context: RecipeContext = {
		config,
		stagingDirectory: 'C:/metonia-test-staging',
		pathFor: (path) => `C:/metonia-test-staging/${path}`,
		readFile: async (path) => requiredFile(output, path),
		exists: async (path) => output.files.has(path),
		addCheck: (check) => output.checks.set(check.id, check),
		addDependency: (dependency) => output.dependencies.push(dependency),
		addDocumentFact: (fact) => output.documentFacts.push(fact),
		addScript: (script) => output.scripts.push(script),
		ensureDirectory: async (path) => `C:/metonia-test-staging/${path}`,
		writeFile: async (path, contents) => {
			output.files.set(
				path,
				typeof contents === 'string' ? contents : new TextDecoder().decode(contents)
			);
			return `C:/metonia-test-staging/${path}`;
		}
	};
	return { context, output };
}

function requiredFile(output: MemoryOutput, path: string): string {
	const source = output.files.get(path);
	if (source === undefined) throw new Error(`Missing generated test file: ${path}`);
	return source;
}

function usersConfig(enabled = true): ResolvedConfig {
	return resolveConfigOrThrow({
		schemaVersion: 1,
		projectName: 'users-proof',
		packageManager: 'bun',
		ui: { adapter: 'shadcn-svelte', theme: 'zinc' },
		dataPattern: 'sveltekit-standard',
		validation: 'zod',
		orm: 'drizzle',
		database: { dialect: 'postgresql', provider: 'generic', driver: 'pg' },
		docker: false,
		resources: { users: enabled }
	});
}

function generateUsersProject(destination: string) {
	return generateProject({
		config: usersConfig(),
		destination,
		recipes: [
			createBaseRecipe(),
			createArchitectureRecipe(),
			createAdminCoreRecipe(),
			createShadcnSvelteUiRecipe(),
			createShadcnSvelteThemeRecipe(),
			createSvelteKitStandardRecipe(),
			createZodValidationRecipe(),
			createDrizzleOrmRecipe(),
			createPostgresqlDatabaseRecipe(),
			createUsersResourceRecipe(),
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
	cwd: string,
	extraEnvironment: Readonly<Record<string, string>> = {}
): Promise<CommandResult> {
	return new Promise((resolveCommand, rejectCommand) => {
		const child = spawn(executable, arguments_, {
			cwd,
			env: { ...process.env, DATABASE_URL: undefined, ...extraEnvironment },
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
		}, 180_000);
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

function runExternal(
	executable: string,
	arguments_: readonly string[],
	cwd: string,
	timeoutMs = 60_000
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
		}, timeoutMs);
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

async function waitForPostgresql(containerName: string, cwd: string): Promise<void> {
	for (let attempt = 0; attempt < 120; attempt += 1) {
		const result = await runExternal(
			'docker',
			['exec', containerName, 'pg_isready', '-U', 'metonia', '-d', 'metonia_runtime'],
			cwd
		);
		if (result.exitCode === 0) return;
		await delay(500);
	}
	throw new Error('Disposable PostgreSQL did not become ready.');
}

async function waitForApplication(url: string, getLogs: () => string): Promise<void> {
	for (let attempt = 0; attempt < 120; attempt += 1) {
		try {
			const response = await fetch(url);
			if (response.status === 200) return;
		} catch {
			// The server socket is not ready yet.
		}
		await delay(250);
	}
	throw new Error(`Generated server did not become ready.\n${getLogs()}`);
}

function postUserForm(url: string, values: Readonly<Record<string, string>>): Promise<Response> {
	const origin = new URL(url).origin;
	return fetch(url, {
		method: 'POST',
		headers: {
			accept: 'text/html,application/xhtml+xml',
			'content-type': 'application/x-www-form-urlencoded',
			origin
		},
		body: new URLSearchParams(values),
		redirect: 'manual'
	});
}

function availablePort(): Promise<number> {
	return new Promise((resolvePort, rejectPort) => {
		const server = createServer();
		server.once('error', rejectPort);
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			if (!address || typeof address === 'string') {
				server.close();
				rejectPort(new Error('Unable to reserve a local application port.'));
				return;
			}
			server.close((error) => (error ? rejectPort(error) : resolvePort(address.port)));
		});
	});
}

function delay(milliseconds: number): Promise<void> {
	return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function createTestRoot(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'metonia-users-recipe-test-'));
	temporaryRoots.push(root);
	return root;
}

async function removeTestRoot(root: string): Promise<void> {
	const resolvedRoot = resolve(root);
	if (
		relative(tmpdir(), resolvedRoot).startsWith('..') ||
		!basename(resolvedRoot).startsWith('metonia-users-recipe-test-')
	) {
		throw new Error('Refusing to remove an unexpected Users recipe test root.');
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
