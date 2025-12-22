import { Pool } from '@neondatabase/serverless';

// Use different database based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const connectionString = isDevelopment
  ? (process.env.DATABASE_URL_DEV || process.env.DATABASE_URL) // Development/Demo database
  : (process.env.POSTGRES_URL || process.env.DATABASE_URL);     // Production database

export const pool = new Pool({
  connectionString,
});
