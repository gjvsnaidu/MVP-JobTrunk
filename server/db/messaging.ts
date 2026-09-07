import { eq, and, desc, sql } from "drizzle-orm";
import { conversations, conversationParticipants, messages } from "../../drizzle/schema";
import { getDb } from "./index";
import * as demo from "../demo";

// =============================================================================
// Conversations
// =============================================================================

export async function createConversation(type: string = "direct", title?: string) {
  const db = getDb();
  if (!db) return demo.demoCreateConversation(type, title);
  const result = await db.insert(conversations).values({ type: type as any, title });
  return Number(result[0].insertId);
}

export async function addConversationParticipant(conversationId: number, userId: number, role: string = "receiver") {
  const db = getDb();
  if (!db) {
    demo.demoAddConversationParticipant(conversationId, userId, role);
    return;
  }
  await db.insert(conversationParticipants).values({
    conversationId,
    userId,
    role: role as any,
  });
}

export async function getConversationById(id: number) {
  const db = getDb();
  if (!db) return demo.demoGetConversationById(id);
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result[0];
}

export async function getUserConversations(userId: number) {
  const db = getDb();
  if (!db) return demo.demoGetUserConversations(userId);

  // Get conversations where user is a participant
  const participations = await db
    .select()
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

  if (participations.length === 0) return [];

  const convIds = participations.map((p) => p.conversationId);
  const convs = await db
    .select()
    .from(conversations)
    .where(sql`${conversations.id} IN ${convIds}`)
    .orderBy(desc(conversations.updatedAt));

  return convs.map((conv) => ({
    ...conv,
    participants: participations.filter((p) => p.conversationId === conv.id),
  }));
}

export async function getConversationParticipants(conversationId: number) {
  const db = getDb();
  if (!db) return demo.demoGetConversationParticipants(conversationId);
  return db
    .select()
    .from(conversationParticipants)
    .where(eq(conversationParticipants.conversationId, conversationId));
}

export async function isConversationParticipant(conversationId: number, userId: number) {
  const db = getDb();
  if (!db) return demo.demoIsConversationParticipant(conversationId, userId);
  const result = await db
    .select()
    .from(conversationParticipants)
    .where(and(eq(conversationParticipants.conversationId, conversationId), eq(conversationParticipants.userId, userId)))
    .limit(1);
  return result.length > 0;
}

// =============================================================================
// Messages
// =============================================================================

export async function sendMessage(data: {
  conversationId: number;
  senderUserId: number;
  content: string;
  type?: string;
  fileUrl?: string;
}) {
  const db = getDb();
  if (!db) return demo.demoSendMessage(data);

  const result = await db.insert(messages).values({
    ...data,
    type: (data.type ?? "text") as any,
  });

  // Update conversation updatedAt
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, data.conversationId));

  return result[0].insertId;
}

export async function getMessages(conversationId: number, cursor?: number, limit: number = 50) {
  const db = getDb();
  if (!db) return demo.demoGetMessages(conversationId, cursor, limit);

  const conditions = [eq(messages.conversationId, conversationId)];
  if (cursor) {
    conditions.push(sql`${messages.id} < ${cursor}`);
  }

  return db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function markConversationRead(conversationId: number, userId: number) {
  const db = getDb();
  if (!db) {
    demo.demoMarkConversationRead(conversationId, userId);
    return;
  }
  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(and(eq(conversationParticipants.conversationId, conversationId), eq(conversationParticipants.userId, userId)));
}

export async function getUnreadMessageCount(userId: number) {
  const db = getDb();
  if (!db) return demo.demoGetUnreadMessageCount(userId);

  const participations = await db
    .select()
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

  let unreadCount = 0;
  for (const p of participations) {
    const lastRead = p.lastReadAt ?? new Date(0);
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, p.conversationId),
          sql`${messages.createdAt} > ${lastRead}`,
          sql`${messages.senderUserId} != ${userId}`
        )
      );
    unreadCount += Number(countResult?.count ?? 0);
  }

  return unreadCount;
}
