import type { Recipe, StagedValidationContext } from '../../../contracts/index.js';
import { readGeneratorAsset } from '../../assets.js';

const standardUsersAssets = Object.freeze([
	'src/lib/server/actions/users.ts',
	'src/routes/(admin)/users/+page.server.ts',
	'src/routes/(admin)/users/+page.svelte',
	'src/routes/(admin)/users/new/+page.server.ts',
	'src/routes/(admin)/users/new/+page.svelte',
	'src/routes/(admin)/users/[id]/+page.server.ts',
	'src/routes/(admin)/users/[id]/+page.svelte',
	'src/routes/(admin)/users/[id]/edit/+page.server.ts',
	'src/routes/(admin)/users/[id]/edit/+page.svelte'
]);

export function createSvelteKitStandardRecipe(): Recipe {
	return {
		id: 'data-pattern-sveltekit-standard',
		stage: 'data-pattern',
		async apply(context) {
			if (context.config.dataPattern !== 'sveltekit-standard') {
				throw new Error('The Standard SvelteKit recipe received another data pattern.');
			}
			if (context.config.resources.users) {
				for (const path of standardUsersAssets) {
					await context.writeFile(path, await readStandardAsset(path));
				}
			}
			context.addDocumentFact({
				key: 'dataPattern.boundary',
				value: '+page.server.ts load functions and form actions'
			});
			context.addCheck({ id: 'data-pattern-sveltekit-standard', validate: validateStandard });
		}
	};
}

async function validateStandard(context: StagedValidationContext): Promise<void> {
	if (!context.config.resources.users) return;
	if (
		(await Promise.all(standardUsersAssets.map((path) => context.exists(path)))).some(
			(exists) => !exists
		)
	) {
		throw new Error('The Standard Users route boundary is incomplete.');
	}

	for (const path of standardUsersAssets.filter((path) => path.endsWith('+page.svelte'))) {
		const source = await context.readFile(path);
		if (
			!source.includes('$lib/client/ui/pages/users/') ||
			/<(?:main|section|h1|form|table)\b/.test(source) ||
			source.includes('$lib/server')
		) {
			throw new Error(`A Standard Users route is not a thin client-page adapter: ${path}`);
		}
	}

	for (const path of standardUsersAssets.filter((path) => path.endsWith('+page.server.ts'))) {
		const source = await context.readFile(path);
		if (
			!source.includes("from '$lib/server/") ||
			source.includes('drizzle-orm') ||
			source.includes("from 'pg'") ||
			source.includes('+server.ts')
		) {
			throw new Error(`A Standard Users server route bypasses its service boundary: ${path}`);
		}
	}

	const dangerRoute = await context.readFile('src/routes/(admin)/users/[id]/+page.server.ts');
	if (
		!dangerRoute.includes('confirmation !== user.email') ||
		!dangerRoute.includes('delete:') ||
		!dangerRoute.includes('disable:')
	) {
		throw new Error('Destructive Users actions are not explicitly guarded.');
	}
}

async function readStandardAsset(path: string): Promise<string> {
	return readGeneratorAsset(`data-patterns/sveltekit-standard/${path}`);
}
