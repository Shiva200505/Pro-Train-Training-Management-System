-- Create Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trainingId INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INT, -- in minutes
  passingScore INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trainingId) REFERENCES trainings(id) ON DELETE CASCADE
);

-- Create Quiz Questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quizId INT,
  question TEXT NOT NULL,
  questionType ENUM('multiple-choice', 'true-false', 'short-answer') DEFAULT 'multiple-choice',
  points INT DEFAULT 1,
  FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Create Quiz Options table for multiple choice questions
CREATE TABLE IF NOT EXISTS quiz_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  questionId INT,
  optionText TEXT NOT NULL,
  isCorrect BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (questionId) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- Create Quiz Attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quizId INT,
  userId INT,
  score INT,
  startTime TIMESTAMP,
  endTime TIMESTAMP,
  status ENUM('in-progress', 'completed', 'abandoned') DEFAULT 'in-progress',
  FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Quiz Responses table
CREATE TABLE IF NOT EXISTS quiz_responses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  attemptId INT,
  questionId INT,
  answer TEXT,
  isCorrect BOOLEAN,
  points INT DEFAULT 0,
  FOREIGN KEY (attemptId) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (questionId) REFERENCES quiz_questions(id) ON DELETE CASCADE
);