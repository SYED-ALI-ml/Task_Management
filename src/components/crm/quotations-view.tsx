import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

import { QuotationBuilder } from "./quotation-builder";

export function QuotationsView() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const quotations = useLiveQuery(() => db.quotations.toArray()) || [];

    const filteredQuotations = quotations.filter(quotation =>
        quotation.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Quotations</h2>
                    <p className="text-muted-foreground">Manage sales quotations.</p>
                </div>
                <Button onClick={() => setIsBuilderOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Quotation
                </Button>
            </div>

            <QuotationBuilder isOpen={isBuilderOpen} onClose={() => setIsBuilderOpen(false)} />

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search quotations..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Valid Until</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredQuotations.map((quotation) => (
                            <TableRow key={quotation.id}>
                                <TableCell className="font-medium">{quotation.customerName}</TableCell>
                                <TableCell className="capitalize">{quotation.status}</TableCell>
                                <TableCell>{new Date(quotation.validUntil).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">${quotation.total.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        {filteredQuotations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No quotations found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
