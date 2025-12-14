import { Pool } from '@neondatabase/serverless';

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});
