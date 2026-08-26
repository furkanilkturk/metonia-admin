import type { PackageManagerId } from '@metonia-admin/registry';

import type { StagedCommandPlan } from '../../contracts/index.js';
import type { PackageManagerAdapter, PackageManagerAdapterDefinition } from './types.js';

export const packageManagerVersions = Object.freeze({
	bun: '1.4.0',
	npm: '12.0.2',
	pnpm: '11.23.0',
	yarn: '4.18.0',
	deno: '2.9.5'
} satisfies Readonly<Record<PackageManagerId, string>>);

export const packageManagerLockfiles = Object.freeze([
	'bun.lock',
	'bun.lockb',
	'package-lock.json',
	'pnpm-lock.yaml',
	'yarn.lock',
	'deno.lock'
] as const);

const definitions = Object.freeze({
	bun: {
		id: 'bun',
		label: 'Bun',
		version: packageManagerVersions.bun,
		lockfile: 'bun.lock',
		generationStatus: 'implemented',
		executable: 'bun',
		execExecutable: 'bunx',
		install: ['install'],
		frozenInstall: ['install', '--frozen-lockfile'],
		add: ['add'],
		addDev: ['add', '--development'],
		run: ['run'],
		exec: [],
		manifestFields: {
			overrides: { cookie: '0.7.2', esbuild: '0.28.2' }
		},
		docker: {
			buildImage: 'oven/bun:1.4.0',
			dependencyFiles: ['package.json', 'bun.lock'],
			productionInstall: ['install', '--frozen-lockfile', '--production', '--ignore-scripts']
		}
	},
	npm: {
		id: 'npm',
		label: 'npm',
		version: packageManagerVersions.npm,
		lockfile: 'package-lock.json',
		generationStatus: 'implemented',
		executable: 'npm',
		execExecutable: 'npx',
		install: ['install'],
		frozenInstall: ['ci'],
		add: ['install', '--save'],
		addDev: ['install', '--save-dev'],
		run: ['run'],
		exec: ['--yes'],
		manifestFields: {
			overrides: {
				'@esbuild-kit/core-utils': { esbuild: '0.28.2' },
				'@sveltejs/kit': { cookie: '0.7.2' }
			}
		},
		docker: {
			buildImage: 'node:24.19.0-bookworm-slim',
			dependencyFiles: ['package.json', 'package-lock.json'],
			setupCommands: [['npm', 'install', '--global', `npm@${packageManagerVersions.npm}`]],
			productionInstall: ['ci', '--omit=dev', '--ignore-scripts']
		}
	},
	pnpm: {
		id: 'pnpm',
		label: 'pnpm',
		version: packageManagerVersions.pnpm,
		lockfile: 'pnpm-lock.yaml',
		generationStatus: 'implemented',
		executable: 'pnpm',
		install: ['install'],
		frozenInstall: ['install', '--frozen-lockfile'],
		add: ['add'],
		addDev: ['add', '--save-dev'],
		run: ['run'],
		exec: ['dlx'],
		manifestFields: {
			pnpm: {
				overrides: {
					'@esbuild-kit/core-utils>esbuild': '0.28.2',
					'@sveltejs/kit>cookie': '0.7.2'
				}
			}
		},
		configurationFiles: {
			'pnpm-workspace.yaml':
				'allowBuilds:\n  esbuild: true\n  "@hugeicons/svelte@1.1.5": true\nminimumReleaseAgeExclude:\n  - "@lucide/svelte@1.34.0"\n  - "@tabler/icons-svelte@3.46.0"\n  - "@hugeicons/svelte@1.1.5"\n  - "@hugeicons/core-free-icons@4.3.0"\n  - "phosphor-svelte@3.1.0"\n  - "remixicon-svelte@0.0.5"\n'
		},
		docker: {
			buildImage: 'node:24.19.0-bookworm-slim',
			dependencyFiles: ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'],
			setupCommands: [['corepack', 'enable']],
			productionInstall: ['install', '--prod', '--frozen-lockfile', '--ignore-scripts']
		}
	},
	yarn: {
		id: 'yarn',
		label: 'Yarn',
		version: packageManagerVersions.yarn,
		lockfile: 'yarn.lock',
		generationStatus: 'implemented',
		executable: 'yarn',
		install: ['install'],
		frozenInstall: ['install', '--immutable'],
		add: ['add'],
		addDev: ['add', '--dev'],
		run: ['run'],
		exec: ['dlx'],
		initialLockfileContents: '',
		manifestFields: {
			resolutions: {
				'@esbuild-kit/core-utils/esbuild': '0.28.2',
				'@sveltejs/kit/cookie': '0.7.2'
			}
		},
		configurationFiles: {
			'.yarnrc.yml':
				'nodeLinker: node-modules\nnpmPreapprovedPackages:\n  - "@lucide/svelte@1.34.0"\n  - "@tabler/icons-svelte@3.46.0"\n  - "@hugeicons/svelte@1.1.5"\n  - "@hugeicons/core-free-icons@4.3.0"\n  - "phosphor-svelte@3.1.0"\n  - "remixicon-svelte@0.0.5"\n'
		},
		docker: {
			buildImage: 'node:24.19.0-bookworm-slim',
			dependencyFiles: ['package.json', 'yarn.lock', '.yarnrc.yml'],
			setupCommands: [['corepack', 'enable']],
			productionInstall: ['workspaces', 'focus', '--all', '--production']
		}
	},
	deno: {
		id: 'deno',
		label: 'Deno',
		version: packageManagerVersions.deno,
		lockfile: 'deno.lock',
		generationStatus: 'blocked',
		blocker:
			'Deno generation is unavailable until the current Deno runtime passes the complete shadcn-svelte, Drizzle, PostgreSQL, adapter-node, and Docker matrix.',
		executable: 'deno',
		install: ['install'],
		frozenInstall: ['ci'],
		add: ['install', '--package-json'],
		addDev: ['install', '--package-json', '--dev'],
		run: ['task'],
		exec: ['run', '--allow-all'],
		packageSpecifierPrefix: 'npm:'
	}
} as const satisfies Readonly<Record<PackageManagerId, PackageManagerAdapterDefinition>>);

const adapters = Object.freeze(
	Object.fromEntries(
		Object.values(definitions).map((definition) => [definition.id, createAdapter(definition)])
	) as Record<PackageManagerId, PackageManagerAdapter>
);

export function getPackageManagerAdapter(id: PackageManagerId): PackageManagerAdapter {
	return adapters[id];
}

export function getImplementedPackageManagerAdapter(id: PackageManagerId): PackageManagerAdapter {
	const adapter = getPackageManagerAdapter(id);
	if (adapter.generationStatus !== 'implemented') {
		throw new Error(adapter.blocker ?? `${adapter.label} generation is unavailable.`);
	}
	return adapter;
}

export function getForeignLockfiles(adapter: PackageManagerAdapter): readonly string[] {
	return packageManagerLockfiles.filter((lockfile) => lockfile !== adapter.lockfile);
}

/** Formats a trusted adapter plan for generated documentation, never for execution. */
export function formatPackageManagerCommand(command: StagedCommandPlan): string {
	return [command.executable, ...command.arguments].map(quoteToken).join(' ');
}

function createAdapter(definition: PackageManagerAdapterDefinition): PackageManagerAdapter {
	const packageManagerField = `${definition.id}@${definition.version}`;
	const installCommand = command(definition.executable, definition.install);
	const frozenInstallCommand = command(definition.executable, definition.frozenInstall);

	return Object.freeze({
		id: definition.id,
		label: definition.label,
		version: definition.version,
		packageManagerField,
		lockfile: definition.lockfile,
		generationStatus: definition.generationStatus,
		...(definition.blocker === undefined ? {} : { blocker: definition.blocker }),
		...(definition.initialLockfileContents === undefined
			? {}
			: { initialLockfileContents: definition.initialLockfileContents }),
		configurationFiles: Object.freeze({ ...(definition.configurationFiles ?? {}) }),
		manifestFields: Object.freeze({ ...(definition.manifestFields ?? {}) }),
		...(definition.docker === undefined
			? {}
			: {
					docker: Object.freeze({
						buildImage: validatedToken(definition.docker.buildImage),
						dependencyFiles: Object.freeze(validated(definition.docker.dependencyFiles)),
						setupCommands: Object.freeze(
							(definition.docker.setupCommands ?? []).map(([executable, ...arguments_]) =>
								command(executable ?? '', arguments_)
							)
						),
						productionInstallCommand: command(
							definition.executable,
							definition.docker.productionInstall
						)
					})
				}),
		versionCommand: command(definition.executable, ['--version']),
		installCommand,
		frozenInstallCommand,
		add: (packages: readonly string[]) =>
			command(definition.executable, [...definition.add, ...validated(packages)]),
		addDev: (packages: readonly string[]) =>
			command(definition.executable, [...definition.addDev, ...validated(packages)]),
		run: (script: string, arguments_: readonly string[] = []) =>
			command(definition.executable, [
				...definition.run,
				validatedToken(script),
				...validated(arguments_)
			]),
		exec: (packageSpecifier: string, arguments_: readonly string[] = []) =>
			command(definition.execExecutable ?? definition.executable, [
				...definition.exec,
				`${definition.packageSpecifierPrefix ?? ''}${validatedToken(packageSpecifier)}`,
				...validated(arguments_)
			])
	});
}

function command(executable: string, arguments_: readonly string[]): StagedCommandPlan {
	return Object.freeze({
		executable: validatedToken(executable),
		arguments: Object.freeze(validated(arguments_))
	});
}

function validated(tokens: readonly string[]): string[] {
	if (tokens.length === 0) return [];
	return tokens.map(validatedToken);
}

function validatedToken(token: string): string {
	if (typeof token !== 'string' || token.trim().length === 0 || token.includes('\0')) {
		throw new Error('A package-manager command token is invalid.');
	}
	return token;
}

function quoteToken(token: string): string {
	if (/^[A-Za-z0-9@%_+=:,./-]+$/.test(token)) return token;
	return `'${token.replaceAll("'", `'"'"'`)}'`;
}
