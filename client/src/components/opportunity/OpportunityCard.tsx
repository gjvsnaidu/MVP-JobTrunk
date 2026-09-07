import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/skill/SkillBadge";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, STATUS_LABELS } from "@shared/const";
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type OpportunityCardProps = {
  id: number;
  title: string;
  description: string;
  type?: string;
  location?: string;
  duration?: string;
  stipend?: string;
  salaryRange?: string;
  status?: string;
  matchScore?: number;
  requiredSkillIds?: number[];
  skillNames?: string[];
  deadline?: string;
  onApply?: () => void;
  onView?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
};

export function OpportunityCard({
  id,
  title,
  description,
  type,
  location,
  duration,
  stipend,
  salaryRange,
  status,
  matchScore,
  skillNames,
  deadline,
  onApply,
  onView,
  onSave,
  isSaved,
}: OpportunityCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </span>
              )}
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {duration}
                </span>
              )}
              {(stipend || salaryRange) && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {stipend || salaryRange}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {matchScore !== undefined && (
              <Badge variant={matchScore >= 70 ? "default" : matchScore >= 40 ? "secondary" : "outline"}>
                {matchScore}% match
              </Badge>
            )}
            {status && (
              <Badge className={cn(STATUS_COLORS[status])}>{STATUS_LABELS[status] ?? status}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>

        {skillNames && skillNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skillNames.slice(0, 5).map((skill) => (
              <SkillBadge key={skill} name={skill} size="sm" />
            ))}
            {skillNames.length > 5 && (
              <span className="text-xs text-muted-foreground">+{skillNames.length - 5} more</span>
            )}
          </div>
        )}

        {type && (
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="capitalize">{type}</Badge>
          </div>
        )}

        <div className="flex items-center gap-2">
          {onView && (
            <Button variant="outline" size="sm" onClick={onView}>
              View Details
            </Button>
          )}
          {onApply && (
            <Button size="sm" onClick={onApply}>Apply</Button>
          )}
          {onSave && (
            <Button variant="ghost" size="sm" onClick={onSave}>
              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
