import Dexie, { Table } from 'dexie';
import { Task, User, FollowUp } from './types';

export class TaskHubDatabase extends Dexie {
    tasks!: Table<Task>;
    users!: Table<User>;

    constructor() {
        super('TaskHubDatabase');
        this.version(1).stores({
            tasks: 'id, status, priority, assignee',
            users: 'id, email'
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
};
