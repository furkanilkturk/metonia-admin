import { query } from '$app/server';
import { remoteBoundaryService } from '$lib/server/features/remoteBoundary.js';
import { remoteBoundaryInputSchema } from '$lib/shared/schemas/remoteBoundary.js';

export const readRemoteBoundary = query(remoteBoundaryInputSchema, async () =>
	remoteBoundaryService.describe()
);
