import type { ResolvedConfig } from '@metonia-admin/registry';

/** Runtime and database images shared by every package-manager-owned Docker build plan. */
export const dockerRuntime = Object.freeze({
	nodeImage: 'node:24.19.0-bookworm-slim',
	postgresImage: 'postgres:17.11-bookworm',
	runtimeUser: 'node'
});

export function assertSupportedDockerConfiguration(config: ResolvedConfig): void {
	if (!config.docker) return;
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
