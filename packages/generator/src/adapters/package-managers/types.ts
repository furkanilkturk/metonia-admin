import type { PackageManagerId } from '@metonia-admin/registry';

import type { StagedCommandPlan } from '../../contracts/index.js';

export type PackageManagerGenerationStatus = 'implemented' | 'blocked';

/**
 * Package-manager behavior is expressed as executable plus argv. Callers never interpolate a
 * shell command, which keeps project names and paths inert when the generator runs a plan.
 */
export interface PackageManagerAdapter {
	readonly id: PackageManagerId;
	readonly label: string;
	readonly version: string;
	readonly packageManagerField: string;
	readonly lockfile: string;
	readonly generationStatus: PackageManagerGenerationStatus;
	readonly blocker?: string;
	/** Optional empty boundary marker required before this manager can identify a standalone project. */
	readonly initialLockfileContents?: string;
	/** Manager-owned project configuration required for deterministic, policy-compliant installs. */
	readonly configurationFiles: Readonly<Record<string, string>>;
	readonly installCommand: StagedCommandPlan;
	readonly frozenInstallCommand: StagedCommandPlan;
	add(packages: readonly string[]): StagedCommandPlan;
	addDev(packages: readonly string[]): StagedCommandPlan;
	run(script: string, arguments_?: readonly string[]): StagedCommandPlan;
	exec(packageSpecifier: string, arguments_?: readonly string[]): StagedCommandPlan;
}

export interface PackageManagerAdapterDefinition {
	readonly id: PackageManagerId;
	readonly label: string;
	readonly version: string;
	readonly lockfile: string;
	readonly generationStatus: PackageManagerGenerationStatus;
	readonly blocker?: string;
	readonly install: readonly string[];
	readonly frozenInstall: readonly string[];
	readonly add: readonly string[];
	readonly addDev: readonly string[];
	readonly run: readonly string[];
	readonly exec: readonly string[];
	readonly executable: string;
	readonly execExecutable?: string;
	readonly packageSpecifierPrefix?: string;
	readonly initialLockfileContents?: string;
	readonly configurationFiles?: Readonly<Record<string, string>>;
}
