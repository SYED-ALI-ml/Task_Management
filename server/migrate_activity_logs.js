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

        console.log('Creating activity_logs table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id VARCHAR(50) PRIMARY KEY,
                entity_type VARCHAR(20) NOT NULL,
                entity_id VARCHAR(50) NOT NULL,
                entity_name VARCHAR(255),
                action VARCHAR(50) NOT NULL,
                user_id VARCHAR(50) NOT NULL,
                user_name VARCHAR(255) NOT NULL,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
