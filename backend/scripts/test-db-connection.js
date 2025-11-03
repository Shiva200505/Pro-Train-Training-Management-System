const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
    let connection;
    try {
        // Try to create a connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('Successfully connected to database');

        // Test users table
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        console.log('Users in database:', users[0].count);

        // Test trainings table
        const [trainings] = await connection.query('SELECT COUNT(*) as count FROM trainings');
        console.log('Trainings in database:', trainings[0].count);

        // Test training_enrollments table
        const [enrollments] = await connection.query('SELECT COUNT(*) as count FROM training_enrollments');
        console.log('Training enrollments in database:', enrollments[0].count);

        // Test attendance table
        const [attendance] = await connection.query('SELECT COUNT(*) as count FROM attendance');
        console.log('Attendance records in database:', attendance[0].count);

        // Test the full attendance query
        const today = new Date().toISOString().split('T')[0];
        const [records] = await connection.query(`
            SELECT 
                u.id as userId,
                u.fullName as studentName,
                u.email,
                CASE 
                    WHEN a.status = 'present' THEN TRUE
                    WHEN a.status = 'absent' THEN FALSE
                    ELSE NULL
                END as present,
                a.date,
                te.status as enrollmentStatus
            FROM training_enrollments te
            INNER JOIN users u ON te.userId = u.id
            LEFT JOIN attendance a ON u.id = a.userId 
                AND a.trainingId = te.trainingId 
                AND a.date = ?
            WHERE te.trainingId = ? AND te.status = 'enrolled'
            ORDER BY u.fullName
        `, [today, 1]);  // Testing with trainingId = 1
        
        console.log('Attendance query test result count:', records.length);

    } catch (error) {
        console.error('Database test failed:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testDatabaseConnection();