import { renderGeneratedConfigModule, type PackageManagerId } from '@metonia-admin/registry';

import {
	formatPackageManagerCommand,
	getImplementedPackageManagerAdapter,
	type PackageManagerAdapter
} from '../../adapters/package-managers/index.js';
import type { Recipe, RecipeContext, StagedValidationContext } from '../../contracts/index.js';
import { readGeneratorAsset } from '../assets.js';
import { generatedToolVersions } from '../base/index.js';

interface DocumentCommands {
	readonly build: string;
	readonly check: string;
	readonly dbGenerate: string;
	readonly dbMigrate: string;
	readonly dev: string;
	readonly install: string;
	readonly lint: string;
	readonly start: string;
	readonly test: string;
}

export function createDocumentsRecipe(): Recipe {
	return {
		id: 'generated-documents',
		stage: 'documents',
		async apply(context) {
			const packageManager = getImplementedPackageManagerAdapter(context.config.packageManager);
			const commands = documentCommands(packageManager);
			const replacements = documentReplacements(context, packageManager, commands);
			await context.writeFile(
				'metonia-admin.config.ts',
				renderGeneratedConfigModule(context.config)
			);
			await context.writeFile(
				'README.md',
				renderTemplate(await readDocumentAsset('README.md'), replacements)
			);
			await context.writeFile(
				'AGENTS.md',
				renderTemplate(await readDocumentAsset('AGENTS.md'), replacements)
			);
			await context.writeFile(
				'.env.example',
				renderTemplate(await readDocumentAsset('.env.example'), replacements)
			);

			for (const [name, command] of Object.entries(commands)) {
				context.addDocumentFact({ key: `command.${name}`, value: command });
			}
			context.addDocumentFact({ key: 'packageManager', value: packageManager.id });
			context.addDocumentFact({ key: 'security.authentication', value: 'deferred' });
			context.addCheck({ id: 'generated-documents-agree', validate: validateDocuments });
		}
	};
}

function documentCommands(packageManager: PackageManagerAdapter): DocumentCommands {
	return Object.freeze({
		build: formatPackageManagerCommand(packageManager.run('build')),
		check: formatPackageManagerCommand(packageManager.run('check')),
		dbGenerate: formatPackageManagerCommand(packageManager.run('db:generate')),
		dbMigrate: formatPackageManagerCommand(packageManager.run('db:migrate')),
		dev: formatPackageManagerCommand(packageManager.run('dev')),
		install: formatPackageManagerCommand(packageManager.installCommand),
		lint: formatPackageManagerCommand(packageManager.run('lint')),
		start: formatPackageManagerCommand(packageManager.run('start')),
		test: formatPackageManagerCommand(packageManager.run('test'))
	});
}

function documentReplacements(
	context: RecipeContext,
	packageManager: PackageManagerAdapter,
	commands: DocumentCommands
): Readonly<Record<string, string>> {
	const config = context.config;
	return {
		ADAPTER_NODE_VERSION: generatedToolVersions.adapterNode,
		COMMAND_BUILD: commands.build,
		COMMAND_CHECK: commands.check,
		COMMAND_DB_GENERATE: commands.dbGenerate,
		COMMAND_DB_MIGRATE: commands.dbMigrate,
		COMMAND_DEV: commands.dev,
		COMMAND_INSTALL: commands.install,
		COMMAND_LINT: commands.lint,
		COMMAND_START: commands.start,
		COMMAND_TEST: commands.test,
		CONFIG_WARNINGS:
			config.warnings.length === 0
				? '- None.'
				: config.warnings.map((warning) => `- ${warning.message}`).join('\n'),
		DATABASE_DIALECT: config.database.dialect,
		DATABASE_DRIVER: config.database.driver,
		DATABASE_PROVIDER: config.database.provider,
		DATA_PATTERN: config.dataPattern,
		DATA_PATTERN_AGENT_GUIDE:
			config.dataPattern === 'sveltekit-remote-functions'
				? 'Keep experimental Remote Functions in route-local `.remote.ts` modules, validate every public argument with a shared schema, and delegate persistence and private work to `$lib/server`. The generated slice proves a `query` boundary only; do not imply form/command or Users CRUD parity.'
				: 'Use native SvelteKit `+page.server.ts` load functions and form actions for the selected Standard boundary.',
		DATA_PATTERN_GUIDE:
			config.dataPattern === 'sveltekit-remote-functions'
				? 'This project uses an **Experimental** route-local `.remote.ts` query boundary. Public arguments are validated with Zod before the boundary delegates to `$lib/server`; persistence and private environment access stay server-only. The generated slice is a query proof, not Users CRUD parity or a production-readiness claim. To roll back, select Standard SvelteKit in a clean regeneration or replace the Remote boundary with native `+page.server.ts` loads/actions before disabling both experimental switches in `vite.config.ts`.'
				: 'This project uses native `+page.server.ts` load functions and form actions. Route modules validate browser input and delegate persistence to `$lib/server`; no parallel REST layer is generated.',
		DOCKER_AGENT_GUIDE: config.docker
			? 'Dockerfile, .dockerignore, and compose.yaml are writable source files; keep their package-manager and environment wiring aligned with this project.'
			: 'Docker support is disabled, so do not add Docker-only commands or files without first changing the project configuration.',
		DOCKER_GUIDE: config.docker
			? `## Docker\n\nSet POSTGRES_PASSWORD in a local .env file, then use \`docker compose up --build\`. The Compose stack health-checks PostgreSQL, applies committed Drizzle migrations in a one-shot service, and starts the Node adapter output only after migration succeeds. Credentials are not baked into the image.`
			: '## Docker\n\nDocker support is disabled; this project contains no Docker-only workflow.',
		DOCKER_ENVIRONMENT: config.docker
			? `\n# Docker Compose development defaults. Replace the password before starting Compose.\nPOSTGRES_USER=metonia\nPOSTGRES_DB=metonia_development\nPOSTGRES_PASSWORD=replace-with-a-long-random-password\nAPP_PORT=3000\nORIGIN=http://localhost:3000`
			: '',
		DOCKER_STATE: config.docker ? 'enabled' : 'disabled',
		ORM: config.orm,
		PACKAGE_MANAGER_ID: packageManager.id,
		PACKAGE_MANAGER_LABEL: packageManager.label,
		PACKAGE_MANAGER_LOCKFILE: packageManager.lockfile,
		PACKAGE_MANAGER_VERSION: packageManager.version,
		PROJECT_NAME: config.projectName,
		SVELTE_VERSION: generatedToolVersions.svelte,
		SVELTEKIT_VERSION: generatedToolVersions.svelteKit,
		UI_ADAPTER: config.ui.adapter,
		UI_THEME: config.ui.theme,
		ICON_LIBRARY: config.ui.iconLibrary,
		USERS_AGENT_GUIDE: config.resources.users
			? 'follow the neighboring shared schemas, server repository/service, client views/pages, and thin routes when adding resources'
			: 'the canonical Users example is omitted, so add a resource only through the same shared/server/client/route boundaries',
		USERS_GUIDE: config.resources.users
			? 'Users demonstrates shared schemas, server-only persistence, accessible CRUD views/pages, and thin Standard SvelteKit routes.'
			: 'The optional Users CRUD example is not generated.',
		USERS_STATE: config.resources.users ? 'enabled' : 'disabled',
		VALIDATION: config.validation
	};
}

function renderTemplate(template: string, replacements: Readonly<Record<string, string>>): string {
	const rendered = Object.entries(replacements).reduce(
		(current, [key, value]) => current.replaceAll(`{{${key}}}`, value),
		template
	);
	if (/{{[A-Z_]+}}/.test(rendered)) {
		throw new Error('A generated-document placeholder was not resolved.');
	}
	return rendered;
}

async function validateDocuments(context: StagedValidationContext): Promise<void> {
	const packageManager = getImplementedPackageManagerAdapter(context.config.packageManager);
	const commands = documentCommands(packageManager);
	const expectedConfig = renderGeneratedConfigModule(context.config);
	const configModule = await context.readFile('metonia-admin.config.ts');
	if (configModule !== expectedConfig || /^\s*import\s/m.test(configModule)) {
		throw new Error(
			'The generated configuration is not the registry-rendered import-free literal.'
		);
	}

	const readme = await context.readFile('README.md');
	const agents = await context.readFile('AGENTS.md');
	const environmentExample = await context.readFile('.env.example');
	const combinedDocs = `${readme}\n${agents}`;
	const expectedValues = [
		context.config.projectName,
		context.config.packageManager,
		packageManager.version,
		packageManager.lockfile,
		context.config.ui.adapter,
		context.config.ui.theme,
		context.config.ui.iconLibrary,
		context.config.dataPattern,
		context.config.validation,
		context.config.orm,
		context.config.database.dialect,
		context.config.database.provider,
		context.config.database.driver,
		context.config.docker ? 'enabled' : 'disabled',
		context.config.resources.users ? 'enabled' : 'disabled'
	];
	if (expectedValues.some((value) => !combinedDocs.includes(value))) {
		throw new Error('Generated documentation does not describe the resolved configuration.');
	}
	if (
		Object.values(commands).some((command) => !combinedDocs.includes(command)) ||
		!combinedDocs.includes('DATABASE_URL') ||
		!combinedDocs.includes('not production-secure') ||
		!combinedDocs.includes('Authentication and authorization are deferred')
	) {
		throw new Error(
			'Generated documentation omits commands, persistence setup, or the deferred-authentication warning.'
		);
	}
	if (
		context.config.dataPattern === 'sveltekit-remote-functions'
			? !combinedDocs.includes('Experimental') ||
				!combinedDocs.includes('.remote.ts') ||
				!combinedDocs.includes('query proof') ||
				!combinedDocs.includes('roll back')
			: !combinedDocs.includes('+page.server.ts') || !combinedDocs.includes('form actions')
	) {
		throw new Error('Generated documentation does not explain the selected data boundary.');
	}
	if (foreignCommandPattern(packageManager.id).test(combinedDocs)) {
		throw new Error('Generated documentation contains foreign package-manager commands.');
	}
	if (
		!environmentExample.includes('DATABASE_URL=postgresql://') ||
		environmentExample.includes('{{') ||
		context.config.docker !== environmentExample.includes('POSTGRES_PASSWORD=') ||
		(!context.config.docker &&
			/^(?:POSTGRES_USER|POSTGRES_DB|APP_PORT|ORIGIN)=/m.test(environmentExample))
	) {
		throw new Error(
			'Generated environment guidance does not match the database and Docker selection.'
		);
	}

	const dockerFiles = [
		'Dockerfile',
		'.dockerignore',
		'compose.yaml',
		'docker-compose.yml',
		'docker-compose.yaml'
	];
	const dockerFilesExist = (
		await Promise.all(dockerFiles.map((path) => context.exists(path)))
	).some(Boolean);
	if (context.config.docker !== dockerFilesExist) {
		throw new Error('Generated Docker documentation and output disagree.');
	}
}

function foreignCommandPattern(selected: PackageManagerId): RegExp {
	const patterns: Readonly<Record<PackageManagerId, string>> = {
		bun: String.raw`\bbun (?:install|run|test)\b`,
		npm: String.raw`\bnpm (?:install|ci|run|test)\b|\bnpx\b`,
		pnpm: String.raw`\bpnpm (?:install|run|test|dlx)\b`,
		yarn: String.raw`\byarn (?:install|run|test|dlx)\b`,
		deno: String.raw`\bdeno (?:install|ci|task|run)\b`
	};
	return new RegExp(
		Object.entries(patterns)
			.filter(([id]) => id !== selected)
			.map(([, pattern]) => `(?:${pattern})`)
			.join('|'),
		'i'
	);
}

async function readDocumentAsset(name: string): Promise<string> {
	return readGeneratorAsset(`documents/${name}`);
}
