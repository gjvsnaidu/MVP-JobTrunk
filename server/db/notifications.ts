import { eq, and, desc, sql } from "drizzle-orm";
import { notifications } from "../../drizzle/schema";
import { getDb } from "./index";
import * as demo from "../demo";

export async function createNotification(data: {
  userId: number;
  type: string;
  title: string;
  body?: string;
  link?: string;
  metadata?: any;
}) {
  const db = getDb();
  if (!db) return demo.demoCreateNotification(data);
  const result = await db.insert(notifications).values(data as any);
  return result[0].insertId;
}

export async function listNotifications(userId: number, page: number = 1, limit: number = 20) {
  const db = getDb();
  if (!db) return demo.demoListNotifications(userId, page, limit);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(eq(notifications.userId, userId));

  const total = Number(countResult?.count ?? 0);

  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return { items, total };
}

export async function getUnreadNotificationCount(userId: number) {
  const db = getDb();
  if (!db) return demo.demoGetUnreadNotificationCount(userId);
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  return Number(result?.count ?? 0);
}

export async function markNotificationRead(id: number, userId: number) {
  const db = getDb();
  if (!db) {
    demo.demoMarkNotificationRead(id, userId);
    return;
  }
  await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = getDb();
  if (!db) {
    demo.demoMarkAllNotificationsRead(userId);
    return;
  }
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
}

export async function bulkCreateNotifications(
  userIds: number[],
  type: string,
  title: string,
  body?: string,
  link?: string
) {
  const db = getDb();
  if (!db) {
    demo.demoBulkCreateNotifications(userIds, type, title, body, link);
    return;
  }

  if (userIds.length === 0) return;

  const values = userIds.map((userId) => ({
    userId,
    type: type as any,
    title,
    body: body ?? null,
    link: link ?? null,
  }));

  await db.insert(notifications).values(values);
}
