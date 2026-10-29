import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from './schema';

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const databasePath = process.env.DATABASE_PATH ?? resolve(serverRoot, 'data/jigoku.db');

mkdirSync(dirname(databasePath), { recursive: true });

export const db = drizzle(createClient({ url: `file:${databasePath}` }), { schema });

export function migrateDatabase() {
  return migrate(db, { migrationsFolder: resolve(serverRoot, 'drizzle') });
}
