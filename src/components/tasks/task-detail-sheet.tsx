import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Send, User as UserIcon, CheckCircle, Trash2, Edit2, Save, X, Folder, Users } from "lucide-react";
import { Task } from "@/types";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/db";
import { useToast } from "@/components/ui/use-toast";
import { useLiveQuery } from "dexie-react-hooks";

interface TaskDetailSheetProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onAddFollowUp: (taskId: string, content: string) => void;
    onDelete: (taskId: string) => void;
    onRestore?: (taskId: string) => void;
    onPermanentDelete?: (taskId: string) => void;
    onUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskDetailSheet({ task, isOpen, onClose, onAddFollowUp, onDelete, onRestore, onPermanentDelete, onUpdate }: TaskDetailSheetProps) {
    const [comment, setComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState<Partial<Task>>({});
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch data for editing
    const users = useLiveQuery(() => db.users.toArray()) || [];
    const projects = useLiveQuery(() => db.projects.toArray()) || [];
    const teams = useLiveQuery(() => db.teams.toArray()) || [];

    // Derived data for display
    const project = projects.find(p => p.id === task?.projectId);
    const team = teams.find(t => t.id === task?.teamId);

    useEffect(() => {
        if (task) {
            setEditedTask({
                title: task.title,
                description: task.description,
                priority: task.priority,
                dueDate: task.dueDate,
                assignedTo: task.assignedTo,
                projectId: task.projectId,
                teamId: task.teamId
            });
            setIsEditing(false);
        }
    }, [task]);

    if (!task) return null;

    const handleSubmit = async () => {
        if (!comment.trim()) return;
        onAddFollowUp(task.id, comment);

        // Log activity
        if (user) {
            await db.activityLogs.add({
                id: `log${Date.now()}`,
                userId: user.id,
                userName: user.name,
                action: "commented on",
                entityType: "task",
                entityId: task.id,
                entityName: task.title,
                details: comment.substring(0, 50) + (comment.length > 50 ? "..." : ""),
                createdAt: new Date().toISOString()
            });
        }

        setComment("");
    };

    const handleMarkCompleted = async () => {
        await db.tasks.update(task.id, { status: "completed" });

        // Log activity
        if (user) {
            await db.activityLogs.add({
                id: `log${Date.now()}`,
                userId: user.id,
                userName: user.name,
                action: "completed task",
                entityType: "task",
                entityId: task.id,
                entityName: task.title,
                createdAt: new Date().toISOString()
            });
        }

        toast({
            title: "Task Completed",
            description: "Task has been marked as completed.",
        });
        onClose();
    };

    const handleDelete = async () => {
        if (task.isDeleted && onPermanentDelete) {
            onPermanentDelete(task.id);
        } else {
            onDelete(task.id);
        }

        // Log activity
        if (user) {
            await db.activityLogs.add({
                id: `log${Date.now()}`,
                userId: user.id,
                userName: user.name,
                action: task.isDeleted ? "permanently deleted task" : "deleted task",
                entityType: "task",
                entityId: task.id,
                entityName: task.title,
                createdAt: new Date().toISOString()
            });
        }

        onClose();
    };

    const handleRestore = async () => {
        if (onRestore) {
            onRestore(task.id);

            // Log activity
            if (user) {
                await db.activityLogs.add({
                    id: `log${Date.now()}`,
                    userId: user.id,
                    userName: user.name,
                    action: "restored task",
                    entityType: "task",
                    entityId: task.id,
                    entityName: task.title,
                    createdAt: new Date().toISOString()
                });
            }

            onClose();
        }
    };

    const handleSave = () => {
        if (onUpdate && editedTask) {
            // If assignedTo changed, update assignedToName
            let updates = { ...editedTask };
            if (editedTask.assignedTo && editedTask.assignedTo !== task.assignedTo) {
                const assignedUser = users.find(u => u.id === editedTask.assignedTo);
                updates.assignedToName = assignedUser?.name || "Unknown";
            }

            onUpdate(task.id, updates);
            setIsEditing(false);
            toast({
                title: "Task Updated",
                description: "Task details have been updated successfully.",
            });
        }
    };

    const canEdit = user?.role === "Admin" || user?.role === "Manager" || user?.id === task.assignedTo;
    const canManage = user?.role === "Admin" || user?.role === "Manager";

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader className="mb-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1 mr-4">
                            {isEditing ? (
                                <Input
                                    value={editedTask.title}
                                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                    className="text-xl font-semibold"
                                />
                            ) : (
                                <SheetTitle className="text-xl">{task.title}</SheetTitle>
                            )}
                            <SheetDescription>Created {task.createdAt}</SheetDescription>
                        </div>
                        <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                            {task.status}
                        </Badge>
                    </div>
                </SheetHeader>

                {/* Read-Only Indicator */}
                {!canEdit && (
                    <div className="px-4 py-2 bg-muted/50 border-l-4 border-muted-foreground/30 rounded-sm">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Read-Only:</span> You can view this task but cannot make edits.
                        </p>
                    </div>
                )}

                <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
                    {/* Project & Team Info */}
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Folder className="w-4 h-4" />
                            <span>{project?.name || "No Project"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{team?.name || "No Team"}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UserIcon className="w-4 h-4" />
                            {isEditing && canManage ? (
                                <Select
                                    value={editedTask.assignedTo}
                                    onValueChange={(value) => setEditedTask({ ...editedTask, assignedTo: value })}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <span>Assignee: {task.assignedToName || "Unassigned"}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {isEditing ? (
                                <Input
                                    type="date"
                                    value={editedTask.dueDate}
                                    onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                                    className="h-8"
                                />
                            ) : (
                                <span>Due: {task.dueDate}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {isEditing ? (
                                <Select
                                    value={editedTask.priority}
                                    onValueChange={(value: any) => setEditedTask({ ...editedTask, priority: value })}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <span>Priority: {task.priority}</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Description</h3>
                            {!isEditing && canEdit && !task.isDeleted && (
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-6 px-2">
                                    <Edit2 className="w-3 h-3 mr-1" />
                                    Edit
                                </Button>
                            )}
                        </div>
                        {isEditing ? (
                            <Textarea
                                value={editedTask.description}
                                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                rows={4}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex gap-2">
                            <Button className="flex-1" onClick={handleSave}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                        <div className="flex gap-2">
                            {/* Completion Action - Available to Assignee and Managers */}
                            {!task.isDeleted && task.status !== "completed" && (canManage || user?.id === task.assignedTo) && (
                                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleMarkCompleted}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark as Completed
                                </Button>
                            )}

                            {/* Admin/Manager Only Actions */}
                            {canManage && (
                                <>
                                    {task.isDeleted && (
                                        <Button className="flex-1" variant="outline" onClick={handleRestore}>
                                            Restore Task
                                        </Button>
                                    )}

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="flex-1">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                {task.isDeleted ? "Delete Permanently" : "Delete Task"}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the task
                                                    "{task.title}" and remove it from our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="font-semibold text-sm mb-4">Follow-ups & Activity</h3>
                        <ScrollArea className="flex-1 pr-4 -mr-4">
                            <div className="space-y-4">
                                {task.followUps?.map((followUp) => {
                                    const isMe = followUp.author.id === user?.id;
                                    return (
                                        <div key={followUp.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-primary">
                                                    {followUp.author.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium">{followUp.author.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{followUp.createdAt}</span>
                                                </div>
                                                <div className={`p-3 rounded-lg text-sm ${isMe
                                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                                    : "bg-muted text-foreground rounded-tl-none"
                                                    }`}>
                                                    {followUp.content}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!task.followUps || task.followUps.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No follow-ups yet.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="pt-4 mt-auto border-t">
                        <div className="flex gap-2">
                            <Textarea
                                placeholder="Type your follow-up here..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="resize-none"
                                rows={2}
                            />
                            <Button size="icon" className="h-auto" onClick={handleSubmit}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
