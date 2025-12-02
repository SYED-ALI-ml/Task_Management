import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAuth } from "@/context/AuthContext";
import { CompanyLink, LinkCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Filter, ExternalLink, TrendingUp, Bookmark, Link as LinkIcon } from "lucide-react";

const categories: LinkCategory[] = ["Documentation", "Tools", "Resources", "Templates", "Policies", "External", "Other"];

export function LinksManagement() {
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch all links
    const allLinks = useLiveQuery(() => db.companyLinks.toArray()) || [];

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<LinkCategory | "all">("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<CompanyLink | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<LinkCategory>("Documentation");
    const [tagsInput, setTagsInput] = useState("");

    // Permissions
    const canManage = user?.role === "Admin" || user?.role === "Manager" || user?.role === "HR";

    // Filter links
    const filteredLinks = allLinks.filter(link => {
        const matchesSearch =
            link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === "all" || link.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Sort by access count (popular first)
    const sortedLinks = [...filteredLinks].sort((a, b) => b.accessCount - a.accessCount);

    // Get category stats
    const categoryStats = categories.map(cat => ({
        category: cat,
        count: allLinks.filter(l => l.category === cat).length
    })).filter(s => s.count > 0);

    const resetForm = () => {
        setTitle("");
        setUrl("");
        setDescription("");
        setCategory("Documentation");
        setTagsInput("");
    };

    const handleCreateLink = async () => {
        if (!title || !url || !description || !user) {
            toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t);

        const newLink: CompanyLink = {
            id: `link${Date.now()}`,
            title,
            url,
            description,
            category,
            tags,
            createdBy: user.id,
            createdByName: user.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            accessCount: 0
        };

        await db.companyLinks.add(newLink);
        toast({ title: "Success", description: "Link added successfully!" });
        resetForm();
        setIsCreateDialogOpen(false);
    };

    const handleEditLink = async () => {
        if (!editingLink || !title || !url || !description) {
            toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t);

        await db.companyLinks.update(editingLink.id, {
            title,
            url,
            description,
            category,
            tags,
            updatedAt: new Date().toISOString()
        });

        toast({ title: "Success", description: "Link updated successfully!" });
        resetForm();
        setEditingLink(null);
        setIsEditDialogOpen(false);
    };

    const handleDeleteLink = async (linkId: string) => {
        if (window.confirm("Are you sure you want to delete this link?")) {
            await db.companyLinks.delete(linkId);
            toast({ title: "Success", description: "Link deleted successfully!" });
        }
    };

    const handleLinkClick = async (link: CompanyLink) => {
        // Increment access count
        await db.companyLinks.update(link.id, {
            accessCount: link.accessCount + 1
        });

        // Open link in new tab
        window.open(link.url, "_blank");
    };

    const openEditDialog = (link: CompanyLink) => {
        setEditingLink(link);
        setTitle(link.title);
        setUrl(link.url);
        setDescription(link.description);
        setCategory(link.category);
        setTagsInput(link.tags.join(", "));
        setIsEditDialogOpen(true);
    };

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <LinkIcon className="w-8 h-8 text-primary" />
                        Company Links
                    </h1>
                    <p className="text-muted-foreground mt-1">Quick access to important resources and tools</p>
                </div>
                {canManage && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Link
                    </Button>
                )}
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search links, descriptions, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as LinkCategory | "all")}>
                    <SelectTrigger className="w-[200px]">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            <SelectValue placeholder="Category" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Category Stats */}
            <div className="flex gap-2 flex-wrap">
                {categoryStats.map(stat => (
                    <Badge
                        key={stat.category}
                        variant={selectedCategory === stat.category ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(stat.category)}
                    >
                        {stat.category} ({stat.count})
                    </Badge>
                ))}
                {selectedCategory !== "all" && (
                    <Badge variant="outline" className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
                        Clear Filter
                    </Badge>
                )}
            </div>

            {/* Links Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedLinks.map(link => (
                    <Card key={link.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    {link.title}
                                </CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                    {link.category}
                                </Badge>
                            </div>
                            <CardDescription className="line-clamp-2">{link.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* Tags */}
                                <div className="flex flex-wrap gap-1">
                                    {link.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                    {link.tags.length > 3 && (
                                        <Badge variant="outline" className="text-xs">+{link.tags.length - 3}</Badge>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {link.accessCount} views
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Bookmark className="w-3 h-3" />
                                        {link.createdByName}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleLinkClick(link)}
                                    >
                                        Open Link
                                    </Button>
                                    {canManage && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEditDialog(link)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteLink(link.id)}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {sortedLinks.length === 0 && (
                <div className="text-center py-12">
                    <LinkIcon className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mt-4">No links found matching your search.</p>
                </div>
            )}

            {/* Create Link Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Link</DialogTitle>
                        <DialogDescription>Add a new company resource or tool link.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Company Handbook" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="url">URL *</Label>
                            <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={3} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={(val) => setCategory(val as LinkCategory)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="e.g., policies, handbook, guidelines" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { resetForm(); setIsCreateDialogOpen(false); }}>Cancel</Button>
                        <Button onClick={handleCreateLink}>Add Link</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Link Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Link</DialogTitle>
                        <DialogDescription>Update the link details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Title *</Label>
                            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-url">URL *</Label>
                            <Input id="edit-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description *</Label>
                            <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select value={category} onValueChange={(val) => setCategory(val as LinkCategory)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                            <Input id="edit-tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { resetForm(); setEditingLink(null); setIsEditDialogOpen(false); }}>Cancel</Button>
                        <Button onClick={handleEditLink}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
