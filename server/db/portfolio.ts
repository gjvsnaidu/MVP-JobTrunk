import { eq, and, desc } from "drizzle-orm";
import { portfolioItems, documents } from "../../drizzle/schema";
import { getDb } from "./index";
import * as demo from "../demo";

// =============================================================================
// Portfolio Items
// =============================================================================

export async function listPortfolioItems(userId: number) {
  const db = getDb();
  if (!db) return demo.demoListPortfolioItems(userId);
  return db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.userId, userId))
    .orderBy(portfolioItems.sortOrder);
}

export async function getPortfolioItemById(id: number) {
  const db = getDb();
  if (!db) return demo.demoGetPortfolioItemById(id);
  const result = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id)).limit(1);
  return result[0];
}

export async function createPortfolioItem(data: {
  userId: number;
  type: string;
  title: string;
  description?: string;
  url?: string;
  issuedBy?: string;
  date?: Date;
  endDate?: Date;
  documentUrl?: string;
  metadata?: any;
  sortOrder?: number;
}) {
  const db = getDb();
  if (!db) return demo.demoCreatePortfolioItem(data);
  const result = await db.insert(portfolioItems).values(data as any);
  return result[0].insertId;
}

export async function updatePortfolioItem(id: number, data: Record<string, any>) {
  const db = getDb();
  if (!db) {
    demo.demoUpdatePortfolioItem(id, data);
    return;
  }
  await db.update(portfolioItems).set(data).where(eq(portfolioItems.id, id));
}

export async function deletePortfolioItem(id: number, userId: number) {
  const db = getDb();
  if (!db) {
    demo.demoDeletePortfolioItem(id, userId);
    return;
  }
  await db.delete(portfolioItems).where(and(eq(portfolioItems.id, id), eq(portfolioItems.userId, userId)));
}

export async function verifyPortfolioItem(id: number, verifiedBy: number) {
  const db = getDb();
  if (!db) {
    demo.demoVerifyPortfolioItem(id, verifiedBy);
    return;
  }
  await db.update(portfolioItems).set({ verified: true, verifiedBy }).where(eq(portfolioItems.id, id));
}

export async function reorderPortfolioItems(userId: number, itemIds: number[]) {
  const db = getDb();
  if (!db) {
    demo.demoReorderPortfolioItems(userId, itemIds);
    return;
  }
  for (let i = 0; i < itemIds.length; i++) {
    await db
      .update(portfolioItems)
      .set({ sortOrder: i })
      .where(and(eq(portfolioItems.id, itemIds[i]), eq(portfolioItems.userId, userId)));
  }
}

// =============================================================================
// Documents
// =============================================================================

export async function listDocuments(userId: number) {
  const db = getDb();
  if (!db) return demo.demoListDocuments(userId);
  return db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: number) {
  const db = getDb();
  if (!db) return demo.demoGetDocumentById(id);
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result[0];
}

export async function createDocument(data: {
  userId: number;
  name: string;
  type: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  metadata?: any;
}) {
  const db = getDb();
  if (!db) return demo.demoCreateDocument(data);
  const result = await db.insert(documents).values(data as any);
  return result[0].insertId;
}

export async function deleteDocument(id: number, userId: number) {
  const db = getDb();
  if (!db) {
    demo.demoDeleteDocument(id, userId);
    return;
  }
  await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
}

export async function verifyDocument(id: number, verifiedBy: number) {
  const db = getDb();
  if (!db) {
    demo.demoVerifyDocument(id, verifiedBy);
    return;
  }
  await db.update(documents).set({ verified: true, verifiedBy }).where(eq(documents.id, id));
}
