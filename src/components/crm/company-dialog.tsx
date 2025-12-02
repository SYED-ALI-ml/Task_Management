import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Company } from "@/types";
import { db } from "@/db";

interface CompanyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    company?: Company;
}

export function CompanyDialog({ isOpen, onClose, company }: CompanyDialogProps) {
    const { register, handleSubmit, reset } = useForm<Partial<Company>>({
        defaultValues: company || {}
    });

    const onSubmit = async (data: Partial<Company>) => {
        if (company) {
            await db.companies.update(company.id, data);
        } else {
            await db.companies.add({
                id: `c${Date.now()}`,
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as Company);
        }
        onClose();
        reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{company ? "Edit Company" : "Add New Company"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input id="name" {...register("name", { required: true })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input id="industry" {...register("industry")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" {...register("website")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" {...register("phone")} />
                    </div>
                    <DialogFooter>
                        <Button type="submit">{company ? "Update" : "Create"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
