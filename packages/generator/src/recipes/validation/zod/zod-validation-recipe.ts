import { zodDependencies } from '../../../adapters/validation/zod/index.js';
import type { Recipe, RecipeContext, StagedValidationContext } from '../../../contracts/index.js';
import { readGeneratorAsset } from '../../assets.js';

export function createZodValidationRecipe(): Recipe {
	return {
		id: 'validation-zod',
		stage: 'validation',
		async apply(context) {
			if (context.config.validation !== 'zod') {
				throw new Error('The Zod recipe received another validation selection.');
			}
			await context.writeFile(
				'src/lib/shared/validation/zod.ts',
				await readValidationAsset('src/lib/shared/validation/zod.ts')
			);
			await mergeDependencies(context, zodDependencies, 'dependencies');
			context.addDocumentFact({ key: 'validation.zod.version', value: zodDependencies.zod });
			context.addCheck({ id: 'validation-zod', validate: validateZod });
		}
	};
}

async function validateZod(context: StagedValidationContext): Promise<void> {
	const manifest = parseJsonObject(await context.readFile('package.json'));
	const dependencies = getStringRecord(manifest.dependencies);
	if (dependencies.zod !== zodDependencies.zod) {
		throw new Error('The generated project does not pin the verified Zod release.');
	}
	const helper = await context.readFile('src/lib/shared/validation/zod.ts');
	if (helper.includes('$lib/client') || helper.includes('$lib/server')) {
		throw new Error('The shared Zod error mapper crosses an application boundary.');
	}
}

async function mergeDependencies(
	context: RecipeContext,
	dependencies: Readonly<Record<string, string>>,
	kind: 'dependencies' | 'devDependencies'
): Promise<void> {
	const manifest = parseJsonObject(await context.readFile('package.json'));
	manifest[kind] = sortedRecord({ ...getStringRecord(manifest[kind]), ...dependencies });
	await context.writeFile('package.json', `${JSON.stringify(manifest, null, '\t')}\n`);
	for (const [name, version] of Object.entries(dependencies)) {
		context.addDependency({ kind, name, version });
	}
}

function parseJsonObject(serialized: string): Record<string, unknown> {
	const value: unknown = JSON.parse(serialized);
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error('Expected a JSON object.');
	}
	return value as Record<string, unknown>;
}

function getStringRecord(value: unknown): Record<string, string> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
	return Object.fromEntries(
		Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
	);
}

function sortedRecord(values: Readonly<Record<string, string>>): Record<string, string> {
	return Object.fromEntries(
		Object.entries(values).sort(([left], [right]) => left.localeCompare(right))
	);
}

async function readValidationAsset(path: string): Promise<string> {
	return readGeneratorAsset(`validation/zod/${path}`);
}
