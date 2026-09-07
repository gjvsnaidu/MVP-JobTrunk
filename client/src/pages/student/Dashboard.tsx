import DashboardLayout from "@/components/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SkillBadge } from "@/components/skill/SkillBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  useMySkillProfile,
  useRecommendedInternships,
  useMyApplications,
  useMyDocuments,
  useMyProfile,
  useStudentReadiness,
  useGapAnalysisQuery,
} from "@/lib/api";
import { useRole } from "@/hooks/useRole";
import { Link } from "wouter";
import { ROUTES } from "@/lib/constants";
import {
  Target,
  Briefcase,
  FileText,
  ArrowRight,
  Loader2,
  Sparkles,
  TrendingUp,
  Award,
  FolderOpen,
  Send,
  GraduationCap,
  AlertTriangle,
  BookOpen,
  Landmark,
  Building2,
  Users,
  Layers,
} from "lucide-react";

const TRUNK_ITEMS = [
  { icon: Layers, label: "Skills", countKey: "skills", path: ROUTES.SKILLS_RESULTS },
  { icon: Award, label: "Certifications", countKey: "certs", path: ROUTES.PORTFOLIO },
  { icon: FolderOpen, label: "Projects", countKey: "projects", path: ROUTES.PORTFOLIO },
  { icon: Briefcase, label: "Internships", countKey: "internships", path: ROUTES.INTERNSHIPS },
  { icon: Send, label: "Applications", countKey: "applications", path: ROUTES.APPLICATIONS },
  { icon: BookOpen, label: "Learning", countKey: "learning", path: ROUTES.LEARNING },
];

export default function StudentDashboard() {
  const { user } = useRole() as any;
  const { data: skillProfile, isLoading: skillsLoading } = useMySkillProfile();
  const { data: internships, isLoading: internshipsLoading } = useRecommendedInternships();
  const { data: applications } = useMyApplications();
  const { data: documents } = useMyDocuments();
  const { data: profile } = useMyProfile();
  const { data: readiness, isLoading: readinessLoading } = useStudentReadiness();
  const { data: gapData } = useGapAnalysisQuery();

  const skills = Array.isArray(skillProfile) ? skillProfile : [];
  const topSkills = [...skills]
    .sort((a: any, b: any) => (b.assessedScore ?? 0) - (a.assessedScore ?? 0))
    .slice(0, 5);

  const totalApps = Array.isArray(applications) ? applications.length : 0;
  const pendingApps = Array.isArray(applications) ? applications.filter((a: any) => a.status === "pending").length : 0;
  const apps = Array.isArray(applications) ? applications : [];

  const studentProfile = (profile as any)?.studentProfile;
  const certs = studentProfile ? 2 : 0;
  const projects = studentProfile ? 2 : 0;
  const internshipCount = studentProfile ? 1 : 0;

  const gaps = (gapData as any)?.gaps ?? [];
  const biggestGap = gaps.find((g: any) => g.currentScore > 0) ?? gaps[0];

  const trunkCounts: Record<string, number> = {
    skills: skills.length,
    certs,
    projects,
    internships: internshipCount,
    applications: totalApps,
    learning: 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name ?? "Student"}</h1>
            <p className="text-muted-foreground">
              {studentProfile
                ? `${studentProfile.degree} ${studentProfile.department} · ${studentProfile.institution} · CGPA ${studentProfile.cgpa}`
                : "Here's an overview of your skill development journey."}
            </p>
            {studentProfile?.careerInterests && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {studentProfile.careerInterests.map((i: string) => (
                  <Badge key={i} variant="secondary">{i}</Badge>
                ))}
              </div>
            )}
          </div>
          <Link href="/ai">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" /> Ask JobTrunk AI
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Skills Assessed" value={skills.length} icon={Target} description="In your JobTrunk profile" />
          <StatsCard title="Internship Matches" value={Array.isArray(internships) ? internships.length : 0} icon={Briefcase} description="Recommended opportunities" />
          <StatsCard title="Applications" value={totalApps} icon={Send} description={`${pendingApps} pending review`} />
          <StatsCard title="Documents" value={Array.isArray(documents) ? documents.length : 0} icon={FileText} description="Uploaded documents" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Career Readiness Index */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Career Readiness Index
              </CardTitle>
            </CardHeader>
            <CardContent>
              {readinessLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : readiness ? (
                <>
                  <div className="text-center py-2">
                    <div className="text-5xl font-bold text-primary">
                      {(readiness as any).score}
                      <span className="text-lg text-muted-foreground font-normal">/100</span>
                    </div>
                    <Badge className="mt-2" variant={readiness.score >= 80 ? "default" : readiness.score >= 60 ? "secondary" : "outline"}>
                      {(readiness as any).category}
                    </Badge>
                  </div>
                  <div className="space-y-2.5 mt-4">
                    {readiness.components.map((c: any) => (
                      <div key={c.key}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium">{c.label}</span>
                          <span className="text-muted-foreground">{c.score}/100 · {c.weight}%</span>
                        </div>
                        <Progress value={c.score} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                  <Link href={ROUTES.SKILLS_RESULTS} className="block mt-4">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      Improve My Score <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Biggest gap + Top skills */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Your Biggest Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {biggestGap ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/30 dark:border-amber-800">
                  <p className="font-semibold">{biggestGap.skillName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {biggestGap.currentScore}% · Industry target: ~{biggestGap.targetScore}% · Gap: {biggestGap.gapPercent}%
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${biggestGap.currentScore}%` }} />
                    </div>
                    <span className="text-xs font-medium">{biggestGap.gapPercent}%</span>
                  </div>
                  <Link href={ROUTES.LEARNING}>
                    <Button size="sm" className="mt-3 w-full gap-1">
                      <BookOpen className="h-3.5 w-3.5" /> Improve This Skill
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No gaps — keep building!</p>
              )}

              <div className="mt-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Top Skills</p>
                {skillsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : topSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {topSkills.map((skill: any) => (
                      <SkillBadge key={skill.id} name={skill.skillName} proficiency={skill.proficiency} />
                    ))}
                  </div>
                ) : (
                  <Link href={ROUTES.SKILLS_ASSESSMENT}>
                    <Button size="sm">Take Assessment</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommended internships */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Recommended Internships</CardTitle>
            </CardHeader>
            <CardContent>
              {internshipsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : Array.isArray(internships) && internships.length > 0 ? (
                <div className="space-y-3">
                  {internships.slice(0, 4).map((internship: any) => (
                    <div key={internship.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{internship.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {internship.location ?? "Remote"} · <span className="text-primary font-medium">{internship.matchScore}% match</span>
                        </p>
                      </div>
                      <Link href={`/opportunities/internships/${internship.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Complete your skill assessment to see matched opportunities.
                </p>
              )}
              <Link href={ROUTES.INTERNSHIPS}>
                <Button variant="ghost" size="sm" className="mt-3 gap-1">
                  Browse All Internships <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* My Career Trunk */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" /> My Career Trunk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {TRUNK_ITEMS.map((item) => (
                <Link key={item.label} href={item.path}>
                  <div className="rounded-xl border p-4 text-center transition-all hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5">
                    <div className="inline-flex p-2.5 rounded-lg bg-primary/10 text-primary mb-2">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold">{trunkCounts[item.countKey]}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Applications snapshot */}
        {apps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" /> Application Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {apps.slice(0, 4).map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{app.opportunityTitle || `Opportunity #${app.opportunityId}`}</p>
                      {app.companyName && <p className="text-xs text-muted-foreground">{app.companyName}</p>}
                    </div>
                    <Badge className="ml-2 shrink-0 capitalize">{app.status}</Badge>
                  </div>
                ))}
              </div>
              <Link href={ROUTES.APPLICATIONS} className="mt-3 inline-block">
                <Button variant="ghost" size="sm" className="gap-1">
                  Track all applications <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href={ROUTES.SKILLS_ASSESSMENT}>
                <Button variant="outline" size="sm" className="gap-2"><Target className="h-4 w-4" /> Take Skill Assessment</Button>
              </Link>
              <Link href={ROUTES.CAREER_GUIDANCE}>
                <Button variant="outline" size="sm" className="gap-2"><TrendingUp className="h-4 w-4" /> Career Guidance</Button>
              </Link>
              <Link href={ROUTES.PORTFOLIO}>
                <Button variant="outline" size="sm" className="gap-2"><FileText className="h-4 w-4" /> Build Portfolio</Button>
              </Link>
              <Link href={ROUTES.INTERNSHIPS}>
                <Button variant="outline" size="sm" className="gap-2"><Briefcase className="h-4 w-4" /> Browse Internships</Button>
              </Link>
              <Link href="/ai">
                <Button variant="outline" size="sm" className="gap-2"><Sparkles className="h-4 w-4" /> JobTrunk AI</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}