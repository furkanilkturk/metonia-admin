export {
	capabilityRegistry,
	getDatabaseDialect,
	getDatabaseDriver,
	getDatabaseProvider,
	getThemesForUi,
	getUiAdapter,
	isSelectableSupport
} from './registry.js';

export {
	ConfigResolutionError,
	normalizeProjectName,
	resolveConfig,
	resolveConfigOrThrow,
	validateCompatibility,
	validateProjectName
} from './config.js';

export { configuratorCatalog, getConditionalChoices, getConfiguratorCatalog } from './catalog.js';

export {
	parseGeneratedConfig,
	renderGeneratedConfigModule,
	serializeGeneratedConfig,
	toGeneratedConfig
} from './serialization.js';

export { CONFIG_SCHEMA_VERSION } from './types.js';

export type {
	CapabilityDefinition,
	CapabilityDocumentation,
	CapabilityKind,
	CapabilitySupport,
	ChoiceField,
	ChoiceOption,
	ConditionalChoiceDescriptor,
	ConfigIssue,
	ConfigIssueCode,
	ConfigResolutionResult,
	ConfigSchemaVersion,
	ConfigSelection,
	ConfiguratorCatalog,
	DatabaseDialectDefinition,
	DatabaseDialectId,
	DatabaseDriverDefinition,
	DatabaseDriverId,
	DatabaseProviderDefinition,
	DatabaseProviderId,
	DataPatternId,
	DefaultedConfigPath,
	OrmId,
	PackageManagerId,
	RawConfig,
	ResearchBlocker,
	ResolvedConfig,
	ResourceId,
	SupportStatus,
	ThemeDefinition,
	ThemeId,
	ToggleCapabilityDefinition,
	UiAdapterDefinition,
	UiAdapterId,
	ValidationId
} from './types.js';

export type { CapabilityRegistry } from './registry.js';
export type { ConditionalChoiceOptions } from './catalog.js';
export type { GeneratedConfig } from './serialization.js';
