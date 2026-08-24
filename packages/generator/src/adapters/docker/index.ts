import type { ResolvedConfig } from '@metonia-admin/registry';

/**
 * Docker output is intentionally restricted to the verified Bun build path. Package-manager
 * adapters own their lockfile and frozen-install semantics, so they must opt in separately.
 */
export const dockerRuntime = Object.freeze({
	bunImage: 'oven/bun:1.4.0',
	nodeImage: 'node:24.19.0-bookworm-slim',
	postgresImage: 'postgres:17.11-bookworm',
	runtimeUser: 'node'
});

export function assertSupportedDockerConfiguration(config: ResolvedConfig): void {
	if (!config.docker) return;
	if (config.packageManager !== 'bun') {
		throw new Error(
			`Docker generation currently requires the Bun package-manager adapter; received "${config.packageManager}".`
		);
	}
	if (
		config.database.dialect !== 'postgresql' ||
		config.database.provider !== 'generic' ||
		config.database.driver !== 'pg'
	) {
		throw new Error(
			'Docker generation currently supports only generic PostgreSQL with the pg driver.'
		);
	}
}
