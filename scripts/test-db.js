const { Pool } = require('pg');
// require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function checkConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL!');
    
    // Check if users table exists
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const tableExists = res.rows[0].exists;
    if (tableExists) {
      console.log('Table "users" exists.');
    } else {
      console.error('Table "users" DOES NOT EXIST. Please run setup.sql!');
    }

    client.release();
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    pool.end();
  }
}

checkConnection();
