require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'taskhub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to MySQL database.');
        connection.release();
    } catch (error) {
        console.error('Error connecting to database:', error.message);
    }
}

testConnection();

// --- API Endpoints ---

// Users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    const { id, name, email, role } = req.body;
    try {
        const query = 'INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)';
        await pool.query(query, [id, name, email, role]);
        res.status(201).json({ message: 'User created successfully', user: { id, name, email, role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// projects
app.get('/api/projects', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projects');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Teams
app.get('/api/teams', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM teams');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { id, title, description, status, priority, projectId, teamId, assignedTo, createdBy, dueDate } = req.body;
    try {
        // Note: Using snake_case for DB columns based on schema
        const query = `
            INSERT INTO tasks (id, title, description, status, priority, project_id, team_id, assigned_to, created_by, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await pool.query(query, [id, title, description, status, priority, projectId, teamId, assignedTo, createdBy, dueDate]);
        res.status(201).json({ message: 'Task created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Convert camelCase to snake_case for DB
    const dbUpdates = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.priority) dbUpdates.priority = updates.priority;
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.projectId) dbUpdates.project_id = updates.projectId;
    if (updates.teamId) dbUpdates.team_id = updates.teamId;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;

    // Only proceed if there are valid updates
    if (Object.keys(dbUpdates).length === 0) return res.status(200).json({ message: 'No updates provided' });

    try {
        const setClause = Object.keys(dbUpdates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(dbUpdates), id];

        await pool.query(`UPDATE tasks SET ${setClause} WHERE id = ?`, values);
        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Comments
app.get('/api/tasks/:id/comments', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT tc.*, u.name as user_name 
            FROM task_comments tc 
            JOIN users u ON tc.user_id = u.id 
            WHERE tc.task_id = ? 
            ORDER BY tc.created_at ASC
        `;
        const [rows] = await pool.query(query, [id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tasks/:id/comments', async (req, res) => {
    const { id } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content) {
        return res.status(400).json({ error: 'Missing userId or content' });
    }

    try {
        const commentId = `c${Date.now()}`;
        const query = `
            INSERT INTO task_comments (id, task_id, user_id, content)
            VALUES (?, ?, ?, ?)
        `;
        await pool.query(query, [commentId, id, userId, content]);

        const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
        const userName = userRows[0]?.name || 'Unknown';

        res.status(201).json({
            id: commentId,
            task_id: id,
            user_id: userId,
            content,
            created_at: new Date(),
            user_name: userName
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Holidays
app.get('/api/holidays', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM holidays');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Leaves
app.get('/api/leaves', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM leaves');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Attendance
app.get('/api/attendance', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM attendance');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ideas
app.get('/api/ideas', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ideas');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Companies
app.get('/api/companies', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM companies');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Contacts
app.get('/api/contacts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM contacts');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Activity Logs
app.get('/api/activity-logs', async (req, res) => {
    try {
        const query = `
            SELECT * FROM activity_logs 
            ORDER BY created_at DESC 
            LIMIT 50
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/activity-logs', async (req, res) => {
    const { entityType, entityId, entityName, action, userId, userName, details } = req.body;
    try {
        const logId = `log${Date.now()}`;
        const query = `
            INSERT INTO activity_logs (id, entity_type, entity_id, entity_name, action, user_id, user_name, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await pool.query(query, [logId, entityType, entityId, entityName, action, userId, userName, details]);
        res.status(201).json({ message: 'Activity logged successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Leads
app.get('/api/leads', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM leads');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Products
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
