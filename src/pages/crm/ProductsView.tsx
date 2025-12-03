import React, { useState } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package, Tag } from "lucide-react";
import { NewProductSheet } from "@/components/crm/new-product-sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export const ProductsView = () => {
    const [isNewProductOpen, setIsNewProductOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const products = useLiveQuery(() => db.products.toArray()) || [];

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
        const newProduct: Product = {
            id: `p${Date.now()}`,
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await db.products.add(newProduct);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="h-full flex flex-col p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products & Services</h1>
                    <p className="text-muted-foreground mt-2">Manage your product catalog and pricing.</p>
                </div>
                <Button onClick={() => setIsNewProductOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            <div className="flex items-center space-x-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Added</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <span>{product.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Tag className="w-3 h-3 text-muted-foreground" />
                                        <span>{product.category}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-bold">{formatCurrency(product.price)}</TableCell>
                                <TableCell className="text-muted-foreground truncate max-w-[200px]">{product.description}</TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {format(new Date(product.createdAt), 'MMM d, yyyy')}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredProducts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <NewProductSheet
                isOpen={isNewProductOpen}
                onClose={() => setIsNewProductOpen(false)}
                onCreate={handleCreateProduct}
            />
        </div>
    );
};
