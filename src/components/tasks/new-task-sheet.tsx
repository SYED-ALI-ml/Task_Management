import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface NewTaskSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (task: any) => void;
}

export function NewTaskSheet({ isOpen, onClose, onCreate }: NewTaskSheetProps) {
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch data
    const users = useLiveQuery(() => db.users.toArray()) || [];
    const projects = useLiveQuery(() => db.projects.toArray()) || [];
    const teams = useLiveQuery(() => db.teams.toArray()) || [];

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [assignedTo, setAssignedTo] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [projectId, setProjectId] = useState("");
    const [teamId, setTeamId] = useState("");

    // Filter teams based on project assignment
    const selectedProjectData = projects.find(p => p.id === projectId);
    const filteredTeams = teams.filter(t => selectedProjectData?.teams?.includes(t.id));

    // Get members of selected team
    const selectedTeamData = teams.find(t => t.id === teamId);
    const teamMemberIds = selectedTeamData ? selectedTeamData.members : [];

    // Filter users to only show team members + team lead
    const filteredUsers = users.filter(u => {
        if (!teamId) return false;
        return teamMemberIds.includes(u.id) || (selectedTeamData && u.id === selectedTeamData.leadId);
    });

    // Reset dependent fields when parent selection changes
    useEffect(() => {
        setTeamId("");
        setAssignedTo("");
    }, [projectId]);

    useEffect(() => {
        setAssignedTo("");
    }, [teamId]);

    const handleSubmit = () => {
        if (!title || !projectId || !teamId || !assignedTo || !dueDate) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        const assignedUser = users.find(u => u.id === assignedTo);

        onCreate({
            title,
            description,
            priority,
            projectId,
            teamId,
            assignedTo,
            assignedToName: assignedUser?.name || "Unknown",
            dueDate,
            status: "pending",
            createdBy: user?.id
        });

        // Reset form
        setTitle("");
        setDescription("");
        setPriority("medium");
        setProjectId("");
        setTeamId("");
        setAssignedTo("");
        setDueDate("");
        onClose();
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Create New Task</SheetTitle>
                    <SheetDescription>Add a new task to a project team.</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Task description" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="project">Project *</Label>
                            <Select value={projectId} onValueChange={setProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="team">Team *</Label>
                            <Select value={teamId} onValueChange={setTeamId} disabled={!projectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredTeams.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Due Date *</Label>
                            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="assignee">Assignee *</Label>
                        <Select value={assignedTo} onValueChange={setAssignedTo} disabled={!teamId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredUsers.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.name} ({u.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!teamId && <p className="text-xs text-muted-foreground">Select a team first</p>}
                    </div>
                </div>
                <SheetFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Create Task</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
