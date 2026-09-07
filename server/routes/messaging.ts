import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import * as messagingService from "../services/messagingService";

const router = Router();

// GET /api/conversations
router.get("/conversations", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const conversations = await messagingService.getUserConversations(user.id);
    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/conversations
router.post("/conversations", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const { participantIds, title } = req.body;
    const conversationId = await messagingService.createConversation(user.id, participantIds, title);
    res.status(201).json({ id: conversationId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/conversations/:id/messages
router.get("/conversations/:id/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const messages = await messagingService.getMessages(Number(req.params.id), user.id, cursor);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/conversations/:id/messages
router.post("/conversations/:id/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const { content } = req.body;
    const messageId = await messagingService.sendMessage(Number(req.params.id), user.id, content);
    res.status(201).json({ id: messageId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/conversations/:id/read
router.patch("/conversations/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    await messagingService.markAsRead(Number(req.params.id), user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
