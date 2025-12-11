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

// Project and Team Types
export interface Team {
    id: string;
    name: string;
    projectId?: string; // Optional: A team might work on multiple projects, or be assigned later
    members: string[]; // Array of user IDs
    leadId: string; // Team lead user ID
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    createdBy: string; // User ID
    createdAt: string;
    updatedAt: string;
    teams: string[]; // Array of team IDs
    status: "active" | "on-hold" | "completed" | "archived";
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: "pending" | "in-progress" | "completed" | "overdue";
    priority: "low" | "medium" | "high" | "urgent";
    projectId: string; // Tasks belong to projects
    teamId: string; // Tasks belong to teams
    assignedTo: string; // User ID (single member)
    assignedToName?: string; // For display purposes
    createdBy: string; // User ID who created the task
    dueDate: string;
    createdAt: string;
    followUps: FollowUp[];
    isDeleted?: boolean;
}

// Leave Management Types
export type LeaveType = "sick" | "casual" | "annual" | "unpaid" | "maternity" | "paternity";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: LeaveStatus;
    appliedOn: string;
    approvedBy?: string;
    approvedOn?: string;
    rejectionReason?: string;
}

export interface Holiday {
    id: string;
    name: string;
    date: string;
    type: "public" | "company";
}

// Attendance Types
export type AttendanceStatus = "present" | "absent" | "half-day" | "late" | "work-from-home";

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: AttendanceStatus;
    workHours?: number;
    location?: string;
    faceImage?: string; // Base64 or URL for face recognition
    regularizationRequested?: boolean;
    regularizationReason?: string;
    regularizationStatus?: "pending" | "approved" | "rejected";
}

// Notification Types
export type NotificationType = "leave" | "attendance" | "task" | "system";
export type NotificationPriority = "low" | "medium" | "high";

export interface Notification {
    id: string;
    userId: string; // Who should receive this notification
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    link?: string; // Optional link to navigate to
    createdAt: string;
    isRead: boolean;
    metadata?: any; // Additional data (e.g., leaveId, taskId)
}

// Idea Board Types
export type IdeaCategory = "product" | "process" | "marketing" | "technology" | "customer-experience" | "other";
export type IdeaStatus = "draft" | "submitted" | "under-review" | "approved" | "implemented" | "rejected";

export interface IdeaComment {
    id: string;
    ideaId: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
}


export interface Idea {
    id: string;
    title: string;
    description: string;
    category: IdeaCategory;
    status: IdeaStatus;
    createdBy: string; // User ID
    createdByName: string; // User Name
    createdAt: string;
    updatedAt: string;
    sharedWith: string[]; // Array of user IDs
    isPublic: boolean; // If true, visible to all
    likes: string[]; // Array of user IDs who liked
    comments: IdeaComment[];
    tags?: string[];
}

// Links Management Types
export type LinkCategory = "Documentation" | "Tools" | "Resources" | "Templates" | "Policies" | "External" | "Other";

export interface CompanyLink {
    id: string;
    title: string;
    url: string;
    description: string;
    category: LinkCategory;
    tags: string[];
    createdBy: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
    accessCount: number; // Track how many times link was clicked
    isFavorite?: boolean; // For user-specific favorites
}

// Support/Help Types
export type SupportPriority = "low" | "medium" | "high" | "urgent";
export type SupportStatus = "open" | "in-progress" | "resolved" | "closed";

export interface SupportTicket {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: SupportPriority;
    status: SupportStatus;
    createdBy: string;
    createdByName: string;
    assignedTo?: string;
    assignedToName?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    responses: SupportResponse[];
}

export interface SupportResponse {
    id: string;
    ticketId: string;
    message: string;
    createdBy: string;
    createdByName: string;
    createdAt: string;
    isAdminResponse: boolean;
}


export interface ActivityLog {
    id: string;
    userId: string;
    userName: string;
    action: string; // e.g., "created task", "deleted project"
    entityType: "task" | "project" | "team" | "user" | "idea" | "link" | "support";
    entityId: string;
    entityName: string;
    details?: string;
    createdAt: string;
}

// CRM Types
export interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
    source: string;
    assignedTo: string; // User ID
    createdAt: string;
    updatedAt: string;
}

export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyId: string;
    role: string;
    // New fields
    social?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
    };
    notes?: string;
    tags?: string[];
    source?: string;
    dob?: string;

    createdAt: string;
    updatedAt: string;
}

export interface Company {
    id: string;
    name: string;
    industry: string;
    website: string;
    phone: string;
    address: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    sku: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

export interface Quotation {
    id: string;
    customerId: string; // Contact ID or Company ID
    items: { productId: string; quantity: number; price: number }[];
    totalAmount: number;
    status: "draft" | "sent" | "accepted" | "rejected";
    validUntil: string;
    createdAt: string;
    updatedAt: string;
}

export interface Activity {
    id: string;
    relatedToId: string; // Lead, Contact, Company, or Deal ID
    type: "call" | "email" | "meeting" | "note" | "task";
    subject: string;
    description: string;
    date: string;
    duration?: number; // in minutes
    createdBy: string;
    createdAt: string;
}

// Billing & AI Usage Types
export interface Wallet {
    id: string; // usually userId
    balance: number;
    currency: string;
    updatedAt: string;
}

export interface Transaction {
    id: string;
    walletId: string;
    amount: number;
    type: "credit" | "debit";
    category: "recharge" | "subscription" | "ai-usage" | "refund" | "other";
    description: string;
    status: "success" | "pending" | "failed";
    date: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: "monthly" | "yearly";
    features: string[];
    isPopular?: boolean;
    isActive: boolean; // If false, new users can't subscribe
}

export interface AIUsageLog {
    id: string;
    userId: string;
    feature: string; // e.g., "text-generation", "image-generation"
    model: string; // e.g., "gpt-4", "dall-e-3"
    tokensUsed: number;
    cost: number;
    timestamp: string;
}
