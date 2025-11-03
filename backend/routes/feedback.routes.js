const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const authMiddleware = require('../middleware/auth');

// Protected routes - require authentication
router.use(authMiddleware.authenticateToken);

// Submit feedback for a training
router.post('/:trainingId/feedback', feedbackController.submitFeedback);

// Get feedback for a training
router.get('/:trainingId/feedback', feedbackController.getTrainingFeedback);

// Delete feedback
router.delete('/feedback/:feedbackId', feedbackController.deleteFeedback);

module.exports = router;