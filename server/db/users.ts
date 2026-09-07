import { eq, and, desc, like, sql } from "drizzle-orm";
import { users, industryProfiles, academicianProfiles, institutions } from "../../drizzle/schema";
import { getDb } from "./index";
import * as demo from "../demo";
import type { User, InsertUser } from "../../drizzle/schema";

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = getDb();
  if (!db) {
    demo.demoUpsertUser(user);
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  for (const field of ["name", "email", "loginMethod", "phone", "avatarUrl"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field]!;
      updateSet[field] = user[field];
    }
  }

  if (user.role) {
    values.role = user.role;
    updateSet.role = user.role;
  }

  if (user.profileComplete !== undefined) {
    values.profileComplete = user.profileComplete;
    updateSet.profileComplete = user.profileComplete;
  }

  if (user.onboardingComplete !== undefined) {
    values.onboardingComplete = user.onboardingComplete;
    updateSet.onboardingComplete = user.onboardingComplete;
  }

  values.lastSignedIn = new Date();
  updateSet.lastSignedIn = new Date();

  if (!values.role) {
    values.role = "user";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = getDb();
  if (!db) return demo.demoGetUserByOpenId(openId);
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = getDb();
  if (!db) return demo.demoGetUserById(id);
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUser(id: number, data: Partial<InsertUser>): Promise<void> {
  const db = getDb();
  if (!db) {
    demo.demoUpdateUser(id, data);
    return;
  }
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function listUsers(filters: { role?: string; search?: string; page?: number; limit?: number }) {
  const db = getDb();
  if (!db) return demo.demoListUsers(filters);

  const { role, search, page = 1, limit = 20 } = filters;
  const conditions = [];

  if (role) conditions.push(eq(users.role, role as any));
  if (search) conditions.push(like(users.name, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(where);

  const total = Number(countResult?.count ?? 0);

  const result = await db
    .select()
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return { users: result, total };
}

export async function getIndustryProfile(userId: number) {
  const db = getDb();
  if (!db) return demo.demoGetIndustryProfile(userId);
  const result = await db.select().from(industryProfiles).where(eq(industryProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function upsertIndustryProfile(userId: number, data: Record<string, any>) {
  const db = getDb();
  if (!db) {
    demo.demoUpsertIndustryProfile(userId, data);
    return;
  }

  const existing = await getIndustryProfile(userId);
  if (existing) {
    await db.update(industryProfiles).set(data).where(eq(industryProfiles.userId, userId));
  } else {
    await db.insert(industryProfiles).values({ userId, ...data } as any);
  }
}

export async function getAcademicianProfile(userId: number) {
  const db = getDb();
  if (!db) return demo.demoGetAcademicianProfile(userId);
  const result = await db.select().from(academicianProfiles).where(eq(academicianProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function upsertAcademicianProfile(userId: number, data: Record<string, any>) {
  const db = getDb();
  if (!db) {
    demo.demoUpsertAcademicianProfile(userId, data);
    return;
  }

  const existing = await getAcademicianProfile(userId);
  if (existing) {
    await db.update(academicianProfiles).set(data).where(eq(academicianProfiles.userId, userId));
  } else {
    await db.insert(academicianProfiles).values({ userId, ...data } as any);
  }
}

export async function getInstitutionById(id: number) {
  const db = getDb();
  if (!db) return demo.demoGetInstitutionById(id);
  const result = await db.select().from(institutions).where(eq(institutions.id, id)).limit(1);
  return result[0];
}

export async function listInstitutions(filters?: { verified?: boolean; search?: string }) {
  const db = getDb();
  if (!db) return demo.demoListInstitutions(filters);

  const conditions = [];
  if (filters?.verified !== undefined) conditions.push(eq(institutions.verified, filters.verified));
  if (filters?.search) conditions.push(like(institutions.name, `%${filters.search}%`));

  return db.select().from(institutions).where(conditions.length > 0 ? and(...conditions) : undefined);
}