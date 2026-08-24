import type { ResolvedConfig } from '@metonia-admin/registry';

import type { DependencyContribution, DocumentFact, ScriptContribution } from './contributions.js';
import type { RecipeStageId } from './stages.js';

export interface StagedValidationContext {
	config: ResolvedConfig;
	/** Absolute path to a directory created and owned by this generation run. */
	stagingDirectory: string;
	pathFor(relativePath: string): string;
	readFile(relativePath: string): Promise<string>;
	exists(relativePath: string): Promise<boolean>;
}

export interface StagedValidator {
	id: string;
	validate(context: StagedValidationContext): Promise<void> | void;
}

export interface RecipeContext extends StagedValidationContext {
	addCheck(check: StagedValidator): void;
	addDependency(dependency: DependencyContribution): void;
	addDocumentFact(fact: DocumentFact): void;
	addScript(script: ScriptContribution): void;
	ensureDirectory(relativePath: string): Promise<string>;
	writeFile(relativePath: string, contents: string | Uint8Array): Promise<string>;
}

/** A small, filesystem-independent contribution unit. */
export interface Recipe {
	id: string;
	stage: RecipeStageId;
	apply(context: RecipeContext): Promise<void> | void;
}
