/// <reference types="bun" />

import { afterEach, describe, expect, test } from 'bun:test';
import { lstat, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';

import {
	resolveConfigOrThrow,
	type PackageManagerId,
	type ResolvedConfig
} from '@metonia-admin/registry';

import { generateProject } from '../../core/index.js';
import {
	formatPackageManagerCommand,
	getPackageManagerAdapter
} from '../../adapters/package-managers/index.js';
import { createDockerRecipe } from './index.js';

const temporaryRoots: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map(removeTestRoot));
});

describe('Docker recipe', () => {
	test('writes a lock-aware non-root Node runtime and local PostgreSQL Compose contract', async () => {
		const destination = join(await createTestRoot(), 'docker-enabled');
		const result = await generateProject({
			config: dockerConfig('docker-enabled'),
			destination,
			recipes: [createDockerRecipe()]
		});

		expect(result.ok).toBeTrue();
		if (!result.ok) throw new Error(JSON.stringify(result.error));
		expect(result.facts.documentFacts).toMatchObject({
			'docker.enabled': 'true',
			'docker.localDatabase': 'postgres-compose-service',
			'docker.runtime': 'node:24.19.0-bookworm-slim'
		});
		expect(result.facts.checks).toContain('docker-output-contract');
		expect(await generatedFiles(destination)).toEqual([
			'.dockerignore',
			'compose.yaml',
			'Dockerfile',
			'scripts/docker-migrate.mjs'
		]);

		const dockerfile = await readFile(join(destination, 'Dockerfile'), 'utf8');
		expect(dockerfile).toContain('COPY package.json bun.lock ./');
		expect(dockerfile).toContain('bun install --frozen-lockfile');
		expect(dockerfile).toContain('FROM oven/bun:1.4.0 AS package-manager');
		expect(dockerfile).toContain('FROM package-manager AS production-dependencies');
		expect(dockerfile).toContain('FROM node:24.19.0-bookworm-slim AS migration');
		expect(dockerfile).toContain('CMD ["node", "scripts/docker-migrate.mjs"]');
		expect(dockerfile).toContain('bun install --frozen-lockfile --production --ignore-scripts');
		expect(dockerfile).toContain(
			'COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules'
		);
		expect(dockerfile).toContain('FROM node:24.19.0-bookworm-slim AS runtime');
		expect(dockerfile).toContain('USER node');
		expect(dockerfile).toContain('CMD ["node", "build"]');

		const compose = await readFile(join(destination, 'compose.yaml'), 'utf8');
		expect(compose).toContain('postgres:17.11-bookworm');
		expect(compose).toContain('condition: service_healthy');
		expect(compose).toContain('target: migration');
		expect(compose).toContain('condition: service_completed_successfully');
		expect(compose).toContain('pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB');
		expect(compose).toContain('metonia-postgres-data');
		expect(compose).toContain('DATABASE_URL:');
		expect(compose).toContain("fetch('http://127.0.0.1:3000/')");
		expect(compose).toContain('ORIGIN:');
		expect(compose).toContain('stop_grace_period: 30s');
		expect(compose).not.toMatch(/^\s*POSTGRES_PASSWORD:\s*(?!\$\{)\S/m);
	});

	test('is a no-op when Docker is disabled', async () => {
		const destination = join(await createTestRoot(), 'docker-disabled');
		const result = await generateProject({
			config: dockerConfig('docker-disabled', 'bun', false),
			destination,
			recipes: [createDockerRecipe()]
		});

		expect(result.ok).toBeTrue();
		if (!result.ok) throw new Error(JSON.stringify(result.error));
		expect(await generatedFiles(destination)).toEqual([]);
		expect(result.facts.checks).not.toContain('docker-output-contract');
	});

	test('renders npm, pnpm, and Yarn Dockerfiles from their package-manager contracts', async () => {
		const root = await createTestRoot();
		for (const id of ['npm', 'pnpm', 'yarn'] as const) {
			const destination = join(root, `${id}-docker`);
			const result = await generateProject({
				config: dockerConfig(`${id}-docker`, id),
				destination,
				recipes: [createDockerRecipe()]
			});
			expect(result.ok).toBeTrue();
			if (!result.ok) throw new Error(JSON.stringify(result.error));

			const adapter = getPackageManagerAdapter(id);
			const docker = adapter.docker;
			expect(docker).toBeDefined();
			if (docker === undefined) throw new Error(`Missing ${id} Docker plan.`);
			const dockerfile = await readFile(join(destination, 'Dockerfile'), 'utf8');
			expect(dockerfile).toContain(`FROM ${docker.buildImage} AS package-manager`);
			expect(dockerfile).toContain(`COPY ${docker.dependencyFiles.join(' ')} ./`);
			expect(dockerfile).toContain(
				`RUN ${formatPackageManagerCommand(adapter.frozenInstallCommand)}`
			);
			expect(dockerfile).toContain(
				`RUN ${formatPackageManagerCommand(docker.productionInstallCommand)}`
			);
			expect(dockerfile).toContain('CMD ["node", "scripts/docker-migrate.mjs"]');
			expect(result.facts.documentFacts['docker.packageManager']).toBe(id);
		}
	});

	test('rejects a database contract that cannot use the local PostgreSQL Compose wiring', async () => {
		const root = await createTestRoot();
		const destination = join(root, 'invalid-database-docker');
		const validConfig = dockerConfig('invalid-database-docker');
		const invalidConfig: ResolvedConfig = {
			...validConfig,
			database: {
				...validConfig.database,
				driver: 'postgres.js'
			} as unknown as ResolvedConfig['database']
		};
		const result = await generateProject({
			config: invalidConfig,
			destination,
			recipes: [createDockerRecipe()]
		});

		expect(result).toMatchObject({
			ok: false,
			error: { code: 'RECIPE_FAILED', recipeId: 'docker-container', stage: 'run-recipes' }
		});
		expect(await exists(destination)).toBeFalse();
	});
});

function dockerConfig(
	projectName: string,
	packageManager: PackageManagerId = 'bun',
	docker = true
): ResolvedConfig {
	const config = resolveConfigOrThrow({
		schemaVersion: 1,
		projectName,
		packageManager,
		ui: { adapter: 'shadcn-svelte', theme: 'zinc', iconLibrary: 'lucide' },
		dataPattern: 'sveltekit-standard',
		validation: 'zod',
		orm: 'drizzle',
		database: { dialect: 'postgresql', provider: 'generic', driver: 'pg' },
		docker,
		resources: { users: false }
	});
	return config;
}

async function generatedFiles(root: string): Promise<string[]> {
	const entries = await readdir(root, { recursive: true, withFileTypes: true });
	return entries
		.filter((entry) => entry.isFile())
		.map((entry) => relative(root, join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
		.sort((left, right) => left.localeCompare(right));
}

async function createTestRoot(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'metonia-docker-recipe-test-'));
	temporaryRoots.push(root);
	return root;
}

async function removeTestRoot(root: string): Promise<void> {
	const resolvedRoot = resolve(root);
	if (
		relative(tmpdir(), resolvedRoot).startsWith('..') ||
		!basename(resolvedRoot).startsWith('metonia-docker-recipe-test-')
	) {
		throw new Error('Refusing to remove an unexpected test root.');
	}
	await rm(resolvedRoot, { force: true, recursive: true });
}

async function exists(path: string): Promise<boolean> {
	try {
		await lstat(path);
		return true;
	} catch {
		return false;
	}
}
