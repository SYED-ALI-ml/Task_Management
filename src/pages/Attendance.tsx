import { useState, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAuth } from "@/context/AuthContext";
import { AttendanceRecord, AttendanceStatus } from "@/types";
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
import { useToast } from "@/components/ui/use-toast";
import { Camera, Check, X, Clock, Video } from "lucide-react";
import { format } from "date-fns";

export function Attendance() {
    const { user } = useAuth();
    const { toast } = useToast();
    const isAdmin = user?.role === "Admin" || user?.role === "Manager";
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Fetch data
    const allAttendance = useLiveQuery(() => db.attendance.toArray()) || [];
    const myAttendance = allAttendance.filter(a => a.employeeId === user?.id);
    const todayAttendance = allAttendance.filter(
        a => a.date === format(new Date(), "yyyy-MM-dd")
    );
    const regularizationRequests = allAttendance.filter(
        a => a.regularizationRequested && a.regularizationStatus === "pending"
    );

    // Dialog states
    const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
    const [isRegularizationDialogOpen, setIsRegularizationDialogOpen] = useState(false);
    const [selectedAttendanceForRegularization, setSelectedAttendanceForRegularization] = useState<AttendanceRecord | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    // Form states
    const [regularizationReason, setRegularizationReason] = useState("");

    // Check if user already checked in today
    const todayRecord = myAttendance.find(a => a.date === format(new Date(), "yyyy-MM-dd"));
    const hasCheckedIn = todayRecord && todayRecord.checkIn;
    const hasCheckedOut = todayRecord && todayRecord.checkOut;

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
            }
        } catch (error) {
            toast({
                title: "Camera Error",
                description: "Unable to access camera. Please check permissions.",
                variant: "destructive",
            });
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setIsCameraActive(false);
        }
    };

    const captureImage = (): string => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext("2d");
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                return canvasRef.current.toDataURL("image/png");
            }
        }
        return "";
    };

    const handleCheckIn = async () => {
        if (!user) return;

        const now = new Date();
        const currentTime = format(now, "hh:mm a");
        const currentDate = format(now, "yyyy-MM-dd");

        // Simulate face recognition (capture image)
        const faceImage = isCameraActive ? captureImage() : "";

        // Determine status based on time (9 AM is on-time)
        const hour = now.getHours();
        const minute = now.getMinutes();
        const isLate = hour > 9 || (hour === 9 && minute > 15);

        const newRecord: AttendanceRecord = {
            id: `a${Date.now()}`,
            employeeId: user.id,
            employeeName: user.name,
            date: currentDate,
            checkIn: currentTime,
            status: isLate ? "late" : "present",
            faceImage,
        };

        await db.attendance.add(newRecord);

        toast({
            title: "Success",
            description: `Checked in at ${currentTime}`,
        });

        stopCamera();
        setIsCheckInDialogOpen(false);
    };

    const handleCheckOut = async () => {
        if (!todayRecord || !user) return;

        const currentTime = format(new Date(), "hh:mm a");

        // Calculate work hours
        const checkInTime = new Date(`2000-01-01 ${todayRecord.checkIn}`);
        const checkOutTime = new Date(`2000-01-01 ${currentTime}`);
        const workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

        await db.attendance.update(todayRecord.id, {
            checkOut: currentTime,
            workHours: Math.round(workHours * 10) / 10,
        });

        toast({
            title: "Success",
            description: `Checked out at ${currentTime}. Total work hours: ${Math.round(workHours * 10) / 10}`,
        });
    };

    const handleRequestRegularization = () => {
        if (!todayRecord) return;
        setSelectedAttendanceForRegularization(todayRecord);
        setIsRegularizationDialogOpen(true);
    };

    const handleSubmitRegularization = async () => {
        if (!selectedAttendanceForRegularization || !regularizationReason) {
            toast({
                title: "Error",
                description: "Please provide a reason for regularization",
                variant: "destructive",
            });
            return;
        }

        await db.attendance.update(selectedAttendanceForRegularization.id, {
            regularizationRequested: true,
            regularizationReason,
            regularizationStatus: "pending",
        });

        // Notify Admins and HRs
        const adminsAndHRs = await db.users
            .filter(u => u.role === "Admin" || u.role === "HR" || u.role === "Manager")
            .toArray();

        await Promise.all(adminsAndHRs.map(admin =>
            db.notifications.add({
                id: `n${Date.now()}-${admin.id}`,
                userId: admin.id,
                type: "attendance",
                priority: "medium",
                title: "Regularization Request",
                message: `${user?.name} has requested attendance regularization for ${selectedAttendanceForRegularization.date}.`,
                link: "/attendance",
                createdAt: new Date().toISOString(),
                isRead: false,
                metadata: { attendanceId: selectedAttendanceForRegularization.id }
            })
        ));

        toast({
            title: "Success",
            description: "Regularization request submitted",
        });

        setRegularizationReason("");
        setIsRegularizationDialogOpen(false);
        setSelectedAttendanceForRegularization(null);
    };

    const handleApproveRegularization = async (recordId: string) => {
        const record = await db.attendance.get(recordId);
        if (!record) return;

        await db.attendance.update(recordId, {
            regularizationStatus: "approved",
            status: "present",
        });

        // Create notification for employee
        await db.notifications.add({
            id: `n${Date.now()}`,
            userId: record.employeeId,
            type: "attendance",
            priority: "medium",
            title: "Attendance Regularization Approved",
            message: `Your attendance regularization request for ${record.date} has been approved. Status changed to Present.`,
            link: "/attendance",
            createdAt: new Date().toISOString(),
            isRead: false,
            metadata: { attendanceId: record.id }
        });

        toast({
            title: "Success",
            description: "Regularization approved",
        });
    };

    const handleRejectRegularization = async (recordId: string) => {
        const record = await db.attendance.get(recordId);
        if (!record) return;

        await db.attendance.update(recordId, {
            regularizationStatus: "rejected",
        });

        // Create notification for employee
        await db.notifications.add({
            id: `n${Date.now() + 1}`,
            userId: record.employeeId,
            type: "attendance",
            priority: "high",
            title: "Attendance Regularization Rejected",
            message: `Your attendance regularization request for ${record.date} has been rejected. Status remains as ${record.status}.`,
            link: "/attendance",
            createdAt: new Date().toISOString(),
            isRead: false,
            metadata: { attendanceId: record.id }
        });

        toast({
            title: "Success",
            description: "Regularization rejected",
        });
    };

    const getStatusColor = (status: AttendanceStatus) => {
        switch (status) {
            case "present": return "bg-success/10 text-success";
            case "absent": return "bg-destructive/10 text-destructive";
            case "late": return "bg-warning/10 text-warning";
            case "half-day": return "bg-blue-500/10 text-blue-500";
            case "work-from-home": return "bg-purple-500/10 text-purple-500";
            default: return "bg-muted text-muted-foreground";
        }
    };

    const renderAttendanceTable = (records: AttendanceRecord[], showActions = false) => (
        <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/20 grid grid-cols-6 gap-4 p-4 font-medium text-sm">
                <div>Employee</div>
                <div>Date</div>
                <div>Check In</div>
                <div>Check Out</div>
                <div>Status</div>
                {showActions && <div className="text-right">Actions</div>}
            </div>
            <div className="divide-y">
                {records.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No attendance records found
                    </div>
                ) : (
                    records.map((record) => (
                        <div key={record.id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-muted/10">
                            <div className="font-medium">{record.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{record.date}</div>
                            <div className="text-sm">{record.checkIn || "-"}</div>
                            <div className="text-sm">{record.checkOut || "-"}</div>
                            <div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                    {record.status.toUpperCase().replace("-", " ")}
                                </span>
                                {record.regularizationRequested && (
                                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                                        REG. {record.regularizationStatus?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {showActions && record.regularizationRequested && record.regularizationStatus === "pending" && (
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="bg-success hover:bg-success/90"
                                        onClick={() => handleApproveRegularization(record.id)}
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleRejectRegularization(record.id)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
                    <p className="text-muted-foreground">Track and manage employee attendance</p>
                </div>
                <div className="flex gap-3">
                    {!hasCheckedIn && (
                        <Button onClick={() => setIsCheckInDialogOpen(true)} className="bg-primary">
                            <Camera className="w-4 h-4 mr-2" />
                            Check In
                        </Button>
                    )}
                    {hasCheckedIn && !hasCheckedOut && (
                        <>
                            <Button onClick={handleCheckOut} className="bg-success">
                                <Check className="w-4 h-4 mr-2" />
                                Check Out
                            </Button>
                            {todayRecord?.status === "late" && !todayRecord.regularizationRequested && (
                                <Button onClick={handleRequestRegularization} variant="outline">
                                    Request Regularization
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Today's Status Card */}
            {todayRecord && (
                <Card className="mb-6 border-primary">
                    <CardHeader>
                        <CardTitle>Today's Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Check In</Label>
                                <p className="text-lg font-semibold">{todayRecord.checkIn || "-"}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Check Out</Label>
                                <p className="text-lg font-semibold">{todayRecord.checkOut || "-"}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(todayRecord.status)}`}>
                                    {todayRecord.status.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Work Hours</Label>
                                <p className="text-lg font-semibold">{todayRecord.workHours ? `${todayRecord.workHours}h` : "-"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="my-attendance" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="my-attendance">My Attendance</TabsTrigger>
                    {isAdmin && <TabsTrigger value="all-attendance">All Attendance</TabsTrigger>}
                    {isAdmin && <TabsTrigger value="regularization">Regularization Requests</TabsTrigger>}
                </TabsList>

                <TabsContent value="my-attendance">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Attendance History</CardTitle>
                            <CardDescription>Your complete attendance record</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderAttendanceTable(myAttendance)}
                        </CardContent>
                    </Card>
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="all-attendance">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Employee Attendance</CardTitle>
                                <CardDescription>Complete attendance overview</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {renderAttendanceTable(allAttendance)}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {isAdmin && (
                    <TabsContent value="regularization">
                        <Card>
                            <CardHeader>
                                <CardTitle>Regularization Requests</CardTitle>
                                <CardDescription>Attendance regularizations pending approval</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {regularizationRequests.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No pending regularization requests
                                        </div>
                                    ) : (
                                        regularizationRequests.map((record) => (
                                            <Card key={record.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold mb-2">{record.employeeName}</h4>
                                                            <div className="text-sm text-muted-foreground space-y-1">
                                                                <p><strong>Date:</strong> {record.date}</p>
                                                                <p><strong>Check In:</strong> {record.checkIn}</p>
                                                                <p><strong>Current Status:</strong> <span className={`px-2 py-0.5 rounded ${getStatusColor(record.status)}`}>{record.status}</span></p>
                                                                <p><strong>Reason:</strong> {record.regularizationReason}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="bg-success hover:bg-success/90"
                                                                onClick={() => handleApproveRegularization(record.id)}
                                                            >
                                                                <Check className="w-4 h-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleRejectRegularization(record.id)}
                                                            >
                                                                <X className="w-4 h-4 mr-1" />
                                                                Reject
                                                            </Button>
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
                )}
            </Tabs>

            {/* Check-In Dialog with Face Recognition */}
            <Dialog open={isCheckInDialogOpen} onOpenChange={(open) => {
                setIsCheckInDialogOpen(open);
                if (!open) stopCamera();
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Check In</DialogTitle>
                        <DialogDescription>
                            Capture your face for attendance verification
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col items-center gap-4">
                            {!isCameraActive ? (
                                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                                    <Button onClick={startCamera} size="lg">
                                        <Video className="w-5 h-5 mr-2" />
                                        Start Camera
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative w-full">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-64 bg-black rounded-lg object-cover"
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground text-center">
                                Position your face in the center of the frame
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            stopCamera();
                            setIsCheckInDialogOpen(false);
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCheckIn} disabled={!isCameraActive}>
                            <Check className="w-4 h-4 mr-2" />
                            Check In
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Regularization Request Dialog */}
            <Dialog open={isRegularizationDialogOpen} onOpenChange={setIsRegularizationDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Request Regularization</DialogTitle>
                        <DialogDescription>
                            Provide a reason for attendance regularization
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="regularization-reason">Reason</Label>
                            <Textarea
                                id="regularization-reason"
                                placeholder="Please explain why you were late..."
                                value={regularizationReason}
                                onChange={(e) => setRegularizationReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRegularizationDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitRegularization}>Submit Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
