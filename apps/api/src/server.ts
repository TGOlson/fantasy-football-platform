import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createYoga } from 'graphql-yoga';
import { schema } from './graphql/schema';
import { prisma } from './graphql/builder';
import { verifyToken } from './lib/auth';
import type { Context } from './graphql/builder';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor =
      status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(
      `${statusColor}${status}\x1b[0m ${req.method} ${req.path} ${duration}ms`
    );
  });
  next();
});

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
    debug: (...args) => console.log('[GraphQL Debug]', ...args),
    info: (...args) => console.log('[GraphQL Info]', ...args),
    warn: (...args) => console.warn('[GraphQL Warn]', ...args),
    error: (...args) =>
      console.error('\x1b[31m[GraphQL Error]\x1b[0m', ...args),
  },
});

app.use('/graphql', yoga);

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('\x1b[31m[Express Error]\x1b[0m', err.message);
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`🎮 GraphiQL playground: http://localhost:${PORT}/graphql`);
});
