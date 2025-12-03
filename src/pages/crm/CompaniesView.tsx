import React, { useState } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Globe, Phone, MapPin, Building2 } from "lucide-react";
import { NewCompanySheet } from "@/components/crm/new-company-sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export const CompaniesView = () => {
    const [isNewCompanyOpen, setIsNewCompanyOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const companies = useLiveQuery(() => db.companies.toArray()) || [];

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateCompany = async (companyData: Omit<Company, "id" | "createdAt" | "updatedAt">) => {
        const newCompany: Company = {
            id: `c${Date.now()}`,
            ...companyData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await db.companies.add(newCompany);
    };

    return (
        <div className="h-full flex flex-col p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
                    <p className="text-muted-foreground mt-2">Manage your client accounts and organizations.</p>
                </div>
                <Button onClick={() => setIsNewCompanyOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Company
                </Button>
            </div>

            <div className="flex items-center space-x-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search companies..."
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
                            <TableHead>Company Name</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Added</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCompanies.map((company) => (
                            <TableRow key={company.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <span>{company.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{company.industry}</TableCell>
                                <TableCell>
                                    {company.website && (
                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:underline">
                                            <Globe className="w-3 h-3" />
                                            <span>Visit</span>
                                        </a>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-3 h-3 text-muted-foreground" />
                                        <span>{company.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                        <span className="truncate max-w-[200px]">{company.address}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {format(new Date(company.createdAt), 'MMM d, yyyy')}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredCompanies.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No companies found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <NewCompanySheet
                isOpen={isNewCompanyOpen}
                onClose={() => setIsNewCompanyOpen(false)}
                onCreate={handleCreateCompany}
            />
        </div>
    );
};
