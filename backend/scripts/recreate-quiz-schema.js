const db = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

async function recreateQuizSchema() {
    try {
        console.log('Reading schema file...');
        const schemaPath = path.join(__dirname, '..', 'database', 'quiz_schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Split the schema into individual statements
        const statements = schema.split(';').filter(stmt => stmt.trim());
        
        console.log('Executing schema statements...');
        for (const statement of statements) {
            if (statement.trim()) {
                await db.query(statement);
                console.log('Executed statement successfully');
            }
        }
        
        console.log('Schema recreation complete');
    } catch (error) {
        console.error('Error recreating schema:', error);
    } finally {
        process.exit();
    }
}

recreateQuizSchema();