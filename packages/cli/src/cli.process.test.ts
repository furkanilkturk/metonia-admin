/// <reference types="bun" />

import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { spawn } from 'node:child_process';
import { lstat, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const cliArtifact = join(packageRoot, 'dist', 'create-metonia-admin.js');
const temporaryRoots: string[] = [];
// Stay below the suite's 30-second hook/test limits so a timeout kills the child first.
const commandTimeoutMs = 25_000;

beforeAll(async () => {
	const build = await runCommand(process.execPath, ['run', 'build'], packageRoot);
	if (build.exitCode !== 0) {
		throw new Error(`CLI build failed.\n${build.stdout}\n${build.stderr}`);
	}
}, 30_000);

afterAll(async () => {
	await Promise.all(temporaryRoots.splice(0).map(removeTestRoot));
});

describe('built Node CLI process', () => {
	test('generates without install or Git into a destination containing spaces with pure JSON stdout', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'admin project with spaces');
		const result = await runCliProcess([
			destination,
			'--yes',
			'--no-users',
			'--no-install',
			'--no-git',
			'--json'
		]);

		expect(result.exitCode).toBe(0);
		expect(result.stderr).toBe('');
		expect(nonEmptyLines(result.stdout)).toHaveLength(1);
		expect(JSON.parse(result.stdout)).toMatchObject({
			version: 1,
			ok: true,
			destination: resolve(destination),
			config: { packageManager: 'bun', resources: { users: false } }
		});
		expect(await readFile(join(destination, 'package.json'), 'utf8')).toContain(
			'"packageManager": "bun@'
		);
		expect(await exists(join(destination, 'bun.lock'))).toBeFalse();
		expect(await exists(join(destination, '.git'))).toBeFalse();
	}, 30_000);

	test('rejects unavailable Deno before generation without creating output', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'unsupported plan');
		const result = await runCliProcess([
			destination,
			'--yes',
			'--package-manager',
			'deno',
			'--no-users',
			'--no-install',
			'--no-git',
			'--json'
		]);

		expect(result.exitCode).toBe(1);
		expect(nonEmptyLines(result.stdout)).toHaveLength(1);
		expect(JSON.parse(result.stdout)).toMatchObject({
			version: 1,
			ok: false,
			error: { code: 'INVALID_CONFIGURATION' }
		});
		expect(result.stderr).toContain('INVALID_CONFIGURATION');
		expect(await exists(destination)).toBeFalse();
		expect(await readdirNames(root)).toEqual([]);
	});
});

async function runCliProcess(arguments_: readonly string[]): Promise<CommandResult> {
	return runCommand(
		process.env.METONIA_NODE_EXECUTABLE ?? 'node',
		[cliArtifact, ...arguments_],
		packageRoot
	);
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
		}, commandTimeoutMs);
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
	const root = await mkdtemp(join(tmpdir(), 'metonia-cli-process-test-'));
	temporaryRoots.push(root);
	return root;
}

async function removeTestRoot(root: string): Promise<void> {
	const resolvedRoot = resolve(root);
	if (relative(tmpdir(), resolvedRoot).startsWith('..') || !basenameMatches(resolvedRoot)) {
		throw new Error('Refusing to remove an unexpected CLI process test root.');
	}
	await rm(resolvedRoot, { force: true, recursive: true });
}

function basenameMatches(path: string): boolean {
	return basename(path).startsWith('metonia-cli-process-test-');
}

async function exists(path: string): Promise<boolean> {
	try {
		await lstat(path);
		return true;
	} catch {
		return false;
	}
}

async function readdirNames(path: string): Promise<string[]> {
	const { readdir } = await import('node:fs/promises');
	return readdir(path);
}

function nonEmptyLines(value: string): string[] {
	return value.split(/\r?\n/).filter((line) => line.length > 0);
}
