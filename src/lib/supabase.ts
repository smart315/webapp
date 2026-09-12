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
// ============================================================================

/**
 * Fetch Profile data from `portfolio_profile`
 */
export async function getSupabaseProfile(): Promise<ProfileData> {
  try {
    const { data, error } = await supabase
      .from('portfolio_profile')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      const local = localStorage.getItem('sirus_profile');
      return local ? JSON.parse(local) : DEFAULT_PROFILE_DATA;
    }

    return {
      titlePrimary: data.title_primary ?? DEFAULT_PROFILE_DATA.titlePrimary,
      titleGradient: data.title_gradient ?? DEFAULT_PROFILE_DATA.titleGradient,
      subtitle: data.subtitle ?? DEFAULT_PROFILE_DATA.subtitle,
      introParagraph1: data.intro_paragraph1 ?? DEFAULT_PROFILE_DATA.introParagraph1,
      introParagraph2: data.intro_paragraph2 ?? DEFAULT_PROFILE_DATA.introParagraph2,
      quote: data.quote ?? DEFAULT_PROFILE_DATA.quote,
      studentName: data.student_name ?? DEFAULT_PROFILE_DATA.studentName,
      email: data.email ?? DEFAULT_PROFILE_DATA.email,
      githubUrl: data.github_url ?? DEFAULT_PROFILE_DATA.githubUrl,
      heroImage: data.hero_image ?? DEFAULT_PROFILE_DATA.heroImage,
    };
  } catch (err) {
    console.warn('[Supabase] Falling back to default profile:', err);
    return DEFAULT_PROFILE_DATA;
  }
}

/**
 * Save Profile data to `portfolio_profile`
 */
export async function saveSupabaseProfile(profile: ProfileData): Promise<void> {
  try {
    const payload = {
      id: 1,
      title_primary: profile.titlePrimary,
      title_gradient: profile.titleGradient,
      subtitle: profile.subtitle,
      intro_paragraph1: profile.introParagraph1,
      intro_paragraph2: profile.introParagraph2 || '',
      quote: profile.quote,
      student_name: profile.studentName,
      email: profile.email,
      github_url: profile.githubUrl,
      hero_image: profile.heroImage,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('portfolio_profile')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Could not upsert portfolio_profile:', error.message);
    }
  } catch (err) {
    console.error('[Supabase saveSupabaseProfile error]:', err);
  }
}

/**
 * Fetch Projects list from `portfolio_projects`
 */
export async function getSupabaseProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      const local = localStorage.getItem('sirus_projects');
      return local ? JSON.parse(local) : PROJECTS_DATA;
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      image: row.image,
      techStack: Array.isArray(row.tech_stack) ? row.tech_stack : JSON.parse(row.tech_stack || '[]'),
      longDescription: row.long_description || row.details || '',
      hardwareSpec: Array.isArray(row.hardware_spec) ? row.hardware_spec : JSON.parse(row.hardware_spec || '[]'),
      softwareDetails: row.software_details || '정공법 기반 오차 실시간 가중치 매핑 및 안정 제어 루틴.',
      codeSnippet: row.sample_code || row.code_snippet || '',
      simulateLogs: PROJECTS_DATA.find(p => p.id === row.id)?.simulateLogs || [],
    }));
  } catch (err) {
    console.warn('[Supabase] Falling back to default projects:', err);
    return PROJECTS_DATA;
  }
}

/**
 * Save Projects list to `portfolio_projects`
 */
export async function saveSupabaseProjects(projects: Project[]): Promise<void> {
  try {
    const rows = projects.map((p, idx) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      image: p.image,
      tech_stack: p.techStack,
      long_description: p.longDescription,
      hardware_spec: p.hardwareSpec,
      sample_code: p.codeSnippet,
      order_index: idx,
    }));

    const { error } = await supabase
      .from('portfolio_projects')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Could not upsert portfolio_projects:', error.message);
    }
  } catch (err) {
    console.error('[Supabase saveSupabaseProjects error]:', err);
  }
}

/**
 * Fetch Experience from `portfolio_experience`
 */
export async function getSupabaseExperience(): Promise<Experience[]> {
  try {
    const { data, error } = await supabase
      .from('portfolio_experience')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      const local = localStorage.getItem('sirus_experiences');
      return local ? JSON.parse(local) : EXPERIENCE_DATA;
    }

    return data.map((row: any) => ({
      id: row.id,
      year: row.year,
      title: row.title,
      team: row.team || undefined,
      role: row.role || undefined,
      description: row.description,
      detailedPoints: Array.isArray(row.detailed_points) ? row.detailed_points : JSON.parse(row.detailed_points || '[]'),
    }));
  } catch (err) {
    console.warn('[Supabase] Falling back to default experiences:', err);
    return EXPERIENCE_DATA;
  }
}

/**
 * Save Experience to `portfolio_experience`
 */
export async function saveSupabaseExperience(experiences: Experience[]): Promise<void> {
  try {
    const rows = experiences.map((e, idx) => ({
      id: e.id,
      year: e.year,
      title: e.title,
      team: e.team || null,
      role: e.role || null,
      description: e.description,
      detailed_points: e.detailedPoints,
      order_index: idx,
    }));

    const { error } = await supabase
      .from('portfolio_experience')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Could not upsert portfolio_experience:', error.message);
    }
  } catch (err) {
    console.error('[Supabase saveSupabaseExperience error]:', err);
  }
}

/**
 * Fetch Skills from `portfolio_skills`
 */
export async function getSupabaseSkills(): Promise<Skill[]> {
  try {
    const { data, error } = await supabase
      .from('portfolio_skills')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      const local = localStorage.getItem('sirus_skills');
      return local ? JSON.parse(local) : SKILLS_DATA;
    }

    return data.map((row: any) => ({
      name: row.name,
      category: row.category,
      proficiency: row.proficiency ?? row.level ?? 85,
    }));
  } catch (err) {
    console.warn('[Supabase] Falling back to default skills:', err);
    return SKILLS_DATA;
  }
}

/**
 * Save Skills to `portfolio_skills`
 */
export async function saveSupabaseSkills(skills: Skill[]): Promise<void> {
  try {
    const rows = skills.map((s, idx) => ({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
      order_index: idx,
    }));

    const { error } = await supabase
      .from('portfolio_skills')
      .upsert(rows, { onConflict: 'name' });

    if (error) {
      console.warn('[Supabase] Could not upsert portfolio_skills:', error.message);
    }
  } catch (err) {
    console.error('[Supabase saveSupabaseSkills error]:', err);
  }
}

/**
 * Fetch Awards from `portfolio_awards`
 */
export async function getSupabaseAwards(): Promise<Award[]> {
  try {
    const { data, error } = await supabase
      .from('portfolio_awards')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      const local = localStorage.getItem('sirus_awards');
      return local ? JSON.parse(local) : AWARDS_DATA;
    }

    return data.map((row: any) => ({
      id: row.id,
      year: row.year,
      title: row.title,
      category: row.category,
      rank: row.rank,
    }));
  } catch (err) {
    console.warn('[Supabase] Falling back to default awards:', err);
    return AWARDS_DATA;
  }
}

/**
 * Save Awards to `portfolio_awards`
 */
export async function saveSupabaseAwards(awards: Award[]): Promise<void> {
  try {
    const rows = awards.map((a, idx) => ({
      id: a.id,
      year: a.year,
      title: a.title,
      category: a.category,
      rank: a.rank,
      order_index: idx,
    }));

    const { error } = await supabase
      .from('portfolio_awards')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] Could not upsert portfolio_awards:', error.message);
    }
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
    .subscribe((status) => {
      console.log('[Supabase Realtime] Channel status:', status);
    });

  // Return unsubscribe cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}
