import { packageManagerVersions } from '../../adapters/package-managers/index.js';

export const generatedToolVersions = Object.freeze({
	adapterNode: '5.5.7',
	bun: packageManagerVersions.bun,
	svelte: '5.56.10',
	svelteCheck: '4.6.0',
	svelteKit: '2.70.3',
	sv: '0.17.0',
	typeScript: '6.0.3',
	vite: '8.0.16',
	vitePluginSvelte: '7.1.2',
	vitest: '4.1.11'
});

export type GeneratedToolVersions = typeof generatedToolVersions;
