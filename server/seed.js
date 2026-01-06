require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'taskhub'
};

async function seed() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);

        console.log('Reading seed data...');
        const dbJsonPath = path.join(__dirname, '..', 'db.json');
        const data = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

        console.log('Seeding Users...');
        for (const user of data.users) {
            await connection.execute(
                'INSERT IGNORE INTO users (id, name, email, role) VALUES (?, ?, ?, ?)',
                [user.id, user.name, user.email, user.role]
            );
        }

        console.log('Seeding Projects...');
        for (const project of data.projects) {
            await connection.execute(
                'INSERT IGNORE INTO projects (id, name, description, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                [project.id, project.name, project.description, project.status, project.createdBy, project.createdAt.replace('T', ' ').replace('Z', '')]
            );
        }

        console.log('Seeding Teams...');
        for (const team of data.teams) {
            await connection.execute(
                'INSERT IGNORE INTO teams (id, name, project_id, lead_id, created_at) VALUES (?, ?, ?, ?, ?)',
                [team.id, team.name, team.projectId, team.leadId, team.createdAt.replace('T', ' ').replace('Z', '')]
            );
        }

        console.log('Seeding Tasks...');
        for (const task of data.tasks) {
            await connection.execute(
                'INSERT IGNORE INTO tasks (id, title, description, status, priority, project_id, team_id, assigned_to, created_by, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [task.id, task.title, task.description, task.status, task.priority, task.projectId, task.teamId, task.assignedTo, task.createdBy, task.dueDate, task.createdAt.replace('T', ' ').replace('Z', '')]
            );
        }

        console.log('Seeding Holidays...');
        for (const holiday of data.holidays) {
            await connection.execute(
                'INSERT IGNORE INTO holidays (id, name, date, type) VALUES (?, ?, ?, ?)',
                [holiday.id, holiday.name, holiday.date, holiday.type]
            );
        }

        console.log('Seeding Leaves...');
        for (const leave of data.leaves) {
            await connection.execute(
                'INSERT IGNORE INTO leaves (id, employee_id, employee_name, leave_type, start_date, end_date, days, reason, status, applied_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [leave.id, leave.employeeId, leave.employeeName, leave.leaveType, leave.startDate, leave.endDate, leave.days, leave.reason, leave.status, leave.appliedOn]
            );
        }

        console.log('Seeding Attendance...');
        for (const record of data.attendance) {
            await connection.execute(
                'INSERT IGNORE INTO attendance (id, employee_id, employee_name, date, check_in, check_out, status, work_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [record.id, record.employeeId, record.employeeName, record.date, record.checkIn, record.checkOut, record.status, record.workHours]
            );
        }

        console.log('Seeding Completed successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        if (connection) await connection.end();
    }
}

seed();
