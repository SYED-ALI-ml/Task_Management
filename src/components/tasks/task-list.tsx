import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Calendar, MoreVertical, Folder, Users } from "lucide-react";
import { Task } from "@/types";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const statusColors = {
  pending: "bg-warning text-warning-foreground",
  "in-progress": "bg-info text-info-foreground",
  completed: "bg-success text-success-foreground",
  overdue: "bg-destructive text-destructive-foreground"
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning text-warning-foreground",
  high: "bg-destructive text-destructive-foreground",
  urgent: "bg-destructive text-destructive-foreground border-destructive"
};

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  const projects = useLiveQuery(() => db.projects.toArray()) || [];
  const teams = useLiveQuery(() => db.teams.toArray()) || [];

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || "Unknown Project";
  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || "Unknown Team";

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onTaskClick?.(task)}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-semibold text-card-foreground">{task.title}</h3>
                  <Badge className={statusColors[task.status]} variant="secondary">
                    {task.status.replace("-", " ")}
                  </Badge>
                  <Badge className={priorityColors[task.priority]} variant="outline">
                    {task.priority}
                  </Badge>
                  {task.projectId && (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs font-normal">
                      <Folder className="w-3 h-3" />
                      {getProjectName(task.projectId)}
                    </Badge>
                  )}
                  {task.teamId && (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs font-normal">
                      <Users className="w-3 h-3" />
                      {getTeamName(task.teamId)}
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{task.description}</p>

                <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{task.assignedToName || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{task.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Created {task.createdAt}</span>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">No tasks found</h3>
          <p className="text-muted-foreground">Create your first task to get started</p>
        </div>
      )}
    </div>
  );
}