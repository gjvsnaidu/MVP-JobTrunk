import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInstitutionDashboard } from "@/lib/api";
import { useRole } from "@/hooks/useRole";
import { Link } from "wouter";
import { Loader2, Users, Briefcase, BarChart3, GraduationCap, Target, TrendingUp, AlertTriangle, BookOpen, Building2, Layers } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from "recharts";

const GAP_COLORS = ["#ef4444", "#f59e0b", "#eab308", "#3b82f6", "#22c55e", "#8b5cf6", "#14b8a6"];

export default function InstitutionDashboard() {
  const { user } = useRole() as any;
  const { data: dashboard, isLoading } = useInstitutionDashboard();

  const overview = (dashboard as any)?.overview ?? {};
  const skillGaps = Array.isArray((dashboard as any)?.skillGaps) ? (dashboard as any).skillGaps : [];
  const deptReadiness = Array.isArray((dashboard as any)?.departmentReadiness) ? (dashboard as any).departmentReadiness : [];
  const heatmap = Array.isArray((dashboard as any)?.heatmap) ? (dashboard as any).heatmap : [];
  const funnel = Array.isArray((dashboard as any)?.placementFunnel) ? (dashboard as any).placementFunnel : [];
  const recommendations = Array.isArray((dashboard as any)?.learningRecommendations) ? (dashboard as any).learningRecommendations : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Institution Command Center</h1>
            <p className="text-muted-foreground">
              Adarsh Institute of Technology, Pune — student skills, internship participation and placement readiness.
            </p>
          </div>
          <Link href="/institution/analytics">
            <Button variant="outline" className="gap-2"><BarChart3 className="h-4 w-4" /> Full Analytics</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon={Users} label="Students" value={overview.totalStudents ?? 0} sub={`${overview.assessed ?? 0} assessed`} />
              <MetricCard icon={TrendingUp} label="Internship Participation" value={`${overview.internshipParticipation ?? 0}%`} sub="of eligible students" />
              <MetricCard icon={Target} label="Placement Readiness" value={`${overview.placementReadiness ?? 0}%`} sub="across departments" />
              <MetricCard icon={Building2} label="Industry Partners" value={overview.industryPartners ?? 0} sub={`${overview.activeInternships ?? 0} active internships`} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Skill gaps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Skill Gaps vs Industry Demand
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillGaps.map((g: any, idx: number) => (
                      <div key={g.skill}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium">{g.skill}</span>
                          <span className="text-xs text-muted-foreground">
                            Readiness {g.readiness}% · Demand {g.demand}%
                          </span>
                        </div>
                        <div className="flex gap-1 h-2.5 rounded-full overflow-hidden bg-muted">
                          <div className="bg-teal-600 rounded-l-full" style={{ width: `${g.readiness}%` }} />
                          <div className="bg-amber-400" style={{ width: `${Math.max(0, g.demand - g.readiness)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    <span className="inline-block h-2 w-2 rounded-full bg-teal-600 mr-1 align-middle" /> Current readiness
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-400 ml-3 mr-1 align-middle" /> Gap to industry demand
                  </p>
                </CardContent>
              </Card>

              {/* Department readiness */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> Department Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={deptReadiness} layout="vertical" margin={{ left: 40 }}>
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="department" type="category" width={140} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="readiness" radius={[0, 4, 4, 0]}>
                        {deptReadiness.map((_: any, i: number) => (
                          <Cell key={i} fill={deptReadiness[i].readiness >= 75 ? "#22c55e" : deptReadiness[i].readiness >= 65 ? "#f59e0b" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Skill Gap Heatmap — Skills × Departments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Skill</th>
                        {["CSE", "ECE", "MBA"].map((d) => (
                          <th key={d} className="text-center py-2 px-2 font-medium text-muted-foreground">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmap.map((row: any) => (
                        <tr key={row.skill} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium">{row.skill}</td>
                          {["CSE", "ECE", "MBA"].map((d) => (
                            <td key={d} className="py-1 px-1 text-center">
                              <HeatCell value={row[d]} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-emerald-500" /> 75–100</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-yellow-400" /> 50–74</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-orange-400" /> 30–49</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-red-500" /> &lt;30</span>
                </div>
              </CardContent>
            </Card>

            {/* Placement funnel + learning recs */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-teal-600" /> Placement Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {funnel.map((f: any, idx: number) => {
                      const maxCount = funnel[0]?.count ?? 1;
                      const conversion = idx > 0 ? Math.round((f.count / funnel[idx - 1].count) * 100) : 100;
                      return (
                        <div key={f.stage}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium">{f.stage}</span>
                            <span className="text-muted-foreground">
                              {f.count.toLocaleString("en-IN")} {idx > 0 && `· ${conversion}% conversion`}
                            </span>
                          </div>
                          <div className="h-4 rounded bg-muted overflow-hidden">
                            <div
                              className="h-full rounded bg-gradient-to-r from-primary to-teal-600 transition-all"
                              style={{ width: `${(f.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" /> Recommended Learning Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.map((r: any) => (
                      <div key={r.programId} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{r.title}</p>
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/50 dark:text-amber-200">{r.gap}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{r.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HeatCell({ value }: { value: number }) {
  const color =
    value >= 75 ? "bg-emerald-500 text-white" : value >= 50 ? "bg-yellow-400 text-slate-900" : value >= 30 ? "bg-orange-400 text-white" : "bg-red-500 text-white";
  return <span className={`inline-flex h-7 w-14 items-center justify-center rounded text-xs font-semibold ${color}`}>{value}%</span>;
}