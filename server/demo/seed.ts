/**
 * Demo seed data for JobTrunk.
 *
 * Realistic Indian academia–industry demo data. Runs in-memory when no
 * database is configured. IDs are explicit so the golden demo references
 * (skills, internships, users) are deterministic.
 */
import { store, ids } from "./store";

const now = Date.now();
const daysFromNow = (d: number) => new Date(now + d * 24 * 60 * 60 * 1000);

// =============================================================================
// Users — one demo account per role (golden: Arjun Sharma, the student)
// =============================================================================

store.users.push(
  {
    id: 1, openId: "demo_student", name: "Arjun Sharma", email: "arjun.sharma@adarsh.edu.in",
    phone: "+91 98765 43210", loginMethod: "demo", role: "student",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-120), updatedAt: daysFromNow(-1), lastSignedIn: daysFromNow(0),
  },
  {
    id: 2, openId: "demo_student_2", name: "Priya Patel", email: "priya.patel@adarsh.edu.in",
    phone: "+91 98765 43211", loginMethod: "demo", role: "student",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-110), updatedAt: daysFromNow(-2), lastSignedIn: daysFromNow(0),
  },
  {
    id: 3, openId: "demo_student_3", name: "Rahul Kumar", email: "rahul.kumar@adarsh.edu.in",
    phone: "+91 98765 43212", loginMethod: "demo", role: "student",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-105), updatedAt: daysFromNow(-3), lastSignedIn: daysFromNow(0),
  },
  {
    id: 4, openId: "demo_student_4", name: "Sneha Iyer", email: "sneha.iyer@adarsh.edu.in",
    phone: "+91 98765 43213", loginMethod: "demo", role: "student",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-100), updatedAt: daysFromNow(-4), lastSignedIn: daysFromNow(0),
  },
  {
    id: 5, openId: "demo_student_5", name: "Vikram Singh", email: "vikram.singh@adarsh.edu.in",
    phone: "+91 98765 43214", loginMethod: "demo", role: "student",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-95), updatedAt: daysFromNow(-5), lastSignedIn: daysFromNow(0),
  },
  {
    id: 6, openId: "demo_student_6", name: "Ananya Reddy", email: "ananya.reddy@adarsh.edu.in",
    phone: "+91 98765 43215", loginMethod: "demo", role: "student",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-90), updatedAt: daysFromNow(-6), lastSignedIn: daysFromNow(0),
  },
  {
    id: 7, openId: "demo_student_7", name: "Rohit Verma", email: "rohit.verma@adarsh.edu.in",
    phone: "+91 98765 43216", loginMethod: "demo", role: "student",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-85), updatedAt: daysFromNow(-7), lastSignedIn: daysFromNow(0),
  },
  {
    id: 8, openId: "demo_student_8", name: "Meera Nair", email: "meera.nair@adarsh.edu.in",
    phone: "+91 98765 43217", loginMethod: "demo", role: "student",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-80), updatedAt: daysFromNow(-8), lastSignedIn: daysFromNow(0),
  },
  {
    id: 10, openId: "demo_recruiter", name: "Rakesh Menon", email: "rakesh@ayushtech.in",
    phone: "+91 98220 12345", loginMethod: "demo", role: "industry",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-200), updatedAt: daysFromNow(-10), lastSignedIn: daysFromNow(0),
  },
  {
    id: 11, openId: "demo_recruiter_2", name: "Kavita Joshi", email: "kavita@technova.in",
    phone: "+91 98220 12346", loginMethod: "demo", role: "industry",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-190), updatedAt: daysFromNow(-11), lastSignedIn: daysFromNow(0),
  },
  {
    id: 12, openId: "demo_institution", name: "Dr. Anita Deshpande", email: "director@adarsh.edu.in",
    phone: "+91 98220 12347", loginMethod: "demo", role: "institution",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-300), updatedAt: daysFromNow(-12), lastSignedIn: daysFromNow(0),
  },
  {
    id: 13, openId: "demo_admin", name: "Rajesh Kumar", email: "rajesh.kumar@gov.in",
    phone: "+91 98220 12348", loginMethod: "demo", role: "admin",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-400), updatedAt: daysFromNow(-13), lastSignedIn: daysFromNow(0),
  },
  {
    id: 14, openId: "demo_academician", name: "Prof. Meena Krishnan", email: "meena.krishnan@adarsh.edu.in",
    phone: "+91 98220 12349", loginMethod: "demo", role: "academician",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-350), updatedAt: daysFromNow(-14), lastSignedIn: daysFromNow(0),
  },
  {
    id: 15, openId: "demo_recruiter_3", name: "Nikhil Rao", email: "nikhil@cloudnest.io",
    phone: "+91 98220 12350", loginMethod: "demo", role: "industry",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-180), updatedAt: daysFromNow(-15), lastSignedIn: daysFromNow(0),
  },
  {
    id: 16, openId: "demo_recruiter_4", name: "Shreya Shah", email: "shreya@finedge.in",
    phone: "+91 98220 12351", loginMethod: "demo", role: "industry",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-170), updatedAt: daysFromNow(-16), lastSignedIn: daysFromNow(0),
  },
  {
    id: 17, openId: "demo_recruiter_5", name: "Arvind Gupta", email: "arvind@greengrid.in",
    phone: "+91 98220 12352", loginMethod: "demo", role: "industry",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-160), updatedAt: daysFromNow(-17), lastSignedIn: daysFromNow(0),
  },
  {
    id: 18, openId: "demo_recruiter_6", name: "Tanvi Kulkarni", email: "tanvi@codecanvas.design",
    phone: "+91 98220 12353", loginMethod: "demo", role: "industry",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-150), updatedAt: daysFromNow(-18), lastSignedIn: daysFromNow(0),
  },
  {
    id: 19, openId: "demo_platform", name: "JobTrunk Academy", email: "academy@jobtrunk.in",
    phone: "+91 98220 12354", loginMethod: "demo", role: "industry",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-500), updatedAt: daysFromNow(-19), lastSignedIn: daysFromNow(0),
  },
  {
    id: 20, openId: "demo_academician_2", name: "Prof. Rajesh Iyer", email: "rajesh.iyer@adarsh.edu.in",
    phone: "+91 98220 12355", loginMethod: "demo", role: "academician",
    profileComplete: true, onboardingComplete: true, isActive: true,
    createdAt: daysFromNow(-340), updatedAt: daysFromNow(-20), lastSignedIn: daysFromNow(0),
  }
);

// =============================================================================
// Student details — demo-only extension surfaced through /api/profile
// =============================================================================

export type StudentDetails = {
  userId: number;
  institution: string;
  degree: string;
  department: string;
  graduationYear: number;
  cgpa: number;
  careerInterests: string[];
  bio?: string;
};

export const studentDetails: StudentDetails[] = [
  {
    userId: 1, institution: "Adarsh Institute of Technology, Pune", degree: "B.Tech", department: "Computer Science",
    graduationYear: 2027, cgpa: 8.4, careerInterests: ["Data Analyst", "Healthcare Analytics", "Business Intelligence"],
    bio: "Third-year B.Tech CSE student passionate about turning healthcare data into decisions. Strong in Python and problem solving; actively closing my SQL gap.",
  },
  {
    userId: 2, institution: "Adarsh Institute of Technology, Pune", degree: "B.Tech", department: "Computer Science",
    graduationYear: 2027, cgpa: 8.9, careerInterests: ["Data Science", "Machine Learning"],
    bio: "Focused on applied machine learning and statistical modelling.",
  },
  {
    userId: 3, institution: "Adarsh Institute of Technology, Pune", degree: "B.Tech", department: "Electronics & Communication",
    graduationYear: 2027, cgpa: 7.9, careerInterests: ["Data Analytics", "Embedded Systems"],
  },
  {
    userId: 4, institution: "Adarsh Institute of Technology, Pune", degree: "B.Tech", department: "Electronics & Communication",
    graduationYear: 2026, cgpa: 8.1, careerInterests: ["Machine Learning", "Signal Processing"],
  },
  {
    userId: 5, institution: "Adarsh Institute of Technology, Pune", degree: "MBA", department: "Business Analytics",
    graduationYear: 2026, cgpa: 8.0, careerInterests: ["Business Analyst", "Consulting", "Product Management"],
  },
  {
    userId: 6, institution: "Adarsh Institute of Technology, Pune", degree: "B.Tech", department: "Computer Science",
    graduationYear: 2027, cgpa: 8.6, careerInterests: ["AI/ML Engineer", "Data Science"],
  },
  {
    userId: 7, institution: "Adarsh Institute of Technology, Pune", degree: "MBA", department: "Marketing",
    graduationYear: 2026, cgpa: 7.7, careerInterests: ["Digital Marketing", "Brand Management"],
  },
  {
    userId: 8, institution: "Adarsh Institute of Technology, Pune", degree: "B.Tech", department: "Electronics & Communication",
    graduationYear: 2026, cgpa: 8.2, careerInterests: ["Cloud Engineering", "DevOps"],
  },
];

// =============================================================================
// Institutions
// =============================================================================

store.institutions.push({
  id: 12, name: "Adarsh Institute of Technology, Pune", type: "college", location: "Pune, Maharashtra",
  website: "https://adarsh.edu.in", description: "A leading engineering and management institute with 10,000+ students across CSE, ECE and MBA programs.",
  verified: true, contactEmail: "placement@adarsh.edu.in",
  createdAt: daysFromNow(-800), updatedAt: daysFromNow(-30),
});

// =============================================================================
// Industry profiles
// =============================================================================

store.industryProfiles.push(
  {
    id: 1, userId: 10, companyName: "AyushTech Innovations", industry: "Digital Health",
    website: "https://ayushtech.in", description: "Building AI-powered diagnostics and health analytics platforms used by 40+ hospitals across India.",
    location: "Mumbai, Maharashtra", companySize: "51-200", verified: true, contactPerson: "Rakesh Menon",
    createdAt: daysFromNow(-400), updatedAt: daysFromNow(-20),
  },
  {
    id: 2, userId: 11, companyName: "TechNova Solutions", industry: "Enterprise Software",
    website: "https://technova.in", description: "SaaS products for supply chain and logistics, serving 500+ enterprises.",
    location: "Bengaluru, Karnataka", companySize: "201-1000", verified: true, contactPerson: "Kavita Joshi",
    createdAt: daysFromNow(-380), updatedAt: daysFromNow(-20),
  },
  {
    id: 3, userId: 15, companyName: "CloudNest Technologies", industry: "Cloud & DevOps",
    website: "https://cloudnest.io", description: "Managed cloud infrastructure and ML platform services.",
    location: "Hyderabad, Telangana", companySize: "51-200", verified: true, contactPerson: "Nikhil Rao",
    createdAt: daysFromNow(-360), updatedAt: daysFromNow(-20),
  },
  {
    id: 4, userId: 16, companyName: "FinEdge Capital", industry: "Fintech",
    website: "https://finedge.in", description: "Digital lending and wealth analytics for 2M+ customers.",
    location: "Mumbai, Maharashtra", companySize: "201-1000", verified: true, contactPerson: "Shreya Shah",
    createdAt: daysFromNow(-340), updatedAt: daysFromNow(-20),
  },
  {
    id: 5, userId: 17, companyName: "GreenGrid Energy", industry: "CleanTech",
    website: "https://greengrid.in", description: "Solar and energy storage solutions for smart cities.",
    location: "New Delhi", companySize: "51-200", verified: true, contactPerson: "Arvind Gupta",
    createdAt: daysFromNow(-320), updatedAt: daysFromNow(-20),
  },
  {
    id: 6, userId: 18, companyName: "CodeCanvas Studio", industry: "Design & Creative",
    website: "https://codecanvas.design", description: "Product design studio for consumer and enterprise apps.",
    location: "Bengaluru, Karnataka", companySize: "11-50", verified: true, contactPerson: "Tanvi Kulkarni",
    createdAt: daysFromNow(-300), updatedAt: daysFromNow(-20),
  },
  {
    id: 7, userId: 19, companyName: "JobTrunk Learning Academy", industry: "EdTech",
    website: "https://jobtrunk.in", description: "Curated industry-aligned learning programs from NPTEL, SWAYAM, Coursera, Udemy and Skill India.",
    location: "Remote", companySize: "1-10", verified: true, contactPerson: "JobTrunk Team",
    createdAt: daysFromNow(-500), updatedAt: daysFromNow(-20),
  }
);

// =============================================================================
// Academician profiles — doubles as the institution roster (students + faculty)
// =============================================================================

store.academicianProfiles.push(
  { id: 1, userId: 1, institutionId: 12, department: "Computer Science", designation: "Student", experience: 0, bio: "B.Tech CSE, 3rd year", createdAt: daysFromNow(-100), updatedAt: daysFromNow(-1) },
  { id: 2, userId: 2, institutionId: 12, department: "Computer Science", designation: "Student", experience: 0, bio: "B.Tech CSE, 3rd year", createdAt: daysFromNow(-100), updatedAt: daysFromNow(-1) },
  { id: 3, userId: 3, institutionId: 12, department: "Electronics & Communication", designation: "Student", experience: 0, bio: "B.Tech ECE, 3rd year", createdAt: daysFromNow(-100), updatedAt: daysFromNow(-1) },
  { id: 4, userId: 4, institutionId: 12, department: "Electronics & Communication", designation: "Student", experience: 0, bio: "B.Tech ECE, 3rd year", createdAt: daysFromNow(-100), updatedAt: daysFromNow(-1) },
  { id: 5, userId: 5, institutionId: 12, department: "Business Analytics", designation: "Student", experience: 0, bio: "MBA, 2nd year", createdAt: daysFromNow(-100), updatedAt: daysFromNow(-1) },
  { id: 6, userId: 6, institutionId: 12, department: "Computer Science", designation: "Student", experience: 0, bio: "B.Tech CSE, 3rd year", createdAt: daysFromNow(-100), updatedAt: daysFromNow(-1) },
  { id: 7, userId: 7, institutionId: 12, department: "Marketing", designation: "Student", experience: 0, bio: "MBA, 2nd year", createdAt: daysFromNow(-100), updatedAt: daysFromNow(-1) },
  { id: 8, userId: 8, institutionId: 12, department: "Electronics & Communication", designation: "Student", experience: 0, bio: "B.Tech ECE, 3rd year", createdAt: daysFromNow(-100), updatedAt: daysFromNow(-1) },
  { id: 9, userId: 14, institutionId: 12, department: "Computer Science", designation: "Assistant Professor", experience: 9, bio: "ML & Data Science researcher", createdAt: daysFromNow(-300), updatedAt: daysFromNow(-10) },
  { id: 10, userId: 20, institutionId: 12, department: "Electronics & Communication", designation: "Professor", experience: 18, bio: "VLSI & embedded systems", createdAt: daysFromNow(-320), updatedAt: daysFromNow(-10) }
);

// =============================================================================
// Skill categories
// =============================================================================

store.skillCategories.push(
  { id: 1, name: "Programming & Development", description: "Coding, software and platform skills", icon: "code", sortOrder: 1, createdAt: daysFromNow(-400) },
  { id: 2, name: "Data Science & Analytics", description: "Data, statistics and machine learning", icon: "database", sortOrder: 2, createdAt: daysFromNow(-400) },
  { id: 3, name: "Design & Creative", description: "UI/UX, visual and product design", icon: "palette", sortOrder: 3, createdAt: daysFromNow(-400) },
  { id: 4, name: "Communication & Soft Skills", description: "Communication, teamwork and problem solving", icon: "message-circle", sortOrder: 4, createdAt: daysFromNow(-400) },
  { id: 5, name: "Business & Management", description: "Business, product and management skills", icon: "briefcase", sortOrder: 5, createdAt: daysFromNow(-400) },
  { id: 6, name: "Domain-Specific", description: "Industry domain expertise", icon: "target", sortOrder: 6, createdAt: daysFromNow(-400) }
);

// =============================================================================
// Skills — fixed IDs referenced by internships/jobs/profiles
// =============================================================================

const S = (id: number, categoryId: number, name: string, industryDemand: "high" | "medium" | "low", isCore: boolean, description?: string) =>
  ({ id, categoryId, name, industryDemand, isCore, description: description ?? `${name} — ${industryDemand} industry demand`, createdAt: daysFromNow(-400) });

store.skills.push(
  S(1, 1, "Python", "high", true, "Python programming for data analysis, automation and backend work"),
  S(2, 2, "SQL/Databases", "high", true, "Writing queries, joins, aggregations and database design"),
  S(3, 2, "Machine Learning", "high", false, "Supervised and unsupervised ML models"),
  S(4, 4, "Communication", "high", true, "Clear professional written and verbal communication"),
  S(5, 4, "Problem Solving", "high", true, "Structured analytical problem solving"),
  S(6, 2, "Data Analytics", "high", true, "Turning raw data into actionable insight"),
  S(7, 2, "Data Visualization", "medium", false, "Charts, dashboards and storytelling with data"),
  S(8, 1, "Cloud Computing", "high", false, "AWS/Azure/GCP fundamentals and services"),
  S(9, 1, "JavaScript/TypeScript", "high", false, "Modern JS/TS development"),
  S(10, 1, "React.js", "high", false, "Building interactive user interfaces with React"),
  S(11, 1, "Node.js", "high", false, "Server-side JavaScript development"),
  S(12, 2, "Statistics", "medium", false, "Probability, hypothesis testing and inference"),
  S(13, 4, "Team Collaboration", "high", true, "Working effectively in cross-functional teams"),
  S(14, 5, "Leadership", "high", false, "Leading teams and initiatives"),
  S(15, 5, "Project Management", "high", false, "Planning, executing and delivering projects"),
  S(16, 6, "Cybersecurity", "high", false, "Security fundamentals and secure development"),
  S(17, 3, "UI/UX Design", "high", false, "User research, wireframes and interaction design"),
  S(18, 1, "Git/Version Control", "high", false, "Git workflows and collaboration"),
  S(19, 4, "Public Speaking", "medium", false, "Presenting confidently to groups"),
  S(20, 6, "Healthcare IT", "medium", false, "Health systems, EHRs and health data standards"),
  S(21, 5, "Digital Marketing", "medium", false, "SEO, content and campaign marketing"),
  S(22, 5, "Product Management", "high", false, "Product discovery, roadmaps and delivery"),
  S(23, 1, "DevOps/CI-CD", "medium", false, "Automation, pipelines and infrastructure"),
  S(24, 2, "Excel & Spreadsheets", "medium", false, "Modelling and analysis with spreadsheets"),
  S(25, 5, "Financial Analysis", "medium", false, "Financial modelling and analysis"),
  S(26, 2, "Big Data Technologies", "medium", false, "Spark, Hadoop and large-scale data"),
  S(27, 2, "TensorFlow/PyTorch", "high", false, "Deep learning frameworks"),
  S(28, 2, "R Programming", "low", false, "Statistical computing with R"),
  S(29, 5, "Business Development", "medium", false, "Partnerships, sales and growth"),
  S(30, 5, "Agile/Scrum", "high", false, "Agile practices and Scrum ceremonies")
);

// =============================================================================
// Student skill profiles — Arjun's golden numbers drive the 91% match
// =============================================================================

const prof = (userId: number, skillId: number, proficiency: "beginner" | "intermediate" | "advanced" | "expert", assessedScore: number, verified = false) =>
  ({ userId, skillId, proficiency, assessedScore, selfScore: assessedScore, verified, updatedAt: daysFromNow(-2) });

let pid = 1;
store.studentSkillProfiles.push(
  // Arjun (1) — golden student
  prof(1, 1, "advanced", 82, true),  // Python
  prof(1, 2, "intermediate", 62, true), // SQL — biggest gap
  prof(1, 3, "advanced", 65, true),  // ML
  prof(1, 4, "advanced", 70, true),  // Communication
  prof(1, 5, "advanced", 84, true),  // Problem Solving
  prof(1, 6, "intermediate", 70, true), // Data Analytics
  prof(1, 12, "intermediate", 60, false), // Statistics
  prof(1, 13, "advanced", 78, false), // Team Collaboration
  prof(1, 7, "intermediate", 58, false), // Data Visualization
  // Priya (2)
  prof(2, 1, "advanced", 70), prof(2, 2, "intermediate", 60), prof(2, 6, "intermediate", 64), prof(2, 4, "advanced", 70),
  prof(2, 3, "advanced", 78), prof(2, 5, "advanced", 80), prof(2, 12, "advanced", 72),
  // Rahul (3)
  prof(3, 1, "advanced", 75), prof(3, 6, "intermediate", 68), prof(3, 4, "advanced", 70), prof(3, 5, "intermediate", 62), prof(3, 19, "intermediate", 55),
  // Sneha (4)
  prof(4, 1, "advanced", 72), prof(4, 3, "advanced", 74), prof(4, 12, "intermediate", 60), prof(4, 5, "advanced", 76),
  // Vikram (5)
  prof(5, 24, "intermediate", 58), prof(5, 6, "intermediate", 60), prof(5, 4, "advanced", 72), prof(5, 15, "intermediate", 55), prof(5, 25, "intermediate", 62),
  // Ananya (6)
  prof(6, 1, "advanced", 80), prof(6, 3, "advanced", 82), prof(6, 27, "advanced", 74), prof(6, 12, "advanced", 78), prof(6, 5, "advanced", 82),
  // Rohit (7)
  prof(7, 21, "intermediate", 62), prof(7, 4, "advanced", 74), prof(7, 19, "advanced", 70), prof(7, 14, "intermediate", 58),
  // Meera (8)
  prof(8, 8, "advanced", 76), prof(8, 23, "intermediate", 62), prof(8, 1, "intermediate", 60), prof(8, 18, "advanced", 70), prof(8, 11, "intermediate", 58)
);
store.studentSkillProfiles.forEach((p) => { (p as any).id = pid++; });

// =============================================================================
// Assessments — the interactive Career Readiness Assessment (14 questions)
// =============================================================================

store.skillAssessments.push({
  id: 1, title: "JobTrunk Career Readiness Assessment",
  description: "A 14-question assessment across technical skills, aptitude, communication, problem solving and domain knowledge. Your answers generate your skill profile and Career Readiness Index.",
  createdByUserId: 13, targetRole: "student", isActive: true, timeLimitMinutes: 20, totalQuestions: 14,
  createdAt: daysFromNow(-90), updatedAt: daysFromNow(-90),
});

const Q = (id: number, skillId: number, questionText: string, questionType: "mcq" | "practical" | "confidence" | "rating", options: string[] | null, correctAnswer: string | null, weight: number, difficulty: "easy" | "medium" | "hard", sortOrder: number) =>
  ({ id, assessmentId: 1, skillId, questionText, questionType, options, correctAnswer, weight, difficulty, sortOrder });

store.skillAssessmentQuestions.push(
  Q(1, 1, "Which keyword is used to define a function in Python?", "mcq", ["function", "def", "func", "define"], "def", 1, "easy", 1),
  Q(2, 1, "What does len([10, 20, 30]) return in Python?", "mcq", ["2", "3", "30", "Error"], "3", 1, "easy", 2),
  Q(3, 1, "Rate your confidence writing Python code for data analysis.", "confidence", null, null, 1, "medium", 3),
  Q(4, 2, "Which SQL clause is used to filter rows?", "mcq", ["WHERE", "GROUP BY", "ORDER BY", "HAVING"], "WHERE", 1, "easy", 4),
  Q(5, 2, "Which SQL function counts the number of rows?", "mcq", ["COUNT()", "SUM()", "AVG()", "TOTAL()"], "COUNT()", 1, "easy", 5),
  Q(6, 2, "Rate your confidence writing SQL queries with joins and aggregations.", "confidence", null, null, 1, "medium", 6),
  Q(7, 3, "Which algorithm is typically used for binary classification?", "mcq", ["Linear Regression", "Logistic Regression", "K-Means", "Apriori"], "Logistic Regression", 1, "medium", 7),
  Q(8, 3, "Rate your confidence evaluating machine learning model performance.", "confidence", null, null, 1, "medium", 8),
  Q(9, 6, "Which tool is commonly used for interactive data visualization?", "mcq", ["Tableau", "Photoshop", "AutoCAD", "Wireshark"], "Tableau", 1, "easy", 9),
  Q(10, 6, "Rate your confidence interpreting dashboards and charts to make decisions.", "confidence", null, null, 1, "medium", 10),
  Q(11, 4, "Which is a key element of effective professional communication?", "mcq", ["Active listening", "Speaking loudly", "Avoiding questions", "Using jargon"], "Active listening", 1, "easy", 11),
  Q(12, 4, "Rate your confidence presenting your work to an unfamiliar audience.", "confidence", null, null, 1, "medium", 12),
  Q(13, 5, "What is the first step in structured problem solving?", "mcq", ["Define the problem", "Jump to a solution", "Blame the user", "Ignore edge cases"], "Define the problem", 1, "easy", 13),
  Q(14, 5, "Rate your confidence breaking down complex problems into smaller parts.", "confidence", null, null, 1, "medium", 14)
);

// Seed assessment result for Arjun — a prior attempt with 78/100
store.skillAssessmentResults.push({
  id: 1, userId: 1, assessmentId: 1,
  scores: [
    { skillId: 1, skillName: "Python", score: 82, level: "advanced", weight: 3 },
    { skillId: 2, skillName: "SQL/Databases", score: 62, level: "intermediate", weight: 3 },
    { skillId: 3, skillName: "Machine Learning", score: 65, level: "advanced", weight: 2 },
    { skillId: 6, skillName: "Data Analytics", score: 70, level: "intermediate", weight: 2 },
    { skillId: 4, skillName: "Communication", score: 70, level: "advanced", weight: 2 },
    { skillId: 5, skillName: "Problem Solving", score: 84, level: "advanced", weight: 2 },
  ],
  totalScore: 78, completedAt: daysFromNow(-7), durationSeconds: 780,
  skillLevels: { 1: "advanced", 2: "intermediate", 3: "advanced", 4: "advanced", 5: "advanced", 6: "intermediate" },
});

// Extra assessment results + portfolio for supporting demo students so the
// recruiter candidate view shows meaningful readiness/experience numbers.
store.skillAssessmentResults.push(
  {
    id: 2, userId: 2, assessmentId: 1,
    scores: [
      { skillId: 1, skillName: "Python", score: 70, level: "advanced", weight: 3 },
      { skillId: 2, skillName: "SQL/Databases", score: 60, level: "intermediate", weight: 3 },
      { skillId: 6, skillName: "Data Analytics", score: 64, level: "intermediate", weight: 2 },
      { skillId: 4, skillName: "Communication", score: 70, level: "advanced", weight: 2 },
      { skillId: 5, skillName: "Problem Solving", score: 80, level: "advanced", weight: 2 },
      { skillId: 3, skillName: "Machine Learning", score: 78, level: "advanced", weight: 2 },
    ],
    totalScore: 84, completedAt: daysFromNow(-5), durationSeconds: 820,
    skillLevels: { 1: "advanced", 2: "intermediate", 3: "advanced", 4: "advanced", 5: "advanced", 6: "intermediate" },
  },
  {
    id: 3, userId: 3, assessmentId: 1,
    scores: [
      { skillId: 1, skillName: "Python", score: 75, level: "advanced", weight: 3 },
      { skillId: 6, skillName: "Data Analytics", score: 68, level: "intermediate", weight: 2 },
      { skillId: 4, skillName: "Communication", score: 70, level: "advanced", weight: 2 },
      { skillId: 5, skillName: "Problem Solving", score: 62, level: "intermediate", weight: 2 },
    ],
    totalScore: 76, completedAt: daysFromNow(-4), durationSeconds: 790,
    skillLevels: { 1: "advanced", 6: "intermediate", 4: "advanced", 5: "intermediate" },
  }
);
store.portfolioItems.push(
  { id: 20, userId: 2, type: "project", title: "Churn Prediction Model", description: "Logistic regression model with 84% accuracy for a telecom dataset.", issuedBy: "Self", verified: true, date: daysFromNow(-70), sortOrder: 0, createdAt: daysFromNow(-70) },
  { id: 21, userId: 2, type: "certification", title: "ML Specialization", description: "DeepLearning.AI certification.", issuedBy: "Coursera", verified: true, date: daysFromNow(-90), sortOrder: 1, createdAt: daysFromNow(-90) },
  { id: 22, userId: 3, type: "project", title: "Sales Dashboard", description: "Interactive dashboard for a retail client built in Power BI.", issuedBy: "Self", verified: true, date: daysFromNow(-60), sortOrder: 0, createdAt: daysFromNow(-60) },
  { id: 23, userId: 3, type: "internship", title: "Analytics Intern", description: "Summer analytics internship.", issuedBy: "Metro Retail", verified: true, date: daysFromNow(-140), sortOrder: 1, createdAt: daysFromNow(-140) }
);
store.skillAssessmentResults.forEach((r) => { (r as any).id = r.id; });

// =============================================================================
// Internships — id 1 is the golden "Healthcare Data Analytics Intern"
// =============================================================================

store.internships.push(
  {
    id: 1, industryUserId: 10, title: "Healthcare Data Analytics Intern",
    description: "Work with our clinical analytics team to analyse patient outcome data, build health dashboards and support AI-driven diagnostics. You will learn directly from data scientists and clinicians, and ship real dashboards used by hospitals.",
    requirements: { minCGPA: 6.5, eligibleDegrees: ["B.Tech CSE", "B.Tech ECE", "MCA", "B.Sc Statistics"], year: "3rd year or above", note: "Healthcare domain exposure is a plus" },
    duration: "3 Months", stipend: "₹15,000/month", location: "Hybrid", type: "hybrid",
    requiredSkillIds: [1, 2, 6, 4], status: "open", deadline: daysFromNow(25), maxApplicants: 8,
    createdAt: daysFromNow(-15), updatedAt: daysFromNow(-1),
  },
  {
    id: 2, industryUserId: 11, title: "Data Science Intern",
    description: "Join TechNova's data science pod building forecasting models for supply chain clients. Strong Python and statistics required; mentorship from senior data scientists.",
    requirements: { minCGPA: 7.0, eligibleDegrees: ["B.Tech", "MCA"], year: "3rd year or above" },
    duration: "6 Months", stipend: "₹12,000/month", location: "Remote", type: "remote",
    requiredSkillIds: [1, 3, 12], status: "open", deadline: daysFromNow(20), maxApplicants: 6,
    createdAt: daysFromNow(-12), updatedAt: daysFromNow(-1),
  },
  {
    id: 3, industryUserId: 11, title: "Full-Stack Developer Intern",
    description: "Build customer-facing features across our React + Node stack. You will own small features end-to-end with code review from senior engineers.",
    requirements: { minCGPA: 6.0, eligibleDegrees: ["B.Tech", "MCA"], year: "2nd year or above" },
    duration: "4 Months", stipend: "₹18,000/month", location: "Bengaluru", type: "onsite",
    requiredSkillIds: [9, 10, 11, 18], status: "open", deadline: daysFromNow(18), maxApplicants: 5,
    createdAt: daysFromNow(-10), updatedAt: daysFromNow(-1),
  },
  {
    id: 4, industryUserId: 15, title: "AI/ML Research Intern",
    description: "Research and prototype LLM-powered document intelligence with our applied ML team. Publication-adjacent work with strong compute access.",
    requirements: { minCGPA: 8.0, eligibleDegrees: ["B.Tech", "M.Tech"], year: "3rd year or above" },
    duration: "3 Months", stipend: "₹20,000/month", location: "Hybrid", type: "hybrid",
    requiredSkillIds: [1, 3, 12], status: "open", deadline: daysFromNow(30), maxApplicants: 4,
    createdAt: daysFromNow(-9), updatedAt: daysFromNow(-1),
  },
  {
    id: 5, industryUserId: 15, title: "Cloud Engineering Intern",
    description: "Automate infrastructure, build CI/CD pipelines and operate multi-tenant Kubernetes clusters with the platform team.",
    requirements: { minCGPA: 6.5, eligibleDegrees: ["B.Tech"], year: "3rd year or above" },
    duration: "6 Months", stipend: "₹18,000/month", location: "Remote", type: "remote",
    requiredSkillIds: [8, 23, 1], status: "open", deadline: daysFromNow(22), maxApplicants: 6,
    createdAt: daysFromNow(-8), updatedAt: daysFromNow(-1),
  },
  {
    id: 6, industryUserId: 16, title: "Business Analyst Intern",
    description: "Analyse transaction data, build credit-risk dashboards and support product decisions at a fast-growing digital lender.",
    requirements: { minCGPA: 6.5, eligibleDegrees: ["B.Tech", "MBA", "B.Com"], year: "3rd year or above" },
    duration: "3 Months", stipend: "₹15,000/month", location: "Mumbai", type: "onsite",
    requiredSkillIds: [6, 2, 24, 4], status: "open", deadline: daysFromNow(15), maxApplicants: 7,
    createdAt: daysFromNow(-7), updatedAt: daysFromNow(-1),
  },
  {
    id: 7, industryUserId: 17, title: "Digital Marketing Intern",
    description: "Run campaigns for our clean energy products, write content and analyse channel performance with the growth team.",
    requirements: { minCGPA: 6.0, eligibleDegrees: ["MBA", "Any"], year: "2nd year or above" },
    duration: "3 Months", stipend: "₹8,000/month", location: "Remote", type: "remote",
    requiredSkillIds: [21, 4, 19], status: "open", deadline: daysFromNow(14), maxApplicants: 10,
    createdAt: daysFromNow(-6), updatedAt: daysFromNow(-1),
  },
  {
    id: 9, industryUserId: 10, title: "Clinical Data Quality Intern",
    description: "Audit and clean clinical data pipelines at our partner hospitals; ensure accuracy for analytics downstream.",
    requirements: { minCGPA: 6.5, eligibleDegrees: ["B.Tech", "B.Sc"], year: "3rd year or above" },
    duration: "3 Months", stipend: "₹12,000/month", location: "Mumbai", type: "onsite",
    requiredSkillIds: [2, 6, 20], status: "open", deadline: daysFromNow(26), maxApplicants: 6,
    createdAt: daysFromNow(-4), updatedAt: daysFromNow(-1),
  },
  {
    id: 10, industryUserId: 10, title: "Health Informatics Intern",
    description: "Support EHR interoperability projects and health data standards work with our platform team.",
    requirements: { minCGPA: 6.0, eligibleDegrees: ["B.Tech", "MCA"], year: "3rd year or above" },
    duration: "6 Months", stipend: "₹15,000/month", location: "Hybrid", type: "hybrid",
    requiredSkillIds: [20, 6, 1, 4], status: "open", deadline: daysFromNow(32), maxApplicants: 5,
    createdAt: daysFromNow(-3), updatedAt: daysFromNow(-1),
  },
  {
    id: 8, industryUserId: 18, title: "UI/UX Design Intern",
    description: "Design user flows, wireframes and polished UI for consumer and enterprise products. Strong portfolio culture with direct mentor feedback.",
    requirements: { minCGPA: 6.0, eligibleDegrees: ["B.Tech", "B.Des", "Any"], year: "2nd year or above" },
    duration: "3 Months", stipend: "₹10,000/month", location: "Hybrid", type: "hybrid",
    requiredSkillIds: [17, 4], status: "open", deadline: daysFromNow(28), maxApplicants: 8,
    createdAt: daysFromNow(-5), updatedAt: daysFromNow(-1),
  }
);

// =============================================================================
// Jobs
// =============================================================================

store.jobs.push(
  {
    id: 1, industryUserId: 16, title: "Data Analyst (Entry Level)", description: "Build analytics products for our lending platform: pipelines, dashboards and insights for credit decisions.",
    requirements: { minCGPA: 6.5, eligibleDegrees: ["B.Tech", "MCA", "B.Sc"], year: "Final year or graduate" },
    salaryRange: "₹6 LPA", location: "Mumbai", type: "onsite", requiredSkillIds: [1, 2, 6, 4],
    experienceLevel: "entry", status: "open", deadline: daysFromNow(35), createdAt: daysFromNow(-20), updatedAt: daysFromNow(-1),
  },
  {
    id: 2, industryUserId: 15, title: "Junior Data Scientist", description: "Work on ML models powering document intelligence products. Strong Python and statistics required.",
    requirements: { minCGPA: 7.5, eligibleDegrees: ["B.Tech", "M.Tech"], year: "Final year or graduate" },
    salaryRange: "₹8 LPA", location: "Hyderabad", type: "hybrid", requiredSkillIds: [1, 3, 12],
    experienceLevel: "entry", status: "open", deadline: daysFromNow(40), createdAt: daysFromNow(-18), updatedAt: daysFromNow(-1),
  },
  {
    id: 3, industryUserId: 11, title: "Junior Software Engineer", description: "Ship features across our React/Node stack with strong engineering mentorship.",
    requirements: { minCGPA: 6.5, eligibleDegrees: ["B.Tech", "MCA"], year: "Final year or graduate" },
    salaryRange: "₹7 LPA", location: "Bengaluru", type: "onsite", requiredSkillIds: [9, 10, 11, 18],
    experienceLevel: "entry", status: "open", deadline: daysFromNow(32), createdAt: daysFromNow(-16), updatedAt: daysFromNow(-1),
  },
  {
    id: 4, industryUserId: 15, title: "Machine Learning Engineer", description: "Deploy and maintain production ML services; strong deep learning framework experience expected.",
    requirements: { minCGPA: 8.0, eligibleDegrees: ["B.Tech", "M.Tech"], year: "Graduate" },
    salaryRange: "₹14 LPA", location: "Hyderabad", type: "hybrid", requiredSkillIds: [1, 3, 27],
    experienceLevel: "junior", status: "open", deadline: daysFromNow(45), createdAt: daysFromNow(-14), updatedAt: daysFromNow(-1),
  },
  {
    id: 6, industryUserId: 10, title: "Healthcare Data Analyst",
    description: "Own analytics for our diagnostics platform: patient cohort analysis, dashboards and insight reporting for hospital partners.",
    requirements: { minCGPA: 6.5, eligibleDegrees: ["B.Tech", "MCA"], year: "Final year or graduate" },
    salaryRange: "₹7 LPA", location: "Hybrid", type: "hybrid", requiredSkillIds: [1, 2, 6, 20],
    experienceLevel: "entry", status: "open", deadline: daysFromNow(40), createdAt: daysFromNow(-11), updatedAt: daysFromNow(-1),
  },
  {
    id: 5, industryUserId: 17, title: "Growth Marketing Associate", description: "Own channel marketing for our clean energy brands and measure everything.",
    requirements: { minCGPA: 6.0, eligibleDegrees: ["MBA", "Any"], year: "Graduate" },
    salaryRange: "₹5 LPA", location: "New Delhi", type: "remote", requiredSkillIds: [21, 4],
    experienceLevel: "entry", status: "open", deadline: daysFromNow(38), createdAt: daysFromNow(-12), updatedAt: daysFromNow(-1),
  }
);

// =============================================================================
// Learning programs — providers per the JobTrunk learning hub spec
// =============================================================================

const prog = (id: number, title: string, provider: string, category: "certification" | "course" | "workshop" | "mentorship", duration: string, fee: string, skillIds: number[], enrolledCount: number, description: string) =>
  ({ id, industryUserId: 19, title, description, category, duration, fee, skillIds, maxParticipants: 500, enrolledCount, status: "active" as const, startDate: daysFromNow(10), endDate: daysFromNow(70), createdAt: daysFromNow(-40), updatedAt: daysFromNow(-1), syllabus: { provider } });

store.learningPrograms.push(
  prog(1, "SQL for Data Analytics", "NPTEL", "course", "8 weeks", "Free", [2], 1240, "Master SQL from basics to analytical queries — recommended because SQL is the most common skill gap among analytics aspirants."),
  prog(2, "Python for Data Science", "SWAYAM", "course", "12 weeks", "Free", [1], 3420, "A comprehensive Python course covering NumPy, pandas and data wrangling."),
  prog(3, "Machine Learning Foundations", "Coursera", "course", "6 weeks", "₹3,499", [3, 12], 2100, "Supervised and unsupervised learning with hands-on assignments."),
  prog(4, "Data Visualization with Tableau", "Udemy", "course", "10 hours", "₹1,299", [7, 6], 860, "Build compelling dashboards and learn storytelling with data."),
  prog(5, "Communication for Professionals", "Skill India", "workshop", "2 days", "Free", [4, 19], 1520, "Workshop on professional communication, presentations and interviews."),
  prog(6, "Cloud Computing Fundamentals", "AWS Academy", "certification", "4 weeks", "Free", [8], 980, "Cloud concepts, core services and certification track."),
  prog(7, "Statistics & Probability", "NPTEL", "course", "8 weeks", "Free", [12], 640, "The statistical foundations every data professional needs."),
  prog(8, "Agile & Scrum Essentials", "Coursera", "certification", "4 weeks", "₹2,499", [30], 430, "Agile principles and Scrum framework for product teams.")
);

// =============================================================================
// Applications — other students applied to the golden internship already
// =============================================================================

store.applications.push(
  { id: 1, userId: 2, opportunityType: "internship", opportunityId: 1, status: "pending", coverLetter: "I am excited to apply my ML coursework to real health data.", resumeUrl: "/demo/resume-priya.pdf", createdAt: daysFromNow(-3), updatedAt: daysFromNow(-3) },
  { id: 2, userId: 3, opportunityType: "internship", opportunityId: 1, status: "pending", coverLetter: "Analytics is where I want to grow; this role fits perfectly.", resumeUrl: "/demo/resume-rahul.pdf", createdAt: daysFromNow(-2), updatedAt: daysFromNow(-2) },
  { id: 3, userId: 4, opportunityType: "internship", opportunityId: 2, status: "pending", coverLetter: "", resumeUrl: "/demo/resume-sneha.pdf", createdAt: daysFromNow(-4), updatedAt: daysFromNow(-4) },
  { id: 4, userId: 5, opportunityType: "internship", opportunityId: 3, status: "shortlisted", coverLetter: "Full-stack is my goal; I have shipped two projects in React.", resumeUrl: "/demo/resume-vikram.pdf", createdAt: daysFromNow(-6), updatedAt: daysFromNow(-1) },
  { id: 5, userId: 6, opportunityType: "internship", opportunityId: 4, status: "interview", coverLetter: "My research experience aligns with this role.", resumeUrl: "/demo/resume-ananya.pdf", createdAt: daysFromNow(-5), updatedAt: daysFromNow(-1) },
  { id: 6, userId: 8, opportunityType: "internship", opportunityId: 6, status: "accepted", coverLetter: "Strong finance-domain interest and analytics skills.", resumeUrl: "/demo/resume-meera.pdf", createdAt: daysFromNow(-8), updatedAt: daysFromNow(-1) }
);

// =============================================================================
// Portfolio — Arjun's impressive digital portfolio
// =============================================================================

const pitem = (id: number, type: "certification" | "project" | "internship" | "achievement" | "skill" | "education", title: string, description: string, issuedBy: string, verified: boolean, dateOffset: number) =>
  ({ id, userId: 1, type, title, description, issuedBy, verified, date: daysFromNow(dateOffset), sortOrder: id, createdAt: daysFromNow(dateOffset) });

store.portfolioItems.push(
  pitem(1, "project", "Healthcare Data Analytics Dashboard", "Built an interactive dashboard analysing 50k+ patient records using Python, pandas and Tableau; surfaced insights adopted by a hospital admin team.", "Self / AyushTech case study", true, -60),
  pitem(2, "project", "Retail Sales Forecasting with ML", "Trained XGBoost and linear models on 2 years of retail sales; achieved 12% improvement in forecast accuracy.", "Self", true, -90),
  pitem(3, "certification", "Python for Data Science", "Completed 12-week NPTEL certification with 89% score.", "NPTEL", true, -120),
  pitem(4, "certification", "SQL Fundamentals", "Completed Coursera SQL specialization covering queries, joins and window functions.", "Coursera", true, -100),
  pitem(5, "internship", "Summer Research Intern — Analytics", "Analysed patient outcome data at a 300-bed hospital; built weekly reporting automation in Python.", "CityCare Hospital", true, -150),
  pitem(6, "education", "B.Tech Computer Science — Adarsh Institute of Technology", "Third year, CGPA 8.4/10. Core coursework: DSA, Databases, Machine Learning, Statistics.", "Adarsh Institute of Technology", true, -800),
  pitem(7, "achievement", "Smart India Hackathon 2025 — Winner", "Won national hackathon building a telemedicine triage prototype with a team of five.", "Ministry of Education", true, -45)
);

// =============================================================================
// Documents — resume + certificates for Arjun
// =============================================================================

store.documents.push(
  { id: 1, userId: 1, name: "Arjun_Sharma_Resume.pdf", type: "resume", fileUrl: "/demo/documents/arjun-resume.pdf", fileSize: 182_450, mimeType: "application/pdf", verified: true, createdAt: daysFromNow(-10) },
  { id: 2, userId: 1, name: "NPTEL_Python_Certificate.pdf", type: "certificate", fileUrl: "/demo/documents/nptel-python.pdf", fileSize: 96_200, mimeType: "application/pdf", verified: true, createdAt: daysFromNow(-120) },
  { id: 3, userId: 1, name: "Coursera_SQL_Certificate.pdf", type: "certificate", fileUrl: "/demo/documents/coursera-sql.pdf", fileSize: 84_750, mimeType: "application/pdf", verified: true, createdAt: daysFromNow(-100) }
);

// =============================================================================
// Notifications — JobTrunk-branded examples
// =============================================================================

const notif = (id: number, userId: number, type: "application_update" | "opportunity_new" | "message" | "skill_badge" | "system" | "collaboration", title: string, body: string, link: string, read: boolean, dateOffset: number) =>
  ({ id, userId, type, title, body, link, read, createdAt: daysFromNow(dateOffset) });

store.notifications.push(
  notif(1, 1, "opportunity_new", "JobTrunk found 3 new opportunities for you", "Healthcare Data Analytics Intern at AyushTech Innovations matches your profile at 91%.", "/opportunities/internships/1", false, -1),
  notif(2, 1, "system", "Your biggest skill gap is SQL. Here's how to close it.", "SQL/Databases is the most in-demand skill you're missing. Start the NPTEL SQL program.", "/learning/1", false, -2),
  notif(3, 1, "skill_badge", "Your career readiness increased by 8%", "Completing the Career Readiness Assessment raised your readiness score to 78/100.", "/skills/results", false, -7),
  notif(4, 1, "system", "Welcome to JobTrunk", "Your career ecosystem is ready. Complete your assessment to unlock matched opportunities.", "/dashboard", true, -30),
  notif(5, 10, "application_update", "New application received", "Priya Patel applied to Healthcare Data Analytics Intern.", "/recruiter/candidates", false, -3),
  notif(6, 10, "application_update", "New application received", "Rahul Kumar applied to Healthcare Data Analytics Intern.", "/recruiter/candidates", false, -2),
  notif(7, 12, "system", "SQL and Cloud Computing are the biggest institutional skill gaps", "3 departments show readiness below 60% in SQL. Recommended learning programs are ready.", "/institution/dashboard", false, -2),
  notif(8, 13, "system", "National placement rate up 4% this quarter", "Internship-to-placement conversion improved across partner institutions.", "/admin", false, -3),
  notif(9, 13, "opportunity_new", "1,200 new industry opportunities this month", "Digital health and fintech lead internship demand nationally.", "/admin", true, -4)
);

// =============================================================================
// Conversations & messages — a sample student ↔ recruiter thread
// =============================================================================

store.conversations.push({ id: 1, type: "direct", title: "Arjun Sharma ↔ AyushTech Innovations", createdAt: daysFromNow(-12), updatedAt: daysFromNow(-1) });
store.conversationParticipants.push(
  { id: 1, conversationId: 1, userId: 1, lastReadAt: daysFromNow(-1), role: "receiver", joinedAt: daysFromNow(-12) },
  { id: 2, conversationId: 1, userId: 10, lastReadAt: daysFromNow(-2), role: "sender", joinedAt: daysFromNow(-12) }
);
store.messages.push(
  { id: 1, conversationId: 1, senderUserId: 10, content: "Hi Arjun, we reviewed your profile for the Healthcare Data Analytics Internship. Great Python work — when can you join for an intro call?", type: "text", createdAt: daysFromNow(-2) },
  { id: 2, conversationId: 1, senderUserId: 1, content: "Thank you! I'm available any weekday after 4 PM. Looking forward to it.", type: "text", createdAt: daysFromNow(-1) }
);

// =============================================================================
// Set ID counters past the seeded maximum
// =============================================================================

ids.users = 21;
ids.institutions = 13;
ids.industryProfiles = 8;
ids.academicianProfiles = 11;
ids.skillCategories = 7;
ids.skills = 31;
ids.skillAssessments = 2;
ids.skillAssessmentQuestions = 15;
ids.skillAssessmentResults = 4;
ids.studentSkillProfiles = 40;
ids.internships = 11;
ids.jobs = 7;
ids.learningPrograms = 9;
ids.applications = 7;
ids.savedOpportunities = 1;
ids.portfolioItems = 24;
ids.documents = 4;
ids.conversations = 2;
ids.conversationParticipants = 3;
ids.messages = 3;
ids.notifications = 10;
ids.adminSettings = 1;
ids.auditLog = 1;

export function seedDemoData() {
  // All seeding happens at module load; this function exists for clarity.
}