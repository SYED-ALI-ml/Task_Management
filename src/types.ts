export interface User {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    email: string;
}

export interface FollowUp {
    id: string;
    content: string;
    author: User;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: "pending" | "in-progress" | "completed" | "overdue";
    priority: "low" | "medium" | "high" | "urgent";
    assignee: string; // Keeping as string for now to match existing, could be User["id"] later
    dueDate: string;
    createdAt: string;
    followUps: FollowUp[];
    isDeleted?: boolean;
}
