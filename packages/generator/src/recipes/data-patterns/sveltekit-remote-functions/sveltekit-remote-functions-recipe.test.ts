/// <reference types="bun" />

import { afterEach, describe, expect, test } from 'bun:test';
import { spawn } from 'node:child_process';
import { lstat, mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';

import { resolveConfigOrThrow, type ResolvedConfig } from '@metonia-admin/registry';

import type { RecipeContext } from '../../../contracts/index.js';
import { generateProject } from '../../../core/index.js';
import { createArchitectureRecipe } from '../../architecture/index.js';
import { createBaseRecipe } from '../../base/index.js';
import { createDocumentsRecipe } from '../../documents/index.js';
import { createZodValidationRecipe } from '../../validation/zod/index.js';
import { createSvelteKitRemoteFunctionsRecipe } from './sveltekit-remote-functions-recipe.js';

const temporaryRoots: string[] = [];
const generatedIntegrationTest =
	process.env.METONIA_RUN_GENERATED_REMOTE_INTEGRATION === '1' ? test : test.skip;

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map(removeTestRoot));
}, 60_000);

describe('experimental SvelteKit Remote Functions recipe', () => {
	test('generates a validated route-local query proof without adding a runtime layer', async () => {
		const destination = join(await createTestRoot(), 'remote proof');
		const result = await generateRemoteProject(destination);

		expect(result.ok).toBeTrue();
		if (!result.ok) throw new Error(JSON.stringify(result.error));
		expect(result.facts.checks).toContain('data-pattern-sveltekit-remote-functions');
		expect(result.facts.documentFacts).toMatchObject({
			'dataPattern.remoteFunctions.scope':
				'query boundary proof only; Users CRUD parity is unavailable',
			'dataPattern.remoteFunctions.status': 'experimental'
		});

		const viteConfig = await readFile(join(destination, 'vite.config.ts'), 'utf8');
		expect(viteConfig).toContain('experimental: { async: true }');
		expect(viteConfig).toContain('remoteFunctions: true');
		expect(await exists(join(destination, 'svelte.config.js'))).toBeFalse();

		const boundary = await readFile(
			join(destination, 'src/routes/(admin)/remote-boundary/remote-boundary.remote.ts'),
			'utf8'
		);
		expect(boundary).toContain('query(remoteBoundaryInputSchema');
		expect(boundary).toContain("from '$lib/server/features/remoteBoundary.js'");
		expect(boundary).not.toContain('drizzle-orm');
		expect(boundary).not.toContain("from 'pg'");
		expect(boundary).not.toContain('$env/');

		const route = await readFile(
			join(destination, 'src/routes/(admin)/remote-boundary/+page.svelte'),
			'utf8'
		);
		expect(route).toContain("from './remote-boundary.remote.js'");
		expect(route).toContain('<RemoteBoundaryPage snapshot={await readRemoteBoundary(');
		expect(route).not.toMatch(/<(?:main|section|h1|form)\b/);

		const manifest = await readFile(join(destination, 'package.json'), 'utf8');
		expect(manifest).not.toContain('@metonia-admin/');
	});

	test('fails closed for another pattern and for unimplemented Users CRUD parity', async () => {
		const standard = memoryContext(remoteConfig({ dataPattern: 'sveltekit-standard' }));
		await expect(createSvelteKitRemoteFunctionsRecipe().apply(standard)).rejects.toThrow(
			'received another data pattern'
		);

		const remoteUsers = memoryContext(remoteConfig({ users: true }));
		await expect(createSvelteKitRemoteFunctionsRecipe().apply(remoteUsers)).rejects.toThrow(
			'does not yet implement Users CRUD parity'
		);
	});

	generatedIntegrationTest(
		'installs, checks, tests, and builds a fresh Bun Remote Functions proof',
		async () => {
			const destination = join(await createTestRoot(), 'remote integration');
			const result = await generateRemoteProject(destination);
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

			const port = await availablePort();
			const origin = `http://127.0.0.1:${port}`;
			const server = spawn('node', ['build'], {
				cwd: destination,
				env: { ...process.env, HOST: '127.0.0.1', ORIGIN: origin, PORT: String(port) },
				shell: false,
				stdio: ['ignore', 'pipe', 'pipe'],
				windowsHide: true
			});
			let serverLogs = '';
			server.stdout.setEncoding('utf8');
			server.stderr.setEncoding('utf8');
			server.stdout.on('data', (chunk: string) => (serverLogs += chunk));
			server.stderr.on('data', (chunk: string) => (serverLogs += chunk));
			try {
				const response = await waitForApplication(`${origin}/remote-boundary`, () => serverLogs);
				expect(response.status).toBe(200);
				const html = await response.text();
				expect(html).toContain('This query crossed a route-local Remote Function boundary');
				expect(html).toContain('Not a production-readiness claim.');
			} finally {
				if (!server.killed) server.kill('SIGTERM');
			}
		},
		240_000
	);
});

function generateRemoteProject(destination: string) {
	return generateProject({
		config: remoteConfig(),
		destination,
		recipes: [
			createBaseRecipe(),
			createArchitectureRecipe(),
			createSvelteKitRemoteFunctionsRecipe(),
			createZodValidationRecipe(),
			createDocumentsRecipe()
		]
	});
}

function remoteConfig(
	overrides: { dataPattern?: 'sveltekit-standard'; users?: boolean } = {}
): ResolvedConfig {
	const config = resolveConfigOrThrow({
		schemaVersion: 1,
		projectName: 'remote-proof',
		packageManager: 'bun',
		ui: { adapter: 'shadcn-svelte', theme: 'zinc' },
		dataPattern: overrides.dataPattern ?? 'sveltekit-remote-functions',
		validation: 'zod',
		orm: 'drizzle',
		database: { dialect: 'postgresql', provider: 'generic', driver: 'pg' },
		docker: false,
		resources: { users: false }
	});
	return overrides.users ? { ...config, resources: { users: true } } : config;
}

function memoryContext(config: ResolvedConfig): RecipeContext {
	const files = new Map<string, string>([
		[
			'vite.config.ts',
			'sveltekit({\n\t\t\tcompilerOptions: {\n\t\t\t\trunes: true\n\t\t\t},\n\t\t\tadapter: adapter()\n})\n'
		]
	]);
	return {
		config,
		stagingDirectory: 'C:/metonia-remote-test',
		pathFor: (path) => `C:/metonia-remote-test/${path}`,
		readFile: async (path) => files.get(path) ?? '',
		exists: async (path) => files.has(path),
		addCheck: () => undefined,
		addDependency: () => undefined,
		addDocumentFact: () => undefined,
		addScript: () => undefined,
		ensureDirectory: async (path) => `C:/metonia-remote-test/${path}`,
		writeFile: async (path, contents) => {
			files.set(path, typeof contents === 'string' ? contents : new TextDecoder().decode(contents));
			return `C:/metonia-remote-test/${path}`;
		}
	};
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
			env: { ...process.env, DATABASE_URL: undefined },
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

function availablePort(): Promise<number> {
	return new Promise((resolvePort, rejectPort) => {
		const server = createServer();
		server.once('error', rejectPort);
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			if (!address || typeof address === 'string') {
				server.close();
				rejectPort(new Error('Unable to reserve a Remote Functions runtime test port.'));
				return;
			}
			server.close((error) => (error ? rejectPort(error) : resolvePort(address.port)));
		});
	});
}

async function waitForApplication(url: string, getLogs: () => string): Promise<Response> {
	for (let attempt = 0; attempt < 120; attempt += 1) {
		try {
			const response = await fetch(url);
			if (response.status === 200) return response;
		} catch {
			// The generated Node server is not listening yet.
		}
		await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
	}
	throw new Error(`Generated Remote Functions server did not become ready.\n${getLogs()}`);
}

async function createTestRoot(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'metonia-remote-recipe-test-'));
	temporaryRoots.push(root);
	return root;
}

async function removeTestRoot(root: string): Promise<void> {
	const resolvedRoot = resolve(root);
	if (
		relative(tmpdir(), resolvedRoot).startsWith('..') ||
		!basename(resolvedRoot).startsWith('metonia-remote-recipe-test-')
	) {
		throw new Error('Refusing to remove an unexpected Remote Functions test root.');
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
