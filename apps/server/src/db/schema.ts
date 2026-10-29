import { GRUDGE_STATUSES } from '@jigoku/shared';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const grudges = sqliteTable(
  'grudges',
  {
    id: text('id').primaryKey(),
    targetName: text('target_name').notNull(),
    status: text('status', { enum: GRUDGE_STATUSES }).notNull().default('pending'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    resolvedAt: integer('resolved_at', { mode: 'timestamp_ms' }),
  },
  (table) => [index('grudges_created_at_idx').on(table.createdAt)],
);

export type GrudgeRow = typeof grudges.$inferSelect;
