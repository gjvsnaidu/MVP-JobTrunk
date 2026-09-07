import { Router, Request, Response } from "express";
import { requireAuth, getUser } from "../middleware/auth";
import * as userDb from "../db/users";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { sdk } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";

const router = Router();

// =============================================================================
// Demo accounts — hackathon one-click role login
// =============================================================================

const DEMO_ACCOUNTS: Record<string, { openId: string; name: string; role: string; redirect: string }> = {
  student: { openId: "demo_student", name: "Arjun Sharma", role: "student", redirect: "/dashboard" },
  industry: { openId: "demo_recruiter", name: "Rakesh Menon", role: "industry", redirect: "/recruiter" },
  institution: { openId: "demo_institution", name: "Dr. Anita Deshpande", role: "institution", redirect: "/institution/dashboard" },
  admin: { openId: "demo_admin", name: "Rajesh Kumar", role: "admin", redirect: "/admin" },
  academician: { openId: "demo_academician", name: "Prof. Meena Krishnan", role: "academician", redirect: "/faculty-opportunities" },
};

// GET /api/auth/demo-accounts — available demo roles (public)
router.get("/demo-accounts", (_req: Request, res: Response) => {
  res.json(Object.entries(DEMO_ACCOUNTS).map(([key, acc]) => ({ key, name: acc.name, role: acc.role, redirect: acc.redirect })));
});

// POST /api/auth/demo-login — sign in as a seeded demo account
const demoLoginSchema = z.object({
  role: z.enum(["student", "industry", "institution", "admin", "academician"]),
});

router.post("/demo-login", validate(demoLoginSchema), async (req: Request, res: Response) => {
  try {
    const account = DEMO_ACCOUNTS[req.body.role];
    if (!account) return res.status(400).json({ error: "Unknown demo account" });

    // Upsert works in both demo (in-memory) and real-DB modes.
    await userDb.upsertUser({
      openId: account.openId,
      name: account.name,
      role: account.role as any,
      loginMethod: "demo",
      profileComplete: true,
      onboardingComplete: true,
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(account.openId, {
      name: account.name,
      expiresInMs: ONE_YEAR_MS,
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

    res.json({ success: true, role: account.role, name: account.name, redirect: account.redirect });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me — current user info
router.get("/me", (req: Request, res: Response) => {
  const user = getUser(req);
  if (!user) {
    return res.json(null);
  }
  res.json(user);
});

// POST /api/auth/logout — clear session
router.post("/logout", (req: Request, res: Response) => {
  const { COOKIE_NAME } = require("../../shared/const");
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true });
});

// POST /api/auth/onboard — complete onboarding with role + profile data
const onboardSchema = z.object({
  role: z.enum(["student", "industry", "academician", "institution"]),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  // Student fields
  education: z.string().optional(),
  interests: z.string().optional(),
  // Industry fields
  companyName: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  // Academician fields
  institutionId: z.number().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  experience: z.number().optional(),
  bio: z.string().optional(),
  // Institution fields
  institutionName: z.string().optional(),
  institutionType: z.string().optional(),
});

router.post("/onboard", requireAuth, validate(onboardSchema), async (req: Request, res: Response) => {
  try {
    const user = getUser(req);
    const data = req.body;

    // Update user basics
    await userDb.updateUser(user.id, {
      role: data.role,
      name: data.name || user.name,
      phone: data.phone || user.phone,
      onboardingComplete: true,
      profileComplete: true,
    });

    // Create role-specific profile
    if (data.role === "industry") {
      await userDb.upsertIndustryProfile(user.id, {
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        website: data.website,
        description: data.description,
        location: data.location,
      });
    } else if (data.role === "academician") {
      await userDb.upsertAcademicianProfile(user.id, {
        institutionId: data.institutionId,
        department: data.department,
        designation: data.designation,
        specializations: data.specializations,
        experience: data.experience,
        bio: data.bio,
      });
    }

    res.json({ success: true, role: data.role });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/onboarding-status — check if onboarding is complete
router.get("/onboarding-status", requireAuth, (req: Request, res: Response) => {
  const user = getUser(req);
  res.json({
    complete: user.onboardingComplete,
    role: user.role,
  });
});

export default router;
