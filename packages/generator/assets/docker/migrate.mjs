import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
	throw new Error('DATABASE_URL is required before Docker migrations can run.');
}

const password = process.env.PGPASSWORD?.trim();
const pool = new Pool({ connectionString, ...(password ? { password } : {}), max: 1 });
try {
	await migrate(drizzle({ client: pool }), { migrationsFolder: './drizzle' });
} finally {
	await pool.end();
}
