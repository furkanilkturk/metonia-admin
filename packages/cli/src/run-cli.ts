/// <reference types="bun" />

import { basename, resolve } from 'node:path';

import { confirm, isCancel, note, select, spinner, text } from '@clack/prompts';
import {
	generateConfiguredProject,
	type GenerateResult,
	type GenerationErrorDetails
} from '@metonia-admin/generator';
import {
	capabilityRegistry,
	getConditionalChoices,
	normalizeProjectName,
	resolveConfig,
	type ConfigIssue,
	type RawConfig,
	type ResolvedConfig
} from '@metonia-admin/registry';

export const CLI_RESULT_VERSION = 1 as const;

const dataPatternAliases = {
	standard: 'sveltekit-standard',
	'remote-functions': 'sveltekit-remote-functions'
} as const;

type ToggleName = 'docker' | 'users' | 'install' | 'git';

export interface CliSelection {
	readonly destination?: string;
	readonly projectName?: string;
	readonly packageManager?: string;
	readonly ui?: string;
	readonly theme?: string;
	readonly dataPattern?: string;
	readonly validation?: string;
	readonly orm?: string;
	readonly dialect?: string;
	readonly provider?: string;
	readonly driver?: string;
	readonly docker?: boolean;
	readonly users?: boolean;
	readonly install?: boolean;
	readonly git?: boolean;
}

interface ParsedArguments extends CliSelection {
	readonly help: boolean;
	readonly json: boolean;
	readonly yes: boolean;
}

export interface PromptOption {
	readonly label: string;
	readonly value: string;
	readonly hint?: string;
}

export interface PromptAdapter {
	text(options: { message: string; initialValue?: string }): Promise<unknown>;
	select(options: {
		message: string;
		options: PromptOption[];
		initialValue?: string;
	}): Promise<unknown>;
	confirm(options: { message: string; initialValue?: boolean }): Promise<unknown>;
	isCancel(value: unknown): boolean;
	note?(message: string, title?: string): void;
}

export interface CliIo {
	readonly isInteractive: boolean;
	readonly stdout: (value: string) => void;
	readonly stderr: (value: string) => void;
	readonly prompts?: PromptAdapter;
	readonly createActivity?: () => CliActivityIndicator;
}

export interface CliActivityIndicator {
	start(message: string): void;
	stop(message: string): void;
	error(message: string): void;
}

export interface CliGenerationRequest {
	readonly config: ResolvedConfig;
	readonly destination: string;
	readonly install: boolean;
	readonly git: boolean;
}

export type GeneratorExecutor = (request: CliGenerationRequest) => Promise<GenerateResult>;

export interface CliDependencies {
	readonly io: CliIo;
	readonly generate?: GeneratorExecutor;
	readonly cwd?: string;
}

export interface CliErrorDetails {
	readonly code: string;
	readonly message: string;
	readonly stage?: string;
	readonly recipeId?: string;
	readonly checkId?: string;
	readonly issues?: readonly ConfigIssue[];
}

export type CliResult =
	| {
			readonly version: typeof CLI_RESULT_VERSION;
			readonly ok: true;
			readonly destination: string;
			readonly config: ResolvedConfig;
			readonly generation: GenerateResult;
	  }
	| {
			readonly version: typeof CLI_RESULT_VERSION;
			readonly ok: false;
			readonly error: CliErrorDetails;
	  };

export interface CliRunResult {
	readonly exitCode: number;
	readonly result: CliResult;
}

class CliError extends Error {
	constructor(readonly details: CliErrorDetails) {
		super(details.message);
		this.name = 'CliError';
	}
}

/** Parse flags only; resolution and all side effects are deliberately separate. */
export function parseCliArguments(argv: readonly string[]): ParsedArguments {
	const parsed: {
		-readonly [K in keyof ParsedArguments]: ParsedArguments[K] | undefined;
	} = { help: false, json: false, yes: false };
	const positionals: string[] = [];

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (token === '--') {
			positionals.push(...argv.slice(index + 1));
			break;
		}
		if (!token.startsWith('--')) {
			positionals.push(token);
			continue;
		}

		if (token === '--help') {
			parsed.help = true;
			continue;
		}
		if (token === '--json') {
			parsed.json = true;
			continue;
		}
		if (token === '--yes') {
			parsed.yes = true;
			continue;
		}

		const toggle = parseToggle(token);
		if (toggle) {
			setOnce(parsed, toggle.name, toggle.value, token);
			continue;
		}

		const flag = flagToField(token);
		if (!flag) throw usageError(`Unknown option "${token}".`);
		const value = argv[index + 1];
		if (value === undefined || value.startsWith('--')) {
			throw usageError(`Option "${token}" requires a value.`);
		}
		setOnce(parsed, flag, value, token);
		index += 1;
	}

	if (positionals.length > 1) throw usageError('Only one project destination may be provided.');
	if (positionals[0] !== undefined) parsed.destination = positionals[0];
	return parsed as ParsedArguments;
}

export async function runCli(
	argv: readonly string[],
	dependencies: CliDependencies
): Promise<CliRunResult> {
	let json = false;
	try {
		const parsed = parseCliArguments(argv);
		json = parsed.json;
		if (parsed.help) {
			dependencies.io.stdout(`${formatHelp()}\n`);
			return {
				exitCode: 0,
				result: {
					version: CLI_RESULT_VERSION,
					ok: true,
					destination: '',
					config: undefined as never,
					generation: undefined as never
				}
			};
		}

		const interactive = dependencies.io.isInteractive && !parsed.yes && !parsed.json;
		const selection = interactive
			? await collectInteractiveSelection(parsed, requirePrompts(dependencies.io))
			: collectNonInteractiveSelection(parsed);
		const configInput = selectionToRawConfig(selection, dependencies.cwd ?? process.cwd());
		const resolution = resolveConfig(configInput);
		if (!resolution.ok) {
			const errors = resolution.issues.filter((issue) => issue.severity === 'error');
			throw new CliError({
				code: 'INVALID_CONFIGURATION',
				message: errors.map((issue) => issue.message).join(' '),
				issues: resolution.issues
			});
		}

		if (interactive && configInput.dataPattern === 'sveltekit-remote-functions') {
			await confirmRemoteFunctions(requirePrompts(dependencies.io));
		}

		const install = selection.install ?? true;
		const git = selection.git ?? true;
		const activity =
			dependencies.io.isInteractive && !json ? dependencies.io.createActivity?.() : undefined;
		activity?.start(generationActivityMessage(install, git));

		let generation: GenerateResult;
		try {
			generation = await (dependencies.generate ?? generateConfiguredProject)({
				config: resolution.config,
				destination: requireDestination(selection.destination),
				install,
				git
			});
			if (!generation.ok) throw fromGenerationError(generation.error);
			activity?.stop('Project generated successfully');
		} catch (error) {
			activity?.error('Project generation failed');
			throw error;
		}

		const result: CliResult = {
			version: CLI_RESULT_VERSION,
			ok: true,
			destination: generation.destination,
			config: resolution.config,
			generation
		};
		emitResult(result, dependencies.io, json);
		return { exitCode: 0, result };
	} catch (error) {
		const details = toErrorDetails(error);
		const result: CliResult = { version: CLI_RESULT_VERSION, ok: false, error: details };
		emitResult(result, dependencies.io, json);
		return { exitCode: exitCodeFor(details), result };
	}
}

function generationActivityMessage(install: boolean, git: boolean): string {
	if (install && git) return 'Creating project, installing dependencies, and initializing Git';
	if (install) return 'Creating project and installing dependencies';
	if (git) return 'Creating project and initializing Git';
	return 'Creating project';
}

function collectNonInteractiveSelection(parsed: ParsedArguments): CliSelection {
	if (!parsed.destination) throw usageError('A project destination is required.');
	if (!parsed.yes) {
		const missing = requiredConfigFields.filter((field) => parsed[field] === undefined);
		if (missing.length > 0) {
			throw usageError(
				`Non-interactive mode requires: ${missing.map(flagForField).join(', ')}. Use --yes to accept registry defaults.`
			);
		}
	}
	return parsed;
}

async function collectInteractiveSelection(
	parsed: ParsedArguments,
	prompts: PromptAdapter
): Promise<CliSelection> {
	const projectName =
		parsed.destination === undefined
			? await askText(prompts, 'Project name', 'my-admin')
			: undefined;
	const destination =
		parsed.destination ??
		(await askText(
			prompts,
			'Project destination',
			`./${normalizeProjectName(requirePromptText(projectName))}`
		));
	const packageManager =
		parsed.packageManager ?? (await askChoice(prompts, 'Package manager', 'packageManager', {}));
	const ui = parsed.ui ?? (await askChoice(prompts, 'UI library', 'ui.adapter', {}));
	const theme =
		parsed.theme ?? (await askChoice(prompts, 'Theme', 'ui.theme', { ui: { adapter: ui } }));
	const dataPattern =
		parsed.dataPattern ?? (await askChoice(prompts, 'Data pattern', 'dataPattern', {}));
	const validation =
		parsed.validation ?? (await askChoice(prompts, 'Validation', 'validation', {}));
	const orm = parsed.orm ?? (await askChoice(prompts, 'ORM', 'orm', {}));
	const dialect =
		parsed.dialect ?? (await askChoice(prompts, 'Database dialect', 'database.dialect', {}));
	const provider =
		parsed.provider ??
		(await askChoice(prompts, 'Database provider', 'database.provider', {
			database: { dialect }
		}));
	const driver =
		parsed.driver ??
		(await askChoice(prompts, 'Database driver', 'database.driver', {
			database: { dialect, provider }
		}));
	const docker = parsed.docker ?? (await askBoolean(prompts, 'Include Docker support?', false));
	const users = parsed.users ?? (await askBoolean(prompts, 'Include the Users example?', true));
	const install = parsed.install ?? (await askBoolean(prompts, 'Install dependencies?', true));
	const git = parsed.git ?? (await askBoolean(prompts, 'Initialize a Git repository?', true));
	return {
		destination,
		...(projectName === undefined ? {} : { projectName }),
		packageManager,
		ui,
		theme,
		dataPattern,
		validation,
		orm,
		dialect,
		provider,
		driver,
		docker,
		users,
		install,
		git
	};
}

function selectionToRawConfig(selection: CliSelection, cwd: string): RawConfig {
	const destination = requireDestination(selection.destination);
	return {
		projectName: selection.projectName ?? projectNameFromDestination(destination, cwd),
		...(selection.packageManager === undefined ? {} : { packageManager: selection.packageManager }),
		ui: {
			...(selection.ui === undefined ? {} : { adapter: selection.ui }),
			...(selection.theme === undefined ? {} : { theme: selection.theme })
		},
		...(selection.dataPattern === undefined
			? {}
			: { dataPattern: canonicalDataPattern(selection.dataPattern) }),
		...(selection.validation === undefined ? {} : { validation: selection.validation }),
		...(selection.orm === undefined ? {} : { orm: selection.orm }),
		database: {
			...(selection.dialect === undefined ? {} : { dialect: selection.dialect }),
			...(selection.provider === undefined ? {} : { provider: selection.provider }),
			...(selection.driver === undefined ? {} : { driver: selection.driver })
		},
		...(selection.docker === undefined ? {} : { docker: selection.docker }),
		resources: selection.users === undefined ? {} : { users: selection.users }
	};
}

function canonicalDataPattern(value: string): string {
	return dataPatternAliases[value as keyof typeof dataPatternAliases] ?? value;
}

async function askText(
	prompts: PromptAdapter,
	message: string,
	initialValue?: string
): Promise<string> {
	const value = await prompts.text({
		message,
		...(initialValue === undefined ? {} : { initialValue })
	});
	if (typeof value === 'string' && value.trim() === '' && initialValue !== undefined) {
		return initialValue;
	}
	return requirePromptValue(prompts, value);
}

function projectNameFromDestination(destination: string, cwd: string): string {
	return basename(resolve(cwd, destination));
}

function requirePromptText(value: string | undefined): string {
	if (value === undefined) throw new Error('Project name prompt was skipped unexpectedly.');
	return value;
}

async function askChoice(
	prompts: PromptAdapter,
	message: string,
	field: Parameters<typeof getConditionalChoices>[0],
	config: Partial<RawConfig>
): Promise<string> {
	const choices = getConditionalChoices(field, config);
	const initialValue = choices.find((choice) => choice.id === defaultForField(field))?.id;
	return requirePromptValue(
		prompts,
		await prompts.select({
			message,
			options: choices.map((choice) => ({
				label: choice.label,
				value: choice.id,
				hint: choice.description
			})),
			initialValue
		})
	);
}

async function askBoolean(
	prompts: PromptAdapter,
	message: string,
	initialValue: boolean
): Promise<boolean> {
	const value = await prompts.confirm({ message, initialValue });
	if (prompts.isCancel(value)) throw cancelled();
	if (typeof value !== 'boolean')
		throw new CliError({
			code: 'PROMPT_INVALID',
			message: 'The prompt returned an invalid answer.'
		});
	return value;
}

async function confirmRemoteFunctions(prompts: PromptAdapter): Promise<void> {
	prompts.note?.(
		'Remote Functions are experimental upstream and in Metonia; their APIs and generated boundary code may change.',
		'Experimental option'
	);
	const proceed = await askBoolean(prompts, 'Continue with experimental Remote Functions?', false);
	if (!proceed) throw cancelled('Remote Functions were not confirmed.');
}

function requirePromptValue(prompts: PromptAdapter, value: unknown): string {
	if (prompts.isCancel(value)) throw cancelled();
	if (typeof value !== 'string' || value.trim() === '') {
		throw new CliError({
			code: 'PROMPT_INVALID',
			message: 'The prompt returned an invalid answer.'
		});
	}
	return value;
}

function requirePrompts(io: CliIo): PromptAdapter {
	if (!io.prompts) {
		throw new CliError({
			code: 'PROMPTS_UNAVAILABLE',
			message: 'Interactive prompts are unavailable.'
		});
	}
	return io.prompts;
}

function requireDestination(value: string | undefined): string {
	if (!value || value.trim() === '') throw usageError('A project destination is required.');
	return value;
}

function fromGenerationError(error: GenerationErrorDetails): CliError {
	return new CliError({
		code: error.code,
		message: error.message,
		stage: error.stage,
		...(error.recipeId === undefined ? {} : { recipeId: error.recipeId }),
		...(error.checkId === undefined ? {} : { checkId: error.checkId })
	});
}

function toErrorDetails(error: unknown): CliErrorDetails {
	if (error instanceof CliError) return error.details;
	return { code: 'UNEXPECTED_ERROR', message: 'The CLI could not complete safely.' };
}

function emitResult(result: CliResult, io: CliIo, json: boolean): void {
	if (json) {
		if (!result.ok) {
			io.stderr(
				`${result.error.code}: ${result.error.message}${result.error.stage ? ` (stage: ${result.error.stage})` : ''}\n`
			);
		}
		io.stdout(`${JSON.stringify(result)}\n`);
		return;
	}
	if (result.ok) {
		io.stdout(`Created ${result.destination}.\n`);
		return;
	}
	io.stderr(
		`${result.error.code}: ${result.error.message}${result.error.stage ? ` (stage: ${result.error.stage})` : ''}\n`
	);
}

function exitCodeFor(error: CliErrorDetails): number {
	if (error.code === 'CANCELLED') return 130;
	if (error.stage) return 2;
	return 1;
}

function parseToggle(token: string): { name: ToggleName; value: boolean } | undefined {
	const match = /^--(no-)?(docker|users|install|git)$/.exec(token);
	if (!match) return undefined;
	return { name: match[2] as ToggleName, value: match[1] === undefined };
}

function flagToField(token: string): keyof CliSelection | undefined {
	const fields: Readonly<Record<string, keyof CliSelection>> = {
		'--package-manager': 'packageManager',
		'--ui': 'ui',
		'--theme': 'theme',
		'--data-pattern': 'dataPattern',
		'--validation': 'validation',
		'--orm': 'orm',
		'--database': 'dialect',
		'--dialect': 'dialect',
		'--provider': 'provider',
		'--driver': 'driver'
	};
	return fields[token];
}

function setOnce<T extends object, K extends keyof T>(
	target: T,
	key: K,
	value: T[K],
	flag: string
): void {
	if (target[key] !== undefined) throw usageError(`Option "${flag}" was provided more than once.`);
	Object.assign(target, { [key]: value });
}

function usageError(message: string): CliError {
	return new CliError({ code: 'USAGE', message });
}

function cancelled(message = 'Creation cancelled.'): CliError {
	return new CliError({ code: 'CANCELLED', message });
}

const requiredConfigFields = [
	'packageManager',
	'ui',
	'theme',
	'dataPattern',
	'validation',
	'orm',
	'dialect',
	'provider',
	'driver',
	'docker',
	'users'
] as const satisfies readonly (keyof CliSelection)[];

function flagForField(field: (typeof requiredConfigFields)[number]): string {
	const flags: Readonly<Record<(typeof requiredConfigFields)[number], string>> = {
		packageManager: '--package-manager',
		ui: '--ui',
		theme: '--theme',
		dataPattern: '--data-pattern',
		validation: '--validation',
		orm: '--orm',
		dialect: '--database',
		provider: '--provider',
		driver: '--driver',
		docker: '--docker/--no-docker',
		users: '--users/--no-users'
	};
	return flags[field];
}

function defaultForField(field: Parameters<typeof getConditionalChoices>[0]): string {
	const defaults = capabilityRegistry.defaults;
	const values: Readonly<Record<Parameters<typeof getConditionalChoices>[0], string>> = {
		packageManager: defaults.packageManager,
		'ui.adapter': defaults.ui.adapter,
		'ui.theme': defaults.ui.theme,
		dataPattern: defaults.dataPattern,
		validation: defaults.validation,
		orm: defaults.orm,
		'database.dialect': defaults.database.dialect,
		'database.provider': defaults.database.provider,
		'database.driver': defaults.database.driver
	};
	return values[field];
}

export function formatHelp(): string {
	return `create-metonia-admin [destination] [options]

Create a Metonia Admin project.

Run without a destination to choose a project name and a path relative to the current directory.

Options:
  --package-manager <id>  Generated-project package manager
  --ui <id>               UI adapter
  --theme <id>            Theme owned by the selected UI adapter
  --data-pattern <id>     standard | remote-functions (canonical IDs also accepted)
  --validation <id>       Validation adapter
  --orm <id>              ORM adapter
  --database <id>         Database dialect (alias: --dialect)
  --provider <id>         Database provider
  --driver <id>           Database driver
  --docker, --no-docker   Enable or disable Docker output
  --users, --no-users     Include or omit the Users starter resource
  --install, --no-install Install dependencies before publishing the project
  --git, --no-git         Initialize Git before publishing the project
  --yes                   Accept registry defaults for omitted selections
  --json                  Emit exactly one versioned JSON result
  --help                  Show this help`;
}

/** Node-only process adapter. @clack/prompts remains a published runtime dependency. */
export function createNodeCliIo(): CliIo {
	return {
		isInteractive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
		stdout: (value) => process.stdout.write(value),
		stderr: (value) => process.stderr.write(value),
		prompts: createClackPromptAdapter(),
		createActivity: () => spinner({ indicator: 'dots' })
	};
}

function createClackPromptAdapter(): PromptAdapter {
	return {
		text: (options) => text(options),
		select: (options) => select(options),
		confirm: (options) => confirm(options),
		isCancel,
		note
	};
}
