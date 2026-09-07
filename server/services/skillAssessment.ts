import { getDb } from "../db/index";
import { skills, skillAssessmentQuestions, skillAssessmentResults, studentSkillProfiles } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import * as demo from "../demo";

type SkillScore = { skillId: number; skillName: string; score: number; level: string; weight: number };
type AssessmentAnswer = { questionId: number; answer: string | number };

const LEVEL_THRESHOLDS = [
  { min: 0, level: "beginner" },
  { min: 30, level: "intermediate" },
  { min: 60, level: "advanced" },
  { min: 85, level: "expert" },
];

function scoreToLevel(score: number): string {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= LEVEL_THRESHOLDS[i].min) return LEVEL_THRESHOLDS[i].level;
  }
  return "beginner";
}

/**
 * Calculate scores for a completed assessment.
 * Returns per-skill scores and overall total.
 */
export async function calculateAssessmentScores(
  assessmentId: number,
  answers: AssessmentAnswer[]
): Promise<{ skillScores: SkillScore[]; totalScore: number; skillLevels: Record<number, string> }> {
  const db = getDb();
  if (!db) return demo.demoCalculateAssessmentScores(assessmentId, answers);

  // Fetch questions for this assessment
  const questions = await db
    .select()
    .from(skillAssessmentQuestions)
    .where(eq(skillAssessmentQuestions.assessmentId, assessmentId));

  // Fetch skills referenced by questions
  const skillIds = Array.from(new Set(questions.map((q) => q.skillId)));
  const skillRecords = await db.select().from(skills).where(eq(skills.id, skillIds[0] ?? 0));
  // Fetch all relevant skills
  const allSkills = await db.select().from(skills);
  const skillMap = new Map(allSkills.map((s) => [s.id, s]));

  // Group questions by skill
  const questionsBySkill = new Map<number, typeof questions>();
  for (const q of questions) {
    const list = questionsBySkill.get(q.skillId) ?? [];
    list.push(q);
    questionsBySkill.set(q.skillId, list);
  }

  // Calculate per-skill scores
  const skillScores: SkillScore[] = [];
  const skillLevels: Record<number, string> = {};

  Array.from(questionsBySkill.entries()).forEach(([skillId, skillQuestions]) => {
    const skill = skillMap.get(skillId);
    if (!skill) return;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const q of skillQuestions) {
      const answer = answers.find((a) => a.questionId === q.id);
      if (!answer) continue;

      const weight = q.weight ?? 1;
      totalWeight += weight;

      if (q.questionType === "mcq" || q.questionType === "practical") {
        // Binary: correct = 100, wrong = 0
        const isCorrect = String(answer.answer).toLowerCase() === String(q.correctAnswer).toLowerCase();
        totalWeightedScore += (isCorrect ? 100 : 0) * weight;
      } else if (q.questionType === "confidence") {
        // Self-reported confidence 1-5 → 0-100
        const confidence = Math.min(5, Math.max(1, Number(answer.answer)));
        totalWeightedScore += ((confidence - 1) / 4) * 100 * weight;
      } else if (q.questionType === "rating") {
        // Rating 1-10 → 0-100
        const rating = Math.min(10, Math.max(1, Number(answer.answer)));
        totalWeightedScore += ((rating - 1) / 9) * 100 * weight;
      }
    }

    const score = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
    const level = scoreToLevel(score);

    skillScores.push({
      skillId,
      skillName: skill!.name,
      score,
      level,
      weight: totalWeight,
    });
    skillLevels[skillId] = level;
  });

  // Calculate total score (weighted average)
  const totalWeightedScore = skillScores.reduce((sum, s) => sum + s.score * s.weight, 0);
  const totalWeight = skillScores.reduce((sum, s) => sum + s.weight, 0);
  const totalScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  return { skillScores, totalScore, skillLevels };
}

/**
 * Generate skill profile from assessment results.
 * Updates student_skill_profiles table.
 */
export async function generateSkillProfile(userId: number, assessmentId: number, answers: AssessmentAnswer[]) {
  const db = getDb();
  if (!db) return demo.demoGenerateSkillProfile(userId, assessmentId, answers);

  const { skillScores, totalScore, skillLevels } = await calculateAssessmentScores(assessmentId, answers);

  // Save assessment result
  await db.insert(skillAssessmentResults).values({
    userId,
    assessmentId,
    scores: skillScores,
    totalScore,
    skillLevels,
    completedAt: new Date(),
  });

  // Upsert skill profiles
  for (const skillScore of skillScores) {
    const existing = await db
      .select()
      .from(studentSkillProfiles)
      .where(and(eq(studentSkillProfiles.userId, userId), eq(studentSkillProfiles.skillId, skillScore.skillId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(studentSkillProfiles)
        .set({
          proficiency: skillScore.level as any,
          assessedScore: skillScore.score,
          updatedAt: new Date(),
        })
        .where(eq(studentSkillProfiles.id, existing[0].id));
    } else {
      await db.insert(studentSkillProfiles).values({
        userId,
        skillId: skillScore.skillId,
        proficiency: skillScore.level as any,
        assessedScore: skillScore.score,
      });
    }
  }

  return { skillScores, totalScore, skillLevels };
}

/**
 * Compute gap analysis: compare student's skill profile against industry demand.
 */
export async function computeGapAnalysis(userId: number) {
  const db = getDb();
  if (!db) return demo.demoComputeGapAnalysis(userId);

  // Get student's skill profiles
  const profiles = await db
    .select()
    .from(studentSkillProfiles)
    .where(eq(studentSkillProfiles.userId, userId));

  // Get all skills with industry demand
  const allSkills = await db.select().from(skills);

  const profileMap = new Map(profiles.map((p) => [p.skillId, p]));

  const gaps = allSkills.map((skill) => {
    const profile = profileMap.get(skill.id);
    const currentLevel = profile?.proficiency ?? "none";
    const demand = skill.industryDemand;

    // Gap: high-demand skills with low/missing proficiency
    const levelOrder = { none: 0, beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const demandWeight = { high: 3, medium: 2, low: 1 };
    const expectedLevel = demand === "high" ? 3 : demand === "medium" ? 2 : 1;
    const gap = expectedLevel - (levelOrder[currentLevel as keyof typeof levelOrder] ?? 0);

    return {
      skillId: skill.id,
      skillName: skill.name,
      currentLevel,
      industryDemand: demand,
      gap: Math.max(0, gap),
      isCore: skill.isCore,
    };
  });

  // Sort by gap (largest first), then by demand
  gaps.sort((a, b) => b.gap - a.gap || (b.industryDemand === "high" ? 1 : 0) - (a.industryDemand === "high" ? 1 : 0));

  return {
    gaps: gaps.filter((g) => g.gap > 0),
    strengths: gaps.filter((g) => g.gap === 0 && g.currentLevel !== "none"),
  };
}
