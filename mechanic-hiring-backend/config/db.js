const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'mechanic_hiring',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const connectDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log(`MySQL connected (threadId ${conn.threadId})`);
    conn.release();
  } catch (error) {
    console.error('MySQL connect error:', error);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };