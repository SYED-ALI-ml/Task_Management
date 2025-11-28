import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useNavigate } from "react-router-dom";

export function DirectoryView() {
    const users = useLiveQuery(() => db.users.toArray()) || [];
    const navigate = useNavigate();

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Directory</h1>
                    <p className="text-muted-foreground">Manage your team and contacts</p>
                </div>
                <Button
                    className="bg-primary text-primary-foreground"
                    onClick={() => navigate("/?tab=settings")} // Simple redirection to settings where add member exists
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                </Button>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-4 border-b border-border bg-muted/20 font-medium">
                    <div>Name</div>
                    <div>Role</div>
                    <div>Email</div>
                    <div>Status</div>
                </div>
                <div className="divide-y divide-border">
                    {users.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No members found.</div>
                    ) : (
                        users.map((member) => (
                            <div key={member.id} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-muted/10">
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
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
