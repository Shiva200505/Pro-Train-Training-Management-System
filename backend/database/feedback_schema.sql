DROP TABLE IF EXISTS feedback;

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
);