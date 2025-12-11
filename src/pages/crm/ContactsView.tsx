import React, { useState } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Contact } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail, Phone, Building2, User } from "lucide-react";
import { ContactDialog } from "@/components/crm/contact-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export const ContactsView = () => {
    const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const contacts = useLiveQuery(() => db.contacts.toArray()) || [];
    const companies = useLiveQuery(() => db.companies.toArray()) || [];

    const filteredContacts = contacts.filter(contact =>
        contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCompanyName = (companyId: string) => {
        return companies.find(c => c.id === companyId)?.name || "Unknown Company";
    };

    const handleEdit = (contact: Contact) => {
        setSelectedContact(contact);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedContact(undefined);
        setIsDialogOpen(true);
    };

    return (
        <div className="h-full flex flex-col p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
                    <p className="text-muted-foreground mt-2">Manage your business contacts and relationships.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                </Button>
            </div>

            <div className="flex items-center space-x-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search contacts..."
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
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Added</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredContacts.map((contact) => (
                            <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEdit(contact)}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {contact.firstName[0]}{contact.lastName[0]}
                                        </div>
                                        <span>{contact.firstName} {contact.lastName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{contact.role}</TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Building2 className="w-3 h-3 text-muted-foreground" />
                                        <span>{getCompanyName(contact.companyId)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                        <span>{contact.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-3 h-3 text-muted-foreground" />
                                        <span>{contact.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(contact); }}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredContacts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No contacts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <ContactDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                contact={selectedContact}
            />
        </div>
    );
};
