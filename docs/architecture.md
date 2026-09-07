# JobTrunk — Architecture Schema

A machine-readable + readable description of the JobTrunk architecture: layers, runtime, API surface, data model, and the demo/mock wiring. Meant to be the source of truth you can diff as the codebase evolves.

## 1. System layers

```
Browser (React + Vite SPA)
  │
  ├─ PublicLayout (Landing, demo-login buttons, JobTrunk logo, footer)
  ├─ DashboardLayout (role-based sidebar, topbar, notifications bell)
  ├─ RoleGuard (protects /dashboard, /recruiter, /institution, /admin, /ai)
  │
  │   HTTPS  (session cookie: app_session_id, { httpOnly, path:/, sameSite:{none|lax}, secure } )
  │
Express (server/_core/index.ts)
  │
  ├─ Static/Vite middleware (serves built or dev HTML/JS/CSS)
  ├─ REST routes under /api/ (13 route files)
  ├─ Middleware chain: bodyParser → auth → roleGuard → validate → route handler
  │
Data layer (server/db/*.ts)          Demo fallback layer (server/demo/*.ts)
  │                                     (active when getDb() is null — no DATABASE_URL)
  ├─ users, skills, opportunities,      ├─ in-memory store (Map-like arrays)
  │   portfolio, notifications,         ├─ every db module delegates here when !db
  │   messaging, analytics               ├─ every service delegates here when !db
  ├─ drizzle schema + relations         └─ seeded from server/demo/seed.ts on import
```

## 2. Runtime entry points

### Frontend
- `client/src/main.tsx` → React 19 root, `ThemeContext`, `App.tsx`
- `client/src/App.tsx` — Wouter router; mounts `Landing`, role dashboards, shared pages (`/ai`, `/opportunities/internships/:id`, `/applications`, etc.)
- `client/src/hooks/useRole.ts` — derives `role`, `menuItems`, `isStudent/industry/institution/admin` from `useMe()`
- `client/src/lib/api.ts` — `apiFetch()` (+ React Query hooks per domain)
- `client/src/lib/demoAuth.ts` — one-click `demoLogin(role)` → POST `/api/auth/demo-login` → sets cookie → navigates

### Backend
- `server/_core/index.ts` — Express app factory; mounts static + `/api` routes; health heartbeat
- `server/_core/cookies.ts` — session cookie options; degrades `sameSite` to `lax` over plain HTTP so demo login works on localhost
- `server/_core/env.ts` — env with safe defaults (`JWT_SECRET`, `VITE_APP_ID` fallback so session signing never fails in demo mode)
- `server/_core/sdk.ts` — session token creation/verification (JWT via `jose`)
- `server/db.ts` — `getDb()`; returns MySQL `DrizzleDatabase` when `DATABASE_URL` is set, else `null`
- `server/db/*.ts` — typed query modules; each checks `getDb()` and delegates to `../demo` when null
- `server/services/*.ts` — business logic (matching, skill assessment, career guidance, analytics, notifications, messaging, documents, integration); each delegates to `../demo` when no DB
- `server/middleware/auth.ts` — `getUser(req)` from session; `requireAuth`, `requireRole`
- `server/middleware/validate.ts` — Zod validation middleware
- `server/routes/*.ts` — 13 REST route files mounted under `/api` in `server/routers.ts`

### Demo / mock layer (the MVP's backbone)
- `server/demo/store.ts` — in-memory store + `nextId`
- `server/demo/seed.ts` — `seedDemoData()`: Arjun Sharma (student), Rakesh Menon (industry/AyushTech), institution, ministry admin, skills, assessments, internships, jobs, applications, learning programs, notifications, portfolio
- `server/demo/index.ts` — demo implementations mirroring every db module + service function: `demoComputeGapAnalysis`, `demoMatchForRequired` (+ `skillBreakdown`), `demoMatchStudentToInternships/Jobs/Programs`, `demoCareerRecommendations`, `computeReadinessFromData` (Career Readiness Index 0–100), `demoGenerateCareerGuidance`, `demoComputeAskAI`, `demoGetUserByOpenId`, `demoListInternships`, `demoGetInternshipById`, `demoCreateApplication`, `demoListApplications`, `demoUpdateApplicationStatus`, `demoShortlistCandidate`, `demoListOpportunityCandidates`, `demoInstitutionDashboard`, `demoNationalDashboard`, …

## 3. API surface (selected, MVP-relevant)

### Auth
- `POST /api/auth/demo-login` — { role } → mint session cookie for seeded account → `{ success, role, name, redirect }`
- `GET /api/auth/me` — current user (or null)
- (existing) `POST /api/auth/logout`, onboarding endpoints preserved

### Skills + assessment
- `GET /api/skill-categories`, `GET /api/skills`
- `GET /api/assessments`, `GET /api/assessments/:id`, `POST /api/assessments/:id/submit`
- `GET|POST /api/skill-profile/gap-analysis` — **must be registered before** `/skill-profile/:userId` (Express param route swallows it otherwise)
- `GET /api/skill-profile/:userId`
- `GET /api/skill-assessment-results`

### Opportunities + matching
- `GET /api/internships`, `GET /api/internships/recommended` (data-driven match per student)
- `GET /api/internships/:id`
- `GET /api/jobs`, `GET /api/jobs/recommended`, `GET /api/jobs/:id`
- `POST /api/applications` — apply
- `GET /api/applications/my`
- `PATCH /api/applications/:id/status`
- `GET /api/opportunities/:type/:id/candidates` (recruiter)
- `POST /api/opportunities/:type/:id/candidates/:userId/shortlist` → updates application status

### Career readiness + AI
- `GET /api/student/readiness` → `{ score, category, components[] }` (weighted: skillReadiness 35, assessments 20, projects 15, certifications 10, internships 10, softSkills 10)
- `GET /api/career-guidance` → `{ careerPaths[], gapAnalysis, currentSkills, summary }`
- `GET /api/learning-programs/recommended`
- `POST /api/ai/ask` → `{ question }` → `{ answer }` (mock, data-driven: references gaps/matches/readiness)

### Dashboards
- `GET /api/institution/dashboard` → `{ overview, skillGaps, departmentReadiness, heatmap, placementFunnel, learningRecommendations, … }`
- `GET /api/admin/national-dashboard` → `{ headline, overview, topDemandedSkills, nationalSkillGaps, placementTrends, industryParticipation, emergingCareers, stateDistribution }`

## 4. Key data entities (drizzle schema; same IDs in demo store)

### Users (identity)
- `users` — id, openId, name, email, phone, role (student|industry|institution|admin|academician), loginMethod, profileComplete, onboardingComplete, isActive, createdAt/updatedAt, lastSignedIn

### Profiles / orgs
- `institutions` — id, name, website, location, verified, …
- `industry_profiles` — userId → companyName, industry, website, description, location, companySize, verified, contactPerson
- `academician_profiles` — userId → institutionId, department, designation, expertise, …

### Skills + assessment
- `skill_categories` — id, name, description, icon
- `skills` — id, categoryId, name, industryDemand (low|medium|high), isCore, …
- `skill_assessments` — id, title, description, targetRole, isActive, …
- `questions` — id, assessmentId, skillId, type (mcq|rating|confidence), text, options?, correctAnswer?, weight?, …
- `results` — id, assessmentId, userId, totalScore, …
- `student_skill_profiles` — userId, skillId, proficiency (none|beginner|intermediate|advanced|expert), assessedScore, selfScore, …

### Opportunities
- `internships` — id, industryUserId, companyName, title, description, requiredSkillIds, eligibility (minCGPA, year, eligibleDegrees, note), location, workMode, duration, stipend, deadline, status, …
- `jobs` — id, industryUserId, companyName, title, description, requiredSkillIds, location, workMode, salaryRange, deadline, status, …
- `learning_programs` — id, provider, title, description, skillIds, duration, difficulty, price, status, …

### Applications / portfolio
- `applications` — id, userId, industryUserId, opportunityType, opportunityId, coverLetter, status (pending|screening|shortlisted|interview|accepted|rejected), appliedAt, …
- `portfolio_items` — id, userId, type (project|certification|internship|achievement), title, description, verified, …
- `documents` — id, userId, name, type, fileUrl, status, …

### Analytics / comms
- `notifications` — id, userId, type, title, message, link, read, createdAt
- `conversations`, `conversation_participants`, `messages`
- `collaborations`, `faculty_opportunities`, …

## 5. Golden demo data (the judge-facing story)

| Entity | Key value |
|---|---|
| Student | Arjun Sharma — B.Tech CSE, Adarsh Institute of Technology Pune, CGPA 8.4, 3rd year, career interest = Data Analyst / Healthcare Analytics |
| Top skills (assessed) | Python 82, Problem Solving 84, Communication 70, Data Analytics 70, ML 65, SQL 62 |
| Career Readiness | **78/100 — "Almost Ready"** (Skill Readiness 77, Assessments 78, Projects 85, Certs 85, Internships 70, Soft Skills 77) |
| Biggest gap | **SQL/Databases — 62% → 85% (23% gap)** |
| Recommended learning | SQL for Data Analytics (NPTEL), Python for Data Science, ML Foundations — each tied to a gap/reason |
| Golden internship | Healthcare Data Analytics Intern — AyushTech Innovations, Hybrid, 3 months, ₹15k/month, skills: Python, SQL, Data Analytics, Communication |
| Student ↔ golden internship match | **91%** (Python/Data Analytics/Communication met, SQL needs improvement, eligibility + interest aligned) |
| Recruiter | Rakesh Menon — AyushTech Innovations (industry profile id 10) |
| Institution | Adarsh Institute of Technology, Pune (Dr. Anita Deshpande) |
| Ministry admin | Rajesh Kumar — National Skill Mission |
| Institution dashboard | 10,420 students, 8,920 assessed, 72% internship participation, 76% placement readiness, 103 industry partners; top gaps SQL + Cloud |
| National dashboard | 2.43M students, 1,240 institutions, 8,600 industry partners, 46,200 internships, 214,000 placements, 76.4% placement rate; top gaps SQL + Cloud + Cybersecurity |

## 6. Matching logic (data-driven; not hardcoded per listing)

`demoMatchForRequired(requiredSkillIds, profiles, readiness)` →
- **coverage** = presentRequired / totalRequired
- **skillFit** = mean assessedScore of present required skills
- **score** = round(0.65·coverage + 0.25·skillFit + 0.1·readiness)
- **skillBreakdown[]** = per required skill → `{ name, score, status: "met" | "improve" | "missing" }` where `met` = score ≥ 70, `improve` = present but < 70, `missing` = not in profile

Result is attached to each listing as `matchScore`, `matchedSkills`, `missingSkills`, `skillBreakdown`, `locationMatch`.

## 7. Session / auth notes
- Session cookie name: `app_session_id`
- Signed with `JWT_SECRET` (fallback `"jobtrunk-demo-dev-secret"` when unset)
- `VITE_APP_ID` fallback `"jobtrunk-demo-app"` so the session payload is never empty
- In demo mode, `demo-login` upserts the seeded user and sets a 1-year session cookie

## 8. Environment (optional, safe to leave unset for demo)
- `NODE_ENV` — default `development`
- `PORT` — default 3000 (server auto-advances if busy); this workspace runs on 3100
- `DATABASE_URL` — MySQL; leave unset for in-memory demo mode
- `JWT_SECRET`, `VITE_APP_ID` — fallback values exist
- `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL/KEY`, `SENTIMENT_API_URL`

## 9. Cross-cutting
- **Dark mode** — `ThemeContext` / react-themes; not a mechanical inversion; status + chart legibility preserved
- **Role-based access** — every protected route + write endpoint gated by auth + role
- **No fake external integrations** — learning providers/integrations shown as "Integration Ready"/"Coming Soon", never claimed live
- **No MySQL required** — the entire MVP (including golden demo) runs from `server/demo/*`

## 10. Observer effects / state machines
- Application status machine: `pending → screening → shortlisted → interview → accepted/rejected`
- Recruiter shortlist action updates application status; student's `/applications/my` and detail page re-render the new status
- Readiness + gaps + matches recompute from profile/assessment/opportunity data, not from hardcoded per-page constants

## 11. Source map (by concern)
- `client/src/App.tsx` — routing
- `client/src/hooks/useRole.ts` — role derived state
- `client/src/lib/api.ts` — apiFetch + React Query hooks
- `client/src/lib/demoAuth.ts` — one-click demo login
- `client/src/lib/constants.ts` — role menus (JobTrunk nav)
- `client/src/components/brand/JobTrunkLogo.tsx` — logo + favicon SVG
- `client/src/components/layout/PublicLayout.tsx` — landing shell
- `client/src/components/layout/RoleGuard.tsx` — route protection
- `client/src/components/DashboardLayout.tsx` — dashboard shell + sidebar
- `client/src/pages/Landing.tsx` — public marketing + demo entry
- `client/src/pages/student/Dashboard.tsx` — readiness + career trunk + gaps + matches
- `client/src/pages/shared/OpportunityDetail.tsx` — internship/job detail + apply + skill breakdown
- `client/src/pages/student/Applications.tsx` — timeline + status
- `client/src/pages/student/SkillResults.tsx` — gap section
- `client/src/pages/student/SkillAssessment.tsx` — assessment wizard
- `client/src/pages/industry/Recruiter.tsx` — candidate matching + pipeline
- `client/src/pages/institution/Dashboard.tsx` — institution analytics
- `client/src/pages/admin/Dashboard.tsx` — national dashboard
- `client/src/pages/shared/JobTrunkAI.tsx` — copilot page
- `server/_core/index.ts` — app factory + route mount
- `server/routes/*.ts` — REST endpoints
- `server/db/*.ts` — typed query modules
- `server/services/*.ts` — business logic
- `server/demo/*.ts` — in-memory demo implementations + seed

## 12. Context / scope note
This file describes **this repository as committed to `https://github.com/gjvsnaidu/MVP-JobTrunk` (branch `master`, commit `9070c10`)**, not the wider upstream SkillBridge/Sentix codebase it was rewritten from. If the codebase diverges later, update this file as part of the change.
