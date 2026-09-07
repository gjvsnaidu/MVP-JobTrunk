import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import * as careerGuidanceService from "../services/careerGuidance";
import * as demo from "../demo";
import { getDb } from "../db/index";

const router = Router();

// GET /api/student/readiness — Career Readiness Index (0-100)
router.get("/student/readiness", requireRole("student"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const readiness = await demo.computeCareerReadiness(user.id);
    res.json(readiness);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/ai-context — compact profile snapshot for the copilot UI
router.get("/student/ai-context", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    if (getDb()) return res.json({ readiness: null, topGap: null, topInternship: null });
    const readiness = await demo.computeCareerReadiness(user.id);
    const gap = await demo.demoComputeGapAnalysis(user.id);
    const internships = await demo.demoMatchStudentToInternships(user.id);
    res.json({ readiness, topGap: gap.gaps[0] ?? null, topInternship: internships[0] ?? null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/career-guidance
router.get("/career-guidance", requireRole("student"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const guidance = await careerGuidanceService.generateCareerGuidance(user.id);
    res.json(guidance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/career-guidance/refresh
router.post("/career-guidance/refresh", requireRole("student"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const guidance = await careerGuidanceService.generateCareerGuidance(user.id);
    res.json(guidance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
