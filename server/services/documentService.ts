import { storagePut } from "../storage";
import * as db from "../db/portfolio";
import { getDb } from "../db/index";

export async function getPresignedUploadUrl(userId: number, fileName: string, mimeType: string) {
  const key = `documents/${userId}/${fileName}`;
  if (!getDb()) {
    // Demo mode: no object storage. Register the document with a demo path.
    return { uploadUrl: `/api/documents/demo-placeholder?key=${encodeURIComponent(key)}`, key };
  }
  const { url } = await storagePut(key, Buffer.from(""), mimeType);
  return { uploadUrl: url, key };
}

export async function registerDocument(
  userId: number,
  data: {
    name: string;
    type: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    metadata?: any;
  }
) {
  return db.createDocument({ ...data, userId });
}

export async function listDocuments(userId: number) {
  return db.listDocuments(userId);
}

export async function deleteDocument(id: number, userId: number) {
  return db.deleteDocument(id, userId);
}

export async function verifyDocument(id: number, verifiedBy: number) {
  return db.verifyDocument(id, verifiedBy);
}
