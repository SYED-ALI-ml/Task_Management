import { Task } from "@/types";
import { TaskStats } from "@/components/tasks/task-stats";
import { TaskList } from "@/components/tasks/task-list";

interface EmployeeDashboardProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export function EmployeeDashboard({ tasks, onTaskClick }: EmployeeDashboardProps) {
    // Compute stats for THIS employee
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const pendingTasks = tasks.filter((t) => t.status === "pending").length;
    const overdueTasks = tasks.filter((t) => t.status === "overdue").length;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
                <p className="text-muted-foreground">Overview of your assigned tasks</p>
            </div>

            <TaskStats
                totalTasks={totalTasks}
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                overdueTasks={overdueTasks}
            />

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">My Active Tasks</h2>
                {tasks.length === 0 ? (
                    <div className="p-12 text-center border rounded-lg bg-card">
                        <p className="text-muted-foreground">No tasks assigned to you yet.</p>
                    </div>
                ) : (
                    <TaskList tasks={tasks} onTaskClick={onTaskClick} />
                )}
            </div>
        </div>
    );
}
