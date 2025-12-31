
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function listUsers() {
  try {
    const res = await pool.query('SELECT email, username FROM users LIMIT 5');
    console.log("Users found:", res.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
  } finally {
    await pool.end();
  }
}

listUsers();
