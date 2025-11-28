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
