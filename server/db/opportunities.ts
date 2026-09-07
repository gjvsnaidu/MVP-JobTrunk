import { eq, and, desc, like, sql } from "drizzle-orm";
import {
  internships,
  jobs,
  learningPrograms,
  applications,
  savedOpportunities,
} from "../../drizzle/schema";
import { getDb } from "./index";
import * as demo from "../demo";

// =============================================================================
// Internships
// =============================================================================

export async function listInternships(filters?: {
  status?: string;
  type?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const db = getDb();
  if (!db) return demo.demoListInternships(filters);

  const { status, type, location, search, page = 1, limit = 20 } = filters ?? {};
  const conditions = [];

  if (status) conditions.push(eq(internships.status, status as any));
  if (type) conditions.push(eq(internships.type, type as any));
  if (location) conditions.push(like(internships.location, `%${location}%`));
  if (search) conditions.push(like(internships.title, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(internships).where(where);
  const total = Number(countResult?.count ?? 0);

  const items = await db
    .select()
    .from(internships)
    .where(where)
    .orderBy(desc(internships.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return { items, total };
}

export async function getInternshipById(id: number) {
  const db = getDb();
  if (!db) return demo.demoGetInternshipById(id);
  const result = await db.select().from(internships).where(eq(internships.id, id)).limit(1);
  return result[0];
}

export async function createInternship(data: {
  industryUserId: number;
  title: string;
  description: string;
  requirements?: any;
  duration?: string;
  stipend?: string;
  location?: string;
  type?: string;
  requiredSkillIds?: any;
  status?: string;
  deadline?: Date;
  maxApplicants?: number;
}) {
  const db = getDb();
  if (!db) return demo.demoCreateInternship(data);
  const result = await db.insert(internships).values(data as any);
  return result[0].insertId;
}

export async function updateInternship(id: number, data: Record<string, any>) {
  const db = getDb();
  if (!db) {
    demo.demoUpdateInternship(id, data);
    return;
  }
  await db.update(internships).set(data).where(eq(internships.id, id));
}

// =============================================================================
// Jobs
// =============================================================================

export async function listJobs(filters?: {
  status?: string;
  type?: string;
  experienceLevel?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const db = getDb();
  if (!db) return demo.demoListJobs(filters);

  const { status, type, experienceLevel, location, search, page = 1, limit = 20 } = filters ?? {};
  const conditions = [];

  if (status) conditions.push(eq(jobs.status, status as any));
  if (type) conditions.push(eq(jobs.type, type as any));
  if (experienceLevel) conditions.push(eq(jobs.experienceLevel, experienceLevel as any));
  if (location) conditions.push(like(jobs.location, `%${location}%`));
  if (search) conditions.push(like(jobs.title, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(jobs).where(where);
  const total = Number(countResult?.count ?? 0);

  const items = await db
    .select()
    .from(jobs)
    .where(where)
    .orderBy(desc(jobs.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return { items, total };
}

export async function getJobById(id: number) {
  const db = getDb();
  if (!db) return demo.demoGetJobById(id);
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result[0];
}

export async function createJob(data: {
  industryUserId: number;
  title: string;
  description: string;
  requirements?: any;
  salaryRange?: string;
  location?: string;
  type?: string;
  requiredSkillIds?: any;
  experienceLevel?: string;
  status?: string;
  deadline?: Date;
}) {
  const db = getDb();
  if (!db) return demo.demoCreateJob(data);
  const result = await db.insert(jobs).values(data as any);
  return result[0].insertId;
}

export async function updateJob(id: number, data: Record<string, any>) {
  const db = getDb();
  if (!db) {
    demo.demoUpdateJob(id, data);
    return;
  }
  await db.update(jobs).set(data).where(eq(jobs.id, id));
}

// =============================================================================
// Learning Programs
// =============================================================================

export async function listLearningPrograms(filters?: {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const db = getDb();
  if (!db) return demo.demoListLearningPrograms(filters);

  const { category, status, search, page = 1, limit = 20 } = filters ?? {};
  const conditions = [];

  if (category) conditions.push(eq(learningPrograms.category, category as any));
  if (status) conditions.push(eq(learningPrograms.status, status as any));
  if (search) conditions.push(like(learningPrograms.title, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(learningPrograms).where(where);
  const total = Number(countResult?.count ?? 0);

  const items = await db
    .select()
    .from(learningPrograms)
    .where(where)
    .orderBy(desc(learningPrograms.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return { items, total };
}

export async function getLearningProgramById(id: number) {
  const db = getDb();
  if (!db) return demo.demoGetLearningProgramById(id);
  const result = await db.select().from(learningPrograms).where(eq(learningPrograms.id, id)).limit(1);
  return result[0];
}

export async function createLearningProgram(data: {
  industryUserId: number;
  title: string;
  description: string;
  category?: string;
  duration?: string;
  fee?: string;
  skillIds?: any;
  maxParticipants?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  syllabus?: any;
}) {
  const db = getDb();
  if (!db) return demo.demoCreateLearningProgram(data);
  const result = await db.insert(learningPrograms).values(data as any);
  return result[0].insertId;
}

export async function updateLearningProgram(id: number, data: Record<string, any>) {
  const db = getDb();
  if (!db) {
    demo.demoUpdateLearningProgram(id, data);
    return;
  }
  await db.update(learningPrograms).set(data).where(eq(learningPrograms.id, id));
}

// =============================================================================
// Applications
// =============================================================================

export async function createApplication(data: {
  userId: number;
  opportunityType: string;
  opportunityId: number;
  coverLetter?: string;
  resumeUrl?: string;
}) {
  const db = getDb();
  if (!db) return demo.demoCreateApplication(data);

  // Check for duplicate application
  const existing = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.userId, data.userId),
        eq(applications.opportunityType, data.opportunityType as any),
        eq(applications.opportunityId, data.opportunityId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Already applied to this opportunity");
  }

  const result = await db.insert(applications).values(data as any);
  return result[0].insertId;
}

export async function getApplicationsByUser(userId: number) {
  const db = getDb();
  if (!db) return demo.demoGetApplicationsByUser(userId);
  return db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.createdAt));
}

export async function getApplicationsForOpportunity(opportunityType: string, opportunityId: number) {
  const db = getDb();
  if (!db) return demo.demoGetApplicationsForOpportunity(opportunityType, opportunityId);
  return db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.opportunityType, opportunityType as any),
        eq(applications.opportunityId, opportunityId)
      )
    )
    .orderBy(desc(applications.createdAt));
}

export async function updateApplicationStatus(id: number, status: string) {
  const db = getDb();
  if (!db) {
    demo.demoUpdateApplicationStatus(id, status);
    return;
  }
  await db.update(applications).set({ status: status as any, updatedAt: new Date() }).where(eq(applications.id, id));
}

export async function withdrawApplication(id: number, userId: number) {
  const db = getDb();
  if (!db) {
    demo.demoWithdrawApplication(id, userId);
    return;
  }
  await db
    .update(applications)
    .set({ status: "withdrawn", updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, userId)));
}

// =============================================================================
// Saved Opportunities
// =============================================================================

export async function toggleSavedOpportunity(userId: number, opportunityType: string, opportunityId: number) {
  const db = getDb();
  if (!db) return demo.demoToggleSavedOpportunity(userId, opportunityType, opportunityId);

  const existing = await db
    .select()
    .from(savedOpportunities)
    .where(
      and(
        eq(savedOpportunities.userId, userId),
        eq(savedOpportunities.opportunityType, opportunityType as any),
        eq(savedOpportunities.opportunityId, opportunityId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db.delete(savedOpportunities).where(eq(savedOpportunities.id, existing[0].id));
    return { saved: false };
  } else {
    await db.insert(savedOpportunities).values({ userId, opportunityType: opportunityType as any, opportunityId });
    return { saved: true };
  }
}

export async function getSavedOpportunities(userId: number) {
  const db = getDb();
  if (!db) return demo.demoGetSavedOpportunities(userId);
  return db
    .select()
    .from(savedOpportunities)
    .where(eq(savedOpportunities.userId, userId))
    .orderBy(desc(savedOpportunities.createdAt));
}