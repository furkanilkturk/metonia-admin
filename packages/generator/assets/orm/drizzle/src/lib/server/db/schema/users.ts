import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const userStatus = pgEnum('user_status', ['active', 'invited', 'disabled']);
export const userRole = pgEnum('user_role', ['admin', 'editor', 'viewer']);

export const users = pgTable(
	'users',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull(),
		status: userStatus('status').notNull().default('invited'),
		role: userRole('role').notNull().default('viewer'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('users_email_unique').on(table.email),
		index('users_status_idx').on(table.status),
		index('users_created_at_idx').on(table.createdAt)
	]
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
