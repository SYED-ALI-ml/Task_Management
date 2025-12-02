import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm, useFieldArray } from "react-hook-form";
import { Quotation, Product, Contact, Company } from "@/types";
import { db } from "@/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface QuotationBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    quotation?: Quotation;
}

export function QuotationBuilder({ isOpen, onClose, quotation }: QuotationBuilderProps) {
    const contacts = useLiveQuery(() => db.contacts.toArray()) || [];
    const companies = useLiveQuery(() => db.companies.toArray()) || [];
    const products = useLiveQuery(() => db.products.toArray()) || [];

    const { register, control, handleSubmit, watch, setValue, reset } = useForm<Partial<Quotation>>({
        defaultValues: quotation || {
            items: [],
            status: "draft",
            tax: 0
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const watchItems = watch("items");
    const watchTax = watch("tax") || 0;

    useEffect(() => {
        if (watchItems) {
            const subtotal = watchItems.reduce((sum, item) => sum + (item.total || 0), 0);
            setValue("subtotal", subtotal);
            setValue("total", subtotal + watchTax);
        }
    }, [watchItems, watchTax, setValue]);

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setValue(`items.${index}.productId`, product.id);
            setValue(`items.${index}.productName`, product.name);
            setValue(`items.${index}.unitPrice`, product.price);
            setValue(`items.${index}.quantity`, 1);
            setValue(`items.${index}.total`, product.price);
        }
    };

    const handleQuantityChange = (index: number, qty: number) => {
        const unitPrice = watch(`items.${index}.unitPrice`) || 0;
        setValue(`items.${index}.quantity`, qty);
        setValue(`items.${index}.total`, qty * unitPrice);
    };

    const onSubmit = async (data: Partial<Quotation>) => {
        const customerName = contacts.find(c => c.id === data.customerId)?.firstName ||
            companies.find(c => c.id === data.customerId)?.name || "Unknown";

        const processedData = {
            ...data,
            customerName,
            updatedAt: new Date().toISOString()
        };

        if (quotation) {
            await db.quotations.update(quotation.id, processedData);
        } else {
            await db.quotations.add({
                id: `q${Date.now()}`,
                ...processedData,
                createdAt: new Date().toISOString()
            } as Quotation);
        }
        onClose();
        reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{quotation ? "Edit Quotation" : "Create Quotation"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Customer</Label>
                            <Select onValueChange={(val) => setValue("customerId", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName} (Contact)</SelectItem>
                                    ))}
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name} (Company)</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Valid Until</Label>
                            <Input type="date" {...register("validUntil", { required: true })} />
                        </div>
                    </div>

                    <div className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Items</h3>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", productName: "", quantity: 1, unitPrice: 0, total: 0 })}>
                                <Plus className="w-4 h-4 mr-2" /> Add Item
                            </Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="w-24">Qty</TableHead>
                                    <TableHead className="w-32 text-right">Price</TableHead>
                                    <TableHead className="w-32 text-right">Total</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <Select onValueChange={(val) => handleProductSelect(index, val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="1"
                                                {...register(`items.${index}.quantity` as const)}
                                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ${watch(`items.${index}.unitPrice`)?.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ${watch(`items.${index}.total`)?.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end space-x-8">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${watch("subtotal")?.toFixed(2) || "0.00"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Tax:</span>
                                <Input
                                    type="number"
                                    className="w-24 text-right"
                                    {...register("tax", { valueAsNumber: true })}
                                />
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                <span>Total:</span>
                                <span>${watch("total")?.toFixed(2) || "0.00"}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit">{quotation ? "Update Quotation" : "Create Quotation"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
