import { Task } from "@/types";
import { TaskList } from "@/components/tasks/task-list";
import { ActivityLogView } from "@/components/dashboard/activity-log";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Users, TrendingUp, Clock, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
  tasks: Task[];
  loading: boolean;
  onTaskClick: (task: Task) => void;
  onNewTask: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
}

export const DashboardOverview = ({
  onNavigate,
  tasks,
  loading,
  onTaskClick,
  onNewTask,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange
}: DashboardOverviewProps) => {
  // Fetch additional data
  const users = useLiveQuery(() => db.users.toArray()) || [];
  const projects = useLiveQuery(() => db.projects.toArray()) || [];
  const teams = useLiveQuery(() => db.teams.toArray()) || [];

  // Compute basic stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const overdueTasks = tasks.filter((t) => t.status === "overdue").length;

  // Calculate completion percentage
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Team member workload analysis
  const memberWorkload = users.map(user => {
    const userTasks = tasks.filter(t => t.assignedTo === user.id);
    const userCompleted = userTasks.filter(t => t.status === "completed").length;
    const userActive = userTasks.filter(t => t.status !== "completed" && !t.isDeleted).length;

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      totalTasks: userTasks.length,
      activeTasks: userActive,
      completedTasks: userCompleted,
      completionRate: userTasks.length > 0 ? Math.round((userCompleted / userTasks.length) * 100) : 0
    };
  }).filter(m => m.totalTasks > 0)
    .sort((a, b) => b.activeTasks - a.activeTasks)
    .slice(0, 5);

  // Project progress analysis
  const activeProjects = projects.filter(p => p.status === "active");
  const projectProgress = activeProjects.map(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const projectCompleted = projectTasks.filter(t => t.status === "completed").length;
    const progress = projectTasks.length > 0 ? Math.round((projectCompleted / projectTasks.length) * 100) : 0;

    return {
      id: project.id,
      name: project.name,
      totalTasks: projectTasks.length,
      completedTasks: projectCompleted,
      remainingTasks: projectTasks.length - projectCompleted,
      progress,
      teams: project.teams?.length || 0
    };
  }).sort((a, b) => b.totalTasks - a.totalTasks)
    .slice(0, 4);

  // Work distribution by priority
  const urgentTasks = tasks.filter(t => t.priority === "urgent" && t.status !== "completed").length;
  const highPriorityTasks = tasks.filter(t => t.priority === "high" && t.status !== "completed").length;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete overview of team performance and project progress</p>
        </div>
        <Button onClick={onNewTask} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <SelectValue placeholder="Filter by Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <SelectValue placeholder="Filter by Priority" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% completion rate
            </p>
            <Progress value={completionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">Active work items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              {urgentTasks + highPriorityTasks} high priority
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Workload & Project Progress */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Member Workload */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Workload
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("directory")}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberWorkload.length > 0 ? (
                memberWorkload.map((member) => (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{member.activeTasks}</p>
                        <p className="text-xs text-muted-foreground">active</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={member.completionRate} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {member.completionRate}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No active tasks assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ongoing Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Ongoing Projects
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("projects")}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectProgress.length > 0 ? (
                projectProgress.map((project) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{project.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {project.teams} teams
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {project.remainingTasks} remaining
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{project.completedTasks}/{project.totalTasks}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={project.progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No active projects</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks & Activity Log */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Tasks</h2>
            <Button variant="link" onClick={() => onNavigate("all-tasks")}>
              View All
            </Button>
          </div>

          {loading ? (
            <div className="p-12 text-center border rounded-lg bg-card">
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          ) : (
            <TaskList tasks={tasks.slice(0, 5)} onTaskClick={onTaskClick} />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityLogView />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}