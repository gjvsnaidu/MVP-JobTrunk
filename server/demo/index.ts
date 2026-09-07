/**
 * Demo-mode implementations for every db module + service function.
 *
 * Each db module / service checks `getDb()`; when no database is configured
 * they delegate here. The demo store is seeded from ./seed.ts.
 *
 * Function signatures mirror the callers exactly so the rest of the server
 * code is unchanged.
 */
import { store, nextId } from "./store";
// Side-effect import: populates the in-memory store (seed.ts imports store.ts only).
import "./seed";
import { studentDetails as seededStudentDetails, type StudentDetails } from "./seed";

const DAY = 24 * 60 * 60 * 1000;

// =============================================================================
// Helpers
// =============================================================================

const skillNameById = (id: number) => store.skills.find((s) => s.id === id)?.name ?? `Skill ${id}`;

/** Enrich skill profiles with the skill name (what the UI expects). */
function enrichedProfiles(userId: number) {
  return store.studentSkillProfiles
    .filter((p) => p.userId === userId)
    .map((p) => ({
      ...p,
      skillName: skillNameById(p.skillId),
    }));
}

function getStudentDetails(userId: number): StudentDetails | undefined {
  return seededStudentDetails.find((d) => d.userId === userId);
}

// =============================================================================
// Career Readiness Index — 0-100 with the JobTrunk weighting
// =============================================================================

export function computeReadinessFromData(profiles: any[], results: any[], portfolio: any[]) {
  const scored = profiles.filter((p) => (p.assessedScore ?? p.selfScore ?? 0) > 0);
  const top5 = [...scored]
    .sort((a, b) => (b.assessedScore ?? b.selfScore ?? 0) - (a.assessedScore ?? a.selfScore ?? 0))
    .slice(0, 5);
  const skillReadinessRaw = top5.length
    ? top5.reduce((s, p) => s + (p.assessedScore ?? p.selfScore ?? 0), 0) / top5.length
    : 0;
  const skillReadiness = Math.round(skillReadinessRaw);

  const assessmentScore = results.length > 0 ? Number(results[0].totalScore ?? 0) : 0;

  const projectCount = portfolio.filter((i) => i.type === "project" && i.verified).length;
  const certCount = portfolio.filter((i) => i.type === "certification" && i.verified).length;
  const internCount = portfolio.filter((i) => i.type === "internship" && i.verified).length;

  const projectScore = projectCount >= 3 ? 95 : projectCount === 2 ? 85 : projectCount === 1 ? 60 : 0;
  const certScore = certCount >= 3 ? 95 : certCount === 2 ? 85 : certCount === 1 ? 60 : 0;
  const internScore = internCount >= 2 ? 95 : internCount === 1 ? 70 : 0;

  const softSkillIds = [4, 13, 19, 5];
  const softScores = profiles
    .filter((p) => softSkillIds.includes(p.skillId) && (p.assessedScore ?? p.selfScore ?? 0) > 0)
    .map((p) => p.assessedScore ?? p.selfScore ?? 0);
  const softSkillsRaw = softScores.length ? softScores.reduce((a, b) => a + b, 0) / softScores.length : 0;
  const softSkills = Math.round(softSkillsRaw);

  const components = [
    { key: "skillReadiness", label: "Skill Readiness", score: skillReadiness, weight: 35, note: "Average of your top 5 assessed skills" },
    { key: "assessments", label: "Assessments", score: assessmentScore, weight: 20, note: "Latest Career Readiness Assessment score" },
    { key: "projects", label: "Projects", score: projectScore, weight: 15, note: `${projectCount} verified project${projectCount === 1 ? "" : "s"} in your portfolio` },
    { key: "certifications", label: "Certifications", score: certScore, weight: 10, note: `${certCount} verified certification${certCount === 1 ? "" : "s"}` },
    { key: "internships", label: "Internships", score: internScore, weight: 10, note: `${internCount} verified internship${internCount === 1 ? "" : "s"}` },
    { key: "softSkills", label: "Soft Skills", score: softSkills, weight: 10, note: "Communication, teamwork & problem solving" },
  ];

  // Compute the total from unrounded sub-scores, then round once.
  const rawTotal = (0.35 * skillReadinessRaw + 0.2 * assessmentScore + 0.15 * projectScore + 0.1 * certScore + 0.1 * internScore + 0.1 * softSkillsRaw);
  const total = Math.round(rawTotal);
  const category =
    total >= 80 ? "Career Ready" : total >= 60 ? "Almost Ready" : total >= 40 ? "Developing" : "Needs Improvement";

  return { score: total, category, components };
}

export async function computeCareerReadiness(userId: number) {
  // Works in both modes: db modules return demo or real data.
  const skillDb = await import("../db/skills");
  const portfolioDb = await import("../db/portfolio");
  const profiles = (await skillDb.getStudentSkillProfile(userId)) as any[];
  const results = (await skillDb.getAssessmentResults(userId)) as any[];
  const portfolio = (await portfolioDb.listPortfolioItems(userId)) as any[];
  return computeReadinessFromData(profiles, results, portfolio);
}

// =============================================================================
// Matching — data-driven match scores (golden: Arjun ↔ Healthcare intern = 91)
// =============================================================================

export function demoMatchForRequired(
  requiredSkillIds: number[],
  profiles: any[],
  readiness: number
): { score: number; matchedSkills: string[]; missingSkills: string[]; coverage: number; skillFit: number; skillBreakdown: { name: string; score: number; status: "met" | "improve" | "missing" }[] } {
  const bySkill = new Map(profiles.map((p) => [p.skillId, p]));
  const present = requiredSkillIds.filter((id) => bySkill.has(id));
  const coverage = requiredSkillIds.length ? (present.length / requiredSkillIds.length) * 100 : 0;
  const scores = present.map((id) => bySkill.get(id)!.assessedScore ?? bySkill.get(id)!.selfScore ?? 0);
  const skillFit = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const score = Math.round(0.65 * coverage + 0.25 * skillFit + 0.1 * readiness);
  const matchedSkills = present.map((id) => bySkill.get(id)!.skillName ?? skillNameById(id));
  const missingSkills = requiredSkillIds.filter((id) => !bySkill.has(id)).map(skillNameById);
  // Per-skill breakdown so the UI can show "requirement met" vs "needs improvement".
  // A required skill at <70% is a gap even though the student has it.
  const skillBreakdown = requiredSkillIds.map((id) => {
    const p = bySkill.get(id);
    const name = skillNameById(id);
    if (!p) return { name, score: 0, status: "missing" as const };
    const s = p.assessedScore ?? p.selfScore ?? 0;
    return { name, score: s, status: (s >= 70 ? "met" : "improve") as "met" | "improve" };
  });
  return { score, matchedSkills, missingSkills, coverage: Math.round(coverage), skillFit: Math.round(skillFit), skillBreakdown };
}

export function demoMatchForPrograms(skillIds: number[], profiles: any[]) {
  const bySkill = new Map(profiles.map((p) => [p.skillId, p]));
  const present = skillIds.filter((id) => bySkill.has(id));
  const gaps = skillIds.map((id) => {
    const p = bySkill.get(id);
    return p ? Math.max(0, 100 - (p.assessedScore ?? p.selfScore ?? 0)) : 60;
  });
  const gapFit = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  const coverage = skillIds.length ? (present.length / skillIds.length) * 100 : 0;
  const score = Math.round(0.55 * gapFit + 0.45 * coverage);
  const missingSkills = skillIds.filter((id) => !bySkill.has(id)).map(skillNameById);
  return { score, matchedSkills: present.map((id) => skillNameById(id)), missingSkills };
}

export async function demoMatchStudentToInternships(userId: number) {
  const profiles = enrichedProfiles(userId);
  const readiness = (await computeCareerReadiness(userId)).score;
  return store.internships
    .filter((i) => i.status === "open")
    .map((listing) => {
      const m = demoMatchForRequired((listing.requiredSkillIds as number[]) ?? [], profiles, readiness);
      return { ...listing, type: "internship", matchScore: m.score, matchedSkills: m.matchedSkills, missingSkills: m.missingSkills, skillBreakdown: m.skillBreakdown, locationMatch: true };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export async function demoMatchStudentToJobs(userId: number) {
  const profiles = enrichedProfiles(userId);
  const readiness = (await computeCareerReadiness(userId)).score;
  return store.jobs
    .filter((j) => j.status === "open")
    .map((listing) => {
      const m = demoMatchForRequired((listing.requiredSkillIds as number[]) ?? [], profiles, readiness);
      return { ...listing, type: "job", matchScore: m.score, matchedSkills: m.matchedSkills, missingSkills: m.missingSkills, skillBreakdown: m.skillBreakdown, locationMatch: true };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export async function demoMatchStudentToPrograms(userId: number) {
  const profiles = enrichedProfiles(userId);
  return store.learningPrograms
    .filter((p) => p.status === "active")
    .map((listing) => {
      const m = demoMatchForPrograms((listing.skillIds as number[]) ?? [], profiles);
      return { ...listing, type: "learning_program", matchScore: m.score, matchedSkills: m.matchedSkills, missingSkills: m.missingSkills, locationMatch: true };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export async function demoCareerRecommendations(userId: number) {
  const internships = await demoMatchStudentToInternships(userId);
  const jobs = await demoMatchStudentToJobs(userId);
  const programs = await demoMatchStudentToPrograms(userId);
  return {
    topInternships: internships.slice(0, 5),
    topJobs: jobs.slice(0, 5),
    recommendedPrograms: programs.slice(0, 5),
    summary: {
      totalInternshipsMatched: internships.length,
      totalJobsMatched: jobs.length,
      totalProgramsRecommended: programs.length,
      avgMatchScore:
        internships.length + jobs.length > 0
          ? Math.round(
              (internships.slice(0, 5).reduce((s, i) => s + i.matchScore, 0) +
                jobs.slice(0, 5).reduce((s, j) => s + j.matchScore, 0)) /
                Math.min(10, internships.length + jobs.length)
            )
          : 0,
    },
  };
}

// =============================================================================
// Skill assessment (demo)
// =============================================================================

export async function demoCalculateAssessmentScores(assessmentId: number, answers: any[]) {
  const questions = store.skillAssessmentQuestions.filter((q) => q.assessmentId === assessmentId);
  const bySkill = new Map<number, any[]>();
  for (const q of questions) {
    const list = bySkill.get(q.skillId) ?? [];
    list.push(q);
    bySkill.set(q.skillId, list);
  }

  const skillScores: any[] = [];
  const skillLevels: Record<number, string> = {};
  for (const [skillId, skillQuestions] of bySkill.entries()) {
    const skill = store.skills.find((s) => s.id === skillId);
    if (!skill) continue;
    let totalWeightedScore = 0;
    let totalWeight = 0;
    for (const q of skillQuestions) {
      const answer = answers.find((a) => a.questionId === q.id);
      if (!answer) continue;
      const weight = q.weight ?? 1;
      totalWeight += weight;
      if (q.questionType === "mcq" || q.questionType === "practical") {
        const isCorrect = String(answer.answer).toLowerCase() === String(q.correctAnswer).toLowerCase();
        totalWeightedScore += (isCorrect ? 100 : 0) * weight;
      } else if (q.questionType === "confidence") {
        const confidence = Math.min(5, Math.max(1, Number(answer.answer)));
        totalWeightedScore += ((confidence - 1) / 4) * 100 * weight;
      } else if (q.questionType === "rating") {
        const rating = Math.min(10, Math.max(1, Number(answer.answer)));
        totalWeightedScore += ((rating - 1) / 9) * 100 * weight;
      }
    }
    const score = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
    const level =
      score >= 85 ? "expert" : score >= 60 ? "advanced" : score >= 30 ? "intermediate" : "beginner";
    skillScores.push({ skillId, skillName: skill.name, score, level, weight: totalWeight });
    skillLevels[skillId] = level;
  }

  const totalWeightedScore = skillScores.reduce((sum, s) => sum + s.score * s.weight, 0);
  const totalWeight = skillScores.reduce((sum, s) => sum + s.weight, 0);
  const totalScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  return { skillScores, totalScore, skillLevels };
}

export async function demoGenerateSkillProfile(userId: number, assessmentId: number, answers: any[]) {
  const { skillScores, totalScore, skillLevels } = await demoCalculateAssessmentScores(assessmentId, answers);

  store.skillAssessmentResults.push({
    id: nextId("skillAssessmentResults"),
    userId,
    assessmentId,
    scores: skillScores,
    totalScore,
    skillLevels,
    completedAt: new Date(),
    durationSeconds: 0,
  } as any);

  for (const s of skillScores) {
    const existing = store.studentSkillProfiles.find((p) => p.userId === userId && p.skillId === s.skillId);
    if (existing) {
      existing.proficiency = s.level as any;
      existing.assessedScore = s.score;
      existing.updatedAt = new Date();
    } else {
      store.studentSkillProfiles.push({
        id: nextId("studentSkillProfiles"),
        userId,
        skillId: s.skillId,
        proficiency: s.level as any,
        assessedScore: s.score,
        verified: false,
        updatedAt: new Date(),
      });
    }
  }

  return { skillScores, totalScore, skillLevels };
}

export async function demoComputeGapAnalysis(userId: number) {
  const profiles = store.studentSkillProfiles.filter((p) => p.userId === userId);
  const profileMap = new Map(profiles.map((p) => [p.skillId, p]));

  const TARGET_SCORE = { high: 85, medium: 70, low: 55 };

  const gaps = store.skills.map((skill) => {
    const profile = profileMap.get(skill.id);
    const currentScore = profile?.assessedScore ?? profile?.selfScore ?? 0;
    const targetScore = TARGET_SCORE[skill.industryDemand as keyof typeof TARGET_SCORE] ?? 70;
    const gapPercent = Math.max(0, targetScore - currentScore);
    const levelOrder = { none: 0, beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const expectedLevel = skill.industryDemand === "high" ? 3 : skill.industryDemand === "medium" ? 2 : 1;
    const gapLevel = Math.max(0, expectedLevel - (levelOrder[(profile?.proficiency as keyof typeof levelOrder) ?? "none"] ?? 0));
    return {
      skillId: skill.id,
      skillName: skill.name,
      currentLevel: profile?.proficiency ?? "none",
      currentScore,
      targetScore,
      gapPercent: Math.round(gapPercent),
      gap: gapLevel,
      industryDemand: skill.industryDemand,
      isCore: skill.isCore,
    };
  });

  // Assessed skills first (your real gaps), then unassessed high-demand skills.
  gaps.sort((a, b) => {
    const aAssessed = a.currentScore > 0 ? 0 : 1;
    const bAssessed = b.currentScore > 0 ? 0 : 1;
    if (aAssessed !== bAssessed) return aAssessed - bAssessed;
    return b.gapPercent - a.gapPercent || (b.industryDemand === "high" ? 1 : 0) - (a.industryDemand === "high" ? 1 : 0);
  });

  return {
    gaps: gaps.filter((g) => g.gapPercent > 0),
    strengths: gaps.filter((g) => g.gapPercent === 0 && g.currentLevel !== "none"),
  };
}

// =============================================================================
// Career guidance (demo) — reuses the shared pipeline
// =============================================================================

export async function demoGenerateCareerGuidance(userId: number) {
  const gapAnalysis = await demoComputeGapAnalysis(userId);
  const matching = await demoCareerRecommendations(userId);
  const profiles = enrichedProfiles(userId);
  const currentSkills = profiles.map((p) => p.skillName).filter(Boolean);

  const skillMap = new Map(store.skills.map((s) => [s.id, s]));
  const careerPaths: any[] = [];
  const seenTitles = new Set<string>();

  for (const internship of matching.topInternships.slice(0, 3)) {
    if (seenTitles.has(internship.title)) continue;
    seenTitles.add(internship.title);
    const requiredSkillIds = (internship.requiredSkillIds as number[]) ?? [];
    const requiredSkills = requiredSkillIds.map((id) => skillMap.get(id)?.name ?? "").filter(Boolean);
    careerPaths.push({
      title: `${internship.title} Career Path`,
      matchScore: internship.matchScore,
      requiredSkills,
      currentSkills: currentSkills.filter((s) => requiredSkills.includes(s)),
      gapSkills: internship.missingSkills ?? [],
      recommendedPrograms: matching.recommendedPrograms.slice(0, 2),
      recommendedInternships: [internship],
      description: `Based on your skills, you're a strong match for ${internship.title} roles. ${
        (internship.missingSkills?.length ?? 0) > 0
          ? `Consider developing: ${internship.missingSkills.join(", ")}.`
          : "Your skill set aligns well with this path."
      }`,
    });
  }

  for (const job of matching.topJobs.slice(0, 3)) {
    if (seenTitles.has(job.title)) continue;
    seenTitles.add(job.title);
    const requiredSkillIds = (job.requiredSkillIds as number[]) ?? [];
    const requiredSkills = requiredSkillIds.map((id) => skillMap.get(id)?.name ?? "").filter(Boolean);
    careerPaths.push({
      title: `${job.title} Career Path`,
      matchScore: job.matchScore,
      requiredSkills,
      currentSkills: currentSkills.filter((s) => requiredSkills.includes(s)),
      gapSkills: job.missingSkills ?? [],
      recommendedPrograms: matching.recommendedPrograms.slice(0, 2),
      recommendedInternships: [],
      description: `Your profile matches well with ${job.title} positions. ${
        (job.missingSkills?.length ?? 0) > 0
          ? `Key skills to develop: ${job.missingSkills.join(", ")}.`
          : "You have most of the required skills."
      }`,
    });
  }

  careerPaths.sort((a, b) => b.matchScore - a.matchScore);

  return {
    careerPaths: careerPaths.slice(0, 5),
    gapAnalysis,
    currentSkills,
    summary: {
      totalPaths: careerPaths.length,
      avgMatchScore:
        careerPaths.length > 0
          ? Math.round(careerPaths.reduce((s, p) => s + p.matchScore, 0) / careerPaths.length)
          : 0,
      topSkillGaps: gapAnalysis.gaps.slice(0, 5).map((g) => g.skillName),
      recommendedProgramsCount: matching.recommendedPrograms.length,
    },
  };
}

// =============================================================================
// Users
// =============================================================================

export function demoUpsertUser(user: any): void {
  const existing = store.users.find((u) => u.openId === user.openId);
  if (existing) {
    if (user.name !== undefined) existing.name = user.name;
    if (user.email !== undefined) existing.email = user.email;
    if (user.phone !== undefined) existing.phone = user.phone;
    if (user.loginMethod !== undefined) existing.loginMethod = user.loginMethod;
    if (user.role !== undefined) existing.role = user.role;
    if (user.profileComplete !== undefined) existing.profileComplete = user.profileComplete;
    if (user.onboardingComplete !== undefined) existing.onboardingComplete = user.onboardingComplete;
    if (user.avatarUrl !== undefined) existing.avatarUrl = user.avatarUrl;
    existing.lastSignedIn = user.lastSignedIn ?? new Date();
    existing.updatedAt = new Date();
  } else {
    store.users.push({
      id: nextId("users"),
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      phone: user.phone ?? null,
      loginMethod: user.loginMethod ?? null,
      role: user.role ?? "user",
      avatarUrl: user.avatarUrl ?? null,
      profileComplete: user.profileComplete ?? false,
      onboardingComplete: user.onboardingComplete ?? false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: user.lastSignedIn ?? new Date(),
    });
  }
}

export function demoGetUserByOpenId(openId: string) {
  return store.users.find((u) => u.openId === openId);
}

export function demoGetUserById(id: number) {
  return store.users.find((u) => u.id === id);
}

export function demoUpdateUser(id: number, data: any) {
  const user = store.users.find((u) => u.id === id);
  if (!user) return;
  Object.assign(user, data, { updatedAt: new Date() });
}

export function demoListUsers(filters: { role?: string; search?: string; page?: number; limit?: number }) {
  const { role, search, page = 1, limit = 20 } = filters ?? {};
  let list = [...store.users];
  if (role) list = list.filter((u) => u.role === role);
  if (search) list = list.filter((u) => (u.name ?? "").toLowerCase().includes(search.toLowerCase()));
  list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return {
    users: list.slice((page - 1) * limit, page * limit),
    total: list.length,
  };
}

export function demoGetIndustryProfile(userId: number) {
  return store.industryProfiles.find((p) => p.userId === userId);
}

export function demoUpsertIndustryProfile(userId: number, data: any) {
  const existing = store.industryProfiles.find((p) => p.userId === userId);
  if (existing) {
    Object.assign(existing, data, { updatedAt: new Date() });
  } else {
    store.industryProfiles.push({ id: nextId("industryProfiles"), userId, ...data, verified: false, createdAt: new Date(), updatedAt: new Date() });
  }
}

export function demoGetAcademicianProfile(userId: number) {
  return store.academicianProfiles.find((p) => p.userId === userId);
}

export function demoUpsertAcademicianProfile(userId: number, data: any) {
  const existing = store.academicianProfiles.find((p) => p.userId === userId);
  if (existing) {
    Object.assign(existing, data, { updatedAt: new Date() });
  } else {
    store.academicianProfiles.push({ id: nextId("academicianProfiles"), userId, ...data, createdAt: new Date(), updatedAt: new Date() });
  }
}

export function demoGetInstitutionById(id: number) {
  return store.institutions.find((i) => i.id === id);
}

export function demoListInstitutions(filters?: { verified?: boolean; search?: string }) {
  let list = [...store.institutions];
  if (filters?.verified !== undefined) list = list.filter((i) => i.verified === filters.verified);
  if (filters?.search) list = list.filter((i) => i.name.toLowerCase().includes(filters.search!.toLowerCase()));
  return list;
}

// =============================================================================
// Skills
// =============================================================================

export function demoListSkillCategories() {
  return [...store.skillCategories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function demoCreateSkillCategory(data: any) {
  store.skillCategories.push({ id: nextId("skillCategories"), ...data, sortOrder: data.sortOrder ?? 0, createdAt: new Date() });
  return store.skillCategories[store.skillCategories.length - 1].id;
}

export function demoListSkills(filters?: { categoryId?: number; demand?: string; search?: string }) {
  return store.skills.filter((s) => {
    if (filters?.categoryId && s.categoryId !== filters.categoryId) return false;
    if (filters?.demand && s.industryDemand !== filters.demand) return false;
    if (filters?.search && !s.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}

export function demoGetSkillById(id: number) {
  return store.skills.find((s) => s.id === id);
}

export function demoCreateSkill(data: any) {
  store.skills.push({ id: nextId("skills"), ...data, createdAt: new Date() });
  return store.skills[store.skills.length - 1].id;
}

export function demoListAssessments(filters?: { targetRole?: string; isActive?: boolean }) {
  return store.skillAssessments.filter((a) => {
    if (filters?.targetRole && a.targetRole !== filters.targetRole) return false;
    if (filters?.isActive !== undefined && a.isActive !== filters.isActive) return false;
    return true;
  });
}

export function demoGetAssessmentById(id: number) {
  return store.skillAssessments.find((a) => a.id === id);
}

export function demoGetAssessmentQuestions(assessmentId: number) {
  return store.skillAssessmentQuestions
    .filter((q) => q.assessmentId === assessmentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function demoCreateAssessment(data: any) {
  store.skillAssessments.push({ id: nextId("skillAssessments"), ...data, isActive: true, totalQuestions: 0, createdAt: new Date(), updatedAt: new Date() });
  return store.skillAssessments[store.skillAssessments.length - 1].id;
}

export function demoCreateAssessmentResult(data: any) {
  store.skillAssessmentResults.push({ id: nextId("skillAssessmentResults"), ...data, completedAt: new Date() });
  return store.skillAssessmentResults[store.skillAssessmentResults.length - 1].id;
}

export function demoGetAssessmentResults(userId: number, assessmentId?: number) {
  return store.skillAssessmentResults
    .filter((r) => r.userId === userId && (assessmentId === undefined || r.assessmentId === assessmentId))
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
}

export function demoGetStudentSkillProfile(userId: number) {
  return enrichedProfiles(userId);
}

export function demoUpsertStudentSkillProfile(userId: number, skillId: number, data: any) {
  const existing = store.studentSkillProfiles.find((p) => p.userId === userId && p.skillId === skillId);
  if (existing) {
    Object.assign(existing, data, { updatedAt: new Date() });
  } else {
    store.studentSkillProfiles.push({
      id: nextId("studentSkillProfiles"),
      userId,
      skillId,
      proficiency: data.proficiency ?? "beginner",
      selfScore: data.selfScore ?? null,
      assessedScore: data.assessedScore ?? null,
      verified: data.verified ?? false,
      updatedAt: new Date(),
    } as any);
  }
}

export async function demoBulkUpsertSkillProfile(userId: number, profiles: Array<{ skillId: number; proficiency: string; assessedScore: number }>) {
  for (const p of profiles) demoUpsertStudentSkillProfile(userId, p.skillId, { proficiency: p.proficiency, assessedScore: p.assessedScore });
}

// =============================================================================
// Opportunities
// =============================================================================

export function demoListInternships(filters?: any) {
  const { status, type, location, search, page = 1, limit = 20 } = filters ?? {};
  let items = [...store.internships];
  if (status) items = items.filter((i) => i.status === status);
  if (type) items = items.filter((i) => i.type === type);
  if (location) items = items.filter((i) => (i.location ?? "").toLowerCase().includes(location.toLowerCase()));
  if (search) items = items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return { items: items.slice((page - 1) * limit, page * limit), total: items.length };
}

export function demoGetInternshipById(id: number) {
  return store.internships.find((i) => i.id === id);
}

export function demoCreateInternship(data: any) {
  store.internships.push({
    id: nextId("internships"),
    industryUserId: data.industryUserId,
    title: data.title,
    description: data.description,
    requirements: data.requirements ?? null,
    duration: data.duration ?? null,
    stipend: data.stipend ?? null,
    location: data.location ?? null,
    type: data.type ?? "onsite",
    requiredSkillIds: data.requiredSkillIds ?? [],
    status: data.status ?? "open",
    deadline: data.deadline ?? null,
    maxApplicants: data.maxApplicants ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);
  return store.internships[store.internships.length - 1].id;
}

export function demoUpdateInternship(id: number, data: any) {
  const item = store.internships.find((i) => i.id === id);
  if (item) Object.assign(item, data, { updatedAt: new Date() });
}

export function demoListJobs(filters?: any) {
  const { status, type, experienceLevel, location, search, page = 1, limit = 20 } = filters ?? {};
  let items = [...store.jobs];
  if (status) items = items.filter((i) => i.status === status);
  if (type) items = items.filter((i) => i.type === type);
  if (experienceLevel) items = items.filter((i) => i.experienceLevel === experienceLevel);
  if (location) items = items.filter((i) => (i.location ?? "").toLowerCase().includes(location.toLowerCase()));
  if (search) items = items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return { items: items.slice((page - 1) * limit, page * limit), total: items.length };
}

export function demoGetJobById(id: number) {
  return store.jobs.find((j) => j.id === id);
}

export function demoCreateJob(data: any) {
  store.jobs.push({
    id: nextId("jobs"),
    industryUserId: data.industryUserId,
    title: data.title,
    description: data.description,
    requirements: data.requirements ?? null,
    salaryRange: data.salaryRange ?? null,
    location: data.location ?? null,
    type: data.type ?? "onsite",
    requiredSkillIds: data.requiredSkillIds ?? [],
    experienceLevel: data.experienceLevel ?? "entry",
    status: data.status ?? "open",
    deadline: data.deadline ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);
  return store.jobs[store.jobs.length - 1].id;
}

export function demoUpdateJob(id: number, data: any) {
  const item = store.jobs.find((j) => j.id === id);
  if (item) Object.assign(item, data, { updatedAt: new Date() });
}

export function demoListLearningPrograms(filters?: any) {
  const { category, status, search, page = 1, limit = 20 } = filters ?? {};
  let items = [...store.learningPrograms];
  if (category) items = items.filter((p) => p.category === category);
  if (status) items = items.filter((p) => p.status === status);
  if (search) items = items.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return { items: items.slice((page - 1) * limit, page * limit), total: items.length };
}

export function demoGetLearningProgramById(id: number) {
  return store.learningPrograms.find((p) => p.id === id);
}

export function demoCreateLearningProgram(data: any) {
  store.learningPrograms.push({
    id: nextId("learningPrograms"),
    industryUserId: data.industryUserId,
    title: data.title,
    description: data.description,
    category: data.category ?? "course",
    duration: data.duration ?? null,
    fee: data.fee ?? null,
    skillIds: data.skillIds ?? [],
    maxParticipants: data.maxParticipants ?? null,
    enrolledCount: 0,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    status: data.status ?? "draft",
    syllabus: data.syllabus ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);
  return store.learningPrograms[store.learningPrograms.length - 1].id;
}

export function demoUpdateLearningProgram(id: number, data: any) {
  const item = store.learningPrograms.find((p) => p.id === id);
  if (item) Object.assign(item, data, { updatedAt: new Date() });
}

export function demoCreateApplication(data: any) {
  const existing = store.applications.find(
    (a) => a.userId === data.userId && a.opportunityType === data.opportunityType && a.opportunityId === data.opportunityId
  );
  if (existing) throw new Error("Already applied to this opportunity");
  store.applications.push({
    id: nextId("applications"),
    userId: data.userId,
    opportunityType: data.opportunityType,
    opportunityId: data.opportunityId,
    status: "pending",
    coverLetter: data.coverLetter ?? null,
    resumeUrl: data.resumeUrl ?? null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);
  return store.applications[store.applications.length - 1].id;
}

/** Enrich applications with opportunity title + company for a better UI. */
function enrichApplication(app: any) {
  let opportunityTitle = "";
  let companyName = "";
  if (app.opportunityType === "internship") {
    const opp = store.internships.find((i) => i.id === app.opportunityId);
    if (opp) {
      opportunityTitle = opp.title;
      companyName = store.industryProfiles.find((p) => p.userId === opp.industryUserId)?.companyName ?? store.users.find((u) => u.id === opp.industryUserId)?.name ?? "";
    }
  } else if (app.opportunityType === "job") {
    const opp = store.jobs.find((j) => j.id === app.opportunityId);
    if (opp) {
      opportunityTitle = opp.title;
      companyName = store.industryProfiles.find((p) => p.userId === opp.industryUserId)?.companyName ?? store.users.find((u) => u.id === opp.industryUserId)?.name ?? "";
    }
  } else if (app.opportunityType === "learning_program") {
    const opp = store.learningPrograms.find((p) => p.id === app.opportunityId);
    if (opp) opportunityTitle = opp.title;
  }
  return {
    ...app,
    opportunityTitle,
    companyName,
    studentName: store.users.find((u) => u.id === app.userId)?.name ?? `Candidate #${app.userId}`,
  };
}

export function demoGetApplicationsByUser(userId: number) {
  return store.applications
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(enrichApplication);
}

export function demoGetApplicationsForOpportunity(opportunityType: string, opportunityId: number) {
  return store.applications
    .filter((a) => a.opportunityType === opportunityType && a.opportunityId === opportunityId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(enrichApplication);
}

export function demoUpdateApplicationStatus(id: number, status: string) {
  const app = store.applications.find((a) => a.id === id);
  if (app) {
    app.status = status as any;
    app.updatedAt = new Date();
  }
}

export function demoWithdrawApplication(id: number, userId: number) {
  const app = store.applications.find((a) => a.id === id && a.userId === userId);
  if (app) {
    app.status = "withdrawn";
    app.updatedAt = new Date();
  }
}

export function demoToggleSavedOpportunity(userId: number, opportunityType: string, opportunityId: number) {
  const existing = store.savedOpportunities.find(
    (s) => s.userId === userId && s.opportunityType === opportunityType && s.opportunityId === opportunityId
  );
  if (existing) {
    store.savedOpportunities = store.savedOpportunities.filter((s) => s.id !== existing.id);
    return { saved: false };
  }
  store.savedOpportunities.push({ id: nextId("savedOpportunities"), userId, opportunityType: opportunityType as any, opportunityId, createdAt: new Date() });
  return { saved: true };
}

export function demoGetSavedOpportunities(userId: number) {
  return store.savedOpportunities.filter((s) => s.userId === userId);
}

// =============================================================================
// Portfolio & Documents
// =============================================================================

export function demoListPortfolioItems(userId: number) {
  return store.portfolioItems
    .filter((p) => p.userId === userId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function demoGetPortfolioItemById(id: number) {
  return store.portfolioItems.find((p) => p.id === id);
}

export function demoCreatePortfolioItem(data: any) {
  store.portfolioItems.push({
    id: nextId("portfolioItems"),
    userId: data.userId,
    type: data.type,
    title: data.title,
    description: data.description ?? null,
    url: data.url ?? null,
    issuedBy: data.issuedBy ?? null,
    date: data.date ?? null,
    endDate: data.endDate ?? null,
    verified: false,
    documentUrl: data.documentUrl ?? null,
    metadata: data.metadata ?? null,
    sortOrder: data.sortOrder ?? 0,
    createdAt: new Date(),
  } as any);
  return store.portfolioItems[store.portfolioItems.length - 1].id;
}

export function demoUpdatePortfolioItem(id: number, data: any) {
  const item = store.portfolioItems.find((p) => p.id === id);
  if (item) Object.assign(item, data);
}

export function demoDeletePortfolioItem(id: number, userId: number) {
  store.portfolioItems = store.portfolioItems.filter((p) => !(p.id === id && p.userId === userId));
}

export function demoVerifyPortfolioItem(id: number, verifiedBy: number) {
  const item = store.portfolioItems.find((p) => p.id === id);
  if (item) {
    item.verified = true;
    item.verifiedBy = verifiedBy;
  }
}

export function demoReorderPortfolioItems(userId: number, itemIds: number[]) {
  itemIds.forEach((id, i) => {
    const item = store.portfolioItems.find((p) => p.id === id && p.userId === userId);
    if (item) item.sortOrder = i;
  });
}

export function demoListDocuments(userId: number) {
  return store.documents
    .filter((d) => d.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function demoGetDocumentById(id: number) {
  return store.documents.find((d) => d.id === id);
}

export function demoCreateDocument(data: any) {
  store.documents.push({
    id: nextId("documents"),
    userId: data.userId,
    name: data.name,
    type: data.type,
    fileUrl: data.fileUrl,
    fileSize: data.fileSize ?? null,
    mimeType: data.mimeType ?? null,
    verified: false,
    metadata: data.metadata ?? null,
    createdAt: new Date(),
  } as any);
  return store.documents[store.documents.length - 1].id;
}

export function demoDeleteDocument(id: number, userId: number) {
  store.documents = store.documents.filter((d) => !(d.id === id && d.userId === userId));
}

export function demoVerifyDocument(id: number, verifiedBy: number) {
  const doc = store.documents.find((d) => d.id === id);
  if (doc) {
    doc.verified = true;
    doc.verifiedBy = verifiedBy;
  }
}

// =============================================================================
// Notifications
// =============================================================================

export function demoCreateNotification(data: any) {
  store.notifications.push({
    id: nextId("notifications"),
    userId: data.userId,
    type: data.type,
    title: data.title,
    body: data.body ?? null,
    link: data.link ?? null,
    read: false,
    metadata: data.metadata ?? null,
    createdAt: new Date(),
  } as any);
  return store.notifications[store.notifications.length - 1].id;
}

export function demoListNotifications(userId: number, page = 1, limit = 20) {
  const items = store.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return { items: items.slice((page - 1) * limit, page * limit), total: items.length };
}

export function demoGetUnreadNotificationCount(userId: number) {
  return store.notifications.filter((n) => n.userId === userId && !n.read).length;
}

export function demoMarkNotificationRead(id: number, userId: number) {
  const n = store.notifications.find((x) => x.id === id && x.userId === userId);
  if (n) n.read = true;
}

export function demoMarkAllNotificationsRead(userId: number) {
  store.notifications.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
}

export function demoBulkCreateNotifications(userIds: number[], type: string, title: string, body?: string, link?: string) {
  for (const userId of userIds) demoCreateNotification({ userId, type, title, body, link });
}

// =============================================================================
// Messaging
// =============================================================================

export function demoCreateConversation(type = "direct", title?: string) {
  store.conversations.push({ id: nextId("conversations"), type: type as any, title, createdAt: new Date(), updatedAt: new Date() });
  return store.conversations[store.conversations.length - 1].id;
}

export function demoAddConversationParticipant(conversationId: number, userId: number, role = "receiver") {
  store.conversationParticipants.push({
    id: nextId("conversationParticipants"),
    conversationId,
    userId,
    role: role as any,
    joinedAt: new Date(),
    lastReadAt: null,
  } as any);
}

export function demoGetConversationById(id: number) {
  return store.conversations.find((c) => c.id === id);
}

export function demoGetUserConversations(userId: number) {
  const participations = store.conversationParticipants.filter((p) => p.userId === userId);
  const convIds = new Set(participations.map((p) => p.conversationId));
  return store.conversations
    .filter((c) => convIds.has(c.id))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map((conv) => ({ ...conv, participants: participations.filter((p) => p.conversationId === conv.id) }));
}

export function demoGetConversationParticipants(conversationId: number) {
  return store.conversationParticipants.filter((p) => p.conversationId === conversationId);
}

export function demoIsConversationParticipant(conversationId: number, userId: number) {
  return store.conversationParticipants.some((p) => p.conversationId === conversationId && p.userId === userId);
}

export function demoSendMessage(data: any) {
  store.messages.push({
    id: nextId("messages"),
    conversationId: data.conversationId,
    senderUserId: data.senderUserId,
    content: data.content,
    type: data.type ?? "text",
    fileUrl: data.fileUrl ?? null,
    readBy: null,
    createdAt: new Date(),
  } as any);
  const conv = store.conversations.find((c) => c.id === data.conversationId);
  if (conv) conv.updatedAt = new Date();
  return store.messages[store.messages.length - 1].id;
}

export function demoGetMessages(conversationId: number, cursor?: number, limit = 50) {
  return store.messages
    .filter((m) => m.conversationId === conversationId && (cursor === undefined || m.id < cursor))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export function demoMarkConversationRead(conversationId: number, userId: number) {
  const p = store.conversationParticipants.find((x) => x.conversationId === conversationId && x.userId === userId);
  if (p) p.lastReadAt = new Date();
}

export function demoGetUnreadMessageCount(userId: number) {
  let count = 0;
  for (const p of store.conversationParticipants.filter((x) => x.userId === userId)) {
    const lastRead = p.lastReadAt ?? new Date(0);
    count += store.messages.filter(
      (m) => m.conversationId === p.conversationId && m.createdAt > lastRead && m.senderUserId !== userId
    ).length;
  }
  return count;
}

// =============================================================================
// Analytics — realistic demo aggregates
// =============================================================================

const DEMAND_MULT: Record<string, number> = { high: 3, medium: 2, low: 1 };

export function demoGetSkillDemandTrends() {
  // studentCount is a mock national aggregate per skill
  const counts: Record<number, number> = {
    1: 18400, 2: 16200, 3: 12900, 4: 19800, 5: 14200, 6: 15300, 7: 8100, 8: 11800,
    9: 12600, 10: 11400, 11: 9800, 12: 7600, 13: 13500, 14: 5400, 15: 7200, 16: 6900,
    17: 6100, 18: 9200, 19: 4800, 20: 2600, 21: 5800, 22: 6300, 23: 5400, 24: 8900,
    25: 4200, 26: 3100, 27: 6600, 28: 1800, 29: 2400, 30: 5100,
  };
  return store.skills.map((s) => ({
    categoryId: s.categoryId,
    categoryName: store.skillCategories.find((c) => c.id === s.categoryId)?.name ?? "",
    skillId: s.id,
    skillName: s.name,
    industryDemand: s.industryDemand,
    studentCount: counts[s.id] ?? 500,
  }));
}

export function demoGetStudentSkillDistribution() {
  // Mock university-scale aggregate: skillId → [beginner, intermediate, advanced, expert]
  const dist: Record<number, [number, number, number, number]> = {
    1: [340, 1860, 2140, 420], 2: [890, 2540, 830, 120], 3: [1120, 1680, 620, 180],
    4: [240, 1240, 2440, 780], 5: [310, 1480, 2180, 640], 6: [560, 1980, 1420, 260],
    7: [820, 1420, 540, 120], 8: [1560, 1240, 380, 60], 9: [1040, 1620, 780, 220],
    10: [1280, 1420, 420, 80], 11: [1420, 980, 240, 40], 12: [1100, 1480, 360, 80],
    13: [280, 1060, 2120, 940], 14: [1940, 840, 220, 30], 15: [1680, 1020, 260, 60],
    16: [1880, 640, 180, 20], 17: [1320, 860, 240, 50], 18: [760, 1680, 1080, 320],
    19: [620, 1240, 980, 180], 20: [2400, 420, 90, 10], 21: [1340, 980, 380, 120],
    22: [1780, 760, 220, 40], 23: [1560, 680, 160, 30], 24: [480, 1640, 1240, 460],
    25: [1420, 860, 220, 40], 26: [2020, 520, 120, 20], 27: [1680, 720, 280, 60],
    28: [2300, 380, 80, 10], 29: [1980, 560, 140, 30], 30: [1720, 820, 260, 70],
  };
  const profs = ["beginner", "intermediate", "advanced", "expert"];
  const rows: any[] = [];
  for (const s of store.skills) {
    const counts = dist[s.id] ?? [100, 100, 50, 10];
    counts.forEach((count, i) => {
      if (count > 0) rows.push({ skillId: s.id, skillName: s.name, proficiency: profs[i], count });
    });
  }
  return rows;
}

export function demoGetApplicationStats(opportunityType?: string) {
  const base: Record<string, { total: number; pending: number; shortlisted: number; accepted: number; rejected: number }> = {
    internship: { total: 2840, pending: 1120, shortlisted: 860, accepted: 520, rejected: 340 },
    job: { total: 1560, pending: 640, shortlisted: 420, accepted: 210, rejected: 290 },
    learning_program: { total: 4120, pending: 2140, shortlisted: 1120, accepted: 860, rejected: 0 },
  };
  const key = opportunityType && base[opportunityType] ? opportunityType : "internship";
  return { ...base[key] };
}

export function demoGetPlacementReadiness() {
  const avgProf: Record<number, number> = {
    1: 2.9, 2: 2.2, 3: 2.5, 4: 3.1, 5: 2.9, 6: 2.7, 8: 1.9, 9: 2.6, 10: 2.2, 11: 2.0,
    12: 2.4, 13: 3.0, 14: 1.9, 15: 2.1, 16: 1.8, 17: 2.0, 18: 2.8, 22: 2.0, 23: 1.9, 30: 2.1,
  };
  return store.skills
    .filter((s) => s.isCore)
    .map((s) => ({
      skillId: s.id,
      skillName: s.name,
      industryDemand: s.industryDemand,
      studentsWithSkill: (store.skillAssessmentResults.length > 0 ? 1 : 0) * 0 + (demoGetSkillDemandTrends().find((t) => t.skillId === s.id)?.studentCount ?? 0),
      avgProficiency: avgProf[s.id] ?? 2.0,
    }));
}

export function demoGetRecruitmentOutcomes(industryUserId?: number) {
  const months = [
    { month: "2026-04", total: 1180, accepted: 260, rejected: 190 },
    { month: "2026-03", total: 1420, accepted: 310, rejected: 240 },
    { month: "2026-02", total: 1260, accepted: 280, rejected: 210 },
    { month: "2026-01", total: 980, accepted: 220, rejected: 160 },
    { month: "2025-12", total: 760, accepted: 180, rejected: 120 },
    { month: "2025-11", total: 820, accepted: 190, rejected: 130 },
  ];
  return months;
}

export function demoGetTopSkills() {
  return demoGetSkillDemandTrends()
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 10)
    .map((t) => ({ skillId: t.skillId, skillName: t.skillName, demand: t.industryDemand, studentCount: t.studentCount }));
}

export function demoGetInstitutionStats() {
  return { totalStudents: 10420, totalFaculty: 312, avgSkillScore: 71, activeInternships: 146 };
}

export function demoGetProgramEffectiveness() {
  return store.learningPrograms
    .filter((p) => p.status === "active")
    .map((p) => ({ programId: p.id, title: p.title, category: p.category, enrolledCount: p.enrolledCount, status: p.status }))
    .sort((a, b) => b.enrolledCount - a.enrolledCount);
}

/** Extended institution dashboard — skill gaps, heatmap, placement funnel. */
export function demoGetInstitutionDashboard() {
  const skillDistribution = demoGetStudentSkillDistribution();
  return {
    overview: {
      totalStudents: 10420,
      totalFaculty: 312,
      activeInternships: 146,
      avgSkillScore: 71,
      assessed: 8920,
      internshipParticipation: 72,
      placementReadiness: 76,
      industryPartners: 103,
    },
    skillDistribution,
    applicationStats: demoGetApplicationStats("internship"),
    skillGaps: [
      { skill: "SQL/Databases", readiness: 46, demand: 92 },
      { skill: "Cloud Computing", readiness: 39, demand: 88 },
      { skill: "Machine Learning", readiness: 54, demand: 86 },
      { skill: "Data Visualization", readiness: 49, demand: 72 },
      { skill: "Communication", readiness: 76, demand: 80 },
      { skill: "Python", readiness: 72, demand: 95 },
      { skill: "Problem Solving", readiness: 78, demand: 90 },
    ],
    departmentReadiness: [
      { department: "Computer Science", readiness: 82 },
      { department: "Electronics & Communication", readiness: 68 },
      { department: "MBA", readiness: 74 },
    ],
    heatmap: [
      { skill: "Python", CSE: 82, ECE: 61, MBA: 42 },
      { skill: "SQL/Databases", CSE: 74, ECE: 55, MBA: 68 },
      { skill: "AI/ML", CSE: 70, ECE: 52, MBA: 31 },
      { skill: "Communication", CSE: 68, ECE: 71, MBA: 82 },
      { skill: "Cloud Computing", CSE: 58, ECE: 44, MBA: 28 },
      { skill: "Data Analytics", CSE: 71, ECE: 58, MBA: 74 },
      { skill: "Problem Solving", CSE: 80, ECE: 66, MBA: 60 },
    ],
    topSkills: demoGetTopSkills(),
    placementFunnel: [
      { stage: "Eligible Students", count: 8420 },
      { stage: "Applications", count: 5210 },
      { stage: "Shortlisted", count: 3260 },
      { stage: "Interviewed", count: 1940 },
      { stage: "Offers", count: 1420 },
      { stage: "Placed", count: 1310 },
    ],
    learningRecommendations: [
      { programId: 1, title: "SQL for Data Analytics", gap: "SQL/Databases", reason: "46% institutional readiness vs 92% industry demand" },
      { programId: 6, title: "Cloud Computing Fundamentals", gap: "Cloud Computing", reason: "39% institutional readiness vs 88% industry demand" },
      { programId: 3, title: "Machine Learning Foundations", gap: "Machine Learning", reason: "54% institutional readiness vs 86% industry demand" },
    ],
  };
}

export function demoGetIndustryDashboard(industryUserId: number) {
  const internshipStats = demoGetApplicationStats("internship");
  const jobStats = demoGetApplicationStats("job");
  const programStats = demoGetApplicationStats("learning_program");
  return {
    overview: {
      totalInternshipApplications: internshipStats.total,
      totalJobApplications: jobStats.total,
      totalProgramEnrollments: programStats.total,
      overallAcceptanceRate:
        internshipStats.total + jobStats.total > 0
          ? Math.round(((internshipStats.accepted + jobStats.accepted) / (internshipStats.total + jobStats.total)) * 100)
          : 0,
    },
    internshipStats,
    jobStats,
    programStats,
    recruitmentTrends: demoGetRecruitmentOutcomes(industryUserId),
    generatedAt: new Date().toISOString(),
  };
}

// =============================================================================
// Recruiter candidate matching
// =============================================================================

export async function demoGetCandidatesForOpportunity(opportunityType: string, opportunityId: number) {
  const opp =
    opportunityType === "internship"
      ? store.internships.find((i) => i.id === opportunityId)
      : store.jobs.find((j) => j.id === opportunityId);
  if (!opp) return [];

  const requiredSkillIds = (opp.requiredSkillIds as number[]) ?? [];
  const students = store.users.filter((u) => u.role === "student" && u.isActive);
  const candidates: any[] = [];

  for (const student of students) {
    const profiles = enrichedProfiles(student.id);
    const readiness = computeReadinessFromData(
      profiles,
      store.skillAssessmentResults.filter((r) => r.userId === student.id),
      store.portfolioItems.filter((p) => p.userId === student.id)
    );
    const m = demoMatchForRequired(requiredSkillIds, profiles, readiness.score);
    const details = getStudentDetails(student.id);
    const internships = store.portfolioItems.filter((p) => p.userId === student.id && p.type === "internship" && p.verified);
    const assessmentResults = store.skillAssessmentResults.filter((r) => r.userId === student.id);
    const bestAssessment = assessmentResults.length ? Math.max(...assessmentResults.map((r) => Number(r.totalScore ?? 0))) : 0;

    const interestAligned = details?.careerInterests?.some((ci) =>
      ((opp.title ?? "") + " " + ((opp.requirements as any)?.eligibleDegrees?.join(" ") ?? "")).toLowerCase().includes(ci.split(" ")[0].toLowerCase())
    );

    candidates.push({
      userId: student.id,
      name: student.name,
      email: student.email,
      avatarUrl: student.avatarUrl,
      matchScore: m.score,
      skillMatch: m.skillFit,
      coverage: m.coverage,
      matchedSkills: m.matchedSkills,
      missingSkills: m.missingSkills,
      academicMatch: details?.cgpa && details.cgpa >= ((opp.requirements as any)?.minCGPA ?? 6) ? 100 : 75,
      cgpa: details?.cgpa ?? null,
      department: details?.department ?? null,
      degree: details?.degree ?? null,
      graduationYear: details?.graduationYear ?? null,
      experience: internships.length,
      assessmentScore: bestAssessment,
      careerInterest: interestAligned ? 100 : 65,
      readiness: readiness.score,
      readinessCategory: readiness.category,
      careerInterests: details?.careerInterests ?? [],
      skillCount: profiles.length,
    });
  }

  return candidates.sort((a, b) => b.matchScore - a.matchScore || b.readiness - a.readiness);
}

// =============================================================================
// National / Ministry dashboard
// =============================================================================

export function demoGetNationalDashboard() {
  return {
    headline: "India's Academia–Industry Skill Network",
    overview: {
      totalStudents: 2430000,
      totalInstitutions: 1240,
      totalIndustryPartners: 8600,
      totalInternships: 46200,
      totalJobs: 31800,
      totalPlacements: 214000,
      placementRate: 76.4,
      assessmentCoverage: 68,
    },
    topDemandedSkills: [
      { skill: "Python", demand: "Very High", openings: 182000 },
      { skill: "Data Analytics", demand: "Very High", openings: 164000 },
      { skill: "Communication", demand: "High", openings: 148000 },
      { skill: "Cloud Computing", demand: "High", openings: 132000 },
      { skill: "SQL/Databases", demand: "Very High", openings: 158000 },
      { skill: "Machine Learning", demand: "High", openings: 98000 },
      { skill: "Cybersecurity", demand: "Growing", openings: 61000 },
      { skill: "AI/LLM Engineering", demand: "Very High", openings: 74000 },
    ],
    nationalSkillGaps: [
      { skill: "SQL/Databases", gapPercent: 34, institutionsAffected: 812 },
      { skill: "Cloud Computing", gapPercent: 41, institutionsAffected: 946 },
      { skill: "Machine Learning", gapPercent: 28, institutionsAffected: 704 },
      { skill: "Communication", gapPercent: 18, institutionsAffected: 512 },
      { skill: "Cybersecurity", gapPercent: 37, institutionsAffected: 688 },
    ],
    placementTrends: [
      { month: "2025-11", placements: 15200 },
      { month: "2025-12", placements: 16400 },
      { month: "2026-01", placements: 17800 },
      { month: "2026-02", placements: 18900 },
      { month: "2026-03", placements: 20400 },
      { month: "2026-04", placements: 21400 },
    ],
    industryParticipation: [
      { industry: "Digital Health", internships: 6200, growth: 18 },
      { industry: "Fintech", internships: 5800, growth: 14 },
      { industry: "Enterprise Software", internships: 7400, growth: 9 },
      { industry: "Cloud & DevOps", internships: 4900, growth: 22 },
      { industry: "CleanTech", internships: 2100, growth: 11 },
    ],
    emergingCareers: [
      { title: "AI/LLM Engineer", growth: 42 },
      { title: "Healthcare Data Analyst", growth: 34 },
      { title: "Cloud Security Engineer", growth: 28 },
      { title: "Product Analyst", growth: 24 },
      { title: "Robotics & Automation", growth: 19 },
    ],
    stateDistribution: [
      { state: "Maharashtra", students: 312000, institutions: 148, industryPartners: 1040, internships: 6400, placementRate: 78 },
      { state: "Karnataka", students: 286000, institutions: 132, industryPartners: 1280, internships: 7200, placementRate: 82 },
      { state: "Tamil Nadu", students: 241000, institutions: 118, industryPartners: 860, internships: 5200, placementRate: 76 },
      { state: "Telangana", students: 178000, institutions: 84, industryPartners: 720, internships: 4600, placementRate: 80 },
      { state: "Uttar Pradesh", students: 324000, institutions: 156, industryPartners: 540, internships: 3800, placementRate: 66 },
      { state: "Gujarat", students: 156000, institutions: 88, industryPartners: 610, internships: 3400, placementRate: 74 },
      { state: "Delhi NCR", students: 212000, institutions: 96, industryPartners: 980, internships: 5600, placementRate: 79 },
      { state: "West Bengal", students: 168000, institutions: 92, industryPartners: 420, internships: 2400, placementRate: 68 },
    ],
    generatedAt: new Date().toISOString(),
  };
}

// =============================================================================
// Student details (demo profile extension)
// =============================================================================

export function demoGetStudentProfile(userId: number) {
  const details = getStudentDetails(userId);
  if (!details) return null;
  return { ...details };
}

export function demoUpdateStudentProfile(userId: number, data: any) {
  const details = getStudentDetails(userId);
  if (!details) return;
  const allowed = ["institution", "degree", "department", "graduationYear", "cgpa", "careerInterests", "bio"];
  for (const key of allowed) {
    if (data[key] !== undefined) (details as any)[key] = data[key];
  }
}

export function demoCreateInstitutionForAdmin(data: any) {
  store.institutions.push({
    id: nextId("institutions"),
    name: data.name ?? "Untitled Institution",
    type: data.type ?? "college",
    location: data.location ?? null,
    website: data.website ?? null,
    description: data.description ?? null,
    logoUrl: data.logoUrl ?? null,
    verified: data.verified ?? false,
    contactEmail: data.contactEmail ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);
  return store.institutions[store.institutions.length - 1].id;
}

// =============================================================================
// JobTrunk AI — your personal career copilot (mock logic, data-driven)
// =============================================================================

export async function demoAskAI(userId: number, question: string) {
  const q = question.toLowerCase();
  const user = demoGetUserById(userId);
  const profiles = enrichedProfiles(userId);
  const readiness = await computeCareerReadiness(userId);
  const gap = await demoComputeGapAnalysis(userId);
  const details = getStudentDetails(userId);
  const matchedInternships = await demoMatchStudentToInternships(userId);
  const matchedJobs = await demoMatchStudentToJobs(userId);
  const programs = await demoMatchStudentToPrograms(userId);

  const topSkills = [...profiles]
    .sort((a, b) => (b.assessedScore ?? 0) - (a.assessedScore ?? 0))
    .slice(0, 3)
    .map((p) => `${p.skillName} (${p.assessedScore ?? 0}%)`)
    .join(", ");
  const biggestGap = gap.gaps[0];
  const bestMatch = matchedInternships[0];
  const bestJob = matchedJobs[0];
  // Prefer the program that directly targets the biggest gap.
  const topProgram =
    programs.find((p) => ((p.skillIds as number[]) ?? []).includes(biggestGap?.skillId ?? -1)) ?? programs[0];

  const interests = details?.careerInterests?.join(", ") ?? "not set yet";

  let answer: string;
  if (q.includes("career suit") || q.includes("what career") || q.includes("which job") || q.includes("good at")) {
    answer = `Based on your assessment, your strongest areas are **${topSkills || "no skills assessed yet"}**.\n\nYour profile is best aligned with **${bestMatch?.title ?? "data-driven roles"}** (${bestMatch?.matchScore ?? 0}% match at ${bestMatch ? companyNameOf(bestMatch) : "—"}) and **${bestJob?.title ?? "analyst roles"}** (${bestJob?.matchScore ?? 0}% match). Your stated interests (${interests}) reinforce this.`;
  } else if (q.includes("learn next") || q.includes("what should i learn") || q.includes("improve")) {
    answer = biggestGap
      ? `Your biggest skill gap is **${biggestGap.skillName}** — you're at ${biggestGap.currentScore}% while industry expects ~${biggestGap.targetScore}%.\n\nStart with **${topProgram?.title ?? "a focused learning program"}** (${topProgram ? programProvider(topProgram.id) : "NPTEL"}, ${topProgram?.duration ?? ""}). It directly targets this gap.`
      : `You have no significant skill gaps right now. Keep building projects and apply to ${bestMatch?.title ?? "matched internships"}.`;
  } else if (q.includes("internship") || q.includes("find") || q.includes("opportunit") || q.includes("apply")) {
    answer = `Here are your best internship matches:\n\n1. **${bestMatch?.title ?? "No matches yet"}** at ${bestMatch ? companyNameOf(bestMatch) : "—" } — ${bestMatch?.matchScore ?? 0}% match${bestMatch?.missingSkills?.length ? ` (improve: ${bestMatch.missingSkills.join(", ")})` : ""}\n2. ${matchedInternships[1]?.title ?? "—"} — ${matchedInternships[1]?.matchScore ?? 0}% match\n3. ${matchedInternships[2]?.title ?? "—"} — ${matchedInternships[2]?.matchScore ?? 0}% match\n\nYour overall readiness is **${readiness.score}/100 (${readiness.category})**.`;
  } else if (q.includes("readiness") || q.includes("ready")) {
    answer = `Your **Career Readiness Index is ${readiness.score}/100 (${readiness.category})**.\n\nBreakdown: ${readiness.components.map((c) => `${c.label} ${c.score}/100`).join(" · ")}.\nYour strongest lever: ${biggestGap ? `close the **${biggestGap.skillName}** gap` : "keep building projects"}.`;
  } else if (q.includes("not eligible") || q.includes("why am i")) {
    answer = bestMatch
      ? `For **${bestMatch.title}**, you're ${bestMatch.matchScore}% compatible. ${bestMatch.missingSkills?.length ? `The main reason is missing skills: ${bestMatch.missingSkills.join(", ")}.` : "You meet the core requirements."} ${biggestGap ? `Overall, ${biggestGap.skillName} (${biggestGap.currentScore}% vs target ${biggestGap.targetScore}%) is your biggest lever to unlock more opportunities.` : ""}`
      : `No opportunities match your profile yet — complete the skill assessment first.`;
  } else if (q.includes("data analyst") || q.includes("analyst")) {
    answer = `To become a **Data Analyst**, focus on: Python, SQL/Databases, Data Analytics and Communication.\n\nYou currently have: ${profiles.filter((p) => ["Python", "SQL/Databases", "Data Analytics", "Communication"].includes(p.skillName)).map((p) => `${p.skillName} ${p.assessedScore ?? 0}%`).join(", ") || "no matching skills yet"}.\nYour biggest gap on this path: **${biggestGap?.skillName ?? "none"}**.`;
  } else if (q.includes("hello") || q.includes("hi ") || q === "hi") {
    answer = `Hi ${user?.name?.split(" ")[0] ?? "there"}! I'm your JobTrunk career copilot. Ask me what career suits your skills, what to learn next, which internships match you, or how to improve your readiness.`;
  } else {
    answer = `Here's what I know about your career profile:\n\n- **Readiness:** ${readiness.score}/100 (${readiness.category})\n- **Top skills:** ${topSkills || "none yet"}\n- **Biggest gap:** ${biggestGap ? `${biggestGap.skillName} (${biggestGap.currentScore}% → target ${biggestGap.targetScore}%)` : "none"}\n- **Best internship match:** ${bestMatch ? `${bestMatch.title} at ${companyNameOf(bestMatch)} — ${bestMatch.matchScore}%` : "—"}\n\nTry asking: \"What should I learn next?\" or \"Find internships for me.\"`;
  }

  return answer;
}

function companyNameOf(opportunity: any): string {
  return store.users.find((u) => u.id === opportunity.industryUserId)?.name ?? "";
}

// Program provider helper used by AI answers
function programProvider(id: number): string {
  return store.learningPrograms.find((p) => p.id === id)?.syllabus?.provider ?? "NPTEL";
}

export { programProvider };