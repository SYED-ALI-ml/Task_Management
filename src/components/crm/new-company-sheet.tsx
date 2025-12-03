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
import { useState } from "react";
import { Company } from "@/types";

interface NewCompanySheetProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (company: Omit<Company, "id" | "createdAt" | "updatedAt">) => void;
}

export function NewCompanySheet({ isOpen, onClose, onCreate }: NewCompanySheetProps) {
    const [formData, setFormData] = useState({
        name: "",
        industry: "",
        website: "",
        phone: "",
        address: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(formData);
        onClose();
        setFormData({
            name: "",
            industry: "",
            website: "",
            phone: "",
            address: "",
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Add New Company</SheetTitle>
                    <SheetDescription>
                        Add a new company/account to your CRM.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                            id="industry"
                            value={formData.industry}
                            onChange={(e) =>
                                setFormData({ ...formData, industry: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            type="url"
                            placeholder="https://example.com"
                            value={formData.website}
                            onChange={(e) =>
                                setFormData({ ...formData, website: e.target.value })
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
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({ ...formData, address: e.target.value })
                            }
                        />
                    </div>

                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Company</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
