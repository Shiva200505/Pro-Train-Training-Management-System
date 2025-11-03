const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/materials');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

exports.upload = multer({ storage });

// Get all trainings
exports.getAllTrainings = async (req, res) => {
  try {
    console.log('Fetching all trainings...');
    
    const [trainings] = await db.query(`
      SELECT 
        t.*,
        u.fullName as trainerName,
        COUNT(DISTINCT te.userId) as enrolledCount,
        COUNT(DISTINCT tm.id) as materialsCount
      FROM trainings t
      LEFT JOIN users u ON t.trainerId = u.id
      LEFT JOIN training_enrollments te ON t.id = te.trainingId
      LEFT JOIN training_materials tm ON t.id = tm.trainingId
      GROUP BY t.id
      ORDER BY t.startDate DESC
    `);
    
    console.log(`Found ${trainings.length} trainings`);
    
    // Format the response
    const formattedTrainings = trainings.map(training => ({
      ...training,
      enrolledCount: parseInt(training.enrolledCount) || 0,
      materialsCount: parseInt(training.materialsCount) || 0,
      startDate: training.startDate.toISOString().split('T')[0],
      endDate: training.endDate.toISOString().split('T')[0]
    }));
    
    res.status(200).json(formattedTrainings);
  } catch (error) {
    console.error('Error in getAllTrainings:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Get training by ID
exports.getTrainingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Training ID is required' });
    }
    
    const [trainings] = await db.query(`
      SELECT 
        t.*, 
        u.fullName as trainerName,
        CASE 
          WHEN te.userId IS NOT NULL THEN true 
          ELSE false 
        END as isEnrolled,
        te.status as enrollmentStatus
      FROM trainings t
      LEFT JOIN users u ON t.trainerId = u.id
      LEFT JOIN training_enrollments te ON t.id = te.trainingId AND te.userId = ?
      WHERE t.id = ?
    `, [req.user.id, id]);
    
    if (trainings.length === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }
    
    const training = trainings[0];
    
    // Get training materials
    const [materials] = await db.query(
      'SELECT * FROM training_materials WHERE trainingId = ?',
      [id]
    );
    
    // Get attendance count
    const [attendanceResult] = await db.query(
      'SELECT COUNT(*) as count FROM attendance WHERE trainingId = ?',
      [id]
    );
    
    // Get feedback stats
    const [feedbackStats] = await db.query(`
      SELECT AVG(rating) as averageRating, COUNT(*) as count 
      FROM feedback 
      WHERE trainingId = ?
    `, [id]);
    
    res.status(200).json({
      ...training,
      materials,
      attendanceCount: attendanceResult[0].count,
      feedbackStats: feedbackStats[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new training
exports.createTraining = async (req, res) => {
  try {
    console.log('Received training creation request:', req.body);
    const { 
      title, 
      description, 
      trainerId, 
      startDate, 
      endDate, 
      capacity = 20,
      location = '',
      category = 'Technical',
      level = 'Beginner'
    } = req.body;
    
    // Validate required fields
    if (!title || !trainerId || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Required fields missing', 
        requiredFields: ['title', 'trainerId', 'startDate', 'endDate'] 
      });
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    if (start > end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Insert query with all fields
    const query = `
      INSERT INTO trainings (
        title, description, trainerId, startDate, endDate,
        capacity, location, category, level, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    `;

    const values = [
      title,
      description || '',
      trainerId,
      startDate,
      endDate,
      capacity,
      location,
      category,
      level
    ];
    
    console.log('Executing query:', query);
    console.log('Values:', values);
    
    const [result] = await db.query(query, values);
    
    res.status(201).json({ id: result.insertId, message: 'Training created successfully' });
  } catch (error) {
    console.error('Training creation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ 
      message: 'Failed to create training',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get enrolled trainings
exports.getEnrolledTrainings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const [enrollments] = await db.query(`
      SELECT t.*, u.fullName as trainerName, e.enrollmentDate, e.status as enrollmentStatus
      FROM enrollments e
      LEFT JOIN trainings t ON e.trainingId = t.id
      LEFT JOIN users u ON t.trainerId = u.id
      WHERE e.employeeId = ?
      ORDER BY e.enrollmentDate DESC
    `, [userId]);
    
    // Return empty array instead of null if no enrollments found
    res.status(200).json(enrollments || []);
  } catch (error) {
    console.error('Error fetching enrolled trainings:', error);
    res.status(500).json({ message: 'Failed to fetch enrolled trainings' });
  }
};

// Update training
exports.updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, category, status } = req.body;
    
    const [result] = await db.query(
      'UPDATE trainings SET title = ?, description = ?, startDate = ?, endDate = ?, category = ?, status = ? WHERE id = ?',
      [title, description, startDate, endDate, category, status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }
    
    res.status(200).json({ message: 'Training updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete training
exports.deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete training (cascade will handle related records)
    const [result] = await db.query('DELETE FROM trainings WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }
    
    res.status(200).json({ message: 'Training deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Enroll in training
exports.enrollInTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!id || !userId) {
      return res.status(400).json({ message: 'Training ID and user ID are required' });
    }
    
    // Check if training exists
    const [trainings] = await db.query('SELECT * FROM trainings WHERE id = ?', [id]);
    
    if (trainings.length === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }

    // Check if training is active
    if (trainings[0].status !== 'Active') {
      return res.status(400).json({ message: 'Training is not currently accepting enrollments' });
    }

    // Check if already enrolled
    const [enrollments] = await db.query(
      'SELECT * FROM training_enrollments WHERE trainingId = ? AND userId = ?',
      [id, userId]
    );
    
    if (enrollments.length > 0) {
      return res.status(409).json({ message: 'Already enrolled in this training' });
    }
    
    // Create enrollment record
    const [result] = await db.query(
      'INSERT INTO training_enrollments (trainingId, userId, status) VALUES (?, ?, ?)',
      [id, userId, 'Pending']
    );
    
    // Create initial attendance record
    await db.query(
      'INSERT INTO attendance (trainingId, userId, date, status) VALUES (?, ?, CURDATE(), ?)',
      [id, userId, 'Present']
    );
    
    res.status(201).json({ 
      success: true,
      message: 'Enrolled successfully',
      enrollmentId: result.insertId
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to enroll in training',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Upload training material
exports.uploadMaterial = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Check if training exists
    const [trainings] = await db.query('SELECT * FROM trainings WHERE id = ?', [trainingId]);
    
    if (trainings.length === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }
    
    // Save file info to database
    const fileUrl = `/uploads/materials/${file.filename}`;
    const title = file.originalname;
    
    const [result] = await db.query(
      'INSERT INTO training_materials (trainingId, title, fileUrl) VALUES (?, ?, ?)',
      [trainingId, title, fileUrl]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      title,
      fileUrl,
      createdAt: new Date()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: error.message || 'Server error while uploading material'
    });
  }
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const employeeId = req.user.id;
    
    // Check if training exists
    const [trainings] = await db.query('SELECT * FROM trainings WHERE id = ?', [id]);
    
    if (trainings.length === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }
    
    // Check if already submitted feedback
    const [existingFeedback] = await db.query(
      'SELECT * FROM feedback WHERE trainingId = ? AND employeeId = ?',
      [id, employeeId]
    );
    
    if (existingFeedback.length > 0) {
      // Update existing feedback
      await db.query(
        'UPDATE feedback SET rating = ?, comment = ? WHERE trainingId = ? AND employeeId = ?',
        [rating, comment, id, employeeId]
      );
    } else {
      // Create new feedback
      await db.query(
        'INSERT INTO feedback (trainingId, employeeId, rating, comment) VALUES (?, ?, ?, ?)',
        [id, employeeId, rating, comment]
      );
    }
    
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get training materials
exports.getTrainingMaterials = async (req, res) => {
  try {
    const { trainingId } = req.params;
    
    if (!trainingId) {
      return res.status(400).json({ message: 'Training ID is required' });
    }
    
    // Check if training exists
    const [trainings] = await db.query('SELECT * FROM trainings WHERE id = ?', [trainingId]);
    
    if (trainings.length === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }
    
    // Get materials
    const [materials] = await db.query(
      'SELECT * FROM training_materials WHERE trainingId = ? ORDER BY createdAt DESC',
      [trainingId]
    );
    
    res.status(200).json(materials);
  } catch (error) {
    console.error('Error fetching training materials:', error);
    res.status(500).json({ message: 'Failed to fetch training materials' });
  }
};

// Download training material
exports.downloadMaterial = async (req, res) => {
  try {
    const { trainingId, materialId } = req.params;
    const userId = req.user.id;

    // Verify if the user is enrolled in the training or is a trainer
    const [enrollment] = await db.query(`
      SELECT te.*, t.trainerId 
      FROM training_enrollments te
      JOIN trainings t ON te.trainingId = t.id
      WHERE te.trainingId = ? AND (te.userId = ? OR t.trainerId = ?)
    `, [trainingId, userId, userId]);

    if (enrollment.length === 0) {
      return res.status(403).json({ message: 'You must be enrolled in this training to download materials' });
    }

    // Get material info
    const [materials] = await db.query(
      'SELECT * FROM training_materials WHERE id = ? AND trainingId = ?',
      [materialId, trainingId]
    );

    if (materials.length === 0) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const material = materials[0];
    const filePath = path.join(__dirname, '..', material.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set proper headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${material.title}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading material:', error);
    res.status(500).json({ message: 'Failed to download material' });
  }
};

// Delete training material
exports.deleteMaterial = async (req, res) => {
  try {
    const { trainingId, materialId } = req.params;

    if (!materialId || !trainingId) {
      return res.status(400).json({ message: 'Training ID and Material ID are required' });
    }

    // Get material info first to delete the file
    const [materials] = await db.query(
      'SELECT * FROM training_materials WHERE id = ? AND trainingId = ?', 
      [materialId, trainingId]
    );

    if (materials.length === 0) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Delete file from filesystem
    const material = materials[0];
    const filePath = path.join(__dirname, '..', material.fileUrl);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await db.query('DELETE FROM training_materials WHERE id = ? AND trainingId = ?', [materialId, trainingId]);

    res.status(200).json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ message: 'Failed to delete material' });
  }
};