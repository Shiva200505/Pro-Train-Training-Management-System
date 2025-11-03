const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  try {
    // First create a connection without database selected
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} checked/created`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Check if users table exists
    const [userTables] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'users'
    `, [process.env.DB_NAME]);

    if (userTables[0].count === 0) {
      console.log('Creating users table...');
      const userSchema = await fs.readFile(path.join(__dirname, '..', 'database', 'user_schema.sql'), 'utf8');
      const userStatements = userSchema.split(';').filter(stmt => stmt.trim());
      for (const statement of userStatements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }
      console.log('Users table created successfully');
    }

    // Check if trainings table exists
    const [trainingTables] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'trainings'
    `, [process.env.DB_NAME]);

    if (trainingTables[0].count === 0) {
      console.log('Creating training tables...');
      const trainingSchema = await fs.readFile(path.join(__dirname, '..', 'database', 'training_schema.sql'), 'utf8');
      const trainingStatements = trainingSchema.split(';').filter(stmt => stmt.trim());
      for (const statement of trainingStatements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }
      console.log('Training tables created successfully');
    }

    // Check if quiz tables exist
    const [quizTables] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'quizzes'
    `, [process.env.DB_NAME]);

    if (quizTables[0].count === 0) {
      console.log('Creating quiz tables...');
      
      // Drop any existing quiz tables
      await connection.query(`
        DROP TABLE IF EXISTS quiz_responses;
        DROP TABLE IF EXISTS quiz_attempts;
        DROP TABLE IF EXISTS quiz_options;
        DROP TABLE IF EXISTS quiz_questions;
        DROP TABLE IF EXISTS quizzes;
      `);
      
      // Create quiz tables with correct structure
      await connection.query(`
        CREATE TABLE quizzes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          trainingId INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          duration INT NOT NULL DEFAULT 30,
          passingScore INT NOT NULL DEFAULT 70,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (trainingId) REFERENCES trainings(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);
      console.log('Created quizzes table');

      await connection.query(`
        CREATE TABLE quiz_questions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          quizId INT NOT NULL,
          question TEXT NOT NULL,
          type ENUM('multiple-choice', 'true-false', 'short-answer') DEFAULT 'multiple-choice',
          points INT DEFAULT 1,
          FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
      console.log('Created quiz_questions table');

      await connection.query(`
        CREATE TABLE quiz_options (
          id INT PRIMARY KEY AUTO_INCREMENT,
          questionId INT NOT NULL,
          optionText TEXT NOT NULL,
          isCorrect BOOLEAN DEFAULT FALSE,
          FOREIGN KEY (questionId) REFERENCES quiz_questions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
      console.log('Created quiz_options table');

      await connection.query(`
        CREATE TABLE quiz_attempts (
          id INT PRIMARY KEY AUTO_INCREMENT,
          quizId INT NOT NULL,
          userId INT NOT NULL,
          score INT,
          startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          endTime TIMESTAMP NULL,
          status ENUM('in-progress', 'completed', 'abandoned') DEFAULT 'in-progress',
          FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
      console.log('Created quiz_attempts table');

      await connection.query(`
        CREATE TABLE quiz_responses (
          id INT PRIMARY KEY AUTO_INCREMENT,
          attemptId INT NOT NULL,
          questionId INT NOT NULL,
          answer TEXT,
          isCorrect BOOLEAN DEFAULT FALSE,
          points INT DEFAULT 0,
          FOREIGN KEY (attemptId) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
          FOREIGN KEY (questionId) REFERENCES quiz_questions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
      console.log('Created quiz_responses table');
      console.log('Quiz tables created successfully');
    }

    // Check if attendance table exists
    const [attendanceTables] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'attendance'
    `, [process.env.DB_NAME]);

    if (attendanceTables[0].count === 0) {
      console.log('Creating attendance tables...');
      const attendanceSchema = await fs.readFile(path.join(__dirname, '..', 'database', 'attendance_schema.sql'), 'utf8');
      const attendanceStatements = attendanceSchema.split(';').filter(stmt => stmt.trim());
      for (const statement of attendanceStatements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }
      console.log('Attendance tables created successfully');
    }

    // Always recreate feedback table with latest schema
    console.log('Creating feedback tables...');
    try {
      // Drop the table if it exists to ensure we have the latest schema
      await connection.query('DROP TABLE IF EXISTS feedback');
    } catch (err) {
      console.warn('Warning during feedback table drop:', err.message);
    }
    
    console.log('Creating feedback tables...');
    const feedbackSchema = await fs.readFile(path.join(__dirname, '..', 'database', 'feedback_schema.sql'), 'utf8');
    const feedbackStatements = feedbackSchema.split(';').filter(stmt => stmt.trim());
    for (const statement of feedbackStatements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    console.log('Feedback tables created successfully');

    // Check if we need to insert sample data
    const [trainingCount] = await connection.query('SELECT COUNT(*) as count FROM trainings');
    if (trainingCount[0].count === 0) {
      console.log('Inserting sample data...');
      const dummyData = await fs.readFile(path.join(__dirname, '..', 'database', 'dummy_data.sql'), 'utf8');
      const dummyStatements = dummyData.split(';').filter(stmt => stmt.trim());
      for (const statement of dummyStatements) {
        if (statement.trim()) {
          try {
            await connection.query(statement);
          } catch (err) {
            console.warn('Warning during sample data insertion:', err.message);
          }
        }
      }
      console.log('Sample data inserted successfully');
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = initializeDatabase;