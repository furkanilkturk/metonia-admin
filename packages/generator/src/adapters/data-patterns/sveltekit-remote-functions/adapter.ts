const compilerOptionsMarker = '\t\t\tcompilerOptions: {\n';
const adapterMarker = '\n\t\t\tadapter: adapter()';

const asyncOption = '\t\t\t\texperimental: { async: true },\n';
const remoteFunctionsOption = '\n\t\t\texperimental: {\n\t\t\t\tremoteFunctions: true\n\t\t\t},';

export const remoteFunctionsViteConfigFragments = Object.freeze({
	async: 'experimental: { async: true }',
	remoteFunctions: 'remoteFunctions: true'
});

/**
 * Enables the two upstream experimental switches in the active `sveltekit(...)` Vite config.
 *
 * The pinned `sv` scaffold configures SvelteKit through the Vite plugin rather than a separate
 * `svelte.config.*`. Fail closed when that reviewed shape changes so generation never writes an
 * ignored second config or silently enables only half of the experiment.
 */
export function enableRemoteFunctionsInViteConfig(source: string): string {
	const hasAsync = source.includes(remoteFunctionsViteConfigFragments.async);
	const hasRemoteFunctions = source.includes(remoteFunctionsViteConfigFragments.remoteFunctions);
	if (hasAsync || hasRemoteFunctions) {
		if (hasAsync && hasRemoteFunctions) return source;
		throw new Error('The active Vite configuration contains a partial Remote Functions setup.');
	}

	if (!source.includes('sveltekit({') || !source.includes(compilerOptionsMarker)) {
		throw new Error('The active Vite configuration does not expose compiler options.');
	}
	if (!source.includes(adapterMarker)) {
		throw new Error('The active Vite configuration does not expose the SvelteKit adapter option.');
	}

	const withAsync = source.replace(compilerOptionsMarker, `${compilerOptionsMarker}${asyncOption}`);
	if (withAsync === source) {
		throw new Error('Unable to enable experimental async Svelte compilation.');
	}

	const transformed = withAsync.replace(adapterMarker, `${remoteFunctionsOption}${adapterMarker}`);
	if (transformed === withAsync) {
		throw new Error('Unable to enable experimental SvelteKit Remote Functions.');
	}
	return transformed;
}
