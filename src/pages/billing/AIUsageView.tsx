import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AIUsageView() {
    const { user } = useAuth();
    const logs = useLiveQuery(() =>
        user ? db.aiUsageLogs.where("userId").equals(user.id).reverse().sortBy("timestamp") : []
        , [user]) || [];

    const totalCost = logs.reduce((acc, log) => acc + log.cost, 0);
    const totalTokens = logs.reduce((acc, log) => acc + log.tokensUsed, 0);

    // Group by feature for chart
    const usageByFeature = logs.reduce((acc, log) => {
        acc[log.feature] = (acc[log.feature] || 0) + log.cost;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(usageByFeature).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total AI Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Tokens Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {chartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Usage by Feature</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Feature</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Tokens</TableHead>
                            <TableHead>Cost</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>{format(new Date(log.timestamp), "MMM d, HH:mm")}</TableCell>
                                <TableCell className="capitalize">{log.feature}</TableCell>
                                <TableCell>{log.model}</TableCell>
                                <TableCell>{log.tokensUsed.toLocaleString()}</TableCell>
                                <TableCell>{formatCurrency(log.cost)}</TableCell>
                            </TableRow>
                        ))}
                        {logs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No usage logs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
