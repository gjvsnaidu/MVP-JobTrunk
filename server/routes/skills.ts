import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate, PaginationSchema } from "../middleware/validate";
import { z } from "zod";
import * as skillDb from "../db/skills";
import * as assessmentService from "../services/skillAssessment";

const router = Router();

// GET /api/skill-categories
router.get("/skill-categories", async (_req: Request, res: Response) => {
  const categories = await skillDb.listSkillCategories();
  res.json(categories);
});

// GET /api/skills
router.get("/skills", async (req: Request, res: Response) => {
  const { categoryId, demand, search } = req.query;
  const skills = await skillDb.listSkills({
    categoryId: categoryId ? Number(categoryId) : undefined,
    demand: demand as string,
    search: search as string,
  });
  res.json(skills);
});

// GET /api/skills/:id
router.get("/skills/:id", async (req: Request, res: Response) => {
  const skill = await skillDb.getSkillById(Number(req.params.id));
  if (!skill) return res.status(404).json({ error: "Skill not found" });
  res.json(skill);
});

// GET /api/assessments
router.get("/assessments", async (req: Request, res: Response) => {
  const user = getUser(req);
  const assessments = await skillDb.listAssessments({
    targetRole: user?.role === "student" ? "student" : undefined,
    isActive: true,
  });
  res.json(assessments);
});

// GET /api/assessments/:id
router.get("/assessments/:id", async (req: Request, res: Response) => {
  const assessment = await skillDb.getAssessmentById(Number(req.params.id));
  if (!assessment) return res.status(404).json({ error: "Assessment not found" });

  const questions = await skillDb.getAssessmentQuestions(assessment.id);
  res.json({ ...assessment, questions });
});

// POST /api/assessments/:id/submit
const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number(),
      answer: z.union([z.string(), z.number()]),
    })
  ),
  durationSeconds: z.number().optional(),
});

router.post("/assessments/:id/submit", requireAuth, validate(submitSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const assessmentId = Number(req.params.id);
    const { answers, durationSeconds } = req.body;

    const result = await assessmentService.generateSkillProfile(user.id, assessmentId, answers);

    res.json({
      success: true,
      totalScore: result.totalScore,
      skillScores: result.skillScores,
      skillLevels: result.skillLevels,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/skill-profile — my skill profile
router.get("/skill-profile", requireAuth, async (req: Request, res: Response) => {
  const user = getUser(req);
  const profile = await skillDb.getStudentSkillProfile(user.id);
  res.json(profile);
});

// PUT /api/skill-profile — update self-assessed levels
const updateProfileSchema = z.object({
  profiles: z.array(
    z.object({
      skillId: z.number(),
      proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
      selfScore: z.number().min(0).max(100).optional(),
    })
  ),
});

router.put("/skill-profile", requireAuth, validate(updateProfileSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    for (const p of req.body.profiles) {
      await skillDb.upsertStudentSkillProfile(user.id, p.skillId, {
        proficiency: p.proficiency,
        selfScore: p.selfScore,
      });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/skill-profile/gap-analysis — compute gap analysis (query form)
// NOTE: must be registered BEFORE /skill-profile/:userId or the param route swallows it.
router.get("/skill-profile/gap-analysis", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const gapAnalysis = await assessmentService.computeGapAnalysis(user.id);
    res.json(gapAnalysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/skill-profile/:userId — view another user's skill profile
router.get("/skill-profile/:userId", requireAuth, async (req: Request, res: Response) => {
  const profile = await skillDb.getStudentSkillProfile(Number(req.params.userId));
  res.json(profile);
});

// POST /api/skill-profile/gap-analysis — compute gap analysis
router.post("/skill-profile/gap-analysis", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const gapAnalysis = await assessmentService.computeGapAnalysis(user.id);
    res.json(gapAnalysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/skill-assessment-results — my assessment results
router.get("/skill-assessment-results", requireAuth, async (req: Request, res: Response) => {
  const user = getUser(req);
  const results = await skillDb.getAssessmentResults(user.id);
  res.json(results);
});

// POST /api/admin/skills — create skill (admin only)
router.post("/admin/skills", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const skillId = await skillDb.createSkill(req.body);
    res.status(201).json({ id: skillId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/skill-categories — create category (admin only)
router.post("/admin/skill-categories", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const categoryId = await skillDb.createSkillCategory(req.body);
    res.status(201).json({ id: categoryId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
