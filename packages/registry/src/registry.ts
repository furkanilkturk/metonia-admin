import {
	CONFIG_SCHEMA_VERSION,
	type ConfigSchemaVersion,
	type CapabilityDefinition,
	type CapabilitySupport,
	type DatabaseDialectDefinition,
	type DataPatternId,
	type OrmId,
	type PackageManagerId,
	type ResourceId,
	type SupportStatus,
	type ThemeDefinition,
	type ThemeId,
	type ToggleCapabilityDefinition,
	type UiAdapterDefinition,
	type UiAdapterId,
	type ValidationId
} from './types.js';

function pendingIntegration(warning: string): CapabilitySupport {
	return { upstream: 'stable', integration: 'experimental', warning };
}

const packageManagers = [
	{
		id: 'bun',
		label: 'Bun',
		description: 'Use Bun for generated-project dependencies and scripts.',
		support: pendingIntegration(
			'The complete primary stack passed generation, install, frozen install, check, test, and build on Windows x64 with Bun 1.4.0 and Node 24.19.0; repeatable multi-OS release evidence remains pending.'
		),
		docs: [{ label: 'Bun package manager', url: 'https://bun.com/docs/pm/cli/install' }]
	},
	{
		id: 'npm',
		label: 'npm',
		description: 'Use npm for generated-project dependencies and scripts.',
		support: pendingIntegration(
			'The complete primary stack passed generation, install, npm ci, check, test, and build on Windows x64 with npm 12.0.2 and Node 24.19.0. A repeat harness hit a six-minute timeout during Windows cleanup; repeatable clean completion, multi-OS evidence, and recorded transitive audit findings remain release gates.'
		),
		docs: [{ label: 'npm CLI', url: 'https://docs.npmjs.com/cli/' }]
	},
	{
		id: 'pnpm',
		label: 'pnpm',
		description: 'Use pnpm for generated-project dependencies and scripts.',
		support: pendingIntegration(
			'The complete primary stack passed generation, install, frozen install, check, test, and build on Windows x64 with pnpm 11.23.0 and Node 24.19.0 using an explicit esbuild build-policy allowlist; multi-OS evidence remains pending.'
		),
		docs: [{ label: 'pnpm CLI', url: 'https://pnpm.io/pnpm-cli' }]
	},
	{
		id: 'yarn',
		label: 'Yarn',
		description: 'Use modern Yarn for generated-project dependencies and scripts.',
		support: pendingIntegration(
			'The complete primary stack passed generation, install, immutable install, check, test, and build on Windows x64 with Yarn 4.18.0 and Node 24.19.0 using its exact-package release-age approval; multi-OS evidence remains pending.'
		),
		docs: [{ label: 'Yarn CLI', url: 'https://yarnpkg.com/cli' }]
	},
	{
		id: 'deno',
		label: 'Deno',
		description: 'Use Deno package management and tasks for the generated project.',
		support: {
			upstream: 'stable',
			integration: 'unknown',
			blocker: {
				code: 'deno-generated-stack-unverified',
				summary: 'The complete generated Deno and Node-production hybrid is unverified.',
				details:
					'Deno remains unavailable until the current runtime passes generation, install, check, test, build, shadcn-svelte, Drizzle, PostgreSQL, adapter-node startup, and Docker integration gates.'
			}
		},
		docs: [{ label: 'Deno packages', url: 'https://docs.deno.com/runtime/packages/' }]
	}
] as const satisfies readonly CapabilityDefinition<PackageManagerId>[];

function shadcnTheme(id: ThemeId): ThemeDefinition {
	return {
		id,
		label: `${id[0].toUpperCase()}${id.slice(1)}`,
		description: `Use the shadcn-svelte ${id} base color.`,
		baseColor: id,
		support: pendingIntegration(
			`The checked-in shadcn-svelte ${id} Nova base-color snapshot passed deterministic generation on the primary Windows stack; repeatable multi-OS release evidence remains pending.`
		),
		docs: [{ label: 'shadcn-svelte theming', url: 'https://www.shadcn-svelte.com/docs/theming' }]
	};
}

const uiAdapters: readonly UiAdapterDefinition[] = [
	{
		id: 'shadcn-svelte',
		label: 'shadcn-svelte',
		description: 'Generate Svelte UI primitives through the shadcn-svelte adapter.',
		support: pendingIntegration(
			'The shadcn-svelte Nova adapter targeting $lib/client/ui/components passed deterministic generation, Svelte autofix, responsive visual review, install, check, test, and build on the primary Windows stack; multi-OS release evidence remains pending.'
		),
		docs: [
			{ label: 'shadcn-svelte documentation', url: 'https://www.shadcn-svelte.com/docs' },
			{ label: 'shadcn-svelte CLI', url: 'https://www.shadcn-svelte.com/docs/cli' }
		],
		themes: [
			shadcnTheme('neutral'),
			shadcnTheme('stone'),
			shadcnTheme('zinc'),
			shadcnTheme('mauve'),
			shadcnTheme('olive'),
			shadcnTheme('mist'),
			shadcnTheme('taupe')
		]
	},
	{
		id: 'fluid-ui',
		label: 'Fluid UI',
		description: 'Reserved adapter identity for a future verified Fluid UI integration.',
		support: {
			upstream: 'unknown',
			integration: 'unknown',
			blocker: {
				code: 'fluid-ui-identity-unverified',
				summary: 'The intended Fluid UI integration is not authoritatively identified.',
				details:
					'Package ownership, installation, components, CSS, themes, licensing, and accessibility contracts must be confirmed before selection is enabled.'
			}
		},
		docs: [
			{
				label: 'Unverified public candidate',
				url: 'https://fluidui.io/documentation/getting-started'
			}
		],
		themes: []
	}
];

const dataPatterns = [
	{
		id: 'sveltekit-standard',
		label: 'Standard SvelteKit',
		description: 'Use server load functions and form actions as the native application boundary.',
		support: pendingIntegration(
			'The Standard SvelteKit load/action path passed a fresh default-stack install/check/test/build and real PostgreSQL Users CRUD on Windows; repeatable multi-OS release evidence remains pending.'
		),
		docs: [
			{ label: 'SvelteKit loading data', url: 'https://svelte.dev/docs/kit/load' },
			{ label: 'SvelteKit form actions', url: 'https://svelte.dev/docs/kit/form-actions' }
		]
	},
	{
		id: 'sveltekit-remote-functions',
		label: 'SvelteKit Remote Functions',
		description: 'Use experimental Remote Functions as thin route data boundaries.',
		support: {
			upstream: 'experimental',
			integration: 'experimental',
			warning:
				"Remote Functions remain experimental upstream. Metonia's validated query-boundary proof passed a fresh install, check, test, build, and Node request on Windows, but does not yet provide Users CRUD parity."
		},
		docs: [
			{ label: 'SvelteKit Remote Functions', url: 'https://svelte.dev/docs/kit/remote-functions' }
		]
	}
] as const satisfies readonly CapabilityDefinition<DataPatternId>[];

const validations = [
	{
		id: 'zod',
		label: 'Zod',
		description: 'Use Zod for shared schemas and authoritative boundary validation.',
		support: pendingIntegration(
			'The Zod adapter passed generated-project validation, check/test/build, and real Users mutation tests on Windows; repeatable multi-OS release evidence remains pending.'
		),
		docs: [{ label: 'Zod documentation', url: 'https://zod.dev/' }]
	}
] as const satisfies readonly CapabilityDefinition<ValidationId>[];

const orms = [
	{
		id: 'drizzle',
		label: 'Drizzle ORM',
		description: 'Use Drizzle for server-only schema, migration, and repository code.',
		support: pendingIntegration(
			'The Drizzle adapter passed generated migration checks and real PostgreSQL Users repository/service runtime tests on Windows; repeatable multi-OS release evidence remains pending.'
		),
		docs: [{ label: 'Drizzle ORM', url: 'https://orm.drizzle.team/docs/overview' }]
	}
] as const satisfies readonly CapabilityDefinition<OrmId>[];

const databaseDialects: readonly DatabaseDialectDefinition[] = [
	{
		id: 'postgresql',
		label: 'PostgreSQL',
		description: 'Use the PostgreSQL database dialect.',
		support: pendingIntegration(
			'The PostgreSQL recipe passed migration and full Users CRUD/action behavior against disposable PostgreSQL 17.11; repeatable CI and multi-OS release evidence remains pending.'
		),
		docs: [{ label: 'PostgreSQL', url: 'https://www.postgresql.org/docs/' }],
		providers: [
			{
				id: 'generic',
				label: 'Generic PostgreSQL',
				description: 'Use a standard PostgreSQL endpoint without a provider-specific adapter.',
				support: pendingIntegration(
					'The generic PostgreSQL provider passed migration and full Users CRUD/action behavior against disposable PostgreSQL 17.11; repeatable CI evidence remains pending.'
				),
				docs: [
					{
						label: 'Drizzle PostgreSQL guide',
						url: 'https://orm.drizzle.team/docs/get-started-postgresql'
					}
				],
				drivers: [
					{
						id: 'pg',
						label: 'node-postgres (pg)',
						description: 'Use the pg driver with generic PostgreSQL.',
						support: pendingIntegration(
							'The pg 8.23.0 driver integration passed migration and full Users CRUD/action behavior against disposable PostgreSQL 17.11; repeatable CI evidence remains pending.'
						),
						docs: [{ label: 'node-postgres', url: 'https://node-postgres.com/' }]
					}
				]
			}
		]
	}
];

const docker: ToggleCapabilityDefinition<'docker'> = {
	id: 'docker',
	label: 'Docker',
	description: 'Generate optional application container support.',
	defaultEnabled: false,
	support: pendingIntegration(
		'Docker output passed a clean multi-stage image build, non-root Node runtime, PostgreSQL 17.11 health wiring, HTTP request, and disposable shutdown proof with the Bun stack; repeatable CI evidence remains pending.'
	),
	docs: [
		{
			label: 'Docker build best practices',
			url: 'https://docs.docker.com/build/building/best-practices/'
		}
	]
};

const resources: readonly ToggleCapabilityDefinition<ResourceId>[] = [
	{
		id: 'users',
		label: 'Users example',
		description: 'Generate the canonical Users CRUD resource example.',
		defaultEnabled: true,
		support: pendingIntegration(
			'The Users example passed generated UI/check/test/build, guarded mutation behavior, migration, and full CRUD/actions against disposable PostgreSQL 17.11; authentication remains deliberately deferred.'
		),
		docs: [{ label: 'SvelteKit form actions', url: 'https://svelte.dev/docs/kit/form-actions' }]
	}
];

export interface CapabilityRegistry {
	readonly schemaVersion: ConfigSchemaVersion;
	readonly statuses: readonly SupportStatus[];
	readonly packageManagers: readonly CapabilityDefinition<PackageManagerId>[];
	readonly uiAdapters: readonly UiAdapterDefinition[];
	readonly dataPatterns: readonly CapabilityDefinition<DataPatternId>[];
	readonly validations: readonly CapabilityDefinition<ValidationId>[];
	readonly orms: readonly CapabilityDefinition<OrmId>[];
	readonly databaseDialects: readonly DatabaseDialectDefinition[];
	readonly features: { readonly docker: ToggleCapabilityDefinition<'docker'> };
	readonly resources: readonly ToggleCapabilityDefinition<ResourceId>[];
	readonly defaults: {
		readonly packageManager: PackageManagerId;
		readonly ui: { readonly adapter: UiAdapterId; readonly theme: ThemeId };
		readonly dataPattern: DataPatternId;
		readonly validation: ValidationId;
		readonly orm: OrmId;
		readonly database: {
			readonly dialect: 'postgresql';
			readonly provider: 'generic';
			readonly driver: 'pg';
		};
		readonly docker: false;
		readonly resources: { readonly users: true };
	};
}

export const capabilityRegistry: CapabilityRegistry = {
	schemaVersion: CONFIG_SCHEMA_VERSION,
	statuses: ['stable', 'experimental', 'unsupported', 'unknown'],
	packageManagers,
	uiAdapters,
	dataPatterns,
	validations,
	orms,
	databaseDialects,
	features: { docker },
	resources,
	defaults: {
		packageManager: 'bun',
		ui: { adapter: 'shadcn-svelte', theme: 'zinc' },
		dataPattern: 'sveltekit-standard',
		validation: 'zod',
		orm: 'drizzle',
		database: { dialect: 'postgresql', provider: 'generic', driver: 'pg' },
		docker: false,
		resources: { users: true }
	}
};

export function isSelectableSupport(support: CapabilitySupport): boolean {
	const upstreamSelectable = support.upstream === 'stable' || support.upstream === 'experimental';
	const integrationSelectable =
		support.integration === 'stable' || support.integration === 'experimental';
	return upstreamSelectable && integrationSelectable;
}

export function getUiAdapter(id: string) {
	return capabilityRegistry.uiAdapters.find((adapter) => adapter.id === id);
}

export function getThemesForUi(id: string): readonly ThemeDefinition[] {
	return getUiAdapter(id)?.themes ?? [];
}

export function getDatabaseDialect(id: string) {
	return capabilityRegistry.databaseDialects.find((dialect) => dialect.id === id);
}

export function getDatabaseProvider(dialectId: string, providerId: string) {
	return getDatabaseDialect(dialectId)?.providers.find((provider) => provider.id === providerId);
}

export function getDatabaseDriver(dialectId: string, providerId: string, driverId: string) {
	return getDatabaseProvider(dialectId, providerId)?.drivers.find(
		(driver) => driver.id === driverId
	);
}
