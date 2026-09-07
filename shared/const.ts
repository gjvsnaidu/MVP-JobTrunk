export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
export const NOT_ROLE_ERR_MSG = "Insufficient role permissions (10003)";

// One-time nonce cookie that binds an OAuth login to the browser that started it.
export const OAUTH_STATE_COOKIE = "__Host-oauth_state";

export type OAuthState = { redirectUri: string; nonce?: string };

export const encodeOAuthState = (state: OAuthState): string => btoa(JSON.stringify(state));

export const decodeOAuthState = (state: string): OAuthState => {
  let decoded: string;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
    // Legacy links
  }
  return { redirectUri: decoded };
};

// =============================================================================
// Role & Status Enums
// =============================================================================

export const ROLES = ["student", "industry", "academician", "institution", "admin", "user"] as const;
export type UserRole = (typeof ROLES)[number];

export const SKILL_PROFICIENCY = ["beginner", "intermediate", "advanced", "expert"] as const;
export type SkillProficiency = (typeof SKILL_PROFICIENCY)[number];

export const INDUSTRY_DEMAND = ["high", "medium", "low"] as const;
export type IndustryDemand = (typeof INDUSTRY_DEMAND)[number];

export const OPPORTUNITY_STATUS = ["draft", "open", "closed", "filled"] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUS)[number];

export const APPLICATION_STATUS = ["pending", "shortlisted", "interview", "accepted", "rejected", "withdrawn"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS)[number];

export const COLLABORATION_STATUS = ["planned", "active", "completed", "cancelled"] as const;
export type CollaborationStatus = (typeof COLLABORATION_STATUS)[number];

// =============================================================================
// Status Display Labels & Colors
// =============================================================================

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  screening: "Screening",
  shortlisted: "Shortlisted",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  draft: "Draft",
  open: "Open",
  closed: "Closed",
  filled: "Filled",
  planned: "Planned",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  screening: "bg-slate-100 text-slate-800",
  shortlisted: "bg-blue-100 text-blue-800",
  interview: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
  open: "bg-green-100 text-green-800",
  closed: "bg-red-100 text-red-800",
  filled: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

export const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  industry: "Industry",
  academician: "Academician",
  institution: "Institution",
  admin: "Admin",
  user: "User",
};
