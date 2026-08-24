/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import { enableRemoteFunctionsInViteConfig } from './adapter.js';

const activeViteConfig = `import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: true
			},
			adapter: adapter()
		})
	]
});
`;

describe('SvelteKit Remote Functions adapter', () => {
	test('enables both required experimental switches exactly once', () => {
		const once = enableRemoteFunctionsInViteConfig(activeViteConfig);
		const twice = enableRemoteFunctionsInViteConfig(once);

		expect(twice).toBe(once);
		expect(once.match(/experimental: \{ async: true \}/g)).toHaveLength(1);
		expect(once.match(/remoteFunctions: true/g)).toHaveLength(1);
		expect(once).toContain('adapter: adapter()');
	});

	test('fails closed for partial or unrecognized active configuration', () => {
		expect(() =>
			enableRemoteFunctionsInViteConfig(
				activeViteConfig.replace(
					'runes: true',
					'experimental: { async: true },\n\t\t\t\trunes: true'
				)
			)
		).toThrow('partial Remote Functions setup');
		expect(() => enableRemoteFunctionsInViteConfig('export default {};\n')).toThrow(
			'does not expose compiler options'
		);
	});
});
