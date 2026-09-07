import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import * as analyticsDb from "../db/analytics";

const router = Router();

// GET /api/analytics/skill-demand
router.get("/analytics/skill-demand", requireAuth, async (req: Request, res: Response) => {
  try {
    const trends = await analyticsDb.getSkillDemandTrends();
    res.json(trends);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/placement-readiness
router.get("/analytics/placement-readiness", requireAuth, async (req: Request, res: Response) => {
  try {
    const readiness = await analyticsDb.getPlacementReadiness();
    res.json(readiness);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/recruitment-outcomes
router.get("/analytics/recruitment-outcomes", requireAuth, async (req: Request, res: Response) => {
  try {
    const outcomes = await analyticsDb.getRecruitmentOutcomes();
    res.json(outcomes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/top-skills
router.get("/analytics/top-skills", requireAuth, async (req: Request, res: Response) => {
  try {
    const topSkills = await analyticsDb.getTopSkills();
    res.json(topSkills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/program-effectiveness
router.get("/analytics/program-effectiveness", requireAuth, async (req: Request, res: Response) => {
  try {
    const programs = await analyticsDb.getProgramEffectiveness();
    res.json(programs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/application-stats
router.get("/analytics/application-stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const { opportunityType } = req.query;
    const stats = await analyticsDb.getApplicationStats(opportunityType as string);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/student-skill-distribution
router.get("/analytics/student-skill-distribution", requireAuth, async (req: Request, res: Response) => {
  try {
    const distribution = await analyticsDb.getStudentSkillDistribution();
    res.json(distribution);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
