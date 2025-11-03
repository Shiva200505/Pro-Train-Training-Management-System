const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { authenticateToken } = require('../middleware/auth');

// Quiz routes
router.get('/training/:trainingId', authenticateToken, quizController.getQuizzes);
router.get('/:quizId', authenticateToken, quizController.getQuizById);
router.post('/create', authenticateToken, quizController.createQuiz);
router.post('/:quizId/questions', authenticateToken, quizController.addQuestion);
router.post('/:quizId/start', authenticateToken, quizController.startQuiz);
router.post('/response', authenticateToken, quizController.submitResponse);
router.post('/attempt/:attemptId/complete', authenticateToken, quizController.completeQuiz);
router.get('/:quizId/results', authenticateToken, quizController.getResults);

module.exports = router;