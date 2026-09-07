import * as analyticsDb from "../db/analytics";
import { getDb } from "../db/index";
import * as demo from "../demo";

export async function getInstitutionDashboard(institutionId: number) {
  if (!getDb()) return demo.demoGetInstitutionDashboard();

  const [stats, skillDistribution, applicationStats] = await Promise.all([
    analyticsDb.getInstitutionStats(institutionId),
    analyticsDb.getStudentSkillDistribution(institutionId),
    analyticsDb.getApplicationStats(),
  ]);

  return {
    overview: {
      totalStudents: stats.totalStudents,
      totalFaculty: stats.totalFaculty,
      activeInternships: stats.activeInternships,
      avgSkillScore: stats.avgSkillScore,
    },
    skillDistribution,
    applicationStats,
    generatedAt: new Date().toISOString(),
  };
}

export async function getIndustryDashboard(industryUserId: number) {
  if (!getDb()) return demo.demoGetIndustryDashboard(industryUserId);

  const [internshipStats, jobStats, programStats, recruitmentTrends] = await Promise.all([
    analyticsDb.getApplicationStats("internship"),
    analyticsDb.getApplicationStats("job"),
    analyticsDb.getApplicationStats("learning_program"),
    analyticsDb.getRecruitmentOutcomes(industryUserId),
  ]);

  return {
    overview: {
      totalInternshipApplications: internshipStats.total,
      totalJobApplications: jobStats.total,
      totalProgramEnrollments: programStats.total,
      overallAcceptanceRate: internshipStats.total + jobStats.total > 0
        ? Math.round(((internshipStats.accepted + jobStats.accepted) / (internshipStats.total + jobStats.total)) * 100)
        : 0,
    },
    internshipStats,
    jobStats,
    programStats,
    recruitmentTrends,
    generatedAt: new Date().toISOString(),
  };
}

export async function getStudentDashboard(userId: number) {
  const [topSkills, readiness] = await Promise.all([
    analyticsDb.getTopSkills(),
    analyticsDb.getPlacementReadiness(),
  ]);

  return {
    topSkills,
    placementReadiness: readiness,
    generatedAt: new Date().toISOString(),
  };
}

export async function getSystemHealth() {
  return {
    status: "healthy",
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  };
}
