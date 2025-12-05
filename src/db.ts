import Dexie, { Table } from 'dexie';
import { Task, User, LeaveRequest, Holiday, AttendanceRecord, Notification, Idea, Project, Team, Lead, Contact, Company, Product, Quotation, Activity, CompanyLink, SupportTicket, ActivityLog, Wallet, Transaction, SubscriptionPlan, AIUsageLog } from './types';

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
    leads!: Table<Lead>;
    contacts!: Table<Contact>;
    companies!: Table<Company>;
    products!: Table<Product>;
    quotations!: Table<Quotation>;
    activities!: Table<Activity>;
    companyLinks!: Table<CompanyLink>;
    supportTickets!: Table<SupportTicket>;
    activityLogs!: Table<ActivityLog>;
    wallets!: Table<Wallet>;
    transactions!: Table<Transaction>;
    subscriptionPlans!: Table<SubscriptionPlan>;
    aiUsageLogs!: Table<AIUsageLog>;

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

        // Version 6: Add CRM tables
        this.version(6).stores({
            tasks: 'id, status, priority, projectId, teamId, assignedTo, createdBy',
            users: 'id, email, role',
            leaves: 'id, employeeId, status, startDate',
            holidays: 'id, date, type',
            attendance: 'id, employeeId, date, status',
            notifications: 'id, userId, isRead, createdAt, type',
            ideas: 'id, createdBy, category, status, isPublic, createdAt',
            projects: 'id, createdBy, status, createdAt',
            teams: 'id, projectId, leadId, createdAt',
            leads: 'id, status, assignedTo, createdAt',
            contacts: 'id, companyId, email',
            companies: 'id, name, industry',
            products: 'id, category, sku',
            quotations: 'id, customerId, status, createdAt',
            activities: 'id, relatedToId, type, date'
        });

        // Version 6: Add Company Links and Support Tickets
        this.version(6).stores({
            tasks: 'id, status, priority, projectId, teamId, assignedTo, createdBy',
            users: 'id, email, role',
            leaves: 'id, employeeId, status, startDate',
            holidays: 'id, date, type',
            attendance: 'id, employeeId, date, status',
            notifications: 'id, userId, isRead, createdAt, type',
            ideas: 'id, createdBy, category, status, isPublic, createdAt',
            projects: 'id, createdBy, status, createdAt',
            teams: 'id, projectId, leadId, createdAt',
            companyLinks: 'id, category, createdBy, createdAt, accessCount',
            supportTickets: 'id, createdBy, assignedTo, status, priority, createdAt'
        });

        // Version 7: Add Activity Logs
        this.version(7).stores({
            tasks: 'id, status, priority, projectId, teamId, assignedTo, createdBy',
            users: 'id, email, role',
            leaves: 'id, employeeId, status, startDate',
            holidays: 'id, date, type',
            attendance: 'id, employeeId, date, status',
            notifications: 'id, userId, isRead, createdAt, type',
            ideas: 'id, createdBy, category, status, isPublic, createdAt',
            projects: 'id, createdBy, status, createdAt',
            teams: 'id, projectId, leadId, createdAt',
            companyLinks: 'id, category, createdBy, createdAt, accessCount',
            supportTickets: 'id, createdBy, assignedTo, status, priority, createdAt',
            activityLogs: 'id, userId, entityType, entityId, createdAt'
        });

        // Version 8: Add Billing and AI Usage
        this.version(8).stores({
            tasks: 'id, status, priority, projectId, teamId, assignedTo, createdBy',
            users: 'id, email, role',
            leaves: 'id, employeeId, status, startDate',
            holidays: 'id, date, type',
            attendance: 'id, employeeId, date, status',
            notifications: 'id, userId, isRead, createdAt, type',
            ideas: 'id, createdBy, category, status, isPublic, createdAt',
            projects: 'id, createdBy, status, createdAt',
            teams: 'id, projectId, leadId, createdAt',
            companyLinks: 'id, category, createdBy, createdAt, accessCount',
            supportTickets: 'id, createdBy, assignedTo, status, priority, createdAt',
            activityLogs: 'id, userId, entityType, entityId, createdAt',
            wallets: 'id',
            transactions: 'id, walletId, type, category, date',
            subscriptionPlans: 'id, isActive',
            aiUsageLogs: 'id, userId, feature, timestamp'
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

    // Seed CRM Data
    const mockCompanies: Company[] = [
        {
            id: "c1",
            name: "TechCorp Inc.",
            industry: "Technology",
            website: "https://techcorp.com",
            phone: "+1 555-0123",
            address: "123 Tech Park, Silicon Valley, CA",
            createdAt: new Date("2024-11-01").toISOString(),
            updatedAt: new Date("2024-11-01").toISOString()
        },
        {
            id: "c2",
            name: "Global Solutions",
            industry: "Consulting",
            website: "https://globalsolutions.com",
            phone: "+1 555-0456",
            address: "456 Business Ave, New York, NY",
            createdAt: new Date("2024-11-05").toISOString(),
            updatedAt: new Date("2024-11-05").toISOString()
        }
    ];

    await db.companies.bulkAdd(mockCompanies);

    const mockContacts: Contact[] = [
        {
            id: "ct1",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@techcorp.com",
            phone: "+1 555-1111",
            companyId: "c1",
            role: "CTO",
            createdAt: new Date("2024-11-02").toISOString(),
            updatedAt: new Date("2024-11-02").toISOString()
        },
        {
            id: "ct2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@globalsolutions.com",
            phone: "+1 555-2222",
            companyId: "c2",
            role: "CEO",
            createdAt: new Date("2024-11-06").toISOString(),
            updatedAt: new Date("2024-11-06").toISOString()
        }
    ];

    await db.contacts.bulkAdd(mockContacts);

    const mockLeads: Lead[] = [
        {
            id: "l1",
            firstName: "Alice",
            lastName: "Johnson",
            email: "alice.j@startup.com",
            phone: "+1 555-3333",
            company: "Startup Hub",
            status: "new",
            source: "website",
            assignedTo: "u1",
            createdAt: new Date("2024-11-28").toISOString(),
            updatedAt: new Date("2024-11-28").toISOString()
        },
        {
            id: "l2",
            firstName: "Bob",
            lastName: "Williams",
            email: "bob.w@enterprise.com",
            phone: "+1 555-4444",
            company: "Enterprise Ltd",
            status: "contacted",
            source: "linkedin",
            assignedTo: "u2",
            createdAt: new Date("2024-11-29").toISOString(),
            updatedAt: new Date("2024-11-29").toISOString()
        }
    ];

    await db.leads.bulkAdd(mockLeads);

    const mockProducts: Product[] = [
        {
            id: "p1",
            name: "CRM License (Pro)",
            description: "Professional tier license for CRM software",
            price: 49.99,
            sku: "CRM-PRO-001",
            category: "Software",
            createdAt: new Date("2024-10-01").toISOString(),
            updatedAt: new Date("2024-10-01").toISOString()
        },
        {
            id: "p2",
            name: "Implementation Service",
            description: "On-site implementation and training",
            price: 1500.00,
            sku: "SVC-IMP-001",
            category: "Service",
            createdAt: new Date("2024-10-01").toISOString(),
            updatedAt: new Date("2024-10-01").toISOString()
        }
    ];

    await db.products.bulkAdd(mockProducts);

    // Seed Company Links
    const mockLinks: CompanyLink[] = [
        {
            id: "link1",
            title: "Company Handbook",
            url: "https://docs.example.com/handbook",
            description: "Complete company policies, procedures, and guidelines for all employees.",
            category: "Documentation",
            tags: ["policies", "handbook", "guidelines"],
            createdBy: "u1",
            createdByName: "You",
            createdAt: new Date("2025-01-15").toISOString(),
            updatedAt: new Date("2025-01-15").toISOString(),
            accessCount: 45
        },
        {
            id: "link2",
            title: "Design System",
            url: "https://design.example.com",
            description: "UI/UX design system with components, colors, and typography guidelines.",
            category: "Tools",
            tags: ["design", "ui", "ux", "components"],
            createdBy: "u2",
            createdByName: "Snehasish",
            createdAt: new Date("2025-02-01").toISOString(),
            updatedAt: new Date("2025-02-01").toISOString(),
            accessCount: 32
        },
        {
            id: "link3",
            title: "Project Templates",
            url: "https://templates.example.com",
            description: "Standard templates for project proposals, reports, and documentation.",
            category: "Templates",
            tags: ["templates", "documents", "proposals"],
            createdBy: "u3",
            createdByName: "Team Lead",
            createdAt: new Date("2025-02-10").toISOString(),
            updatedAt: new Date("2025-02-10").toISOString(),
            accessCount: 28
        },
        {
            id: "link4",
            title: "Learning Resources",
            url: "https://learn.example.com",
            description: "Online courses, tutorials, and training materials for professional development.",
            category: "Resources",
            tags: ["learning", "training", "courses"],
            createdBy: "u1",
            createdByName: "You",
            createdAt: new Date("2025-03-01").toISOString(),
            updatedAt: new Date("2025-03-01").toISOString(),
            accessCount: 67
        },
        {
            id: "link5",
            title: "Remote Work Policy",
            url: "https://docs.example.com/remote-policy",
            description: "Guidelines and best practices for remote and hybrid work arrangements.",
            category: "Policies",
            tags: ["remote", "policy", "wfh"],
            createdBy: "u1",
            createdByName: "You",
            createdAt: new Date("2025-03-15").toISOString(),
            updatedAt: new Date("2025-03-15").toISOString(),
            accessCount: 54
        },
        {
            id: "link6",
            title: "GitHub Repository",
            url: "https://github.com/yourcompany/main-project",
            description: "Main codebase repository for the company's primary product.",
            category: "External",
            tags: ["github", "code", "repository"],
            createdBy: "u4",
            createdByName: "Backend Dev",
            createdAt: new Date("2025-04-01").toISOString(),
            updatedAt: new Date("2025-04-01").toISOString(),
            accessCount: 89
        }
    ];

    await db.companyLinks.bulkAdd(mockLinks);

    // Seed Billing Data
    const mockWallet: Wallet = {
        id: "u1",
        balance: 150.00,
        currency: "USD",
        updatedAt: new Date().toISOString()
    };
    await db.wallets.add(mockWallet);

    const mockPlans: SubscriptionPlan[] = [
        {
            id: "plan_basic",
            name: "Basic",
            description: "Essential features for small teams",
            price: 19.99,
            currency: "USD",
            interval: "monthly",
            features: ["Up to 5 Users", "Basic Task Management", "Email Support"],
            isActive: true
        },
        {
            id: "plan_pro",
            name: "Pro",
            description: "Advanced tools for growing businesses",
            price: 49.99,
            currency: "USD",
            interval: "monthly",
            features: ["Up to 20 Users", "Advanced Analytics", "Priority Support", "AI Features"],
            isPopular: true,
            isActive: true
        },
        {
            id: "plan_enterprise",
            name: "Enterprise",
            description: "Custom solutions for large organizations",
            price: 199.99,
            currency: "USD",
            interval: "monthly",
            features: ["Unlimited Users", "Dedicated Account Manager", "Custom Integrations", "SLA"],
            isActive: true
        }
    ];
    await db.subscriptionPlans.bulkAdd(mockPlans);

    const mockTransactions: Transaction[] = [
        {
            id: "txn1",
            walletId: "u1",
            amount: 200.00,
            type: "credit",
            category: "recharge",
            description: "Wallet Recharge",
            status: "success",
            date: new Date("2025-11-01").toISOString()
        },
        {
            id: "txn2",
            walletId: "u1",
            amount: 49.99,
            type: "debit",
            category: "subscription",
            description: "Pro Plan Subscription - Nov 2025",
            status: "success",
            date: new Date("2025-11-01").toISOString()
        }
    ];
    await db.transactions.bulkAdd(mockTransactions);
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

