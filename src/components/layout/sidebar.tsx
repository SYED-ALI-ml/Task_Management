import {
  CheckSquare,
  LayoutDashboard,
  Users,
  FolderOpen,
  Trash2,
  FileText,
  Settings,
  Building2,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "my-tasks", label: "My Tasks", icon: CheckSquare },
  { id: "delegated", label: "Delegated Tasks", icon: Users },
  { id: "all-tasks", label: "All Tasks", icon: FolderOpen },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "directory", label: "Directory", icon: Building2 },
  { id: "deleted", label: "Deleted Tasks", icon: Trash2 },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">TaskFlow CRM</h1>
            <p className="text-sm text-sidebar-foreground/70">Team Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "sidebar-nav-item w-full text-left",
                  activeTab === item.id && "active"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
          <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center text-sidebar-primary-foreground font-semibold text-sm">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sidebar-foreground truncate">{user?.name || "User"}</p>
            <p className="text-xs text-sidebar-foreground/70">{user?.role || "Role"}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}