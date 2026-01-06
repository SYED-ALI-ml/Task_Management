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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, fetchProjects, fetchTeams, fetchTaskComments, createTaskComment, createActivityLog } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

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
    const queryClient = useQueryClient();

    // Fetch data for editing
    const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
    const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
    const { data: teams = [] } = useQuery({ queryKey: ['teams'], queryFn: fetchTeams });

    // Fetch comments
    const { data: comments = [], refetch: refetchComments } = useQuery({
        queryKey: ['comments', task?.id],
        queryFn: () => task ? fetchTaskComments(task.id) : Promise.resolve([])
    });

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

        try {
            await createTaskComment(task.id, user?.id || 'unknown', comment);
            refetchComments();
            setComment("");
        } catch (error) {
            console.error("Failed to post comment", error);
        }
    };

    const handleMarkCompleted = async () => {
        // await db.tasks.update(task.id, { status: "completed" });
        if (onUpdate) onUpdate(task.id, { status: "completed" }); // Use prop handler which calls API

        // Log activity placeholder
        console.log("Activity log pending API");

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

        // Log activity placeholder
        console.log("Activity log pending API");

        onClose();
    };

    const handleRestore = async () => {
        if (onRestore) {
            onRestore(task.id);

            // Log activity placeholder
            console.log("Activity log pending API");

            onClose();
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!onUpdate || !editedTask) return;

        // Ensure assignedTo is set to a valid value (or null if unassigned)
        let updates: Partial<Task> = {
            ...editedTask,
            assignedTo: editedTask.assignedTo === "unassigned" ? null : editedTask.assignedTo
        };

        // If assignedTo changed, update assignedToName
        if (editedTask.assignedTo && editedTask.assignedTo !== task.assignedTo) {
            const assignedUser = users.find(u => u.id === editedTask.assignedTo);
            updates.assignedToName = assignedUser?.name || "Unassigned";
        } else if (editedTask.assignedTo === null && task.assignedTo !== null) {
            // If assignedTo was changed to null (unassigned)
            updates.assignedToName = "Unassigned";
        }

        try {
            await onUpdate(task.id, updates);

            // Log activity
            if (user) {
                await createActivityLog({
                    entityType: "task",
                    entityId: task.id,
                    entityName: editedTask.title || task.title, // Use edited title if available, else current task title
                    action: "updated",
                    userId: user.id,
                    userName: user.name,
                    details: "Task details updated"
                });
            }

            setIsEditing(false);

            toast({
                title: "Task Updated",
                description: "Task details have been updated successfully.",
            });

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update task.",
                variant: "destructive"
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
                            {/* Accessibility: DialogTitle must always be present */}
                            <SheetTitle className={`${isEditing ? 'sr-only' : 'text-xl'}`}>
                                {task.title}
                            </SheetTitle>

                            {isEditing ? (
                                <Input
                                    value={editedTask.title || ""}
                                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                    className="text-xl font-semibold"
                                />
                            ) : null}
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
                                    value={editedTask.assignedTo || ""}
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
                                    value={editedTask.dueDate || ""}
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
                                    value={editedTask.priority || ""}
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
                                value={editedTask.description || ""}
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
                                {comments.map((followUp: any) => {
                                    const isMe = followUp.user_id === user?.id;
                                    return (
                                        <div key={followUp.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-primary">
                                                    {(followUp.user_name || "U").charAt(0)}
                                                </span>
                                            </div>
                                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium">{followUp.user_name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{new Date(followUp.created_at).toLocaleString()}</span>
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
                                {comments.length === 0 && (
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
