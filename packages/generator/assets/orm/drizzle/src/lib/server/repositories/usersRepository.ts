import { and, asc, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';

import type {
	UserCreateInput,
	UserListQuery,
	UserListResult,
	UserUpdateInput
} from '$lib/shared/types/users.js';

import { getDatabase } from '../db/client.js';
import { users, type UserRow } from '../db/schema/users.js';

const sortableColumns = {
	name: users.name,
	email: users.email,
	status: users.status,
	createdAt: users.createdAt
} as const;

export interface UsersRepository {
	list(query: UserListQuery): Promise<UserListResult>;
	findById(id: string): Promise<UserRow | null>;
	create(input: UserCreateInput): Promise<UserRow>;
	update(id: string, input: UserUpdateInput): Promise<UserRow | null>;
	disable(id: string): Promise<UserRow | null>;
	delete(id: string): Promise<boolean>;
}

export const usersRepository: UsersRepository = {
	async list(query) {
		const db = getDatabase();
		const filters: SQL[] = [];
		if (query.q) {
			const search = `%${query.q}%`;
			const searchFilter = or(ilike(users.name, search), ilike(users.email, search));
			if (searchFilter) filters.push(searchFilter);
		}
		if (query.status !== 'all') filters.push(eq(users.status, query.status));
		const where = filters.length === 0 ? undefined : and(...filters);
		const orderColumn = sortableColumns[query.sort];
		const orderBy = query.direction === 'asc' ? asc(orderColumn) : desc(orderColumn);
		const offset = (query.page - 1) * query.pageSize;

		const [items, totals] = await Promise.all([
			db
				.select()
				.from(users)
				.where(where)
				.orderBy(orderBy, asc(users.id))
				.limit(query.pageSize)
				.offset(offset),
			db.select({ total: count() }).from(users).where(where)
		]);
		const total = totals[0]?.total ?? 0;
		return {
			items,
			total,
			page: query.page,
			pageSize: query.pageSize,
			pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
			query
		};
	},

	async findById(id) {
		const db = getDatabase();
		return (await db.select().from(users).where(eq(users.id, id)).limit(1))[0] ?? null;
	},

	async create(input) {
		const db = getDatabase();
		const created = await db.insert(users).values(input).returning();
		const user = created[0];
		if (!user) throw new Error('The database did not return the created user.');
		return user;
	},

	async update(id, input) {
		const db = getDatabase();
		return (
			(
				await db
					.update(users)
					.set({ ...input, updatedAt: new Date() })
					.where(eq(users.id, id))
					.returning()
			)[0] ?? null
		);
	},

	async disable(id) {
		const db = getDatabase();
		return (
			(
				await db
					.update(users)
					.set({ status: 'disabled', updatedAt: new Date() })
					.where(eq(users.id, id))
					.returning()
			)[0] ?? null
		);
	},

	async delete(id) {
		const db = getDatabase();
		return (await db.delete(users).where(eq(users.id, id)).returning({ id: users.id })).length > 0;
	}
};
