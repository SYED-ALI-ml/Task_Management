import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Product } from "@/types";
import { db } from "@/db";

interface ProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product;
}

export function ProductDialog({ isOpen, onClose, product }: ProductDialogProps) {
    const { register, handleSubmit, reset } = useForm<Partial<Product>>({
        defaultValues: product || {}
    });

    const onSubmit = async (data: Partial<Product>) => {
        // Ensure price is a number
        const processedData = {
            ...data,
            price: Number(data.price)
        };

        if (product) {
            await db.products.update(product.id, processedData);
        } else {
            await db.products.add({
                id: `p${Date.now()}`,
                ...processedData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as Product);
        }
        onClose();
        reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" {...register("name", { required: true })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" {...register("sku", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input id="price" type="number" step="0.01" {...register("price", { required: true })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" {...register("category")} />
                    </div>
                    <DialogFooter>
                        <Button type="submit">{product ? "Update" : "Create"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
