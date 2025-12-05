import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, Plus } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";

export function WalletView() {
    const { user } = useAuth();
    const wallet = useLiveQuery(() => user ? db.wallets.get(user.id) : null, [user]);

    const handleRecharge = () => {
        // Placeholder for payment gateway integration
        alert("Redirecting to payment gateway...");
    };

    if (!wallet) return <div>Loading wallet...</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Current Balance
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(wallet.balance)}</div>
                    <p className="text-xs text-muted-foreground">
                        Available for use
                    </p>
                </CardContent>
            </Card>
            <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-dashed flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Need more credits?</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Recharge your wallet to continue using AI features and pay for subscriptions.
                    </p>
                    <Button onClick={handleRecharge}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Funds
                    </Button>
                </div>
            </Card>
        </div>
    );
}
