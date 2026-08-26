/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import type { PackageManagerId } from '@metonia-admin/registry';

import {
	formatPackageManagerCommand,
	getForeignLockfiles,
	getImplementedPackageManagerAdapter,
	getPackageManagerAdapter,
	packageManagerLockfiles,
	packageManagerVersions
} from './index.js';

const expected = {
	bun: {
		field: 'bun@1.4.0',
		install: ['bun', 'install'],
		frozen: ['bun', 'install', '--frozen-lockfile'],
		lockfile: 'bun.lock',
		run: ['bun', 'run', 'check'],
		exec: ['bunx', 'shadcn-svelte@1.5.0', 'add', 'button']
	},
	npm: {
		field: 'npm@12.0.2',
		install: ['npm', 'install'],
		frozen: ['npm', 'ci'],
		lockfile: 'package-lock.json',
		run: ['npm', 'run', 'check'],
		exec: ['npx', '--yes', 'shadcn-svelte@1.5.0', 'add', 'button']
	},
	pnpm: {
		field: 'pnpm@11.23.0',
		install: ['pnpm', 'install'],
		frozen: ['pnpm', 'install', '--frozen-lockfile'],
		lockfile: 'pnpm-lock.yaml',
		run: ['pnpm', 'run', 'check'],
		exec: ['pnpm', 'dlx', 'shadcn-svelte@1.5.0', 'add', 'button']
	},
	yarn: {
		field: 'yarn@4.18.0',
		install: ['yarn', 'install'],
		frozen: ['yarn', 'install', '--immutable'],
		lockfile: 'yarn.lock',
		run: ['yarn', 'run', 'check'],
		exec: ['yarn', 'dlx', 'shadcn-svelte@1.5.0', 'add', 'button']
	},
	deno: {
		field: 'deno@2.9.5',
		install: ['deno', 'install'],
		frozen: ['deno', 'ci'],
		lockfile: 'deno.lock',
		run: ['deno', 'task', 'check'],
		exec: ['deno', 'run', '--allow-all', 'npm:shadcn-svelte@1.5.0', 'add', 'button']
	}
} as const;

describe('generated-project package-manager adapters', () => {
	for (const id of Object.keys(expected) as PackageManagerId[]) {
		test(`${id} owns metadata, argv plans, and lockfile expectations`, () => {
			const adapter = getPackageManagerAdapter(id);
			const contract = expected[id];
			expect(adapter.version).toBe(packageManagerVersions[id]);
			expect(tokens(adapter.versionCommand)).toEqual([
				adapter.installCommand.executable,
				'--version'
			]);
			expect(adapter.packageManagerField).toBe(contract.field);
			expect(tokens(adapter.installCommand)).toEqual(contract.install);
			expect(tokens(adapter.frozenInstallCommand)).toEqual(contract.frozen);
			expect(tokens(adapter.run('check'))).toEqual(contract.run);
			expect(tokens(adapter.exec('shadcn-svelte@1.5.0', ['add', 'button']))).toEqual(contract.exec);
			expect(adapter.lockfile).toBe(contract.lockfile);
			expect(getForeignLockfiles(adapter)).not.toContain(contract.lockfile);
			expect([...getForeignLockfiles(adapter), contract.lockfile].sort()).toEqual(
				[...packageManagerLockfiles].sort()
			);
		});
	}

	test('keeps Deno explicit but unavailable until its complete hybrid matrix passes', () => {
		expect(getPackageManagerAdapter('deno')).toMatchObject({
			generationStatus: 'blocked',
			lockfile: 'deno.lock'
		});
		expect(() => getImplementedPackageManagerAdapter('deno')).toThrow(
			'complete shadcn-svelte, Drizzle, PostgreSQL, adapter-node, and Docker matrix'
		);
	});

	test('keeps security resolutions in package-manager-owned configuration', () => {
		expect(getPackageManagerAdapter('bun').manifestFields).toEqual({
			overrides: { cookie: '0.7.2', esbuild: '0.28.2' }
		});
		expect(getPackageManagerAdapter('npm').manifestFields).toEqual({
			overrides: {
				'@esbuild-kit/core-utils': { esbuild: '0.28.2' },
				'@sveltejs/kit': { cookie: '0.7.2' }
			}
		});
		expect(getPackageManagerAdapter('pnpm').manifestFields).toEqual({});
		expect(getPackageManagerAdapter('pnpm').configurationFiles['pnpm-workspace.yaml']).toContain(
			'overrides:\n  "@esbuild-kit/core-utils>esbuild": "0.28.2"\n  "@sveltejs/kit>cookie": "0.7.2"'
		);
		expect(getPackageManagerAdapter('yarn').manifestFields).toHaveProperty('resolutions');
	});

	test('gives modern Yarn an empty local lock boundary before its first install', () => {
		expect(getPackageManagerAdapter('yarn')).toMatchObject({
			configurationFiles: {
				'.yarnrc.yml':
					'nodeLinker: node-modules\nnpmPreapprovedPackages:\n  - "@lucide/svelte@1.34.0"\n  - "@tabler/icons-svelte@3.46.0"\n  - "@hugeicons/svelte@1.1.5"\n  - "@hugeicons/core-free-icons@4.3.0"\n  - "phosphor-svelte@3.1.0"\n  - "remixicon-svelte@0.0.5"\n'
			},
			initialLockfileContents: '',
			lockfile: 'yarn.lock'
		});
		for (const id of ['bun', 'npm', 'pnpm', 'deno'] as const) {
			expect(getPackageManagerAdapter(id).initialLockfileContents).toBeUndefined();
		}
	});

	test('keeps current install safety gates explicit and narrowly approved', () => {
		expect(getPackageManagerAdapter('pnpm').configurationFiles).toEqual({
			'pnpm-workspace.yaml':
				'overrides:\n  "@esbuild-kit/core-utils>esbuild": "0.28.2"\n  "@sveltejs/kit>cookie": "0.7.2"\nallowBuilds:\n  esbuild: true\n  "@hugeicons/svelte@1.1.5": true\nminimumReleaseAgeExclude:\n  - "@lucide/svelte@1.34.0"\n  - "@tabler/icons-svelte@3.46.0"\n  - "@hugeicons/svelte@1.1.5"\n  - "@hugeicons/core-free-icons@4.3.0"\n  - "phosphor-svelte@3.1.0"\n  - "remixicon-svelte@0.0.5"\n'
		});
		expect(getPackageManagerAdapter('yarn').configurationFiles).toEqual({
			'.yarnrc.yml':
				'nodeLinker: node-modules\nnpmPreapprovedPackages:\n  - "@lucide/svelte@1.34.0"\n  - "@tabler/icons-svelte@3.46.0"\n  - "@hugeicons/svelte@1.1.5"\n  - "@hugeicons/core-free-icons@4.3.0"\n  - "phosphor-svelte@3.1.0"\n  - "remixicon-svelte@0.0.5"\n'
		});
		for (const id of ['bun', 'npm', 'deno'] as const) {
			expect(getPackageManagerAdapter(id).configurationFiles).toEqual({});
		}
	});

	test('keeps Docker lockfiles and production installs behind package-manager adapters', () => {
		expect(getPackageManagerAdapter('bun').docker).toMatchObject({
			buildImage: 'oven/bun:1.4.0',
			dependencyFiles: ['package.json', 'bun.lock'],
			productionInstallCommand: {
				executable: 'bun',
				arguments: ['install', '--frozen-lockfile', '--production', '--ignore-scripts']
			}
		});
		expect(getPackageManagerAdapter('npm').docker).toMatchObject({
			dependencyFiles: ['package.json', 'package-lock.json'],
			setupCommands: [{ executable: 'npm', arguments: ['install', '--global', 'npm@12.0.2'] }],
			productionInstallCommand: {
				executable: 'npm',
				arguments: ['ci', '--omit=dev', '--ignore-scripts']
			}
		});
		for (const id of ['pnpm', 'yarn'] as const) {
			expect(getPackageManagerAdapter(id).docker?.setupCommands).toEqual([
				{ executable: 'corepack', arguments: ['enable'] }
			]);
		}
		expect(getPackageManagerAdapter('deno').docker).toBeUndefined();
	});

	test('renders documentation only after plans have been safely tokenized', () => {
		const command = getPackageManagerAdapter('npm').run('script with spaces', ["O'Reilly"]);
		expect(formatPackageManagerCommand(command)).toBe(
			`npm run 'script with spaces' 'O'"'"'Reilly'`
		);
		expect(() => getPackageManagerAdapter('bun').run('bad\0script')).toThrow('token is invalid');
	});
});

function tokens(command: { executable: string; arguments: readonly string[] }): readonly string[] {
	return [command.executable, ...command.arguments];
}
