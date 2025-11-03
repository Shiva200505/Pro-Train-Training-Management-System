const db = require('../config/db');

// Get attendance records for a training
exports.getAttendance = async (req, res) => {
  try {
    console.log('Fetching attendance for training:', req.params);
    const { trainingId } = req.params;
    
    if (!trainingId) {
      console.error('Training ID is missing');
      return res.status(400).json({ message: 'Training ID is required' });
    }

    // Get current date in YYYY-MM-DD format for the local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    console.log('Fetching attendance for date:', todayStr);
    
    // First verify if the training exists and is active
    const [training] = await db.query(
      'SELECT id FROM trainings WHERE id = ? AND status = "Active"', 
      [trainingId]
    );
    
    if (training.length === 0) {
      console.error('Training not found or not active:', trainingId);
      return res.status(404).json({ message: 'Training not found or not active' });
    }

    // Get all enrolled students and their attendance records
    console.log('Executing attendance query...');
    const [records] = await db.query(`
      SELECT 
        u.id as userId,
        u.fullName as studentName,
        u.email,
        CASE 
          WHEN a.status IS NULL THEN 'Not Marked'
          ELSE a.status 
        END as attendanceStatus,
        a.date,
        te.status as enrollmentStatus
      FROM training_enrollments te
      INNER JOIN users u ON te.userId = u.id
      LEFT JOIN attendance a ON u.id = a.userId 
        AND a.trainingId = te.trainingId 
        AND DATE(a.date) = DATE(?)
      WHERE te.trainingId = ? AND te.status IN ('Approved', 'Pending')
      ORDER BY u.fullName
    `, [todayStr, trainingId]);
    
    console.log('Retrieved attendance records:', records);

    console.log('Retrieved attendance records:', records.length);
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    // Send more detailed error information
    res.status(500).json({ 
      message: 'Failed to fetch attendance records',
      error: error.message,
      code: error.code
    });
  }
};

// Mark attendance for a student
exports.markAttendance = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { userId, present } = req.body;
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const status = present ? 'Present' : 'Absent';

    console.log('Marking attendance:', { trainingId, userId, status, today });

    // Verify user is enrolled in the training
    const [enrollment] = await db.query(
      'SELECT id FROM training_enrollments WHERE trainingId = ? AND userId = ? AND status IN ("Approved", "Pending")',
      [trainingId, userId]
    );

    if (enrollment.length === 0) {
      return res.status(400).json({ message: 'Student is not enrolled in this training' });
    }

    // Check if attendance record exists for today
    const [existing] = await db.query(
      'SELECT id FROM attendance WHERE trainingId = ? AND userId = ? AND date = ?',
      [trainingId, userId, today]
    );

    if (existing.length > 0) {
      // Update existing record
      console.log('Updating existing attendance record with status:', status);
      await db.query(
        'UPDATE attendance SET status = ? WHERE trainingId = ? AND userId = ? AND date = ?',
        [status, trainingId, userId, today]
      );
    } else {
      // Create new record
      console.log('Creating new attendance record with status:', status);
      await db.query(
        'INSERT INTO attendance (trainingId, userId, date, status) VALUES (?, ?, ?, ?)',
        [trainingId, userId, today, status]
      );
    }

    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
};

// Get attendance summary for a training
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { trainingId } = req.params;
    
    // Get attendance summary statistics
    const [summary] = await db.query(`
      SELECT 
        a.date,
        COUNT(DISTINCT te.userId) as totalEnrolled,
        COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN a.userId END) as presentCount,
        COUNT(DISTINCT CASE WHEN a.status = 'Absent' THEN a.userId END) as absentCount
      FROM training_enrollments te
      LEFT JOIN attendance a ON te.trainingId = a.trainingId AND te.userId = a.userId
      WHERE te.trainingId = ? AND te.status IN ('Approved', 'Pending')
      GROUP BY a.date
      ORDER BY a.date DESC
    `, [trainingId]);

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Failed to fetch attendance summary' });
  }
};