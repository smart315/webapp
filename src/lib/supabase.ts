import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  DEFAULT_PROFILE_DATA, 
  PROJECTS_DATA, 
  EXPERIENCE_DATA, 
  SKILLS_DATA, 
  AWARDS_DATA 
} from '../data';
import { ProfileData, Project, Experience, Skill, Award } from '../types';

// Environment variable resolution supporting Vite client (import.meta.env) & Node.js (process.env)
const SUPABASE_URL = 
  (typeof (import.meta as any) !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  'https://hpqbkuufgsuyqleohdwl.supabase.co';

const SUPABASE_ANON_KEY = 
  (typeof (import.meta as any) !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  'sb_publishable___jJE-hjFI6Hate-YUhyCg_QQQF6jgD';

/**
 * Supabase client instance
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Supabase Auth API wrapper replacing Firebase Auth
 */
export const supabaseAuth = {
  getUser: () => supabase.auth.getUser(),
  getSession: () => supabase.auth.getSession(),
  signInWithGoogle: async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },
  signInWithEmail: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ============================================================================
// DATA ACCESS LAYER: Supabase CRUD with PostgreSQL Tables
// Primary: site_content, experiences, skills, certifications, portfolio_items
// ============================================================================

/**
 * Fetch Profile data from `site_content` (or `portfolio_profile`)
 */
export async function getSupabaseProfile(): Promise<ProfileData> {
  try {
    let { data, error } = await supabase
      .from('site_content')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      const fallback = await supabase
        .from('portfolio_profile')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (!fallback.error && fallback.data) {
        data = fallback.data;
      }
    }

    if (!data) {
      const local = localStorage.getItem('sirus_profile');
      return local ? JSON.parse(local) : DEFAULT_PROFILE_DATA;
    }

    return {
      titlePrimary: data.title_primary ?? data.titlePrimary ?? data.title ?? DEFAULT_PROFILE_DATA.titlePrimary,
      titleGradient: data.title_gradient ?? data.titleGradient ?? DEFAULT_PROFILE_DATA.titleGradient,
      subtitle: data.subtitle ?? DEFAULT_PROFILE_DATA.subtitle,
      introParagraph1: data.intro_paragraph1 ?? data.introParagraph1 ?? data.content ?? DEFAULT_PROFILE_DATA.introParagraph1,
      introParagraph2: data.intro_paragraph2 ?? data.introParagraph2 ?? DEFAULT_PROFILE_DATA.introParagraph2,
      quote: data.quote ?? DEFAULT_PROFILE_DATA.quote,
      studentName: data.student_name ?? data.studentName ?? data.name ?? DEFAULT_PROFILE_DATA.studentName,
      email: data.email ?? DEFAULT_PROFILE_DATA.email,
      githubUrl: data.github_url ?? data.githubUrl ?? DEFAULT_PROFILE_DATA.githubUrl,
      heroImage: data.hero_image ?? data.heroImage ?? data.image_url ?? DEFAULT_PROFILE_DATA.heroImage,
    };
  } catch (err) {
    console.warn('[Supabase] Falling back to default profile:', err);
    return DEFAULT_PROFILE_DATA;
  }
}

/**
 * Save Profile data to `site_content` (and `portfolio_profile`)
 */
export async function saveSupabaseProfile(profile: ProfileData): Promise<void> {
  try {
    const payload = {
      id: 1,
      title: profile.titlePrimary,
      subtitle: profile.subtitle,
      title_primary: profile.titlePrimary,
      title_gradient: profile.titleGradient,
      intro_paragraph1: profile.introParagraph1,
      intro_paragraph2: profile.introParagraph2 || '',
      quote: profile.quote,
      student_name: profile.studentName,
      email: profile.email,
      github_url: profile.githubUrl,
      hero_image: profile.heroImage,
      updated_at: new Date().toISOString(),
    };

    await Promise.allSettled([
      supabase.from('site_content').upsert(payload, { onConflict: 'id' }),
      supabase.from('portfolio_profile').upsert(payload, { onConflict: 'id' }),
    ]);
  } catch (err) {
    console.error('[Supabase saveSupabaseProfile error]:', err);
  }
}

/**
 * Fetch Projects list from `portfolio_items` (or `portfolio_projects`)
 */
export async function getSupabaseProjects(): Promise<Project[]> {
  try {
    let { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      const fallback = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('order_index', { ascending: true });
      if (!fallback.error && fallback.data && fallback.data.length > 0) {
        data = fallback.data;
      }
    }

    if (!data || data.length === 0) {
      const local = localStorage.getItem('sirus_projects');
      return local ? JSON.parse(local) : PROJECTS_DATA;
    }

    return data.map((row: any) => {
      const fallback = PROJECTS_DATA.find(p => String(p.id) === String(row.id));
      let tech: string[] = [];
      if (Array.isArray(row.tech_stack)) tech = row.tech_stack;
      else if (Array.isArray(row.skills)) tech = row.skills;
      else if (typeof row.tech_stack === 'string') {
        try { tech = JSON.parse(row.tech_stack); } catch { tech = []; }
      } else if (fallback?.techStack) tech = fallback.techStack;

      let hw: any[] = [];
      if (Array.isArray(row.hardware_spec)) hw = row.hardware_spec;
      else if (typeof row.hardware_spec === 'string') {
        try { hw = JSON.parse(row.hardware_spec); } catch { hw = []; }
      } else if (fallback?.hardwareSpec) hw = fallback.hardwareSpec;

      return {
        id: String(row.id),
        title: row.title || fallback?.title || 'Project',
        description: row.description || fallback?.description || '',
        image: row.image || row.image_url || fallback?.image || '',
        techStack: tech,
        longDescription: row.long_description || row.details || fallback?.longDescription || row.description || '',
        hardwareSpec: hw,
        softwareDetails: row.software_details || fallback?.softwareDetails || '실시간 제어 및 최적화 루틴 적용.',
        codeSnippet: row.sample_code || row.code_snippet || fallback?.codeSnippet || '',
        simulateLogs: fallback?.simulateLogs || [],
      };
    });
  } catch (err) {
    console.warn('[Supabase] Falling back to default projects:', err);
    return PROJECTS_DATA;
  }
}

/**
 * Save Projects list to `portfolio_items` (and `portfolio_projects`)
 */
export async function saveSupabaseProjects(projects: Project[]): Promise<void> {
  try {
    const rows = projects.map((p, idx) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      image: p.image,
      image_url: p.image,
      tech_stack: p.techStack,
      skills: p.techStack,
      long_description: p.longDescription,
      hardware_spec: p.hardwareSpec,
      sample_code: p.codeSnippet,
      sort_order: idx,
      order_index: idx,
      updated_at: new Date().toISOString(),
    }));

    await Promise.allSettled([
      supabase.from('portfolio_items').upsert(rows, { onConflict: 'id' }),
      supabase.from('portfolio_projects').upsert(rows, { onConflict: 'id' }),
    ]);
  } catch (err) {
    console.error('[Supabase saveSupabaseProjects error]:', err);
  }
}

/**
 * Fetch Experience from `experiences` (or `portfolio_experience`)
 */
export async function getSupabaseExperience(): Promise<Experience[]> {
  try {
    let { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      const fallback = await supabase
        .from('portfolio_experience')
        .select('*')
        .order('order_index', { ascending: true });
      if (!fallback.error && fallback.data && fallback.data.length > 0) {
        data = fallback.data;
      }
    }

    if (!data || data.length === 0) {
      const local = localStorage.getItem('sirus_experiences');
      return local ? JSON.parse(local) : EXPERIENCE_DATA;
    }

    return data.map((row: any) => {
      let detailed: string[] = [];
      if (Array.isArray(row.detailed_points)) detailed = row.detailed_points;
      else if (Array.isArray(row.points)) detailed = row.points;
      else if (typeof row.detailed_points === 'string') {
        try { detailed = JSON.parse(row.detailed_points); } catch { detailed = [row.detailed_points]; }
      }

      return {
        id: String(row.id),
        year: row.year ? String(row.year) : (row.period || '2024'),
        title: row.title || 'Experience',
        team: row.team || row.company || undefined,
        role: row.role || row.position || undefined,
        description: row.description || '',
        detailedPoints: detailed,
      };
    });
  } catch (err) {
    console.warn('[Supabase] Falling back to default experiences:', err);
    return EXPERIENCE_DATA;
  }
}

/**
 * Save Experience to `experiences` (and `portfolio_experience`)
 */
export async function saveSupabaseExperience(experiences: Experience[]): Promise<void> {
  try {
    const rows = experiences.map((e, idx) => ({
      id: e.id,
      year: e.year,
      title: e.title,
      team: e.team || null,
      company: e.team || null,
      role: e.role || null,
      position: e.role || null,
      description: e.description,
      detailed_points: e.detailedPoints,
      points: e.detailedPoints,
      sort_order: idx,
      order_index: idx,
      updated_at: new Date().toISOString(),
    }));

    await Promise.allSettled([
      supabase.from('experiences').upsert(rows, { onConflict: 'id' }),
      supabase.from('portfolio_experience').upsert(rows, { onConflict: 'id' }),
    ]);
  } catch (err) {
    console.error('[Supabase saveSupabaseExperience error]:', err);
  }
}

/**
 * Fetch Skills from `skills` (or `portfolio_skills`)
 */
export async function getSupabaseSkills(): Promise<Skill[]> {
  try {
    let { data, error } = await supabase
      .from('skills')
      .select('*');

    if (error || !data || data.length === 0) {
      const fallback = await supabase
        .from('portfolio_skills')
        .select('*')
        .order('order_index', { ascending: true });
      if (!fallback.error && fallback.data && fallback.data.length > 0) {
        data = fallback.data;
      }
    }

    if (!data || data.length === 0) {
      const local = localStorage.getItem('sirus_skills');
      return local ? JSON.parse(local) : SKILLS_DATA;
    }

    return data.map((row: any) => ({
      name: row.name,
      category: (row.category as any) || 'Engineering',
      proficiency: Number(row.proficiency ?? row.level ?? row.score ?? 85),
    }));
  } catch (err) {
    console.warn('[Supabase] Falling back to default skills:', err);
    return SKILLS_DATA;
  }
}

/**
 * Save Skills to `skills` (and `portfolio_skills`)
 */
export async function saveSupabaseSkills(skills: Skill[]): Promise<void> {
  try {
    const rows = skills.map((s, idx) => ({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
      level: s.proficiency,
      sort_order: idx,
      order_index: idx,
      updated_at: new Date().toISOString(),
    }));

    await Promise.allSettled([
      supabase.from('skills').upsert(rows, { onConflict: 'name' }),
      supabase.from('portfolio_skills').upsert(rows, { onConflict: 'name' }),
    ]);
  } catch (err) {
    console.error('[Supabase saveSupabaseSkills error]:', err);
  }
}

/**
 * Fetch Awards from `certifications` (or `portfolio_awards`)
 */
export async function getSupabaseAwards(): Promise<Award[]> {
  try {
    let { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      const fallback = await supabase
        .from('portfolio_awards')
        .select('*')
        .order('order_index', { ascending: true });
      if (!fallback.error && fallback.data && fallback.data.length > 0) {
        data = fallback.data;
      }
    }

    if (!data || data.length === 0) {
      const local = localStorage.getItem('sirus_awards');
      return local ? JSON.parse(local) : AWARDS_DATA;
    }

    return data.map((row: any) => ({
      id: String(row.id),
      year: row.year ? String(row.year) : (row.date ? String(row.date).slice(0, 4) : '2024'),
      title: row.title || 'Certification',
      category: row.category || row.type || 'Certification',
      rank: row.rank || row.subtitle || 'Verified',
    }));
  } catch (err) {
    console.warn('[Supabase] Falling back to default awards:', err);
    return AWARDS_DATA;
  }
}

/**
 * Save Awards to `certifications` (and `portfolio_awards`)
 */
export async function saveSupabaseAwards(awards: Award[]): Promise<void> {
  try {
    const rows = awards.map((a, idx) => ({
      id: a.id,
      year: a.year,
      title: a.title,
      category: a.category,
      type: a.category,
      rank: a.rank,
      subtitle: a.rank,
      sort_order: idx,
      order_index: idx,
      updated_at: new Date().toISOString(),
    }));

    await Promise.allSettled([
      supabase.from('certifications').upsert(rows, { onConflict: 'id' }),
      supabase.from('portfolio_awards').upsert(rows, { onConflict: 'id' }),
    ]);
  } catch (err) {
    console.error('[Supabase saveSupabaseAwards error]:', err);
  }
}

// ============================================================================
// REALTIME SUBSCRIPTION (Replaces Firestore onSnapshot)
// ============================================================================

/**
 * Supabase Realtime subscription replacing Firestore `onSnapshot`.
 * Listens for PostgreSQL changes on `public` schema tables and triggers callback.
 */
export function subscribeToSupabaseRealtime(
  onTableChange: (tableName: string, payload: any) => void
) {
  const channel = supabase
    .channel('portfolio_realtime_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload) => {
        console.log('[Supabase Realtime] Change received:', payload.table, payload.eventType);
        onTableChange(payload.table, payload);
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase Realtime] Main channel connected successfully');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Supabase Realtime] Main channel error:', err);
      }
    });

  // Return unsubscribe cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}
