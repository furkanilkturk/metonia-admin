import type { RemoteBoundarySnapshot } from '$lib/shared/types/remoteBoundary.js';

export const remoteBoundaryService = {
	describe(): RemoteBoundarySnapshot {
		return {
			checkedAt: new Date().toISOString(),
			message:
				'This query crossed a route-local Remote Function boundary and delegated to $lib/server.',
			mode: 'sveltekit-remote-functions',
			status: 'experimental'
		};
	}
};
