import { getDb } from "../db/index";
import { studentSkillProfiles, skills, internships, jobs, learningPrograms } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import * as demo from "../demo";

type MatchResult = {
  id: number;
  title: string;
  type: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  locationMatch: boolean;
  [key: string]: any;
};

const SKILL_MATCH_WEIGHT = 0.6;
const DEMAND_WEIGHT = 0.2;
const LOCATION_WEIGHT = 0.2;

/**
 * Calculate how well a student matches an opportunity.
 */
function calculateMatchScore(
  studentSkills: Map<number, { proficiency: string; skillName: string; industryDemand: string }>,
  requiredSkillIds: number[],
  allSkills: Map<number, { name: string; industryDemand: string }>,
  studentLocation?: string,
  opportunityLocation?: string
): { score: number; matchedSkills: string[]; missingSkills: string[] } {
  const proficiencyScore: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };

  let totalSkillScore = 0;
  let totalWeight = 0;
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skillId of requiredSkillIds) {
    const skill = allSkills.get(skillId);
    const studentSkill = studentSkills.get(skillId);

    const demandWeight = skill?.industryDemand === "high" ? 3 : skill?.industryDemand === "medium" ? 2 : 1;
    totalWeight += demandWeight;

    if (studentSkill) {
      const score = proficiencyScore[studentSkill.proficiency] ?? 0;
      totalSkillScore += score * demandWeight;
      matchedSkills.push(studentSkill.skillName);
    } else {
      missingSkills.push(skill?.name ?? `Skill ${skillId}`);
    }
  }

  // Skill match component (0-60)
  const skillComponent = totalWeight > 0 ? (totalSkillScore / (totalWeight * 100)) * 60 : 0;

  // Location match component (0-20)
  let locationComponent = 10; // neutral if no location info
  if (studentLocation && opportunityLocation) {
    locationComponent =
      studentLocation.toLowerCase() === opportunityLocation.toLowerCase()
        ? 20
        : opportunityLocation.toLowerCase().includes("remote")
          ? 15
          : 5;
  }

  // Bonus for core skills (0-20)
  const coreSkillsMatched = requiredSkillIds.filter((id) => {
    const skill = allSkills.get(id);
    return skill && studentSkills.has(id);
  }).length;
  const coreBonus = requiredSkillIds.length > 0 ? (coreSkillsMatched / requiredSkillIds.length) * 20 : 0;

  const totalScore = Math.min(100, Math.round(skillComponent + locationComponent + coreBonus));

  return { score: totalScore, matchedSkills, missingSkills };
}

/**
 * Match a student to internship opportunities.
 */
export async function matchStudentToInternships(userId: number, filters?: { location?: string; type?: string }) {
  const db = getDb();
  if (!db) return demo.demoMatchStudentToInternships(userId);

  // Get student's skill profiles
  const profiles = await db
    .select()
    .from(studentSkillProfiles)
    .where(eq(studentSkillProfiles.userId, userId));

  const studentSkills = new Map(
    profiles.map((p) => [p.skillId, { proficiency: p.proficiency ?? "beginner", skillName: "", industryDemand: "medium" }])
  );

  // Enrich with skill names and demand
  const allSkills = await db.select().from(skills);
  const skillMap = new Map(allSkills.map((s) => [s.id, s]));
  Array.from(studentSkills.entries()).forEach(([skillId, data]) => {
    const skill = skillMap.get(skillId);
    if (skill) {
      data.skillName = skill.name;
      data.industryDemand = skill.industryDemand;
    }
  });

  // Get open internships
  const conditions = [eq(internships.status, "open")];
  if (filters?.type) conditions.push(eq(internships.type, filters.type as any));

  const listings = await db.select().from(internships).where(and(...conditions));

  // Score each listing
  const results: MatchResult[] = [];
  for (const listing of listings) {
    const requiredSkillIds = (listing.requiredSkillIds as number[]) ?? [];
    const { score, matchedSkills, missingSkills } = calculateMatchScore(
      studentSkills,
      requiredSkillIds,
      skillMap,
      undefined,
      listing.location ?? undefined
    );

    results.push({
      ...listing,
      type: "internship",
      matchScore: score,
      matchedSkills,
      missingSkills,
      locationMatch: true,
    });
  }

  // Sort by match score descending
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}

/**
 * Match a student to job opportunities.
 */
export async function matchStudentToJobs(userId: number, filters?: { location?: string; type?: string; experienceLevel?: string }) {
  const db = getDb();
  if (!db) return demo.demoMatchStudentToJobs(userId);

  const profiles = await db
    .select()
    .from(studentSkillProfiles)
    .where(eq(studentSkillProfiles.userId, userId));

  const allSkills = await db.select().from(skills);
  const skillMap = new Map(allSkills.map((s) => [s.id, s]));

  const studentSkills = new Map(
    profiles.map((p) => {
      const skill = skillMap.get(p.skillId);
      return [
        p.skillId,
        {
          proficiency: p.proficiency ?? "beginner",
          skillName: skill?.name ?? "",
          industryDemand: skill?.industryDemand ?? "medium",
        },
      ];
    })
  );

  const conditions = [eq(jobs.status, "open")];
  if (filters?.type) conditions.push(eq(jobs.type, filters.type as any));
  if (filters?.experienceLevel) conditions.push(eq(jobs.experienceLevel, filters.experienceLevel as any));

  const listings = await db.select().from(jobs).where(and(...conditions));

  const results: MatchResult[] = [];
  for (const listing of listings) {
    const requiredSkillIds = (listing.requiredSkillIds as number[]) ?? [];
    const { score, matchedSkills, missingSkills } = calculateMatchScore(
      studentSkills,
      requiredSkillIds,
      skillMap,
      undefined,
      listing.location ?? undefined
    );

    results.push({
      ...listing,
      type: "job",
      matchScore: score,
      matchedSkills,
      missingSkills,
      locationMatch: true,
    });
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}

/**
 * Match a student to learning programs.
 */
export async function matchStudentToPrograms(userId: number) {
  const db = getDb();
  if (!db) return demo.demoMatchStudentToPrograms(userId);

  const profiles = await db
    .select()
    .from(studentSkillProfiles)
    .where(eq(studentSkillProfiles.userId, userId));

  const allSkills = await db.select().from(skills);
  const skillMap = new Map(allSkills.map((s) => [s.id, s]));

  const studentSkills = new Map(
    profiles.map((p) => {
      const skill = skillMap.get(p.skillId);
      return [
        p.skillId,
        {
          proficiency: p.proficiency ?? "beginner",
          skillName: skill?.name ?? "",
          industryDemand: skill?.industryDemand ?? "medium",
        },
      ];
    })
  );

  const listings = await db.select().from(learningPrograms).where(eq(learningPrograms.status, "active"));

  const results: MatchResult[] = [];
  for (const listing of listings) {
    const programSkillIds = (listing.skillIds as number[]) ?? [];
    const { score, matchedSkills, missingSkills } = calculateMatchScore(studentSkills, programSkillIds, skillMap);

    // For programs, prioritize where student has gaps (inverted match for learning value)
    const gapScore = missingSkills.length > 0 ? Math.min(80, 40 + missingSkills.length * 10) : 20;
    const finalScore = Math.round((score + gapScore) / 2);

    results.push({
      ...listing,
      type: "learning_program",
      matchScore: finalScore,
      matchedSkills,
      missingSkills,
      locationMatch: true,
    });
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}

/**
 * Get career guidance recommendations for a student.
 */
export async function getCareerRecommendations(userId: number) {
  if (!getDb()) return demo.demoCareerRecommendations(userId);
  const internships = await matchStudentToInternships(userId);
  const jobs = await matchStudentToJobs(userId);
  const programs = await matchStudentToPrograms(userId);

  // Group by career path (inferred from internship/job titles)
  const topInternships = internships.slice(0, 5);
  const topJobs = jobs.slice(0, 5);
  const topPrograms = programs.slice(0, 5);

  return {
    topInternships,
    topJobs,
    recommendedPrograms: topPrograms,
    summary: {
      totalInternshipsMatched: internships.length,
      totalJobsMatched: jobs.length,
      totalProgramsRecommended: programs.length,
      avgMatchScore: internships.length + jobs.length > 0
        ? Math.round(
            (internships.slice(0, 5).reduce((s, i) => s + i.matchScore, 0) +
              jobs.slice(0, 5).reduce((s, j) => s + j.matchScore, 0)) /
              Math.min(10, internships.length + jobs.length)
          )
        : 0,
    },
  };
}
