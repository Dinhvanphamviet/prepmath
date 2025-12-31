require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        PRIMARY KEY (email, token)
      );
    `);
    console.log("Table password_reset_tokens created successfully");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await pool.end();
  }
}

createTable();
