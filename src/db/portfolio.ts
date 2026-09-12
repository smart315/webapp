import { db } from './index.ts';
import { 
  portfolioProfile, 
  portfolioProjects, 
  portfolioExperience, 
  portfolioSkills, 
  portfolioAwards 
} from './schema.ts';
import { 
  DEFAULT_PROFILE_DATA, 
  PROJECTS_DATA, 
  EXPERIENCE_DATA, 
  SKILLS_DATA, 
  AWARDS_DATA 
} from '../data.ts';
import { ProfileData, Project, Experience, Skill, Award } from '../types.ts';
import { asc, eq } from 'drizzle-orm';

// Helper to sanitize database errors
function wrapDbError(action: string, error: unknown): Error {
  console.error(`Database error during ${action}:`, error);
  return new Error(`Database query failed for ${action}. Please try again.`, { cause: error });
}

// 1. Get complete portfolio data with auto-seeding
export async function getFullPortfolio() {
  try {
    // 1. Profile
    let profiles = await db.select().from(portfolioProfile).limit(1);
    let profileData: ProfileData;

    if (profiles.length === 0) {
      const seeded = await db.insert(portfolioProfile).values({
        titlePrimary: DEFAULT_PROFILE_DATA.titlePrimary,
        titleGradient: DEFAULT_PROFILE_DATA.titleGradient,
        subtitle: DEFAULT_PROFILE_DATA.subtitle,
        introParagraph1: DEFAULT_PROFILE_DATA.introParagraph1,
        introParagraph2: DEFAULT_PROFILE_DATA.introParagraph2 || '',
        quote: DEFAULT_PROFILE_DATA.quote,
        studentName: DEFAULT_PROFILE_DATA.studentName,
        email: DEFAULT_PROFILE_DATA.email,
        githubUrl: DEFAULT_PROFILE_DATA.githubUrl,
        heroImage: DEFAULT_PROFILE_DATA.heroImage,
      }).returning();
      
      const s = seeded[0];
      profileData = {
        titlePrimary: s.titlePrimary,
        titleGradient: s.titleGradient,
        subtitle: s.subtitle,
        introParagraph1: s.introParagraph1,
        introParagraph2: s.introParagraph2 || '',
        quote: s.quote,
        studentName: s.studentName,
        email: s.email,
        githubUrl: s.githubUrl,
        heroImage: s.heroImage,
      };
    } else {
      const s = profiles[0];
      profileData = {
        titlePrimary: s.titlePrimary,
        titleGradient: s.titleGradient,
        subtitle: s.subtitle,
        introParagraph1: s.introParagraph1,
        introParagraph2: s.introParagraph2 || '',
        quote: s.quote,
        studentName: s.studentName,
        email: s.email,
        githubUrl: s.githubUrl,
        heroImage: s.heroImage,
      };
    }

    // 2. Projects
    let dbProjects = await db.select().from(portfolioProjects).orderBy(asc(portfolioProjects.orderIndex));
    let projectsData: Project[];

    if (dbProjects.length === 0) {
      for (let i = 0; i < PROJECTS_DATA.length; i++) {
        const p = PROJECTS_DATA[i];
        await db.insert(portfolioProjects).values({
          id: p.id,
          title: p.title,
          description: p.description,
          image: p.image,
          techStack: JSON.stringify(p.techStack),
          details: p.longDescription,
          hardwareBom: JSON.stringify(p.hardwareSpec),
          sampleCode: p.codeSnippet,
          orderIndex: i,
        });
      }
      projectsData = PROJECTS_DATA;
    } else {
      projectsData = dbProjects.map(p => {
        let techStack: string[] = [];
        let hardwareBom: { component: string; spec: string }[] = [];
        try { techStack = JSON.parse(p.techStack); } catch { techStack = [p.techStack]; }
        try { hardwareBom = JSON.parse(p.hardwareBom); } catch { hardwareBom = []; }

        return {
          id: p.id,
          title: p.title,
          description: p.description,
          image: p.image,
          techStack,
          longDescription: p.details,
          hardwareSpec: hardwareBom,
          softwareDetails: '정공법 기반 오차 실시간 가중치 매핑 및 안정 제어 루틴.',
          codeSnippet: p.sampleCode || '',
          simulateLogs: PROJECTS_DATA.find(item => item.id === p.id)?.simulateLogs || [],
        };
      });
    }

    // 3. Experience
    let dbExp = await db.select().from(portfolioExperience).orderBy(asc(portfolioExperience.orderIndex));
    let experienceData: Experience[];

    if (dbExp.length === 0) {
      for (let i = 0; i < EXPERIENCE_DATA.length; i++) {
        const e = EXPERIENCE_DATA[i];
        await db.insert(portfolioExperience).values({
          id: e.id,
          year: e.year,
          title: e.title,
          team: e.team || null,
          role: e.role || null,
          description: e.description,
          detailedPoints: JSON.stringify(e.detailedPoints),
          orderIndex: i,
        });
      }
      experienceData = EXPERIENCE_DATA;
    } else {
      experienceData = dbExp.map(e => {
        let detailedPoints: string[] = [];
        try { detailedPoints = JSON.parse(e.detailedPoints); } catch { detailedPoints = []; }
        return {
          id: e.id,
          year: e.year,
          title: e.title,
          team: e.team || undefined,
          role: e.role || undefined,
          description: e.description,
          detailedPoints,
        };
      });
    }

    // 4. Skills
    let dbSkills = await db.select().from(portfolioSkills).orderBy(asc(portfolioSkills.orderIndex));
    let skillsData: Skill[];

    if (dbSkills.length === 0) {
      for (let i = 0; i < SKILLS_DATA.length; i++) {
        const s = SKILLS_DATA[i];
        await db.insert(portfolioSkills).values({
          name: s.name,
          category: s.category,
          level: s.proficiency,
          orderIndex: i,
        });
      }
      skillsData = SKILLS_DATA;
    } else {
      skillsData = dbSkills.map(s => ({
        name: s.name,
        category: s.category as any,
        proficiency: s.level,
      }));
    }

    // 5. Awards
    let dbAwards = await db.select().from(portfolioAwards).orderBy(asc(portfolioAwards.orderIndex));
    let awardsData: Award[];

    if (dbAwards.length === 0) {
      for (let i = 0; i < AWARDS_DATA.length; i++) {
        const a = AWARDS_DATA[i];
        await db.insert(portfolioAwards).values({
          id: a.id,
          year: a.year,
          title: a.title,
          category: a.category,
          rank: a.rank,
          orderIndex: i,
        });
      }
      awardsData = AWARDS_DATA;
    } else {
      awardsData = dbAwards.map(a => ({
        id: a.id,
        year: a.year,
        title: a.title,
        category: a.category,
        rank: a.rank,
      }));
    }

    return {
      profile: profileData,
      projects: projectsData,
      experience: experienceData,
      skills: skillsData,
      awards: awardsData,
    };
  } catch (error) {
    throw wrapDbError('getFullPortfolio', error);
  }
}

// 2. Update Profile
export async function saveProfile(profile: ProfileData) {
  try {
    const existing = await db.select().from(portfolioProfile).limit(1);
    if (existing.length === 0) {
      await db.insert(portfolioProfile).values({
        titlePrimary: profile.titlePrimary,
        titleGradient: profile.titleGradient,
        subtitle: profile.subtitle,
        introParagraph1: profile.introParagraph1,
        introParagraph2: profile.introParagraph2 || '',
        quote: profile.quote,
        studentName: profile.studentName,
        email: profile.email,
        githubUrl: profile.githubUrl,
        heroImage: profile.heroImage,
      });
    } else {
      await db.update(portfolioProfile)
        .set({
          titlePrimary: profile.titlePrimary,
          titleGradient: profile.titleGradient,
          subtitle: profile.subtitle,
          introParagraph1: profile.introParagraph1,
          introParagraph2: profile.introParagraph2 || '',
          quote: profile.quote,
          studentName: profile.studentName,
          email: profile.email,
          githubUrl: profile.githubUrl,
          heroImage: profile.heroImage,
          updatedAt: new Date(),
        })
        .where(eq(portfolioProfile.id, existing[0].id));
    }
    return profile;
  } catch (error) {
    throw wrapDbError('saveProfile', error);
  }
}

// 3. Update Projects
export async function saveProjects(projects: Project[]) {
  try {
    await db.delete(portfolioProjects);
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      await db.insert(portfolioProjects).values({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image,
        techStack: JSON.stringify(p.techStack),
        details: p.longDescription,
        hardwareBom: JSON.stringify(p.hardwareSpec),
        sampleCode: p.codeSnippet,
        orderIndex: i,
      });
    }
    return projects;
  } catch (error) {
    throw wrapDbError('saveProjects', error);
  }
}

// 4. Update Experience
export async function saveExperience(experiences: Experience[]) {
  try {
    await db.delete(portfolioExperience);
    for (let i = 0; i < experiences.length; i++) {
      const e = experiences[i];
      await db.insert(portfolioExperience).values({
        id: e.id,
        year: e.year,
        title: e.title,
        team: e.team || null,
        role: e.role || null,
        description: e.description,
        detailedPoints: JSON.stringify(e.detailedPoints),
        orderIndex: i,
      });
    }
    return experiences;
  } catch (error) {
    throw wrapDbError('saveExperience', error);
  }
}

// 5. Update Skills
export async function saveSkills(skills: Skill[]) {
  try {
    await db.delete(portfolioSkills);
    for (let i = 0; i < skills.length; i++) {
      const s = skills[i];
      await db.insert(portfolioSkills).values({
        name: s.name,
        category: s.category,
        level: s.proficiency,
        orderIndex: i,
      });
    }
    return skills;
  } catch (error) {
    throw wrapDbError('saveSkills', error);
  }
}

// 6. Update Awards
export async function saveAwards(awards: Award[]) {
  try {
    await db.delete(portfolioAwards);
    for (let i = 0; i < awards.length; i++) {
      const a = awards[i];
      await db.insert(portfolioAwards).values({
        id: a.id,
        year: a.year,
        title: a.title,
        category: a.category,
        rank: a.rank,
        orderIndex: i,
      });
    }
    return awards;
  } catch (error) {
    throw wrapDbError('saveAwards', error);
  }
}

// 7. Reset all to defaults
export async function resetAllToDefaults() {
  try {
    await db.delete(portfolioProfile);
    await db.delete(portfolioProjects);
    await db.delete(portfolioExperience);
    await db.delete(portfolioSkills);
    await db.delete(portfolioAwards);

    return await getFullPortfolio();
  } catch (error) {
    throw wrapDbError('resetAllToDefaults', error);
  }
}
