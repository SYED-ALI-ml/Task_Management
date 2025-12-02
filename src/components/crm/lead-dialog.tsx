import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Lead } from "@/types";
import { db } from "@/db";

interface LeadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    lead?: Lead;
}

export function LeadDialog({ isOpen, onClose, lead }: LeadDialogProps) {
    const { register, handleSubmit, reset } = useForm<Partial<Lead>>({
        defaultValues: lead || { status: "new", source: "website" }
    });

    const onSubmit = async (data: Partial<Lead>) => {
        if (lead) {
            await db.leads.update(lead.id, data);
        } else {
            await db.leads.add({
                id: `l${Date.now()}`,
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as Lead);
        }
        onClose();
        reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{lead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" {...register("firstName", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" {...register("lastName", { required: true })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register("email", { required: true })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" {...register("company", { required: true })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("status")}>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="lost">Lost</option>
                            <option value="won">Won</option>
                        </select>
                    </div>
                    <DialogFooter>
                        <Button type="submit">{lead ? "Update" : "Create"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
