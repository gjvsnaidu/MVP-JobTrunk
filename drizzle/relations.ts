import { relations } from "drizzle-orm";
import {
  users,
  institutions,
  industryProfiles,
  academicianProfiles,
  skillCategories,
  skills,
  skillAssessments,
  skillAssessmentQuestions,
  skillAssessmentResults,
  studentSkillProfiles,
  internships,
  jobs,
  learningPrograms,
  applications,
  savedOpportunities,
  facultyOpportunities,
  facultyApplications,
  collaborations,
  collaborationParticipants,
  portfolioItems,
  documents,
  conversations,
  conversationParticipants,
  messages,
  notifications,
  auditLog,
} from "./schema";

// =============================================================================
// User & Identity Relations
// =============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  industryProfile: one(industryProfiles, {
    fields: [users.id],
    references: [industryProfiles.userId],
  }),
  academicianProfile: one(academicianProfiles, {
    fields: [users.id],
    references: [academicianProfiles.userId],
  }),
  skillAssessmentResults: many(skillAssessmentResults),
  skillProfiles: many(studentSkillProfiles),
  internshipListings: many(internships),
  jobListings: many(jobs),
  learningProgramListings: many(learningPrograms),
  applications: many(applications),
  savedOpportunities: many(savedOpportunities),
  facultyOpportunityListings: many(facultyOpportunities),
  facultyApplications: many(facultyApplications),
  collaborationListings: many(collaborations),
  collaborationParticipations: many(collaborationParticipants),
  portfolioItems: many(portfolioItems),
  documents: many(documents),
  sentMessages: many(messages),
  notifications: many(notifications),
  auditEntries: many(auditLog),
}));

export const institutionsRelations = relations(institutions, ({ many }) => ({
  academicianProfiles: many(academicianProfiles),
  collaborations: many(collaborations),
}));

export const industryProfilesRelations = relations(industryProfiles, ({ one }) => ({
  user: one(users, {
    fields: [industryProfiles.userId],
    references: [users.id],
  }),
}));

export const academicianProfilesRelations = relations(academicianProfiles, ({ one }) => ({
  user: one(users, {
    fields: [academicianProfiles.userId],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [academicianProfiles.institutionId],
    references: [institutions.id],
  }),
}));

// =============================================================================
// Skills & Assessment Relations
// =============================================================================

export const skillCategoriesRelations = relations(skillCategories, ({ many }) => ({
  skills: many(skills),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
  category: one(skillCategories, {
    fields: [skills.categoryId],
    references: [skillCategories.id],
  }),
  assessmentQuestions: many(skillAssessmentQuestions),
  studentSkillProfiles: many(studentSkillProfiles),
}));

export const skillAssessmentsRelations = relations(skillAssessments, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [skillAssessments.createdByUserId],
    references: [users.id],
  }),
  questions: many(skillAssessmentQuestions),
  results: many(skillAssessmentResults),
}));

export const skillAssessmentQuestionsRelations = relations(skillAssessmentQuestions, ({ one }) => ({
  assessment: one(skillAssessments, {
    fields: [skillAssessmentQuestions.assessmentId],
    references: [skillAssessments.id],
  }),
  skill: one(skills, {
    fields: [skillAssessmentQuestions.skillId],
    references: [skills.id],
  }),
}));

export const skillAssessmentResultsRelations = relations(skillAssessmentResults, ({ one }) => ({
  user: one(users, {
    fields: [skillAssessmentResults.userId],
    references: [users.id],
  }),
  assessment: one(skillAssessments, {
    fields: [skillAssessmentResults.assessmentId],
    references: [skillAssessments.id],
  }),
}));

export const studentSkillProfilesRelations = relations(studentSkillProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentSkillProfiles.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [studentSkillProfiles.skillId],
    references: [skills.id],
  }),
}));

// =============================================================================
// Opportunity Relations
// =============================================================================

export const internshipsRelations = relations(internships, ({ one }) => ({
  industryUser: one(users, {
    fields: [internships.industryUserId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  industryUser: one(users, {
    fields: [jobs.industryUserId],
    references: [users.id],
  }),
}));

export const learningProgramsRelations = relations(learningPrograms, ({ one }) => ({
  industryUser: one(users, {
    fields: [learningPrograms.industryUserId],
    references: [users.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
}));

export const savedOpportunitiesRelations = relations(savedOpportunities, ({ one }) => ({
  user: one(users, {
    fields: [savedOpportunities.userId],
    references: [users.id],
  }),
}));

// =============================================================================
// Faculty & Collaboration Relations
// =============================================================================

export const facultyOpportunitiesRelations = relations(facultyOpportunities, ({ one, many }) => ({
  postedBy: one(users, {
    fields: [facultyOpportunities.postedByUserId],
    references: [users.id],
  }),
  facultyApplications: many(facultyApplications),
}));

export const facultyApplicationsRelations = relations(facultyApplications, ({ one }) => ({
  user: one(users, {
    fields: [facultyApplications.userId],
    references: [users.id],
  }),
  opportunity: one(facultyOpportunities, {
    fields: [facultyApplications.opportunityId],
    references: [facultyOpportunities.id],
  }),
}));

export const collaborationsRelations = relations(collaborations, ({ one, many }) => ({
  industryUser: one(users, {
    fields: [collaborations.industryUserId],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [collaborations.institutionId],
    references: [institutions.id],
  }),
  participants: many(collaborationParticipants),
}));

export const collaborationParticipantsRelations = relations(collaborationParticipants, ({ one }) => ({
  collaboration: one(collaborations, {
    fields: [collaborationParticipants.collaborationId],
    references: [collaborations.id],
  }),
  user: one(users, {
    fields: [collaborationParticipants.userId],
    references: [users.id],
  }),
}));

// =============================================================================
// Portfolio & Document Relations
// =============================================================================

export const portfolioItemsRelations = relations(portfolioItems, ({ one }) => ({
  user: one(users, {
    fields: [portfolioItems.userId],
    references: [users.id],
  }),
  verifiedByUser: one(users, {
    fields: [portfolioItems.verifiedBy],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

// =============================================================================
// Messaging & Notification Relations
// =============================================================================

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderUserId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// =============================================================================
// Admin Relations
// =============================================================================

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));
