import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";
import * as userDb from "../db/users";
import * as demo from "../demo";
import { getDb } from "../db/index";

const router = Router();

// GET /api/profile — my full profile
router.get("/profile", requireAuth, async (req: Request, res: Response) => {
  const user = getUser(req);
  const profile: any = { ...user };

  if (user.role === "industry") {
    profile.industryProfile = await userDb.getIndustryProfile(user.id);
  } else if (user.role === "academician") {
    profile.academicianProfile = await userDb.getAcademicianProfile(user.id);
  } else if (user.role === "student" && !getDb()) {
    profile.studentProfile = demo.demoGetStudentProfile(user.id);
  }

  res.json(profile);
});

// PUT /api/profile — update profile
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  // Industry-specific
  companyName: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  companySize: z.string().optional(),
  contactPerson: z.string().optional(),
  // Academician-specific
  institutionId: z.number().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  experience: z.number().optional(),
  bio: z.string().optional(),
  researchInterests: z.string().optional(),
  // Student-specific (demo)
  institution: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.number().optional(),
  cgpa: z.number().optional(),
  careerInterests: z.array(z.string()).optional(),
});

router.put("/profile", requireAuth, validate(updateProfileSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const data = req.body;

    // Update basic user fields
    const basicFields: any = {};
    if (data.name) basicFields.name = data.name;
    if (data.phone) basicFields.phone = data.phone;
    if (data.avatarUrl) basicFields.avatarUrl = data.avatarUrl;

    if (Object.keys(basicFields).length > 0) {
      await userDb.updateUser(user.id, basicFields);
    }

    // Update role-specific profile
    if (user.role === "industry") {
      const industryData: any = {};
      for (const field of ["companyName", "industry", "website", "description", "location", "companySize", "contactPerson"]) {
        if (data[field]) industryData[field] = data[field];
      }
      if (Object.keys(industryData).length > 0) {
        await userDb.upsertIndustryProfile(user.id, industryData);
      }
    } else if (user.role === "academician") {
      const acadData: any = {};
      for (const field of ["institutionId", "department", "designation", "specializations", "experience", "bio", "researchInterests"]) {
        if (data[field] !== undefined) acadData[field] = data[field];
      }
      if (Object.keys(acadData).length > 0) {
        await userDb.upsertAcademicianProfile(user.id, acadData);
      }
    } else if (user.role === "student" && !getDb()) {
      demo.demoUpdateStudentProfile(user.id, data);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/profile/:userId — public profile
router.get("/profile/:userId", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const user = await userDb.getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const profile: any = {
      id: user.id,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    if (user.role === "industry") {
      profile.industryProfile = await userDb.getIndustryProfile(user.id);
    } else if (user.role === "academician") {
      profile.academicianProfile = await userDb.getAcademicianProfile(user.id);
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
