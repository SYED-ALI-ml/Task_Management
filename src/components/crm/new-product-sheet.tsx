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
import { Product } from "@/types";

interface NewProductSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
}

export function NewProductSheet({ isOpen, onClose, onCreate }: NewProductSheetProps) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        sku: "",
        category: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({
            ...formData,
            price: parseFloat(formData.price) || 0,
        });
        onClose();
        setFormData({
            name: "",
            description: "",
            price: "",
            sku: "",
            category: "",
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Add New Product</SheetTitle>
                    <SheetDescription>
                        Add a product or service to your catalog.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
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
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            required
                            value={formData.sku}
                            onChange={(e) =>
                                setFormData({ ...formData, sku: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({ ...formData, category: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) =>
                                setFormData({ ...formData, price: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </div>

                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Add Product</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
