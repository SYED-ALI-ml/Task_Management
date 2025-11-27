import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardDetailView } from "@/components/dashboard/dashboard-detail-view";
import { TaskStats } from "@/components/tasks/task-stats";
import { TaskList } from "@/components/tasks/task-list";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Mock data (fallback)
  const mockTasks = [
    {
      id: "1",
      title: "Design CRM Dashboard",
      description: "Create a modern and intuitive dashboard interface for the CRM system with task management capabilities.",
      status: "in-progress" as const,
      priority: "high" as const,
      assignee: "Snehasish",
      dueDate: "Oct 15, 2024",
      createdAt: "2 days ago"
    },
    {
      id: "2", 
      title: "Implement Task Automation",
      description: "Build automation features for recurring tasks and notification system.",
      status: "pending" as const,
      priority: "medium" as const,
      assignee: "Team Lead",
      dueDate: "Oct 20, 2024",
      createdAt: "1 day ago"
    },
    {
      id: "3",
      title: "Setup Database Schema", 
      description: "Design and implement the database structure for tasks, users, and company data.",
      status: "completed" as const,
      priority: "urgent" as const,
      assignee: "Backend Dev",
      dueDate: "Oct 10, 2024",
      createdAt: "5 days ago"
    }
  ];

  // Tasks loaded from Google Sheets (if configured)
  const [sheetTasks, setSheetTasks] = useState<typeof mockTasks | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetLoaded, setSheetLoaded] = useState(false);
  const [rawPreview, setRawPreview] = useState<{ headers: string[]; rows: any[][] } | null>(null);
  const SHEET_ID = import.meta.env.VITE_SHEET_ID;
  const SHEETS_API_KEY = import.meta.env.VITE_SHEETS_API_KEY; // optional
  const SHEET_GID = import.meta.env.VITE_SHEET_GID || "0"; // optional
  const SHEET_RANGE = import.meta.env.VITE_SHEET_RANGE || "Sheet1"; // optional for Sheets API

  useEffect(() => {
    // Only attempt fetch if a sheet id is provided
    if (!SHEET_ID) return;
    setSheetLoading(true);

    const parseValuesToTasks = (values: any[][]) => {
      if (!values || values.length === 0) return [];
      const headers = values[0].map((h: string) => String(h).trim().toLowerCase());
      const rows = values.slice(1);
      // capture a preview of the raw parsed rows to help debug mapping
      try {
        setRawPreview({ headers: headers.map(String), rows: rows.slice(0, 20) });
      } catch (e) {
        // ignore in case setRawPreview is unavailable
      }
      return rows.map((row: any[], idx: number) => {
        const obj: any = {};
        headers.forEach((head: string, i: number) => {
          obj[head] = row[i] ?? "";
        });

        // Map common header names to our Task shape
        return {
          id: obj.id || obj.task_id || String(idx + 1),
          title: obj.title || obj.name || "Untitled Task",
          description: obj.description || obj.notes || "",
          status: (obj.status || "pending").toString().toLowerCase(),
          priority: (obj.priority || "medium").toString().toLowerCase(),
          assignee: obj.assignee || obj.owner || "",
          dueDate: obj.due_date || obj.due || "",
          createdAt: obj.created_at || obj.created || "",
        } as any;
      });
    };

    // Robust CSV parser that handles quoted fields and commas inside quotes
    const parseCsvText = (text: string) => {
      const rows: string[][] = [];
      let current: string[] = [];
      let field = "";
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];

        if (inQuotes) {
          if (ch === '"') {
            if (next === '"') {
              // escaped quote
              field += '"';
              i++; // skip next
            } else {
              inQuotes = false;
            }
          } else {
            field += ch;
          }
        } else {
          if (ch === '"') {
            inQuotes = true;
          } else if (ch === ',') {
            current.push(field);
            field = "";
          } else if (ch === '\r') {
            // ignore, handle on \n
          } else if (ch === '\n') {
            current.push(field);
            rows.push(current);
            current = [];
            field = "";
          } else {
            field += ch;
          }
        }
      }
      // push last
      if (field !== "" || text.endsWith(",")) current.push(field);
      if (current.length) rows.push(current);
      return rows;
    };

    const fetchCsv = async () => {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error("Failed to fetch CSV from Google Sheets");
      const text = await res.text();
      const rows = parseCsvText(text).filter((r) => r.length > 0 && r.some((c) => c !== ""));
      return parseValuesToTasks(rows as any[][]);
    };

    const fetchSheetsApi = async () => {
      const range = SHEET_RANGE; // use env-provided range if set
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${SHEETS_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Sheets API request failed");
      const data = await res.json();
      return parseValuesToTasks(data.values || []);
    };

    (async () => {
      try {
        let tasks = [] as any[];
        if (SHEETS_API_KEY) {
          tasks = await fetchSheetsApi();
        } else {
          tasks = await fetchCsv();
        }

        // sanitize status/priority values to allowed set
        const normalized = tasks.map((t) => ({
          ...t,
          status: ["pending", "in-progress", "completed", "overdue"].includes(t.status) ? t.status : "pending",
          priority: ["low", "medium", "high", "urgent"].includes(t.priority) ? t.priority : "medium",
        }));

        setSheetTasks(normalized as any);
        setSheetLoaded(true);
      } catch (err) {
        // silently ignore - sheet may be private or not configured
        // console.warn(err);
      }
      finally {
        setSheetLoading(false);
      }
    })();
  }, []);

  const usingSheet = Boolean(SHEET_ID);
  const currentTasks = usingSheet ? (sheetLoaded ? sheetTasks ?? [] : []) : mockTasks;

  // Compute TaskStats from current tasks
  const totalTasks = currentTasks.length;
  const completedTasks = currentTasks.filter((t: any) => t.status === "completed").length;
  const pendingTasks = currentTasks.filter((t: any) => t.status === "pending").length;
  const overdueTasks = currentTasks.filter((t: any) => t.status === "overdue").length;

  const renderContent = () => {
    if (activeTab === "dashboard-details") {
      return <DashboardDetailView onBack={() => setActiveTab("dashboard")} />;
    }
    
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview onNavigate={setActiveTab} tasks={currentTasks} loading={sheetLoading} rawPreview={rawPreview} />;
      case "my-tasks":
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">My Tasks</h1>
              <p className="text-muted-foreground">Tasks assigned to you</p>
            </div>
            <TaskStats totalTasks={totalTasks} completedTasks={completedTasks} pendingTasks={pendingTasks} overdueTasks={overdueTasks} />
            {sheetLoading ? (
              <div className="p-6 text-center text-muted-foreground">Loading tasks from Google Sheets…</div>
            ) : (
              <TaskList tasks={currentTasks} />
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
            <TaskStats totalTasks={0} completedTasks={0} pendingTasks={0} overdueTasks={0} />
            <TaskList tasks={[]} />
          </div>
        );
      case "all-tasks":
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">All Tasks</h1>
              <p className="text-muted-foreground">Complete overview of all tasks in the system</p>
            </div>
            <TaskStats totalTasks={totalTasks} completedTasks={completedTasks} pendingTasks={pendingTasks} overdueTasks={overdueTasks} />
            {sheetLoading ? (
              <div className="p-6 text-center text-muted-foreground">Loading tasks from Google Sheets…</div>
            ) : (
              <TaskList tasks={currentTasks} />
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
            <TaskList tasks={[]} />
          </div>
        );
      case "directory":
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Directory</h1>
              <p className="text-muted-foreground">Contacts and companies directory</p>
            </div>
            <TaskList tasks={[]} />
          </div>
        );
      case "deleted":
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Deleted Tasks</h1>
              <p className="text-muted-foreground">Recover or permanently delete tasks</p>
            </div>
            <TaskList tasks={[]} />
          </div>
        );
      default:
        return <DashboardOverview onNavigate={setActiveTab} tasks={currentTasks} loading={sheetLoading} rawPreview={rawPreview} />;
    }
  };

  // Don't render main layout for dashboard details - it has its own layout
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
    </div>
  );
};

export default Index;
