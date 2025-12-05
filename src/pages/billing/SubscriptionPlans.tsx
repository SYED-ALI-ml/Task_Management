import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { formatCurrency } from "@/lib/utils";

export function SubscriptionPlans() {
    const plans = useLiveQuery(() => db.subscriptionPlans.where("isActive").equals(true).toArray()) || [];

    const handleSubscribe = (planId: string) => {
        alert(`Subscribing to plan: ${planId}`);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
                <Card key={plan.id} className={plan.isPopular ? "border-primary shadow-lg relative" : ""}>
                    {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                            Most Popular
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-6">
                            {formatCurrency(plan.price)}
                            <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                        </div>
                        <ul className="space-y-2">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center text-sm">
                                    <Check className="mr-2 h-4 w-4 text-primary" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => handleSubscribe(plan.id)} variant={plan.isPopular ? "default" : "outline"}>
                            Subscribe
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
