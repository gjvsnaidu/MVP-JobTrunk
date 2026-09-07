import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { validate, PaginationSchema } from "../middleware/validate";
import { z } from "zod";
import * as oppDb from "../db/opportunities";
import * as matchingService from "../services/matching";
import { notifyApplicationUpdate, notifyNewOpportunity } from "../services/notificationService";
import * as userDb from "../db/users";
import { getDb } from "../db/index";
import * as demo from "../demo";

const router = Router();

// =============================================================================
// Internships
// =============================================================================

// GET /api/internships
router.get("/internships", async (req: Request, res: Response) => {
  const { status, type, location, search, page, limit } = req.query;
  const result = await oppDb.listInternships({
    status: status as string,
    type: type as string,
    location: location as string,
    search: search as string,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });
  res.json(result);
});

// GET /api/internships/recommended — matched to student's skills
router.get("/internships/recommended", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    if (user.role !== "student") {
      return res.status(403).json({ error: "Only students can get recommendations" });
    }
    const results = await matchingService.matchStudentToInternships(user.id);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/opportunities/:type/:id/candidates — matched students for an opportunity (industry)
router.get("/opportunities/:type/:id/candidates", requireRole("industry", "admin"), async (req: Request, res: Response) => {
  try {
    const type = req.params.type === "job" ? "job" : "internship";
    const id = Number(req.params.id);
    const opportunity =
      type === "internship" ? await oppDb.getInternshipById(id) : await oppDb.getJobById(id);
    if (!opportunity) return res.status(404).json({ error: "Opportunity not found" });
    if (!getDb()) {
      const candidates = await demo.demoGetCandidatesForOpportunity(type, id);
      return res.json(candidates);
    }
    // Real-DB mode: no candidate ranking yet — return an empty list.
    res.json([]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/opportunities/:type/:id/candidates/:userId/shortlist — recruiters can
// shortlist a matched candidate even before they apply (creates a shortlisted application)
router.post("/opportunities/:type/:id/candidates/:userId/shortlist", requireRole("industry", "admin"), async (req: Request, res: Response) => {
  try {
    const type = req.params.type === "job" ? "job" : "internship";
    const opportunityId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const opportunity =
      type === "internship" ? await oppDb.getInternshipById(opportunityId) : await oppDb.getJobById(opportunityId);
    if (!opportunity) return res.status(404).json({ error: "Opportunity not found" });

    const existing = (await oppDb.getApplicationsForOpportunity(type, opportunityId)).find(
      (a: any) => a.userId === userId
    );

    let applicationId: number;
    if (existing) {
      applicationId = existing.id;
      await oppDb.updateApplicationStatus(applicationId, "shortlisted");
    } else {
      applicationId = await oppDb.createApplication({
        userId,
        opportunityType: type,
        opportunityId,
        coverLetter: "Shortlisted by recruiter via JobTrunk candidate matching",
      });
      await oppDb.updateApplicationStatus(applicationId, "shortlisted");
    }

    await notifyApplicationUpdate(userId, opportunity.title, "shortlisted");
    res.json({ success: true, applicationId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/internships/:id
router.get("/internships/:id", async (req: Request, res: Response) => {
  const internship = await oppDb.getInternshipById(Number(req.params.id));
  if (!internship) return res.status(404).json({ error: "Internship not found" });
  res.json(internship);
});

// POST /api/internships
const internshipSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requirements: z.any().optional(),
  duration: z.string().optional(),
  stipend: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["remote", "hybrid", "onsite"]).optional(),
  requiredSkillIds: z.array(z.number()).optional(),
  status: z.enum(["draft", "open"]).optional(),
  deadline: z.string().optional(),
  maxApplicants: z.number().optional(),
});

router.post("/internships", requireRole("industry", "admin"), validate(internshipSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const id = await oppDb.createInternship({
      ...req.body,
      industryUserId: user.id,
      deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
    });
    res.status(201).json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/internships/:id
router.put("/internships/:id", requireRole("industry", "admin"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const internship = await oppDb.getInternshipById(Number(req.params.id));
    if (!internship) return res.status(404).json({ error: "Not found" });
    if (internship.industryUserId !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    await oppDb.updateInternship(Number(req.params.id), req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/internships/:id/status
router.patch("/internships/:id/status", requireRole("industry", "admin"), async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    await oppDb.updateInternship(Number(req.params.id), { status });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// Jobs
// =============================================================================

router.get("/jobs", async (req: Request, res: Response) => {
  const { status, type, experienceLevel, location, search, page, limit } = req.query;
  const result = await oppDb.listJobs({
    status: status as string,
    type: type as string,
    experienceLevel: experienceLevel as string,
    location: location as string,
    search: search as string,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });
  res.json(result);
});

router.get("/jobs/recommended", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    if (user.role !== "student") return res.status(403).json({ error: "Only students" });
    const results = await matchingService.matchStudentToJobs(user.id);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/jobs/:id", async (req: Request, res: Response) => {
  const job = await oppDb.getJobById(Number(req.params.id));
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

const jobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requirements: z.any().optional(),
  salaryRange: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["remote", "hybrid", "onsite"]).optional(),
  requiredSkillIds: z.array(z.number()).optional(),
  experienceLevel: z.enum(["entry", "junior", "mid", "senior"]).optional(),
  status: z.enum(["draft", "open"]).optional(),
  deadline: z.string().optional(),
});

router.post("/jobs", requireRole("industry", "admin"), validate(jobSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const id = await oppDb.createJob({
      ...req.body,
      industryUserId: user.id,
      deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
    });
    res.status(201).json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/jobs/:id", requireRole("industry", "admin"), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const job = await oppDb.getJobById(Number(req.params.id));
    if (!job) return res.status(404).json({ error: "Not found" });
    if (job.industryUserId !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    await oppDb.updateJob(Number(req.params.id), req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/jobs/:id/status", requireRole("industry", "admin"), async (req: Request, res: Response) => {
  try {
    await oppDb.updateJob(Number(req.params.id), { status: req.body.status });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// Applications
// =============================================================================

const applySchema = z.object({
  opportunityType: z.enum(["internship", "job", "learning_program"]),
  opportunityId: z.number(),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().optional(),
});

router.post("/applications", requireRole("student"), validate(applySchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const id = await oppDb.createApplication({
      userId: user.id,
      ...req.body,
    });
    res.status(201).json({ id });
  } catch (error: any) {
    if (error.message === "Already applied to this opportunity") {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get("/applications/my", requireAuth, async (req: Request, res: Response) => {
  const user = getUser(req);
  const apps = await oppDb.getApplicationsByUser(user.id);
  res.json(apps);
});

router.get("/applications/for/:opportunityType/:opportunityId", requireRole("industry", "admin"), async (req: Request, res: Response) => {
  const apps = await oppDb.getApplicationsForOpportunity(req.params.opportunityType, Number(req.params.opportunityId));
  res.json(apps);
});

router.patch("/applications/:id/status", requireRole("industry", "admin"), async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const app = (await oppDb.getApplicationsForOpportunity(
      req.body.opportunityType ?? "internship",
      req.body.opportunityId ?? 0
    )).find((a: any) => a.id === Number(req.params.id));

    await oppDb.updateApplicationStatus(Number(req.params.id), status);

    // Notify the student of the status change.
    if (app) {
      await notifyApplicationUpdate(app.userId, req.body.opportunityTitle ?? "Opportunity", status);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/applications/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    await oppDb.withdrawApplication(Number(req.params.id), user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// Saved Opportunities
// =============================================================================

router.post("/saved/toggle", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const { opportunityType, opportunityId } = req.body;
    const result = await oppDb.toggleSavedOpportunity(user.id, opportunityType, opportunityId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/saved", requireAuth, async (req: Request, res: Response) => {
  const user = getUser(req);
  const saved = await oppDb.getSavedOpportunities(user.id);
  res.json(saved);
});

export default router;
