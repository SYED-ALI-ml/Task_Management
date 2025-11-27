import {
  LayoutDashboard,
  CheckSquare,
  Users,
  FolderOpen,
  FileText,
  Building2,
  Lightbulb,
  Link,
} from "lucide-react";
import { FeatureCard } from "./feature-card";
import { TaskList } from "@/components/tasks/task-list";

interface DashboardOverviewProps {
  onNavigate: (section: string) => void;
  tasks?: any[];
  loading?: boolean;
  rawPreview?: { headers: string[]; rows: any[][] } | null;
}

export function DashboardOverview({ onNavigate, tasks, loading, rawPreview }: DashboardOverviewProps) {
  const features = [
    {
      title: "TaskDashboard",
      description: "Clear view of your performance anytime",
      icon: LayoutDashboard,
      buttonText: "Go To Dashboard",
      action: () => onNavigate("dashboard-details")
    },

  ];

  // Aggregate tasks by assignee for the Employee Wise table
  const aggregateByAssignee = (taskList?: any[]) => {
    if (!taskList || taskList.length === 0) return [];
    const map: Record<string, { name: string; total: number; overdue: number; pending: number; inProgress: number; inTime: number; delayed: number; }> = {};
    const now = Date.now();
    taskList.forEach((t: any) => {
      const assignee = t.assignee || t.owner || "Unassigned";
      const name = assignee;
      if (!map[assignee]) {
        map[assignee] = { name, total: 0, overdue: 0, pending: 0, inProgress: 0, inTime: 0, delayed: 0 };
      }
      const row = map[assignee];
      row.total += 1;
      const status = (t.status || "").toString().toLowerCase();
      const priority = (t.priority || "").toString().toLowerCase();
      if (status === "overdue") row.overdue += 1;
      if (status === "pending") row.pending += 1;
      if (status === "in-progress" || status === "in progress") row.inProgress += 1;
      if (status === "completed") row.inTime += 1;
      // simple heuristic for delayed: overdue OR high/urgent and not completed
      if (status === "overdue" || ((priority === "high" || priority === "urgent") && status !== "completed")) row.delayed += 1;
    });
    return Object.values(map);
  };
  const employeeRows = aggregateByAssignee(tasks);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            buttonText={feature.buttonText}
            buttonVariant={feature.buttonVariant}
            onClick={feature.action}
          />
        ))}
      </div>

      {/* Bottom Section: Recent Tasks */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Tasks</h2>
          <button className="text-sm text-primary" onClick={() => onNavigate("my-tasks")}>View all</button>
        </div>
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading tasks from Google Sheets…</div>
        ) : (
          <>
            {/* Employee Wise table */}
            <div className="mt-4 bg-card/50 rounded p-4">
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-3 px-4">Employee Name</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Overdue</th>
                      <th className="py-3 px-4">Pending</th>
                      <th className="py-3 px-4">In-Progress</th>
                      <th className="py-3 px-4">In Time</th>
                      <th className="py-3 px-4">Delayed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">No data available</td>
                      </tr>
                    ) : (
                      employeeRows.map((r, i) => (
                        <tr key={i} className="border-t border-muted/20">
                          <td className="py-3 px-4 font-medium">{r.name}</td>
                          <td className="py-3 px-4">{r.total}</td>
                          <td className="py-3 px-4 text-destructive">{r.overdue}</td>
                          <td className="py-3 px-4 text-warning">{r.pending}</td>
                          <td className="py-3 px-4 text-yellow-400">{r.inProgress}</td>
                          <td className="py-3 px-4 text-success">{r.inTime}</td>
                          <td className="py-3 px-4 text-destructive">{r.delayed}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tasks List */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">Tasks from Google Sheet</h2>
              </div>
              {tasks && tasks.length > 0 ? (
                <TaskList tasks={tasks} />
              ) : (
                <div className="p-6 text-center text-muted-foreground">No tasks available</div>
              )}
            </div>

            {rawPreview && (
              <div className="mt-6 bg-muted/50 rounded p-4 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <strong>Sheet Preview</strong>
                  <span className="text-muted-foreground">(first {rawPreview.rows.length} rows)</span>
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {rawPreview.headers.map((h, i) => (
                          <th key={i} className="text-left pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawPreview.rows.map((row, r) => (
                        <tr key={r} className="align-top">
                          {rawPreview!.headers.map((_, c) => (
                            <td key={c} className="pr-4 align-top">{String(row[c] ?? "")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}