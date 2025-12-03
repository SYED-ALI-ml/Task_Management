import React, { useState } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Quotation } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, Calendar } from "lucide-react";
import { NewQuotationSheet } from "@/components/crm/new-quotation-sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export const QuotationsView = () => {
    const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const quotations = useLiveQuery(() => db.quotations.toArray()) || [];
    const contacts = useLiveQuery(() => db.contacts.toArray()) || [];

    const getCustomerName = (customerId: string) => {
        const contact = contacts.find(c => c.id === customerId);
        return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Customer";
    };

    const filteredQuotations = quotations.filter(quote =>
        getCustomerName(quote.customerId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateQuote = async (quoteData: Omit<Quotation, "id" | "createdAt" | "updatedAt">) => {
        const newQuote: Quotation = {
            id: `q${Date.now()}`,
            ...quoteData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await db.quotations.add(newQuote);
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
                    <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
                    <p className="text-muted-foreground mt-2">Manage sales quotes and estimates.</p>
                </div>
                <Button onClick={() => setIsNewQuoteOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Quote
                </Button>
            </div>

            <div className="flex items-center space-x-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search quotes..."
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
                            <TableHead>Quote ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Valid Until</TableHead>
                            <TableHead>Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredQuotations.map((quote) => (
                            <TableRow key={quote.id}>
                                <TableCell className="font-mono text-xs">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="w-3 h-3 text-muted-foreground" />
                                        <span>#{quote.id.substring(0, 8)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{getCustomerName(quote.customerId)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                                        ${quote.status === 'sent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                            quote.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                quote.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                        {quote.status}
                                    </span>
                                </TableCell>
                                <TableCell className="font-bold">{formatCurrency(quote.totalAmount)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2 text-muted-foreground text-xs">
                                        <Calendar className="w-3 h-3" />
                                        <span>{format(new Date(quote.validUntil), 'MMM d, yyyy')}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {format(new Date(quote.createdAt), 'MMM d, yyyy')}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredQuotations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No quotations found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <NewQuotationSheet
                isOpen={isNewQuoteOpen}
                onClose={() => setIsNewQuoteOpen(false)}
                onCreate={handleCreateQuote}
            />
        </div>
    );
};
