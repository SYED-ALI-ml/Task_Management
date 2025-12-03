import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Mail, MessageSquare, Calendar, Cloud, Github, Slack } from "lucide-react";

const INTEGRATIONS = [
    {
        id: "gmail",
        name: "Gmail",
        description: "Sync emails and contacts directly from your Google account.",
        icon: Mail,
        connected: true,
        category: "Communication"
    },
    {
        id: "slack",
        name: "Slack",
        description: "Receive notifications and updates in your team channels.",
        icon: Slack,
        connected: false,
        category: "Communication"
    },
    {
        id: "gcal",
        name: "Google Calendar",
        description: "Sync meetings and events with your CRM activities.",
        icon: Calendar,
        connected: true,
        category: "Productivity"
    },
    {
        id: "dropbox",
        name: "Dropbox",
        description: "Store and attach files to your deals and contacts.",
        icon: Cloud,
        connected: false,
        category: "Storage"
    },
    {
        id: "github",
        name: "GitHub",
        description: "Link commits and issues to your projects and tasks.",
        icon: Github,
        connected: false,
        category: "Development"
    }
];

export const IntegrationsView = () => {
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-muted-foreground mt-2">Connect your favorite tools to streamline your workflow.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {INTEGRATIONS.map((integration) => {
                    const Icon = integration.icon;
                    return (
                        <Card key={integration.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    {integration.connected && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                            <Check className="w-3 h-3 mr-1" />
                                            Connected
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="mt-4">{integration.name}</CardTitle>
                                <CardDescription>{integration.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                    {integration.category}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant={integration.connected ? "outline" : "default"}
                                    className="w-full"
                                >
                                    {integration.connected ? "Manage" : "Connect"}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
