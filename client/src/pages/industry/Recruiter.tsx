import DashboardLayout from "@/components/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useInternships,
  useJobs,
  useMyProfile,
  useOpportunityCandidates,
  useOpportunityApplications,
  useUpdateApplicationStatus,
  useShortlistCandidate,
  useUserSkillProfile,
} from "@/lib/api";
import { useRole } from "@/hooks/useRole";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { Briefcase, Users, GraduationCap, Loader2, CheckCircle2, XCircle, UserCheck, UserPlus, Eye, ArrowRight, PlusCircle, Star } from "lucide-react";

const PIPELINE_COLUMNS = [
  { status: "pending", label: "Applied", color: "border-blue-300 bg-blue-50 dark:bg-blue-950/30" },
  { status: "screening", label: "Screening", color: "border-slate-300 bg-slate-50 dark:bg-slate-900/30" },
  { status: "shortlisted", label: "Shortlisted", color: "border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30" },
  { status: "interview", label: "Interview", color: "border-purple-300 bg-purple-50 dark:bg-purple-950/30" },
  { status: "accepted", label: "Selected", color: "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30" },
  { status: "rejected", label: "Rejected", color: "border-red-300 bg-red-50 dark:bg-red-950/30" },
];

export default function Recruiter() {
  const { user } = useRole() as any;
  const { data: internshipsData } = useInternships();
  const { data: jobsData } = useJobs();
  const { data: profile } = useMyProfile();

  const internships = Array.isArray(internshipsData) ? internshipsData : (internshipsData as any)?.items ?? [];
  const jobs = Array.isArray(jobsData) ? jobsData : (jobsData as any)?.items ?? [];

  const myInternships = internships.filter((i: any) => i.industryUserId === user?.id);
  const myJobs = jobs.filter((j: any) => j.industryUserId === user?.id);
  const opportunities = [
    ...myInternships.map((i: any) => ({ ...i, kind: "internship" as const })),
    ...myJobs.map((j: any) => ({ ...j, kind: "job" as const })),
  ];

  const [selectedId, setSelectedId] = useState<number | null>(opportunities[0]?.id ?? null);
  const selected = opportunities.find((o) => o.id === selectedId) ?? opportunities[0];

  const company = (profile as any)?.industryProfile?.companyName ?? user?.name ?? "Your Company";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">
              {company} — find the best-matched candidates for your opportunities.
            </p>
          </div>
          <Link href="/opportunities/new">
            <Button className="gap-2"><PlusCircle className="h-4 w-4" /> Post Opportunity</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Posted Internships" value={myInternships.length} icon={Briefcase} description="Active listings" />
          <StatsCard title="Posted Jobs" value={myJobs.length} icon={Briefcase} description="Active listings" />
          <StatsCard title="Applicants" value={myInternships.reduce((s: number, i: any) => s + (i.applicantCount ?? 0), 0) || "View pipeline"} icon={Users} description="Across all listings" />
          <StatsCard title="Top Match" value="91%" icon={Star} description="Best candidate compatibility" />
        </div>

        {/* Opportunity selector */}
        {opportunities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {opportunities.map((o) => (
              <Button
                key={`${o.kind}-${o.id}`}
                size="sm"
                variant={selected?.id === o.id && selected?.kind === o.kind ? "default" : "outline"}
                onClick={() => setSelectedId(o.id)}
                className="capitalize"
              >
                {o.title}
              </Button>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No opportunities posted yet.</p>
              <Link href="/opportunities/new">
                <Button><PlusCircle className="h-4 w-4 mr-2" /> Post Your First Opportunity</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {selected && (
          <Tabs defaultValue="candidates">
            <TabsList>
              <TabsTrigger value="candidates">Best Matching Candidates</TabsTrigger>
              <TabsTrigger value="pipeline">Application Pipeline</TabsTrigger>
            </TabsList>

            <TabsContent value="candidates" className="space-y-4">
              <CandidateList
                opportunityType={selected.kind}
                opportunityId={selected.id}
                opportunityTitle={selected.title}
              />
            </TabsContent>

            <TabsContent value="pipeline" className="space-y-4">
              <Pipeline
                opportunityType={selected.kind}
                opportunityId={selected.id}
                opportunityTitle={selected.title}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}

// =============================================================================
// Candidate matching
// =============================================================================

function CandidateList({ opportunityType, opportunityId, opportunityTitle }: { opportunityType: string; opportunityId: number; opportunityTitle: string }) {
  const { data: candidates, isLoading } = useOpportunityCandidates(opportunityType, opportunityId);
  const { data: applications } = useOpportunityApplications(opportunityType, opportunityId);
  const shortlistMutation = useShortlistCandidate();
  const updateStatus = useUpdateApplicationStatus();
  const [expanded, setExpanded] = useState<number | null>(null);

  const apps = Array.isArray(applications) ? applications : [];
  const appForCandidate = (userId: number) => apps.find((a: any) => a.userId === userId);

  const handleShortlist = async (userId: number) => {
    try {
      await shortlistMutation.mutateAsync({ opportunityType, opportunityId, userId });
      toast.success("Candidate shortlisted");
    } catch (e: any) {
      toast.error(e.message || "Failed to shortlist");
    }
  };

  const handleStatus = async (app: any, status: string) => {
    try {
      await updateStatus.mutateAsync({
        id: app.id,
        status,
        opportunityType,
        opportunityId,
        opportunityTitle,
      });
      toast.success(`Moved to ${status}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const list = Array.isArray(candidates) ? candidates : [];

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {list.slice(0, 6).map((c: any) => {
          const app = appForCandidate(c.userId);
          return (
            <Card key={c.userId} className="transition-all hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{c.name}</h3>
                      {c.matchScore >= 90 && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.degree ? `${c.degree} ${c.department ?? ""} · CGPA ${c.cgpa ?? "—"} · Class of ${c.graduationYear ?? "—"}` : "Student"}
                    </p>
                    {c.careerInterests?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {c.careerInterests.slice(0, 2).map((i: string) => (
                          <Badge key={i} variant="outline" className="text-[10px]">{i}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-center shrink-0">
                    <div className="text-3xl font-bold text-primary">{c.matchScore}%</div>
                    <p className="text-[10px] text-muted-foreground">match</p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-xs">
                  <Breakdown label="Skill Match" value={c.skillMatch} />
                  <Breakdown label="Academic" value={c.academicMatch} />
                  <Breakdown label="Experience" value={c.experience > 0 ? Math.min(100, c.experience * 60) : 0} text={`${c.experience} internship${c.experience === 1 ? "" : "s"}`} />
                  <Breakdown label="Assessment" value={c.assessmentScore} />
                  <Breakdown label="Career Interest" value={c.careerInterest} />
                  <Breakdown label="Readiness" value={c.readiness} text={`${c.readinessCategory ?? ""}`} />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => setExpanded(expanded === c.userId ? null : c.userId)}>
                    <Eye className="h-3.5 w-3.5" /> {expanded === c.userId ? "Hide" : "View"} Portfolio
                  </Button>
                  {app ? (
                    <div className="flex gap-1.5">
                      {app.status !== "shortlisted" && app.status !== "accepted" && app.status !== "interview" && (
                        <Button size="sm" className="gap-1" onClick={() => handleStatus(app, "shortlisted")}>
                          <UserCheck className="h-3.5 w-3.5" /> Shortlist
                        </Button>
                      )}
                      {app.status !== "interview" && app.status !== "accepted" && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => handleStatus(app, "interview")}>
                          Invite
                        </Button>
                      )}
                      {app.status !== "rejected" && app.status !== "accepted" && (
                        <Button size="sm" variant="ghost" className="text-destructive gap-1" onClick={() => handleStatus(app, "rejected")}>
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button size="sm" className="gap-1" onClick={() => handleShortlist(c.userId)}>
                      <UserPlus className="h-3.5 w-3.5" /> Shortlist
                    </Button>
                  )}
                </div>

                {expanded === c.userId && <CandidatePortfolio userId={c.userId} />}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {list.length === 0 && (
        <p className="text-muted-foreground text-center py-8">No students matched yet — complete student assessments to unlock candidate ranking.</p>
      )}
    </div>
  );
}

function Breakdown({ label, value, text }: { label: string; value: number; text?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-1" />
      {text && <p className="text-[10px] text-muted-foreground mt-0.5">{text}</p>}
    </div>
  );
}

function CandidatePortfolio({ userId }: { userId: number }) {
  const { data: skills, isLoading } = useUserSkillProfile(userId);
  const list = Array.isArray(skills) ? skills : [];
  return (
    <div className="mt-3 rounded-lg border bg-muted/30 p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Skills & Proficiency</p>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {list.map((s: any) => (
            <Badge key={s.id} variant="secondary" className="capitalize">
              {s.skillName} · {s.proficiency} {s.assessedScore ? `(${s.assessedScore}%)` : ""}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Application pipeline (Kanban)
// =============================================================================

function Pipeline({ opportunityType, opportunityId, opportunityTitle }: { opportunityType: string; opportunityId: number; opportunityTitle: string }) {
  const { data: applications, isLoading } = useOpportunityApplications(opportunityType, opportunityId);
  const updateStatus = useUpdateApplicationStatus();
  const apps = Array.isArray(applications) ? applications : [];

  const handleMove = async (app: any, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: app.id, status, opportunityType, opportunityId, opportunityTitle });
      toast.success(`Moved to ${status}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {PIPELINE_COLUMNS.map((col) => {
        const columnApps = apps.filter((a: any) => a.status === col.status);
        return (
          <div key={col.status} className={`rounded-xl border p-2.5 ${col.color}`}>
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-xs font-semibold">{col.label}</span>
              <span className="text-xs font-medium text-muted-foreground">{columnApps.length}</span>
            </div>
            <div className="space-y-2">
              {columnApps.map((app: any) => (
                <div key={app.id} className="rounded-lg bg-background border p-2.5 shadow-sm">
                  <p className="text-sm font-medium truncate">{app.studentName ?? `Candidate #${app.userId}`}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {app.opportunityTitle ?? opportunityTitle} · {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {col.status !== "pending" && (
                      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => handleMove(app, "pending")}>
                        ← Applied
                      </Button>
                    )}
                    {col.status !== "shortlisted" && (
                      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => handleMove(app, "shortlisted")}>
                        Shortlist
                      </Button>
                    )}
                    {col.status !== "interview" && (
                      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => handleMove(app, "interview")}>
                        Interview
                      </Button>
                    )}
                    {col.status !== "accepted" && (
                      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-emerald-700" onClick={() => handleMove(app, "accepted")}>
                        Select
                      </Button>
                    )}
                    {col.status !== "rejected" && (
                      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-red-600" onClick={() => handleMove(app, "rejected")}>
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {columnApps.length === 0 && (
                <div className="rounded-lg border border-dashed p-3 text-center text-[10px] text-muted-foreground">
                  No candidates
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}