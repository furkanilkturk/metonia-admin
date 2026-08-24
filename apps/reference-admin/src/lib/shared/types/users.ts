import type { z } from 'zod';

import type {
	userCreateInputSchema,
	userListQuerySchema,
	userSchema,
	userUpdateInputSchema
} from '../schemas/users.js';
import type { FieldErrors } from '../validation/zod.js';

export type User = z.infer<typeof userSchema>;
export type UserCreateInput = z.infer<typeof userCreateInputSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateInputSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type UserFormField = keyof UserCreateInput;

export interface UserListResult {
	readonly items: readonly User[];
	readonly total: number;
	readonly page: number;
	readonly pageSize: number;
	readonly pageCount: number;
	readonly query: UserListQuery;
}

export interface UserFormActionData {
	readonly formId: 'user';
	readonly values: Partial<Record<UserFormField, string>>;
	readonly fieldErrors?: FieldErrors<UserFormField>;
	readonly message?: string;
}

export interface UserDangerActionData {
	readonly formId: 'danger';
	readonly message?: string;
}
