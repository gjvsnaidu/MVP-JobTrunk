import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useConversations } from "@/lib/api";
import { Link } from "wouter";
import { Loader2, MessageSquare } from "lucide-react";

export default function MessagingInbox() {
  const { data: conversations, isLoading } = useConversations();
  const convs = Array.isArray(conversations) ? conversations : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Messages</h1>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : convs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No conversations yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {convs.map((conv: any) => {
              const lastMsg = conv.lastMessage;
              return (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {conv.title ?? conv.participants?.map((p: any) => p.name).join(", ") ?? "Conversation"}
                        </p>
                        {lastMsg && (
                          <p className="text-xs text-muted-foreground truncate">{lastMsg.content}</p>
                        )}
                      </div>
                      {lastMsg && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
