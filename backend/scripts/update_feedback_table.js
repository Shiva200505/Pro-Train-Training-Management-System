const db = require('../config/db');

async function updateFeedbackTable() {
  try {
    // Drop and recreate the feedback table
    await db.query('DROP TABLE IF EXISTS feedback');
    
    // Create the feedback table with the correct schema
    const createTableQuery = `
    CREATE TABLE feedback (
      id INT PRIMARY KEY AUTO_INCREMENT,
      trainingId INT NOT NULL,
      userId INT NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment_text TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trainingId) REFERENCES trainings(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_feedback (trainingId, userId)
    )`;
    
    await db.query(createTableQuery);
    console.log('Feedback table updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating feedback table:', error);
    process.exit(1);
  }
}

updateFeedbackTable();