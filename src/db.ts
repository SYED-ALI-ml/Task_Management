import Dexie, { Table } from 'dexie';
import { Task, User, LeaveRequest, Holiday, AttendanceRecord, Notification } from './types';

export class TaskHubDatabase extends Dexie {
    tasks!: Table<Task>;
    users!: Table<User>;
    leaves!: Table<LeaveRequest>;
    holidays!: Table<Holiday>;
    attendance!: Table<AttendanceRecord>;
    notifications!: Table<Notification>;

    constructor() {
        super('TaskHubDatabase');
        this.version(1).stores({
            tasks: 'id, status, priority, assignee',
            users: 'id, email'
        });

        // Version 2: Add Leave and Attendance tables
        this.version(2).stores({
            tasks: 'id, status, priority, assignee',
            users: 'id, email',
            leaves: 'id, employeeId, status, startDate',
            holidays: 'id, date, type',
            attendance: 'id, employeeId, date, status'
        });

        // Version 3: Add Notifications table
        this.version(3).stores({
            tasks: 'id, status, priority, assignee',
            users: 'id, email',
            leaves: 'id, employeeId, status, startDate',
            holidays: 'id, date, type',
            attendance: 'id, employeeId, date, status',
            notifications: 'id, userId, isRead, createdAt, type'
        });
    }
}

export const db = new TaskHubDatabase();

export const seedDatabase = async () => {
    const taskCount = await db.tasks.count();
    if (taskCount > 0) return; // Already seeded

    const mockUsers: User[] = [
        { id: "u1", name: "You", email: "you@example.com", role: "Admin" },
        { id: "u2", name: "Snehasish", email: "snehasish@example.com", role: "Designer" },
        { id: "u3", name: "Team Lead", email: "lead@example.com", role: "Manager" },
        { id: "u4", name: "Backend Dev", email: "backend@example.com", role: "Developer" }
    ];

    const mockTasks: Task[] = [
        {
            id: "1",
            title: "Design CRM Dashboard",
            description: "Create a modern and intuitive dashboard interface for the CRM system with task management capabilities.",
            status: "in-progress",
            priority: "high",
            assignee: "Snehasish",
            dueDate: "Oct 15, 2024",
            createdAt: "2 days ago",
            followUps: [
                {
                    id: "f1",
                    content: "Initial wireframes are ready for review.",
                    author: mockUsers[1],
                    createdAt: "Yesterday"
                }
            ]
        },
        {
            id: "2",
            title: "Implement Task Automation",
            description: "Build automation features for recurring tasks and notification system.",
            status: "pending",
            priority: "medium",
            assignee: "Team Lead",
            dueDate: "Oct 20, 2024",
            createdAt: "1 day ago",
            followUps: []
        },
        {
            id: "3",
            title: "Setup Database Schema",
            description: "Design and implement the database structure for tasks, users, and company data.",
            status: "completed",
            priority: "urgent",
            assignee: "Backend Dev",
            dueDate: "Oct 10, 2024",
            createdAt: "5 days ago",
            followUps: []
        }
    ];

    await db.users.bulkAdd(mockUsers);
    await db.tasks.bulkAdd(mockTasks);

    // Seed Holidays
    const mockHolidays: Holiday[] = [
        { id: "h1", name: "New Year", date: "2025-01-01", type: "public" },
        { id: "h2", name: "Independence Day", date: "2025-08-15", type: "public" },
        { id: "h3", name: "Christmas", date: "2025-12-25", type: "public" },
        { id: "h4", name: "Company Foundation Day", date: "2025-06-15", type: "company" },
    ];

    // Seed Leave Requests
    const mockLeaves: LeaveRequest[] = [
        {
            id: "l1",
            employeeId: "u2",
            employeeName: "Snehasish",
            leaveType: "casual",
            startDate: "2025-12-10",
            endDate: "2025-12-12",
            days: 3,
            reason: "Personal work",
            status: "approved",
            appliedOn: "2025-11-25",
            approvedBy: "u1",
            approvedOn: "2025-11-26"
        },
        {
            id: "l2",
            employeeId: "u4",
            employeeName: "Backend Dev",
            leaveType: "sick",
            startDate: "2025-12-01",
            endDate: "2025-12-02",
            days: 2,
            reason: "Medical appointment",
            status: "pending",
            appliedOn: "2025-11-28"
        }
    ];

    // Seed Attendance Records  
    const mockAttendance: AttendanceRecord[] = [
        {
            id: "a1",
            employeeId: "u1",
            employeeName: "You",
            date: "2025-11-28",
            checkIn: "09:00 AM",
            checkOut: "06:00 PM",
            status: "present",
            workHours: 9
        },
        {
            id: "a2",
            employeeId: "u2",
            employeeName: "Snehasish",
            date: "2025-11-28",
            checkIn: "09:15 AM",
            checkOut: "06:10 PM",
            status: "late",
            workHours: 8.9
        }
    ];

    await db.holidays.bulkAdd(mockHolidays);
    await db.leaves.bulkAdd(mockLeaves);
    await db.attendance.bulkAdd(mockAttendance);
};

// Helper function to create notifications
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
        id: `n${Date.now()}`,
        ...notification,
        createdAt: new Date().toISOString(),
        isRead: false
    };

    await db.notifications.add(newNotification);
    return newNotification;
};
