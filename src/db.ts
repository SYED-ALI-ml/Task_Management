import Dexie, { Table } from 'dexie';
import { Task, User, LeaveRequest, Holiday, AttendanceRecord, Notification, Idea, Project, Team } from './types';

export class TaskHubDatabase extends Dexie {
    tasks!: Table<Task>;
    users!: Table<User>;
    leaves!: Table<LeaveRequest>;
    holidays!: Table<Holiday>;
    attendance!: Table<AttendanceRecord>;
    notifications!: Table<Notification>;
    ideas!: Table<Idea>;
    projects!: Table<Project>;
    teams!: Table<Team>;

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

        // Version 4: Add Ideas table
        this.version(4).stores({
            tasks: 'id, status, priority, assignee',
            users: 'id, email',
            leaves: 'id, employeeId, status, startDate',
            holidays: 'id, date, type',
            attendance: 'id, employeeId, date, status',
            notifications: 'id, userId, isRead, createdAt, type',
            ideas: 'id, createdBy, category, status, isPublic, createdAt'
        });

        // Version 5: Add Projects and Teams, update Tasks
        this.version(5).stores({
            tasks: 'id, status, priority, projectId, teamId, assignedTo, createdBy',
            users: 'id, email, role',
            leaves: 'id, employeeId, status, startDate',
            holidays: 'id, date, type',
            attendance: 'id, employeeId, date, status',
            notifications: 'id, userId, isRead, createdAt, type',
            ideas: 'id, createdBy, category, status, isPublic, createdAt',
            projects: 'id, createdBy, status, createdAt',
            teams: 'id, projectId, leadId, createdAt'
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
        { id: "u4", name: "Backend Dev", email: "backend@example.com", role: "Developer" },
        { id: "u5", name: "Frontend Dev", email: "frontend@example.com", role: "Developer" }
    ];

    await db.users.bulkAdd(mockUsers);

    // Seed Projects
    const mockProjects: Project[] = [
        {
            id: "proj1",
            name: "CRM System v2.0",
            description: "Complete redesign of the CRM system with modern features and improved UX",
            createdBy: "u1",
            createdAt: new Date("2024-11-01").toISOString(),
            updatedAt: new Date("2024-11-01").toISOString(),
            teams: ["team1", "team2"],
            status: "active"
        },
        {
            id: "proj2",
            name: "Mobile Application",
            description: "Native mobile app for iOS and Android",
            createdBy: "u1",
            createdAt: new Date("2024-11-15").toISOString(),
            updatedAt: new Date("2024-11-15").toISOString(),
            teams: ["team3"],
            status: "active"
        }
    ];

    await db.projects.bulkAdd(mockProjects);

    // Seed Teams
    const mockTeams: Team[] = [
        {
            id: "team1",
            name: "Frontend Team",
            projectId: "proj1",
            members: ["u2", "u5"],
            leadId: "u3",
            createdAt: new Date("2024-11-02").toISOString(),
            updatedAt: new Date("2024-11-02").toISOString()
        },
        {
            id: "team2",
            name: "Backend Team",
            projectId: "proj1",
            members: ["u4"],
            leadId: "u3",
            createdAt: new Date("2024-11-02").toISOString(),
            updatedAt: new Date("2024-11-02").toISOString()
        },
        {
            id: "team3",
            name: "Mobile Dev Team",
            projectId: "proj2",
            members: ["u5", "u4"],
            leadId: "u3",
            createdAt: new Date("2024-11-16").toISOString(),
            updatedAt: new Date("2024-11-16").toISOString()
        }
    ];

    await db.teams.bulkAdd(mockTeams);

    // Seed Tasks with new structure
    const mockTasks: Task[] = [
        {
            id: "1",
            title: "Design CRM Dashboard",
            description: "Create a modern and intuitive dashboard interface for the CRM system with task management capabilities.",
            status: "in-progress",
            priority: "high",
            projectId: "proj1",
            teamId: "team1",
            assignedTo: "u2",
            assignedToName: "Snehasish",
            createdBy: "u1",
            dueDate: "2024-12-15",
            createdAt: new Date("2024-11-28").toISOString(),
            followUps: [
                {
                    id: "f1",
                    content: "Initial wireframes are ready for review.",
                    author: mockUsers[1],
                    createdAt: new Date("2024-11-29").toISOString()
                }
            ]
        },
        {
            id: "2",
            title: "Implement API Endpoints",
            description: "Build RESTful API endpoints for user authentication and task management.",
            status: "pending",
            priority: "high",
            projectId: "proj1",
            teamId: "team2",
            assignedTo: "u4",
            assignedToName: "Backend Dev",
            createdBy: "u3",
            dueDate: "2024-12-20",
            createdAt: new Date("2024-11-27").toISOString(),
            followUps: []
        },
        {
            id: "3",
            title: "Setup Database Schema",
            description: "Design and implement the database structure for tasks, users, and company data.",
            status: "completed",
            priority: "urgent",
            projectId: "proj1",
            teamId: "team2",
            assignedTo: "u4",
            assignedToName: "Backend Dev",
            createdBy: "u1",
            dueDate: "2024-11-10",
            createdAt: new Date("2024-11-05").toISOString(),
            followUps: []
        },
        {
            id: "4",
            title: "iOS App Foundation",
            description: "Set up iOS project structure and basic navigation",
            status: "in-progress",
            priority: "medium",
            projectId: "proj2",
            teamId: "team3",
            assignedTo: "u5",
            assignedToName: "Frontend Dev",
            createdBy: "u1",
            dueDate: "2024-12-10",
            createdAt: new Date("2024-11-20").toISOString(),
            followUps: []
        }
    ];

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

    // Seed Sample Ideas
    const mockIdeas: Idea[] = [
        {
            id: "idea1",
            title: "Mobile App for Task Management",
            description: "Develop a mobile application to manage tasks on the go. This would increase productivity for field teams.",
            category: "product",
            status: "submitted",
            createdBy: "u2",
            createdByName: "Snehasish",
            createdAt: new Date("2025-11-20").toISOString(),
            updatedAt: new Date("2025-11-20").toISOString(),
            sharedWith: ["u1", "u3"],
            isPublic: false,
            likes: ["u1", "u3"],
            comments: [
                {
                    id: "c1",
                    ideaId: "idea1",
                    userId: "u1",
                    userName: "You",
                    content: "Great idea! This would really help our remote teams.",
                    createdAt: new Date("2025-11-21").toISOString()
                }
            ],
            tags: ["mobile", "productivity", "app"]
        },
        {
            id: "idea2",
            title: "Automated Report Generation",
            description: "Implement automated weekly/monthly reports for team performance metrics.",
            category: "process",
            status: "under-review",
            createdBy: "u4",
            createdByName: "Backend Dev",
            createdAt: new Date("2025-11-25").toISOString(),
            updatedAt: new Date("2025-11-26").toISOString(),
            sharedWith: [],
            isPublic: true,
            likes: ["u1", "u2", "u3"],
            comments: [],
            tags: ["automation", "analytics", "reporting"]
        }
    ];

    await db.ideas.bulkAdd(mockIdeas);
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
