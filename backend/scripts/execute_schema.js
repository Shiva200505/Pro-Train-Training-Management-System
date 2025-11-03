const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function executeSchema() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pro_train_db'
    });

    console.log('Connected to database successfully');

    // Read and execute the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'complete_schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // Split and execute each statement
    const statements = schema
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement) {
        await connection.query(statement);
        console.log('Executed statement successfully');
      }
    }

    console.log('Database schema updated successfully');
  } catch (error) {
    console.error('Error executing schema:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

executeSchema();