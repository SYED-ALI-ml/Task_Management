import { useState } from "react";
import { ArrowLeft, Plus, ChevronDown, Filter, Search, X, Upload, Download, BarChart3, Table, Users, FolderOpen, FileText, FastForward, Calendar, Calendar1, TrendingUp, Tag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { TaskStats } from "@/components/tasks/task-stats";
import { TaskList } from "@/components/tasks/task-list";

interface DashboardDetailViewProps {
  onBack: () => void;
  initialView?: string;
}

export function DashboardDetailView({ onBack, initialView = "dashboard" }: DashboardDetailViewProps) {
  const [activeView, setActiveView] = useState(initialView);

  // Mock data for different views
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

  const renderContent = () => {
    switch (activeView) {
      case "idea-board":
        return (
          <div className="p-8">
            {/* Header with actions */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">IDEA BOARD</h1>
              <div className="flex items-center gap-4">
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add List
                </Button>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature Ideas</SelectItem>
                    <SelectItem value="improvement">Improvements</SelectItem>
                    <SelectItem value="bug">Bug Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 mb-8">
              <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
                <span className="text-foreground font-medium">My Board (0)</span>
              </div>
              <div className="flex items-center gap-2 pb-2">
                <span className="text-muted-foreground">Shared with me (0)</span>
              </div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-32 h-32 mb-6 opacity-60">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
                  <rect x="70" y="80" width="60" height="4" fill="hsl(var(--primary))" rx="2" />
                  <rect x="70" y="90" width="45" height="3" fill="hsl(var(--primary))" rx="1.5" />
                  <rect x="70" y="100" width="50" height="3" fill="hsl(var(--primary))" rx="1.5" />
                  <circle cx="150" cy="70" r="25" fill="hsl(var(--primary))" opacity="0.8" />
                  <path d="M140 70 L150 77 L160 63" stroke="white" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No Lists Created</h2>
              <p className="text-muted-foreground">Add a List to your Idea Board</p>
            </div>
          </div>
        );
      case "dashboard":
        return (
          <div className="p-8">
            {/* Date Range Filters */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <Button variant="ghost" className="text-muted-foreground">Today</Button>
              <Button variant="ghost" className="text-muted-foreground">Yesterday</Button>
              <Button className="bg-primary text-primary-foreground">This Week</Button>
              <Button variant="ghost" className="text-muted-foreground">Last Week</Button>
              <Button variant="ghost" className="text-muted-foreground">This Month</Button>
              <Button variant="ghost" className="text-muted-foreground">Last Month</Button>
              <Button variant="ghost" className="text-muted-foreground">This Year</Button>
              <Button variant="ghost" className="text-muted-foreground">All Time</Button>
              <Button variant="ghost" className="text-muted-foreground">Custom</Button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-card border border-destructive rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Overdue</span>
                </div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="bg-card border border-orange-500 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 border-2 border-orange-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="bg-card border border-warning rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span className="text-sm text-muted-foreground">In Progress</span>
                </div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="bg-card border border-success rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Completed</span>
                </div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="bg-card border border-primary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">In Time</span>
                </div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="bg-card border border-destructive rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Delayed</span>
                </div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Assigned To" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="me">Assigned to me</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 min-w-60">
                <Input placeholder="Search..." className="w-full" />
              </div>
              <Button variant="ghost" className="text-muted-foreground">
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 mb-6">
              <Button className="bg-primary text-primary-foreground">
                <Check className="w-4 h-4 mr-2" />
                Table
              </Button>
              <Button variant="ghost" className="text-muted-foreground">Bar Chart</Button>
            </div>

            {/* Report Tabs */}
            <div className="flex items-center gap-6 mb-6 border-b border-border overflow-x-auto">
              <div className="flex items-center gap-2 border-b-2 border-primary pb-2 whitespace-nowrap">
                <Users className="w-4 h-4" />
                <span className="text-foreground font-medium">Employee Wise</span>
              </div>
              <div className="flex items-center gap-2 pb-2 whitespace-nowrap">
                <FolderOpen className="w-4 h-4" />
                <span className="text-muted-foreground">Category Wise</span>
              </div>
              <div className="flex items-center gap-2 pb-2 whitespace-nowrap">
                <FileText className="w-4 h-4" />
                <span className="text-muted-foreground">My Report</span>
              </div>
              <div className="flex items-center gap-2 pb-2 whitespace-nowrap">
                <FastForward className="w-4 h-4" />
                <span className="text-muted-foreground">Delegated</span>
              </div>
              <div className="flex items-center gap-2 pb-2 whitespace-nowrap">
                <Calendar className="w-4 h-4" />
                <span className="text-muted-foreground">Daily Report</span>
              </div>
              <div className="flex items-center gap-2 pb-2 whitespace-nowrap">
                <Calendar1 className="w-4 h-4" />
                <span className="text-muted-foreground">Monthly Report</span>
              </div>
              <div className="flex items-center gap-2 pb-2 whitespace-nowrap">
                <TrendingUp className="w-4 h-4" />
                <span className="text-muted-foreground">OverDue Report</span>
              </div>
              <div className="flex items-center gap-2 pb-2 whitespace-nowrap">
                <Tag className="w-4 h-4" />
                <span className="text-muted-foreground">Tag Wise</span>
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-8 gap-4 p-4 border-b border-border bg-muted/20">
                <div className="font-medium">Employee Name</div>
                <div className="font-medium text-center">Total</div>
                <div className="font-medium text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    Overdue
                  </div>
                </div>
                <div className="font-medium text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 border border-orange-500 rounded-full"></div>
                    Pending
                  </div>
                </div>
                <div className="font-medium text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    In-Progress
                  </div>
                </div>
                <div className="font-medium text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    In Time
                  </div>
                </div>
                <div className="font-medium text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    Delayed
                  </div>
                </div>
                <div className="font-medium text-center">Completed</div>
              </div>

              {/* Empty state for table */}
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 opacity-60">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="hsl(var(--muted))" opacity="0.3" />
                  </svg>
                </div>
                <p className="text-muted-foreground">No data available</p>
              </div>
            </div>
          </div>
        );
      case "my-tasks":
        return (
          <div className="p-8">
            {/* Header with Date Range */}
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-4">Date Range</div>
              <div className="flex items-center gap-4 flex-wrap">
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Task
                </Button>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="This Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-primary text-primary-foreground">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-info text-info-foreground">
                  Saved Filters
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="ghost" size="icon">
                    <Table className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <BarChart3 className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Calendar className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-muted-foreground">OverDue - 0</span>
              </div>
              <div className="flex items-center gap-2 border-b-2 border-primary pb-1">
                <div className="w-3 h-3 border-2 border-orange-500 rounded-full"></div>
                <span className="text-foreground font-medium">Pending - 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-muted-foreground">In Progress - 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-muted-foreground">Completed - 0</span>
              </div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-card rounded-lg">
              <div className="w-32 h-32 mb-6 opacity-60">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
                  <rect x="70" y="80" width="60" height="4" fill="hsl(var(--primary))" rx="2" />
                  <rect x="70" y="90" width="45" height="3" fill="hsl(var(--primary))" rx="1.5" />
                  <rect x="70" y="100" width="50" height="3" fill="hsl(var(--primary))" rx="1.5" />
                  <circle cx="150" cy="70" r="25" fill="hsl(var(--primary))" opacity="0.8" />
                  <path d="M140 70 L150 77 L160 63" stroke="white" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No Tasks Here</h2>
              <p className="text-muted-foreground">It seems that you don't have any tasks in this list</p>
            </div>
          </div>
        );
      case "delegated-tasks":
        return (
          <div className="p-8">
            {/* Header with Date Range */}
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-4">Date Range</div>
              <div className="flex items-center gap-4 flex-wrap">
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Task
                </Button>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="This Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-primary text-primary-foreground">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-info text-info-foreground">
                  Saved Filters
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="ghost" size="icon">
                    <Table className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <BarChart3 className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Calendar className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-muted-foreground">OverDue - 0</span>
              </div>
              <div className="flex items-center gap-2 border-b-2 border-primary pb-1">
                <div className="w-3 h-3 border-2 border-orange-500 rounded-full"></div>
                <span className="text-foreground font-medium">Pending - 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-muted-foreground">In Progress - 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-muted-foreground">Completed - 0</span>
              </div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-card rounded-lg">
              <div className="w-32 h-32 mb-6 opacity-60">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
                  <rect x="70" y="80" width="60" height="4" fill="hsl(var(--primary))" rx="2" />
                  <rect x="70" y="90" width="45" height="3" fill="hsl(var(--primary))" rx="1.5" />
                  <rect x="70" y="100" width="50" height="3" fill="hsl(var(--primary))" rx="1.5" />
                  <circle cx="150" cy="70" r="25" fill="hsl(var(--primary))" opacity="0.8" />
                  <path d="M140 70 L150 77 L160 63" stroke="white" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No Tasks Here</h2>
              <p className="text-muted-foreground">It seems that you don't have any tasks in this list</p>
            </div>
          </div>
        );
      case "subscribed-tasks":
        return (
          <div className="p-8">
            {/* Header with Date Range */}
            <div className="mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <Button variant="ghost" className="text-muted-foreground">Today</Button>
                <Button variant="ghost" className="text-muted-foreground">Yesterday</Button>
                <Button className="bg-primary text-primary-foreground">This Week</Button>
                <Button variant="ghost" className="text-muted-foreground">This Month</Button>
                <Button variant="ghost" className="text-muted-foreground">Next Week</Button>
                <Button variant="ghost" className="text-muted-foreground">All Time</Button>
                <Button variant="ghost" className="text-muted-foreground">Custom</Button>
                <Button className="bg-primary text-primary-foreground ml-auto">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-info text-info-foreground">
                  Saved Filters
                </Button>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-muted-foreground">OverDue - 0</span>
              </div>
              <div className="flex items-center gap-2 border-b-2 border-primary pb-1">
                <div className="w-3 h-3 border-2 border-orange-500 rounded-full"></div>
                <span className="text-foreground font-medium">Pending - 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-muted-foreground">In Progress - 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-muted-foreground">Completed - 0</span>
              </div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-card rounded-lg">
              <div className="w-32 h-32 mb-6 opacity-60">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
                  <rect x="70" y="80" width="60" height="4" fill="hsl(var(--primary))" rx="2" />
                  <rect x="70" y="90" width="45" height="3" fill="hsl(var(--primary))" rx="1.5" />
                  <rect x="70" y="100" width="50" height="3" fill="hsl(var(--primary))" rx="1.5" />
                  <circle cx="150" cy="70" r="25" fill="hsl(var(--primary))" opacity="0.8" />
                  <path d="M140 70 L150 77 L160 63" stroke="white" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No Tasks Here</h2>
              <p className="text-muted-foreground">It seems that you don't have any tasks in this list</p>
            </div>
          </div>
        );
      case "all-tasks":
        return (
          <div className="p-8">
            {/* Header with Date Range */}
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-4">Date Range</div>
              <div className="flex items-center gap-4 flex-wrap">
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Task
                </Button>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="This Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-primary text-primary-foreground">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-info text-info-foreground">
                  Saved Filters
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="ghost" size="icon">
                    <Table className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <BarChart3 className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Calendar className="w-5 h-5" />
                  </Button>
                  <Button className="bg-primary text-primary-foreground">
                    <Upload className="w-4 h-4 mr-2" />
                    Export task
                  </Button>
                  <Button className="bg-primary text-primary-foreground">
                    <Download className="w-4 h-4 mr-2" />
                    Import task
                  </Button>
                </div>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-muted-foreground">OverDue - 0</span>
              </div>
              <div className="flex items-center gap-2 border-b-2 border-primary pb-1">
                <div className="w-3 h-3 border-2 border-orange-500 rounded-full"></div>
                <span className="text-foreground font-medium">Pending - 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-muted-foreground">In Progress - 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-muted-foreground">Completed - 0</span>
              </div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-card rounded-lg">
              <div className="w-32 h-32 mb-6 opacity-60">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="80" fill="hsl(var(--muted))" opacity="0.3" />
                  <rect x="70" y="80" width="60" height="4" fill="hsl(var(--primary))" rx="2" />
                  <rect x="70" y="90" width="45" height="3" fill="hsl(var(--primary))" rx="1.5" />
                  <rect x="70" y="100" width="50" height="3" fill="hsl(var(--primary))" rx="1.5" />
                  <circle cx="150" cy="70" r="25" fill="hsl(var(--primary))" opacity="0.8" />
                  <path d="M140 70 L150 77 L160 63" stroke="white" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No Tasks Here</h2>
              <p className="text-muted-foreground">It seems that you don't have any tasks in this list</p>
            </div>
          </div>
        );
      case "directory":
        return (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Directory</h1>
                <p className="text-muted-foreground">Manage your team and contacts</p>
              </div>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-border bg-muted/20 font-medium">
                <div>Name</div>
                <div>Role</div>
                <div>Email</div>
                <div>Status</div>
              </div>
              <div className="divide-y divide-border">
                {[
                  { name: "Snehasish", role: "Designer", email: "snehasish@example.com", status: "Active" },
                  { name: "Team Lead", role: "Manager", email: "lead@example.com", status: "Active" },
                  { name: "Backend Dev", role: "Developer", email: "backend@example.com", status: "Away" },
                ].map((member, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <div className="text-muted-foreground">{member.role}</div>
                    <div className="text-muted-foreground">{member.email}</div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${member.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                        }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar activeView={activeView} onViewChange={setActiveView} />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <SidebarTrigger />
              <h2 className="text-lg font-semibold text-foreground">TaskFlow CRM</h2>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}