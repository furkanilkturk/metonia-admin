import { z } from 'zod';

export const remoteBoundaryInputSchema = z.object({
	surface: z.literal('admin-workbench')
});
