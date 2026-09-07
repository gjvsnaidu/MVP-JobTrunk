// Route paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ONBOARDING: "/onboarding",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SKILLS_ASSESSMENT: "/skills/assessment",
  SKILLS_RESULTS: "/skills/results",
  SKILLS_MAPPING: "/skills/mapping",
  CAREER_GUIDANCE: "/career-guidance",
  PORTFOLIO: "/portfolio",
  APPLICATIONS: "/applications",
  INTERNSHIPS: "/opportunities/internships",
  JOBS: "/opportunities/jobs",
  LEARNING: "/learning",
  FACULTY: "/faculty-opportunities",
  COLLABORATIONS: "/collaborations",
  MESSAGES: "/messages",
  NOTIFICATIONS: "/notifications",
  DOCUMENTS: "/documents",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_INSTITUTIONS: "/admin/institutions",
  ADMIN_SKILLS: "/admin/skills",
  ADMIN_SETTINGS: "/admin/settings",
  INSTITUTION_DASHBOARD: "/institution/dashboard",
  INSTITUTION_STUDENTS: "/institution/students",
  INSTITUTION_ANALYTICS: "/institution/analytics",
  INSTITUTION_FACULTY: "/institution/faculty",
} as const;

// Skill proficiency colors
export const PROFICIENCY_COLORS: Record<string, string> = {
  beginner: "bg-gray-100 text-gray-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-purple-100 text-purple-800",
  expert: "bg-green-100 text-green-800",
};

// Demand colors
export const DEMAND_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-800",
};

// Role-specific sidebar menus
export const ROLE_MENUS: Record<string, Array<{ icon: string; label: string; path: string }>> = {
  student: [
    { icon: "LayoutDashboard", label: "Dashboard", path: ROUTES.DASHBOARD },
    { icon: "ClipboardCheck", label: "Skill Assessment", path: ROUTES.SKILLS_ASSESSMENT },
    { icon: "BarChart3", label: "My Skills", path: ROUTES.SKILLS_RESULTS },
    { icon: "Sparkles", label: "Career Guidance", path: ROUTES.CAREER_GUIDANCE },
    { icon: "Briefcase", label: "Internships", path: ROUTES.INTERNSHIPS },
    { icon: "FileText", label: "Jobs", path: ROUTES.JOBS },
    { icon: "GraduationCap", label: "Learning Programs", path: ROUTES.LEARNING },
    { icon: "FolderOpen", label: "Portfolio", path: ROUTES.PORTFOLIO },
    { icon: "Send", label: "Applications", path: ROUTES.APPLICATIONS },
    { icon: "MessageSquare", label: "Messages", path: ROUTES.MESSAGES },
    { icon: "Sparkles", label: "JobTrunk AI", path: "/ai" },
  ],
  industry: [
    { icon: "LayoutDashboard", label: "Dashboard", path: "/recruiter" },
    { icon: "Users", label: "Candidate Matching", path: "/recruiter/candidates" },
    { icon: "PlusCircle", label: "Post Opportunity", path: "/opportunities/new" },
    { icon: "Briefcase", label: "Manage Listings", path: "/opportunities/manage" },
    { icon: "Send", label: "Applications", path: "/applicants" },
    { icon: "GraduationCap", label: "Learning Programs", path: ROUTES.LEARNING },
    { icon: "Handshake", label: "Collaborations", path: ROUTES.COLLABORATIONS },
    { icon: "MessageSquare", label: "Messages", path: ROUTES.MESSAGES },
    { icon: "Sparkles", label: "JobTrunk AI", path: "/ai" },
  ],
  academician: [
    { icon: "LayoutDashboard", label: "Dashboard", path: ROUTES.DASHBOARD },
    { icon: "BookOpen", label: "Faculty Opportunities", path: ROUTES.FACULTY },
    { icon: "Handshake", label: "Collaborations", path: ROUTES.COLLABORATIONS },
    { icon: "MessageSquare", label: "Messages", path: ROUTES.MESSAGES },
  ],
  institution: [
    { icon: "LayoutDashboard", label: "Dashboard", path: ROUTES.INSTITUTION_DASHBOARD },
    { icon: "Users", label: "Students", path: ROUTES.INSTITUTION_STUDENTS },
    { icon: "BarChart3", label: "Skill Analytics", path: ROUTES.INSTITUTION_ANALYTICS },
    { icon: "BookOpen", label: "Faculty", path: ROUTES.INSTITUTION_FACULTY },
    { icon: "FileText", label: "Reports", path: "/institution/reports" },
    { icon: "Sparkles", label: "JobTrunk AI", path: "/ai" },
  ],
  admin: [
    { icon: "Landmark", label: "National Dashboard", path: ROUTES.ADMIN_DASHBOARD },
    { icon: "Users", label: "Users", path: ROUTES.ADMIN_USERS },
    { icon: "Building", label: "Institutions", path: ROUTES.ADMIN_INSTITUTIONS },
    { icon: "Layers", label: "Skill Taxonomy", path: ROUTES.ADMIN_SKILLS },
    { icon: "Settings", label: "Settings", path: ROUTES.ADMIN_SETTINGS },
    { icon: "Plug", label: "Integrations", path: "/admin/integrations" },
    { icon: "Sparkles", label: "JobTrunk AI", path: "/ai" },
  ],
};
