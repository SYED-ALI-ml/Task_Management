import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletView } from "./WalletView";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { BillingHistory } from "./BillingHistory";
import { AIUsageView } from "./AIUsageView";

export function BillingDashboard() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Billing & Usage</h2>
                <p className="text-muted-foreground">Manage your wallet, subscriptions, and view AI usage.</p>
            </div>

            <Tabs defaultValue="wallet" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="wallet">Wallet</TabsTrigger>
                    <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                    <TabsTrigger value="history">Billing History</TabsTrigger>
                    <TabsTrigger value="usage">AI Usage</TabsTrigger>
                </TabsList>
                <TabsContent value="wallet" className="space-y-4">
                    <WalletView />
                </TabsContent>
                <TabsContent value="plans" className="space-y-4">
                    <SubscriptionPlans />
                </TabsContent>
                <TabsContent value="history" className="space-y-4">
                    <BillingHistory />
                </TabsContent>
                <TabsContent value="usage" className="space-y-4">
                    <AIUsageView />
                </TabsContent>
            </Tabs>
        </div>
    );
}
