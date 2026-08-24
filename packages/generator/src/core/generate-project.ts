/// <reference types="bun" />

import { lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, parse, relative, resolve, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import spawn from 'cross-spawn';

import type { CollectedFacts, DependencyKind } from '../contracts/contributions.js';
import type {
	Recipe,
	RecipeContext,
	StagedValidationContext,
	StagedValidator
} from '../contracts/recipe.js';
import {
	GenerationError,
	type GenerateProjectDependencies,
	type GenerateRequest,
	type GenerateResult,
	type GenerationErrorCode,
	type GenerationStageResult,
	type StagedCommandInvocation,
	type StagedCommandPlan,
	type StagedCommandRunner,
	type StagedOperations
} from '../contracts/result.js';
import { recipeStageOrder } from '../contracts/stages.js';

export const DEFAULT_STAGED_COMMAND_TIMEOUT_MS = 300_000;

interface DestinationState {
	destination: string;
	exists: boolean;
	parent: string;
}

class FactsCollector {
	readonly checks = new Map<string, StagedValidator>();
	readonly dependencies = {
		dependencies: new Map<string, string>(),
		devDependencies: new Map<string, string>()
	};
	readonly documentFacts = new Map<string, string>();
	readonly scripts = new Map<string, string>();

	addCheck(check: StagedValidator): void {
		if (!isNonEmpty(check.id) || this.checks.has(check.id)) {
			throw new Error('Duplicate or invalid check contribution.');
		}
		this.checks.set(check.id, check);
	}

	addDependency({
		kind,
		name,
		version
	}: {
		kind: DependencyKind;
		name: string;
		version: string;
	}): void {
		addUnique(this.dependencies[kind], name, version, 'dependency');
	}

	addDocumentFact({ key, value }: { key: string; value: string }): void {
		addUnique(this.documentFacts, key, value, 'document fact');
	}

	addScript({ command, name }: { command: string; name: string }): void {
		addUnique(this.scripts, name, command, 'script');
	}

	toFacts(): CollectedFacts {
		return Object.freeze({
			checks: Object.freeze([...this.checks.keys()].sort()),
			dependencies: Object.freeze({
				dependencies: toSortedRecord(this.dependencies.dependencies),
				devDependencies: toSortedRecord(this.dependencies.devDependencies)
			}),
			documentFacts: toSortedRecord(this.documentFacts),
			scripts: toSortedRecord(this.scripts)
		});
	}
}

/**
 * Executes a resolved generation plan without any shell invocation. The input config
 * is intentionally not resolved or revalidated here: that belongs to the registry.
 */
export async function generateProject(
	request: GenerateRequest,
	dependencies: GenerateProjectDependencies = {}
): Promise<GenerateResult> {
	const facts = new FactsCollector();
	const stages: GenerationStageResult[] = [];
	let destination = safeDestinationLabel(request.destination);
	let stagingDirectory: string | undefined;

	try {
		const orderedRecipes = orderRecipes(request.recipes);
		const operations = validateOperations(request.operations);
		const commandTimeoutMs = validateCommandTimeout(dependencies.commandTimeoutMs);
		const destinationState = await inspectDestination(request.destination);
		destination = destinationState.destination;
		stages.push({ stage: 'validate-destination', status: 'completed' });

		try {
			stagingDirectory = await createStagingDirectory(destinationState);
		} catch {
			throw generationError(
				'STAGING_CREATE_FAILED',
				'create-staging',
				'Unable to create a private staging directory.'
			);
		}
		stages.push({ stage: 'create-staging', status: 'completed' });

		const context = createRecipeContext(request.config, stagingDirectory, facts);
		for (const recipe of orderedRecipes) {
			try {
				await recipe.apply(context);
				await assertStagedTreeContainsNoSymlinks(stagingDirectory);
			} catch {
				throw generationError('RECIPE_FAILED', 'run-recipes', 'A recipe could not complete.', {
					recipeId: recipe.id
				});
			}
			stages.push({ recipeId: recipe.id, stage: 'run-recipes', status: 'completed' });
		}

		const validators = [...(request.validators ?? []), ...facts.checks.values()].sort(
			(left, right) => left.id.localeCompare(right.id)
		);
		for (const validator of validators) {
			try {
				await validator.validate(context);
			} catch {
				throw generationError(
					'VALIDATION_FAILED',
					'validate-staging',
					'A staged output check failed.',
					{ checkId: validator.id }
				);
			}
		}
		stages.push({ stage: 'validate-staging', status: 'completed' });

		if (operations.install !== undefined) {
			await executeStagedCommand(
				operations.install,
				stagingDirectory,
				dependencies.runCommand ?? runCommand,
				commandTimeoutMs,
				'INSTALL_FAILED',
				'install-dependencies',
				'Dependency installation could not complete.'
			);
			stages.push({ stage: 'install-dependencies', status: 'completed' });
		}

		if (operations.initializeGit !== undefined) {
			await executeStagedCommand(
				operations.initializeGit,
				stagingDirectory,
				dependencies.runCommand ?? runCommand,
				commandTimeoutMs,
				'GIT_INIT_FAILED',
				'initialize-git',
				'Git initialization could not complete.'
			);
			stages.push({ stage: 'initialize-git', status: 'completed' });
		}

		try {
			await finalizeStaging(destinationState, stagingDirectory);
			stagingDirectory = undefined;
		} catch {
			throw generationError(
				'FINALIZATION_FAILED',
				'finalize',
				'Unable to publish the staged project safely.'
			);
		}
		stages.push({ stage: 'finalize', status: 'completed' });

		return { config: request.config, destination, facts: facts.toFacts(), ok: true, stages };
	} catch (error) {
		let cleanupFailed = false;
		if (stagingDirectory !== undefined) {
			try {
				await removeOwnedStagingDirectory(stagingDirectory);
			} catch {
				cleanupFailed = true;
			}
		}

		const safeError =
			error instanceof GenerationError
				? error
				: generationError(
						'INVALID_DESTINATION',
						'validate-destination',
						'The destination is not safe to use.'
					);
		if (cleanupFailed) {
			const cleanupError = generationError(
				'STAGING_CLEANUP_FAILED',
				safeError.stage,
				'Generation failed and its private staging directory could not be removed safely.',
				{
					...(safeError.checkId === undefined ? {} : { checkId: safeError.checkId }),
					...(safeError.recipeId === undefined ? {} : { recipeId: safeError.recipeId })
				}
			);
			return {
				destination,
				error: cleanupError.toDetails(),
				facts: facts.toFacts(),
				ok: false,
				stages
			};
		}
		return { destination, error: safeError.toDetails(), facts: facts.toFacts(), ok: false, stages };
	}
}

function validateOperations(operations: StagedOperations | undefined): StagedOperations {
	if (operations?.install !== undefined) validateCommandPlan(operations.install);
	if (operations?.initializeGit !== undefined) validateCommandPlan(operations.initializeGit);
	return operations ?? {};
}

function validateCommandPlan(command: StagedCommandPlan): void {
	if (
		!isNonEmpty(command.executable) ||
		command.executable.includes('\0') ||
		!Array.isArray(command.arguments) ||
		command.arguments.some((argument) => typeof argument !== 'string' || argument.includes('\0'))
	) {
		throw generationError(
			'PLAN_RESOLUTION_FAILED',
			'resolve-plan',
			'The generated command plan is invalid.'
		);
	}
}

function validateCommandTimeout(timeoutMs: number | undefined): number {
	const selectedTimeout = timeoutMs ?? DEFAULT_STAGED_COMMAND_TIMEOUT_MS;
	if (!Number.isSafeInteger(selectedTimeout) || selectedTimeout <= 0) {
		throw generationError(
			'PLAN_RESOLUTION_FAILED',
			'resolve-plan',
			'The generated command timeout is invalid.'
		);
	}
	return selectedTimeout;
}

async function executeStagedCommand(
	command: StagedCommandPlan,
	stagingDirectory: string,
	runner: StagedCommandRunner,
	timeoutMs: number,
	code: 'INSTALL_FAILED' | 'GIT_INIT_FAILED',
	stage: 'install-dependencies' | 'initialize-git',
	message: string
): Promise<void> {
	let exitCode: number;
	try {
		exitCode = await runner({ ...command, cwd: stagingDirectory, timeoutMs });
	} catch {
		throw generationError(code, stage, message);
	}
	if (!Number.isInteger(exitCode) || exitCode !== 0) {
		throw generationError(code, stage, message);
	}
}

function runCommand(invocation: StagedCommandInvocation): Promise<number> {
	return new Promise((resolveExitCode, rejectExitCode) => {
		const child = spawn(invocation.executable, invocation.arguments, {
			cwd: invocation.cwd,
			shell: false,
			stdio: 'ignore',
			windowsHide: true
		});
		let timedOut = false;
		const timeout = setTimeout(() => {
			timedOut = true;
			child.kill('SIGKILL');
		}, invocation.timeoutMs);
		child.once('error', (error) => {
			clearTimeout(timeout);
			rejectExitCode(error);
		});
		child.once('close', (code) => {
			clearTimeout(timeout);
			if (timedOut) {
				rejectExitCode(new Error('The staged command timed out.'));
				return;
			}
			resolveExitCode(code ?? -1);
		});
	});
}

function createRecipeContext(
	config: GenerateRequest['config'],
	stagingDirectory: string,
	facts: FactsCollector
): RecipeContext {
	const pathFor = (relativePath: string): string => guardedPath(stagingDirectory, relativePath);
	const base: StagedValidationContext = {
		config,
		stagingDirectory,
		pathFor,
		readFile: async (relativePath) => {
			const outputPath = pathFor(relativePath);
			await assertStagedPathContainsNoSymlinks(stagingDirectory, outputPath);
			return readFile(outputPath, 'utf8');
		},
		exists: async (relativePath) => {
			const outputPath = pathFor(relativePath);
			await assertStagedPathContainsNoSymlinks(stagingDirectory, outputPath);
			return pathExists(outputPath);
		}
	};

	return {
		...base,
		addCheck: (check) => facts.addCheck(check),
		addDependency: (dependency) => facts.addDependency(dependency),
		addDocumentFact: (fact) => facts.addDocumentFact(fact),
		addScript: (script) => facts.addScript(script),
		ensureDirectory: async (relativePath) => {
			const outputPath = pathFor(relativePath);
			await assertStagedPathContainsNoSymlinks(stagingDirectory, outputPath);
			await mkdir(outputPath, { recursive: true });
			await assertStagedPathContainsNoSymlinks(stagingDirectory, outputPath);
			return outputPath;
		},
		writeFile: async (relativePath, contents) => {
			const outputPath = pathFor(relativePath);
			await assertStagedPathContainsNoSymlinks(stagingDirectory, outputPath);
			await mkdir(dirname(outputPath), { recursive: true });
			await assertStagedPathContainsNoSymlinks(stagingDirectory, outputPath);
			await writeFile(outputPath, contents);
			return outputPath;
		}
	};
}

function orderRecipes(recipes: readonly Recipe[]): readonly Recipe[] {
	const ids = new Set<string>();
	for (const recipe of recipes) {
		if (
			!isNonEmpty(recipe.id) ||
			ids.has(recipe.id) ||
			recipeStageOrder[recipe.stage] === undefined
		) {
			throw generationError('RECIPE_FAILED', 'run-recipes', 'The recipe plan is invalid.', {
				recipeId: recipe.id
			});
		}
		ids.add(recipe.id);
	}
	return [...recipes].sort(
		(left, right) =>
			recipeStageOrder[left.stage] - recipeStageOrder[right.stage] ||
			left.id.localeCompare(right.id)
	);
}

async function inspectDestination(input: string): Promise<DestinationState> {
	if (!isNonEmpty(input)) {
		throw generationError(
			'INVALID_DESTINATION',
			'validate-destination',
			'The destination is not safe to use.'
		);
	}
	const destination = resolve(input);
	const parent = dirname(destination);
	if (destination === parent || basename(destination) === '') {
		throw generationError(
			'INVALID_DESTINATION',
			'validate-destination',
			'The destination is not safe to use.'
		);
	}
	await assertPathContainsNoSymlink(parent);

	let parentStat: Awaited<ReturnType<typeof lstat>>;
	try {
		parentStat = await lstat(parent);
	} catch {
		throw generationError(
			'INVALID_DESTINATION',
			'validate-destination',
			'The destination parent does not exist.'
		);
	}
	if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) {
		throw generationError(
			'INVALID_DESTINATION',
			'validate-destination',
			'The destination parent is not a directory.'
		);
	}

	try {
		const stat = await lstat(destination);
		if (!stat.isDirectory() || stat.isSymbolicLink()) {
			throw generationError(
				'DESTINATION_EXISTS',
				'validate-destination',
				'The destination is already occupied.'
			);
		}
		const entries = await readdir(destination);
		if (entries.length !== 0) {
			throw generationError(
				'DESTINATION_EXISTS',
				'validate-destination',
				'The destination directory is not empty.'
			);
		}
		return { destination, exists: true, parent };
	} catch (error) {
		if (error instanceof GenerationError) {
			throw error;
		}
		if (errorCode(error) === 'ENOENT') {
			return { destination, exists: false, parent };
		}
		throw generationError(
			'INVALID_DESTINATION',
			'validate-destination',
			'The destination cannot be inspected safely.'
		);
	}
}

async function assertPathContainsNoSymlink(path: string): Promise<void> {
	const absolutePath = resolve(path);
	const root = parse(absolutePath).root;
	let currentPath = root;
	for (const segment of relative(root, absolutePath).split(sep).filter(Boolean)) {
		currentPath = join(currentPath, segment);
		try {
			if ((await lstat(currentPath)).isSymbolicLink()) {
				throw generationError(
					'INVALID_DESTINATION',
					'validate-destination',
					'The destination parent chain must not contain symbolic links.'
				);
			}
		} catch (error) {
			if (error instanceof GenerationError) throw error;
			if (errorCode(error) === 'ENOENT') return;
			throw generationError(
				'INVALID_DESTINATION',
				'validate-destination',
				'The destination parent chain cannot be inspected safely.'
			);
		}
	}
}

async function createStagingDirectory(destination: DestinationState): Promise<string> {
	const prefix = join(destination.parent, `.${basename(destination.destination)}.metonia-staging-`);
	const stagingDirectory = await mkdtemp(prefix);
	if (
		!isOwnedStagingDirectory(
			stagingDirectory,
			destination.parent,
			basename(destination.destination)
		)
	) {
		throw new Error('Unexpected staging location.');
	}
	return stagingDirectory;
}

async function finalizeStaging(
	destination: DestinationState,
	stagingDirectory: string
): Promise<void> {
	if (
		!isOwnedStagingDirectory(
			stagingDirectory,
			destination.parent,
			basename(destination.destination)
		)
	) {
		throw new Error('Unowned staging location.');
	}

	if (!destination.exists) {
		if (await pathExists(destination.destination)) {
			throw new Error('Destination changed before publication.');
		}
		await renameWithTransientRetry(stagingDirectory, destination.destination);
		return;
	}

	// An existing empty directory keeps its identity. Every top-level rename is
	// reversible; on an error we return moved entries to our staging directory.
	if (!(await isEmptyDirectory(destination.destination))) {
		throw new Error('Destination changed before publication.');
	}
	const entryNames = (await readdir(stagingDirectory)).sort((left, right) =>
		left.localeCompare(right)
	);
	const moved: string[] = [];
	try {
		for (const entryName of entryNames) {
			if (await pathExists(join(destination.destination, entryName))) {
				throw new Error('Destination changed during publication.');
			}
			await renameWithTransientRetry(
				join(stagingDirectory, entryName),
				join(destination.destination, entryName)
			);
			moved.push(entryName);
		}
		await removeOwnedStagingDirectory(stagingDirectory);
	} catch {
		let rollbackFailed = false;
		for (const entryName of moved.reverse()) {
			try {
				await renameWithTransientRetry(
					join(destination.destination, entryName),
					join(stagingDirectory, entryName)
				);
			} catch {
				rollbackFailed = true;
			}
		}
		throw new Error(
			rollbackFailed
				? 'Publication could not be rolled back.'
				: 'Publication was rolled back safely.'
		);
	}
}

const TRANSIENT_RENAME_CODES = new Set(['EACCES', 'EBUSY', 'EPERM']);

async function renameWithTransientRetry(source: string, destination: string): Promise<void> {
	for (let attempt = 0; ; attempt += 1) {
		try {
			await rename(source, destination);
			return;
		} catch (error) {
			if (attempt >= 7 || !TRANSIENT_RENAME_CODES.has(errorCode(error) ?? '')) throw error;
			await delay(25 * 2 ** attempt);
		}
	}
}

async function removeOwnedStagingDirectory(stagingDirectory: string): Promise<void> {
	const parent = dirname(stagingDirectory);
	const stageBase = basename(stagingDirectory);
	if (!stageBase.includes('.metonia-staging-') || resolve(parent) !== parent) {
		throw new Error('Refusing unsafe staging cleanup.');
	}
	const stat = await lstat(stagingDirectory);
	if (!stat.isDirectory() || stat.isSymbolicLink()) {
		throw new Error('Refusing non-directory staging cleanup.');
	}
	await rm(stagingDirectory, { force: false, recursive: true });
}

function guardedPath(stagingDirectory: string, requestedPath: string): string {
	if (!isNonEmpty(requestedPath) || isAbsolute(requestedPath)) {
		throw new Error('Path must be a relative child path.');
	}
	const normalized = requestedPath.replace(/[\\/]+/g, sep);
	const outputPath = resolve(stagingDirectory, normalized);
	const relation = relative(stagingDirectory, outputPath);
	if (
		relation === '' ||
		relation === '..' ||
		relation.startsWith(`..${sep}`) ||
		isAbsolute(relation)
	) {
		throw new Error('Path escapes staging.');
	}
	return outputPath;
}

async function assertStagedPathContainsNoSymlinks(
	stagingDirectory: string,
	outputPath: string
): Promise<void> {
	const relation = relative(stagingDirectory, outputPath);
	let currentPath = stagingDirectory;
	for (const segment of relation.split(sep)) {
		currentPath = join(currentPath, segment);
		try {
			const stat = await lstat(currentPath);
			if (stat.isSymbolicLink()) {
				throw new Error('Symbolic links are not allowed in the staged tree.');
			}
		} catch (error) {
			if (errorCode(error) === 'ENOENT') return;
			throw error;
		}
	}
}

async function assertStagedTreeContainsNoSymlinks(stagingDirectory: string): Promise<void> {
	const entries = await readdir(stagingDirectory, { recursive: true, withFileTypes: true });
	if (entries.some((entry) => entry.isSymbolicLink())) {
		throw new Error('Symbolic links are not allowed in the staged tree.');
	}
}

function isOwnedStagingDirectory(
	stagingDirectory: string,
	parent: string,
	destinationBase: string
): boolean {
	return (
		dirname(stagingDirectory) === parent &&
		basename(stagingDirectory).startsWith(`.${destinationBase}.metonia-staging-`)
	);
}

async function isEmptyDirectory(path: string): Promise<boolean> {
	try {
		const stat = await lstat(path);
		return stat.isDirectory() && !stat.isSymbolicLink() && (await readdir(path)).length === 0;
	} catch {
		return false;
	}
}

async function pathExists(path: string): Promise<boolean> {
	try {
		await lstat(path);
		return true;
	} catch {
		return false;
	}
}

function addUnique(target: Map<string, string>, key: string, value: string, label: string): void {
	if (!isNonEmpty(key) || !isNonEmpty(value) || (target.has(key) && target.get(key) !== value)) {
		throw new Error(`Invalid or conflicting ${label} contribution.`);
	}
	target.set(key, value);
}

function toSortedRecord(map: ReadonlyMap<string, string>): Readonly<Record<string, string>> {
	return Object.freeze(
		Object.fromEntries([...map.entries()].sort(([left], [right]) => left.localeCompare(right)))
	);
}

function generationError(
	code: GenerationErrorCode,
	stage: GenerationError['stage'],
	message: string,
	identifiers?: Pick<GenerationError, 'checkId' | 'recipeId'>
): GenerationError {
	return new GenerationError({
		code,
		message,
		...(identifiers?.checkId === undefined ? {} : { checkId: identifiers.checkId }),
		...(identifiers?.recipeId === undefined ? {} : { recipeId: identifiers.recipeId }),
		stage
	});
}

function isNonEmpty(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

function safeDestinationLabel(destination: unknown): string {
	return typeof destination === 'string' ? destination : '';
}

function errorCode(error: unknown): string | undefined {
	if (typeof error === 'object' && error !== null && 'code' in error) {
		const { code } = error;
		return typeof code === 'string' ? code : undefined;
	}
	return undefined;
}
