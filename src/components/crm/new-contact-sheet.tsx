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
import { Contact, Company } from "@/types";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

interface NewContactSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => void;
}

export function NewContactSheet({ isOpen, onClose, onCreate }: NewContactSheetProps) {
    const companies = useLiveQuery(() => db.companies.toArray()) || [];
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyId: "",
        role: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(formData);
        onClose();
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            companyId: "",
            role: "",
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Add New Contact</SheetTitle>
                    <SheetDescription>
                        Add a new contact to your CRM.
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
                        <Select
                            value={formData.companyId}
                            onValueChange={(value) =>
                                setFormData({ ...formData, companyId: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id}>
                                        {company.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Don't see the company? Add it in the Companies section first.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role / Job Title</Label>
                        <Input
                            id="role"
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({ ...formData, role: e.target.value })
                            }
                        />
                    </div>

                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Contact</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
