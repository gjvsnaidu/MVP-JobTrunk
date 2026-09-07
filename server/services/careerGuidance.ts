import { getCareerRecommendations } from "./matching";
import { computeGapAnalysis } from "./skillAssessment";
import { getDb } from "../db/index";
import { studentSkillProfiles, skills } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import * as demo from "../demo";

type CareerPath = {
  title: string;
  matchScore: number;
  requiredSkills: string[];
  currentSkills: string[];
  gapSkills: string[];
  recommendedPrograms: any[];
  recommendedInternships: any[];
  description: string;
};

/**
 * Generate personalized career guidance for a student.
 * Analyzes skills, interests, and market demand to recommend career paths.
 */
export async function generateCareerGuidance(userId: number) {
  const db = getDb();
  if (!db) return demo.demoGenerateCareerGuidance(userId);

  // Get gap analysis
  const gapAnalysis = await computeGapAnalysis(userId);

  // Get matching opportunities
  const matching = await getCareerRecommendations(userId);

  // Get student's current skills
  const profiles = await db
    .select()
    .from(studentSkillProfiles)
    .where(eq(studentSkillProfiles.userId, userId));

  const allSkills = await db.select().from(skills);
  const skillMap = new Map(allSkills.map((s) => [s.id, s]));

  const currentSkills = profiles
    .map((p) => skillMap.get(p.skillId)?.name)
    .filter(Boolean) as string[];

  // Generate career paths from top matches
  const careerPaths: CareerPath[] = [];

  // Group internships by implied career path
  const seenTitles = new Set<string>();
  for (const internship of matching.topInternships.slice(0, 3)) {
    const title = internship.title;
    if (seenTitles.has(title)) continue;
    seenTitles.add(title);

    const requiredSkillIds = (internship.requiredSkillIds as number[]) ?? [];
    const requiredSkills = requiredSkillIds.map((id) => skillMap.get(id)?.name ?? "").filter(Boolean);
    const gapSkills = matching.topInternships.length > 0
      ? (internship as any).missingSkills ?? []
      : [];

    careerPaths.push({
      title: `${title} Career Path`,
      matchScore: internship.matchScore,
      requiredSkills,
      currentSkills: currentSkills.filter((s) => requiredSkills.includes(s)),
      gapSkills,
      recommendedPrograms: matching.recommendedPrograms.slice(0, 2),
      recommendedInternships: [internship],
      description: `Based on your skills, you're a strong match for ${title} roles. ${
        gapSkills.length > 0
          ? `Consider developing: ${gapSkills.join(", ")}.`
          : "Your skill set aligns well with this path."
      }`,
    });
  }

  // Add job-based career paths
  for (const job of matching.topJobs.slice(0, 3)) {
    const title = job.title;
    if (seenTitles.has(title)) continue;
    seenTitles.add(title);

    const requiredSkillIds = (job.requiredSkillIds as number[]) ?? [];
    const requiredSkills = requiredSkillIds.map((id) => skillMap.get(id)?.name ?? "").filter(Boolean);

    careerPaths.push({
      title: `${title} Career Path`,
      matchScore: job.matchScore,
      requiredSkills,
      currentSkills: currentSkills.filter((s) => requiredSkills.includes(s)),
      gapSkills: (job as any).missingSkills ?? [],
      recommendedPrograms: matching.recommendedPrograms.slice(0, 2),
      recommendedInternships: [],
      description: `Your profile matches well with ${title} positions. ${
        (job as any).missingSkills?.length > 0
          ? `Key skills to develop: ${(job as any).missingSkills.join(", ")}.`
          : "You have most of the required skills."
      }`,
    });
  }

  // Sort by match score
  careerPaths.sort((a, b) => b.matchScore - a.matchScore);

  return {
    careerPaths: careerPaths.slice(0, 5),
    gapAnalysis,
    currentSkills,
    summary: {
      totalPaths: careerPaths.length,
      avgMatchScore:
        careerPaths.length > 0
          ? Math.round(careerPaths.reduce((s, p) => s + p.matchScore, 0) / careerPaths.length)
          : 0,
      topSkillGaps: gapAnalysis.gaps.slice(0, 5).map((g) => g.skillName),
      recommendedProgramsCount: matching.recommendedPrograms.length,
    },
  };
}
