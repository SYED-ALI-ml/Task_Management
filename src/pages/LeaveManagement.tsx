import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAuth } from "@/context/AuthContext";
import { LeaveRequest, LeaveType, LeaveStatus, Holiday } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Check, X, Clock, Plus } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

export function LeaveManagement() {
    const { user } = useAuth();
    const { toast } = useToast();

    // HR/Admin can only approve/reject, not apply
    const isHROrAdmin = user?.role === "Admin" || user?.role === "Manager" || user?.role === "HR";
    const isEmployee = !isHROrAdmin;

    // Fetch data
    const allLeaves = useLiveQuery(() => db.leaves.toArray()) || [];
    const holidays = useLiveQuery(() => db.holidays.toArray()) || [];

    const myLeaves = allLeaves.filter(l => l.employeeId === user?.id);
    const pendingApprovals = allLeaves.filter(l => l.status === "pending");

    // Dialog states
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);

    // Form states
    const [leaveType, setLeaveType] = useState<LeaveType>("casual");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");

    // Holiday form states
    const [holidayName, setHolidayName] = useState("");
    const [holidayDate, setHolidayDate] = useState("");
    const [holidayType, setHolidayType] = useState<"public" | "company">("public");

    const handleApplyLeave = async () => {
        if (!startDate || !endDate || !reason || !user) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        const days = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;

        if (days <= 0) {
            toast({
                title: "Error",
                description: "End date must be after start date",
                variant: "destructive",
            });
            return;
        }

        const newLeave: LeaveRequest = {
            id: `l${Date.now()}`,
            employeeId: user.id,
            employeeName: user.name,
            leaveType,
            startDate,
            endDate,
            days,
            reason,
            status: "pending",
            appliedOn: format(new Date(), "yyyy-MM-dd"),
        };

        await db.leaves.add(newLeave);

        // Notify Admins and HRs
        const adminsAndHRs = await db.users
            .filter(u => u.role === "Admin" || u.role === "HR" || u.role === "Manager")
            .toArray();

        await Promise.all(adminsAndHRs.map(admin =>
            db.notifications.add({
                id: `n${Date.now()}-${admin.id}`,
                userId: admin.id,
                type: "leave",
                priority: "medium",
                title: "New Leave Request",
                message: `${user.name} has applied for ${days} day(s) of ${leaveType} leave.`,
                link: "/leave-management",
                createdAt: new Date().toISOString(),
                isRead: false,
                metadata: { leaveId: newLeave.id }
            })
        ));

        toast({
            title: "Success",
            description: "Leave request submitted successfully",
        });

        // Reset form
        setLeaveType("casual");
        setStartDate("");
        setEndDate("");
        setReason("");
        setIsApplyDialogOpen(false);
    };

    const handleApprove = async (leaveId: string) => {
        const leave = await db.leaves.get(leaveId);
        if (!leave) return;

        await db.leaves.update(leaveId, {
            status: "approved",
            approvedBy: user?.name,
            approvedOn: format(new Date(), "yyyy-MM-dd"),
        });

        // Create notification for employee
        await db.notifications.add({
            id: `n${Date.now()}`,
            userId: leave.employeeId,
            type: "leave",
            priority: "medium",
            title: "Leave Request Approved",
            message: `Your ${leave.leaveType} leave from ${leave.startDate} to ${leave.endDate} has been approved by ${user?.name}.`,
            link: "/leave-management",
            createdAt: new Date().toISOString(),
            isRead: false,
            metadata: { leaveId: leave.id }
        });

        toast({
            title: "Success",
            description: "Leave request approved",
        });
    };

    const handleReject = async (leaveId: string, rejectionReason: string = "Not specified") => {
        const leave = await db.leaves.get(leaveId);
        if (!leave) return;

        await db.leaves.update(leaveId, {
            status: "rejected",
            approvedBy: user?.name,
            approvedOn: format(new Date(), "yyyy-MM-dd"),
            rejectionReason,
        });

        // Create notification for employee
        await db.notifications.add({
            id: `n${Date.now() + 1}`,
            userId: leave.employeeId,
            type: "leave",
            priority: "high",
            title: "Leave Request Rejected",
            message: `Your ${leave.leaveType} leave from ${leave.startDate} to ${leave.endDate} was not approved. Reason: ${rejectionReason}`,
            link: "/leave-management",
            createdAt: new Date().toISOString(),
            isRead: false,
            metadata: { leaveId: leave.id }
        });

        toast({
            title: "Success",
            description: "Leave request rejected",
        });
    };

    const handleAddHoliday = async () => {
        if (!holidayName || !holidayDate) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        const newHoliday: Holiday = {
            id: `h${Date.now()}`,
            name: holidayName,
            date: holidayDate,
            type: holidayType,
        };

        await db.holidays.add(newHoliday);

        toast({
            title: "Success",
            description: "Holiday added successfully",
        });

        setHolidayName("");
        setHolidayDate("");
        setHolidayType("public");
        setIsHolidayDialogOpen(false);
    };

    const getStatusColor = (status: LeaveStatus) => {
        switch (status) {
            case "approved": return "bg-success/10 text-success";
            case "rejected": return "bg-destructive/10 text-destructive";
            case "pending": return "bg-warning/10 text-warning";
            default: return "bg-muted text-muted-foreground";
        }
    };

    const renderLeaveList = (leaves: LeaveRequest[], showActions = false) => (
        <div className="space-y-4">
            {leaves.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No leave requests found
                </div>
            ) : (
                leaves.map((leave) => (
                    <Card key={leave.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold">{leave.employeeName}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                                            {leave.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p><strong>Type:</strong> {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}</p>
                                        <p><strong>Duration:</strong> {leave.startDate} to {leave.endDate} ({leave.days} days)</p>
                                        <p><strong>Reason:</strong> {leave.reason}</p>
                                        <p><strong>Applied On:</strong> {leave.appliedOn}</p>
                                        {leave.approvedBy && (
                                            <p><strong>Reviewed By:</strong> {leave.approvedBy} on {leave.approvedOn}</p>
                                        )}
                                        {leave.rejectionReason && (
                                            <p className="text-destructive"><strong>Rejection Reason:</strong> {leave.rejectionReason}</p>
                                        )}
                                    </div>
                                </div>
                                {showActions && leave.status === "pending" && (
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="bg-success hover:bg-success/90"
                                            onClick={() => handleApprove(leave.id)}
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleReject(leave.id)}
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );

    // HR/Admin Layout - Only Approvals and Holiday Management
    if (isHROrAdmin) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
                        <p className="text-muted-foreground">Review and manage employee leave requests</p>
                    </div>
                </div>

                <Tabs defaultValue="pending-approvals" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending-approvals">Pending Approvals</TabsTrigger>
                        <TabsTrigger value="all-leaves">All Leaves</TabsTrigger>
                        <TabsTrigger value="holidays">Holiday Calendar</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending-approvals">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Leave Approvals</CardTitle>
                                <CardDescription>Review and approve/reject employee leave requests</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {renderLeaveList(pendingApprovals, true)}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="all-leaves">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Leave Requests</CardTitle>
                                <CardDescription>Complete overview of all employee leaves</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {renderLeaveList(allLeaves)}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="holidays">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Holiday Calendar</CardTitle>
                                        <CardDescription>Manage company holidays and public holidays</CardDescription>
                                    </div>
                                    <Button onClick={() => setIsHolidayDialogOpen(true)} size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Holiday
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {holidays.length === 0 ? (
                                        <div className="col-span-full text-center py-8 text-muted-foreground">
                                            No holidays added yet
                                        </div>
                                    ) : (
                                        holidays.map((holiday) => (
                                            <Card key={holiday.id} className="border-2">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold">{holiday.name}</h4>
                                                            <p className="text-sm text-muted-foreground">{holiday.date}</p>
                                                            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${holiday.type === "public"
                                                                ? "bg-primary/10 text-primary"
                                                                : "bg-secondary/10 text-secondary"
                                                                }`}>
                                                                {holiday.type === "public" ? "Public Holiday" : "Company Holiday"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Add Holiday Dialog */}
                <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Add Holiday</DialogTitle>
                            <DialogDescription>
                                Add a new holiday to the calendar
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="holiday-name">Holiday Name</Label>
                                <Input
                                    id="holiday-name"
                                    placeholder="e.g., Diwali"
                                    value={holidayName}
                                    onChange={(e) => setHolidayName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="holiday-date">Date</Label>
                                <Input
                                    id="holiday-date"
                                    type="date"
                                    value={holidayDate}
                                    onChange={(e) => setHolidayDate(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="holiday-type">Type</Label>
                                <Select value={holidayType} onValueChange={(value) => setHolidayType(value as "public" | "company")}>
                                    <SelectTrigger id="holiday-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public Holiday</SelectItem>
                                        <SelectItem value="company">Company Holiday</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsHolidayDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddHoliday}>Add Holiday</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    // Employee Layout - Apply for Leaves and View History
    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
                    <p className="text-muted-foreground">Apply for leaves and view your leave history</p>
                </div>
                <Button onClick={() => setIsApplyDialogOpen(true)} className="bg-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Apply Leave
                </Button>
            </div>

            <Tabs defaultValue="my-leaves" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="my-leaves">My Leaves</TabsTrigger>
                    <TabsTrigger value="holidays">Holiday Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value="my-leaves">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Leave Requests</CardTitle>
                            <CardDescription>View your leave application history and status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderLeaveList(myLeaves)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="holidays">
                    <Card>
                        <CardHeader>
                            <CardTitle>Holiday Calendar</CardTitle>
                            <CardDescription>View company holidays and public holidays</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {holidays.length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-muted-foreground">
                                        No holidays added yet
                                    </div>
                                ) : (
                                    holidays.map((holiday) => (
                                        <Card key={holiday.id} className="border-2">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{holiday.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{holiday.date}</p>
                                                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${holiday.type === "public"
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-secondary/10 text-secondary"
                                                            }`}>
                                                            {holiday.type === "public" ? "Public Holiday" : "Company Holiday"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Apply Leave Dialog */}
            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Apply for Leave</DialogTitle>
                        <DialogDescription>
                            Submit a new leave request
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="leave-type">Leave Type</Label>
                            <Select value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveType)}>
                                <SelectTrigger id="leave-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="casual">Casual Leave</SelectItem>
                                    <SelectItem value="sick">Sick Leave</SelectItem>
                                    <SelectItem value="annual">Annual Leave</SelectItem>
                                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                                    <SelectItem value="maternity">Maternity Leave</SelectItem>
                                    <SelectItem value="paternity">Paternity Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start-date">Start Date</Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end-date">End Date</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Please provide a reason for your leave..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleApplyLeave}>Submit Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
