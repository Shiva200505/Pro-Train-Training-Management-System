const db = require('../config/db');

// Get all quizzes for a training
exports.getQuizzes = async (req, res) => {
  try {
    const { trainingId } = req.params;
    console.log('Fetching quizzes for training:', trainingId);
    
    if (!trainingId) {
      console.log('No training ID provided');
      return res.status(400).json({ message: 'Training ID is required' });
    }
    
    const [quizzes] = await db.query(`
      SELECT 
        q.*,
        COUNT(DISTINCT qq.id) as questionCount,
        COUNT(DISTINCT qa.id) as attemptCount
      FROM quizzes q
      LEFT JOIN quiz_questions qq ON q.id = qq.quizId
      LEFT JOIN quiz_attempts qa ON q.id = qa.quizId
      WHERE q.trainingId = ?
      GROUP BY q.id
    `, [trainingId]);

    // Fetch questions and options for each quiz
    for (let quiz of quizzes) {
      const [questions] = await db.query(`
        SELECT 
          qq.*,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', qo.id,
              'optionText', qo.optionText,
              'isCorrect', qo.isCorrect
            )
          ) as options
        FROM quiz_questions qq
        LEFT JOIN quiz_options qo ON qq.id = qo.questionId
        WHERE qq.quizId = ?
        GROUP BY qq.id
      `, [quiz.id]);

      // Parse the JSON string of options for each question
      quiz.questions = questions.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }));
    }
    
    console.log(`Found ${quizzes.length} quizzes for training ${trainingId}`);
    
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error getting quizzes:', error);
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Get quiz details
    const [quizzes] = await db.query(`
      SELECT q.*
      FROM quizzes q
      WHERE q.id = ?
    `, [quizId]);

    if (quizzes.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const quiz = quizzes[0];

    // Get questions
    const [questions] = await db.query(`
      SELECT id, question, questionType as type, points
      FROM quiz_questions 
      WHERE quizId = ?
    `, [quizId]);

    // Get options for each question
    for (let question of questions) {
      if (question.type === 'multiple-choice') {
        const [options] = await db.query(`
          SELECT id, optionText
          FROM quiz_options
          WHERE questionId = ?
        `, [question.id]);
        question.options = options;
      } else if (question.type === 'true-false') {
        question.options = [
          { id: 'true', optionText: 'True' },
          { id: 'false', optionText: 'False' }
        ];
      }
    }

    // Add questions to quiz object
    quiz.questions = questions;

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error getting quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz' });
  }
};

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { trainingId, title, description, duration, passingScore } = req.body;

    // Log received data
    console.log('Creating quiz with data:', { trainingId, title, description, duration, passingScore });

    // Validate required fields
    if (!trainingId || !title) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Training ID and title are required' });
    }

    // Ensure numeric fields are valid
    const timeLimit = duration ? parseInt(duration) : 30;
    const numericPassingScore = passingScore ? parseInt(passingScore) : 70;

    // Validate the training exists
    const [training] = await db.query('SELECT id FROM trainings WHERE id = ?', [trainingId]);
    if (!training.length) {
      console.log('Training not found with ID:', trainingId);
      return res.status(404).json({ message: 'Training not found' });
    }

    // Verify table structure
    const [tableInfo] = await db.query('DESCRIBE quizzes');
    console.log('Quiz table structure:', tableInfo);

    // Create the quiz
    console.log('Inserting quiz with values:', [trainingId, title, description || '', timeLimit, numericPassingScore]);
    const [result] = await db.query(
      'INSERT INTO quizzes (trainingId, title, description, timeLimit, passingScore) VALUES (?, ?, ?, ?, ?)',
      [trainingId, title, description || '', timeLimit, numericPassingScore]
    );
    
    console.log('Quiz inserted successfully with ID:', result.insertId);

    // Return the complete quiz object
    res.status(201).json({ 
      id: result.insertId,
      trainingId,
      title,
      description,
      timeLimit,
      passingScore: numericPassingScore,
      message: 'Quiz created successfully' 
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      sql: error.sql
    });
    
    res.status(500).json({ 
      message: 'Error creating quiz', 
      error: error.message,
      details: {
        code: error.code,
        sqlMessage: error.sqlMessage
      }
    });
  }
};

// Add question to quiz
exports.addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question, type, points, options } = req.body;
    
    // Insert question
    const [questionResult] = await db.query(
      'INSERT INTO quiz_questions (quizId, question, questionType, points) VALUES (?, ?, ?, ?)',
      [quizId, question, type, points]
    );
    
    // Insert options if multiple choice
    if (type === 'multiple-choice' && options && options.length > 0) {
      const optionValues = options.map(opt => [
        questionResult.insertId,
        opt.optionText,  // Changed from opt.text to opt.optionText
        opt.isCorrect
      ]);
      
      await db.query(
        'INSERT INTO quiz_options (questionId, optionText, isCorrect) VALUES ?',
        [optionValues]
      );
    }
    
    res.status(201).json({
      id: questionResult.insertId,
      message: 'Question added successfully'
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Error adding question' });
  }
};

// Start quiz attempt
exports.startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    
    // Check if there's an existing incomplete attempt
    const [existingAttempt] = await db.query(
      'SELECT * FROM quiz_attempts WHERE quizId = ? AND userId = ? AND status = "in_progress"',
      [quizId, userId]
    );
    
    if (existingAttempt.length > 0) {
      return res.status(200).json(existingAttempt[0]);
    }
    
    // Create new attempt
    const [result] = await db.query(
      'INSERT INTO quiz_attempts (quizId, userId, startTime, status) VALUES (?, ?, NOW(), "in_progress")',
      [quizId, userId]
    );
    
    res.status(201).json({
      id: result.insertId,
      message: 'Quiz attempt started'
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ message: 'Error starting quiz' });
  }
};

// Submit quiz response
exports.submitResponse = async (req, res) => {
  try {
    const { attemptId, questionId, answer } = req.body;
    
    // Get question type and correct answer
    const [question] = await db.query(
      'SELECT questionType, id FROM quiz_questions WHERE id = ?',
      [questionId]
    );
    
    if (!question[0]) {
      return res.status(404).json({ message: 'Question not found' });
    }

    let isCorrect = false;
    
    if (question[0].questionType === 'multiple-choice') {
      const [correctOption] = await db.query(
        'SELECT id FROM quiz_options WHERE questionId = ? AND isCorrect = true',
        [questionId]
      );
      if (correctOption[0]) {
        isCorrect = parseInt(answer) === correctOption[0].id;
      }
    } else if (question[0].questionType === 'true-false') {
      // For true-false questions, the answer should be 'true' or 'false'
      isCorrect = ['true', 'false'].includes(answer.toLowerCase());
    } else if (question[0].questionType === 'short-answer') {
      // For short answer, we'll mark it for manual review
      isCorrect = null;
    }
    
    // Save response
    await db.query(
      'INSERT INTO quiz_responses (attemptId, questionId, answer, isCorrect) VALUES (?, ?, ?, ?)',
      [attemptId, questionId, answer, isCorrect]
    );
    
    res.status(200).json({ message: 'Response submitted successfully' });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ message: 'Error submitting response' });
  }
};

// Complete quiz attempt
exports.completeQuiz = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    // Calculate score
    const [responses] = await db.query(`
      SELECT 
        COUNT(CASE WHEN isCorrect = true THEN 1 END) as correctAnswers,
        COUNT(*) as totalQuestions
      FROM quiz_responses
      WHERE attemptId = ?
    `, [attemptId]);
    
    const score = Math.round((responses[0].correctAnswers / responses[0].totalQuestions) * 100);
    
    // Update attempt
    await db.query(
      'UPDATE quiz_attempts SET score = ?, endTime = NOW(), status = "completed" WHERE id = ?',
      [score, attemptId]
    );
    
    res.status(200).json({
      score,
      message: 'Quiz completed successfully'
    });
  } catch (error) {
    console.error('Error completing quiz:', error);
    res.status(500).json({ message: 'Error completing quiz' });
  }
};

// Get quiz results
exports.getResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    
    const [attempts] = await db.query(`
      SELECT 
        qa.*,
        q.title as quizTitle,
        q.passingScore,
        COUNT(qr.id) as totalAnswered,
        SUM(qr.isCorrect) as correctAnswers
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quizId = q.id
      LEFT JOIN quiz_responses qr ON qa.id = qr.attemptId
      WHERE qa.quizId = ? AND qa.userId = ?
      GROUP BY qa.id
      ORDER BY qa.startTime DESC
    `, [quizId, userId]);
    
    res.status(200).json(attempts);
  } catch (error) {
    console.error('Error getting results:', error);
    res.status(500).json({ message: 'Error fetching results' });
  }
};