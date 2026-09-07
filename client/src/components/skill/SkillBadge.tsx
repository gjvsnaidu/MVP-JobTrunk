import { cn } from "@/lib/utils";
import { PROFICIENCY_COLORS, DEMAND_COLORS } from "@/lib/constants";

type SkillBadgeProps = {
  name: string;
  proficiency?: string;
  demand?: string;
  size?: "sm" | "md" | "lg";
  showDemand?: boolean;
};

export function SkillBadge({ name, proficiency, demand, size = "md", showDemand = false }: SkillBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium",
          sizeClasses[size],
          proficiency ? PROFICIENCY_COLORS[proficiency] ?? "bg-gray-100 text-gray-800" : "bg-slate-100 text-slate-800"
        )}
      >
        {name}
        {proficiency && (
          <span className="ml-1 opacity-70 capitalize">· {proficiency}</span>
        )}
      </span>
      {showDemand && demand && (
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", DEMAND_COLORS[demand])}>
          {demand} demand
        </span>
      )}
    </span>
  );
}
