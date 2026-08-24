import { loadUsers } from '$lib/server/actions/users.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => ({
	result: await loadUsers(url)
});
