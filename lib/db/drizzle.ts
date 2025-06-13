import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// ✅ Global connection caching for development to avoid too many connections
const globalForDrizzle = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

const pg = globalForDrizzle.pgClient ?? postgres(process.env.POSTGRES_URL, {
  max: 1, // limit connections per instance
});

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.pgClient = pg;
}

export const client = pg;
export const db = drizzle(client, { schema });
