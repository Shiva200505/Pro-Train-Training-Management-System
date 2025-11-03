const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function setupDatabase() {
  try {
    // First create a connection without database selected
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);
    console.log(`Using database ${process.env.DB_NAME}`);

    // Read and execute schema file
    const schemaSQL = await fs.readFile(path.join(__dirname, 'database.sql'), 'utf8');
    await connection.query(schemaSQL);
    console.log('Schema created successfully');

    // Read and execute dummy data if it exists
    try {
      const dummySQL = await fs.readFile(path.join(__dirname, 'dummy_data.sql'), 'utf8');
      await connection.query(dummySQL);
      console.log('Dummy data inserted successfully');
    } catch (error) {
      console.log('No dummy data file found or error inserting dummy data');
    }

    await connection.end();
    console.log('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();