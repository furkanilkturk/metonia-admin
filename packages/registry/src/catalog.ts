import {
	capabilityRegistry,
	getDatabaseDialect,
	getDatabaseProvider,
	getIconLibrariesForUi,
	getUiAdapter,
	isSelectableSupport
} from './registry.js';
import {
	CONFIG_SCHEMA_VERSION,
	type CapabilityDefinition,
	type ChoiceField,
	type ChoiceOption,
	type ConditionalChoiceDescriptor,
	type ConfiguratorCatalog,
	type RawConfig
} from './types.js';

function toChoice<Id extends string>(definition: CapabilityDefinition<Id>): ChoiceOption<Id> {
	return {
		id: definition.id,
		label: definition.label,
		description: definition.description,
		support: definition.support,
		selectable: isSelectableSupport(definition.support),
		docs: definition.docs
	};
}

const choiceDescriptors = [
	{
		field: 'packageManager',
		label: 'Package manager',
		description: 'Choose how the generated project installs dependencies and runs scripts.',
		defaultValue: capabilityRegistry.defaults.packageManager
	},
	{
		field: 'ui.adapter',
		label: 'UI adapter',
		description: 'Choose the UI adapter before selecting one of its themes.',
		defaultValue: capabilityRegistry.defaults.ui.adapter
	},
	{
		field: 'ui.theme',
		label: 'Theme',
		description: 'Choose a theme owned by the selected UI adapter.',
		dependsOn: 'ui.adapter',
		defaultValue: capabilityRegistry.defaults.ui.theme
	},
	{
		field: 'ui.iconLibrary',
		label: 'Icon library',
		description: 'Choose an icon family supported by the selected UI adapter.',
		dependsOn: 'ui.adapter',
		defaultValue: capabilityRegistry.defaults.ui.iconLibrary
	},
	{
		field: 'dataPattern',
		label: 'Data pattern',
		description: 'Choose the native SvelteKit data boundary.',
		defaultValue: capabilityRegistry.defaults.dataPattern
	},
	{
		field: 'validation',
		label: 'Validation',
		description: 'Choose the validation library.',
		defaultValue: capabilityRegistry.defaults.validation
	},
	{
		field: 'orm',
		label: 'ORM',
		description: 'Choose the server-only persistence adapter.',
		defaultValue: capabilityRegistry.defaults.orm
	},
	{
		field: 'database.dialect',
		label: 'Database dialect',
		description: 'Choose the database dialect.',
		defaultValue: capabilityRegistry.defaults.database.dialect
	},
	{
		field: 'database.provider',
		label: 'Database provider',
		description: 'Choose a provider owned by the selected dialect.',
		dependsOn: 'database.dialect',
		defaultValue: capabilityRegistry.defaults.database.provider
	},
	{
		field: 'database.driver',
		label: 'Database driver',
		description: 'Choose a driver owned by the selected dialect and provider.',
		dependsOn: 'database.provider',
		defaultValue: capabilityRegistry.defaults.database.driver
	}
] as const satisfies readonly ConditionalChoiceDescriptor[];

export const configuratorCatalog: ConfiguratorCatalog = {
	schemaVersion: CONFIG_SCHEMA_VERSION,
	selectionOrder: [
		'projectName',
		'packageManager',
		'ui.adapter',
		'ui.theme',
		'ui.iconLibrary',
		'dataPattern',
		'validation',
		'orm',
		'database.dialect',
		'database.provider',
		'database.driver',
		'docker',
		'resources.users'
	],
	choices: choiceDescriptors,
	packageManagers: capabilityRegistry.packageManagers.map(toChoice),
	uiAdapters: capabilityRegistry.uiAdapters.map((adapter) => ({
		...toChoice(adapter),
		themes: adapter.themes.map(toChoice),
		iconLibraries: adapter.iconLibraries.map(toChoice)
	})),
	dataPatterns: capabilityRegistry.dataPatterns.map(toChoice),
	validations: capabilityRegistry.validations.map(toChoice),
	orms: capabilityRegistry.orms.map(toChoice),
	databaseDialects: capabilityRegistry.databaseDialects.map((dialect) => ({
		...toChoice(dialect),
		providers: dialect.providers.map((provider) => ({
			...toChoice(provider),
			drivers: provider.drivers.map(toChoice)
		}))
	})),
	docker: {
		...toChoice(capabilityRegistry.features.docker),
		defaultEnabled: capabilityRegistry.features.docker.defaultEnabled
	},
	resources: capabilityRegistry.resources.map((resource) => ({
		...toChoice(resource),
		defaultEnabled: resource.defaultEnabled
	}))
};

export interface ConditionalChoiceOptions {
	readonly includeUnavailable?: boolean;
}

function visibleChoices(
	definitions: readonly CapabilityDefinition[],
	options: ConditionalChoiceOptions
): readonly ChoiceOption[] {
	const choices = definitions.map(toChoice);
	return options.includeUnavailable ? choices : choices.filter((choice) => choice.selectable);
}

export function getConditionalChoices(
	field: ChoiceField,
	config: Partial<RawConfig> = {},
	options: ConditionalChoiceOptions = {}
): readonly ChoiceOption[] {
	if (field === 'packageManager')
		return visibleChoices(capabilityRegistry.packageManagers, options);
	if (field === 'ui.adapter') return visibleChoices(capabilityRegistry.uiAdapters, options);
	if (field === 'ui.theme') {
		const adapterId = config.ui?.adapter ?? capabilityRegistry.defaults.ui.adapter;
		return visibleChoices(getUiAdapter(adapterId)?.themes ?? [], options);
	}
	if (field === 'ui.iconLibrary') {
		const adapterId = config.ui?.adapter ?? capabilityRegistry.defaults.ui.adapter;
		return visibleChoices(getIconLibrariesForUi(adapterId), options);
	}
	if (field === 'dataPattern') return visibleChoices(capabilityRegistry.dataPatterns, options);
	if (field === 'validation') return visibleChoices(capabilityRegistry.validations, options);
	if (field === 'orm') return visibleChoices(capabilityRegistry.orms, options);
	if (field === 'database.dialect') {
		return visibleChoices(capabilityRegistry.databaseDialects, options);
	}
	if (field === 'database.provider') {
		const dialect = config.database?.dialect ?? capabilityRegistry.defaults.database.dialect;
		return visibleChoices(getDatabaseDialect(dialect)?.providers ?? [], options);
	}

	const dialect = config.database?.dialect ?? capabilityRegistry.defaults.database.dialect;
	const provider = config.database?.provider ?? capabilityRegistry.defaults.database.provider;
	return visibleChoices(getDatabaseProvider(dialect, provider)?.drivers ?? [], options);
}

export function getConfiguratorCatalog(): ConfiguratorCatalog {
	return configuratorCatalog;
}
