import { describe, expect, test } from 'vitest';

import config from '../metonia-admin.config';

describe('generated base configuration', () => {
	test('persists a complete, versioned project configuration', () => {
		expect(config.schemaVersion).toBe(1);
		expect(config.project.name.length).toBeGreaterThan(0);
		expect(['bun', 'npm', 'pnpm', 'yarn']).toContain(config.packageManager);
		expect(['sveltekit-standard', 'sveltekit-remote-functions']).toContain(config.dataPattern);
		expect(typeof config.docker.enabled).toBe('boolean');
		expect(typeof config.resources.users).toBe('boolean');
	});
});
