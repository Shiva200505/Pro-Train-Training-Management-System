-- Create Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trainingId INT NOT NULL,
  userId INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trainingId) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (trainingId, userId, date)
);

-- Create Training Enrollments table if not exists
CREATE TABLE IF NOT EXISTS training_enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trainingId INT NOT NULL,
  userId INT NOT NULL,
  enrollmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'enrolled',
  FOREIGN KEY (trainingId) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (trainingId, userId)
);