import { cn } from "@/lib/utils";

type ActivityItem = {
  id: number;
  title: string;
  description?: string;
  timestamp: string;
  type?: "application" | "skill" | "message" | "achievement" | "system";
};

type ActivityFeedProps = {
  items: ActivityItem[];
  emptyMessage?: string;
};

const typeIcons: Record<string, string> = {
  application: "📋",
  skill: "🎯",
  message: "💬",
  achievement: "🏆",
  system: "⚙️",
};

export function ActivityFeed({ items, emptyMessage = "No recent activity" }: ActivityFeedProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <span className="text-lg shrink-0">{typeIcons[item.type ?? "system"]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{item.title}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {new Date(item.timestamp).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}
