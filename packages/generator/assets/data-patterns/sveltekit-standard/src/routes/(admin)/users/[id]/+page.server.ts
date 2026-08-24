import { redirect } from '@sveltejs/kit';

import {
	confirmationFromRequest,
	dangerActionFailure,
	invalidConfirmationFailure,
	loadUser
} from '$lib/server/actions/users.js';
import { usersService } from '$lib/server/services/usersService.js';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => ({
	user: await loadUser(params.id)
});

export const actions = {
	disable: async ({ params, request }) => {
		const user = await loadUser(params.id);
		const confirmation = await confirmationFromRequest(request);
		if (confirmation !== user.email) return invalidConfirmationFailure();
		try {
			await usersService.disable(user.id);
		} catch (caught) {
			return dangerActionFailure(caught);
		}
		redirect(303, `/users/${user.id}`);
	},
	delete: async ({ params, request }) => {
		const user = await loadUser(params.id);
		const confirmation = await confirmationFromRequest(request);
		if (confirmation !== user.email) return invalidConfirmationFailure();
		try {
			await usersService.delete(user.id);
		} catch (caught) {
			return dangerActionFailure(caught);
		}
		redirect(303, '/users');
	}
} satisfies Actions;
