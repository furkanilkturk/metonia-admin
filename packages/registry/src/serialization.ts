import { resolveConfig } from './config.js';
import {
	CONFIG_SCHEMA_VERSION,
	type ConfigSchemaVersion,
	type ConfigIssue,
	type ConfigResolutionResult,
	type ConfigSelection,
	type DatabaseDialectId,
	type DatabaseDriverId,
	type DatabaseProviderId,
	type DataPatternId,
	type IconLibraryId,
	type OrmId,
	type PackageManagerId,
	type ResolvedConfig,
	type ThemeId,
	type UiAdapterId,
	type ValidationId
} from './types.js';

export interface GeneratedConfig {
	readonly schemaVersion: ConfigSchemaVersion;
	readonly project: { readonly name: string };
	readonly packageManager: PackageManagerId;
	readonly ui: {
		readonly library: UiAdapterId;
		readonly theme: ThemeId;
		readonly iconLibrary: IconLibraryId;
	};
	readonly dataPattern: DataPatternId;
	readonly validation: { readonly library: ValidationId };
	readonly database: {
		readonly orm: OrmId;
		readonly dialect: DatabaseDialectId;
		readonly provider: DatabaseProviderId;
		readonly driver: DatabaseDriverId;
	};
	readonly docker: { readonly enabled: boolean };
	readonly resources: { readonly users: boolean };
}

export function toGeneratedConfig(config: ResolvedConfig | ConfigSelection): GeneratedConfig {
	return {
		schemaVersion: CONFIG_SCHEMA_VERSION,
		project: { name: config.projectName },
		packageManager: config.packageManager,
		ui: {
			library: config.ui.adapter,
			theme: config.ui.theme,
			iconLibrary: config.ui.iconLibrary
		},
		dataPattern: config.dataPattern,
		validation: { library: config.validation },
		database: {
			orm: config.orm,
			dialect: config.database.dialect,
			provider: config.database.provider,
			driver: config.database.driver
		},
		docker: { enabled: config.docker },
		resources: { users: config.resources.users }
	};
}

export function serializeGeneratedConfig(config: ResolvedConfig | ConfigSelection): string {
	return `${JSON.stringify(toGeneratedConfig(config), null, 2)}\n`;
}

export function parseGeneratedConfig(serialized: string): ConfigResolutionResult {
	let parsed: unknown;
	try {
		parsed = JSON.parse(serialized) as unknown;
	} catch {
		return {
			ok: false,
			issues: [
				{
					code: 'invalid-config',
					severity: 'error',
					path: '',
					message: 'Generated configuration is not valid JSON.'
				}
			]
		};
	}

	const shapeIssues = validateGeneratedConfigShape(parsed);
	if (shapeIssues.length > 0) return { ok: false, issues: shapeIssues };

	const config = parsed as GeneratedConfig;
	return resolveConfig({
		schemaVersion: config.schemaVersion,
		projectName: config.project.name,
		packageManager: config.packageManager,
		ui: {
			adapter: config.ui.library,
			theme: config.ui.theme,
			iconLibrary: config.ui.iconLibrary
		},
		dataPattern: config.dataPattern,
		validation: config.validation.library,
		orm: config.database.orm,
		database: {
			dialect: config.database.dialect,
			provider: config.database.provider,
			driver: config.database.driver
		},
		docker: config.docker.enabled,
		resources: { users: config.resources.users }
	});
}

export function renderGeneratedConfigModule(config: ResolvedConfig | ConfigSelection): string {
	const literal = JSON.stringify(toGeneratedConfig(config), null, '\t');
	return `export default ${literal} as const;\n`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidShape(path: string, expected: string): ConfigIssue {
	return {
		code: 'invalid-type',
		severity: 'error',
		path,
		message: `${path} must be ${expected} in generated configuration.`
	};
}

function requireRecord(
	parent: Record<string, unknown>,
	key: string,
	path: string,
	issues: ConfigIssue[]
): Record<string, unknown> {
	const value = parent[key];
	if (isRecord(value)) return value;
	issues.push(invalidShape(path, 'an object'));
	return {};
}

function requireString(
	parent: Record<string, unknown>,
	key: string,
	path: string,
	issues: ConfigIssue[]
): void {
	if (typeof parent[key] !== 'string') issues.push(invalidShape(path, 'a string'));
}

function requireBoolean(
	parent: Record<string, unknown>,
	key: string,
	path: string,
	issues: ConfigIssue[]
): void {
	if (typeof parent[key] !== 'boolean') issues.push(invalidShape(path, 'a boolean'));
}

function validateGeneratedConfigShape(value: unknown): readonly ConfigIssue[] {
	if (!isRecord(value)) {
		return [
			{
				code: 'invalid-config',
				severity: 'error',
				path: '',
				message: 'Generated configuration must be an object.'
			}
		];
	}

	const issues: ConfigIssue[] = [];
	if (value.schemaVersion !== CONFIG_SCHEMA_VERSION) {
		issues.push({
			code: 'unsupported-schema-version',
			severity: 'error',
			path: 'schemaVersion',
			message: `Generated configuration schemaVersion must be ${CONFIG_SCHEMA_VERSION}; received ${JSON.stringify(value.schemaVersion)}.`
		});
	}

	const project = requireRecord(value, 'project', 'project', issues);
	requireString(project, 'name', 'project.name', issues);
	requireString(value, 'packageManager', 'packageManager', issues);
	const ui = requireRecord(value, 'ui', 'ui', issues);
	requireString(ui, 'library', 'ui.library', issues);
	requireString(ui, 'theme', 'ui.theme', issues);
	requireString(ui, 'iconLibrary', 'ui.iconLibrary', issues);
	requireString(value, 'dataPattern', 'dataPattern', issues);
	const validation = requireRecord(value, 'validation', 'validation', issues);
	requireString(validation, 'library', 'validation.library', issues);
	const database = requireRecord(value, 'database', 'database', issues);
	requireString(database, 'orm', 'database.orm', issues);
	requireString(database, 'dialect', 'database.dialect', issues);
	requireString(database, 'provider', 'database.provider', issues);
	requireString(database, 'driver', 'database.driver', issues);
	const docker = requireRecord(value, 'docker', 'docker', issues);
	requireBoolean(docker, 'enabled', 'docker.enabled', issues);
	const resources = requireRecord(value, 'resources', 'resources', issues);
	requireBoolean(resources, 'users', 'resources.users', issues);
	return issues;
}
