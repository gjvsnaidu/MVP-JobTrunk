/**
 * In-memory demo store.
 *
 * When no DATABASE_URL is configured, the application runs in "demo mode":
 * every db module and service falls back to functions in ./index.ts, which
 * operate on these in-memory tables seeded from ./seed.ts.
 *
 * This keeps the golden demo fully functional without MySQL — the hackathon
 * default — while real deployments keep using the existing drizzle path.
 *
 * Rows are loosely typed (`any`) because drizzle's MySQL inference marks many
 * nullable columns as required; the demo layer intentionally stays pragmatic.
 */

export const store: Record<string, any[]> = {
  users: [],
  institutions: [],
  industryProfiles: [],
  academicianProfiles: [],
  skillCategories: [],
  skills: [],
  skillAssessments: [],
  skillAssessmentQuestions: [],
  skillAssessmentResults: [],
  studentSkillProfiles: [],
  internships: [],
  jobs: [],
  learningPrograms: [],
  applications: [],
  savedOpportunities: [],
  portfolioItems: [],
  documents: [],
  conversations: [],
  conversationParticipants: [],
  messages: [],
  notifications: [],
  adminSettings: [],
  auditLog: [],
};

/** Auto-increment counters per table, seeded past the last seeded id. */
export const ids: Record<string, number> = {
  users: 0,
  institutions: 0,
  industryProfiles: 0,
  academicianProfiles: 0,
  skillCategories: 0,
  skills: 0,
  skillAssessments: 0,
  skillAssessmentQuestions: 0,
  skillAssessmentResults: 0,
  studentSkillProfiles: 0,
  internships: 0,
  jobs: 0,
  learningPrograms: 0,
  applications: 0,
  savedOpportunities: 0,
  portfolioItems: 0,
  documents: 0,
  conversations: 0,
  conversationParticipants: 0,
  messages: 0,
  notifications: 0,
  adminSettings: 0,
  auditLog: 0,
};

export function nextId(table: string): number {
  ids[table] += 1;
  return ids[table];
}