/** Stable lifecycle identifiers exposed to callers and CLI result envelopes. */
export const generationStageIds = [
	'resolve-plan',
	'validate-destination',
	'create-staging',
	'run-recipes',
	'validate-staging',
	'install-dependencies',
	'initialize-git',
	'finalize'
] as const;

export type GenerationStageId = (typeof generationStageIds)[number];

/**
 * Recipes are ordered by this deliberate composition order, then by recipe id.
 * New entries are a public-contract change and must be added deliberately.
 */
export const recipeStageIds = [
	'base',
	'architecture',
	'admin-core',
	'ui',
	'theme',
	'data-pattern',
	'validation',
	'orm',
	'database',
	'docker',
	'resources',
	'documents'
] as const;

export type RecipeStageId = (typeof recipeStageIds)[number];

export const recipeStageOrder = Object.freeze(
	Object.fromEntries(recipeStageIds.map((stage, index) => [stage, index])) as Record<
		RecipeStageId,
		number
	>
);
