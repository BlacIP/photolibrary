
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Manually load .env
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
       const [key, ...values] = line.split('=');
       if (key && values.length > 0) {
          const val = values.join('=').trim().replace(/^["'](.*)["']$/, '$1');
          if (!process.env[key.trim()]) {
             process.env[key.trim()] = val;
          }
       }
    });
    console.log('Loaded .env file');
  }
} catch (e) {
  console.log('Could not load .env', e);
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log('Starting optimization...');
    
    // Index on photos.client_id for faster JOINS and WHERE clauses
    await pool.query('CREATE INDEX IF NOT EXISTS idx_photos_client_id ON photos(client_id)');
    console.log('Created index: idx_photos_client_id');

    // Index on photos.created_at for faster sorting
    await pool.query('CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC)');
    console.log('Created index: idx_photos_created_at');
    
    // Index on clients.created_at for sorting client list
    await pool.query('CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC)');
    console.log('Created index: idx_clients_created_at');

    console.log('Optimization complete.');
  } catch (err) {
    console.error('Optimization failed:', err);
  } finally {
    const client = await pool.connect(); 
    client.release();
    // pool.end() might hang in serverless driver sometimes depending on version, 
    // but usually process.exit is fine for a script.
    process.exit(0);
  }
}

run();
