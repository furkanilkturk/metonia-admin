import { describe, expect, test } from 'bun:test';
import {
	capabilityRegistry,
	configuratorCatalog,
	getConditionalChoices,
	isSelectableSupport,
	normalizeProjectName,
	parseGeneratedConfig,
	renderGeneratedConfigModule,
	resolveConfig,
	serializeGeneratedConfig,
	toGeneratedConfig,
	validateCompatibility,
	type CapabilityDefinition,
	type ConfigSelection
} from '../src/index.js';

function allDefinitions(): CapabilityDefinition[] {
	return [
		...capabilityRegistry.packageManagers,
		...capabilityRegistry.uiAdapters,
		...capabilityRegistry.uiAdapters.flatMap((adapter) => adapter.themes),
		...capabilityRegistry.dataPatterns,
		...capabilityRegistry.validations,
		...capabilityRegistry.orms,
		...capabilityRegistry.databaseDialects,
		...capabilityRegistry.databaseDialects.flatMap((dialect) => dialect.providers),
		...capabilityRegistry.databaseDialects.flatMap((dialect) =>
			dialect.providers.flatMap((provider) => provider.drivers)
		),
		capabilityRegistry.features.docker,
		...capabilityRegistry.resources
	];
}

describe('capability registry', () => {
	test('uses the complete unique status vocabulary and documented canonical IDs', () => {
		expect(capabilityRegistry.statuses).toEqual([
			'stable',
			'experimental',
			'unsupported',
			'unknown'
		]);
		expect(new Set(capabilityRegistry.statuses).size).toBe(capabilityRegistry.statuses.length);

		const definitions = allDefinitions();
		expect(new Set(definitions.map(({ id }) => id)).size).toBe(definitions.length);
		for (const definition of definitions) {
			expect(definition.docs.length).toBeGreaterThan(0);
			for (const document of definition.docs) {
				expect(document.label.length).toBeGreaterThan(0);
				expect(document.url.startsWith('https://')).toBe(true);
			}
			expect(capabilityRegistry.statuses).toContain(definition.support.upstream);
			expect(capabilityRegistry.statuses).toContain(definition.support.integration);
			if (definition.support.integration === 'experimental') {
				expect(definition.support.warning?.length).toBeGreaterThan(0);
			}
		}
	});

	test('keeps upstream and Metonia integration status distinct', () => {
		const shadcn = capabilityRegistry.uiAdapters.find(({ id }) => id === 'shadcn-svelte');
		expect(shadcn?.support).toMatchObject({ upstream: 'stable', integration: 'experimental' });

		const fluid = capabilityRegistry.uiAdapters.find(({ id }) => id === 'fluid-ui');
		expect(fluid?.support).toMatchObject({ upstream: 'unknown', integration: 'unknown' });
		expect(fluid?.support.blocker?.code).toBe('fluid-ui-identity-unverified');
		expect(isSelectableSupport(fluid!.support)).toBe(false);
		expect(isSelectableSupport({ upstream: 'unsupported', integration: 'unsupported' })).toBe(
			false
		);
		expect(isSelectableSupport({ upstream: 'unknown', integration: 'experimental' })).toBe(false);
		expect(isSelectableSupport({ upstream: 'experimental', integration: 'experimental' })).toBe(
			true
		);

		const deno = capabilityRegistry.packageManagers.find(({ id }) => id === 'deno');
		expect(deno?.support).toMatchObject({ upstream: 'stable', integration: 'unknown' });
		expect(deno?.support.blocker?.code).toBe('deno-generated-stack-unverified');
		expect(isSelectableSupport(deno!.support)).toBe(false);
		expect(getConditionalChoices('packageManager').map(({ id }) => id)).toEqual([
			'bun',
			'npm',
			'pnpm',
			'yarn'
		]);
	});

	test('owns themes under adapters and filters conditional choices', () => {
		expect('themes' in capabilityRegistry).toBe(false);
		expect(
			getConditionalChoices('ui.theme', {
				projectName: 'admin',
				ui: { adapter: 'shadcn-svelte' }
			}).map(({ id }) => id)
		).toEqual(['neutral', 'stone', 'zinc', 'mauve', 'olive', 'mist', 'taupe']);
		expect(
			getConditionalChoices(
				'ui.theme',
				{ projectName: 'admin', ui: { adapter: 'shadcn-svelte' } },
				{ includeUnavailable: true }
			).map(({ id }) => id)
		).toEqual(['neutral', 'stone', 'zinc', 'mauve', 'olive', 'mist', 'taupe']);
		expect(
			capabilityRegistry.uiAdapters
				.find(({ id }) => id === 'shadcn-svelte')
				?.themes.every(({ support }) => support.integration === 'experimental')
		).toBe(true);
		expect(
			getConditionalChoices('ui.theme', { projectName: 'admin', ui: { adapter: 'fluid-ui' } })
		).toEqual([]);
		expect(getConditionalChoices('ui.adapter').map(({ id }) => id)).toEqual(['shadcn-svelte']);
		expect(
			getConditionalChoices('ui.adapter', {}, { includeUnavailable: true }).map(({ id }) => id)
		).toEqual(['shadcn-svelte', 'fluid-ui']);
	});

	test('keeps database dialect, provider, and driver as nested concepts', () => {
		const postgresql = capabilityRegistry.databaseDialects[0];
		expect(postgresql?.id).toBe('postgresql');
		expect(postgresql?.providers[0]?.id).toBe('generic');
		expect(postgresql?.providers[0]?.drivers[0]?.id).toBe('pg');
		expect('databaseProviders' in capabilityRegistry).toBe(false);
		expect('databaseDrivers' in capabilityRegistry).toBe(false);
	});

	test('exposes a JSON-serializable catalog without losing nested ownership', () => {
		const catalog = JSON.parse(JSON.stringify(configuratorCatalog)) as typeof configuratorCatalog;
		expect(catalog.uiAdapters[0]?.themes.map(({ id }) => id)).toContain('zinc');
		expect(catalog.databaseDialects[0]?.providers[0]?.drivers[0]?.id).toBe('pg');
		expect(catalog.uiAdapters.find(({ id }) => id === 'fluid-ui')?.selectable).toBe(false);
	});
});

describe('configuration resolution', () => {
	test('normalizes the required project name and applies deterministic defaults', () => {
		expect(normalizeProjectName('  Acme_Admin  ')).toBe('acme-admin');
		const first = resolveConfig({ projectName: '  Acme_Admin  ' });
		const second = resolveConfig({ projectName: '  Acme_Admin  ' });
		expect(first).toEqual(second);
		expect(first.ok).toBe(true);
		if (!first.ok) return;

		expect(toGeneratedConfig(first.config)).toEqual({
			schemaVersion: 1,
			project: { name: 'acme-admin' },
			packageManager: 'bun',
			ui: { library: 'shadcn-svelte', theme: 'zinc' },
			dataPattern: 'sveltekit-standard',
			validation: { library: 'zod' },
			database: {
				orm: 'drizzle',
				dialect: 'postgresql',
				provider: 'generic',
				driver: 'pg'
			},
			docker: { enabled: false },
			resources: { users: true }
		});
		expect(first.config.defaultsApplied).toEqual([
			'packageManager',
			'ui.adapter',
			'ui.theme',
			'dataPattern',
			'validation',
			'orm',
			'database.dialect',
			'database.provider',
			'database.driver',
			'docker',
			'resources.users'
		]);
	});

	test('rejects missing or invalid project names and unknown IDs', () => {
		for (const input of [
			{},
			{ projectName: 'bad/name' },
			{ projectName: 'admin', orm: 'prisma' }
		]) {
			const result = resolveConfig(input);
			expect(result.ok).toBe(false);
		}
		const unknown = resolveConfig({ projectName: 'admin', orm: 'prisma' });
		expect(
			unknown.issues.some(({ code, path }) => code === 'unknown-capability' && path === 'orm')
		).toBe(true);
	});

	test('rejects Fluid UI and cross-adapter themes before generation', () => {
		const result = resolveConfig({
			projectName: 'admin',
			ui: { adapter: 'fluid-ui', theme: 'zinc' }
		});
		expect(result.ok).toBe(false);
		expect(
			result.issues.some(
				({ code, capability }) =>
					code === 'unselectable-capability' && capability?.id === 'fluid-ui'
			)
		).toBe(true);
		expect(result.issues.some(({ code }) => code === 'theme-not-owned')).toBe(true);
	});

	test('emits the explicit Remote Functions warning', () => {
		const result = resolveConfig({
			projectName: 'remote-admin',
			dataPattern: 'sveltekit-remote-functions',
			resources: { users: false }
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(
			result.config.warnings.find(
				({ capability }) => capability?.id === 'sveltekit-remote-functions'
			)?.message
		).toContain('experimental upstream');
	});

	test('rejects generator-incompatible feature crossings centrally', () => {
		const remoteUsers = resolveConfig({
			projectName: 'remote-users',
			dataPattern: 'sveltekit-remote-functions',
			resources: { users: true }
		});
		expect(remoteUsers.ok).toBeFalse();
		expect(
			remoteUsers.issues.some(
				({ code, path }) => code === 'incompatible-capabilities' && path === 'resources.users'
			)
		).toBeTrue();

		const npmDocker = resolveConfig({
			projectName: 'npm-docker',
			packageManager: 'npm',
			docker: true
		});
		expect(npmDocker.ok).toBeFalse();
		expect(
			npmDocker.issues.some(
				({ code, path }) => code === 'incompatible-capabilities' && path === 'docker'
			)
		).toBeTrue();
	});

	test('validates ownership independently for already-resolved-looking input', () => {
		const incompatible = {
			schemaVersion: 1,
			projectName: 'admin',
			packageManager: 'bun',
			ui: { adapter: 'fluid-ui', theme: 'zinc' },
			dataPattern: 'sveltekit-standard',
			validation: 'zod',
			orm: 'drizzle',
			database: { dialect: 'postgresql', provider: 'generic', driver: 'pg' },
			docker: false,
			resources: { users: true }
		} satisfies ConfigSelection;
		expect(validateCompatibility(incompatible).map(({ code }) => code)).toContain(
			'theme-not-owned'
		);
	});

	test('round-trips canonical generated data deterministically without a runtime import', () => {
		const resolved = resolveConfig({
			schemaVersion: 1,
			projectName: 'admin',
			packageManager: 'pnpm',
			ui: { adapter: 'shadcn-svelte', theme: 'zinc' },
			dataPattern: 'sveltekit-remote-functions',
			validation: 'zod',
			orm: 'drizzle',
			database: { dialect: 'postgresql', provider: 'generic', driver: 'pg' },
			docker: false,
			resources: { users: false }
		});
		expect(resolved.ok).toBe(true);
		if (!resolved.ok) return;

		const serialized = serializeGeneratedConfig(resolved.config);
		const roundTrip = parseGeneratedConfig(serialized);
		expect(roundTrip.ok).toBe(true);
		if (!roundTrip.ok) return;
		expect(toGeneratedConfig(roundTrip.config)).toEqual(toGeneratedConfig(resolved.config));
		expect(serializeGeneratedConfig(roundTrip.config)).toBe(serialized);

		const moduleSource = renderGeneratedConfigModule(resolved.config);
		expect(moduleSource.startsWith('export default {')).toBe(true);
		expect(moduleSource).not.toContain('import');
		expect(moduleSource).not.toContain('@metonia-admin');
	});

	test('rejects malformed JSON and the old or incomplete generated shape', () => {
		const invalidJson = parseGeneratedConfig('{');
		expect(invalidJson.ok).toBe(false);
		expect(invalidJson.issues[0]?.code).toBe('invalid-config');

		const oldShape = parseGeneratedConfig(
			JSON.stringify({ schemaVersion: 1, projectName: 'admin', packageManager: 'bun' })
		);
		expect(oldShape.ok).toBe(false);
		expect(oldShape.issues.some(({ path }) => path === 'project')).toBe(true);
		expect(oldShape.issues.some(({ path }) => path === 'ui')).toBe(true);

		const malformedNestedShape = parseGeneratedConfig(
			JSON.stringify({
				schemaVersion: 1,
				project: { name: 'admin' },
				packageManager: 'bun',
				ui: { library: 'shadcn-svelte', theme: 'zinc' },
				dataPattern: 'sveltekit-standard',
				validation: { library: 'zod' },
				database: {
					orm: 'drizzle',
					dialect: 'postgresql',
					provider: 'generic',
					driver: 'pg'
				},
				docker: false,
				resources: { users: true }
			})
		);
		expect(malformedNestedShape.ok).toBe(false);
		expect(malformedNestedShape.issues.some(({ path }) => path === 'docker')).toBe(true);
	});
});
