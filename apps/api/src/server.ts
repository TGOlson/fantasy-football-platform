import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createYoga } from 'graphql-yoga';
import pinoHttp from 'pino-http';
import { schema } from './graphql/schema';
import { prisma } from './graphql/builder';
import { verifyToken } from './lib/auth';
import { logger } from './lib/logger';
import type { Context } from './graphql/builder';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

// Health check route (simple Express route)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GraphQL endpoint
const yoga = createYoga<Context>({
  schema,
  context: ({ request }) => {
    // Extract and verify JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    let user: { userId: string; email: string } | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) {
        user = decoded;
      }
    }

    return {
      prisma,
      user,
    };
  },
  graphiql: {
    title: 'Fantasy Platform GraphQL API',
  },
  logging: {
    debug: (...args) => logger.debug({ context: 'graphql' }, ...args),
    info: (...args) => logger.info({ context: 'graphql' }, ...args),
    warn: (...args) => logger.warn({ context: 'graphql' }, ...args),
    error: (...args) => logger.error({ context: 'graphql' }, ...args),
  },
});

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
app.use(yoga.graphqlEndpoint, yoga as any);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    req.log.error({ err }, 'Express error');
    res.status(500).json({ error: 'Something went wrong!' });
  }
);

app.listen(PORT, () => {
  logger.info(
    {
      port: PORT,
      graphql: `http://localhost:${PORT}/graphql`,
      env: process.env.NODE_ENV || 'development',
    },
    'Server started'
  );
});
