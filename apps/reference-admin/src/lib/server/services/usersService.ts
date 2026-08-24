import { userCreateInputSchema, userUpdateInputSchema } from '$lib/shared/schemas/users.js';
import type {
	User,
	UserCreateInput,
	UserListQuery,
	UserListResult,
	UserUpdateInput
} from '$lib/shared/types/users.js';

import { usersRepository } from '../repositories/usersRepository.js';

export type UsersServiceErrorCode =
	| 'invalid-input'
	| 'not-found'
	| 'email-conflict'
	| 'database-unavailable';

export class UsersServiceError extends Error {
	readonly code: UsersServiceErrorCode;
	readonly status: 404 | 409 | 422 | 503;

	constructor(code: UsersServiceErrorCode, status: 404 | 409 | 422 | 503, message: string) {
		super(message);
		this.name = 'UsersServiceError';
		this.code = code;
		this.status = status;
	}
}

export const usersService = {
	async list(query: UserListQuery): Promise<UserListResult> {
		return safely(() => usersRepository.list(query));
	},

	async findById(id: string): Promise<User> {
		const user = await safely(() => usersRepository.findById(id));
		if (!user) throw new UsersServiceError('not-found', 404, 'User not found.');
		return user;
	},

	async create(input: UserCreateInput): Promise<User> {
		const parsed = userCreateInputSchema.safeParse(input);
		if (!parsed.success) {
			throw new UsersServiceError('invalid-input', 422, 'Review the user details and try again.');
		}
		return safely(() => usersRepository.create(parsed.data));
	},

	async update(id: string, input: UserUpdateInput): Promise<User> {
		const parsed = userUpdateInputSchema.safeParse(input);
		if (!parsed.success) {
			throw new UsersServiceError('invalid-input', 422, 'Review the user details and try again.');
		}
		const user = await safely(() => usersRepository.update(id, parsed.data));
		if (!user) throw new UsersServiceError('not-found', 404, 'User not found.');
		return user;
	},

	async disable(id: string): Promise<User> {
		const user = await safely(() => usersRepository.disable(id));
		if (!user) throw new UsersServiceError('not-found', 404, 'User not found.');
		return user;
	},

	async delete(id: string): Promise<void> {
		const deleted = await safely(() => usersRepository.delete(id));
		if (!deleted) throw new UsersServiceError('not-found', 404, 'User not found.');
	}
};

export function publicUsersServiceError(error: unknown): UsersServiceError {
	if (error instanceof UsersServiceError) return error;
	return new UsersServiceError(
		'database-unavailable',
		503,
		'User data is temporarily unavailable. Check the database connection and try again.'
	);
}

async function safely<Result>(operation: () => Promise<Result>): Promise<Result> {
	try {
		return await operation();
	} catch (error) {
		if (error instanceof UsersServiceError) throw error;
		if (isDatabaseCode(error, '23505')) {
			throw new UsersServiceError('email-conflict', 409, 'A user with this email already exists.');
		}
		throw new UsersServiceError(
			'database-unavailable',
			503,
			'User data is temporarily unavailable. Check the database connection and try again.'
		);
	}
}

function isDatabaseCode(error: unknown, code: string): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		(error as { code?: unknown }).code === code
	);
}
