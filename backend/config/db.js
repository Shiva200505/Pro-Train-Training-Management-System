const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Log database configuration (without password)
console.log('Database Configuration:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

// Create connection pool with error handling
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pro_train_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true,
  debug: false // Disable debug mode
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connection test successful');
    connection.release();
  })
  .catch(error => {
    console.error('Database connection test failed:', error);
    process.exit(1);
  });

// Wrap query method to add consistent error handling
const executeQuery = async (sql, params) => {
  try {
    return await pool.query(sql, params);
  } catch (error) {
    console.error(`[Database Error] ${new Date().toISOString()}: ${error.message}`);
    console.error(`Query: ${sql}`);
    error.statusCode = 500;
    throw error;
  }
};

module.exports = {
  query: executeQuery,
  pool
};