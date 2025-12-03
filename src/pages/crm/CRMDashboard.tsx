import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Users, Building2, FileText, DollarSign, TrendingUp, Activity } from "lucide-react";
import { format } from "date-fns";

export const CRMDashboard = () => {
    const leads = useLiveQuery(() => db.leads.toArray()) || [];
    const contacts = useLiveQuery(() => db.contacts.toArray()) || [];
    const companies = useLiveQuery(() => db.companies.toArray()) || [];
    const quotations = useLiveQuery(() => db.quotations.toArray()) || [];
    const activities = useLiveQuery(() => db.activities.orderBy('date').reverse().limit(5).toArray()) || [];

    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;

    // Calculate Revenue from Accepted Quotations
    const revenue = quotations
        .filter(q => q.status === 'accepted')
        .reduce((sum, q) => sum + q.totalAmount, 0);

    // Calculate Active Pipeline (Sent Quotations)
    const pipelineValue = quotations
        .filter(q => q.status === 'sent')
        .reduce((sum, q) => sum + q.totalAmount, 0);

    const activeDeals = quotations.filter(q => q.status === 'sent').length;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM Overview</h1>
                    <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening with your sales pipeline.</p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(revenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Pipeline</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(pipelineValue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{activeDeals} deals in progress</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalLeads}</div>
                        <p className="text-xs text-muted-foreground mt-1">{newLeads} new this week</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Companies</CardTitle>
                        <Building2 className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{companies.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">{contacts.length} active contacts</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Leads */}
                <Card className="col-span-4 hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Recent Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {leads.slice(0, 5).map((lead) => (
                                <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {lead.firstName[0]}{lead.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{lead.firstName} {lead.lastName}</p>
                                            <p className="text-sm text-muted-foreground">{lead.company}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                                            ${lead.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                lead.status === 'won' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                            {lead.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {leads.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">No leads found. Start by adding one!</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3 hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start">
                                    <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                                        <Activity className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{activity.subject}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {activity.type} • {format(new Date(activity.date), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">No recent activities recorded.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
