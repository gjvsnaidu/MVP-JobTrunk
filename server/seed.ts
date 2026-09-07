/**
 * Seed script — run via: pnpm tsx server/seed.ts
 * Populates skill_categories and skills with initial data.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { skillCategories, skills } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const CATEGORIES = [
  { name: "Programming & Development", icon: "code", sortOrder: 1 },
  { name: "Data Science & Analytics", icon: "database", sortOrder: 2 },
  { name: "Design & Creative", icon: "palette", sortOrder: 3 },
  { name: "Communication & Soft Skills", icon: "message-circle", sortOrder: 4 },
  { name: "Business & Management", icon: "briefcase", sortOrder: 5 },
  { name: "Domain-Specific", icon: "target", sortOrder: 6 },
];

const SKILLS: Record<string, { name: string; demand: "high" | "medium" | "low"; isCore?: boolean }[]> = {
  "Programming & Development": [
    { name: "JavaScript/TypeScript", demand: "high", isCore: true },
    { name: "Python", demand: "high", isCore: true },
    { name: "Java", demand: "high" },
    { name: "React.js", demand: "high" },
    { name: "Node.js", demand: "high" },
    { name: "SQL/Databases", demand: "high", isCore: true },
    { name: "Git/Version Control", demand: "high", isCore: true },
    { name: "Cloud Computing (AWS/Azure/GCP)", demand: "high" },
    { name: "DevOps/CI-CD", demand: "medium" },
    { name: "Mobile Development", demand: "medium" },
  ],
  "Data Science & Analytics": [
    { name: "Machine Learning", demand: "high" },
    { name: "Data Analysis", demand: "high", isCore: true },
    { name: "Data Visualization", demand: "medium" },
    { name: "Statistical Modeling", demand: "medium" },
    { name: "Big Data Technologies", demand: "medium" },
    { name: "R Programming", demand: "low" },
    { name: "TensorFlow/PyTorch", demand: "high" },
  ],
  "Design & Creative": [
    { name: "UI/UX Design", demand: "high" },
    { name: "Graphic Design", demand: "medium" },
    { name: "Figma/Adobe XD", demand: "high" },
    { name: "Video Editing", demand: "medium" },
    { name: "Content Writing", demand: "medium" },
  ],
  "Communication & Soft Skills": [
    { name: "Technical Writing", demand: "medium" },
    { name: "Public Speaking", demand: "medium", isCore: true },
    { name: "Team Collaboration", demand: "high", isCore: true },
    { name: "Problem Solving", demand: "high", isCore: true },
    { name: "Leadership", demand: "high" },
    { name: "Project Management", demand: "high" },
  ],
  "Business & Management": [
    { name: "Digital Marketing", demand: "medium" },
    { name: "Financial Analysis", demand: "medium" },
    { name: "Business Development", demand: "medium" },
    { name: "Product Management", demand: "high" },
    { name: "Agile/Scrum", demand: "high" },
  ],
  "Domain-Specific": [
    { name: "Healthcare IT", demand: "medium" },
    { name: "Ayurveda Knowledge", demand: "medium" },
    { name: "Pharmaceutical Sciences", demand: "medium" },
    { name: "Cybersecurity", demand: "high" },
    { name: "Blockchain", demand: "low" },
  ],
};

async function seed() {
  console.log("🌱 Seeding skill categories and skills...");

  // Insert categories
  const insertedCategories = await db
    .insert(skillCategories)
    .values(CATEGORIES.map((c) => ({ name: c.name, icon: c.icon, sortOrder: c.sortOrder })))
    .execute();

  console.log(`  ✅ Inserted ${insertedCategories[0].affectedRows} categories`);

  // Fetch categories to get IDs
  const allCategories = await db.select().from(skillCategories).execute();
  const categoryMap = new Map(allCategories.map((c) => [c.name, c.id]));

  // Insert skills
  let totalSkills = 0;
  for (const [categoryName, skillsList] of Object.entries(SKILLS)) {
    const categoryId = categoryMap.get(categoryName);
    if (!categoryId) continue;

    const result = await db
      .insert(skills)
      .values(
        skillsList.map((s) => ({
          categoryId,
          name: s.name,
          industryDemand: s.demand,
          isCore: s.isCore ?? false,
        }))
      )
      .execute();

    totalSkills += result[0].affectedRows;
    console.log(`  ✅ Inserted ${result[0].affectedRows} skills in "${categoryName}"`);
  }

  console.log(`\n🎉 Seeding complete: ${insertedCategories[0].affectedRows} categories, ${totalSkills} skills`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
