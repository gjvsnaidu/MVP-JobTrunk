import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import * as notificationDb from "../db/notifications";

const router = Router();

// GET /api/notifications
router.get("/notifications", requireAuth, async (req: Request, res: Response) => {
  const user = getUser(req);
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const result = await notificationDb.listNotifications(user.id, page, limit);
  res.json(result);
});

// GET /api/notifications/unread-count
router.get("/notifications/unread-count", requireAuth, async (req: Request, res: Response) => {
  const user = getUser(req);
  const count = await notificationDb.getUnreadNotificationCount(user.id);
  res.json({ count });
});

// PATCH /api/notifications/:id/read
router.patch("/notifications/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    await notificationDb.markNotificationRead(Number(req.params.id), user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/notifications/read-all
router.patch("/notifications/read-all", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    await notificationDb.markAllNotificationsRead(user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
