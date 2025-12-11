import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm, Controller } from "react-hook-form";
import { Contact } from "@/types";
import { db } from "@/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";

interface ContactDialogProps {
    isOpen: boolean;
    onClose: () => void;
    contact?: Contact;
}

export function ContactDialog({ isOpen, onClose, contact }: ContactDialogProps) {
    const companies = useLiveQuery(() => db.companies.toArray()) || [];

    // We need to handle nested objects for social and address, so we might need a custom defaultValues structure
    // or just let useForm handle it deep.
    const { register, handleSubmit, reset, control } = useForm<Partial<Contact>>({
        defaultValues: contact || {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            role: "",
            companyId: "",
            social: { linkedin: "", twitter: "", facebook: "" },
            address: { street: "", city: "", state: "", zip: "", country: "" },
            notes: "",
            tags: [],
            source: "",
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (contact) {
                reset({
                    ...contact,
                    social: contact.social || { linkedin: "", twitter: "", facebook: "" },
                    address: contact.address || { street: "", city: "", state: "", zip: "", country: "" },
                    tags: contact.tags || [],
                });
            } else {
                reset({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    role: "",
                    companyId: "",
                    social: { linkedin: "", twitter: "", facebook: "" },
                    address: { street: "", city: "", state: "", zip: "", country: "" },
                    notes: "",
                    tags: [],
                    source: "",
                });
            }
        }
    }, [contact, isOpen, reset]);

    const onSubmit = async (data: Partial<Contact>) => {
        // Handle tags if it's coming from a text input (if we decide to use text input for tags)
        // For now, let's assume default handling.

        const finalData = {
            ...data,
            // Ensure nested objects are initialized if undefined
            social: data.social || {},
            address: data.address || {},
        };

        if (contact) {
            await db.contacts.update(contact.id, finalData);
        } else {
            await db.contacts.add({
                id: `ct${Date.now()}`,
                ...finalData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as Contact);
        }
        onClose();
        reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{contact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="social">Social</TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input id="firstName" {...register("firstName", { required: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input id="lastName" {...register("lastName", { required: true })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input id="email" type="email" {...register("email", { required: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" {...register("phone")} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Controller
                                        control={control}
                                        name="companyId"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select company" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {companies.map((c) => (
                                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role / Job Title</Label>
                                    <Input id="role" {...register("role")} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="source">Source</Label>
                                <Controller
                                    control={control}
                                    name="source"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Website">Website</SelectItem>
                                                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                                <SelectItem value="Referral">Referral</SelectItem>
                                                <SelectItem value="Conference">Conference</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="details" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="address.street">Street Address</Label>
                                <Input id="address.street" {...register("address.street")} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address.city">City</Label>
                                    <Input id="address.city" {...register("address.city")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address.state">State / Province</Label>
                                    <Input id="address.state" {...register("address.state")} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address.zip">Zip / Postal Code</Label>
                                    <Input id="address.zip" {...register("address.zip")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address.country">Country</Label>
                                    <Input id="address.country" {...register("address.country")} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" type="date" {...register("dob")} />
                            </div>
                        </TabsContent>

                        <TabsContent value="social" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="social.linkedin">LinkedIn Profile</Label>
                                <Input id="social.linkedin" placeholder="https://linkedin.com/in/username" {...register("social.linkedin")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="social.twitter">Twitter / X Handle</Label>
                                <Input id="social.twitter" placeholder="@username" {...register("social.twitter")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="social.facebook">Facebook Profile</Label>
                                <Input id="social.facebook" placeholder="https://facebook.com/username" {...register("social.facebook")} />
                            </div>
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes">Internal Notes</Label>
                                <Textarea
                                    id="notes"
                                    className="min-h-[150px]"
                                    placeholder="Add notes about this contact..."
                                    {...register("notes")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                {/* Simple implementation for tags: comma separated string in input. 
                                    Ideally needs conversion logic, but for now we'll store as simple array derived or just assume user enters it?
                                    Actually the Type defines tags using string[].
                                    React Hook Form will bind this to string[] if we aren't careful.
                                    We need a controlled input or a transformation. 
                                    Let's skip explicit tags array edit for now to avoid complexity or just use a helper text field if needed.
                                    For simplicity, I'll omit tags editable here or make it a notes field equivalent.
                                */}
                                <p className="text-sm text-muted-foreground">Tag management coming soon.</p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{contact ? "Update Contact" : "Create Contact"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
