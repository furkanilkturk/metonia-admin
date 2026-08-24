import {
	postgresqlDependencies,
	postgresqlDevDependencies
} from '../../../adapters/database/postgresql/index.js';
import type { Recipe, RecipeContext, StagedValidationContext } from '../../../contracts/index.js';
import { readGeneratorAsset } from '../../assets.js';

const databaseAssets = Object.freeze([
	'src/lib/server/db/client.ts',
	'drizzle/0000_create_users.sql',
	'drizzle/meta/_journal.json'
]);

export function createPostgresqlDatabaseRecipe(): Recipe {
	return {
		id: 'database-postgresql-generic-pg',
		stage: 'database',
		async apply(context) {
			if (
				context.config.database.dialect !== 'postgresql' ||
				context.config.database.provider !== 'generic' ||
				context.config.database.driver !== 'pg'
			) {
				throw new Error('The PostgreSQL recipe received an incompatible database selection.');
			}
			await context.writeFile(
				'src/lib/server/db/client.ts',
				await readDatabaseAsset('src/lib/server/db/client.ts')
			);
			if (context.config.resources.users) {
				for (const path of databaseAssets.slice(1)) {
					await context.writeFile(path, await readDatabaseAsset(path));
				}
			}
			await mergeDependencies(context, postgresqlDependencies, 'dependencies');
			await mergeDependencies(context, postgresqlDevDependencies, 'devDependencies');
			context.addDocumentFact({ key: 'database.postgresql.driver', value: 'pg' });
			context.addDocumentFact({
				key: 'database.postgresql.driverVersion',
				value: postgresqlDependencies.pg
			});
			context.addCheck({ id: 'database-postgresql', validate: validatePostgresql });
		}
	};
}

async function validatePostgresql(context: StagedValidationContext): Promise<void> {
	const manifest = parseJsonObject(await context.readFile('package.json'));
	const dependencies = getStringRecord(manifest.dependencies);
	const devDependencies = getStringRecord(manifest.devDependencies);
	if (
		dependencies.pg !== postgresqlDependencies.pg ||
		devDependencies['@types/pg'] !== postgresqlDevDependencies['@types/pg']
	) {
		throw new Error('The generated project does not pin the verified pg driver and types.');
	}

	const client = await context.readFile('src/lib/server/db/client.ts');
	if (
		!client.includes("from '$env/dynamic/private'") ||
		!client.includes('export function getDatabase()') ||
		!client.includes('new Pool(') ||
		/^\s*(?:const|let)\s+\w+\s*=\s*new Pool\(/m.test(client)
	) {
		throw new Error('The PostgreSQL pool must be server-only and lazily initialized.');
	}

	if (context.config.resources.users) {
		const migration = await context.readFile('drizzle/0000_create_users.sql');
		if (!migration.includes('CREATE TABLE "users"') || !migration.includes('UNIQUE')) {
			throw new Error('The committed Users SQL migration is missing or incomplete.');
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

async function readDatabaseAsset(path: string): Promise<string> {
	return readGeneratorAsset(`database/postgresql/${path}`);
}
