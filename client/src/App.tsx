import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useRole } from "./hooks/useRole";

// Public pages
import Landing from "@/pages/Landing";

// Dashboard pages
import StudentDashboard from "@/pages/student/Dashboard";
import IndustryDashboard from "@/pages/industry/Dashboard";
import AcademicianDashboard from "@/pages/academician/Dashboard";
import InstitutionDashboard from "@/pages/institution/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import Recruiter from "@/pages/industry/Recruiter";

// Student pages
import SkillAssessment from "@/pages/student/SkillAssessment";
import SkillResults from "@/pages/student/SkillResults";
import CareerGuidance from "@/pages/student/CareerGuidance";
import Portfolio from "@/pages/student/Portfolio";
import Applications from "@/pages/student/Applications";

// Shared pages
import Internships from "@/pages/shared/Internships";
import LearningPrograms from "@/pages/shared/LearningPrograms";
import OpportunityDetail from "@/pages/shared/OpportunityDetail";
import JobTrunkAI from "@/pages/shared/JobTrunkAI";
import Profile from "@/pages/Profile";

// Messaging & Notifications
import MessagingInbox from "@/pages/messaging/Inbox";
import Conversation from "@/pages/messaging/Conversation";
import NotificationList from "@/pages/notifications/NotificationList";

function getDashboardPage(role: string | null) {
  switch (role) {
    case "student":
      return StudentDashboard;
    case "industry":
      return Recruiter;
    case "academician":
      return AcademicianDashboard;
    case "institution":
      return InstitutionDashboard;
    case "admin":
      return AdminDashboard;
    default:
      return StudentDashboard;
  }
}

function RoleDashboard() {
  const { role } = useRole();
  const Page = getDashboardPage(role);
  return <Page />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Landing} />
      <Route path="/404" component={NotFound} />

      {/* Dashboard — role-based */}
      <Route path="/dashboard" component={RoleDashboard} />
      <Route path="/institution/dashboard" component={InstitutionDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminDashboard} />
      <Route path="/admin/institutions" component={AdminDashboard} />
      <Route path="/admin/skills" component={AdminDashboard} />
      <Route path="/admin/settings" component={AdminDashboard} />
      <Route path="/admin/national-dashboard" component={AdminDashboard} />

      {/* Recruiter */}
      <Route path="/recruiter" component={Recruiter} />
      <Route path="/recruiter/candidates" component={Recruiter} />
      <Route path="/recruiter/opportunities" component={Recruiter} />

      {/* Student */}
      <Route path="/skills/assessment" component={SkillAssessment} />
      <Route path="/skills/results" component={SkillResults} />
      <Route path="/skills/mapping" component={SkillResults} />
      <Route path="/career-guidance" component={CareerGuidance} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/applications" component={Applications} />

      {/* Opportunities */}
      <Route path="/opportunities/internships" component={Internships} />
      <Route path="/opportunities/jobs" component={Internships} />
      <Route path="/opportunities/internships/:id" component={OpportunityDetail} />
      <Route path="/opportunities/jobs/:id" component={OpportunityDetail} />
      <Route path="/opportunities/new" component={IndustryDashboard} />
      <Route path="/opportunities/manage" component={Recruiter} />
      <Route path="/applicants" component={Recruiter} />

      {/* Learning */}
      <Route path="/learning" component={LearningPrograms} />
      <Route path="/learning/new" component={IndustryDashboard} />
      <Route path="/learning/:id" component={LearningPrograms} />

      {/* JobTrunk AI */}
      <Route path="/ai" component={JobTrunkAI} />

      {/* Faculty & Collaboration */}
      <Route path="/faculty-opportunities" component={AcademicianDashboard} />
      <Route path="/collaborations" component={AcademicianDashboard} />

      {/* Institution */}
      <Route path="/institution/students" component={InstitutionDashboard} />
      <Route path="/institution/analytics" component={InstitutionDashboard} />
      <Route path="/institution/faculty" component={InstitutionDashboard} />

      {/* Messaging */}
      <Route path="/messages" component={MessagingInbox} />
      <Route path="/messages/:id" component={Conversation} />

      {/* Notifications */}
      <Route path="/notifications" component={NotificationList} />

      {/* Profile */}
      <Route path="/profile" component={Profile} />

      {/* Documents */}
      <Route path="/documents" component={Profile} />

      {/* Final fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;