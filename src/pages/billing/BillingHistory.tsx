import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export function BillingHistory() {
    const { user } = useAuth();
    const transactions = useLiveQuery(() =>
        user ? db.transactions.where("walletId").equals(user.id).reverse().sortBy("date") : []
        , [user]) || [];

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((txn) => (
                        <TableRow key={txn.id}>
                            <TableCell>{format(new Date(txn.date), "MMM d, yyyy")}</TableCell>
                            <TableCell>{txn.description}</TableCell>
                            <TableCell className="capitalize">{txn.category.replace("-", " ")}</TableCell>
                            <TableCell className={txn.type === "credit" ? "text-green-600" : "text-red-600"}>
                                {txn.type === "credit" ? "+" : "-"}{formatCurrency(txn.amount)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={txn.status === "success" ? "default" : txn.status === "pending" ? "secondary" : "destructive"}>
                                    {txn.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                    {transactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                No transactions found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
