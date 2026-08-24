import { redirect } from '@sveltejs/kit';

import { loadUser, parseUpdateUserRequest, userActionFailure } from '$lib/server/actions/users.js';
import { usersService } from '$lib/server/services/usersService.js';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => ({
	user: await loadUser(params.id)
});

export const actions = {
	update: async ({ params, request }) => {
		const parsed = await parseUpdateUserRequest(request);
		if (!parsed.ok) return parsed.failure;
		let user;
		try {
			user = await usersService.update(params.id, parsed.data);
		} catch (caught) {
			return userActionFailure(caught, parsed.data);
		}
		redirect(303, `/users/${user.id}`);
	}
} satisfies Actions;
