import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useState } from "react";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DirectoryView() {
    const users = useLiveQuery(() => db.users.toArray()) || [];
    const { toast } = useToast();
    const { user } = useAuth();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<User | null>(null);

    // New Employee State
    const [newEmployeeName, setNewEmployeeName] = useState("");
    const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
    const [newEmployeeRole, setNewEmployeeRole] = useState("Employee");

    const handleAddEmployee = async () => {
        if (!newEmployeeName || !newEmployeeEmail) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        const newUser: User = {
            id: `u${Date.now()}`,
            name: newEmployeeName,
            email: newEmployeeEmail,
            role: newEmployeeRole,
        };

        await db.users.add(newUser);

        toast({
            title: "Success",
            description: "Member added successfully",
        });

        // Reset form and close dialog
        setNewEmployeeName("");
        setNewEmployeeEmail("");
        setNewEmployeeRole("Employee");
        setIsDialogOpen(false);
    };

    const handleDeleteClick = (member: User) => {
        // Prevent deleting yourself
        if (member.id === user?.id) {
            toast({
                title: "Error",
                description: "You cannot delete your own account",
                variant: "destructive",
            });
            return;
        }
        setMemberToDelete(member);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!memberToDelete) return;

        try {
            await db.users.delete(memberToDelete.id);

            toast({
                title: "Success",
                description: `${memberToDelete.name} has been removed from the team`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete member",
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setMemberToDelete(null);
        }
    };

    const canManageMembers = user?.role === "Admin" || user?.role === "HR";

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Directory</h1>
                    <p className="text-muted-foreground">Manage your team and contacts</p>
                </div>
                {canManageMembers && (
                    <Button
                        className="bg-primary text-primary-foreground"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                    </Button>
                )}
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-5 gap-4 p-4 border-b border-border bg-muted/20 font-medium">
                    <div>Name</div>
                    <div>Role</div>
                    <div>Email</div>
                    <div>Status</div>
                    {canManageMembers && <div className="text-right">Actions</div>}
                </div>
                <div className="divide-y divide-border">
                    {users.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No members found.</div>
                    ) : (
                        users.map((member) => (
                            <div key={member.id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {member.name.charAt(0)}
                                    </div>
                                    <span className="font-medium">{member.name}</span>
                                </div>
                                <div className="text-muted-foreground">{member.role}</div>
                                <div className="text-muted-foreground">{member.email}</div>
                                <div>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                                        Active
                                    </span>
                                </div>
                                {canManageMembers && (
                                    <div className="flex justify-end">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteClick(member)}
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Member Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Member</DialogTitle>
                        <DialogDescription>
                            Add a new member to your team directory
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={newEmployeeName}
                                onChange={(e) => setNewEmployeeName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={newEmployeeEmail}
                                onChange={(e) => setNewEmployeeEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={newEmployeeRole} onValueChange={setNewEmployeeRole}>
                                <SelectTrigger id="role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="HR">HR</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Developer">Developer</SelectItem>
                                    <SelectItem value="Designer">Designer</SelectItem>
                                    <SelectItem value="Employee">Employee</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddEmployee}>Add Member</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{memberToDelete?.name}</strong> from your team directory.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
