import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, seedDatabase } from "@/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Login() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const users = useLiveQuery(() => db.users.toArray()) || [];
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    useEffect(() => {
        // Ensure DB is seeded so we have users to log in as
        seedDatabase();
    }, []);

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        if (selectedUserId) {
            await login(selectedUserId);
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome to TaskHub</CardTitle>
                    <CardDescription>Select your account to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select User</label>
                        <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose an account..." />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.name} ({u.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleLogin}
                        disabled={!selectedUserId}
                    >
                        Login
                    </Button>

                    <div className="text-xs text-center text-muted-foreground mt-4">
                        <p>Note: This is a local demo. No password required.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
