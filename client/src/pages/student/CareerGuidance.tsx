import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillBadge } from "@/components/skill/SkillBadge";
import { useCareerGuidance, useRefreshCareerGuidance } from "@/lib/api";
import { Link } from "wouter";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, Sparkles, TrendingUp, Briefcase, GraduationCap, RefreshCw } from "lucide-react";

export default function CareerGuidance() {
  const { data: guidance, isLoading } = useCareerGuidance();
  const refreshMutation = useRefreshCareerGuidance();

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync();
      toast.success("Career guidance refreshed!");
    } catch (error: any) {
      toast.error(error.message || "Failed to refresh");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" /> Career Guidance
            </h1>
            <p className="text-muted-foreground">AI-powered recommendations based on your skill profile.</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshMutation.isPending} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !(guidance as any)?.careerPaths?.length ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Complete your skill assessment first to get personalized career guidance.</p>
              <Link href={ROUTES.SKILLS_ASSESSMENT}>
                <Button>Take Assessment</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{(guidance as any).summary.totalPaths}</div>
                  <p className="text-sm text-muted-foreground">Career Paths</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{(guidance as any).summary.avgMatchScore}%</div>
                  <p className="text-sm text-muted-foreground">Avg Match Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{(guidance as any).summary.recommendedProgramsCount}</div>
                  <p className="text-sm text-muted-foreground">Programs Recommended</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Skill Gaps */}
            {(guidance as any).summary.topSkillGaps?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Priority Skills to Develop
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(guidance as any).summary.topSkillGaps.map((skill: string) => (
                      <Badge key={skill} variant="destructive" className="text-sm">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Career Paths */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Recommended Career Paths</h2>
              {(guidance as any).careerPaths.map((path: any, idx: number) => (
                <Card key={idx} className="transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{path.title}</h3>
                        <Badge className="mt-1">{path.matchScore}% match</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{path.description}</p>

                    {path.currentSkills?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Your matching skills:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {path.currentSkills.map((s: string) => (
                            <SkillBadge key={s} name={s} proficiency="advanced" size="sm" />
                          ))}
                        </div>
                      </div>
                    )}

                    {path.gapSkills?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Skills to develop:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {path.gapSkills.map((s: string) => (
                            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {path.recommendedPrograms?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Recommended learning:</p>
                        <div className="flex flex-wrap gap-2">
                          {path.recommendedPrograms.map((prog: any) => (
                            <Link key={prog.id} href={`/learning/${prog.id}`}>
                              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                                <GraduationCap className="h-3 w-3 mr-1" /> {prog.title}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
