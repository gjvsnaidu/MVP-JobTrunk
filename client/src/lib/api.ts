import { QueryClient, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// =============================================================================
// API Client
// =============================================================================

const API_BASE = "/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || res.statusText, body.details);
  }

  // Handle CSV responses
  if (res.headers.get("content-type")?.includes("text/csv")) {
    return res.text() as any;
  }

  return res.json();
}

// =============================================================================
// Query Client
// =============================================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// =============================================================================
// Auth Hooks
// =============================================================================

export const useMe = () =>
  useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<any>("/auth/me"),
    retry: false,
  });

export const useOnboardingStatus = () =>
  useQuery({
    queryKey: ["auth", "onboarding-status"],
    queryFn: () => apiFetch("/auth/onboarding-status"),
    retry: false,
  });

export const useOnboard = () =>
  useMutation({
    mutationFn: (data: any) => apiFetch("/auth/onboard", { method: "POST", body: JSON.stringify(data) }),
  });

// =============================================================================
// Skills Hooks
// =============================================================================

export const useSkillCategories = () =>
  useQuery({ queryKey: ["skills", "categories"], queryFn: () => apiFetch("/skill-categories") });

export const useSkills = (filters?: { categoryId?: number; demand?: string }) =>
  useQuery({ queryKey: ["skills", filters], queryFn: () => apiFetch("/skills") });

export const useAssessments = () =>
  useQuery({ queryKey: ["assessments"], queryFn: () => apiFetch("/assessments") });

export const useAssessment = (id: number) =>
  useQuery({ queryKey: ["assessments", id], queryFn: () => apiFetch(`/assessments/${id}`), enabled: !!id });

export const useSubmitAssessment = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiFetch(`/assessments/${id}/submit`, { method: "POST", body: JSON.stringify(data) }),
  });

export const useMySkillProfile = () =>
  useQuery({ queryKey: ["skill-profile"], queryFn: () => apiFetch("/skill-profile") });

export const useUserSkillProfile = (userId: number) =>
  useQuery<any>({ queryKey: ["skill-profile", userId], queryFn: () => apiFetch(`/skill-profile/${userId}`), enabled: !!userId });

export const useUpdateSkillProfile = () =>
  useMutation({
    mutationFn: (data: any) => apiFetch("/skill-profile", { method: "PUT", body: JSON.stringify(data) }),
  });

export const useGapAnalysis = () =>
  useMutation({ mutationFn: () => apiFetch("/skill-profile/gap-analysis", { method: "POST" }) });

export const useGapAnalysisQuery = () =>
  useQuery<any>({ queryKey: ["skill-profile", "gap-analysis"], queryFn: () => apiFetch("/skill-profile/gap-analysis") });

export const useSkillAssessmentResults = () =>
  useQuery({ queryKey: ["skill-assessment-results"], queryFn: () => apiFetch("/skill-assessment-results") });

// =============================================================================
// Opportunities Hooks
// =============================================================================

export const useInternships = (filters?: any) =>
  useQuery({ queryKey: ["internships", filters], queryFn: () => apiFetch("/internships") });

export const useRecommendedInternships = () =>
  useQuery({ queryKey: ["internships", "recommended"], queryFn: () => apiFetch("/internships/recommended") });

export const useInternship = (id: number) =>
  useQuery({ queryKey: ["internships", id], queryFn: () => apiFetch(`/internships/${id}`), enabled: !!id });

export const useJobs = (filters?: any) =>
  useQuery({ queryKey: ["jobs", filters], queryFn: () => apiFetch("/jobs") });

export const useRecommendedJobs = () =>
  useQuery({ queryKey: ["jobs", "recommended"], queryFn: () => apiFetch("/jobs/recommended") });

export const useJob = (id: number) =>
  useQuery({ queryKey: ["jobs", id], queryFn: () => apiFetch(`/jobs/${id}`), enabled: !!id });

export const useCreateInternship = () =>
  useMutation({ mutationFn: (data: any) => apiFetch("/internships", { method: "POST", body: JSON.stringify(data) }) });

export const useCreateJob = () =>
  useMutation({ mutationFn: (data: any) => apiFetch("/jobs", { method: "POST", body: JSON.stringify(data) }) });

export const useApply = () =>
  useMutation({ mutationFn: (data: any) => apiFetch("/applications", { method: "POST", body: JSON.stringify(data) }) });

export const useMyApplications = () =>
  useQuery({ queryKey: ["applications", "my"], queryFn: () => apiFetch("/applications/my") });

export const useToggleSaved = () =>
  useMutation({ mutationFn: (data: any) => apiFetch("/saved/toggle", { method: "POST", body: JSON.stringify(data) }) });

export const useSaved = () =>
  useQuery({ queryKey: ["saved"], queryFn: () => apiFetch("/saved") });

// =============================================================================
// Learning Programs Hooks
// =============================================================================

export const useLearningPrograms = (filters?: any) =>
  useQuery({ queryKey: ["learning-programs", filters], queryFn: () => apiFetch("/learning-programs") });

export const useRecommendedPrograms = () =>
  useQuery({ queryKey: ["learning-programs", "recommended"], queryFn: () => apiFetch("/learning-programs/recommended") });

export const useLearningProgram = (id: number) =>
  useQuery({ queryKey: ["learning-programs", id], queryFn: () => apiFetch(`/learning-programs/${id}`), enabled: !!id });

export const useEnrollInProgram = () =>
  useMutation({ mutationFn: (id: number) => apiFetch(`/learning-programs/${id}/enroll`, { method: "POST" }) });

export const useCreateLearningProgram = () =>
  useMutation({ mutationFn: (data: any) => apiFetch("/learning-programs", { method: "POST", body: JSON.stringify(data) }) });

// =============================================================================
// Profile Hooks
// =============================================================================

export const useMyProfile = () =>
  useQuery({ queryKey: ["profile"], queryFn: () => apiFetch("/profile") });

export const useUpdateProfile = () =>
  useMutation({ mutationFn: (data: any) => apiFetch("/profile", { method: "PUT", body: JSON.stringify(data) }) });

// =============================================================================
// Portfolio Hooks
// =============================================================================

export const useMyPortfolio = () =>
  useQuery({ queryKey: ["portfolio"], queryFn: () => apiFetch("/portfolio") });

export const useCreatePortfolioItem = () =>
  useMutation({ mutationFn: (data: any) => apiFetch("/portfolio", { method: "POST", body: JSON.stringify(data) }) });

export const useUpdatePortfolioItem = () =>
  useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => apiFetch(`/portfolio/${id}`, { method: "PUT", body: JSON.stringify(data) }) });

export const useDeletePortfolioItem = () =>
  useMutation({ mutationFn: (id: number) => apiFetch(`/portfolio/${id}`, { method: "DELETE" }) });

// =============================================================================
// Faculty & Collaboration Hooks
// =============================================================================

export const useFacultyOpportunities = () =>
  useQuery({ queryKey: ["faculty-opportunities"], queryFn: () => apiFetch("/faculty-opportunities") });

export const useCollaborations = () =>
  useQuery({ queryKey: ["collaborations"], queryFn: () => apiFetch("/collaborations") });

export const useMyCollaborations = () =>
  useQuery({ queryKey: ["collaborations", "my"], queryFn: () => apiFetch("/collaborations/my") });

// =============================================================================
// Messaging Hooks
// =============================================================================

export const useConversations = () =>
  useQuery({ queryKey: ["conversations"], queryFn: () => apiFetch("/conversations"), refetchInterval: 10000 });

export const useMessages = (conversationId: number) =>
  useQuery({ queryKey: ["conversations", conversationId, "messages"], queryFn: () => apiFetch(`/conversations/${conversationId}/messages`), enabled: !!conversationId });

export const useSendMessage = () =>
  useMutation({ mutationFn: ({ conversationId, content }: { conversationId: number; content: string }) => apiFetch(`/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ content }) }) });

// =============================================================================
// Notifications Hooks
// =============================================================================

export const useNotifications = (page?: number) =>
  useQuery({ queryKey: ["notifications", page], queryFn: () => apiFetch(`/notifications?page=${page ?? 1}`) });

export const useUnreadNotificationCount = () =>
  useQuery({ queryKey: ["notifications", "unread-count"], queryFn: () => apiFetch("/notifications/unread-count"), refetchInterval: 30000 });

export const useMarkNotificationRead = () =>
  useMutation({ mutationFn: (id: number) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }) });

export const useMarkAllNotificationsRead = () =>
  useMutation({ mutationFn: () => apiFetch("/notifications/read-all", { method: "PATCH" }) });

// =============================================================================
// Analytics Hooks
// =============================================================================

export const useSkillDemand = () =>
  useQuery({ queryKey: ["analytics", "skill-demand"], queryFn: () => apiFetch("/analytics/skill-demand") });

export const usePlacementReadiness = () =>
  useQuery({ queryKey: ["analytics", "placement-readiness"], queryFn: () => apiFetch("/analytics/placement-readiness") });

export const useTopSkills = () =>
  useQuery({ queryKey: ["analytics", "top-skills"], queryFn: () => apiFetch("/analytics/top-skills") });

export const useInstitutionDashboard = () =>
  useQuery({ queryKey: ["institution", "dashboard"], queryFn: () => apiFetch("/institution/dashboard") });

export const useInstitutionStudents = () =>
  useQuery({ queryKey: ["institution", "students"], queryFn: () => apiFetch("/institution/students") });

export const useInstitutionSkillDistribution = () =>
  useQuery({ queryKey: ["institution", "skill-distribution"], queryFn: () => apiFetch("/institution/students/skill-distribution") });

// =============================================================================
// Career Guidance Hooks
// =============================================================================

export const useCareerGuidance = () =>
  useQuery({ queryKey: ["career-guidance"], queryFn: () => apiFetch("/career-guidance") });

export const useRefreshCareerGuidance = () =>
  useMutation({ mutationFn: () => apiFetch("/career-guidance/refresh", { method: "POST" }) });

// =============================================================================
// Admin Hooks
// =============================================================================

export const useAdminUsers = (filters?: any) =>
  useQuery({ queryKey: ["admin", "users", filters], queryFn: () => apiFetch("/admin/users") });

export const useAdminInstitutions = () =>
  useQuery({ queryKey: ["admin", "institutions"], queryFn: () => apiFetch("/admin/institutions") });

// =============================================================================
// Career Readiness & AI Hooks
// =============================================================================

export const useStudentReadiness = () =>
  useQuery<any>({ queryKey: ["student", "readiness"], queryFn: () => apiFetch("/student/readiness") });

export const useAskAI = () =>
  useMutation<any, any, string>({
    mutationFn: (question: string) => apiFetch("/ai/ask", { method: "POST", body: JSON.stringify({ question }) }),
  });

export const useAIContext = () =>
  useQuery<any>({ queryKey: ["student", "ai-context"], queryFn: () => apiFetch("/student/ai-context") });

// =============================================================================
// Recruiter Hooks
// =============================================================================

export const useOpportunityCandidates = (opportunityType: string, opportunityId: number) =>
  useQuery<any>({
    queryKey: ["opportunities", opportunityType, opportunityId, "candidates"],
    queryFn: () => apiFetch(`/opportunities/${opportunityType}/${opportunityId}/candidates`),
    enabled: !!opportunityId,
  });

export const useOpportunityApplications = (opportunityType: string, opportunityId: number) =>
  useQuery<any>({
    queryKey: ["applications", "for", opportunityType, opportunityId],
    queryFn: () => apiFetch(`/applications/for/${opportunityType}/${opportunityId}`),
    enabled: !!opportunityId,
  });

export const useUpdateApplicationStatus = () =>
  useMutation<any, any, any>({
    mutationFn: (data: any) => apiFetch(`/applications/${data.id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
  });

export const useShortlistCandidate = () =>
  useMutation<any, any, any>({
    mutationFn: (data: { opportunityType: string; opportunityId: number; userId: number }) =>
      apiFetch(`/opportunities/${data.opportunityType}/${data.opportunityId}/candidates/${data.userId}/shortlist`, { method: "POST" }),
  });

// =============================================================================
// Admin / National Hooks
// =============================================================================

export const useNationalDashboard = () =>
  useQuery<any>({ queryKey: ["admin", "national-dashboard"], queryFn: () => apiFetch("/admin/national-dashboard") });

// =============================================================================
// Reports Hooks
// =============================================================================

export const useReportTypes = () =>
  useQuery({ queryKey: ["reports", "types"], queryFn: () => apiFetch("/reports/types") });

export const useGenerateReport = () =>
  useMutation({ mutationFn: (data: any) => apiFetch("/reports/generate", { method: "POST", body: JSON.stringify(data) }) });

// =============================================================================
// Documents Hooks
// =============================================================================

export const useMyDocuments = () =>
  useQuery({ queryKey: ["documents"], queryFn: () => apiFetch("/documents") });

export const useUploadDocument = () =>
  useMutation({ mutationFn: (data: any) => apiFetch("/documents", { method: "POST", body: JSON.stringify(data) }) });
