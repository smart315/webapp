import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Supabase Auth Users mapping
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Supabase auth.users UUID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Profile & Hero information
export const portfolioProfile = pgTable('portfolio_profile', {
  id: serial('id').primaryKey(),
  titlePrimary: text('title_primary').notNull(),
  titleGradient: text('title_gradient').notNull(),
  subtitle: text('subtitle').notNull(),
  introParagraph1: text('intro_paragraph1').notNull(),
  introParagraph2: text('intro_paragraph2'),
  quote: text('quote').notNull(),
  studentName: text('student_name').notNull(),
  email: text('email').notNull(),
  githubUrl: text('github_url').notNull(),
  heroImage: text('hero_image').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Projects list
export const portfolioProjects = pgTable('portfolio_projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  techStack: text('tech_stack').notNull(), // JSON stringified array
  details: text('details').notNull(),
  hardwareBom: text('hardware_bom').notNull(), // JSON stringified array
  sampleCode: text('sample_code'),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Experience list
export const portfolioExperience = pgTable('portfolio_experience', {
  id: text('id').primaryKey(),
  year: text('year').notNull(),
  title: text('title').notNull(),
  team: text('team'),
  role: text('role'),
  description: text('description').notNull(),
  detailedPoints: text('detailed_points').notNull(), // JSON stringified array
  orderIndex: integer('order_index').default(0),
});

// Skills list
export const portfolioSkills = pgTable('portfolio_skills', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  level: integer('level').notNull(),
  orderIndex: integer('order_index').default(0),
});

// Awards list
export const portfolioAwards = pgTable('portfolio_awards', {
  id: text('id').primaryKey(),
  year: text('year').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  rank: text('rank').notNull(),
  orderIndex: integer('order_index').default(0),
});
