import { assertSupportedDockerConfiguration, dockerRuntime } from '../../adapters/docker/index.js';
import {
	formatPackageManagerCommand,
	getImplementedPackageManagerAdapter,
	type PackageManagerAdapter
} from '../../adapters/package-managers/index.js';
import type { Recipe, StagedValidationContext } from '../../contracts/index.js';
import { readGeneratorAsset } from '../assets.js';

const dockerFiles = Object.freeze(['Dockerfile', '.dockerignore', 'compose.yaml'] as const);
const migrationScript = 'scripts/docker-migrate.mjs';

/**
 * Writes container source only for an explicit Docker selection. The recipe intentionally does
 * not create credentials or a lockfile: those belong to the developer's local environment and
 * selected package-manager install operation.
 */
export function createDockerRecipe(): Recipe {
	return {
		id: 'docker-container',
		stage: 'docker',
		async apply(context) {
			if (!context.config.docker) return;
			assertSupportedDockerConfiguration(context.config);
			const packageManager = requireDockerPackageManager(context.config.packageManager);
			await context.writeFile(
				'Dockerfile',
				renderDockerfile(await readDockerAsset('Dockerfile'), packageManager)
			);
			await context.writeFile('.dockerignore', await readDockerAsset('.dockerignore'));
			await context.writeFile('compose.yaml', await readDockerAsset('compose.yaml'));
			await context.writeFile(migrationScript, await readGeneratorAsset('docker/migrate.mjs'));
			context.addDocumentFact({ key: 'docker.enabled', value: 'true' });
			context.addDocumentFact({ key: 'docker.localDatabase', value: 'postgres-compose-service' });
			context.addDocumentFact({ key: 'docker.runtime', value: dockerRuntime.nodeImage });
			context.addDocumentFact({ key: 'docker.packageManager', value: packageManager.id });
			context.addDocumentFact({
				key: 'docker.setup',
				value: 'Set POSTGRES_PASSWORD in .env before docker compose up --build.'
			});
			context.addCheck({ id: 'docker-output-contract', validate: validateDockerOutput });
		}
	};
}

async function validateDockerOutput(context: StagedValidationContext): Promise<void> {
	if (!context.config.docker) {
		if (
			(
				await Promise.all([...dockerFiles, migrationScript].map((file) => context.exists(file)))
			).some(Boolean)
		) {
			throw new Error('Docker-disabled output must not contain Docker source files.');
		}
		return;
	}

	assertSupportedDockerConfiguration(context.config);
	const packageManager = requireDockerPackageManager(context.config.packageManager);
	if (
		!(
			await Promise.all([...dockerFiles, migrationScript].map((file) => context.exists(file)))
		).every(Boolean)
	) {
		throw new Error('Docker-enabled output is missing a required Docker source file.');
	}

	const [dockerfile, dockerignore, compose] = await Promise.all(
		dockerFiles.map((file) => context.readFile(file))
	);
	const docker = packageManager.docker;
	if (
		docker === undefined ||
		!dockerfile.includes(`FROM ${docker.buildImage} AS package-manager`) ||
		!dockerfile.includes(`COPY ${docker.dependencyFiles.join(' ')} ./`) ||
		!dockerfile.includes(
			`RUN ${formatPackageManagerCommand(packageManager.frozenInstallCommand)}`
		) ||
		!dockerfile.includes(`FROM ${dockerRuntime.nodeImage} AS migration`) ||
		!dockerfile.includes('COPY --chown=node:node drizzle ./drizzle') ||
		!dockerfile.includes(
			'COPY --chown=node:node scripts/docker-migrate.mjs ./scripts/docker-migrate.mjs'
		) ||
		!dockerfile.includes('CMD ["node", "scripts/docker-migrate.mjs"]') ||
		!dockerfile.includes(`RUN ${formatPackageManagerCommand(docker.productionInstallCommand)}`) ||
		!dockerfile.includes(`RUN ${formatPackageManagerCommand(packageManager.run('build'))}`) ||
		!dockerfile.includes(
			'COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules'
		) ||
		!dockerfile.includes(`FROM ${dockerRuntime.nodeImage} AS runtime`) ||
		!dockerfile.includes(`USER ${dockerRuntime.runtimeUser}`) ||
		!dockerfile.includes('CMD ["node", "build"]')
	) {
		throw new Error(
			'Dockerfile must use the selected package manager lockfile and non-root Node runtime contract.'
		);
	}
	for (const setupCommand of docker.setupCommands) {
		if (!dockerfile.includes(`RUN ${formatPackageManagerCommand(setupCommand)}`)) {
			throw new Error('Dockerfile is missing package-manager setup required by its adapter.');
		}
	}
	if (
		!dockerignore.includes('.env') ||
		!dockerignore.includes('node_modules') ||
		dockerignore.includes(packageManager.lockfile)
	) {
		throw new Error(
			'Docker ignore rules must exclude local secrets while preserving the selected lockfile.'
		);
	}
	if (
		!compose.includes(`image: ${dockerRuntime.postgresImage}`) ||
		!compose.includes('target: migration') ||
		!compose.includes('condition: service_healthy') ||
		!compose.includes('condition: service_completed_successfully') ||
		!compose.includes('pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB') ||
		!compose.includes('metonia-postgres-data') ||
		!compose.includes('DATABASE_URL:') ||
		!compose.includes("fetch('http://127.0.0.1:3000/')") ||
		!compose.includes('stop_grace_period: 30s') ||
		!compose.includes('ORIGIN:')
	) {
		throw new Error(
			'Compose must include the local PostgreSQL health and runtime wiring contract.'
		);
	}
	const output = `${dockerfile}\n${compose}`;
	const hasBakedPassword = /^\s*POSTGRES_PASSWORD:\s*(?!\$\{)\S/m.test(output);
	const hasNamedSecret = /(?:api[_-]?key|secret)\s*[:=]\s*['"]?[A-Za-z0-9_-]{12,}/i.test(output);
	if (hasBakedPassword || hasNamedSecret) {
		throw new Error('Docker output must not contain a baked credential or secret.');
	}
}

async function readDockerAsset(name: (typeof dockerFiles)[number]): Promise<string> {
	return readGeneratorAsset(`docker/${name}`);
}

function requireDockerPackageManager(
	id: Parameters<typeof getImplementedPackageManagerAdapter>[0]
): PackageManagerAdapter {
	const packageManager = getImplementedPackageManagerAdapter(id);
	if (packageManager.docker === undefined) {
		throw new Error(`Docker generation is unavailable for ${packageManager.label}.`);
	}
	return packageManager;
}

function renderDockerfile(template: string, packageManager: PackageManagerAdapter): string {
	const docker = packageManager.docker;
	if (docker === undefined) throw new Error('The package-manager Docker plan is unavailable.');
	const setupCommands = docker.setupCommands
		.map((command) => `RUN ${formatPackageManagerCommand(command)}`)
		.join('\n');
	const replacements: Readonly<Record<string, string>> = {
		'{{BUILD_IMAGE}}': docker.buildImage,
		'{{SETUP_COMMANDS}}': setupCommands,
		'{{DEPENDENCY_FILES}}': docker.dependencyFiles.join(' '),
		'{{INSTALL_COMMAND}}': formatPackageManagerCommand(packageManager.frozenInstallCommand),
		'{{BUILD_COMMAND}}': formatPackageManagerCommand(packageManager.run('build')),
		'{{PRODUCTION_INSTALL_COMMAND}}': formatPackageManagerCommand(docker.productionInstallCommand)
	};
	let output = template;
	for (const [token, value] of Object.entries(replacements))
		output = output.replaceAll(token, value);
	if (/\{\{[A-Z_]+\}\}/.test(output)) throw new Error('Dockerfile template is incomplete.');
	return output;
}
