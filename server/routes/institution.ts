import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import * as analyticsService from "../services/analyticsService";
import * as analyticsDb from "../db/analytics";
import { getDb } from "../db/index";
import { users, academicianProfiles } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { store } from "../demo/store";

const router = Router();

// GET /api/institution/dashboard
router.get("/institution/dashboard", requireRole("institution", "admin"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    // In production, get institutionId from user profile
    const institutionId = user.id;
    const dashboard = await analyticsService.getInstitutionDashboard(institutionId);
    res.json(dashboard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/institution/students
router.get("/institution/students", requireRole("institution", "admin"), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const user = getUser(req);

    if (!db) {
      const roster = store.academicianProfiles.filter((p) => p.institutionId === user.id);
      const studentUsers = roster.map((p) => {
        const userRecord = store.users.find((u) => u.id === p.userId);
        return { ...userRecord, department: p.department, designation: p.designation, userId: p.userId };
      });
      return res.json(studentUsers);
    }

    // Get students associated with this institution
    const profiles = await db!.select({
      userId: academicianProfiles.userId,
      department: academicianProfiles.department,
      designation: academicianProfiles.designation,
    }).from(academicianProfiles).where(eq(academicianProfiles.institutionId, user.id));

    // Fetch user details for each
    const studentUsers = await Promise.all(
      profiles.map(async (p) => {
        const [userRecord] = await db!.select().from(users).where(eq(users.id, p.userId)).limit(1);
        return { ...userRecord, ...p };
      })
    );

    res.json(studentUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/institution/students/skill-distribution
router.get("/institution/students/skill-distribution", requireRole("institution", "admin"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const distribution = await analyticsDb.getStudentSkillDistribution(user.id);
    res.json(distribution);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/institution/faculty
router.get("/institution/faculty", requireRole("institution", "admin"), async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const user = getUser(req);
    if (!db) {
      const profiles = store.academicianProfiles.filter((p) => p.institutionId === user.id);
      return res.json(profiles);
    }
    const profiles = await db!.select().from(academicianProfiles).where(eq(academicianProfiles.institutionId, user.id));
    res.json(profiles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
