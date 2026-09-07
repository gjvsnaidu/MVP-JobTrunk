import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNationalDashboard } from "@/lib/api";
import { Loader2, Users, Building2, Briefcase, Landmark, TrendingUp, Globe2, GraduationCap, Rocket } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell, PieChart, Pie, Legend } from "recharts";

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useNationalDashboard();

  const overview = (dashboard as any)?.overview ?? {};
  const topSkills = Array.isArray((dashboard as any)?.topDemandedSkills) ? (dashboard as any).topDemandedSkills : [];
  const gaps = Array.isArray((dashboard as any)?.nationalSkillGaps) ? (dashboard as any).nationalSkillGaps : [];
  const trends = Array.isArray((dashboard as any)?.placementTrends) ? (dashboard as any).placementTrends : [];
  const industries = Array.isArray((dashboard as any)?.industryParticipation) ? (dashboard as any).industryParticipation : [];
  const careers = Array.isArray((dashboard as any)?.emergingCareers) ? (dashboard as any).emergingCareers : [];
  const states = Array.isArray((dashboard as any)?.stateDistribution) ? (dashboard as any).stateDistribution : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" /> {(dashboard as any)?.headline ?? "National Skill Ecosystem"}
          </h1>
          <p className="text-muted-foreground">
            Ministry-level view of India's academia–industry skill network — demand, gaps, placements and state distribution.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* National stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <NationCard icon={Users} label="Students" value={overview.totalStudents} fmt />
              <NationCard icon={Building2} label="Institutions" value={overview.totalInstitutions} fmt />
              <NationCard icon={Briefcase} label="Industry Partners" value={overview.totalIndustryPartners} fmt />
              <NationCard icon={Globe2} label="Internships" value={overview.totalInternships} fmt />
              <NationCard icon={TrendingUp} label="Placements" value={overview.totalPlacements} fmt />
              <NationCard icon={Rocket} label="Placement Rate" value={overview.placementRate} suffix="%" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top demanded skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">National Skill Demand — Top Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topSkills} layout="vertical" margin={{ left: 30 }}>
                      <XAxis type="number" />
                      <YAxis dataKey="skill" type="category" width={110} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="openings" name="Openings" radius={[0, 4, 4, 0]}>
                        {topSkills.map((_: any, i: number) => (
                          <Cell key={i} fill={["#1d4ed8", "#0d9488", "#10b981", "#f59e0b", "#6366f1", "#ef4444", "#8b5cf6", "#0ea5e9"][i % 8]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* National skill gaps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">National Skill Gaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gaps.map((g: any) => (
                      <div key={g.skill}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium">{g.skill}</span>
                          <span className="text-xs text-muted-foreground">
                            {g.gapPercent}% gap · {g.institutionsAffected} institutions affected
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500" style={{ width: `${Math.min(100, g.gapPercent * 2)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    SQL/Databases and Cloud Computing are the largest national gaps — priority targets for learning programs.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Placement trends */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Placement Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="placements" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Industry participation */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Industry Participation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {industries.map((ind: any) => (
                      <div key={ind.industry} className="flex items-center justify-between p-2.5 rounded-lg border">
                        <div>
                          <p className="text-sm font-medium">{ind.industry}</p>
                          <p className="text-xs text-muted-foreground">{ind.internships.toLocaleString("en-IN")} internships</p>
                        </div>
                        <Badge variant="secondary" className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40">
                          +{ind.growth}% YoY
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Emerging careers */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Emerging Careers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {careers.map((c: any) => (
                      <div key={c.title} className="flex items-center justify-between">
                        <span className="text-sm">{c.title}</span>
                        <Badge className="bg-teal-600 text-white hover:bg-teal-600">+{c.growth}%</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5 inline mr-1" />
                      Policy insight: align NEP-2020 skill programs with AI/LLM, healthcare analytics and cloud security demand.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* State distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-primary" /> State-Level Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="py-2 pr-4 font-medium">State</th>
                        <th className="py-2 pr-4 font-medium text-right">Students</th>
                        <th className="py-2 pr-4 font-medium text-right">Institutions</th>
                        <th className="py-2 pr-4 font-medium text-right">Industry Partners</th>
                        <th className="py-2 pr-4 font-medium text-right">Internships</th>
                        <th className="py-2 font-medium text-right">Placement Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {states.map((s: any) => (
                        <tr key={s.state} className="border-b last:border-0">
                          <td className="py-2.5 pr-4 font-medium">{s.state}</td>
                          <td className="py-2.5 pr-4 text-right">{s.students.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 pr-4 text-right">{s.institutions}</td>
                          <td className="py-2.5 pr-4 text-right">{s.industryPartners.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 pr-4 text-right">{s.internships.toLocaleString("en-IN")}</td>
                          <td className="py-2.5 text-right">
                            <span className={`font-semibold ${s.placementRate >= 75 ? "text-emerald-600" : s.placementRate >= 70 ? "text-yellow-600" : "text-red-500"}`}>
                              {s.placementRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function NationCard({ icon: Icon, label, value, suffix, fmt }: { icon: any; label: string; value: number; suffix?: string; fmt?: boolean }) {
  const display = value != null ? (fmt ? Number(value).toLocaleString("en-IN") : value) + (suffix ?? "") : "—";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold">{display}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}