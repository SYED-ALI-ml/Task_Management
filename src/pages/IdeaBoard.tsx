import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAuth } from "@/context/AuthContext";
import { Idea, IdeaCategory, IdeaStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
    Lightbulb,
    Plus,
    Heart,
    MessageSquare,
    Share2,
    Eye,
    Filter,
    TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function IdeaBoard() {
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch all ideas
    const allIdeas = useLiveQuery(() => db.ideas.toArray()) || [];
    const users = useLiveQuery(() => db.users.toArray()) || [];

    // My ideas (created by current user)
    const myIdeas = allIdeas.filter(idea => idea.createdBy === user?.id);

    // Shared with me (user ID is in sharedWith array)
    const sharedWithMe = allIdeas.filter(idea =>
        idea.sharedWith.includes(user?.id || "") && idea.createdBy !== user?.id
    );

    // Public ideas (visible to all, excluding my own)
    const publicIdeas = allIdeas.filter(idea =>
        idea.isPublic && idea.createdBy !== user?.id
    );

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<IdeaCategory>("product");
    const [isPublic, setIsPublic] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [tags, setTags] = useState("");
    const [commentText, setCommentText] = useState("");

    // Filter states
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const handleCreateIdea = async () => {
        if (!title || !description || !user) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        const newIdea: Idea = {
            id: `idea${Date.now()}`,
            title,
            description,
            category,
            status: "submitted",
            createdBy: user.id,
            createdByName: user.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sharedWith: selectedUsers,
            isPublic,
            likes: [],
            comments: [],
            tags: tags.split(",").map(t => t.trim()).filter(t => t)
        };

        await db.ideas.add(newIdea);

        toast({
            title: "Success",
            description: "Idea created successfully!",
        });

        // Reset form
        setTitle("");
        setDescription("");
        setCategory("product");
        setIsPublic(false);
        setSelectedUsers([]);
        setTags("");
        setIsCreateDialogOpen(false);
    };

    const handleLikeIdea = async (ideaId: string) => {
        const idea = await db.ideas.get(ideaId);
        if (!idea || !user) return;

        const hasLiked = idea.likes.includes(user.id);
        const updatedLikes = hasLiked
            ? idea.likes.filter(id => id !== user.id)
            : [...idea.likes, user.id];

        await db.ideas.update(ideaId, {
            likes: updatedLikes,
            updatedAt: new Date().toISOString()
        });

        // Update selected idea if viewing details
        if (selectedIdea?.id === ideaId) {
            setSelectedIdea({ ...idea, likes: updatedLikes });
        }
    };

    const handleAddComment = async () => {
        if (!selectedIdea || !commentText || !user) return;

        const newComment = {
            id: `c${Date.now()}`,
            ideaId: selectedIdea.id,
            userId: user.id,
            userName: user.name,
            content: commentText,
            createdAt: new Date().toISOString()
        };

        const updatedComments = [...selectedIdea.comments, newComment];

        await db.ideas.update(selectedIdea.id, {
            comments: updatedComments,
            updatedAt: new Date().toISOString()
        });

        setSelectedIdea({ ...selectedIdea, comments: updatedComments });
        setCommentText("");

        toast({
            title: "Comment added",
            description: "Your comment has been posted",
        });
    };

    const getCategoryColor = (cat: IdeaCategory) => {
        const colors = {
            product: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            process: "bg-green-500/10 text-green-500 border-green-500/20",
            marketing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
            technology: "bg-orange-500/10 text-orange-500 border-orange-500/20",
            "customer-experience": "bg-pink-500/10 text-pink-500 border-pink-500/20",
            other: "bg-gray-500/10 text-gray-500 border-gray-500/20"
        };
        return colors[cat];
    };

    const getStatusColor = (status: IdeaStatus) => {
        const colors = {
            draft: "bg-gray-500/10 text-gray-500",
            submitted: "bg-blue-500/10 text-blue-500",
            "under-review": "bg-yellow-500/10 text-yellow-500",
            approved: "bg-green-500/10 text-green-500",
            implemented: "bg-purple-500/10 text-purple-500",
            rejected: "bg-red-500/10 text-red-500"
        };
        return colors[status];
    };

    const filterIdeas = (ideas: Idea[]) => {
        return ideas.filter(idea => {
            const matchesCategory = categoryFilter === "all" || idea.category === categoryFilter;
            const matchesStatus = statusFilter === "all" || idea.status === statusFilter;
            return matchesCategory && matchesStatus;
        });
    };

    const renderIdeaCard = (idea: Idea) => (
        <Card
            key={idea.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
                setSelectedIdea(idea);
                setIsDetailDialogOpen(true);
            }}
        >
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCategoryColor(idea.category)}>
                                {idea.category}
                            </Badge>
                            <Badge className={getStatusColor(idea.status)}>
                                {idea.status}
                            </Badge>
                            {idea.isPublic && (
                                <Badge variant="outline" className="text-xs">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Public
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg">{idea.title}</CardTitle>
                        <CardDescription className="mt-1">
                            by {idea.createdByName} • {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {idea.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleLikeIdea(idea.id);
                        }}
                        className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                        <Heart className={`w-4 h-4 ${idea.likes.includes(user?.id || "") ? "fill-red-500 text-red-500" : ""}`} />
                        {idea.likes.length}
                    </button>
                    <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {idea.comments.length}
                    </div>
                    {idea.sharedWith.length > 0 && (
                        <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            {idea.sharedWith.length}
                        </div>
                    )}
                </div>
                {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {idea.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-muted rounded-full text-xs">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderIdeaList = (ideas: Idea[], emptyMessage: string) => {
        const filteredIdeas = filterIdeas(ideas);

        if (filteredIdeas.length === 0) {
            return (
                <div className="text-center py-12 text-muted-foreground">
                    <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{emptyMessage}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIdeas.map(renderIdeaCard)}
            </div>
        );
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        Idea Board
                    </h1>
                    <p className="text-muted-foreground">Share and collaborate on innovative ideas</p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Idea
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="process">Process</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="customer-experience">Customer Experience</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under-review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="implemented">Implemented</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Tabs defaultValue="my-board" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="my-board">My Board</TabsTrigger>
                    <TabsTrigger value="shared-with-me">Shared with Me</TabsTrigger>
                    <TabsTrigger value="all-ideas">All Ideas</TabsTrigger>
                </TabsList>

                <TabsContent value="my-board">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Ideas</CardTitle>
                            <CardDescription>Ideas you've created and submitted</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderIdeaList(myIdeas, "You haven't created any ideas yet")}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shared-with-me">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shared with Me</CardTitle>
                            <CardDescription>Ideas that have been shared with you</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderIdeaList(sharedWithMe, "No ideas have been shared with you")}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="all-ideas">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Public Ideas</CardTitle>
                            <CardDescription>Browse all public ideas from your team</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderIdeaList(publicIdeas, "No public ideas available")}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Idea Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create New Idea</DialogTitle>
                        <DialogDescription>
                            Share your innovative idea with the team
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Enter idea title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your idea in detail"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select value={category} onValueChange={(val) => setCategory(val as IdeaCategory)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="product">Product</SelectItem>
                                        <SelectItem value="process">Process</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="customer-experience">Customer Experience</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select value={isPublic ? "public" : "private"} onValueChange={(val) => setIsPublic(val === "public")}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public (Visible to all)</SelectItem>
                                        <SelectItem value="private">Private (Share with specific users)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                                id="tags"
                                placeholder="e.g., innovation, automation, ui"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateIdea}>Create Idea</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Idea Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    {selectedIdea && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start gap-2 mb-2">
                                    <Badge className={getCategoryColor(selectedIdea.category)}>
                                        {selectedIdea.category}
                                    </Badge>
                                    <Badge className={getStatusColor(selectedIdea.status)}>
                                        {selectedIdea.status}
                                    </Badge>
                                </div>
                                <DialogTitle className="text-xl">{selectedIdea.title}</DialogTitle>
                                <DialogDescription>
                                    by {selectedIdea.createdByName} • {formatDistanceToNow(new Date(selectedIdea.createdAt), { addSuffix: true })}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {selectedIdea.description}
                                    </p>
                                </div>

                                {selectedIdea.tags && selectedIdea.tags.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedIdea.tags.map((tag, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-muted rounded-full text-xs">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 pt-2 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleLikeIdea(selectedIdea.id)}
                                        className="gap-2"
                                    >
                                        <Heart className={`w-4 h-4 ${selectedIdea.likes.includes(user?.id || "") ? "fill-red-500 text-red-500" : ""}`} />
                                        {selectedIdea.likes.length} Likes
                                    </Button>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-3">Comments ({selectedIdea.comments.length})</h4>
                                    <div className="space-y-3 mb-4">
                                        {selectedIdea.comments.map((comment) => (
                                            <div key={comment.id} className="bg-muted p-3 rounded-lg">
                                                <div className="flex items-start justify-between mb-1">
                                                    <span className="font-medium text-sm">{comment.userName}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{comment.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add a comment..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddComment();
                                                }
                                            }}
                                        />
                                        <Button onClick={handleAddComment} size="sm">
                                            Post
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
