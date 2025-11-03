const db = require('../config/db');

// Get trainings for employee
exports.getEmployeeTrainings = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const [trainings] = await db.query(`
      SELECT 
        t.*,
        u.fullName as trainerName,
        te.status as completionStatus,
        te.enrollmentDate,
        COUNT(DISTINCT tm.id) as materialsCount,
        CASE 
          WHEN te.userId IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END as isEnrolled
      FROM trainings t
      LEFT JOIN users u ON t.trainerId = u.id
      LEFT JOIN training_enrollments te ON t.id = te.trainingId AND te.userId = ?
      LEFT JOIN training_materials tm ON t.id = tm.trainingId
      WHERE t.status = 'Active' OR t.status = 'Upcoming' OR te.userId = ?
      GROUP BY t.id, t.title, t.description, t.trainerId, t.startDate, t.endDate, 
               t.capacity, t.location, t.category, t.level, t.status, t.createdAt, 
               t.updatedAt, u.fullName, te.status, te.enrollmentDate
      ORDER BY 
        t.startDate DESC,
        isEnrolled DESC
    `, [userId, userId]);

    // Format the response
    const formattedTrainings = trainings.map(training => ({
      ...training,
      materialsCount: parseInt(training.materialsCount) || 0,
      isEnrolled: training.enrollmentDate != null,
      startDate: training.startDate.toISOString().split('T')[0],
      endDate: training.endDate.toISOString().split('T')[0]
    }));

    res.status(200).json(formattedTrainings);
  } catch (error) {
    console.error('Error in getEmployeeTrainings:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};