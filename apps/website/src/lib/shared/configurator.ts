import {
	capabilityRegistry,
	configuratorCatalog,
	getConditionalChoices,
	resolveConfig,
	renderGeneratedConfigModule,
	type CapabilitySupport,
	type RawConfig,
	type ResolvedConfig,
	type SupportStatus
} from '@metonia-admin/registry';

export type WebsiteDraft = {
	projectName: string;
	packageManager: string;
	uiAdapter: string;
	uiTheme: string;
	iconLibrary: string;
	dataPattern: string;
	validation: string;
	orm: string;
	dialect: string;
	provider: string;
	driver: string;
	docker: boolean;
	users: boolean;
};

export const statusLabel: Record<SupportStatus, string> = {
	stable: 'Stable',
	experimental: 'Experimental',
	unsupported: 'Unsupported',
	unknown: 'Unknown'
};

export function initialDraft(): WebsiteDraft {
	const defaults = capabilityRegistry.defaults;
	return {
		projectName: 'acme-admin',
		packageManager: defaults.packageManager,
		uiAdapter: defaults.ui.adapter,
		uiTheme: defaults.ui.theme,
		iconLibrary: defaults.ui.iconLibrary,
		dataPattern: defaults.dataPattern,
		validation: defaults.validation,
		orm: defaults.orm,
		dialect: defaults.database.dialect,
		provider: defaults.database.provider,
		driver: defaults.database.driver,
		docker: defaults.docker,
		users: defaults.resources.users
	};
}

export function toRawConfig(draft: WebsiteDraft): RawConfig {
	return {
		projectName: draft.projectName,
		packageManager: draft.packageManager,
		ui: {
			adapter: draft.uiAdapter,
			theme: draft.uiTheme,
			iconLibrary: draft.iconLibrary
		},
		dataPattern: draft.dataPattern,
		validation: draft.validation,
		orm: draft.orm,
		database: { dialect: draft.dialect, provider: draft.provider, driver: draft.driver },
		docker: draft.docker,
		resources: { users: draft.users }
	};
}

export function resolveDraft(draft: WebsiteDraft) {
	return resolveConfig(toRawConfig(draft));
}

export function previewModule(config: ResolvedConfig | undefined): string {
	return config
		? renderGeneratedConfigModule(config)
		: '// Resolve the selections above to preview the config.';
}

export function previewCommand(config: ResolvedConfig | undefined): string {
	if (!config) return 'npx create-metonia-admin@latest <project-name> --yes';
	const bits = [
		`npx create-metonia-admin@latest ${config.projectName}`,
		`--package-manager ${config.packageManager}`,
		`--ui ${config.ui.adapter}`,
		`--theme ${config.ui.theme}`,
		`--icon-library ${config.ui.iconLibrary}`,
		`--data-pattern ${config.dataPattern === 'sveltekit-standard' ? 'standard' : 'remote-functions'}`,
		`--validation ${config.validation}`,
		`--orm ${config.orm}`,
		`--database ${config.database.dialect}`,
		`--provider ${config.database.provider}`,
		`--driver ${config.database.driver}`,
		config.docker ? '--docker' : '--no-docker',
		config.resources.users ? '--users' : '--no-users',
		'--yes'
	];
	return bits.join(' ');
}

export function choicesFor(
	field: Parameters<typeof getConditionalChoices>[0],
	draft: WebsiteDraft
) {
	return getConditionalChoices(
		field,
		{
			projectName: draft.projectName,
			ui: {
				adapter: draft.uiAdapter,
				theme: draft.uiTheme,
				iconLibrary: draft.iconLibrary
			},
			database: { dialect: draft.dialect, provider: draft.provider, driver: draft.driver }
		},
		{ includeUnavailable: true }
	);
}

export function supportTone(support: CapabilitySupport): SupportStatus {
	return support.integration;
}

export { configuratorCatalog };
export type { SupportStatus };
