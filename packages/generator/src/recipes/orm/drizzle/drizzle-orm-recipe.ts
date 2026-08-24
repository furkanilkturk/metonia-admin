import {
	drizzleDependencies,
	drizzleDevDependencies
} from '../../../adapters/orm/drizzle/index.js';
import type { Recipe, RecipeContext, StagedValidationContext } from '../../../contracts/index.js';
import { readGeneratorAsset } from '../../assets.js';

const usersOrmAssets = Object.freeze([
	'src/lib/server/db/schema/users.ts',
	'src/lib/server/repositories/usersRepository.ts'
]);

const schemaIndexPath = 'src/lib/server/db/schema/index.ts';

export function createDrizzleOrmRecipe(): Recipe {
	return {
		id: 'orm-drizzle',
		stage: 'orm',
		async apply(context) {
			if (context.config.orm !== 'drizzle') {
				throw new Error('The Drizzle recipe received another ORM selection.');
			}
			await context.writeFile('drizzle.config.ts', await readOrmAsset('drizzle.config.ts'));
			await context.writeFile(
				schemaIndexPath,
				context.config.resources.users
					? await readOrmAsset(schemaIndexPath)
					: '/** Add server-only Drizzle schema exports here as resources are introduced. */\nexport {};\n'
			);
			if (context.config.resources.users) {
				for (const path of usersOrmAssets) {
					await context.writeFile(path, await readOrmAsset(path));
				}
			}
			await mergeDependencies(context, drizzleDependencies, 'dependencies');
			await mergeDependencies(context, drizzleDevDependencies, 'devDependencies');
			await mergeScripts(context);
			context.addDocumentFact({
				key: 'orm.drizzle.version',
				value: drizzleDependencies['drizzle-orm']
			});
			context.addDocumentFact({
				key: 'orm.drizzleKit.version',
				value: drizzleDevDependencies['drizzle-kit']
			});
			context.addCheck({ id: 'orm-drizzle', validate: validateDrizzle });
		}
	};
}

async function validateDrizzle(context: StagedValidationContext): Promise<void> {
	const manifest = parseJsonObject(await context.readFile('package.json'));
	const dependencies = getStringRecord(manifest.dependencies);
	const devDependencies = getStringRecord(manifest.devDependencies);
	const scripts = getStringRecord(manifest.scripts);
	if (
		dependencies['drizzle-orm'] !== drizzleDependencies['drizzle-orm'] ||
		devDependencies['drizzle-kit'] !== drizzleDevDependencies['drizzle-kit'] ||
		scripts['db:generate'] !== 'drizzle-kit generate' ||
		scripts['db:migrate'] !== 'drizzle-kit migrate' ||
		scripts['db:check'] !== 'drizzle-kit check'
	) {
		throw new Error('The generated project does not pin the verified Drizzle toolchain.');
	}

	const config = await context.readFile('drizzle.config.ts');
	if (
		!config.includes("dialect: 'postgresql'") ||
		!config.includes("schema: './src/lib/server/db/schema/**/*.ts'") ||
		!config.includes("out: './drizzle'")
	) {
		throw new Error(
			'Drizzle Kit is not configured for the generated server schema and migrations.'
		);
	}

	const schemaIndex = await context.readFile(schemaIndexPath);
	if (
		context.config.resources.users
			? !schemaIndex.includes("export * from './users.js';")
			: schemaIndex.includes("from './users.js'")
	) {
		throw new Error('The Drizzle schema barrel does not match the selected resources.');
	}

	if (context.config.resources.users) {
		const repository = await context.readFile('src/lib/server/repositories/usersRepository.ts');
		if (
			!repository.includes('getDatabase()') ||
			!repository.includes('.where(') ||
			repository.includes('sql.raw') ||
			repository.includes('execute(') ||
			repository.includes('$env/')
		) {
			throw new Error('The Users repository does not use the expected parameterized ORM boundary.');
		}
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

async function mergeScripts(context: RecipeContext): Promise<void> {
	const contributed = {
		'db:check': 'drizzle-kit check',
		'db:generate': 'drizzle-kit generate',
		'db:migrate': 'drizzle-kit migrate'
	};
	const manifest = parseJsonObject(await context.readFile('package.json'));
	manifest.scripts = sortedRecord({ ...getStringRecord(manifest.scripts), ...contributed });
	await context.writeFile('package.json', `${JSON.stringify(manifest, null, '\t')}\n`);
	for (const [name, command] of Object.entries(contributed)) {
		context.addScript({ name, command });
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

async function readOrmAsset(path: string): Promise<string> {
	return readGeneratorAsset(`orm/drizzle/${path}`);
}
