import type { ResolvedConfig } from '@metonia-admin/registry';

import type { CollectedFacts } from './contributions.js';
import type { Recipe } from './recipe.js';
import type { GenerationStageId } from './stages.js';

export type GenerationErrorCode =
	| 'PACKAGE_MANAGER_NOT_IMPLEMENTED'
	| 'UI_ADAPTER_NOT_IMPLEMENTED'
	| 'UI_THEME_NOT_IMPLEMENTED'
	| 'DATA_PATTERN_NOT_IMPLEMENTED'
	| 'VALIDATION_NOT_IMPLEMENTED'
	| 'ORM_NOT_IMPLEMENTED'
	| 'DATABASE_NOT_IMPLEMENTED'
	| 'DOCKER_NOT_IMPLEMENTED'
	| 'USERS_RESOURCE_NOT_IMPLEMENTED'
	| 'PLAN_RESOLUTION_FAILED'
	| 'INVALID_DESTINATION'
	| 'DESTINATION_EXISTS'
	| 'STAGING_CREATE_FAILED'
	| 'STAGING_CLEANUP_FAILED'
	| 'RECIPE_FAILED'
	| 'VALIDATION_FAILED'
	| 'INSTALL_FAILED'
	| 'GIT_INIT_FAILED'
	| 'FINALIZATION_FAILED';

export interface StagedCommandPlan {
	readonly executable: string;
	readonly arguments: readonly string[];
}

export interface StagedOperations {
	readonly install?: StagedCommandPlan;
	readonly initializeGit?: StagedCommandPlan;
}

export interface StagedCommandInvocation extends StagedCommandPlan {
	/** Absolute path to the private staging directory owned by this generation run. */
	readonly cwd: string;
	readonly timeoutMs: number;
}

export type StagedCommandRunner = (invocation: StagedCommandInvocation) => Promise<number>;

export interface GenerateProjectDependencies {
	readonly runCommand?: StagedCommandRunner;
	readonly commandTimeoutMs?: number;
	readonly onProgress?: (event: GenerationProgressEvent) => void;
}

export interface GenerationProgressEvent {
	readonly stage: GenerationStageId;
	readonly status: 'started' | 'completed';
}

/** A safe, serializable error: never expose raw caught Error messages. */
export interface GenerationErrorDetails {
	checkId?: string;
	code: GenerationErrorCode;
	message: string;
	recipeId?: string;
	stage: GenerationStageId;
}

export class GenerationError extends Error {
	readonly checkId?: string;
	readonly code: GenerationErrorCode;
	readonly recipeId?: string;
	readonly stage: GenerationStageId;

	constructor(details: GenerationErrorDetails) {
		super(details.message);
		this.name = 'GenerationError';
		this.checkId = details.checkId;
		this.code = details.code;
		this.recipeId = details.recipeId;
		this.stage = details.stage;
	}

	toDetails(): GenerationErrorDetails {
		return {
			...(this.checkId === undefined ? {} : { checkId: this.checkId }),
			code: this.code,
			message: this.message,
			...(this.recipeId === undefined ? {} : { recipeId: this.recipeId }),
			stage: this.stage
		};
	}
}

export interface GenerateRequest {
	config: ResolvedConfig;
	destination: string;
	recipes: readonly Recipe[];
	validators?: readonly import('./recipe.js').StagedValidator[];
	operations?: StagedOperations;
}

export interface GenerateConfiguredProjectRequest {
	readonly config: ResolvedConfig;
	readonly destination: string;
	readonly install: boolean;
	readonly git: boolean;
}

export interface GenerationStageResult {
	recipeId?: string;
	stage: GenerationStageId;
	status: 'completed';
}

export interface GenerateSuccess {
	config: ResolvedConfig;
	destination: string;
	facts: CollectedFacts;
	ok: true;
	stages: readonly GenerationStageResult[];
}

export interface GenerateFailure {
	destination: string;
	error: GenerationErrorDetails;
	facts: CollectedFacts;
	ok: false;
	stages: readonly GenerationStageResult[];
}

export type GenerateResult = GenerateSuccess | GenerateFailure;
