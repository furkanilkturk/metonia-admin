export const generatorPackage = {
	name: '@metonia-admin/generator'
} as const;

export type GeneratorPackage = typeof generatorPackage;

export * from './contracts/index.js';
export { DEFAULT_STAGED_COMMAND_TIMEOUT_MS, generateProject } from './core/index.js';
export {
	createBunRecipePlan,
	createRecipePlan,
	generateConfiguredProject,
	RecipePlanError,
	type BunRecipePlan,
	type GenerateConfiguredProjectDependencies,
	type PackageManagerVersionResolver,
	type RecipePlan,
	type RecipePlanErrorCode
} from './recipe-plan.js';
export {
	formatPackageManagerCommand,
	getForeignLockfiles,
	getImplementedPackageManagerAdapter,
	getPackageManagerAdapter,
	packageManagerLockfiles,
	packageManagerVersions,
	type PackageManagerAdapter,
	type PackageManagerGenerationStatus
} from './adapters/package-managers/index.js';
export {
	createArchitectureRecipe,
	createAdminCoreRecipe,
	createBaseRecipe,
	createDockerRecipe,
	createDocumentsRecipe,
	createDrizzleOrmRecipe,
	createPostgresqlDatabaseRecipe,
	createSvelteKitStandardRecipe,
	createSvelteKitRemoteFunctionsRecipe,
	createShadcnSvelteThemeRecipe,
	createShadcnSvelteUiRecipe,
	createUsersResourceRecipe,
	createZodValidationRecipe,
	generatedToolVersions,
	type GeneratedToolVersions
} from './recipes/index.js';
