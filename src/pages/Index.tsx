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
import { useLiveQuery } from "dexie-react-hooks";
import { db, seedDatabase } from "@/db";
import { useAuth } from "@/context/AuthContext";
import Settings from "./Settings";
import { DirectoryView } from "@/components/dashboard/directory-view";
import { NewTaskSheet } from "@/components/tasks/new-task-sheet";
import { LeaveManagement } from "./LeaveManagement";
import { Attendance } from "./Attendance";
import { IdeaBoard } from "./IdeaBoard";
import { ProjectManagement } from "./ProjectManagement";
import { CRMDashboard } from "@/components/crm/crm-dashboard";
import { LeadsView } from "@/components/crm/leads-view";
import { ContactsView } from "@/components/crm/contacts-view";
import { CompaniesView } from "@/components/crm/companies-view";
import { ProductsView } from "@/components/crm/products-view";
import { QuotationsView } from "@/components/crm/quotations-view";
import { IntegrationsView } from "@/components/crm/integrations-view";

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [isNewTaskSheetOpen, setIsNewTaskSheetOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Seed database on mount
  useEffect(() => {
    seedDatabase();
  }, []);

  // Fetch tasks from local DB
  const allTasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const loading = !allTasks;

  // Filter tasks based on role and deleted status
  const isAdmin = user?.role === "Admin" || user?.role === "Manager";
  const activeTasks = allTasks.filter(t => !t.isDeleted);
  const deletedTasks = allTasks.filter(t => t.isDeleted);

  const myTasks = activeTasks.filter(t => t.assignedTo === user?.id);

  // Dashboard tasks: Admin sees all active, Employee sees theirs
  const baseDashboardTasks = isAdmin ? activeTasks : myTasks;

  // Apply filters and search
  const dashboardTasks = baseDashboardTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Compute TaskStats (global or personal)
  const statsTasks = baseDashboardTasks;
  const totalTasks = statsTasks.length;
  const completedTasks = statsTasks.filter((t) => t.status === "completed").length;
  const pendingTasks = statsTasks.filter((t) => t.status === "pending").length;
  const overdueTasks = statsTasks.filter((t) => t.status === "overdue").length;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskSheetOpen(true);
  };

  const handleAddFollowUp = async (taskId: string, content: string) => {
    if (!user) return;

    const newFollowUp: FollowUp = {
      id: `f${Date.now()}`,
      content,
      author: user,
      createdAt: format(new Date(), "MMM d, yyyy h:mm a")
    };

    const task = await db.tasks.get(taskId);
    if (task) {
      const updatedFollowUps = [...(task.followUps || []), newFollowUp];
      await db.tasks.update(taskId, { followUps: updatedFollowUps });

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...task, followUps: updatedFollowUps });
      }
    }
  };

  const handleCreateTask = async (taskData: any) => {
    const newTask: Task = {
      id: `t${Date.now()}`,
      ...taskData,
      createdAt: format(new Date(), "MMM d, yyyy"),
      followUps: [],
      isDeleted: false
    };

    await db.tasks.add(newTask);

    // Notify Assignee
    if (newTask.assignedTo) {
      const assigneeUser = await db.users.get(newTask.assignedTo);
      if (assigneeUser) {
        await db.notifications.add({
          id: `n${Date.now()}`,
          userId: assigneeUser.id,
          type: "task",
          priority: newTask.priority === "urgent" ? "high" : "medium",
          title: "New Task Assigned",
          message: `You have been assigned a new task: ${newTask.title}`,
          link: "/my-tasks",
          createdAt: new Date().toISOString(),
          isRead: false,
          metadata: { taskId: newTask.id }
        });
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Soft delete
    await db.tasks.update(taskId, { isDeleted: true });
  };

  const handleRestoreTask = async (taskId: string) => {
    await db.tasks.update(taskId, { isDeleted: false });
  };

  const handlePermanentDeleteTask = async (taskId: string) => {
    await db.tasks.delete(taskId);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    await db.tasks.update(taskId, updates);
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, ...updates });
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
        // Only Admin should see "All Tasks" ideally, but keeping it accessible for now
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">All Tasks</h1>
              <p className="text-muted-foreground">Complete overview of all tasks in the system</p>
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
      default:
        return null;
    }
  };

  if (activeTab === "dashboard-details") {
    return renderContent();
  }

  return (
    <div className="min-h-screen bg-background flex dark">
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
    </div>
  );
};


export default Index;
