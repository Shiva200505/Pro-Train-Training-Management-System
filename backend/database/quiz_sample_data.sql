-- Insert sample quizzes
INSERT INTO quizzes (trainingId, title, description, duration, passingScore)
SELECT 
    id as trainingId,
    CONCAT('Quiz for ', title) as title,
    CONCAT('Assessment for ', title) as description,
    30 as duration,
    70 as passingScore
FROM trainings
WHERE status = 'Active';

-- Insert sample questions for each quiz
INSERT INTO quiz_questions (quizId, question, type, points)
SELECT 
    q.id as quizId,
    'What is the main objective of this training?' as question,
    'multiple-choice' as type,
    10 as points
FROM quizzes q;

-- Add some multiple choice options for each question
INSERT INTO quiz_options (questionId, optionText, isCorrect)
SELECT 
    qq.id as questionId,
    'To gain comprehensive knowledge of the subject' as optionText,
    TRUE as isCorrect
FROM quiz_questions qq;

INSERT INTO quiz_options (questionId, optionText, isCorrect)
SELECT 
    qq.id as questionId,
    'To pass time' as optionText,
    FALSE as isCorrect
FROM quiz_questions qq;

INSERT INTO quiz_options (questionId, optionText, isCorrect)
SELECT 
    qq.id as questionId,
    'Not sure' as optionText,
    FALSE as isCorrect
FROM quiz_questions qq;