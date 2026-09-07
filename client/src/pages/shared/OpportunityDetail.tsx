import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInternship, useJob, useRecommendedInternships, useRecommendedJobs, useSkills, useApply, useMyApplications, useMyDocuments } from "@/lib/api";
import { useRole } from "@/hooks/useRole";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { Loader2, MapPin, Clock, IndianRupee, CheckCircle2, AlertTriangle, XCircle, ArrowLeft, Send, CheckCircle, Briefcase, CalendarDays, GraduationCap } from "lucide-react";

type SkillBreakdown = { name: string; score: number; status: "met" | "improve" | "missing" };

type MatchInfo = {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillBreakdown?: SkillBreakdown[];
};

export default function OpportunityDetail() {
  const params = useParams();
  const [location] = useLocation();
  const isJob = location.includes("/jobs/");
  const id = Number(params.id);
  const { isStudent } = useRole();

  const { data: internship } = useInternship(isJob ? 0 : id);
  const { data: job } = useJob(isJob ? id : 0);
  const { data: skills } = useSkills();
  const { data: recommendedInternships } = useRecommendedInternships();
  const { data: recommendedJobs } = useRecommendedJobs();
  const { data: myApplications } = useMyApplications();
  const { data: documents } = useMyDocuments();
  const applyMutation = useApply();

  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [appliedId, setAppliedId] = useState<number | null>(null);

  const opp = (isJob ? job : internship) as any;
  const skillMap = new Map((Array.isArray(skills) ? skills : []).map((s: any) => [s.id, s.name]));
  const requiredSkillIds = (opp?.requiredSkillIds as number[]) ?? [];
  const requiredSkillNames = requiredSkillIds.map((id) => skillMap.get(id) ?? `Skill ${id}`);

  const recommended = (isJob ? recommendedJobs : recommendedInternships) as any;
  const match: MatchInfo | undefined = Array.isArray(recommended)
    ? recommended.find((r: any) => r.id === id)
    : undefined;

  const myApp = (Array.isArray(myApplications) ? myApplications : []).find(
    (a: any) => a.opportunityType === (isJob ? "job" : "internship") && a.opportunityId === id
  );

  const docList = Array.isArray(documents) ? documents : [];

  const handleApply = async () => {
    if (!opp) return;
    try {
      const result: any = await applyMutation.mutateAsync({
        opportunityType: isJob ? "job" : "internship",
        opportunityId: opp.id,
        coverLetter,
        resumeUrl: resumeUrl || undefined,
      });
      setAppliedId(result.id);
      toast.success("Application submitted!");
      setShowApply(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to apply");
    }
  };

  if (!opp) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const eligibility = (opp as any).requirements ?? {};

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <Link href={isJob ? "/opportunities/jobs" : "/opportunities/internships"}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to {(isJob ? "Jobs" : "Internships")}
          </Button>
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize">{opp.type}</Badge>
                  <Badge variant="secondary">{isJob ? "Job" : "Internship"}</Badge>
                  {opp.status && <Badge variant="outline" className="capitalize text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40">{opp.status}</Badge>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{opp.title}</h1>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {opp.location ?? "Remote"}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {opp.duration}</span>
                  <span className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4" /> {opp.stipend || opp.salaryRange}</span>
                  {opp.deadline && (
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Deadline {new Date(opp.deadline).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              {match && (
                <div className="text-center shrink-0">
                  <div className="text-5xl font-bold text-primary">{match.matchScore}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Your compatibility</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader><CardTitle className="text-base">About the {isJob ? "Role" : "Internship"}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{opp.description}</p>
              </CardContent>
            </Card>

            {/* Required skills */}
            <Card>
              <CardHeader><CardTitle className="text-base">Required Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {requiredSkillNames.map((s) => (
                    <Badge key={s} variant="secondary" className="px-3 py-1.5">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Eligibility */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Eligibility</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {eligibility.minCGPA && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Minimum CGPA</p>
                      <p className="font-medium mt-0.5">{eligibility.minCGPA}</p>
                    </div>
                  )}
                  {eligibility.year && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Year</p>
                      <p className="font-medium mt-0.5">{eligibility.year}</p>
                    </div>
                  )}
                  {eligibility.eligibleDegrees && (
                    <div className="p-3 rounded-lg bg-muted/50 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Eligible Degrees</p>
                      <p className="font-medium mt-0.5">{Array.isArray(eligibility.eligibleDegrees) ? eligibility.eligibleDegrees.join(", ") : eligibility.eligibleDegrees}</p>
                    </div>
                  )}
                  {eligibility.note && (
                    <div className="p-3 rounded-lg bg-muted/50 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Note</p>
                      <p className="font-medium mt-0.5">{eligibility.note}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compatibility + Apply */}
          <div className="space-y-6">
            {match && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-base">Your Compatibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary">{match.matchScore}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Match score</p>
                  </div>
                  {match.skillBreakdown && match.skillBreakdown.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2">Skill check</p>
                      <div className="space-y-1.5">
                        {match.skillBreakdown.map((s) => {
                          if (s.status === "met") {
                            return (
                              <p key={s.name} className="text-sm flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {s.name} requirement met ({s.score}%)
                              </p>
                            );
                          }
                          if (s.status === "improve") {
                            return (
                              <p key={s.name} className="text-sm flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" /> {s.name} needs improvement ({s.score}%)
                              </p>
                            );
                          }
                          return (
                            <p key={s.name} className="text-sm flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-500 shrink-0" /> {s.name} — not in your profile yet
                            </p>
                          );
                        })}
                        <p className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Academic eligibility met</p>
                        <p className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Career interest aligned</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {match.matchedSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">Why you're a good match</p>
                          <div className="space-y-1.5">
                            {match.matchedSkills.map((s) => (
                              <p key={s} className="text-sm flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {s} requirement met
                              </p>
                            ))}
                            <p className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Academic eligibility met</p>
                            <p className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Career interest aligned</p>
                          </div>
                        </div>
                      )}
                      {match.missingSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">What you should improve</p>
                          <div className="space-y-1.5">
                            {match.missingSkills.map((s) => (
                              <p key={s} className="text-sm flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" /> {s} — not in your profile yet
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Apply */}
            {isStudent && (
              <Card>
                <CardContent className="p-6">
                  {appliedId || myApp ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                      <p className="font-semibold">Application Submitted ✓</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {myApp ? `Status: ${myApp.status}` : "Track it from My Applications."}
                      </p>
                      <Link href="/applications">
                        <Button variant="outline" size="sm" className="mt-3">View My Applications</Button>
                      </Link>
                    </div>
                  ) : !showApply ? (
                    <Button className="w-full gap-2" onClick={() => setShowApply(true)}>
                      <Send className="h-4 w-4" /> Apply Now
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <p className="font-semibold text-sm">Submit your application</p>
                      {docList.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Resume</label>
                          <Select value={resumeUrl} onValueChange={setResumeUrl}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select a resume" />
                            </SelectTrigger>
                            <SelectContent>
                              {docList.filter((d: any) => d.type === "resume" || d.type === "portfolio").map((d: any) => (
                                <SelectItem key={d.id} value={d.fileUrl}>{d.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Cover note (optional)</label>
                        <Textarea
                          className="mt-1"
                          rows={4}
                          placeholder="Tell the recruiter why you're a great fit..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleApply} disabled={applyMutation.isPending} className="flex-1 gap-2">
                          {applyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Submit Application
                        </Button>
                        <Button variant="outline" onClick={() => setShowApply(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}