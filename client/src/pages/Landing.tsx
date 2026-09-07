import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ROUTES } from "@/lib/constants";
import { useInternships, useSkills } from "@/lib/api";
import { demoLoginAndGo } from "@/lib/demoAuth";
import { JobTrunkLogo } from "@/components/brand/JobTrunkLogo";
import {
  Compass,
  ClipboardCheck,
  BookOpen,
  Hammer,
  Briefcase,
  Users,
  Rocket,
  ArrowRight,
  GraduationCap,
  Building2,
  Landmark,
  Sparkles,
  BarChart3,
  TrendingUp,
  Target,
  Search,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  IndianRupee,
  ShieldCheck,
  Globe2,
  Loader2,
} from "lucide-react";

const JOURNEY = [
  { icon: Compass, title: "Discover", text: "Explore careers, industries and opportunities." },
  { icon: ClipboardCheck, title: "Assess", text: "Understand your current capabilities." },
  { icon: BookOpen, title: "Learn", text: "Close your skill gaps." },
  { icon: Hammer, title: "Build", text: "Create projects and certifications." },
  { icon: Briefcase, title: "Experience", text: "Gain internships and industry experience." },
  { icon: Users, title: "Connect", text: "Meet mentors and industry professionals." },
  { icon: Rocket, title: "Get Hired", text: "Find jobs aligned with your skills and goals." },
];

const DEMO_ROLES = [
  {
    key: "student",
    icon: GraduationCap,
    title: "Continue as Student",
    subtitle: "Arjun Sharma · 3rd Year CSE",
    desc: "Assessment, readiness score, skill gaps, matched internships & applications.",
    cta: "Enter Student Demo",
  },
  {
    key: "industry",
    icon: Briefcase,
    title: "Continue as Recruiter",
    subtitle: "AyushTech Innovations",
    desc: "Post opportunities, see best-matched candidates and build your pipeline.",
    cta: "Enter Recruiter Demo",
  },
  {
    key: "institution",
    icon: Building2,
    title: "Continue as Institution",
    subtitle: "Adarsh Institute of Technology",
    desc: "Skill gaps, placement readiness and department-level analytics.",
    cta: "Enter Institution Demo",
  },
  {
    key: "admin",
    icon: Landmark,
    title: "Continue as Administrator",
    subtitle: "National Skill Mission",
    desc: "The national academia–industry skill ecosystem at a glance.",
    cta: "Enter Ministry Demo",
  },
];

const TRUNK_ITEMS = [
  "Skills",
  "Assessments",
  "Learning",
  "Certifications",
  "Projects",
  "Internships",
  "Mentors",
  "Industry",
  "Jobs",
];

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="text-center mb-12 max-w-2xl mx-auto">
      <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{eyebrow}</p>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{title}</h2>
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
}

export default function Landing() {
  const { data: internships, isLoading: internshipsLoading } = useInternships({ limit: 6 });
  const { data: skills } = useSkills();

  const featured = Array.isArray(internships) ? internships : (internships as any)?.items ?? [];
  const topSkills = Array.isArray(skills)
    ? skills
        .filter((s: any) => s.industryDemand === "high")
        .slice(0, 8)
        .map((s: any) => s.name)
    : [];

  return (
    <PublicLayout>
      {/* ======================= HERO ======================= */}
      <section className="py-20 md:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        </div>
        <div className="container mx-auto text-center max-w-4xl relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            India's Academia–Industry Career Ecosystem
          </div>
          <div className="flex justify-center mb-6">
            <JobTrunkLogo className="text-5xl" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Your Career. <span className="text-primary">One Trunk.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            One intelligent platform connecting skills, learning, internships, industry projects and
            jobs in one career ecosystem.
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-xl mx-auto mb-10">
            Discover what you're good at. Learn what you're missing. Find where you belong.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" className="gap-2" onClick={() => demoLoginAndGo("student")}>
              Build My Career <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href={ROUTES.INTERNSHIPS}>
              <Button variant="outline" size="lg">
                Explore Opportunities
              </Button>
            </Link>
          </div>

          {/* Core story strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-14 text-left">
            {[
              { icon: Target, title: "Industry Requirements", text: "Companies tell JobTrunk what skills they need." },
              { icon: ClipboardCheck, title: "Student Assessment", text: "JobTrunk measures what you have today." },
              { icon: TrendingUp, title: "Skill Gap", text: "You see exactly what to learn next." },
              { icon: Briefcase, title: "Right Opportunity", text: "Matched internships, projects and jobs." },
            ].map((s) => (
              <Card key={s.title} className="bg-background/80 backdrop-blur">
                <CardContent className="p-4">
                  <s.icon className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= DEMO ACCESS ======================= */}
      <section id="demo" className="py-16 px-4 bg-muted/40 border-y">
        <div className="container mx-auto">
          <SectionHeading
            eyebrow="Live Demo"
            title="Step into the ecosystem in one click"
            text="Four roles, one connected platform. Each demo starts with real, seeded data — assessments, matches, applications and analytics all work."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_ROLES.map((role) => (
              <Card key={role.key} className="transition-all hover:shadow-lg hover:-translate-y-0.5">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4 self-start">
                    <role.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{role.title}</h3>
                  <p className="text-xs font-medium text-primary mt-0.5">{role.subtitle}</p>
                  <p className="text-sm text-muted-foreground mt-2 flex-1">{role.desc}</p>
                  <Button className="mt-4 w-full gap-1" size="sm" onClick={() => demoLoginAndGo(role.key)}>
                    {role.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= STATS ======================= */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "30+", label: "Industry Skills Tracked" },
              { value: "100+", label: "Industry Partners" },
              { value: "8+", label: "Learning Providers" },
              { value: "10K+", label: "Students Connected" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= CAREER JOURNEY ======================= */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <SectionHeading
            eyebrow="The JobTrunk Career Journey"
            title="From discovery to hired — one trunk"
            text="Every career needs the same essentials. JobTrunk keeps them connected in one place."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {JOURNEY.map((step, idx) => (
              <div key={step.title} className="relative">
                <Card className="h-full transition-all hover:shadow-md">
                  <CardContent className="p-4 text-center">
                    <div className="relative inline-flex mb-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{step.text}</p>
                  </CardContent>
                </Card>
                {idx < JOURNEY.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-2.5 h-4 w-4 text-muted-foreground/50 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= SKILL INTELLIGENCE + TRUNK VISUAL ======================= */}
      <section className="py-20 px-4 bg-muted/40 border-y">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading
              eyebrow="Skill Intelligence"
              title="Everything your career needs. In one trunk."
              text="Skills, courses, projects, internships, mentors, certifications, jobs and industries — all feeding one connected view of where you are and where you're going."
            />
            <div className="flex flex-wrap gap-2 mb-8">
              {TRUNK_ITEMS.map((item) => (
                <Badge key={item} variant="secondary" className="px-3 py-1.5 text-sm">
                  {item}
                </Badge>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {[
                { icon: CheckCircle2, text: "Industry tells JobTrunk the skills it needs" },
                { icon: ClipboardCheck, text: "JobTrunk measures what students currently have" },
                { icon: TrendingUp, text: "The gap becomes a personalized learning plan" },
                { icon: Briefcase, text: "Students land matched internships and jobs" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-teal-600 shrink-0" />
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6 text-center">
                The JobTrunk loop
              </p>
              <div className="flex flex-col items-center gap-2">
                {[
                  "Industry Requirements",
                  "Required Skills",
                  "Student Assessment",
                  "Current Skills",
                  "Skill Gap",
                  "Personalized Learning",
                  "Internship / Project",
                  "Industry Experience",
                  "Placement",
                ].map((label, idx, arr) => (
                  <div key={label} className="w-full text-center">
                    <div
                      className={`w-full rounded-lg border px-4 py-2 text-sm font-medium ${
                        label === "Skill Gap"
                          ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          : label === "Placement"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-card border-border"
                      }`}
                    >
                      {label}
                    </div>
                    {idx < arr.length - 1 && <div className="h-2 w-px bg-border mx-auto" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ======================= READINESS + GAP ======================= */}
      <section className="py-20 px-4">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading
              eyebrow="Career Readiness Index"
              title="78 / 100. And climbing."
              text="A proprietary 0–100 metric — skill readiness, assessments, projects, certifications, internships and soft skills — shown across your dashboard, portfolio, recruiter views and institutional analytics."
            />
            <div className="space-y-3">
              {[
                { label: "Skill Readiness", score: 77, weight: 35 },
                { label: "Assessments", score: 78, weight: 20 },
                { label: "Projects", score: 85, weight: 15 },
                { label: "Certifications", score: 85, weight: 10 },
                { label: "Internships", score: 70, weight: 10 },
                { label: "Soft Skills", score: 77, weight: 10 },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-32">{c.label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-teal-600"
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-24 text-right">
                    {c.score}/100 · {c.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Card>
            <CardContent className="p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                Skill gap analysis — you vs industry
              </p>
              <div className="space-y-4">
                {[
                  { name: "Python", you: 82, industry: 85, gap: 3 },
                  { name: "SQL", you: 62, industry: 85, gap: 23, highlight: true },
                  { name: "Machine Learning", you: 65, industry: 85, gap: 20 },
                  { name: "Communication", you: 70, industry: 85, gap: 15 },
                  { name: "Problem Solving", you: 84, industry: 90, gap: 6 },
                ].map((row) => (
                  <div key={row.name} className={`rounded-lg border p-3 ${row.highlight ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold flex items-center gap-2">
                        {row.name}
                        {row.highlight && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/60 dark:text-amber-200">Biggest opportunity</Badge>}
                      </span>
                      <span className="text-xs text-muted-foreground">Gap {row.gap}%</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-8">You</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${row.you}%` }} />
                        </div>
                        <span className="text-xs w-8 text-right">{row.you}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-8">Ind.</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-teal-600" style={{ width: `${row.industry}%` }} />
                        </div>
                        <span className="text-xs w-8 text-right">{row.industry}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ======================= LEARNING ======================= */}
      <section className="py-20 px-4 bg-muted/40 border-y">
        <div className="container mx-auto">
          <SectionHeading
            eyebrow="Personalized Learning"
            title="Every recommendation has a reason"
            text="Learning programs are matched to your actual skill gaps — from NPTEL, SWAYAM, Coursera, Udemy and Skill India."
          />
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "SQL for Data Analytics", provider: "NPTEL", reason: "Recommended because SQL is your largest skill gap.", meta: "8 weeks · Free", tag: "Close your SQL gap" },
              { title: "Python for Data Science", provider: "SWAYAM", reason: "Strengthens your strongest skill into an expert level.", meta: "12 weeks · Free", tag: "Go deeper in Python" },
              { title: "Machine Learning Foundations", provider: "Coursera", reason: "Industry demand for ML is high and your score is 65%.", meta: "6 weeks · ₹3,499", tag: "Meet ML demand" },
            ].map((p) => (
              <Card key={p.title} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-teal-600 text-white hover:bg-teal-600">{p.provider}</Badge>
                    <span className="text-xs text-muted-foreground">{p.meta}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{p.reason}</p>
                  <Badge variant="secondary">{p.tag}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= FEATURED INTERNSHIPS ======================= */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <SectionHeading
            eyebrow="Smart Matching"
            title="Featured internships, matched to you"
            text="Every opportunity carries a live compatibility score computed from your profile, assessment and the opportunity's requirements."
          />
          {internshipsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.slice(0, 6).map((item: any) => (
                <Card key={item.id} className="transition-all hover:shadow-md flex flex-col">
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold leading-snug">{item.title}</h3>
                      <Badge variant="outline" className="shrink-0 ml-2">
                        {item.type === "hybrid" ? "Hybrid" : item.type === "remote" ? "Remote" : "On-site"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location ?? "Remote"}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.duration}</span>
                      <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{item.stipend}</span>
                    </div>
                    <Link href={`/opportunities/internships/${item.id}`} className="mt-auto">
                      <Button variant="outline" size="sm" className="w-full gap-1">
                        View Details <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================= SMART MATCHING 91% ======================= */}
      <section className="py-20 px-4 bg-muted/40 border-y">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <Card className="border-primary/30">
            <CardContent className="p-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Healthcare Data Analytics Intern · AyushTech Innovations
              </p>
              <div className="text-7xl font-bold text-primary mb-2">91%</div>
              <p className="text-sm text-muted-foreground mb-6">Your compatibility score</p>
              <div className="space-y-2 text-left">
                <p className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Python requirement met (82%)</p>
                <p className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Academic eligibility met</p>
                <p className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Career interest aligned — Healthcare Analytics</p>
                <p className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> SQL needs improvement (62%)</p>
              </div>
            </CardContent>
          </Card>
          <div>
            <SectionHeading
              eyebrow="Smart Matching"
              title="The score is explained, never guessed"
              text="91% isn't a badge — it's a calculation from your skill profile, assessment results, academic eligibility and career interests. You see exactly why you match, and exactly what to improve."
            />
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "65%", label: "Skill coverage & depth" },
                { value: "25%", label: "Skill proficiency" },
                { value: "10%", label: "Career readiness" },
              ].map((w) => (
                <Card key={w.label}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{w.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{w.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================= ECOSYSTEM ======================= */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <SectionHeading
            eyebrow="One Ecosystem"
            title="Built for every stakeholder"
            text="The same connected data powers each view — students, institutions, industry and government."
          />
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <Building2 className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Institution Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Skill gap heatmaps by department, placement funnels and internship participation —
                  so institutions know what to teach next.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Briefcase className="h-8 w-8 text-teal-600 mb-3" />
                <h3 className="font-semibold mb-2">Industry Ecosystem</h3>
                <p className="text-sm text-muted-foreground">
                  Companies post what they need and discover better-matched talent — shortlist, interview
                  and hire from one pipeline.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Landmark className="h-8 w-8 text-emerald-600 mb-3" />
                <h3 className="font-semibold mb-2">National Ecosystem</h3>
                <p className="text-sm text-muted-foreground">
                  A ministry-level view of national skill demand, gaps, placement trends and
                  state-level distribution.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ======================= AI COPILOT ======================= */}
      <section className="py-20 px-4 bg-muted/40 border-y">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">JobTrunk AI</h2>
          <p className="text-lg text-muted-foreground mb-3">Your Personal Career Copilot</p>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Ask what career suits your skills, what to learn next, which internships match you, or how
            to raise your readiness. Answers come from your real profile — skills, gaps and matches.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              "What career suits my skills?",
              "What should I learn next?",
              "Find internships for me.",
              "How can I improve my career readiness?",
            ].map((q) => (
              <Badge key={q} variant="outline" className="px-3 py-1.5 text-sm">{q}</Badge>
            ))}
          </div>
          <Button size="lg" className="gap-2" onClick={() => demoLoginAndGo("student")}>
            Ask JobTrunk AI <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ======================= FINAL CTA ======================= */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            From skills to opportunities.
          </h2>
          <p className="text-muted-foreground mb-8">
            Learn. Build. Experience. Get Hired. Your entire career ecosystem lives inside JobTrunk.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" className="gap-2" onClick={() => demoLoginAndGo("student")}>
              Start Your Career Journey <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href={ROUTES.INTERNSHIPS}>
              <Button variant="outline" size="lg" className="gap-2">
                <Search className="h-4 w-4" /> Browse Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}