import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/api";
import { Loader2, Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

export default function NotificationList() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = (data as any)?.items ?? [];

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.some((n: any) => !n.read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif: any) => (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-colors ${!notif.read ? "bg-primary/5 border-primary/20" : ""}`}
                onClick={() => {
                  if (!notif.read) markRead.mutate(notif.id);
                  if (notif.link) window.location.href = notif.link;
                }}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notif.read ? "bg-primary" : "bg-transparent"}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notif.title}</p>
                    {notif.body && <p className="text-xs text-muted-foreground mt-1">{notif.body}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
