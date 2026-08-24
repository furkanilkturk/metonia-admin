import { z } from 'zod';

import {
	editableUserStatuses,
	sortDirections,
	userRoles,
	userSortFields,
	userStatuses
} from '../constants/users.js';

const nameSchema = z
	.string()
	.trim()
	.min(2, 'Enter at least 2 characters for the name.')
	.max(100, 'Keep the name to 100 characters or fewer.');

const emailSchema = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.'));

export const userCreateInputSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	status: z.enum(editableUserStatuses),
	role: z.enum(userRoles)
});

/** Status transitions are deliberately excluded; disabling uses its separately guarded action. */
export const userUpdateInputSchema = userCreateInputSchema.omit({ status: true });
export const userIdSchema = z.uuid('The user identifier is not valid.');

export const userSchema = userUpdateInputSchema.extend({
	id: userIdSchema,
	status: z.enum(userStatuses),
	createdAt: z.date(),
	updatedAt: z.date()
});

export const userListQuerySchema = z.object({
	q: z.string().trim().max(100).default(''),
	status: z.enum([...userStatuses, 'all']).default('all'),
	sort: z.enum(userSortFields).default('createdAt'),
	direction: z.enum(sortDirections).default('desc'),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export function userInputFromFormData(formData: FormData): Record<string, unknown> {
	return {
		name: formData.get('name'),
		email: formData.get('email'),
		status: formData.get('status'),
		role: formData.get('role')
	};
}

export function userListQueryFromUrl(url: URL): Record<string, unknown> {
	return {
		q: url.searchParams.get('q') ?? undefined,
		status: url.searchParams.get('status') ?? undefined,
		sort: url.searchParams.get('sort') ?? undefined,
		direction: url.searchParams.get('direction') ?? undefined,
		page: url.searchParams.get('page') ?? undefined,
		pageSize: url.searchParams.get('pageSize') ?? undefined
	};
}
