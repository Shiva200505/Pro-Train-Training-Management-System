const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkEnrollments() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // Check training details
        const [trainings] = await connection.query(`
            SELECT id, title, trainerId, startDate, endDate, status 
            FROM trainings 
            WHERE id IN (5,6)`
        );
        console.log('\nTraining Details:');
        console.log(trainings);

        // Check enrollments
        const [enrollments] = await connection.query(`
            SELECT te.*, u.fullName, u.email 
            FROM training_enrollments te
            JOIN users u ON te.userId = u.id
            WHERE te.trainingId IN (5,6)`
        );
        console.log('\nEnrollments:');
        console.log(enrollments);

        // Check attendance records
        const [attendance] = await connection.query(`
            SELECT a.*, u.fullName 
            FROM attendance a
            JOIN users u ON a.userId = u.id
            WHERE a.trainingId IN (5,6)`
        );
        console.log('\nAttendance Records:');
        console.log(attendance);

    } catch (error) {
        console.error('Error checking enrollments:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkEnrollments();
