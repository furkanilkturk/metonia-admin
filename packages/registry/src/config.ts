import {
	capabilityRegistry,
	getDatabaseDialect,
	getDatabaseProvider,
	getIconLibrariesForUi,
	getThemesForUi,
	getUiAdapter,
	isSelectableSupport
} from './registry.js';
import {
	CONFIG_SCHEMA_VERSION,
	type CapabilityDefinition,
	type CapabilityKind,
	type ConfigIssue,
	type ConfigResolutionResult,
	type ConfigSelection,
	type DefaultedConfigPath,
	type ResolvedConfig
} from './types.js';

const PROJECT_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ConfigResolutionError extends Error {
	readonly issues: readonly ConfigIssue[];

	constructor(issues: readonly ConfigIssue[]) {
		super(issues.map((issue) => issue.message).join('\n'));
		this.name = 'ConfigResolutionError';
		this.issues = issues;
	}
}

export function normalizeProjectName(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-');
}

export function validateProjectName(value: unknown): readonly ConfigIssue[] {
	if (typeof value !== 'string' || value.trim() === '') {
		return [
			{
				code: 'missing-project-name',
				severity: 'error',
				path: 'projectName',
				message: 'Project name is required.'
			}
		];
	}

	const normalized = normalizeProjectName(value);
	if (normalized.length > 214 || !PROJECT_NAME_PATTERN.test(normalized)) {
		return [
			{
				code: 'invalid-project-name',
				severity: 'error',
				path: 'projectName',
				message:
					'Project name must normalize to 1–214 lowercase letters, numbers, and single hyphens, starting and ending with a letter or number.'
			}
		];
	}

	return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidType(path: string, expected: string): ConfigIssue {
	return {
		code: 'invalid-type',
		severity: 'error',
		path,
		message: `${path} must be ${expected}.`
	};
}

function nestedRecord(
	parent: Record<string, unknown>,
	key: string,
	issues: ConfigIssue[]
): Record<string, unknown> {
	if (parent[key] === undefined) return {};
	if (isRecord(parent[key])) return parent[key];
	issues.push(invalidType(key, 'an object'));
	return {};
}

function selectCapability<Id extends string>(
	value: unknown,
	path: DefaultedConfigPath,
	defaultId: Id,
	definitions: readonly CapabilityDefinition<Id>[],
	kind: CapabilityKind,
	defaults: DefaultedConfigPath[],
	errors: ConfigIssue[],
	warnings: ConfigIssue[]
): Id {
	if (value === undefined) {
		defaults.push(path);
		value = defaultId;
	}

	if (typeof value !== 'string') {
		errors.push(invalidType(path, 'a canonical capability ID string'));
		return defaultId;
	}

	const definition = definitions.find((candidate) => candidate.id === value);
	if (!definition) {
		errors.push({
			code: 'unknown-capability',
			severity: 'error',
			path,
			message: `Unknown ${kind} capability ID "${value}".`,
			capability: { kind, id: value }
		});
		return defaultId;
	}

	if (!isSelectableSupport(definition.support)) {
		errors.push({
			code: 'unselectable-capability',
			severity: 'error',
			path,
			message: `${definition.label} is ${definition.support.integration} in Metonia and cannot be selected.${definition.support.blocker ? ` ${definition.support.blocker.summary}` : ''}`,
			capability: {
				kind,
				id: definition.id,
				status: definition.support.integration
			}
		});
	}

	if (definition.support.integration === 'experimental') {
		warnings.push({
			code: 'experimental-capability',
			severity: 'warning',
			path,
			message:
				definition.support.warning ?? `${definition.label} is an experimental Metonia integration.`,
			capability: {
				kind,
				id: definition.id,
				status: definition.support.integration
			}
		});
	}

	return definition.id;
}

function selectBoolean(
	value: unknown,
	path: DefaultedConfigPath,
	defaultValue: boolean,
	defaults: DefaultedConfigPath[],
	errors: ConfigIssue[]
): boolean {
	if (value === undefined) {
		defaults.push(path);
		return defaultValue;
	}
	if (typeof value !== 'boolean') {
		errors.push(invalidType(path, 'a boolean'));
		return defaultValue;
	}
	return value;
}

function experimentalToggleWarning(
	enabled: boolean,
	path: string,
	definition: CapabilityDefinition,
	warnings: ConfigIssue[]
): void {
	if (enabled && definition.support.integration === 'experimental') {
		warnings.push({
			code: 'experimental-capability',
			severity: 'warning',
			path,
			message: definition.support.warning ?? `${definition.label} is experimental.`,
			capability: {
				kind: path === 'docker' ? 'feature' : 'resource',
				id: definition.id,
				status: 'experimental'
			}
		});
	}
}

export function validateCompatibility(config: ConfigSelection): readonly ConfigIssue[] {
	const issues: ConfigIssue[] = [];
	const adapter = getUiAdapter(config.ui.adapter);
	if (adapter && !adapter.themes.some((theme) => theme.id === config.ui.theme)) {
		issues.push({
			code: 'theme-not-owned',
			severity: 'error',
			path: 'ui.theme',
			message: `Theme "${config.ui.theme}" does not belong to UI adapter "${config.ui.adapter}".`,
			capability: { kind: 'theme', id: config.ui.theme }
		});
	}
	if (
		adapter &&
		!adapter.iconLibraries.some((iconLibrary) => iconLibrary.id === config.ui.iconLibrary)
	) {
		issues.push({
			code: 'icon-library-not-owned',
			severity: 'error',
			path: 'ui.iconLibrary',
			message: `Icon library "${config.ui.iconLibrary}" does not belong to UI adapter "${config.ui.adapter}".`,
			capability: { kind: 'icon-library', id: config.ui.iconLibrary }
		});
	}

	const dialect = getDatabaseDialect(config.database.dialect);
	const provider = dialect?.providers.find(
		(candidate) => candidate.id === config.database.provider
	);
	if (dialect && !provider) {
		issues.push({
			code: 'database-provider-not-owned',
			severity: 'error',
			path: 'database.provider',
			message: `Provider "${config.database.provider}" does not belong to dialect "${config.database.dialect}".`,
			capability: { kind: 'database-provider', id: config.database.provider }
		});
	}

	if (provider && !provider.drivers.some((driver) => driver.id === config.database.driver)) {
		issues.push({
			code: 'database-driver-not-owned',
			severity: 'error',
			path: 'database.driver',
			message: `Driver "${config.database.driver}" does not belong to provider "${config.database.provider}" under dialect "${config.database.dialect}".`,
			capability: { kind: 'database-driver', id: config.database.driver }
		});
	}

	if (config.dataPattern === 'sveltekit-remote-functions' && config.resources.users) {
		issues.push({
			code: 'incompatible-capabilities',
			severity: 'error',
			path: 'resources.users',
			message:
				'The experimental Remote Functions integration is a query proof and does not yet implement Users CRUD parity. Disable Users or select Standard SvelteKit.',
			capability: { kind: 'resource', id: 'users' }
		});
	}

	return issues;
}

export function resolveConfig(input: unknown): ConfigResolutionResult {
	if (!isRecord(input)) {
		return {
			ok: false,
			issues: [
				{
					code: 'invalid-config',
					severity: 'error',
					path: '',
					message: 'Configuration must be an object.'
				}
			]
		};
	}

	const errors: ConfigIssue[] = [];
	const warnings: ConfigIssue[] = [];
	const defaults: DefaultedConfigPath[] = [];
	if (input.schemaVersion !== undefined && input.schemaVersion !== CONFIG_SCHEMA_VERSION) {
		errors.push({
			code: 'unsupported-schema-version',
			severity: 'error',
			path: 'schemaVersion',
			message: `Unsupported configuration schema version "${String(input.schemaVersion)}"; expected ${CONFIG_SCHEMA_VERSION}.`
		});
	}

	errors.push(...validateProjectName(input.projectName));
	const projectName =
		typeof input.projectName === 'string' ? normalizeProjectName(input.projectName) : '';
	const ui = nestedRecord(input, 'ui', errors);
	const database = nestedRecord(input, 'database', errors);
	const resources = nestedRecord(input, 'resources', errors);

	const packageManager = selectCapability(
		input.packageManager,
		'packageManager',
		capabilityRegistry.defaults.packageManager,
		capabilityRegistry.packageManagers,
		'package-manager',
		defaults,
		errors,
		warnings
	);
	const uiAdapter = selectCapability(
		ui.adapter,
		'ui.adapter',
		capabilityRegistry.defaults.ui.adapter,
		capabilityRegistry.uiAdapters,
		'ui-adapter',
		defaults,
		errors,
		warnings
	);
	const adapterThemes = getThemesForUi(uiAdapter);
	const adapterIconLibraries = getIconLibrariesForUi(uiAdapter);
	const allThemes = capabilityRegistry.uiAdapters.flatMap((adapter) => adapter.themes);
	let uiTheme;
	if (
		typeof ui.theme === 'string' &&
		allThemes.some((theme) => theme.id === ui.theme) &&
		!adapterThemes.some((theme) => theme.id === ui.theme)
	) {
		uiTheme = ui.theme as ConfigSelection['ui']['theme'];
		errors.push({
			code: 'theme-not-owned',
			severity: 'error',
			path: 'ui.theme',
			message: `Theme "${ui.theme}" does not belong to UI adapter "${uiAdapter}".`,
			capability: { kind: 'theme', id: ui.theme }
		});
	} else {
		uiTheme = selectCapability(
			ui.theme,
			'ui.theme',
			capabilityRegistry.defaults.ui.theme,
			adapterThemes,
			'theme',
			defaults,
			errors,
			warnings
		);
	}
	const allIconLibraries = capabilityRegistry.uiAdapters.flatMap(
		(adapter) => adapter.iconLibraries
	);
	let uiIconLibrary;
	if (
		typeof ui.iconLibrary === 'string' &&
		allIconLibraries.some((iconLibrary) => iconLibrary.id === ui.iconLibrary) &&
		!adapterIconLibraries.some((iconLibrary) => iconLibrary.id === ui.iconLibrary)
	) {
		uiIconLibrary = ui.iconLibrary as ConfigSelection['ui']['iconLibrary'];
		errors.push({
			code: 'icon-library-not-owned',
			severity: 'error',
			path: 'ui.iconLibrary',
			message: `Icon library "${ui.iconLibrary}" does not belong to UI adapter "${uiAdapter}".`,
			capability: { kind: 'icon-library', id: ui.iconLibrary }
		});
	} else {
		uiIconLibrary = selectCapability(
			ui.iconLibrary,
			'ui.iconLibrary',
			capabilityRegistry.defaults.ui.iconLibrary,
			adapterIconLibraries,
			'icon-library',
			defaults,
			errors,
			warnings
		);
	}
	const dataPattern = selectCapability(
		input.dataPattern,
		'dataPattern',
		capabilityRegistry.defaults.dataPattern,
		capabilityRegistry.dataPatterns,
		'data-pattern',
		defaults,
		errors,
		warnings
	);
	const validation = selectCapability(
		input.validation,
		'validation',
		capabilityRegistry.defaults.validation,
		capabilityRegistry.validations,
		'validation',
		defaults,
		errors,
		warnings
	);
	const orm = selectCapability(
		input.orm,
		'orm',
		capabilityRegistry.defaults.orm,
		capabilityRegistry.orms,
		'orm',
		defaults,
		errors,
		warnings
	);
	const dialect = selectCapability(
		database.dialect,
		'database.dialect',
		capabilityRegistry.defaults.database.dialect,
		capabilityRegistry.databaseDialects,
		'database-dialect',
		defaults,
		errors,
		warnings
	);
	const provider = selectCapability(
		database.provider,
		'database.provider',
		capabilityRegistry.defaults.database.provider,
		getDatabaseDialect(dialect)?.providers ?? [],
		'database-provider',
		defaults,
		errors,
		warnings
	);
	const driver = selectCapability(
		database.driver,
		'database.driver',
		capabilityRegistry.defaults.database.driver,
		getDatabaseProvider(dialect, provider)?.drivers ?? [],
		'database-driver',
		defaults,
		errors,
		warnings
	);
	const docker = selectBoolean(
		input.docker,
		'docker',
		capabilityRegistry.defaults.docker,
		defaults,
		errors
	);
	const users = selectBoolean(
		resources.users,
		'resources.users',
		capabilityRegistry.defaults.resources.users,
		defaults,
		errors
	);

	const selection: ConfigSelection = {
		schemaVersion: CONFIG_SCHEMA_VERSION,
		projectName,
		packageManager,
		ui: { adapter: uiAdapter, theme: uiTheme, iconLibrary: uiIconLibrary },
		dataPattern,
		validation,
		orm,
		database: { dialect, provider, driver },
		docker,
		resources: { users }
	};
	errors.push(...validateCompatibility(selection));
	experimentalToggleWarning(docker, 'docker', capabilityRegistry.features.docker, warnings);
	const usersDefinition = capabilityRegistry.resources[0];
	if (usersDefinition) {
		experimentalToggleWarning(users, 'resources.users', usersDefinition, warnings);
	}

	if (errors.length > 0) return { ok: false, issues: [...errors, ...warnings] };
	const config: ResolvedConfig = { ...selection, defaultsApplied: defaults, warnings };
	return { ok: true, config, issues: warnings };
}

export function resolveConfigOrThrow(input: unknown): ResolvedConfig {
	const result = resolveConfig(input);
	if (!result.ok) throw new ConfigResolutionError(result.issues);
	return result.config;
}
