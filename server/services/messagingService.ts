import * as db from "../db/messaging";
import * as userDb from "../db/users";
import { notifyNewMessage } from "./notificationService";

export async function createConversation(creatorId: number, participantIds: number[], title?: string) {
  // Filter out self
  const otherIds = participantIds.filter((id) => id !== creatorId);
  if (otherIds.length === 0) throw new Error("Must have at least one other participant");

  const type = otherIds.length === 1 ? "direct" : "group";
  const conversationId = await db.createConversation(type, title);

  // Add all participants
  await db.addConversationParticipant(conversationId, creatorId, "sender");
  for (const id of otherIds) {
    await db.addConversationParticipant(conversationId, id, "receiver");
  }

  return conversationId;
}

export async function sendMessage(conversationId: number, senderId: number, content: string) {
  // Verify sender is a participant
  const isParticipant = await db.isConversationParticipant(conversationId, senderId);
  if (!isParticipant) throw new Error("Not a participant in this conversation");

  const messageId = await db.sendMessage({
    conversationId,
    senderUserId: senderId,
    content,
    type: "text",
  });

  // Notify other participants
  const participants = await db.getConversationParticipants(conversationId);
  const sender = await userDb.getUserById(senderId);
  const otherParticipants = participants.filter((p) => p.userId !== senderId);

  for (const p of otherParticipants) {
    await notifyNewMessage(p.userId, sender?.name ?? "Unknown", conversationId);
  }

  return messageId;
}

export async function getUserConversations(userId: number) {
  const conversations = await db.getUserConversations(userId);

  // Enrich with participant info and last message
  const enriched = await Promise.all(
    conversations.map(async (conv: any) => {
      const participants = await db.getConversationParticipants(conv.id);
      const participantUsers = await Promise.all(
        participants.map(async (p: any) => {
          const user = await userDb.getUserById(p.userId);
          return {
            userId: p.userId,
            name: user?.name ?? "Unknown",
            email: user?.email,
            avatarUrl: user?.avatarUrl,
            lastReadAt: p.lastReadAt,
          };
        })
      );

      const messages = await db.getMessages(conv.id, undefined, 1);
      const lastMessage = messages[0] ?? null;

      return {
        ...conv,
        participants: participantUsers,
        lastMessage,
      };
    })
  );

  return enriched;
}

export async function getMessages(conversationId: number, userId: number, cursor?: number) {
  const isParticipant = await db.isConversationParticipant(conversationId, userId);
  if (!isParticipant) throw new Error("Not a participant in this conversation");

  const messages = await db.getMessages(conversationId, cursor);

  // Enrich with sender info
  const enriched = await Promise.all(
    messages.map(async (msg: any) => {
      const sender = await userDb.getUserById(msg.senderUserId);
      return {
        ...msg,
        senderName: sender?.name ?? "Unknown",
        senderAvatar: sender?.avatarUrl,
      };
    })
  );

  return enriched;
}

export async function markAsRead(conversationId: number, userId: number) {
  return db.markConversationRead(conversationId, userId);
}
