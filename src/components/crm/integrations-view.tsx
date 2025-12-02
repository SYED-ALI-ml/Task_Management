import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const integrations = [
    {
        id: "slack",
        name: "Slack",
        description: "Connect your workspace to receive notifications and updates.",
        status: "connected",
        icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg"
    },
    {
        id: "gmail",
        name: "Gmail",
        description: "Sync your emails and contacts automatically.",
        status: "disconnected",
        icon: "https://cdn.worldvectorlogo.com/logos/gmail-icon.svg"
    },
    {
        id: "zoom",
        name: "Zoom",
        description: "Schedule and join meetings directly from the CRM.",
        status: "disconnected",
        icon: "https://cdn.worldvectorlogo.com/logos/zoom-icon.svg"
    },
    {
        id: "stripe",
        name: "Stripe",
        description: "Process payments and manage subscriptions.",
        status: "disconnected",
        icon: "https://cdn.worldvectorlogo.com/logos/stripe-4.svg"
    }
];

export function IntegrationsView() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
                <p className="text-muted-foreground">Connect with your favorite tools.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map((integration) => (
                    <Card key={integration.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center p-2">
                                <img src={integration.icon} alt={integration.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                <Badge variant={integration.status === "connected" ? "default" : "secondary"} className="mt-1">
                                    {integration.status === "connected" ? "Connected" : "Not Connected"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                {integration.description}
                            </CardDescription>
                            <Button
                                variant={integration.status === "connected" ? "outline" : "default"}
                                className="w-full"
                            >
                                {integration.status === "connected" ? "Configure" : "Connect"}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
