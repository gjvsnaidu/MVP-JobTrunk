import { eq, and, desc } from "drizzle-orm";
import {
  skillCategories,
  skills,
  skillAssessments,
  skillAssessmentQuestions,
  skillAssessmentResults,
  studentSkillProfiles,
} from "../../drizzle/schema";
import { getDb } from "./index";
import * as demo from "../demo";

// =============================================================================
// Skill Categories
// =============================================================================

export async function listSkillCategories() {
  const db = getDb();
  if (!db) return demo.demoListSkillCategories();
  return db.select().from(skillCategories).orderBy(skillCategories.sortOrder);
}

export async function createSkillCategory(data: { name: string; description?: string; icon?: string }) {
  const db = getDb();
  if (!db) return demo.demoCreateSkillCategory(data);
  const result = await db.insert(skillCategories).values(data);
  return result[0].insertId;
}

// =============================================================================
// Skills
// =============================================================================

export async function listSkills(filters?: { categoryId?: number; demand?: string; search?: string }) {
  const db = getDb();
  if (!db) return demo.demoListSkills(filters);

  const conditions = [];
  if (filters?.categoryId) conditions.push(eq(skills.categoryId, filters.categoryId));
  if (filters?.demand) conditions.push(eq(skills.industryDemand, filters.demand as any));

  return db
    .select()
    .from(skills)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(skills.name);
}

export async function getSkillById(id: number) {
  const db = getDb();
  if (!db) return demo.demoGetSkillById(id);
  const result = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
  return result[0];
}

export async function createSkill(data: { categoryId: number; name: string; description?: string; industryDemand?: string; isCore?: boolean }) {
  const db = getDb();
  if (!db) return demo.demoCreateSkill(data);
  const result = await db.insert(skills).values(data as any);
  return result[0].insertId;
}

// =============================================================================
// Assessments
// =============================================================================

export async function listAssessments(filters?: { targetRole?: string; isActive?: boolean }) {
  const db = getDb();
  if (!db) return demo.demoListAssessments(filters);

  const conditions = [];
  if (filters?.targetRole) conditions.push(eq(skillAssessments.targetRole, filters.targetRole as any));
  if (filters?.isActive !== undefined) conditions.push(eq(skillAssessments.isActive, filters.isActive));

  return db
    .select()
    .from(skillAssessments)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(skillAssessments.createdAt));
}

export async function getAssessmentById(id: number) {
  const db = getDb();
  if (!db) return demo.demoGetAssessmentById(id);
  const result = await db.select().from(skillAssessments).where(eq(skillAssessments.id, id)).limit(1);
  return result[0];
}

export async function getAssessmentQuestions(assessmentId: number) {
  const db = getDb();
  if (!db) return demo.demoGetAssessmentQuestions(assessmentId);
  return db
    .select()
    .from(skillAssessmentQuestions)
    .where(eq(skillAssessmentQuestions.assessmentId, assessmentId))
    .orderBy(skillAssessmentQuestions.sortOrder);
}

export async function createAssessment(data: {
  title: string;
  description?: string;
  createdByUserId?: number;
  targetRole?: string;
  timeLimitMinutes?: number;
}) {
  const db = getDb();
  if (!db) return demo.demoCreateAssessment(data);
  const result = await db.insert(skillAssessments).values(data as any);
  return result[0].insertId;
}

// =============================================================================
// Assessment Results
// =============================================================================

export async function createAssessmentResult(data: {
  userId: number;
  assessmentId: number;
  scores: any;
  totalScore: number;
  durationSeconds?: number;
  skillLevels: any;
}) {
  const db = getDb();
  if (!db) return demo.demoCreateAssessmentResult(data);
  const result = await db.insert(skillAssessmentResults).values(data as any);
  return result[0].insertId;
}

export async function getAssessmentResults(userId: number, assessmentId?: number) {
  const db = getDb();
  if (!db) return demo.demoGetAssessmentResults(userId, assessmentId);

  const conditions = [eq(skillAssessmentResults.userId, userId)];
  if (assessmentId) conditions.push(eq(skillAssessmentResults.assessmentId, assessmentId));

  return db
    .select()
    .from(skillAssessmentResults)
    .where(and(...conditions))
    .orderBy(desc(skillAssessmentResults.completedAt));
}

// =============================================================================
// Student Skill Profiles
// =============================================================================

export async function getStudentSkillProfile(userId: number) {
  const db = getDb();
  if (!db) return demo.demoGetStudentSkillProfile(userId);
  return db
    .select()
    .from(studentSkillProfiles)
    .where(eq(studentSkillProfiles.userId, userId))
    .orderBy(studentSkillProfiles.proficiency);
}

export async function upsertStudentSkillProfile(
  userId: number,
  skillId: number,
  data: {
    proficiency?: string;
    selfScore?: number;
    assessedScore?: number;
    verified?: boolean;
  }
) {
  const db = getDb();
  if (!db) {
    demo.demoUpsertStudentSkillProfile(userId, skillId, data);
    return;
  }

  const existing = await db
    .select()
    .from(studentSkillProfiles)
    .where(and(eq(studentSkillProfiles.userId, userId), eq(studentSkillProfiles.skillId, skillId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(studentSkillProfiles)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(studentSkillProfiles.id, existing[0].id));
  } else {
    await db.insert(studentSkillProfiles).values({
      userId,
      skillId,
      ...data,
    } as any);
  }
}

export async function bulkUpsertSkillProfile(userId: number, profiles: Array<{ skillId: number; proficiency: string; assessedScore: number }>) {
  for (const p of profiles) {
    await upsertStudentSkillProfile(userId, p.skillId, {
      proficiency: p.proficiency,
      assessedScore: p.assessedScore,
    });
  }
}