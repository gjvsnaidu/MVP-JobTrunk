import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import { z } from "zod";
import { getDb } from "../db/index";
import { facultyOpportunities, facultyApplications } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { notifyApplicationUpdate } from "../services/notificationService";

const router = Router();

// GET /api/faculty-opportunities
router.get("/faculty-opportunities", requireAuth, async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not available" });

  const { type, status, search } = req.query;
  const conditions = [];

  if (type) conditions.push(eq(facultyOpportunities.type, type as any));
  if (status) conditions.push(eq(facultyOpportunities.status, status as any));

  const items = await db
    .select()
    .from(facultyOpportunities)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(facultyOpportunities.createdAt));

  res.json(items);
});

// POST /api/faculty-opportunities
const facultySchema = z.object({
  type: z.enum(["faculty_internship", "fdp", "consultancy", "research_project", "industrial_training"]),
  title: z.string().min(1),
  description: z.string().min(1),
  organization: z.string().optional(),
  requirements: z.any().optional(),
  duration: z.string().optional(),
  skillsRequired: z.array(z.number()).optional(),
  location: z.string().optional(),
  status: z.enum(["draft", "open"]).optional(),
  deadline: z.string().optional(),
});

router.post("/faculty-opportunities", requireRole("industry", "institution", "admin"), validate(facultySchema), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const user = getUser(req);
    const result = await db!.insert(facultyOpportunities).values({
      ...req.body,
      postedByUserId: user.id,
      deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
    });
    res.status(201).json({ id: result[0].insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/faculty-opportunities/:id/apply
router.post("/faculty-opportunities/:id/apply", requireRole("academician"), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const user = getUser(req);
    const opportunityId = Number(req.params.id);

    // Check for duplicate
    const existing = await db!.select().from(facultyApplications).where(
      and(eq(facultyApplications.userId, user.id), eq(facultyApplications.opportunityId, opportunityId))
    ).limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Already applied" });
    }

    const result = await db!.insert(facultyApplications).values({
      userId: user.id,
      opportunityId,
      coverLetter: req.body.coverLetter,
    });

    res.status(201).json({ id: result[0].insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/faculty-opportunities/my-applications
router.get("/faculty-opportunities/my-applications", requireRole("academician"), async (req: Request, res: Response) => {
  const db = getDb();
  const user = getUser(req);
  const apps = await db!.select().from(facultyApplications).where(eq(facultyApplications.userId, user.id)).orderBy(desc(facultyApplications.createdAt));
  res.json(apps);
});

// PATCH /api/faculty-applications/:id/status
router.patch("/faculty-applications/:id/status", requireRole("industry", "institution", "admin"), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { status } = req.body;
    await db!.update(facultyApplications).set({ status, updatedAt: new Date() }).where(eq(facultyApplications.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
