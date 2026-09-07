import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, STATUS_LABELS, ApplicationStatus } from "@shared/const";
import { cn } from "@/lib/utils";

type ApplicationStatusBadgeProps = {
  status: ApplicationStatus | string;
  className?: string;
};

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  return (
    <Badge className={cn("capitalize", STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800", className)}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
