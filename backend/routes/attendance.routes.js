const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const authMiddleware = require('../middleware/auth');

// Get attendance records for a training
router.get('/trainings/:trainingId/attendance', 
  authMiddleware.authenticateToken, 
  attendanceController.getAttendance
);

// Mark attendance for a student
router.post('/trainings/:trainingId/attendance',
  authMiddleware.authenticateToken,
  attendanceController.markAttendance
);

// Get attendance summary for a training
router.get('/trainings/:trainingId/attendance/summary',
  authMiddleware.authenticateToken,
  attendanceController.getAttendanceSummary
);

module.exports = router;