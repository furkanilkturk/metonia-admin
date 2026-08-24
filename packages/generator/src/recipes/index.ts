export { createArchitectureRecipe } from './architecture/index.js';
export { createAdminCoreRecipe } from './admin-core/index.js';
export { createBaseRecipe, generatedToolVersions } from './base/index.js';
export type { GeneratedToolVersions } from './base/index.js';
export { createPostgresqlDatabaseRecipe } from './database/postgresql/index.js';
export { createSvelteKitStandardRecipe } from './data-patterns/sveltekit-standard/index.js';
export { createSvelteKitRemoteFunctionsRecipe } from './data-patterns/sveltekit-remote-functions/index.js';
export { createDocumentsRecipe } from './documents/index.js';
export { createDockerRecipe } from './docker/index.js';
export { createDrizzleOrmRecipe } from './orm/drizzle/index.js';
export { createUsersResourceRecipe } from './resources/users/index.js';
export {
	createShadcnSvelteThemeRecipe,
	createShadcnSvelteUiRecipe
} from './ui/shadcn-svelte/index.js';
export { createZodValidationRecipe } from './validation/zod/index.js';
