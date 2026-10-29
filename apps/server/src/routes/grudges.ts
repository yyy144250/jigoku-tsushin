import { zValidator } from '@hono/zod-validator';
import { createGrudgeSchema, type ApiErrorBody, type Grudge, type GrudgeStatus } from '@jigoku/shared';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/client';
import { grudges, type GrudgeRow } from '../db/schema';

const LIST_LIMIT = 100;

export const grudgeRoutes = new Hono()
  .get('/', async (c) => {
    const rows = await db.select().from(grudges).orderBy(desc(grudges.createdAt)).limit(LIST_LIMIT);
    return c.json(rows.map(toGrudge));
  })
  .post(
    '/',
    zValidator('json', createGrudgeSchema, (result, c) => {
      if (!result.success) return c.json<ApiErrorBody>({ error: 'invalid_input' }, 400);
    }),
    async (c) => {
      const { targetName } = c.req.valid('json');
      const [row] = await db
        .insert(grudges)
        .values({ id: crypto.randomUUID(), targetName, status: 'pending', createdAt: new Date() })
        .returning();
      return c.json(toGrudge(row!), 201);
    },
  )
  .post('/:id/contract', async (c) => {
    const result = await resolveGrudge(c.req.param('id'), 'contracted');
    if (!result.ok) return c.json<ApiErrorBody>({ error: result.reason }, errorStatus(result.reason));
    return c.json(result.grudge);
  })
  .post('/:id/abandon', async (c) => {
    const result = await resolveGrudge(c.req.param('id'), 'abandoned');
    if (!result.ok) return c.json<ApiErrorBody>({ error: result.reason }, errorStatus(result.reason));
    return c.json(result.grudge);
  });

type ResolveFailure = 'not_found' | 'already_resolved';

type ResolveResult = { ok: true; grudge: Grudge } | { ok: false; reason: ResolveFailure };

/** 只有 pending 状态的怨恨才能被了结，避免重复解开红线 */
async function resolveGrudge(id: string, status: Exclude<GrudgeStatus, 'pending'>): Promise<ResolveResult> {
  const [row] = await db
    .update(grudges)
    .set({ status, resolvedAt: new Date() })
    .where(and(eq(grudges.id, id), eq(grudges.status, 'pending')))
    .returning();
  if (row) return { ok: true, grudge: toGrudge(row) };

  const [existing] = await db.select({ id: grudges.id }).from(grudges).where(eq(grudges.id, id));
  return { ok: false, reason: existing ? 'already_resolved' : 'not_found' };
}

function errorStatus(reason: ResolveFailure) {
  return reason === 'not_found' ? 404 : 409;
}

function toGrudge(row: GrudgeRow): Grudge {
  return {
    id: row.id,
    targetName: row.targetName,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  };
}
