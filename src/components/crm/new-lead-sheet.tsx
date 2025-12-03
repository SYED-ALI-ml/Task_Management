import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Lead } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface NewLeadSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => void;
}

export function NewLeadSheet({ isOpen, onClose, onCreate }: NewLeadSheetProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        status: "new",
        source: "website",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({
            ...formData,
            status: formData.status as any,
            assignedTo: user?.id || "",
        });
        onClose();
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            company: "",
            status: "new",
            source: "website",
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Add New Lead</SheetTitle>
                    <SheetDescription>
                        Enter the details of the new potential customer.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            required
                            value={formData.firstName}
                            onChange={(e) =>
                                setFormData({ ...formData, firstName: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            required
                            value={formData.lastName}
                            onChange={(e) =>
                                setFormData({ ...formData, lastName: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                            id="company"
                            required
                            value={formData.company}
                            onChange={(e) =>
                                setFormData({ ...formData, company: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="source">Source</Label>
                        <Select
                            value={formData.source}
                            onValueChange={(value) =>
                                setFormData({ ...formData, source: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="referral">Referral</SelectItem>
                                <SelectItem value="cold-call">Cold Call</SelectItem>
                                <SelectItem value="conference">Conference</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Initial Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) =>
                                setFormData({ ...formData, status: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="proposal">Proposal</SelectItem>
                                <SelectItem value="negotiation">Negotiation</SelectItem>
                                <SelectItem value="won">Won</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Lead</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
