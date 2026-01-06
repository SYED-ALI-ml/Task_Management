import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { DashboardDetailView } from "@/components/dashboard/dashboard-detail-view";
import { TaskStats } from "@/components/tasks/task-stats";
import { TaskList } from "@/components/tasks/task-list";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { Task, FollowUp } from "@/types";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, createActivityLog } from "@/lib/api";
import api from "@/lib/api";
import Settings from "./Settings";
import { DirectoryView } from "@/components/dashboard/directory-view";
import { NewTaskSheet } from "@/components/tasks/new-task-sheet";
import { LeaveManagement } from "./LeaveManagement";
import { Attendance } from "./Attendance";
import { IdeaBoard } from "./IdeaBoard";
import { ProjectManagement } from "./ProjectManagement";
import { LinksManagement } from "./LinksManagement";
import { HelpWidget } from "@/components/support/help-widget";
import { CRMDashboard } from "./crm/CRMDashboard";
import { LeadsView } from "./crm/LeadsView";
import { ContactsView } from "./crm/ContactsView";
import { CompaniesView } from "./crm/CompaniesView";
import { ProductsView } from "./crm/ProductsView";
import { QuotationsView } from "./crm/QuotationsView";
import { IntegrationsView } from "./crm/IntegrationsView";
import { BillingDashboard } from "./billing/BillingDashboard";

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [isNewTaskSheetOpen, setIsNewTaskSheetOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Fetch tasks from MySQL
  const { data: allTasks = [], isLoading: loading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks
  });

  const queryClient = useQueryClient();

  // Filter tasks based on role and deleted status
  const isAdmin = user?.role === "Admin" || user?.role === "Manager";
  // Assuming API returns all tasks, we filter locally for now. 
  // In a real app, filtering should happen on backend.
  const activeTasks = allTasks.filter((t: Task) => !t.isDeleted);
  const deletedTasks = allTasks.filter((t: Task) => t.isDeleted);

  const myTasks = activeTasks.filter((t: Task) => t.assignedTo === user?.id);

  // Dashboard tasks: Admin sees all active, Employee sees theirs
  const baseDashboardTasks = isAdmin ? activeTasks : myTasks;

  // Apply filters and search
  const dashboardTasks = baseDashboardTasks.filter((task: Task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Compute TaskStats (global or personal)
  const statsTasks = baseDashboardTasks;
  const totalTasks = statsTasks.length;
  const completedTasks = statsTasks.filter((t: Task) => t.status === "completed").length;
  const pendingTasks = statsTasks.filter((t: Task) => t.status === "pending").length;
  const overdueTasks = statsTasks.filter((t: Task) => t.status === "overdue").length;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskSheetOpen(true);
  };

  const handleAddFollowUp = async (taskId: string, content: string) => {
    if (!user) return;
    // TODO: Implement API for follow-ups
    console.log("Follow-up implementation pending for MySQL");
  };

  const handleCreateTask = async (taskData: any) => {
    const newTask: Task = {
      id: `t${Date.now()}`,
      ...taskData,
      createdAt: format(new Date(), "MMM d, yyyy"),
      followUps: [],
      isDeleted: false
    };

    try {
      await api.post('/tasks', {
        ...taskData,
        id: newTask.id,
        projectId: taskData.projectId,
        teamId: taskData.teamId,
        assignedTo: taskData.assignedTo,
        priority: taskData.priority,
        status: taskData.status || "pending",
        dueDate: taskData.dueDate
      });

      // Log activity
      if (user) {
        await createActivityLog({
          entityType: "task",
          entityId: newTask.id,
          entityName: taskData.title,
          action: "created",
          userId: user.id,
          userName: user.name,
          details: `Task created in ${taskData.projectId ? 'Project' : 'General'}`
        });
      }

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    } catch (e) {
      console.error("Failed to create task", e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Soft delete implementation via API (updating isDeleted status if backend supports it, or just deleting)
    // For now, mapping soft-delete to direct delete or status update depending on requirement.
    // Assuming permanent delete for MVP or verify if 'isDeleted' column exists in schema.
    // Checking schema: tasks table does NOT have is_deleted column. So standard DELETE.
    try {
      await api.delete(`/tasks/${taskId}`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (e) {
      console.error("Failed to delete task", e);
    }
  };

  const handleRestoreTask = async (taskId: string) => {
    // Not applicable as we are doing permanent delete above
    console.log("Restore not implemented for SQL version yet");
  };

  const handlePermanentDeleteTask = async (taskId: string) => {
    try {
      const taskToDelete = allTasks.find((t: Task) => t.id === taskId);
      await api.delete(`/tasks/${taskId}`);

      // Log activity
      if (user && taskToDelete) {
        await createActivityLog({
          entityType: "task",
          entityId: taskId,
          entityName: taskToDelete.title,
          action: "deleted",
          userId: user.id,
          userName: user.name,
          details: "Task permanently deleted"
        });
      }

      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    } catch (e) {
      console.error("Failed to delete task", e);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await api.patch(`/tasks/${taskId}`, updates);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, ...updates });
      }
    } catch (e) {
      console.error("Failed to update task", e);
    }
  };

  const renderContent = () => {
    if (activeTab === "dashboard-details") {
      return <DashboardDetailView onBack={() => setActiveTab("dashboard")} />;
    }

    switch (activeTab) {
      case "dashboard":
        return isAdmin ? (
          <DashboardOverview
            onNavigate={setActiveTab}
            tasks={dashboardTasks}
            loading={loading}
            onTaskClick={handleTaskClick}
            onNewTask={() => setIsNewTaskSheetOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
          />
        ) : (
          <EmployeeDashboard tasks={myTasks} onTaskClick={handleTaskClick} />
        );
      case "projects":
        return <ProjectManagement />;
      case "my-tasks":
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">My Tasks</h1>
              <p className="text-muted-foreground">Tasks assigned to you</p>
            </div>
            <TaskStats totalTasks={myTasks.length} completedTasks={myTasks.filter(t => t.status === "completed").length} pendingTasks={myTasks.filter(t => t.status === "pending").length} overdueTasks={myTasks.filter(t => t.status === "overdue").length} />
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">Loading tasks...</div>
            ) : (
              <TaskList tasks={myTasks} onTaskClick={handleTaskClick} />
            )}
          </div>
        );
      case "delegated":
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Delegated Tasks</h1>
              <p className="text-muted-foreground">Tasks you've delegated or subscribed to</p>
            </div>
            <TaskList tasks={[]} onTaskClick={handleTaskClick} />
          </div>
        );
      case "all-tasks":
        // All users can view all tasks, but can only edit tasks assigned to them
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">All Tasks</h1>
              <p className="text-muted-foreground">
                Complete overview of all tasks in the system {!isAdmin && "(Read-only for tasks not assigned to you)"}
              </p>
            </div>
            <TaskStats totalTasks={totalTasks} completedTasks={completedTasks} pendingTasks={pendingTasks} overdueTasks={overdueTasks} />
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">Loading tasks...</div>
            ) : (
              <TaskList tasks={activeTasks} onTaskClick={handleTaskClick} />
            )}
          </div>
        );
      case "templates":
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Task Templates</h1>
              <p className="text-muted-foreground">Reusable task templates with custom variables</p>
            </div>
            <TaskList tasks={[]} onTaskClick={handleTaskClick} />
          </div>
        );
      case "directory":
        return <DirectoryView />;
      case "deleted":
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Deleted Tasks</h1>
              <p className="text-muted-foreground">Recover or permanently delete tasks</p>
            </div>
            {deletedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <p>No deleted tasks found</p>
              </div>
            ) : (
              <TaskList tasks={deletedTasks} onTaskClick={handleTaskClick} />
            )}
          </div>
        );
      case "leave-management":
        return <LeaveManagement />;
      case "attendance":
        return <Attendance />;
      case "idea-board":
        return <IdeaBoard />;
      case "links":
        return <LinksManagement />;
      case "settings":
        return <Settings />;
      // CRM Routes
      case "crm-dashboard":
        return <CRMDashboard />;
      case "leads":
        return <LeadsView />;
      case "contacts":
        return <ContactsView />;
      case "companies":
        return <CompaniesView />;
      case "products":
        return <ProductsView />;
      case "quotations":
        return <QuotationsView />;
      case "integrations":
        return <IntegrationsView />;
      case "billing":
        return <BillingDashboard />;
      default:
        return null;
    }
  };

  if (activeTab === "dashboard-details") {
    return renderContent();
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex dark">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>

      <TaskDetailSheet
        task={selectedTask}
        isOpen={isTaskSheetOpen}
        onClose={() => setIsTaskSheetOpen(false)}
        onAddFollowUp={handleAddFollowUp}
        onDelete={handleDeleteTask}
        onRestore={handleRestoreTask}
        onPermanentDelete={handlePermanentDeleteTask}
        onUpdate={handleUpdateTask}
      />

      <NewTaskSheet
        isOpen={isNewTaskSheetOpen}
        onClose={() => setIsNewTaskSheetOpen(false)}
        onCreate={handleCreateTask}
      />

      <HelpWidget />
    </div>
  );
};


export default Index;
