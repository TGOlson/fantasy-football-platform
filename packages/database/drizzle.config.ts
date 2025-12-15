import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load env from root
dotenv.config({ path: '../../.env' });

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
