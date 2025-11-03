const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/training.controller');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', trainingController.getAllTrainings);

// Protected routes
router.get('/:id', authMiddleware.authenticateToken, trainingController.getTrainingById);
router.post('/', authMiddleware.authenticateToken, trainingController.createTraining);
router.put('/:id', authMiddleware.authenticateToken, trainingController.updateTraining);
router.delete('/:id', authMiddleware.authenticateToken, trainingController.deleteTraining);

// Material routes
router.post('/:trainingId/materials', authMiddleware.authenticateToken, trainingController.upload.single('file'), trainingController.uploadMaterial);
router.get('/:trainingId/materials', authMiddleware.authenticateToken, trainingController.getTrainingMaterials);
router.get('/:trainingId/materials/:materialId/download', authMiddleware.authenticateToken, trainingController.downloadMaterial);
router.delete('/:trainingId/materials/:materialId', authMiddleware.authenticateToken, trainingController.deleteMaterial);

// Enrollment routes
router.post('/:id/enroll', authMiddleware.authenticateToken, trainingController.enrollInTraining);
router.get('/enrolled', authMiddleware.authenticateToken, trainingController.getEnrolledTrainings);

// Feedback routes
const feedbackController = require('../controllers/feedback.controller');
router.post('/:trainingId/feedback', authMiddleware.authenticateToken, feedbackController.submitFeedback);
router.get('/:trainingId/feedback', authMiddleware.authenticateToken, feedbackController.getTrainingFeedback);
router.delete('/feedback/:feedbackId', authMiddleware.authenticateToken, feedbackController.deleteFeedback);

module.exports = router;