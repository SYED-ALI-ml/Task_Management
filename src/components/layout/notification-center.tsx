import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAuth } from "@/context/AuthContext";
import { Bell, Check, X, Calendar, Clock, CheckSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Notification, NotificationType } from "@/types";

export function NotificationCenter() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Fetch notifications for current user
    const allNotifications = useLiveQuery(
        () => db.notifications.where('userId').equals(user?.id || '').reverse().sortBy('createdAt'),
        [user?.id]
    ) || [];

    const unreadCount = allNotifications.filter(n => !n.isRead).length;
    const recentNotifications = allNotifications.slice(0, 10); // Show last 10

    const handleMarkAsRead = async (notificationId: string) => {
        await db.notifications.update(notificationId, { isRead: true });
    };

    const handleMarkAllAsRead = async () => {
        const unreadIds = allNotifications
            .filter(n => !n.isRead)
            .map(n => n.id);

        await Promise.all(
            unreadIds.map(id => db.notifications.update(id, { isRead: true }))
        );
    };

    const handleDelete = async (notificationId: string) => {
        await db.notifications.delete(notificationId);
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "leave":
                return <Calendar className="w-4 h-4 text-blue-500" />;
            case "attendance":
                return <Clock className="w-4 h-4 text-green-500" />;
            case "task":
                return <CheckSquare className="w-4 h-4 text-purple-500" />;
            case "system":
                return <Info className="w-4 h-4 text-orange-500" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-destructive/10 text-destructive border-destructive/20";
            case "medium":
                return "bg-warning/10 text-warning border-warning/20";
            case "low":
                return "bg-muted text-muted-foreground border-border";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs h-7"
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {recentNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                We'll notify you when something happens
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {recentNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="font-medium text-sm leading-tight">
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true
                                                    })}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {!notification.isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="h-6 px-2 text-xs"
                                                        >
                                                            <Check className="w-3 h-3 mr-1" />
                                                            Mark read
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(notification.id)}
                                                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {recentNotifications.length > 0 && (
                    <div className="border-t px-4 py-3">
                        <Button
                            variant="ghost"
                            className="w-full text-xs h-8"
                            onClick={() => setIsOpen(false)}
                        >
                            View all notifications
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
