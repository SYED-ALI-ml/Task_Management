# 🚀 Recent Updates & Changelog

## 📅 Version 1.2 - HR & Notifications Update

### 1. 🔔 Advanced Notification System
A fully functional, bidirectional notification system has been implemented to keep the team connected.

**Features:**
*   **Notification Center**: A new bell icon in the header shows unread count and a dropdown of recent alerts.
*   **Real-time Alerts**:
    *   **For Admins/HR**: Receive instant alerts when employees apply for leave or request attendance regularization.
    *   **For Employees**: Receive alerts when your leave/attendance requests are Approved or Rejected.
    *   **Task Assignments**: Get notified immediately when a new task is assigned to you.
*   **Smart Actions**: Notifications include "Mark as Read" and "Delete" options.

### 2. 👥 Role-Based Leave Management
The Leave Management module has been completely restructured to provide role-specific interfaces.

**For HR/Admins:**
*   **Focused Workflow**: Default view is now "Pending Approvals".
*   **Management Only**: The "Apply Leave" button has been removed (Admins manage, don't apply).
*   **Full Access**: Can view all leaves, approve/reject requests, and manage holidays.

**For Employees:**
*   **Self-Service**: Default view is "My Leaves".
*   **Privacy**: Can only view their own leave history.
*   **Simplified UI**: No access to approval buttons or holiday management.

### 3. 🛡️ Member Management Security
Strict access controls have been enforced for adding and removing team members.

**Changes:**
*   **Restricted Access**: Only users with **Admin** or **HR** roles can:
    *   Add new members via the Directory.
    *   Add new members via Settings.
    *   Remove members from the team.
*   **UI Updates**: "Add Member" and "Delete" buttons are completely hidden for regular employees.
*   **New Role**: Added explicit **"HR"** role support in the member creation dropdowns.

---

## 🛠️ Technical Implementation Details

### Database Schema (`db.ts`)
*   Added `notifications` table: `id, userId, isRead, createdAt, type`.
*   Added `Notification` type definition.

### Components Created/Modified
*   **`src/components/layout/notification-center.tsx`**: New component for managing and displaying notifications.
*   **`src/components/layout/header.tsx`**: Integrated NotificationCenter.
*   **`src/components/dashboard/directory-view.tsx`**: Added role checks (`canManageMembers`) to hide/show buttons.
*   **`src/pages/LeaveManagement.tsx`**:
    *   Added conditional rendering for Admin vs Employee layouts.
    *   Added notification triggers on Apply, Approve, and Reject actions.
*   **`src/pages/Attendance.tsx`**: Added notification triggers for Regularization requests and approvals.
*   **`src/pages/Index.tsx`**: Added notification trigger for Task Creation.
*   **`src/pages/Settings.tsx`**: Updated permissions to include "HR" role.

---

## 📋 Permissions Matrix

| Feature | Admin | HR | Manager | Employee |
|---------|:-----:|:--:|:-------:|:--------:|
| **Apply for Leave** | ❌ | ❌ | ❌ | ✅ |
| **Approve Leaves** | ✅ | ✅ | ✅ | ❌ |
| **Add/Remove Members** | ✅ | ✅ | ❌ | ❌ |
| **Receive Request Alerts**| ✅ | ✅ | ✅ | ❌ |
| **Receive Task Alerts** | ✅ | ✅ | ✅ | ✅ |

---

*Last Updated: November 28, 2025*
