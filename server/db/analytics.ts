import { eq, and, desc, sql } from "drizzle-orm";
import {
  users,
  studentSkillProfiles,
  skills,
  skillCategories,
  applications,
  internships,
  jobs,
  learningPrograms,
  skillAssessmentResults,
  institutions,
  academicianProfiles,
} from "../../drizzle/schema";
import { getDb } from "./index";
import * as demo from "../demo";

export async function getSkillDemandTrends() {
  const db = getDb();
  if (!db) return demo.demoGetSkillDemandTrends();

  return db
    .select({
      categoryId: skillCategories.id,
      categoryName: skillCategories.name,
      skillId: skills.id,
      skillName: skills.name,
      industryDemand: skills.industryDemand,
      studentCount: sql<number>`count(distinct ${studentSkillProfiles.userId})`,
    })
    .from(skills)
    .leftJoin(skillCategories, eq(skills.categoryId, skillCategories.id))
    .leftJoin(studentSkillProfiles, eq(skills.id, studentSkillProfiles.skillId))
    .groupBy(skills.id, skillCategories.id, skillCategories.name, skills.name, skills.industryDemand)
    .orderBy(desc(sql<number>`count(distinct ${studentSkillProfiles.userId})`));
}

export async function getStudentSkillDistribution(institutionId?: number) {
  const db = getDb();
  if (!db) return demo.demoGetStudentSkillDistribution();

  const conditions = [];
  if (institutionId) {
    conditions.push(
      sql`${users.id} IN (SELECT ${academicianProfiles.userId} FROM ${academicianProfiles} WHERE ${academicianProfiles.institutionId} = ${institutionId})`
    );
  }

  return db
    .select({
      skillId: skills.id,
      skillName: skills.name,
      proficiency: studentSkillProfiles.proficiency,
      count: sql<number>`count(*)`,
    })
    .from(studentSkillProfiles)
    .innerJoin(skills, eq(studentSkillProfiles.skillId, skills.id))
    .innerJoin(users, eq(studentSkillProfiles.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(skills.id, skills.name, studentSkillProfiles.proficiency)
    .orderBy(skills.name, studentSkillProfiles.proficiency);
}

export async function getApplicationStats(opportunityType?: string, industryUserId?: number) {
  const db = getDb();
  if (!db) return demo.demoGetApplicationStats(opportunityType);

  const conditions = [];
  if (opportunityType) conditions.push(eq(applications.opportunityType, opportunityType as any));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [result] = await db
    .select({
      total: sql<number>`count(*)`,
      pending: sql<number>`sum(case when ${applications.status} = 'pending' then 1 else 0 end)`,
      shortlisted: sql<number>`sum(case when ${applications.status} = 'shortlisted' then 1 else 0 end)`,
      accepted: sql<number>`sum(case when ${applications.status} = 'accepted' then 1 else 0 end)`,
      rejected: sql<number>`sum(case when ${applications.status} = 'rejected' then 1 else 0 end)`,
    })
    .from(applications)
    .where(where);

  return {
    total: Number(result?.total ?? 0),
    pending: Number(result?.pending ?? 0),
    shortlisted: Number(result?.shortlisted ?? 0),
    accepted: Number(result?.accepted ?? 0),
    rejected: Number(result?.rejected ?? 0),
  };
}

export async function getPlacementReadiness() {
  const db = getDb();
  if (!db) return demo.demoGetPlacementReadiness();

  return db
    .select({
      skillId: skills.id,
      skillName: skills.name,
      industryDemand: skills.industryDemand,
      studentsWithSkill: sql<number>`count(distinct ${studentSkillProfiles.userId})`,
      avgProficiency: sql<number>`avg(case
        when ${studentSkillProfiles.proficiency} = 'expert' then 4
        when ${studentSkillProfiles.proficiency} = 'advanced' then 3
        when ${studentSkillProfiles.proficiency} = 'intermediate' then 2
        else 1
      end)`,
    })
    .from(skills)
    .leftJoin(studentSkillProfiles, eq(skills.id, studentSkillProfiles.skillId))
    .where(eq(skills.isCore, true))
    .groupBy(skills.id, skills.name, skills.industryDemand)
    .orderBy(desc(skills.industryDemand));
}

export async function getRecruitmentOutcomes(industryUserId?: number) {
  const db = getDb();
  if (!db) return demo.demoGetRecruitmentOutcomes(industryUserId);

  const conditions = [];
  if (industryUserId) {
    conditions.push(
      sql`${applications.opportunityId} IN (SELECT ${internships.id} FROM ${internships} WHERE ${internships.industryUserId} = ${industryUserId})`
    );
  }

  return db
    .select({
      month: sql<string>`date_format(${applications.createdAt}, '%Y-%m')`,
      total: sql<number>`count(*)`,
      accepted: sql<number>`sum(case when ${applications.status} = 'accepted' then 1 else 0 end)`,
      rejected: sql<number>`sum(case when ${applications.status} = 'rejected' then 1 else 0 end)`,
    })
    .from(applications)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(sql<string>`date_format(${applications.createdAt}, '%Y-%m')`)
    .orderBy(desc(sql<string>`date_format(${applications.createdAt}, '%Y-%m')`));
}

export async function getTopSkills() {
  const db = getDb();
  if (!db) return demo.demoGetTopSkills();

  return db
    .select({
      skillId: skills.id,
      skillName: skills.name,
      demand: skills.industryDemand,
      studentCount: sql<number>`count(distinct ${studentSkillProfiles.userId})`,
    })
    .from(skills)
    .leftJoin(studentSkillProfiles, eq(skills.id, studentSkillProfiles.skillId))
    .groupBy(skills.id, skills.name, skills.industryDemand)
    .orderBy(desc(sql<number>`count(distinct ${studentSkillProfiles.userId})`))
    .limit(10);
}

export async function getInstitutionStats(institutionId: number) {
  const db = getDb();
  if (!db) return demo.demoGetInstitutionStats();

  const [studentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(academicianProfiles)
    .where(eq(academicianProfiles.institutionId, institutionId));

  const [facultyCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(academicianProfiles)
    .where(eq(academicianProfiles.institutionId, institutionId));

  return {
    totalStudents: Number(studentCount?.count ?? 0),
    totalFaculty: Number(facultyCount?.count ?? 0),
    avgSkillScore: 0,
    activeInternships: 0,
  };
}

export async function getProgramEffectiveness() {
  const db = getDb();
  if (!db) return demo.demoGetProgramEffectiveness();

  return db
    .select({
      programId: learningPrograms.id,
      title: learningPrograms.title,
      category: learningPrograms.category,
      enrolledCount: learningPrograms.enrolledCount,
      status: learningPrograms.status,
    })
    .from(learningPrograms)
    .where(eq(learningPrograms.status, "active"))
    .orderBy(desc(learningPrograms.enrolledCount));
}
