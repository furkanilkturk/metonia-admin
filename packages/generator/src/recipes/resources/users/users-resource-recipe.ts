import type { Recipe, StagedValidationContext } from '../../../contracts/index.js';
import { readGeneratorAsset } from '../../assets.js';

const usersResourceAssets = Object.freeze([
	'src/lib/shared/constants/users.ts',
	'src/lib/shared/schemas/users.ts',
	'src/lib/shared/types/users.ts',
	'src/lib/server/services/usersService.ts',
	'src/lib/client/ui/pages/users/usersController.ts',
	'src/lib/client/ui/pages/users/UsersPage.svelte',
	'src/lib/client/ui/pages/users/UserCreatePage.svelte',
	'src/lib/client/ui/pages/users/UserDetailPage.svelte',
	'src/lib/client/ui/pages/users/UserEditPage.svelte',
	'src/lib/client/ui/views/users/UserFilters.svelte',
	'src/lib/client/ui/views/users/UsersTable.svelte',
	'src/lib/client/ui/views/users/UsersPagination.svelte',
	'src/lib/client/ui/views/users/UserForm.svelte',
	'src/lib/client/ui/views/users/UserDetails.svelte',
	'src/lib/client/ui/views/users/UserDangerZone.svelte'
]);

export function createUsersResourceRecipe(): Recipe {
	return {
		id: 'resource-users',
		stage: 'resources',
		async apply(context) {
			if (!context.config.resources.users) {
				throw new Error('The Users recipe was selected while the resource is disabled.');
			}
			for (const path of usersResourceAssets) {
				await context.writeFile(path, await readUsersAsset(path));
			}
			context.addDocumentFact({ key: 'resource.users.behavior', value: 'full-crud' });
			context.addDocumentFact({ key: 'security.authentication', value: 'deferred' });
			context.addCheck({ id: 'resource-users', validate: validateUsersResource });
		}
	};
}

async function validateUsersResource(context: StagedValidationContext): Promise<void> {
	if (
		(await Promise.all(usersResourceAssets.map((path) => context.exists(path)))).some(
			(exists) => !exists
		)
	) {
		throw new Error('The generated Users resource is incomplete.');
	}

	for (const path of usersResourceAssets.filter((path) => path.includes('/client/'))) {
		const source = await context.readFile(path);
		if (source.includes('$lib/server') || source.includes('$env/')) {
			throw new Error(`The Users client surface crosses the server boundary: ${path}`);
		}
	}

	for (const path of usersResourceAssets.filter((path) => path.includes('/shared/'))) {
		const source = await context.readFile(path);
		if (
			source.includes('$lib/client') ||
			source.includes('$lib/server') ||
			source.includes('$env/')
		) {
			throw new Error(`The Users shared contract crosses an application boundary: ${path}`);
		}
	}

	const service = await context.readFile('src/lib/server/services/usersService.ts');
	if (
		service.includes('error.message') ||
		service.includes('String(error)') ||
		service.includes('cause:') ||
		service.includes('DATABASE_URL')
	) {
		throw new Error('The Users service risks exposing an internal database diagnostic.');
	}
}

async function readUsersAsset(path: string): Promise<string> {
	return readGeneratorAsset(`resources/users/${path}`);
}
