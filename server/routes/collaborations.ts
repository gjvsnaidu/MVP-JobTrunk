import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import { z } from "zod";
import { getDb } from "../db/index";
import { collaborations, collaborationParticipants } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// GET /api/collaborations
router.get("/collaborations", requireAuth, async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not available" });

  const { type, status } = req.query;
  const conditions = [];
  if (type) conditions.push(eq(collaborations.type, type as any));
  if (status) conditions.push(eq(collaborations.status, status as any));

  const items = await db
    .select()
    .from(collaborations)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(collaborations.createdAt));

  res.json(items);
});

// GET /api/collaborations/my
router.get("/collaborations/my", requireAuth, async (req: Request, res: Response) => {
  const db = getDb();
  const user = getUser(req);

  const participations = await db!.select().from(collaborationParticipants).where(eq(collaborationParticipants.userId, user.id));
  const collabIds = participations.map((p) => p.collaborationId);

  if (collabIds.length === 0) return res.json([]);

  const items = await db!.select().from(collaborations).where(eq(collaborations.id, collabIds[0] ?? 0));
  // Fetch all
  const allItems = await db!.select().from(collaborations);
  const filtered = allItems.filter((c) => collabIds.includes(c.id));

  res.json(filtered);
});

// GET /api/collaborations/:id
router.get("/collaborations/:id", requireAuth, async (req: Request, res: Response) => {
  const db = getDb();
  const result = await db!.select().from(collaborations).where(eq(collaborations.id, Number(req.params.id))).limit(1);
  if (result.length === 0) return res.status(404).json({ error: "Not found" });

  const participants = await db!.select().from(collaborationParticipants).where(eq(collaborationParticipants.collaborationId, Number(req.params.id)));
  res.json({ ...result[0], participants });
});

// POST /api/collaborations
const collabSchema = z.object({
  type: z.enum(["mentorship", "workshop", "guest_lecture", "innovation_challenge", "live_project"]),
  institutionId: z.number().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxParticipants: z.number().optional(),
  skills: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
});

router.post("/collaborations", requireRole("industry", "admin"), validate(collabSchema), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const user = getUser(req);
    const result = await db!.insert(collaborations).values({
      ...req.body,
      industryUserId: user.id,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    });
    res.status(201).json({ id: result[0].insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/collaborations/:id/join
router.post("/collaborations/:id/join", requireAuth, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const user = getUser(req);
    const collabId = Number(req.params.id);

    // Check if already participating
    const existing = await db!.select().from(collaborationParticipants).where(
      and(eq(collaborationParticipants.collaborationId, collabId), eq(collaborationParticipants.userId, user.id))
    ).limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Already participating" });
    }

    const result = await db!.insert(collaborationParticipants).values({
      collaborationId: collabId,
      userId: user.id,
      role: "participant",
    });

    res.status(201).json({ id: result[0].insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/collaborations/:id
router.patch("/collaborations/:id", requireRole("industry", "admin"), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    await db!.update(collaborations).set({ ...req.body, updatedAt: new Date() }).where(eq(collaborations.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
