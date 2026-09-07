import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/skill/SkillBadge";
import { Progress } from "@/components/ui/progress";
import { useMySkillProfile, useGapAnalysis } from "@/lib/api";
import { Link } from "wouter";
import { ROUTES } from "@/lib/constants";
import { useState } from "react";
import { Loader2, Target, TrendingDown, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const PROFICIENCY_ORDER = { expert: 4, advanced: 3, intermediate: 2, beginner: 1, none: 0 };
const PROFICIENCY_COLOR: Record<string, string> = {
  beginner: "#94a3b8",
  intermediate: "#3b82f6",
  advanced: "#8b5cf6",
  expert: "#22c55e",
};

export default function SkillResults() {
  const { data: skillProfile, isLoading } = useMySkillProfile();
  const [showGap, setShowGap] = useState(false);
  const { data: gapData, mutate: fetchGap, isPending: gapLoading } = useGapAnalysis();

  const skills = Array.isArray(skillProfile) ? skillProfile : [];
  const sortedSkills = [...skills].sort(
    (a: any, b: any) => (PROFICIENCY_ORDER[b.proficiency as keyof typeof PROFICIENCY_ORDER] ?? 0) - (PROFICIENCY_ORDER[a.proficiency as keyof typeof PROFICIENCY_ORDER] ?? 0)
  );

  const chartData = sortedSkills.slice(0, 10).map((s: any) => ({
    name: s.skillName ?? `Skill ${s.skillId}`,
    score: s.assessedScore ?? s.selfScore ?? 0,
    proficiency: s.proficiency ?? "beginner",
  }));

  const gaps = (gapData as any)?.gaps ?? [];
  const strengths = (gapData as any)?.strengths ?? [];

  const handleShowGap = () => {
    if (!gapData) {
      fetchGap();
    }
    setShowGap(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Skills</h1>
            <p className="text-muted-foreground">Your assessed skill profile and proficiency levels.</p>
          </div>
          <div className="flex gap-2">
            <Button variant={showGap ? "default" : "outline"} onClick={handleShowGap} className="gap-2">
              <TrendingDown className="h-4 w-4" /> Gap Analysis
            </Button>
            <Link href={ROUTES.SKILLS_ASSESSMENT}>
              <Button variant="outline" className="gap-2"><Target className="h-4 w-4" /> Retake Assessment</Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : skills.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No skills assessed yet.</p>
              <Link href={ROUTES.SKILLS_ASSESSMENT}>
                <Button>Take Skill Assessment</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Skill Proficiency Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={PROFICIENCY_COLOR[entry.proficiency] ?? "#94a3b8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Skills Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Skills ({skills.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedSkills.map((skill: any) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <SkillBadge name={skill.skillName ?? `Skill ${skill.skillId}`} proficiency={skill.proficiency} />
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-medium">{skill.assessedScore ?? skill.selfScore ?? 0}%</span>
                        </div>
                        <Progress value={skill.assessedScore ?? skill.selfScore ?? 0} className="w-24 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gap Analysis */}
            {showGap && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" /> Skill Gap Analysis — You vs Industry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gapLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : gaps.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No skill gaps — you're ready for the market. 🎉
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {/* Biggest opportunity */}
                      {gaps[0] && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:bg-amber-950/30 dark:border-amber-800">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">Your biggest opportunity</p>
                          <p className="text-xl font-bold">{gaps[0].skillName}</p>
                          <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                            <div className="rounded-lg bg-background/70 p-2">
                              <p className="text-xs text-muted-foreground">Current</p>
                              <p className="font-semibold">{gaps[0].currentScore}%</p>
                            </div>
                            <div className="rounded-lg bg-background/70 p-2">
                              <p className="text-xs text-muted-foreground">Target</p>
                              <p className="font-semibold">{gaps[0].targetScore}%</p>
                            </div>
                            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/50">
                              <p className="text-xs text-muted-foreground">Gap</p>
                              <p className="font-semibold text-amber-700 dark:text-amber-300">{gaps[0].gapPercent}%</p>
                            </div>
                          </div>
                          <Link href={ROUTES.LEARNING}>
                            <Button className="mt-4 w-full gap-2">Improve This Skill</Button>
                          </Link>
                        </div>
                      )}

                      {/* All gaps with % bars */}
                      <div>
                        <h4 className="font-medium text-sm mb-3 text-red-600">Skills to Develop</h4>
                        <div className="space-y-3">
                          {gaps.slice(0, 10).map((gap: any) => (
                            <div key={gap.skillId} className="p-3 rounded-lg bg-red-50 border border-red-100 dark:bg-red-950/20 dark:border-red-800">
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="font-medium text-sm">{gap.skillName}</p>
                                <span className="text-xs font-medium text-red-600">Gap {gap.gapPercent}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground w-7">You</span>
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${gap.currentScore}%` }} />
                                </div>
                                <span className="text-xs w-8 text-right">{gap.currentScore}%</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-muted-foreground w-7">Ind.</span>
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full rounded-full bg-teal-600" style={{ width: `${gap.targetScore}%` }} />
                                </div>
                                <span className="text-xs w-8 text-right">{gap.targetScore}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {strengths.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-3 text-green-600">Your Strengths</h4>
                          <div className="flex flex-wrap gap-2">
                            {strengths.map((s: any) => (
                              <SkillBadge key={s.skillId} name={s.skillName} proficiency={s.currentLevel} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
