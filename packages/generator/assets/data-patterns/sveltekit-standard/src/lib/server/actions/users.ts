import { error, fail, type ActionFailure } from '@sveltejs/kit';
import type { z } from 'zod';

import {
	userCreateInputSchema,
	userIdSchema,
	userInputFromFormData,
	userListQueryFromUrl,
	userListQuerySchema,
	userUpdateInputSchema
} from '$lib/shared/schemas/users.js';
import type {
	User,
	UserCreateInput,
	UserFormActionData,
	UserFormField,
	UserListQuery,
	UserListResult,
	UserUpdateInput
} from '$lib/shared/types/users.js';
import { toFieldErrors } from '$lib/shared/validation/zod.js';

import { publicUsersServiceError, usersService } from '../services/usersService.js';

type ParsedUserForm<Input extends UserCreateInput | UserUpdateInput> =
	| { readonly ok: true; readonly data: Input }
	| { readonly ok: false; readonly failure: ActionFailure<UserFormActionData> };

export async function loadUsers(url: URL): Promise<UserListResult> {
	const parsed = userListQuerySchema.safeParse(userListQueryFromUrl(url));
	if (!parsed.success) error(400, 'User filters are not valid.');
	try {
		return await usersService.list(parsed.data);
	} catch (caught) {
		const publicError = publicUsersServiceError(caught);
		error(publicError.status, publicError.message);
	}
}

export async function loadUser(id: string): Promise<User> {
	const parsed = userIdSchema.safeParse(id);
	if (!parsed.success) error(404, 'User not found.');
	try {
		return await usersService.findById(parsed.data);
	} catch (caught) {
		const publicError = publicUsersServiceError(caught);
		error(publicError.status, publicError.message);
	}
}

export async function parseCreateUserRequest(
	request: Request
): Promise<ParsedUserForm<UserCreateInput>> {
	return parseUserRequest(request, userCreateInputSchema);
}

export async function parseUpdateUserRequest(
	request: Request
): Promise<ParsedUserForm<UserUpdateInput>> {
	return parseUserRequest(request, userUpdateInputSchema);
}

export function userActionFailure(
	caught: unknown,
	values: Partial<Record<UserFormField, string>>
): ActionFailure<UserFormActionData> {
	const publicError = publicUsersServiceError(caught);
	return fail(publicError.status, {
		formId: 'user',
		values,
		message: publicError.message
	});
}

export async function confirmationFromRequest(request: Request): Promise<string> {
	const value = (await request.formData()).get('confirmation');
	return typeof value === 'string' ? value : '';
}

export function dangerActionFailure(caught: unknown): ActionFailure<{
	formId: 'danger';
	message: string;
}> {
	const publicError = publicUsersServiceError(caught);
	return fail(publicError.status, { formId: 'danger', message: publicError.message });
}

export function invalidConfirmationFailure(): ActionFailure<{
	formId: 'danger';
	message: string;
}> {
	return fail(400, {
		formId: 'danger',
		message: 'Type the user email address exactly to confirm this action.'
	});
}

async function parseUserRequest<Input extends UserCreateInput | UserUpdateInput>(
	request: Request,
	schema: z.ZodType<Input>
): Promise<ParsedUserForm<Input>> {
	const raw = userInputFromFormData(await request.formData());
	const values = stringValues(raw);
	const parsed = schema.safeParse(raw);
	if (!parsed.success) {
		return {
			ok: false,
			failure: fail(422, {
				formId: 'user',
				values,
				fieldErrors: toFieldErrors<UserFormField>(parsed.error),
				message: 'Review the highlighted fields and try again.'
			})
		};
	}
	return { ok: true, data: parsed.data };
}

function stringValues(input: Record<string, unknown>): Partial<Record<UserFormField, string>> {
	return Object.fromEntries(
		Object.entries(input).filter(
			(entry): entry is [UserFormField, string] => typeof entry[1] === 'string'
		)
	);
}

export type { UserListQuery, UserUpdateInput };
