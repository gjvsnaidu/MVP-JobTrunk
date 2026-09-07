import * as analyticsDb from "../db/analytics";

export type ReportType =
  | "placement_report"
  | "skill_gap_report"
  | "internship_participation"
  | "program_effectiveness"
  | "custom";

export type ReportParameters = {
  startDate?: string;
  endDate?: string;
  institutionId?: number;
  industryUserId?: number;
  [key: string]: any;
};

const REPORT_TYPES: Record<ReportType, { name: string; description: string; parameters: string[] }> = {
  placement_report: {
    name: "Placement Report",
    description: "Students placed, average salary, top employers",
    parameters: ["startDate", "endDate", "institutionId"],
  },
  skill_gap_report: {
    name: "Skill Gap Report",
    description: "Institution-wide skill levels vs industry demand",
    parameters: ["institutionId"],
  },
  internship_participation: {
    name: "Internship Participation Report",
    description: "Participation rates, completion rates, outcomes",
    parameters: ["startDate", "endDate"],
  },
  program_effectiveness: {
    name: "Learning Program Effectiveness",
    description: "Enrollment, completion, and placement correlation",
    parameters: ["startDate", "endDate"],
  },
  custom: {
    name: "Custom Report",
    description: "Configurable metrics with custom date range",
    parameters: ["startDate", "endDate", "institutionId", "industryUserId"],
  },
};

export function getReportTypes() {
  return Object.entries(REPORT_TYPES).map(([key, value]) => ({
    id: key,
    ...value,
  }));
}

export async function generateReport(type: ReportType, parameters: ReportParameters) {
  switch (type) {
    case "placement_report":
      return generatePlacementReport(parameters);
    case "skill_gap_report":
      return generateSkillGapReport(parameters);
    case "internship_participation":
      return generateInternshipParticipationReport(parameters);
    case "program_effectiveness":
      return generateProgramEffectivenessReport(parameters);
    case "custom":
      return generateCustomReport(parameters);
    default:
      throw new Error(`Unknown report type: ${type}`);
  }
}

async function generatePlacementReport(params: ReportParameters) {
  const [applications, topSkills, outcomes] = await Promise.all([
    analyticsDb.getApplicationStats(),
    analyticsDb.getTopSkills(),
    analyticsDb.getRecruitmentOutcomes(params.industryUserId),
  ]);

  return {
    title: "Placement Report",
    generatedAt: new Date().toISOString(),
    parameters: params,
    data: {
      applicationStats: applications,
      topSkills: topSkills.slice(0, 10),
      recruitmentTrends: outcomes,
      summary: {
        totalApplications: applications.total,
        acceptanceRate: applications.total > 0 ? Math.round((applications.accepted / applications.total) * 100) : 0,
        shortlistRate: applications.total > 0 ? Math.round((applications.shortlisted / applications.total) * 100) : 0,
      },
    },
  };
}

async function generateSkillGapReport(params: ReportParameters) {
  const [demand, distribution] = await Promise.all([
    analyticsDb.getSkillDemandTrends(),
    analyticsDb.getStudentSkillDistribution(params.institutionId),
  ]);

  return {
    title: "Skill Gap Report",
    generatedAt: new Date().toISOString(),
    parameters: params,
    data: {
      skillDemand: demand,
      skillDistribution: distribution,
      summary: {
        totalSkillsTracked: demand.length,
        highDemandSkills: demand.filter((s) => s.industryDemand === "high").length,
        skillsWithStudents: demand.filter((s) => s.studentCount > 0).length,
      },
    },
  };
}

async function generateInternshipParticipationReport(params: ReportParameters) {
  const [applications, readiness] = await Promise.all([
    analyticsDb.getApplicationStats("internship"),
    analyticsDb.getPlacementReadiness(),
  ]);

  return {
    title: "Internship Participation Report",
    generatedAt: new Date().toISOString(),
    parameters: params,
    data: {
      internshipApplications: applications,
      placementReadiness: readiness,
      summary: {
        totalInternshipApplications: applications.total,
        pendingApplications: applications.pending,
        acceptedApplications: applications.accepted,
      },
    },
  };
}

async function generateProgramEffectivenessReport(params: ReportParameters) {
  const programs = await analyticsDb.getProgramEffectiveness();

  return {
    title: "Learning Program Effectiveness Report",
    generatedAt: new Date().toISOString(),
    parameters: params,
    data: {
      programs,
      summary: {
        activePrograms: programs.length,
        totalEnrolled: programs.reduce((sum, p) => sum + (p.enrolledCount ?? 0), 0),
      },
    },
  };
}

async function generateCustomReport(params: ReportParameters) {
  const [applications, topSkills, readiness] = await Promise.all([
    analyticsDb.getApplicationStats(),
    analyticsDb.getTopSkills(),
    analyticsDb.getPlacementReadiness(),
  ]);

  return {
    title: "Custom Report",
    generatedAt: new Date().toISOString(),
    parameters: params,
    data: {
      applications,
      topSkills,
      readiness,
    },
  };
}

export function generateCSV(data: any[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => `"${String(row[h] ?? "")}"`).join(","));
  return [headers.join(","), ...rows].join("\n");
}
