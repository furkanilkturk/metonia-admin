import {
	enableRemoteFunctionsInViteConfig,
	remoteFunctionsViteConfigFragments
} from '../../../adapters/data-patterns/sveltekit-remote-functions/index.js';
import type { Recipe, RecipeContext, StagedValidationContext } from '../../../contracts/index.js';
import { readGeneratorAsset } from '../../assets.js';

const remoteBoundaryAssets = Object.freeze([
	'src/lib/shared/schemas/remoteBoundary.ts',
	'src/lib/shared/types/remoteBoundary.ts',
	'src/lib/server/features/remoteBoundary.ts',
	'src/lib/client/ui/views/remote-boundary/RemoteBoundaryStatus.svelte',
	'src/lib/client/ui/pages/RemoteBoundaryPage.svelte',
	'src/routes/(admin)/remote-boundary/remote-boundary.remote.ts',
	'src/routes/(admin)/remote-boundary/+page.svelte'
]);

export function createSvelteKitRemoteFunctionsRecipe(): Recipe {
	return {
		id: 'data-pattern-sveltekit-remote-functions',
		stage: 'data-pattern',
		async apply(context) {
			assertSupportedRemoteSelection(context);

			for (const path of remoteBoundaryAssets) {
				await context.writeFile(path, await readRemoteAsset(path));
			}

			const viteConfig = await context.readFile('vite.config.ts');
			await context.writeFile('vite.config.ts', enableRemoteFunctionsInViteConfig(viteConfig));

			context.addDocumentFact({
				key: 'dataPattern.boundary',
				value: 'route-local .remote.ts validated query boundary (experimental)'
			});
			context.addDocumentFact({
				key: 'dataPattern.remoteFunctions.scope',
				value: 'query boundary proof only; Users CRUD parity is unavailable'
			});
			context.addDocumentFact({
				key: 'dataPattern.remoteFunctions.status',
				value: 'experimental'
			});
			context.addCheck({
				id: 'data-pattern-sveltekit-remote-functions',
				validate: validateRemoteFunctions
			});
		}
	};
}

function assertSupportedRemoteSelection(context: RecipeContext): void {
	if (context.config.dataPattern !== 'sveltekit-remote-functions') {
		throw new Error('The Remote Functions recipe received another data pattern.');
	}
	if (context.config.validation !== 'zod') {
		throw new Error('The verified Remote Functions boundary currently requires Zod validation.');
	}
	if (context.config.resources.users) {
		throw new Error(
			'The experimental Remote Functions recipe does not yet implement Users CRUD parity; disable Users or select Standard SvelteKit.'
		);
	}
}

async function validateRemoteFunctions(context: StagedValidationContext): Promise<void> {
	if (
		(await Promise.all(remoteBoundaryAssets.map((path) => context.exists(path)))).some(
			(exists) => !exists
		)
	) {
		throw new Error('The generated Remote Functions boundary proof is incomplete.');
	}

	const viteConfig = await context.readFile('vite.config.ts');
	if (
		!viteConfig.includes(remoteFunctionsViteConfigFragments.async) ||
		!viteConfig.includes(remoteFunctionsViteConfigFragments.remoteFunctions) ||
		(await context.exists('svelte.config.js')) ||
		(await context.exists('svelte.config.ts'))
	) {
		throw new Error('Remote Functions are not enabled in the active SvelteKit configuration.');
	}

	const schema = await context.readFile('src/lib/shared/schemas/remoteBoundary.ts');
	if (!schema.includes("from 'zod'") || !schema.includes("z.literal('admin-workbench')")) {
		throw new Error('The Remote Function query argument is not constrained by the shared schema.');
	}

	const boundary = await context.readFile(
		'src/routes/(admin)/remote-boundary/remote-boundary.remote.ts'
	);
	if (
		!boundary.includes("import { query } from '$app/server';") ||
		!boundary.includes('query(remoteBoundaryInputSchema') ||
		!boundary.includes("from '$lib/server/features/remoteBoundary.js'") ||
		boundary.includes('drizzle-orm') ||
		boundary.includes("from 'pg'") ||
		boundary.includes('$env/')
	) {
		throw new Error('The Remote Function module bypasses its validated server-service boundary.');
	}

	const route = await context.readFile('src/routes/(admin)/remote-boundary/+page.svelte');
	if (
		!route.includes("from './remote-boundary.remote.js'") ||
		!route.includes("from '$lib/client/ui/pages/RemoteBoundaryPage.svelte'") ||
		/<(?:main|section|h1|form)\b/.test(route)
	) {
		throw new Error('The Remote Function route is not a thin client-page adapter.');
	}

	for (const path of remoteBoundaryAssets.filter((path) => path.includes('/client/'))) {
		const source = await context.readFile(path);
		if (source.includes('$lib/server') || source.includes('$env/')) {
			throw new Error(`The Remote Functions proof crosses the client boundary: ${path}`);
		}
	}
}

async function readRemoteAsset(path: string): Promise<string> {
	return readGeneratorAsset(`data-patterns/sveltekit-remote-functions/${path}`);
}
