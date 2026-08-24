import { redirect } from '@sveltejs/kit';

import { parseCreateUserRequest, userActionFailure } from '$lib/server/actions/users.js';
import { usersService } from '$lib/server/services/usersService.js';

import type { Actions } from './$types';

export const actions = {
	create: async ({ request }) => {
		const parsed = await parseCreateUserRequest(request);
		if (!parsed.ok) return parsed.failure;
		let user;
		try {
			user = await usersService.create(parsed.data);
		} catch (caught) {
			return userActionFailure(caught, parsed.data);
		}
		redirect(303, `/users/${user.id}`);
	}
} satisfies Actions;
