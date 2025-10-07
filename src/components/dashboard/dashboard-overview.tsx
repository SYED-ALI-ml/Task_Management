import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  FolderOpen, 
  FileText, 
  Building2, 
  Lightbulb, 
  Link
} from "lucide-react";
import { FeatureCard } from "./feature-card";

interface DashboardOverviewProps {
  onNavigate: (section: string) => void;
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const features = [
    {
      title: "TaskDashboard",
      description: "Clear view of your performance anytime",
      icon: LayoutDashboard,
      buttonText: "Go To Dashboard",
      action: () => onNavigate("dashboard-details")
    },

  ];

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

      {/* Bottom Section */}
      
    </div>
  );
}