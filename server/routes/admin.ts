import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import * as userDb from "../db/users";
import * as analyticsService from "../services/analyticsService";
import { getDb } from "../db/index";
import { auditLog, institutions } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import * as demo from "../demo";

const router = Router();

// GET /api/admin/national-dashboard — Ministry / national skill ecosystem
router.get("/admin/national-dashboard", requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    if (!getDb()) return res.json(demo.demoGetNationalDashboard());
    res.json({
      overview: { totalStudents: 0, totalInstitutions: 0, totalIndustryPartners: 0, totalInternships: 0, totalJobs: 0, totalPlacements: 0 },
      topDemandedSkills: [],
      nationalSkillGaps: [],
      placementTrends: [],
      industryParticipation: [],
      emergingCareers: [],
      stateDistribution: [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users
router.get("/admin/users", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { role, search, page, limit } = req.query;
    const result = await userDb.listUsers({
      role: role as string,
      search: search as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch("/admin/users/:id/role", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const { role } = req.body;
    await userDb.updateUser(Number(req.params.id), { role });

    // Audit log
    const db = getDb();
    if (db) {
      await db.insert(auditLog).values({
        userId: user.id,
        action: "role_change",
        entityType: "user",
        entityId: Number(req.params.id),
        details: { newRole: role },
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/users/:id/deactivate
router.patch("/admin/users/:id/deactivate", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    await userDb.updateUser(Number(req.params.id), { isActive: false });

    const db = getDb();
    if (db) {
      await db.insert(auditLog).values({
        userId: user.id,
        action: "deactivate",
        entityType: "user",
        entityId: Number(req.params.id),
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/institutions
router.get("/admin/institutions", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const institutions = await userDb.listInstitutions({
      search: req.query.search as string,
    });
    res.json(institutions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/institutions
router.post("/admin/institutions", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    if (!db) {
      const id = demo.demoCreateInstitutionForAdmin(req.body);
      return res.status(201).json({ id });
    }
    const result = await db.insert(institutions).values(req.body);
    res.status(201).json({ id: result[0].insertId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/institutions/:id/verify
router.patch("/admin/institutions/:id/verify", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    if (db) await db.update(institutions).set({ verified: true }).where(eq(institutions.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/system/health
router.get("/admin/system/health", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const health = await analyticsService.getSystemHealth();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/audit-log
router.get("/admin/audit-log", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    if (!db) return res.json([]);
    const logs = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(100);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
