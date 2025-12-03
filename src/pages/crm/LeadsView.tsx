import React, { useState } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Lead } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Phone, Mail, Building2 } from "lucide-react";
import { NewLeadSheet } from "@/components/crm/new-lead-sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";

const PIPELINE_STAGES = [
    { id: "new", label: "New Lead", color: "bg-blue-500/10 border-blue-500/20" },
    { id: "contacted", label: "Contacted", color: "bg-indigo-500/10 border-indigo-500/20" },
    { id: "qualified", label: "Qualified", color: "bg-purple-500/10 border-purple-500/20" },
    { id: "proposal", label: "Proposal Sent", color: "bg-yellow-500/10 border-yellow-500/20" },
    { id: "negotiation", label: "Negotiation", color: "bg-orange-500/10 border-orange-500/20" },
    { id: "won", label: "Closed Won", color: "bg-green-500/10 border-green-500/20" },
    { id: "lost", label: "Closed Lost", color: "bg-red-500/10 border-red-500/20" },
];

export const LeadsView = () => {
    const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
    const leads = useLiveQuery(() => db.leads.toArray()) || [];

    const handleCreateLead = async (leadData: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
        const newLead: Lead = {
            id: `l${Date.now()}`,
            ...leadData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await db.leads.add(newLead);

        // Log activity
        await db.activities.add({
            id: `act${Date.now()}`,
            relatedToId: newLead.id,
            type: "note",
            subject: "Lead Created",
            description: `Lead ${newLead.firstName} ${newLead.lastName} was created.`,
            date: new Date().toISOString(),
            createdBy: leadData.assignedTo,
            createdAt: new Date().toISOString()
        });
    };

    const handleUpdateStatus = async (leadId: string, newStatus: Lead['status']) => {
        await db.leads.update(leadId, { status: newStatus, updatedAt: new Date().toISOString() });
    };

    const handleDeleteLead = async (leadId: string) => {
        if (confirm("Are you sure you want to delete this lead?")) {
            await db.leads.delete(leadId);
        }
    };

    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        setDraggedLeadId(leadId);
        e.dataTransfer.effectAllowed = "move";
        // Set transparent image or custom drag image if needed, but default is usually fine
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
        e.preventDefault();
        if (!draggedLeadId) return;

        const lead = leads.find(l => l.id === draggedLeadId);
        if (lead && lead.status !== targetStageId) {
            await handleUpdateStatus(draggedLeadId, targetStageId as Lead['status']);
        }
        setDraggedLeadId(null);
    };

    return (
        <div className="h-full flex flex-col p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leads Pipeline</h1>
                    <p className="text-muted-foreground mt-2">Manage your sales pipeline and track lead progress.</p>
                </div>
                <Button onClick={() => setIsNewLeadOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                </Button>
            </div>

            <ScrollArea className="flex-1 -mx-8 px-8">
                <div className="flex gap-4 min-w-max pb-4">
                    {PIPELINE_STAGES.map((stage) => {
                        const stageLeads = leads.filter((l) => l.status === stage.id);
                        const isTarget = draggedLeadId && leads.find(l => l.id === draggedLeadId)?.status !== stage.id;

                        return (
                            <div
                                key={stage.id}
                                className="w-80 flex-shrink-0"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage.id)}
                            >
                                <div className={`flex items-center justify-between p-3 rounded-t-lg border-b-2 ${stage.color} bg-card border border-border`}>
                                    <h3 className="font-semibold text-sm">{stage.label}</h3>
                                    <span className="bg-background/50 px-2 py-0.5 rounded text-xs font-medium">
                                        {stageLeads.length}
                                    </span>
                                </div>
                                <div className={`bg-muted/30 p-2 rounded-b-lg min-h-[calc(100vh-250px)] space-y-3 transition-colors ${isTarget ? 'bg-muted/60 ring-2 ring-primary/20' : ''}`}>
                                    {stageLeads.map((lead) => (
                                        <div
                                            key={lead.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, lead.id)}
                                            className="bg-card p-4 rounded-md border shadow-sm hover:shadow-md transition-all group cursor-grab active:cursor-grabbing"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-sm truncate pr-2">
                                                    {lead.firstName} {lead.lastName}
                                                </h4>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(lead.id, 'won')}>
                                                            Mark as Won
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(lead.id, 'lost')}>
                                                            Mark as Lost
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteLead(lead.id)}>
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="space-y-2 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3 h-3" />
                                                    <span className="truncate">{lead.company}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate">{lead.email}</span>
                                                </div>
                                                {lead.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3 h-3" />
                                                        <span className="truncate">{lead.phone}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
                                                <span>{format(new Date(lead.createdAt), 'MMM d')}</span>
                                                <div className="flex gap-1">
                                                    {/* Quick Actions could go here */}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {stageLeads.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground/50 text-xs border-2 border-dashed rounded-md">
                                            Drop leads here
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <NewLeadSheet
                isOpen={isNewLeadOpen}
                onClose={() => setIsNewLeadOpen(false)}
                onCreate={handleCreateLead}
            />
        </div>
    );
};
