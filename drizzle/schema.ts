import {
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// =============================================================================
// User & Identity Layer
// =============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", [
    "student",
    "industry",
    "academician",
    "institution",
    "admin",
    "user",
  ])
    .default("user")
    .notNull(),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  profileComplete: boolean("profileComplete").default(false).notNull(),
  onboardingComplete: boolean("onboardingComplete").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const institutions = mysqlTable("institutions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["university", "college", "polytechnic", "research_institute", "other"]).default("college").notNull(),
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 500 }),
  description: text("description"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  verified: boolean("verified").default(false).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Institution = typeof institutions.$inferSelect;

export const industryProfiles = mysqlTable("industry_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 128 }),
  website: varchar("website", { length: 500 }),
  description: text("description"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  location: varchar("location", { length: 255 }),
  companySize: mysqlEnum("companySize", ["1-10", "11-50", "51-200", "201-1000", "1001-5000", "5000+"]),
  verified: boolean("verified").default(false).notNull(),
  contactPerson: varchar("contactPerson", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IndustryProfile = typeof industryProfiles.$inferSelect;

export const academicianProfiles = mysqlTable("academician_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  institutionId: int("institutionId").references(() => institutions.id),
  department: varchar("department", { length: 255 }),
  designation: varchar("designation", { length: 255 }),
  specializations: json("specializations"),
  experience: int("experience"),
  bio: text("bio"),
  researchInterests: text("researchInterests"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AcademicianProfile = typeof academicianProfiles.$inferSelect;

// =============================================================================
// Skills & Assessment Engine
// =============================================================================

export const skillCategories = mysqlTable("skill_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SkillCategory = typeof skillCategories.$inferSelect;

export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId")
    .notNull()
    .references(() => skillCategories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  industryDemand: mysqlEnum("industryDemand", ["high", "medium", "low"]).default("medium").notNull(),
  isCore: boolean("isCore").default(false).notNull(),
  tags: json("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Skill = typeof skills.$inferSelect;

export const skillAssessments = mysqlTable("skill_assessments", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdByUserId: int("createdByUserId").references(() => users.id),
  targetRole: mysqlEnum("targetRole", ["student", "all"]).default("all").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  timeLimitMinutes: int("timeLimitMinutes"),
  totalQuestions: int("totalQuestions").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SkillAssessment = typeof skillAssessments.$inferSelect;

export const skillAssessmentQuestions = mysqlTable("skill_assessment_questions", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId")
    .notNull()
    .references(() => skillAssessments.id, { onDelete: "cascade" }),
  skillId: int("skillId")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  questionText: text("questionText").notNull(),
  questionType: mysqlEnum("questionType", ["mcq", "practical", "confidence", "rating"]).default("mcq").notNull(),
  options: json("options"),
  correctAnswer: varchar("correctAnswer", { length: 255 }),
  weight: int("weight").default(1).notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export type SkillAssessmentQuestion = typeof skillAssessmentQuestions.$inferSelect;

export const skillAssessmentResults = mysqlTable("skill_assessment_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assessmentId: int("assessmentId")
    .notNull()
    .references(() => skillAssessments.id, { onDelete: "cascade" }),
  scores: json("scores"),
  totalScore: int("totalScore").default(0).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  durationSeconds: int("durationSeconds"),
  skillLevels: json("skillLevels"),
});

export type SkillAssessmentResult = typeof skillAssessmentResults.$inferSelect;

export const studentSkillProfiles = mysqlTable("student_skill_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  skillId: int("skillId")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  proficiency: mysqlEnum("proficiency", ["beginner", "intermediate", "advanced", "expert"]).default("beginner").notNull(),
  selfScore: int("selfScore"),
  assessedScore: int("assessedScore"),
  verified: boolean("verified").default(false).notNull(),
  verifiedBy: int("verifiedBy").references(() => users.id),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userSkillIdx: uniqueIndex("user_skill_idx").on(table.userId, table.skillId),
}));

export type StudentSkillProfile = typeof studentSkillProfiles.$inferSelect;

// =============================================================================
// Opportunity & Application Layer
// =============================================================================

export const internships = mysqlTable("internships", {
  id: int("id").autoincrement().primaryKey(),
  industryUserId: int("industryUserId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  requirements: json("requirements"),
  duration: varchar("duration", { length: 128 }),
  stipend: varchar("stipend", { length: 128 }),
  location: varchar("location", { length: 255 }),
  type: mysqlEnum("type", ["remote", "hybrid", "onsite"]).default("onsite").notNull(),
  requiredSkillIds: json("requiredSkillIds"),
  status: mysqlEnum("status", ["draft", "open", "closed", "filled"]).default("draft").notNull(),
  deadline: timestamp("deadline"),
  maxApplicants: int("maxApplicants"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Internship = typeof internships.$inferSelect;

export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  industryUserId: int("industryUserId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  requirements: json("requirements"),
  salaryRange: varchar("salaryRange", { length: 128 }),
  location: varchar("location", { length: 255 }),
  type: mysqlEnum("type", ["remote", "hybrid", "onsite"]).default("onsite").notNull(),
  requiredSkillIds: json("requiredSkillIds"),
  experienceLevel: mysqlEnum("experienceLevel", ["entry", "junior", "mid", "senior"]).default("entry").notNull(),
  status: mysqlEnum("status", ["draft", "open", "closed", "filled"]).default("draft").notNull(),
  deadline: timestamp("deadline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;

export const learningPrograms = mysqlTable("learning_programs", {
  id: int("id").autoincrement().primaryKey(),
  industryUserId: int("industryUserId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["certification", "course", "workshop", "mentorship"]).default("course").notNull(),
  duration: varchar("duration", { length: 128 }),
  fee: varchar("fee", { length: 128 }),
  skillIds: json("skillIds"),
  maxParticipants: int("maxParticipants"),
  enrolledCount: int("enrolledCount").default(0).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["draft", "active", "completed", "cancelled"]).default("draft").notNull(),
  syllabus: json("syllabus"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearningProgram = typeof learningPrograms.$inferSelect;

export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  opportunityType: mysqlEnum("opportunityType", ["internship", "job", "learning_program", "faculty"]).notNull(),
  opportunityId: int("opportunityId").notNull(),
  status: mysqlEnum("status", [
    "pending",
    "shortlisted",
    "interview",
    "accepted",
    "rejected",
    "withdrawn",
  ])
    .default("pending")
    .notNull(),
  coverLetter: text("coverLetter"),
  resumeUrl: varchar("resumeUrl", { length: 500 }),
  notes: json("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;

export const savedOpportunities = mysqlTable("saved_opportunities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  opportunityType: mysqlEnum("opportunityType", ["internship", "job", "learning_program"]).notNull(),
  opportunityId: int("opportunityId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userOppIdx: uniqueIndex("user_opp_idx").on(table.userId, table.opportunityType, table.opportunityId),
}));

export type SavedOpportunity = typeof savedOpportunities.$inferSelect;

// =============================================================================
// Faculty & Collaboration Layer
// =============================================================================

export const facultyOpportunities = mysqlTable("faculty_opportunities", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", [
    "faculty_internship",
    "fdp",
    "consultancy",
    "research_project",
    "industrial_training",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  organization: varchar("organization", { length: 255 }),
  postedByUserId: int("postedByUserId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  requirements: json("requirements"),
  duration: varchar("duration", { length: 128 }),
  skillsRequired: json("skillsRequired"),
  location: varchar("location", { length: 255 }),
  status: mysqlEnum("status", ["draft", "open", "closed"]).default("draft").notNull(),
  deadline: timestamp("deadline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FacultyOpportunity = typeof facultyOpportunities.$inferSelect;

export const facultyApplications = mysqlTable("faculty_applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  opportunityId: int("opportunityId")
    .notNull()
    .references(() => facultyOpportunities.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["pending", "shortlisted", "accepted", "rejected", "withdrawn"]).default("pending").notNull(),
  coverLetter: text("coverLetter"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FacultyApplication = typeof facultyApplications.$inferSelect;

export const collaborations = mysqlTable("collaborations", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", [
    "mentorship",
    "workshop",
    "guest_lecture",
    "innovation_challenge",
    "live_project",
  ]).notNull(),
  industryUserId: int("industryUserId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  institutionId: int("institutionId").references(() => institutions.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["planned", "active", "completed", "cancelled"]).default("planned").notNull(),
  maxParticipants: int("maxParticipants"),
  currentParticipants: json("currentParticipants"),
  skills: json("skills"),
  deliverables: json("deliverables"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collaboration = typeof collaborations.$inferSelect;

export const collaborationParticipants = mysqlTable("collaboration_participants", {
  id: int("id").autoincrement().primaryKey(),
  collaborationId: int("collaborationId")
    .notNull()
    .references(() => collaborations.id, { onDelete: "cascade" }),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["organizer", "mentor", "participant"]).default("participant").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["active", "left", "removed"]).default("active").notNull(),
});

export type CollaborationParticipant = typeof collaborationParticipants.$inferSelect;

// =============================================================================
// Portfolio & Documents
// =============================================================================

export const portfolioItems = mysqlTable("portfolio_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", [
    "certification",
    "project",
    "internship",
    "achievement",
    "skill",
    "education",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 500 }),
  issuedBy: varchar("issuedBy", { length: 255 }),
  date: timestamp("date"),
  endDate: timestamp("endDate"),
  verified: boolean("verified").default(false).notNull(),
  verifiedBy: int("verifiedBy").references(() => users.id),
  documentUrl: varchar("documentUrl", { length: 500 }),
  metadata: json("metadata"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortfolioItem = typeof portfolioItems.$inferSelect;

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["resume", "certificate", "transcript", "report", "portfolio"]).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 128 }),
  verified: boolean("verified").default(false).notNull(),
  verifiedBy: int("verifiedBy").references(() => users.id),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;

// =============================================================================
// Messaging & Notifications
// =============================================================================

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["direct", "group", "system"]).default("direct").notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;

export const conversationParticipants = mysqlTable("conversation_participants", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lastReadAt: timestamp("lastReadAt"),
  role: mysqlEnum("role", ["sender", "receiver"]).default("receiver").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (table) => ({
  convUserIdx: uniqueIndex("conv_user_idx").on(table.conversationId, table.userId),
}));

export type ConversationParticipant = typeof conversationParticipants.$inferSelect;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderUserId: int("senderUserId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["text", "file", "system"]).default("text").notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }),
  readBy: json("readBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", [
    "application_update",
    "opportunity_new",
    "message",
    "skill_badge",
    "system",
    "collaboration",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  link: varchar("link", { length: 500 }),
  read: boolean("read").default(false).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// =============================================================================
// Admin & System
// =============================================================================

export const adminSettings = mysqlTable("admin_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: json("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminSetting = typeof adminSettings.$inferSelect;

export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entityType", { length: 64 }).notNull(),
  entityId: int("entityId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLogEntry = typeof auditLog.$inferSelect;
