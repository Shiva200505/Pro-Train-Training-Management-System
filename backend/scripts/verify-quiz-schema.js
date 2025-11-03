const db = require('../config/db');

async function verifyAndFixQuizSchema() {
    try {
        console.log('Verifying quiz schema...');

        // Check quiz_questions table structure
        const [columns] = await db.query(`
            SHOW COLUMNS FROM quiz_questions
        `);

        const hasQuestionType = columns.some(col => col.Field === 'questionType');
        
        if (!hasQuestionType) {
            console.log('Adding questionType column to quiz_questions table...');
            await db.query(`
                ALTER TABLE quiz_questions
                ADD COLUMN questionType ENUM('multiple-choice', 'true-false', 'short-answer') 
                DEFAULT 'multiple-choice' AFTER question
            `);
            console.log('Added questionType column successfully');
        }

        // Verify quiz options table
        const [optionsColumns] = await db.query(`
            SHOW COLUMNS FROM quiz_options
        `);

        const hasOptionText = optionsColumns.some(col => col.Field === 'optionText');
        
        if (!hasOptionText) {
            console.log('Fixing quiz_options table structure...');
            await db.query(`
                ALTER TABLE quiz_options
                ADD COLUMN optionText TEXT NOT NULL AFTER questionId
            `);
            console.log('Fixed quiz_options table structure');
        }

        console.log('Schema verification complete');

    } catch (error) {
        console.error('Error verifying schema:', error);
    } finally {
        process.exit();
    }
}

verifyAndFixQuizSchema();