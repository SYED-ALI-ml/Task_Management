import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Contact } from "@/types";
import { db } from "@/db";

interface ContactDialogProps {
    isOpen: boolean;
    onClose: () => void;
    contact?: Contact;
}

export function ContactDialog({ isOpen, onClose, contact }: ContactDialogProps) {
    const { register, handleSubmit, reset } = useForm<Partial<Contact>>({
        defaultValues: contact || {}
    });

    const onSubmit = async (data: Partial<Contact>) => {
        if (contact) {
            await db.contacts.update(contact.id, data);
        } else {
            await db.contacts.add({
                id: `ct${Date.now()}`,
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as Contact);
        }
        onClose();
        reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{contact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
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
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" {...register("phone")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" {...register("role")} />
                    </div>
                    <DialogFooter>
                        <Button type="submit">{contact ? "Update" : "Create"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
