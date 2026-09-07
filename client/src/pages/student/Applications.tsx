import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyApplications } from "@/lib/api";
import { Link } from "wouter";
import { Loader2, FileText, CheckCircle2, Circle, Briefcase } from "lucide-react";

const TIMELINE = [
  { key: "pending", label: "Applied" },
  { key: "screening", label: "Under Review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Assessment / Interview" },
  { key: "accepted", label: "Selected" },
];

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  screening: 1,
  shortlisted: 2,
  interview: 3,
  accepted: 4,
};

function statusIndex(status: string) {
  if (status === "rejected") return -1;
  if (status === "withdrawn") return -2;
  return STATUS_INDEX[status] ?? 0;
}

export default function Applications() {
  const { data: applications, isLoading } = useMyApplications();
  const apps = Array.isArray(applications) ? applications : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track the status of every application in your career trunk.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : apps.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium mb-1">No applications yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Once you apply to an opportunity, your application journey will appear here.
              </p>
              <Link href="/opportunities/internships">
                <Badge className="px-4 py-2 text-sm cursor-pointer bg-primary text-primary-foreground">Browse Internships</Badge>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {apps.map((app: any) => {
              const idx = statusIndex(app.status);
              return (
                <Card key={app.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-semibold">{app.opportunityTitle || `${app.opportunityType} · #${app.opportunityId}`}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.companyName ? `${app.companyName} · ` : ""}
                          Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {app.coverLetter && (
                          <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">"{app.coverLetter}"</p>
                        )}
                      </div>
                      <Badge className="capitalize shrink-0">{app.status}</Badge>
                    </div>

                    {/* Timeline */}
                    <div className="mt-5">
                      {idx < 0 ? (
                        <div className="flex items-center gap-2 rounded-lg p-3 bg-red-50 border border-red-100 dark:bg-red-950/30 dark:border-red-800">
                          <Circle className="h-4 w-4 text-red-500" />
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            {app.status === "rejected" ? "This application was not shortlisted" : "You withdrew this application"}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {TIMELINE.map((step, i) => (
                            <div key={step.key} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center">
                                {i <= idx ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                                )}
                                <span className={`text-[10px] mt-1 whitespace-nowrap ${i <= idx ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                  {step.label}
                                </span>
                              </div>
                              {i < TIMELINE.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1.5 mb-4 ${i < idx ? "bg-emerald-500" : "bg-muted"}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}