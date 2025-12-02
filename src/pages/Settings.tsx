import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/db";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useLiveQuery } from "dexie-react-hooks";
import { Save, Edit2, X } from "lucide-react";

export default function Settings() {
    const { user } = useAuth();
    const { toast } = useToast();
    const users = useLiveQuery(() => db.users.toArray()) || [];

    // Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState("");
    const [profileEmail, setProfileEmail] = useState("");

    // New Employee State
    const [newEmployeeName, setNewEmployeeName] = useState("");
    const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
    const [newEmployeeRole, setNewEmployeeRole] = useState("Employee");

    useEffect(() => {
        if (user) {
            setProfileName(user.name);
            setProfileEmail(user.email);
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        if (!user || !profileName || !profileEmail) return;

        await db.users.update(user.id, {
            name: profileName,
            email: profileEmail
        });

        // Log activity
        await db.activityLogs.add({
            id: `log${Date.now()}`,
            userId: user.id,
            userName: profileName, // Use new name
            action: "updated profile",
            entityType: "user",
            entityId: user.id,
            entityName: profileName,
            createdAt: new Date().toISOString()
        });

        setIsEditingProfile(false);
        toast({
            title: "Success",
            description: "Profile updated successfully",
        });
    };

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

        // Log activity
        if (user) {
            await db.activityLogs.add({
                id: `log${Date.now()}`,
                userId: user.id,
                userName: user.name,
                action: "added employee",
                entityType: "user",
                entityId: newUser.id,
                entityName: newUser.name,
                createdAt: new Date().toISOString()
            });
        }

        toast({
            title: "Success",
            description: "Employee added successfully",
        });

        setNewEmployeeName("");
        setNewEmployeeEmail("");
        setNewEmployeeRole("Employee");
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your profile and team settings</p>
            </div>

            {/* Profile Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>My Profile</CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </div>
                    {!isEditingProfile && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={isEditingProfile ? profileName : user?.name}
                                onChange={(e) => setProfileName(e.target.value)}
                                disabled={!isEditingProfile}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={isEditingProfile ? profileEmail : user?.email}
                                onChange={(e) => setProfileEmail(e.target.value)}
                                disabled={!isEditingProfile}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input value={user?.role} disabled className="bg-muted" />
                        </div>
                    </div>
                    {isEditingProfile && (
                        <div className="flex gap-2 justify-end mt-4">
                            <Button variant="outline" onClick={() => {
                                setIsEditingProfile(false);
                                if (user) {
                                    setProfileName(user.name);
                                    setProfileEmail(user.email);
                                }
                            }}>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateProfile}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Admin & HR Only: Employee Registration */}
            {(user?.role === "Admin" || user?.role === "HR") && (
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Registration</CardTitle>
                        <CardDescription>Add new members to your team</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    placeholder="John Doe"
                                    value={newEmployeeName}
                                    onChange={(e) => setNewEmployeeName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    placeholder="john@example.com"
                                    value={newEmployeeEmail}
                                    onChange={(e) => setNewEmployeeEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={newEmployeeRole} onValueChange={setNewEmployeeRole}>
                                    <SelectTrigger>
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
                        <Button onClick={handleAddEmployee}>Add Employee</Button>

                        <div className="mt-8">
                            <h4 className="text-sm font-medium mb-4">Current Team</h4>
                            <div className="border rounded-lg divide-y">
                                {users.map((u) => (
                                    <div key={u.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{u.name}</p>
                                            <p className="text-sm text-muted-foreground">{u.email}</p>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{u.role}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
