require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'taskhub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function migrate() {
    try {
        const pool = mysql.createPool(dbConfig);
        console.log('Connecting to database...');
        const connection = await pool.getConnection();

        console.log('Creating task_comments table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS task_comments (
                id VARCHAR(50) PRIMARY KEY,
                task_id VARCHAR(50) NOT NULL,
                user_id VARCHAR(50) NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);

        console.log('Migration successful!');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
