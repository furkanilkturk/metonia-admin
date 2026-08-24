import { env } from '$env/dynamic/private';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema/index.js';

export class DatabaseConfigurationError extends Error {
	constructor() {
		super('DATABASE_URL is required before database operations can run.');
		this.name = 'DatabaseConfigurationError';
	}
}

let pool: Pool | undefined;
let database: NodePgDatabase<typeof schema> | undefined;

/** Build/check can import this module without connecting; the pool is created on first use only. */
export function getDatabase(): NodePgDatabase<typeof schema> {
	if (database) return database;
	const connectionString = env.DATABASE_URL?.trim();
	if (!connectionString) throw new DatabaseConfigurationError();

	pool = new Pool({
		connectionString,
		max: 10,
		idleTimeoutMillis: 30_000,
		connectionTimeoutMillis: 5_000
	});
	database = drizzle({ client: pool, schema });
	return database;
}

export async function closeDatabase(): Promise<void> {
	const activePool = pool;
	database = undefined;
	pool = undefined;
	if (activePool) await activePool.end();
}
