import { useState } from "react";
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

export default function Settings() {
    const { user } = useAuth();
    const { toast } = useToast();
    const users = useLiveQuery(() => db.users.toArray()) || [];

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
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={user?.name} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={user?.email} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input value={user?.role} disabled />
                        </div>
                    </div>
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
