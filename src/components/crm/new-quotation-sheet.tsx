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
import { Quotation } from "@/types";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

interface NewQuotationSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (quotation: Omit<Quotation, "id" | "createdAt" | "updatedAt">) => void;
}

export function NewQuotationSheet({ isOpen, onClose, onCreate }: NewQuotationSheetProps) {
    const contacts = useLiveQuery(() => db.contacts.toArray()) || [];
    const [formData, setFormData] = useState({
        customerId: "",
        totalAmount: "",
        status: "draft",
        validUntil: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({
            customerId: formData.customerId,
            items: [], // Placeholder for now
            totalAmount: parseFloat(formData.totalAmount) || 0,
            status: formData.status as any,
            validUntil: formData.validUntil,
        });
        onClose();
        setFormData({
            customerId: "",
            totalAmount: "",
            status: "draft",
            validUntil: "",
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Create Quotation</SheetTitle>
                    <SheetDescription>
                        Create a new sales quotation for a customer.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div className="space-y-2">
                        <Label htmlFor="customer">Customer (Contact)</Label>
                        <Select
                            value={formData.customerId}
                            onValueChange={(value) =>
                                setFormData({ ...formData, customerId: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {contacts.map((contact) => (
                                    <SelectItem key={contact.id} value={contact.id}>
                                        {contact.firstName} {contact.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Total Amount ($)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            required
                            value={formData.totalAmount}
                            onChange={(e) =>
                                setFormData({ ...formData, totalAmount: e.target.value })
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the total value of the quote. Line items can be added later.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
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
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="validUntil">Valid Until</Label>
                        <Input
                            id="validUntil"
                            type="date"
                            required
                            value={formData.validUntil}
                            onChange={(e) =>
                                setFormData({ ...formData, validUntil: e.target.value })
                            }
                        />
                    </div>

                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Quote</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
