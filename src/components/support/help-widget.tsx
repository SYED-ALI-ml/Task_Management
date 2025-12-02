import { useState } from "react";
import { db } from "@/db";
import { useAuth } from "@/context/AuthContext";
import { SupportTicket, SupportPriority } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { HelpCircle, Send } from "lucide-react";

export function HelpWidget() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Technical");
    const [priority, setPriority] = useState<SupportPriority>("medium");

    const categories = ["Technical", "Account", "Feature Request", "Bug Report", "General", "Other"];

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("Technical");
        setPriority("medium");
    };

    const handleSubmit = async () => {
        if (!title || !description || !user) {
            toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
            return;
        }

        const ticket: SupportTicket = {
            id: `ticket${Date.now()}`,
            title,
            description,
            category,
            priority,
            status: "open",
            createdBy: user.id,
            createdByName: user.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            responses: []
        };

        await db.supportTickets.add(ticket);

        // Notify admins
        const admins = await db.users.where("role").equals("Admin").toArray();
        for (const admin of admins) {
            await db.notifications.add({
                id: `notif${Date.now()}-${admin.id}`,
                userId: admin.id,
                type: "support",
                priority: priority === "urgent" ? "high" : "medium",
                title: "New Support Ticket",
                message: `${user.name} submitted: ${title}`,
                link: "/support",
                createdAt: new Date().toISOString(),
                isRead: false
            });
        }

        toast({ title: "Success", description: "Support ticket submitted! We'll get back to you soon." });
        resetForm();
        setIsOpen(false);
    };

    return (
        <>
            {/* Floating Help Button */}
            <Button
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
                size="icon"
                onClick={() => setIsOpen(true)}
                title="Need Help?"
            >
                <HelpCircle className="w-6 h-6" />
            </Button>

            {/* Help Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-primary" />
                            Need Help?
                        </DialogTitle>
                        <DialogDescription>
                            Submit a support ticket and our team will assist you as soon as possible.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="help-title">Subject *</Label>
                            <Input
                                id="help-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Brief description of your issue"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="help-category">Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger id="help-category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="help-priority">Priority</Label>
                                <Select value={priority} onValueChange={(val) => setPriority(val as SupportPriority)}>
                                    <SelectTrigger id="help-priority">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="help-description">Description *</Label>
                            <Textarea
                                id="help-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your issue in detail..."
                                rows={6}
                            />
                        </div>

                        {/* Quick Links */}
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm font-medium mb-2">Quick Resources:</p>
                            <div className="space-y-1">
                                <a href="/links" className="text-sm text-primary hover:underline block">
                                    📚 Company Links & Documentation
                                </a>
                                <a href="/idea-board" className="text-sm text-primary hover:underline block">
                                    💡 Idea Board
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleSubmit}>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Ticket
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
