import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    CheckSquare,
    FolderOpen,
    Users,
    Lightbulb,
    Link2,
    HelpCircle,
    User
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchActivityLogs } from "@/lib/api";

export function ActivityLogView() {
    const { data: logs = [] } = useQuery({
        queryKey: ['activity-logs'],
        queryFn: fetchActivityLogs,
        refetchInterval: 5000 // Poll every 5 seconds for updates
    });

    const getIcon = (type: string) => {
        switch (type) {
            case "task": return <CheckSquare className="w-4 h-4 text-blue-500" />;
            case "project": return <FolderOpen className="w-4 h-4 text-purple-500" />;
            case "team": return <Users className="w-4 h-4 text-green-500" />;
            case "idea": return <Lightbulb className="w-4 h-4 text-yellow-500" />;
            case "link": return <Link2 className="w-4 h-4 text-orange-500" />;
            case "support": return <HelpCircle className="w-4 h-4 text-red-500" />;
            default: return <User className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Recent Activity</h3>
            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                    {logs.length > 0 ? (
                        logs.map((log: any) => (
                            <div key={log.id} className="flex items-start gap-3 text-sm">
                                <div className="mt-1 bg-muted p-1.5 rounded-full">
                                    {getIcon(log.entity_type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="leading-none">
                                        <span className="font-medium">{log.user_name}</span>
                                        {" "}
                                        <span className="text-muted-foreground">{log.action}</span>
                                        {" "}
                                        <span className="font-medium text-foreground">{log.entity_name}</span>
                                    </p>
                                    {log.details && (
                                        <p className="text-xs text-muted-foreground">{log.details}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
