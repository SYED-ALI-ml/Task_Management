import { Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationCenter } from "./notification-center";

export function Header() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search (CTRL/CMD+K)"
            className="pl-10 bg-input border-border"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <Button variant="ghost" size="icon">
          <Sun className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}