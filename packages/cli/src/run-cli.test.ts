/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import type { GenerateResult } from '@metonia-admin/generator';
import type { ResolvedConfig } from '@metonia-admin/registry';

import { runCli, type CliIo, type PromptAdapter } from './run-cli.js';

const defaultFlagArguments = [
	'example-app',
	'--package-manager',
	'bun',
	'--ui',
	'shadcn-svelte',
	'--theme',
	'zinc',
	'--data-pattern',
	'standard',
	'--validation',
	'zod',
	'--orm',
	'drizzle',
	'--database',
	'postgresql',
	'--provider',
	'generic',
	'--driver',
	'pg',
	'--no-docker',
	'--users'
] as const;

function successfulGeneration(request: {
	config: ResolvedConfig;
	destination: string;
}): Promise<GenerateResult> {
	return Promise.resolve({
		ok: true,
		config: request.config,
		destination: request.destination,
		facts: {
			checks: [],
			dependencies: { dependencies: {}, devDependencies: {} },
			documentFacts: {},
			scripts: {}
		},
		stages: []
	});
}

function io(options: { interactive?: boolean; prompts?: PromptAdapter } = {}): {
	io: CliIo;
	stdout: string[];
	stderr: string[];
} {
	const stdout: string[] = [];
	const stderr: string[] = [];
	return {
		io: {
			isInteractive: options.interactive ?? false,
			stdout: (value) => stdout.push(value),
			stderr: (value) => stderr.push(value),
			...(options.prompts === undefined ? {} : { prompts: options.prompts })
		},
		stdout,
		stderr
	};
}

function queuedPrompts(answers: readonly unknown[], seen: string[] = []): PromptAdapter {
	const queue = [...answers];
	const next = (message: string): unknown => {
		seen.push(message);
		return queue.shift();
	};
	return {
		text: async ({ message }) => next(message),
		select: async ({ message }) => next(message),
		confirm: async ({ message }) => next(message),
		isCancel: (value) => value === 'CANCEL',
		note: (message) => seen.push(message)
	};
}

describe('runCli', () => {
	test('interactive, full flags, and --yes resolve the same default configuration', async () => {
		const interactive = io({
			interactive: true,
			prompts: queuedPrompts([
				'example-app',
				'bun',
				'shadcn-svelte',
				'zinc',
				'sveltekit-standard',
				'zod',
				'drizzle',
				'postgresql',
				'generic',
				'pg',
				false,
				true,
				true,
				true
			])
		});
		const flags = io();
		const yes = io();

		const [interactiveRun, flagRun, yesRun] = await Promise.all([
			runCli([], { io: interactive.io, generate: successfulGeneration }),
			runCli(defaultFlagArguments, { io: flags.io, generate: successfulGeneration }),
			runCli(['example-app', '--yes'], { io: yes.io, generate: successfulGeneration })
		]);

		expect(selectionOf(interactiveRun)).toEqual(selectionOf(flagRun));
		expect(selectionOf(yesRun)).toEqual(selectionOf(flagRun));
	});

	test('theme choices are conditional on UI and Fluid UI is rejected before generation', async () => {
		const seen: string[] = [];
		const prompt = queuedPrompts(
			[
				'conditional-theme-app',
				'bun',
				'shadcn-svelte',
				'zinc',
				'sveltekit-standard',
				'zod',
				'drizzle',
				'postgresql',
				'generic',
				'pg',
				false,
				true,
				false,
				false
			],
			seen
		);
		const interactive = io({ interactive: true, prompts: prompt });
		await runCli([], { io: interactive.io, generate: successfulGeneration });
		expect(seen).toContain('Theme');

		let called = false;
		const output = io();
		const result = await runCli(
			defaultFlagArguments.map((value) => (value === 'shadcn-svelte' ? 'fluid-ui' : value)),
			{
				io: output.io,
				generate: async () => {
					called = true;
					return successfulGeneration as never;
				}
			}
		);
		expect(result.result.ok).toBeFalse();
		expect(result.result.ok ? '' : result.result.error.code).toBe('INVALID_CONFIGURATION');
		expect(called).toBeFalse();
	});

	test('remote Functions requires confirmation only in interactive mode', async () => {
		const seen: string[] = [];
		const interactive = io({
			interactive: true,
			prompts: queuedPrompts(
				[
					'remote-app',
					'bun',
					'shadcn-svelte',
					'zinc',
					'remote-functions',
					'zod',
					'drizzle',
					'postgresql',
					'generic',
					'pg',
					false,
					false,
					false,
					false,
					true
				],
				seen
			)
		});
		const interactiveRun = await runCli([], {
			io: interactive.io,
			generate: successfulGeneration
		});
		expect(interactiveRun.exitCode).toBe(0);
		expect(seen).toContain('Continue with experimental Remote Functions?');

		const nonInteractive = io({
			interactive: false,
			prompts: queuedPrompts([], seen)
		});
		const run = await runCli(
			defaultFlagArguments.map((value) =>
				value === 'standard' ? 'remote-functions' : value === '--users' ? '--no-users' : value
			),
			{ io: nonInteractive.io, generate: successfulGeneration }
		);
		expect(run.exitCode).toBe(0);
		expect(seen.filter((message) => message.includes('Remote Functions'))).toHaveLength(2);
	});

	test('JSON output is a single versioned object for success and failure', async () => {
		const success = io();
		const successRun = await runCli([...defaultFlagArguments, '--json'], {
			io: success.io,
			generate: successfulGeneration
		});
		expect(successRun.exitCode).toBe(0);
		expect(success.stdout).toHaveLength(1);
		expect(JSON.parse(success.stdout[0])).toMatchObject({ version: 1, ok: true });
		expect(success.stderr).toHaveLength(0);

		const failure = io();
		const failureRun = await runCli(['app', '--yes', '--json', '--theme', 'not-a-theme'], {
			io: failure.io
		});
		expect(failureRun.exitCode).toBeGreaterThan(0);
		expect(failure.stdout).toHaveLength(1);
		expect(JSON.parse(failure.stdout[0])).toMatchObject({ version: 1, ok: false });
		expect(failure.stderr.join('')).toContain('INVALID_CONFIGURATION');
	});

	test('non-TTY input never waits, cancellation exits distinctly, and stage errors are preserved', async () => {
		const nonTty = io();
		const incomplete = await runCli(['no-tty-app'], { io: nonTty.io });
		expect(incomplete.exitCode).toBe(1);
		expect(incomplete.result.ok ? '' : incomplete.result.error.code).toBe('USAGE');

		const cancelled = io({ interactive: true, prompts: queuedPrompts(['CANCEL']) });
		const cancelledRun = await runCli([], { io: cancelled.io, generate: successfulGeneration });
		expect(cancelledRun.exitCode).toBe(130);

		const stageFailure = io();
		const stageRun = await runCli(defaultFlagArguments, {
			io: stageFailure.io,
			generate: async (request) => ({
				ok: false,
				destination: request.destination,
				facts: {
					checks: [],
					dependencies: { dependencies: {}, devDependencies: {} },
					documentFacts: {},
					scripts: {}
				},
				stages: [],
				error: {
					code: 'RECIPE_FAILED',
					message: 'A recipe could not complete.',
					stage: 'run-recipes'
				}
			})
		});
		expect(stageRun.exitCode).toBe(2);
		expect(stageRun.result.ok ? '' : stageRun.result.error.stage).toBe('run-recipes');
	});

	test('keeps a destination containing spaces intact for the generator', async () => {
		let destination = '';
		const output = io();
		await runCli(['folder with spaces/app name', '--yes'], {
			io: output.io,
			generate: async (request) => {
				destination = request.destination;
				return successfulGeneration(request);
			}
		});
		expect(destination).toBe('folder with spaces/app name');
	});
});

function selectionOf(run: Awaited<ReturnType<typeof runCli>>): unknown {
	if (!run.result.ok) return run.result;
	const selection = { ...run.result.config };
	delete (selection as { defaultsApplied?: unknown }).defaultsApplied;
	return selection;
}
