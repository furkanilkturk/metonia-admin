import { assertSupportedDockerConfiguration, dockerRuntime } from '../../adapters/docker/index.js';
import type { Recipe, StagedValidationContext } from '../../contracts/index.js';
import { readGeneratorAsset } from '../assets.js';

const dockerFiles = Object.freeze(['Dockerfile', '.dockerignore', 'compose.yaml'] as const);

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
			for (const file of dockerFiles) {
				await context.writeFile(file, await readDockerAsset(file));
			}
			context.addDocumentFact({ key: 'docker.enabled', value: 'true' });
			context.addDocumentFact({ key: 'docker.localDatabase', value: 'postgres-compose-service' });
			context.addDocumentFact({ key: 'docker.runtime', value: dockerRuntime.nodeImage });
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
		if ((await Promise.all(dockerFiles.map((file) => context.exists(file)))).some(Boolean)) {
			throw new Error('Docker-disabled output must not contain Docker source files.');
		}
		return;
	}

	assertSupportedDockerConfiguration(context.config);
	if (!(await Promise.all(dockerFiles.map((file) => context.exists(file)))).every(Boolean)) {
		throw new Error('Docker-enabled output is missing a required Docker source file.');
	}

	const [dockerfile, dockerignore, compose] = await Promise.all(
		dockerFiles.map((file) => context.readFile(file))
	);
	if (
		!dockerfile.includes(`FROM ${dockerRuntime.bunImage} AS dependencies`) ||
		!dockerfile.includes('COPY package.json bun.lock ./') ||
		!dockerfile.includes('bun install --frozen-lockfile') ||
		!dockerfile.includes(`FROM ${dockerRuntime.bunImage} AS production-dependencies`) ||
		!dockerfile.includes('bun install --frozen-lockfile --production --ignore-scripts') ||
		!dockerfile.includes(
			'COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules'
		) ||
		!dockerfile.includes(`FROM ${dockerRuntime.nodeImage} AS runtime`) ||
		!dockerfile.includes(`USER ${dockerRuntime.runtimeUser}`) ||
		!dockerfile.includes('CMD ["node", "build"]')
	) {
		throw new Error('Dockerfile must use the locked Bun build and non-root Node runtime contract.');
	}
	if (
		!dockerignore.includes('.env') ||
		!dockerignore.includes('node_modules') ||
		dockerignore.includes('bun.lock')
	) {
		throw new Error('Docker ignore rules must exclude local secrets while preserving bun.lock.');
	}
	if (
		!compose.includes(`image: ${dockerRuntime.postgresImage}`) ||
		!compose.includes('condition: service_healthy') ||
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
