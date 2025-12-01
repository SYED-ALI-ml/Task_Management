import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAuth } from "@/context/AuthContext";
import { Project, Team } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FolderOpen, Users2, Calendar, TrendingUp, ListTodo, UserPlus, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TaskList } from "@/components/tasks/task-list";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProjectManagement() {
    const { user } = useAuth();
    const { toast } = useToast();

    // Permissions
    const canManage = user?.role === "Admin" || user?.role === "Manager";

    // Fetch data
    const allProjects = useLiveQuery(() => db.projects.toArray()) || [];
    const allTeams = useLiveQuery(() => db.teams.toArray()) || [];
    const allUsers = useLiveQuery(() => db.users.toArray()) || [];
    const allTasks = useLiveQuery(() => db.tasks.toArray()) || [];

    // Dialog states
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
    const [isAssignTeamOpen, setIsAssignTeamOpen] = useState(false);
    const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
    const [viewingProjectTasks, setViewingProjectTasks] = useState<string | null>(null);

    // Selection states
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    // Form states
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [teamName, setTeamName] = useState("");
    const [selectedTeamLead, setSelectedTeamLead] = useState("");
    const [selectedTeamIdToAssign, setSelectedTeamIdToAssign] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    // --- Handlers ---

    const handleCreateProject = async () => {
        if (!projectName || !projectDescription || !user) {
            toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
            return;
        }

        const newProject: Project = {
            id: `proj${Date.now()}`,
            name: projectName,
            description: projectDescription,
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            teams: [],
            status: "active"
        };

        await db.projects.add(newProject);
        toast({ title: "Success", description: "Project created successfully!" });
        setProjectName("");
        setProjectDescription("");
        setIsCreateProjectOpen(false);
    };

    const handleCreateTeam = async () => {
        if (!teamName || !selectedTeamLead) {
            toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        // Check for duplicate name
        const existingTeam = allTeams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
        if (existingTeam) {
            toast({ title: "Error", description: "A team with this name already exists.", variant: "destructive" });
            return;
        }

        const newTeam: Team = {
            id: `team${Date.now()}`,
            name: teamName,
            members: [selectedTeamLead], // Lead is automatically a member
            leadId: selectedTeamLead,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.teams.add(newTeam);
        toast({ title: "Success", description: "Team created successfully!" });
        setTeamName("");
        setSelectedTeamLead("");
        setIsCreateTeamOpen(false);
    };

    const handleAssignTeamToProject = async () => {
        if (!selectedProject || !selectedTeamIdToAssign) return;

        const updatedTeams = [...(selectedProject.teams || []), selectedTeamIdToAssign];
        await db.projects.update(selectedProject.id, {
            teams: updatedTeams,
            updatedAt: new Date().toISOString()
        });

        toast({ title: "Success", description: "Team assigned to project!" });
        setIsAssignTeamOpen(false);
        setSelectedTeamIdToAssign("");
    };

    const handleUpdateMembers = async () => {
        if (!selectedTeam) return;

        await db.teams.update(selectedTeam.id, {
            members: selectedMembers,
            updatedAt: new Date().toISOString()
        });

        toast({ title: "Success", description: "Team members updated!" });
        setIsManageMembersOpen(false);
    };

    const openManageMembers = (team: Team) => {
        setSelectedTeam(team);
        setSelectedMembers(team.members);
        setIsManageMembersOpen(true);
    };

    const openAssignTeam = (project: Project) => {
        setSelectedProject(project);
        setIsAssignTeamOpen(true);
    };

    // --- Helpers ---

    const getProjectStats = (projectId: string) => {
        const projectTasks = allTasks.filter(t => t.projectId === projectId && !t.isDeleted);
        const projectTeams = allTeams.filter(t => allProjects.find(p => p.id === projectId)?.teams?.includes(t.id));

        return {
            totalTasks: projectTasks.length,
            completedTasks: projectTasks.filter(t => t.status === "completed").length,
            totalTeams: projectTeams.length,
        };
    };

    const getProjectTasks = (projectId: string) => {
        return allTasks.filter(t => t.projectId === projectId && !t.isDeleted);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: "bg-green-500/10 text-green-500",
            "on-hold": "bg-yellow-500/10 text-yellow-500",
            completed: "bg-blue-500/10 text-blue-500",
            archived: "bg-gray-500/10 text-gray-500"
        };
        return colors[status] || "";
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <FolderOpen className="w-6 h-6 text-primary" />
                        Project & Team Management
                    </h1>
                    <p className="text-muted-foreground">Manage your organization's structure</p>
                </div>
            </div>

            <Tabs defaultValue="projects" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="teams">Teams</TabsTrigger>
                </TabsList>

                {/* --- PROJECTS TAB --- */}
                <TabsContent value="projects" className="space-y-4">
                    <div className="flex justify-end">
                        {canManage && (
                            <Button onClick={() => setIsCreateProjectOpen(true)} className="bg-primary">
                                <Plus className="w-4 h-4 mr-2" />
                                New Project
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allProjects.map(project => {
                            const stats = getProjectStats(project.id);
                            const assignedTeams = allTeams.filter(t => project.teams?.includes(t.id));

                            return (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow flex flex-col">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <CardTitle className="text-lg">{project.name}</CardTitle>
                                            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                                        </div>
                                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col">
                                        <div className="space-y-4 flex-1">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-2 bg-muted rounded-lg">
                                                    <p className="text-xs text-muted-foreground">Teams</p>
                                                    <p className="text-sm font-semibold">{stats.totalTeams}</p>
                                                </div>
                                                <div className="p-2 bg-muted rounded-lg">
                                                    <p className="text-xs text-muted-foreground">Tasks</p>
                                                    <p className="text-sm font-semibold">{stats.completedTasks}/{stats.totalTasks}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs text-muted-foreground mb-2">Assigned Teams:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {assignedTeams.length > 0 ? assignedTeams.map(team => (
                                                        <Badge key={team.id} variant="secondary" className="text-xs">
                                                            {team.name}
                                                        </Badge>
                                                    )) : <span className="text-xs text-muted-foreground italic">No teams assigned</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-4 border-t flex justify-between items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setViewingProjectTasks(project.id)}>
                                                <ListTodo className="w-4 h-4 mr-2" />
                                                View Tasks
                                            </Button>
                                            {canManage && (
                                                <Button variant="outline" size="sm" onClick={() => openAssignTeam(project)}>
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Assign Team
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* --- TEAMS TAB --- */}
                <TabsContent value="teams" className="space-y-4">
                    <div className="flex justify-end">
                        {canManage && (
                            <Button onClick={() => setIsCreateTeamOpen(true)} className="bg-primary">
                                <Plus className="w-4 h-4 mr-2" />
                                New Team
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allTeams.map(team => {
                            const lead = allUsers.find(u => u.id === team.leadId);
                            const memberCount = team.members.length;

                            return (
                                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{team.name}</CardTitle>
                                            <Badge variant="outline">{memberCount} Members</Badge>
                                        </div>
                                        <CardDescription>Lead: {lead?.name || "Unknown"}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-2">Projects:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {allProjects.filter(p => p.teams?.includes(team.id)).map(p => (
                                                        <Badge key={p.id} variant="secondary" className="text-xs">
                                                            {p.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {canManage && (
                                                <Button variant="outline" size="sm" className="w-full" onClick={() => openManageMembers(team)}>
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Manage Members
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>

            {/* --- DIALOGS --- */}

            {/* Create Project */}
            <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>Define a new project.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="p-name">Name</Label>
                            <Input id="p-name" value={projectName} onChange={e => setProjectName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="p-desc">Description</Label>
                            <Textarea id="p-desc" value={projectDescription} onChange={e => setProjectDescription(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateProject}>Create Project</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Team */}
            <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                        <DialogDescription>Create a unique team.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="t-name">Team Name</Label>
                            <Input id="t-name" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Mobile Devs" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="t-lead">Team Lead</Label>
                            <Select value={selectedTeamLead} onValueChange={setSelectedTeamLead}>
                                <SelectTrigger><SelectValue placeholder="Select Lead" /></SelectTrigger>
                                <SelectContent>
                                    {allUsers.filter(u => u.role === "Manager" || u.role === "Admin").map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateTeam}>Create Team</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Team */}
            <Dialog open={isAssignTeamOpen} onOpenChange={setIsAssignTeamOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Team to {selectedProject?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Select Team</Label>
                        <Select value={selectedTeamIdToAssign} onValueChange={setSelectedTeamIdToAssign}>
                            <SelectTrigger><SelectValue placeholder="Select Team" /></SelectTrigger>
                            <SelectContent>
                                {allTeams
                                    .filter(t => !selectedProject?.teams?.includes(t.id))
                                    .map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAssignTeamToProject}>Assign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Members */}
            <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Manage Members - {selectedTeam?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 max-h-[300px] overflow-y-auto space-y-2">
                        {allUsers.map(user => (
                            <div key={user.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`user-${user.id}`}
                                    checked={selectedMembers.includes(user.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedMembers([...selectedMembers, user.id]);
                                        } else {
                                            setSelectedMembers(selectedMembers.filter(id => id !== user.id));
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor={`user-${user.id}`}>{user.name} ({user.role})</Label>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdateMembers}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Tasks */}
            <Dialog open={!!viewingProjectTasks} onOpenChange={(open) => !open && setViewingProjectTasks(null)}>
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Project Tasks</DialogTitle>
                        <DialogDescription>
                            Tasks for {allProjects.find(p => p.id === viewingProjectTasks)?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {viewingProjectTasks && (
                            <TaskList tasks={getProjectTasks(viewingProjectTasks)} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
