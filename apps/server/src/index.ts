import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { migrateDatabase } from './db/client';
import { grudgeRoutes } from './routes/grudges';

const port = Number(process.env.PORT ?? 8787);
const isProduction = process.env.NODE_ENV === 'production';

await migrateDatabase();

const app = new Hono();

app.use('/api/*', logger());
app.route('/api/grudges', grudgeRoutes);

if (isProduction) {
  app.use('/*', serveStatic({ root: '../web/dist' }));
}

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`地獄通信 server: http://localhost:${info.port}`);
});
