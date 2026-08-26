/// <reference types="bun" />

import { afterAll, describe, expect, test } from 'bun:test';
import { spawn } from 'node:child_process';
import { lstat, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';

import { packageManagerVersions } from '../../packages/generator/src/adapters/package-managers/index.js';

const repositoryRoot = resolve(import.meta.dir, '..', '..');
const cliArtifact = join(repositoryRoot, 'packages', 'cli', 'dist', 'create-metonia-admin.js');
const temporaryRoots: string[] = [];
const commandTimeoutMs = 120_000;

afterAll(async () => {
	await Promise.all(temporaryRoots.splice(0).map(removeTestRoot));
}, 60_000);

describe('fresh Bun generated-project gate', () => {
	test('enforces the pinned Bun version, then runs the complete Node CLI artifact gate', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'generated integration project');
		const nodeExecutable = process.env.METONIA_NODE_EXECUTABLE ?? 'node';
		const bunExecutable = process.env.METONIA_GENERATED_BUN_EXECUTABLE ?? 'bun';
		const records: CommandRecord[] = [];

		records.push(await runCommand(bunExecutable, ['--version'], repositoryRoot));
		records.push(
			await runCommand(
				nodeExecutable,
				[cliArtifact, destination, '--yes', '--install', '--no-git', '--json'],
				repositoryRoot
			)
		);
		if (records[0]?.stdout.trim() !== packageManagerVersions.bun) {
			console.info(formatCommandRecords(records));
			expect(records[1]?.exitCode).toBe(2);
			expect(JSON.parse(records[1]?.stdout ?? '')).toMatchObject({
				ok: false,
				error: { code: 'PACKAGE_MANAGER_VERSION_MISMATCH', stage: 'resolve-plan' }
			});
			expect(await exists(destination)).toBeFalse();
			return;
		}
		if (records.at(-1)?.exitCode === 0) {
			records.push(await runCommand(bunExecutable, ['run', 'check'], destination));
			records.push(await runCommand(bunExecutable, ['run', 'test'], destination));
			records.push(await runCommand(bunExecutable, ['run', 'build'], destination));
			records.push(await runCommand(bunExecutable, ['audit'], destination));
		}

		console.info(formatCommandRecords(records));
		expect(records[0]?.stdout.trim().length).toBeGreaterThan(0);
		for (const record of records) expect(record.exitCode).toBe(0);
		expect(records).toHaveLength(6);
		expect(await exists(join(destination, 'bun.lock'))).toBeTrue();
		expect(await exists(join(destination, 'build', 'index.js'))).toBeTrue();
		expect(
			await exists(join(destination, 'src', 'routes', '(admin)', 'users', '+page.svelte'))
		).toBeTrue();
		expect(await exists(join(destination, 'drizzle', '0000_create_users.sql'))).toBeTrue();
	}, 180_000);
});

interface CommandRecord {
	command: string;
	exitCode: number;
	stderr: string;
	stdout: string;
}

function runCommand(
	executable: string,
	arguments_: readonly string[],
	cwd: string
): Promise<CommandRecord> {
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
			resolveCommand({
				command: [executable, ...arguments_].join(' '),
				exitCode: timedOut ? -1 : (code ?? -1),
				stderr,
				stdout
			});
		});
	});
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
	const root = await mkdtemp(join(tmpdir(), 'metonia-generated-integration-'));
	temporaryRoots.push(root);
	return root;
}

async function removeTestRoot(root: string): Promise<void> {
	const resolvedRoot = resolve(root);
	if (relative(tmpdir(), resolvedRoot).startsWith('..') || !basenameMatches(resolvedRoot)) {
		throw new Error('Refusing to remove an unexpected generated integration root.');
	}
	await rm(resolvedRoot, { force: true, recursive: true });
}

function basenameMatches(path: string): boolean {
	return basename(path).startsWith('metonia-generated-integration-');
}

async function exists(path: string): Promise<boolean> {
	try {
		await lstat(path);
		return true;
	} catch {
		return false;
	}
}
