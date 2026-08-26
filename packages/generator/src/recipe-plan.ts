import type { PackageManagerId, ResolvedConfig } from '@metonia-admin/registry';
import spawn from 'cross-spawn';

import {
	getPackageManagerAdapter,
	type PackageManagerAdapter
} from './adapters/package-managers/index.js';
import type {
	GenerateConfiguredProjectRequest,
	GenerateProjectDependencies,
	GenerateResult,
	Recipe,
	StagedCommandPlan
} from './contracts/index.js';
import { generateProject } from './core/index.js';
import { createAdminCoreRecipe } from './recipes/admin-core/index.js';
import { createArchitectureRecipe } from './recipes/architecture/index.js';
import { createBaseRecipe } from './recipes/base/index.js';
import { createPostgresqlDatabaseRecipe } from './recipes/database/postgresql/index.js';
import { createSvelteKitRemoteFunctionsRecipe } from './recipes/data-patterns/sveltekit-remote-functions/index.js';
import { createSvelteKitStandardRecipe } from './recipes/data-patterns/sveltekit-standard/index.js';
import { createDockerRecipe } from './recipes/docker/index.js';
import { createDocumentsRecipe } from './recipes/documents/index.js';
import { createDrizzleOrmRecipe } from './recipes/orm/drizzle/index.js';
import { createUsersResourceRecipe } from './recipes/resources/users/index.js';
import {
	createShadcnSvelteThemeRecipe,
	createShadcnSvelteUiRecipe
} from './recipes/ui/shadcn-svelte/index.js';
import { createZodValidationRecipe } from './recipes/validation/zod/index.js';

export type RecipePlanErrorCode =
	| 'PACKAGE_MANAGER_NOT_IMPLEMENTED'
	| 'UI_ADAPTER_NOT_IMPLEMENTED'
	| 'UI_THEME_NOT_IMPLEMENTED'
	| 'DATA_PATTERN_NOT_IMPLEMENTED'
	| 'VALIDATION_NOT_IMPLEMENTED'
	| 'ORM_NOT_IMPLEMENTED'
	| 'DATABASE_NOT_IMPLEMENTED'
	| 'DOCKER_NOT_IMPLEMENTED'
	| 'USERS_RESOURCE_NOT_IMPLEMENTED';

export class RecipePlanError extends Error {
	readonly code: RecipePlanErrorCode;

	constructor(code: RecipePlanErrorCode, message: string) {
		super(message);
		this.name = 'RecipePlanError';
		this.code = code;
	}
}

export interface RecipePlan {
	readonly packageManager: PackageManagerId;
	readonly packageManagerAdapter: PackageManagerAdapter;
	readonly recipes: readonly Recipe[];
	readonly installCommand: StagedCommandPlan;
}

export interface BunRecipePlan extends RecipePlan {
	readonly packageManager: 'bun';
}

export type PackageManagerVersionResolver = (adapter: PackageManagerAdapter) => Promise<string>;

export interface GenerateConfiguredProjectDependencies extends GenerateProjectDependencies {
	readonly resolvePackageManagerVersion?: PackageManagerVersionResolver;
}

/**
 * Resolves a complete, package-manager-aware application plan before the generator creates
 * staging output. Unsupported combinations fail here rather than after partial recipes run.
 */
export function createRecipePlan(config: ResolvedConfig): RecipePlan {
	const packageManager = getPackageManagerAdapter(config.packageManager);
	if (packageManager.generationStatus !== 'implemented') {
		throw new RecipePlanError(
			'PACKAGE_MANAGER_NOT_IMPLEMENTED',
			packageManager.blocker ?? `${packageManager.label} generation is unavailable.`
		);
	}
	if (config.ui.adapter !== 'shadcn-svelte') {
		throw new RecipePlanError(
			'UI_ADAPTER_NOT_IMPLEMENTED',
			`The executable recipe plan does not implement the "${config.ui.adapter}" UI adapter.`
		);
	}
	if (config.validation !== 'zod') {
		throw new RecipePlanError(
			'VALIDATION_NOT_IMPLEMENTED',
			`The executable recipe plan does not implement the "${config.validation}" validation adapter.`
		);
	}
	if (config.orm !== 'drizzle') {
		throw new RecipePlanError(
			'ORM_NOT_IMPLEMENTED',
			`The executable recipe plan does not implement the "${config.orm}" ORM adapter.`
		);
	}
	if (
		config.database.dialect !== 'postgresql' ||
		config.database.provider !== 'generic' ||
		config.database.driver !== 'pg'
	) {
		throw new RecipePlanError(
			'DATABASE_NOT_IMPLEMENTED',
			`The executable recipe plan does not implement ${config.database.dialect}/${config.database.provider}/${config.database.driver}.`
		);
	}
	if (
		config.dataPattern !== 'sveltekit-standard' &&
		config.dataPattern !== 'sveltekit-remote-functions'
	) {
		throw new RecipePlanError(
			'DATA_PATTERN_NOT_IMPLEMENTED',
			`The executable recipe plan does not implement the "${config.dataPattern}" data boundary.`
		);
	}
	if (config.dataPattern === 'sveltekit-remote-functions' && config.resources.users) {
		throw new RecipePlanError(
			'USERS_RESOURCE_NOT_IMPLEMENTED',
			'The experimental Remote Functions query proof does not implement Users CRUD parity; disable Users or select Standard SvelteKit.'
		);
	}
	if (config.docker && packageManager.docker === undefined) {
		throw new RecipePlanError(
			'DOCKER_NOT_IMPLEMENTED',
			`Docker output is unavailable for the "${config.packageManager}" package-manager adapter.`
		);
	}

	const recipes: Recipe[] = [
		createBaseRecipe(),
		createArchitectureRecipe(),
		createAdminCoreRecipe(),
		createShadcnSvelteUiRecipe(),
		createShadcnSvelteThemeRecipe(),
		config.dataPattern === 'sveltekit-standard'
			? createSvelteKitStandardRecipe()
			: createSvelteKitRemoteFunctionsRecipe(),
		createZodValidationRecipe(),
		createDrizzleOrmRecipe(),
		createPostgresqlDatabaseRecipe(),
		...(config.docker ? [createDockerRecipe()] : []),
		...(config.resources.users ? [createUsersResourceRecipe()] : []),
		createDocumentsRecipe()
	];

	return Object.freeze({
		packageManager: packageManager.id,
		packageManagerAdapter: packageManager,
		installCommand: packageManager.installCommand,
		recipes: Object.freeze(recipes)
	});
}

/** Backward-compatible Bun entry point for callers that deliberately require the primary manager. */
export function createBunRecipePlan(config: ResolvedConfig): BunRecipePlan {
	if (config.packageManager !== 'bun') {
		throw new RecipePlanError(
			'PACKAGE_MANAGER_NOT_IMPLEMENTED',
			`The Bun recipe plan cannot execute the "${config.packageManager}" package-manager selection.`
		);
	}
	return createRecipePlan(config) as BunRecipePlan;
}

/**
 * Resolves an executable plan before touching the filesystem, then delegates all staging and
 * publication work to the transactional generator core.
 */
export async function generateConfiguredProject(
	request: GenerateConfiguredProjectRequest,
	dependencies: GenerateConfiguredProjectDependencies = {}
): Promise<GenerateResult> {
	let plan: RecipePlan;
	reportPlanProgress(dependencies, 'started');
	try {
		plan = createRecipePlan(request.config);
	} catch (error) {
		const code =
			error instanceof RecipePlanError ? error.code : ('PLAN_RESOLUTION_FAILED' as const);
		const message =
			error instanceof RecipePlanError
				? error.message
				: 'The requested generation plan is not available.';
		return {
			destination: request.destination,
			error: {
				code,
				message,
				stage: 'resolve-plan'
			},
			facts: emptyFacts(),
			ok: false,
			stages: []
		};
	}
	if (request.install) {
		let installedVersion: string;
		try {
			installedVersion = (
				await (dependencies.resolvePackageManagerVersion ?? resolvePackageManagerVersion)(
					plan.packageManagerAdapter
				)
			).trim();
		} catch {
			return planFailure(
				request.destination,
				'PACKAGE_MANAGER_VERSION_CHECK_FAILED',
				`Unable to verify ${plan.packageManagerAdapter.label} ${plan.packageManagerAdapter.version}. Make sure that exact version is available and retry.`
			);
		}
		if (installedVersion !== plan.packageManagerAdapter.version) {
			return planFailure(
				request.destination,
				'PACKAGE_MANAGER_VERSION_MISMATCH',
				`${plan.packageManagerAdapter.label} ${plan.packageManagerAdapter.version} is required, but ${safeVersionLabel(installedVersion)} is active. Activate the required version and retry.`
			);
		}
	}
	reportPlanProgress(dependencies, 'completed');

	const result = await generateProject(
		{
			config: request.config,
			destination: request.destination,
			recipes: plan.recipes,
			operations: {
				...(request.install ? { install: plan.installCommand } : {}),
				...(request.git
					? {
							initializeGit: {
								executable: 'git',
								arguments: Object.freeze(['init', '--quiet'])
							}
						}
					: {})
			}
		},
		dependencies
	);
	return {
		...result,
		stages: [{ stage: 'resolve-plan', status: 'completed' }, ...result.stages]
	};
}

function reportPlanProgress(
	dependencies: GenerateProjectDependencies,
	status: 'started' | 'completed'
): void {
	try {
		dependencies.onProgress?.(Object.freeze({ stage: 'resolve-plan', status }));
	} catch {
		// Progress observers are presentation-only and must not affect plan resolution.
	}
}

function emptyFacts(): GenerateResult['facts'] {
	return {
		checks: [],
		dependencies: { dependencies: {}, devDependencies: {} },
		documentFacts: {},
		scripts: {}
	};
}

function planFailure(
	destination: string,
	code: 'PACKAGE_MANAGER_VERSION_CHECK_FAILED' | 'PACKAGE_MANAGER_VERSION_MISMATCH',
	message: string
): GenerateResult {
	return {
		destination,
		error: { code, message, stage: 'resolve-plan' },
		facts: emptyFacts(),
		ok: false,
		stages: []
	};
}

function resolvePackageManagerVersion(adapter: PackageManagerAdapter): Promise<string> {
	return new Promise((resolveVersion, rejectVersion) => {
		const child = spawn(adapter.versionCommand.executable, adapter.versionCommand.arguments, {
			shell: false,
			stdio: ['ignore', 'pipe', 'ignore'],
			windowsHide: true
		});
		let stdout = '';
		const timeout = setTimeout(() => {
			child.kill('SIGKILL');
			rejectVersion(new Error('Package-manager version check timed out.'));
		}, 10_000);
		child.stdout?.setEncoding('utf8');
		child.stdout?.on('data', (chunk: string) => {
			if (stdout.length < 256) stdout += chunk;
		});
		child.once('error', (error) => {
			clearTimeout(timeout);
			rejectVersion(error);
		});
		child.once('close', (code) => {
			clearTimeout(timeout);
			if (code !== 0) {
				rejectVersion(new Error('Package-manager version check failed.'));
				return;
			}
			resolveVersion(stdout.trim());
		});
	});
}

function safeVersionLabel(version: string): string {
	return /^[A-Za-z0-9._+-]{1,64}$/.test(version) ? version : 'an unexpected version';
}
