export const CONFIG_SCHEMA_VERSION = 1 as const;
export type ConfigSchemaVersion = typeof CONFIG_SCHEMA_VERSION;

export type SupportStatus = 'stable' | 'experimental' | 'unsupported' | 'unknown';
export type PackageManagerId = 'bun' | 'npm' | 'pnpm' | 'yarn' | 'deno';
export type UiAdapterId = 'shadcn-svelte' | 'fluid-ui';
export type ThemeId = 'neutral' | 'stone' | 'zinc' | 'mauve' | 'olive' | 'mist' | 'taupe';
export type IconLibraryId = 'lucide' | 'tabler' | 'hugeicons' | 'phosphor' | 'remixicon';
export type DataPatternId = 'sveltekit-standard' | 'sveltekit-remote-functions';
export type ValidationId = 'zod';
export type OrmId = 'drizzle';
export type DatabaseDialectId = 'postgresql';
export type DatabaseProviderId = 'generic';
export type DatabaseDriverId = 'pg';
export type ResourceId = 'users';

export type CapabilityKind =
	| 'package-manager'
	| 'ui-adapter'
	| 'theme'
	| 'icon-library'
	| 'data-pattern'
	| 'validation'
	| 'orm'
	| 'database-dialect'
	| 'database-provider'
	| 'database-driver'
	| 'feature'
	| 'resource';

export interface CapabilityDocumentation {
	readonly label: string;
	readonly url: string;
}

export interface ResearchBlocker {
	readonly code: string;
	readonly summary: string;
	readonly details: string;
}

export interface CapabilitySupport {
	readonly upstream: SupportStatus;
	readonly integration: SupportStatus;
	readonly warning?: string;
	readonly blocker?: ResearchBlocker;
}

export interface CapabilityDefinition<Id extends string = string> {
	readonly id: Id;
	readonly label: string;
	readonly description: string;
	readonly support: CapabilitySupport;
	readonly docs: readonly CapabilityDocumentation[];
}

export interface ThemeDefinition<Id extends ThemeId = ThemeId> extends CapabilityDefinition<Id> {
	readonly baseColor: Id;
}

export type IconLibraryDefinition<Id extends IconLibraryId = IconLibraryId> =
	CapabilityDefinition<Id>;

export interface UiAdapterDefinition extends CapabilityDefinition<UiAdapterId> {
	readonly themes: readonly ThemeDefinition[];
	readonly iconLibraries: readonly IconLibraryDefinition[];
}

export type DatabaseDriverDefinition = CapabilityDefinition<DatabaseDriverId>;

export interface DatabaseProviderDefinition extends CapabilityDefinition<DatabaseProviderId> {
	readonly drivers: readonly DatabaseDriverDefinition[];
}

export interface DatabaseDialectDefinition extends CapabilityDefinition<DatabaseDialectId> {
	readonly providers: readonly DatabaseProviderDefinition[];
}

export interface ToggleCapabilityDefinition<
	Id extends string = string
> extends CapabilityDefinition<Id> {
	readonly defaultEnabled: boolean;
}

export interface ConfigSelection {
	readonly schemaVersion: ConfigSchemaVersion;
	readonly projectName: string;
	readonly packageManager: PackageManagerId;
	readonly ui: {
		readonly adapter: UiAdapterId;
		readonly theme: ThemeId;
		readonly iconLibrary: IconLibraryId;
	};
	readonly dataPattern: DataPatternId;
	readonly validation: ValidationId;
	readonly orm: OrmId;
	readonly database: {
		readonly dialect: DatabaseDialectId;
		readonly provider: DatabaseProviderId;
		readonly driver: DatabaseDriverId;
	};
	readonly docker: boolean;
	readonly resources: { readonly users: boolean };
}

export interface RawConfig {
	readonly schemaVersion?: number;
	readonly projectName: string;
	readonly packageManager?: string;
	readonly ui?: {
		readonly adapter?: string;
		readonly theme?: string;
		readonly iconLibrary?: string;
	};
	readonly dataPattern?: string;
	readonly validation?: string;
	readonly orm?: string;
	readonly database?: {
		readonly dialect?: string;
		readonly provider?: string;
		readonly driver?: string;
	};
	readonly docker?: boolean;
	readonly resources?: { readonly users?: boolean };
}

export type DefaultedConfigPath =
	| 'packageManager'
	| 'ui.adapter'
	| 'ui.theme'
	| 'ui.iconLibrary'
	| 'dataPattern'
	| 'validation'
	| 'orm'
	| 'database.dialect'
	| 'database.provider'
	| 'database.driver'
	| 'docker'
	| 'resources.users';

export interface ResolvedConfig extends ConfigSelection {
	readonly defaultsApplied: readonly DefaultedConfigPath[];
	readonly warnings: readonly ConfigIssue[];
}

export type ConfigIssueCode =
	| 'invalid-config'
	| 'unsupported-schema-version'
	| 'missing-project-name'
	| 'invalid-project-name'
	| 'invalid-type'
	| 'unknown-capability'
	| 'unselectable-capability'
	| 'theme-not-owned'
	| 'icon-library-not-owned'
	| 'database-provider-not-owned'
	| 'database-driver-not-owned'
	| 'incompatible-capabilities'
	| 'experimental-capability';

export interface ConfigIssue {
	readonly code: ConfigIssueCode;
	readonly severity: 'error' | 'warning';
	readonly path: string;
	readonly message: string;
	readonly capability?: {
		readonly kind: CapabilityKind;
		readonly id: string;
		readonly status?: SupportStatus;
	};
}

export type ConfigResolutionResult =
	| { readonly ok: true; readonly config: ResolvedConfig; readonly issues: readonly ConfigIssue[] }
	| { readonly ok: false; readonly issues: readonly ConfigIssue[] };

export type ChoiceField =
	| 'packageManager'
	| 'ui.adapter'
	| 'ui.theme'
	| 'ui.iconLibrary'
	| 'dataPattern'
	| 'validation'
	| 'orm'
	| 'database.dialect'
	| 'database.provider'
	| 'database.driver';

export interface ChoiceOption<Id extends string = string> {
	readonly id: Id;
	readonly label: string;
	readonly description: string;
	readonly support: CapabilitySupport;
	readonly selectable: boolean;
	readonly docs: readonly CapabilityDocumentation[];
}

export interface ConditionalChoiceDescriptor {
	readonly field: ChoiceField;
	readonly label: string;
	readonly description: string;
	readonly dependsOn?: ChoiceField;
	readonly defaultValue: string;
}

export interface ConfiguratorCatalog {
	readonly schemaVersion: ConfigSchemaVersion;
	readonly selectionOrder: readonly (ChoiceField | 'projectName' | 'docker' | 'resources.users')[];
	readonly choices: readonly ConditionalChoiceDescriptor[];
	readonly packageManagers: readonly ChoiceOption<PackageManagerId>[];
	readonly uiAdapters: readonly (ChoiceOption<UiAdapterId> & {
		readonly themes: readonly ChoiceOption<ThemeId>[];
		readonly iconLibraries: readonly ChoiceOption<IconLibraryId>[];
	})[];
	readonly dataPatterns: readonly ChoiceOption<DataPatternId>[];
	readonly validations: readonly ChoiceOption<ValidationId>[];
	readonly orms: readonly ChoiceOption<OrmId>[];
	readonly databaseDialects: readonly (ChoiceOption<DatabaseDialectId> & {
		readonly providers: readonly (ChoiceOption<DatabaseProviderId> & {
			readonly drivers: readonly ChoiceOption<DatabaseDriverId>[];
		})[];
	})[];
	readonly docker: ChoiceOption<'docker'> & { readonly defaultEnabled: boolean };
	readonly resources: readonly (ChoiceOption<ResourceId> & {
		readonly defaultEnabled: boolean;
	})[];
}
