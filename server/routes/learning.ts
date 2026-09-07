import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate } from "../middleware/validate";
import { z } from "zod";
import * as oppDb from "../db/opportunities";
import * as matchingService from "../services/matching";

const router = Router();

// GET /api/learning-programs
router.get("/learning-programs", async (req: Request, res: Response) => {
  const { category, status, search, page, limit } = req.query;
  const result = await oppDb.listLearningPrograms({
    category: category as string,
    status: status as string,
    search: search as string,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });
  res.json(result);
});

// GET /api/learning-programs/recommended
router.get("/learning-programs/recommended", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const results = await matchingService.matchStudentToPrograms(user.id);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/learning-programs/:id
router.get("/learning-programs/:id", async (req: Request, res: Response) => {
  const program = await oppDb.getLearningProgramById(Number(req.params.id));
  if (!program) return res.status(404).json({ error: "Program not found" });
  res.json(program);
});

// POST /api/learning-programs
const programSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["certification", "course", "workshop", "mentorship"]).optional(),
  duration: z.string().optional(),
  fee: z.string().optional(),
  skillIds: z.array(z.number()).optional(),
  maxParticipants: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["draft", "active"]).optional(),
  syllabus: z.any().optional(),
});

router.post("/learning-programs", requireRole("industry", "admin"), validate(programSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const id = await oppDb.createLearningProgram({
      ...req.body,
      industryUserId: user.id,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    });
    res.status(201).json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/learning-programs/:id
router.put("/learning-programs/:id", requireRole("industry", "admin"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const program = await oppDb.getLearningProgramById(Number(req.params.id));
    if (!program) return res.status(404).json({ error: "Not found" });
    if (program.industryUserId !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    await oppDb.updateLearningProgram(Number(req.params.id), req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/learning-programs/:id/enroll
router.post("/learning-programs/:id/enroll", requireRole("student"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const program = await oppDb.getLearningProgramById(Number(req.params.id));
    if (!program) return res.status(404).json({ error: "Program not found" });
    if (program.status !== "active") return res.status(400).json({ error: "Program not active" });
    if (program.maxParticipants && (program.enrolledCount ?? 0) >= program.maxParticipants) {
      return res.status(400).json({ error: "Program is full" });
    }

    const id = await oppDb.createApplication({
      userId: user.id,
      opportunityType: "learning_program",
      opportunityId: program.id,
    });

    // Increment enrolled count
    await oppDb.updateLearningProgram(program.id, {
      enrolledCount: (program.enrolledCount ?? 0) + 1,
    });

    res.status(201).json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/learning-programs/my-enrollments
router.get("/learning-programs/my-enrollments", requireAuth, async (req: Request, res: Response) => {
  const user = getUser(req);
  const apps = await oppDb.getApplicationsByUser(user.id);
  const enrollments = apps.filter((a: any) => a.opportunityType === "learning_program");
  res.json(enrollments);
});

// PATCH /api/learning-programs/:id/complete
router.patch("/learning-programs/:id/complete", requireRole("student"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    // Find the enrollment and mark as accepted (completed)
    const apps = await oppDb.getApplicationsByUser(user.id);
    const enrollment = apps.find(
      (a: any) => a.opportunityType === "learning_program" && a.opportunityId === Number(req.params.id)
    );
    if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });

    await oppDb.updateApplicationStatus(enrollment.id, "accepted");
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
