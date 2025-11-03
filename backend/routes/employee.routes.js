const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authenticateToken } = require('../middleware/auth');

// Get trainings for logged in employee
router.get('/trainings', authenticateToken, employeeController.getEmployeeTrainings);

module.exports = router;