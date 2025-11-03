require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const db = require('./config/db');

// Initialize database using the new script
const initializeDatabase = require('./scripts/initializeDatabase');

initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Routes
const authRoutes = require('./routes/auth.routes');
const trainingRoutes = require('./routes/training.routes');
const employeeRoutes = require('./routes/employee.routes');
const quizRoutes = require('./routes/quiz.routes');
const attendanceRoutes = require('./routes/attendance.routes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/trainings', trainingRoutes); // This includes feedback routes
app.use('/api/employee', employeeRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api', attendanceRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      errors: err.errors || []
    });
  }
  
  if (err.name === 'UnauthorizedError' || err.message === 'Invalid token') {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    requestId: req.id || Date.now().toString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});