import { readFile, readdir } from 'node:fs/promises';
import { relative } from 'node:path';

import type { Recipe, StagedValidationContext } from '../../contracts/index.js';
import { readGeneratorAsset } from '../assets.js';

const architectureModules = Object.freeze({
	'src/lib/client/index.ts':
		'/** Browser-safe application code. Never import $lib/server from this boundary. */\nexport {};\n',
	'src/lib/client/ui/components/index.ts':
		'/** Reusable UI primitives with explicit props and callbacks belong here. */\nexport {};\n',
	'src/lib/client/ui/views/index.ts':
		'/** Page sections composed from components belong here. */\nexport {};\n',
	'src/lib/server/index.ts':
		'/** Server-only services, repositories, private configuration, and integrations. */\nexport {};\n',
	'src/lib/shared/index.ts':
		'/** Runtime-neutral schemas, types, constants, and pure utilities. */\nexport {};\n'
});

export function createArchitectureRecipe(): Recipe {
	return {
		id: 'metonia-architecture',
		stage: 'architecture',
		async apply(context) {
			for (const [path, contents] of Object.entries(architectureModules)) {
				await context.writeFile(path, contents);
			}

			await context.writeFile(
				'src/lib/client/ui/pages/ProjectHomePage.svelte',
				await readCommonAsset('src/lib/client/ui/pages/ProjectHomePage.svelte')
			);
			const route = await readCommonAsset('src/routes/+page.svelte');
			await context.writeFile(
				'src/routes/+page.svelte',
				route.replace('__METONIA_PROJECT_NAME__', context.config.projectName)
			);

			context.addDocumentFact({
				key: 'architecture.boundaries',
				value: 'client -> shared <- server'
			});
			context.addDocumentFact({
				key: 'architecture.ui',
				value: 'components -> views -> pages -> routes'
			});
			context.addCheck({ id: 'architecture-boundaries', validate: validateArchitecture });
		}
	};
}

async function validateArchitecture(context: StagedValidationContext): Promise<void> {
	const requiredPaths = [
		'src/lib/client',
		'src/lib/server',
		'src/lib/shared',
		'src/lib/client/ui/components',
		'src/lib/client/ui/views',
		'src/lib/client/ui/pages',
		'src/lib/client/ui/pages/ProjectHomePage.svelte',
		'src/routes/+page.svelte'
	];
	if (
		(await Promise.all(requiredPaths.map((path) => context.exists(path)))).some((value) => !value)
	) {
		throw new Error('The generated architecture tree is incomplete.');
	}

	const route = await context.readFile('src/routes/+page.svelte');
	if (
		!route.includes("import ProjectHomePage from '$lib/client/ui/pages/ProjectHomePage.svelte';") ||
		!route.includes('<ProjectHomePage ') ||
		/<(?:main|section|h1)\b/.test(route)
	) {
		throw new Error('The root route is not a thin client-page adapter.');
	}

	await assertImportBoundaries(context, 'src/lib/client', ['$lib/server']);
	await assertImportBoundaries(context, 'src/lib/shared', ['$lib/client', '$lib/server']);
	await assertImportBoundaries(context, 'src/lib/client/ui/components', ['/views/', '/pages/']);
	await assertImportBoundaries(context, 'src/lib/client/ui/views', ['/pages/']);

	const packageJson = await context.readFile('package.json');
	if (packageJson.includes('@metonia-admin/')) {
		throw new Error('Generated projects must not depend on a Metonia runtime.');
	}
}

async function assertImportBoundaries(
	context: StagedValidationContext,
	relativeDirectory: string,
	forbiddenFragments: readonly string[]
): Promise<void> {
	const directory = context.pathFor(relativeDirectory);
	const paths = await collectSourceFiles(directory);
	for (const absolutePath of paths) {
		const source = await readFile(absolutePath, 'utf8');
		const importSpecifiers = [...source.matchAll(/(?:from\s+|import\s*\()\s*['"]([^'"]+)/g)].map(
			(match) => match[1] ?? ''
		);
		if (
			importSpecifiers.some((specifier) =>
				forbiddenFragments.some(
					(fragment) =>
						specifier === fragment ||
						specifier.startsWith(`${fragment}/`) ||
						specifier.includes(fragment)
				)
			)
		) {
			throw new Error(
				`Forbidden dependency in ${relative(context.stagingDirectory, absolutePath)}.`
			);
		}
	}
}

async function collectSourceFiles(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { recursive: true, withFileTypes: true });
	return entries
		.filter((entry) => entry.isFile() && /\.(?:svelte|ts|js)$/.test(entry.name))
		.map((entry) => `${entry.parentPath}/${entry.name}`);
}

async function readCommonAsset(path: string): Promise<string> {
	return readGeneratorAsset(`common/${path}`);
}
