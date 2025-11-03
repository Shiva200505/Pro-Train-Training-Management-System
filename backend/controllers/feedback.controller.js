const db = require('../config/db');

// Submit feedback for a training
exports.submitFeedback = async (req, res) => {
    try {
        const { trainingId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if user is enrolled in the training
        const [enrollment] = await db.query(
            'SELECT id FROM training_enrollments WHERE trainingId = ? AND userId = ?',
            [trainingId, userId]
        );

        if (enrollment.length === 0) {
            return res.status(403).json({ message: 'You must be enrolled in this training to provide feedback' });
        }

        // Check if user has already submitted feedback
        const [existingFeedback] = await db.query(
            'SELECT id FROM feedback WHERE trainingId = ? AND userId = ?',
            [trainingId, userId]
        );

        if (existingFeedback.length > 0) {
            // Update existing feedback
            await db.query(
                'UPDATE feedback SET rating = ?, comment_text = ? WHERE trainingId = ? AND userId = ?',
                [rating, comment, trainingId, userId]
            );
            return res.status(200).json({ message: 'Feedback updated successfully' });
        }

        // Insert new feedback
        await db.query(
            'INSERT INTO feedback (trainingId, userId, rating, comment_text) VALUES (?, ?, ?, ?)',
            [trainingId, userId, rating, comment]
        );

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Failed to submit feedback' });
    }
};

// Get feedback for a training
exports.getTrainingFeedback = async (req, res) => {
    try {
        const { trainingId } = req.params;

        // Get average rating and count
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as totalFeedback,
                COALESCE(AVG(rating), 0) as averageRating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as fiveStars,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as fourStars,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as threeStars,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as twoStars,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as oneStar
            FROM feedback 
            WHERE trainingId = ?
        `, [trainingId]);

        // Get all feedback with user names
        const [feedback] = await db.query(`
            SELECT 
                f.id,
                f.rating,
                f.comment_text,
                f.createdAt,
                u.fullName as userName
            FROM feedback f
            JOIN users u ON f.userId = u.id
            WHERE f.trainingId = ?
            ORDER BY f.createdAt DESC
        `, [trainingId]);

        // Get user's feedback if exists
        const userId = req.user.id;
        const [userFeedback] = await db.query(
            'SELECT * FROM feedback WHERE trainingId = ? AND userId = ?',
            [trainingId, userId]
        );

        res.status(200).json({
            stats: stats[0],
            feedback,
            userFeedback: userFeedback[0] || null
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Failed to fetch feedback' });
    }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const userId = req.user.id;

        // Check if feedback belongs to user
        const [feedback] = await db.query(
            'SELECT id FROM feedback WHERE id = ? AND userId = ?',
            [feedbackId, userId]
        );

        if (feedback.length === 0) {
            return res.status(404).json({ message: 'Feedback not found or unauthorized' });
        }

        await db.query('DELETE FROM feedback WHERE id = ?', [feedbackId]);

        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ message: 'Failed to delete feedback' });
    }
};