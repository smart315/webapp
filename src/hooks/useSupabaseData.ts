import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  DEFAULT_PROFILE_DATA, 
  PROJECTS_DATA, 
  EXPERIENCE_DATA, 
  SKILLS_DATA, 
  AWARDS_DATA 
} from '../data';
import { ProfileData, Project, Experience, Skill, Award } from '../types';

// ============================================================================
// DATA FORMATTERS (PostgreSQL row -> Application Type)
// ============================================================================

export const formatSiteContent = (row: any): ProfileData => {
  if (!row) return DEFAULT_PROFILE_DATA;
  return {
    titlePrimary: row.title_primary ?? row.titlePrimary ?? row.title ?? DEFAULT_PROFILE_DATA.titlePrimary,
    titleGradient: row.title_gradient ?? row.titleGradient ?? DEFAULT_PROFILE_DATA.titleGradient,
    subtitle: row.subtitle ?? DEFAULT_PROFILE_DATA.subtitle,
    introParagraph1: row.intro_paragraph1 ?? row.introParagraph1 ?? row.content ?? DEFAULT_PROFILE_DATA.introParagraph1,
    introParagraph2: row.intro_paragraph2 ?? row.introParagraph2 ?? DEFAULT_PROFILE_DATA.introParagraph2,
    quote: row.quote ?? DEFAULT_PROFILE_DATA.quote,
    studentName: row.student_name ?? row.studentName ?? row.name ?? DEFAULT_PROFILE_DATA.studentName,
    email: row.email ?? DEFAULT_PROFILE_DATA.email,
    githubUrl: row.github_url ?? row.githubUrl ?? DEFAULT_PROFILE_DATA.githubUrl,
    heroImage: row.hero_image ?? row.heroImage ?? row.image_url ?? DEFAULT_PROFILE_DATA.heroImage,
  };
};

export const formatExperience = (row: any): Experience => {
  let detailed: string[] = [];
  if (Array.isArray(row.detailed_points)) {
    detailed = row.detailed_points;
  } else if (Array.isArray(row.points)) {
    detailed = row.points;
  } else if (typeof row.detailed_points === 'string') {
    try {
      detailed = JSON.parse(row.detailed_points);
    } catch {
      detailed = [row.detailed_points];
    }
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
};

export const formatSkill = (row: any): Skill => {
  return {
    name: row.name || '',
    category: (row.category as any) || 'Engineering',
    proficiency: Number(row.proficiency ?? row.level ?? row.score ?? 85),
  };
};

export const formatCertification = (row: any): Award => {
  return {
    id: String(row.id),
    year: row.year ? String(row.year) : (row.date ? String(row.date).slice(0, 4) : '2024'),
    title: row.title || 'Certification',
    category: row.category || row.type || 'Certification',
    rank: row.rank || row.subtitle || 'Verified',
  };
};

export const formatPortfolioItem = (row: any): Project => {
  const fallback = PROJECTS_DATA.find(p => String(p.id) === String(row.id));
  
  let tech: string[] = [];
  if (Array.isArray(row.tech_stack)) {
    tech = row.tech_stack;
  } else if (Array.isArray(row.skills)) {
    tech = row.skills;
  } else if (typeof row.tech_stack === 'string') {
    try {
      tech = JSON.parse(row.tech_stack);
    } catch {
      tech = [];
    }
  } else if (fallback?.techStack) {
    tech = fallback.techStack;
  }

  let hw: any[] = [];
  if (Array.isArray(row.hardware_spec)) {
    hw = row.hardware_spec;
  } else if (typeof row.hardware_spec === 'string') {
    try {
      hw = JSON.parse(row.hardware_spec);
    } catch {
      hw = [];
    }
  } else if (fallback?.hardwareSpec) {
    hw = fallback.hardwareSpec;
  }

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
};

// ============================================================================
// HOOK: useSupabaseData
// Manages real-time sync for site_content, experiences, skills, certifications, portfolio_items
// ============================================================================

export function useSupabaseData() {
  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const saved = localStorage.getItem('sirus_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE_DATA;
    } catch {
      return DEFAULT_PROFILE_DATA;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('sirus_projects');
      return saved ? JSON.parse(saved) : PROJECTS_DATA;
    } catch {
      return PROJECTS_DATA;
    }
  });

  const [experiences, setExperiences] = useState<Experience[]>(() => {
    try {
      const saved = localStorage.getItem('sirus_experiences');
      return saved ? JSON.parse(saved) : EXPERIENCE_DATA;
    } catch {
      return EXPERIENCE_DATA;
    }
  });

  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      const saved = localStorage.getItem('sirus_skills');
      return saved ? JSON.parse(saved) : SKILLS_DATA;
    } catch {
      return SKILLS_DATA;
    }
  });

  const [awards, setAwards] = useState<Award[]>(() => {
    try {
      const saved = localStorage.getItem('sirus_awards');
      return saved ? JSON.parse(saved) : AWARDS_DATA;
    } catch {
      return AWARDS_DATA;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mounted ref to prevent state updates on unmounted component
  const isMountedRef = useRef(true);

  // Fetch individual table data
  const fetchSiteContent = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('site_content').select('*').limit(1).maybeSingle();
      if (!error && data && isMountedRef.current) {
        const formatted = formatSiteContent(data);
        setProfile(formatted);
        localStorage.setItem('sirus_profile', JSON.stringify(formatted));
      }
    } catch (err) {
      console.warn('[Supabase fetch site_content error]:', err);
    }
  }, []);

  const fetchExperiences = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('experiences').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0 && isMountedRef.current) {
        const formatted = data.map(formatExperience);
        setExperiences(formatted);
        localStorage.setItem('sirus_experiences', JSON.stringify(formatted));
      }
    } catch (err) {
      console.warn('[Supabase fetch experiences error]:', err);
    }
  }, []);

  const fetchSkills = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('skills').select('*');
      if (!error && data && data.length > 0 && isMountedRef.current) {
        const formatted = data.map(formatSkill);
        setSkills(formatted);
        localStorage.setItem('sirus_skills', JSON.stringify(formatted));
      }
    } catch (err) {
      console.warn('[Supabase fetch skills error]:', err);
    }
  }, []);

  const fetchCertifications = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('certifications').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0 && isMountedRef.current) {
        const formatted = data.map(formatCertification);
        setAwards(formatted);
        localStorage.setItem('sirus_awards', JSON.stringify(formatted));
      }
    } catch (err) {
      console.warn('[Supabase fetch certifications error]:', err);
    }
  }, []);

  const fetchPortfolioItems = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('portfolio_items').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0 && isMountedRef.current) {
        const formatted = data.map(formatPortfolioItem);
        setProjects(formatted);
        localStorage.setItem('sirus_projects', JSON.stringify(formatted));
      }
    } catch (err) {
      console.warn('[Supabase fetch portfolio_items error]:', err);
    }
  }, []);

  // Fetch all 5 tables initially
  const refetchAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.allSettled([
        fetchSiteContent(),
        fetchExperiences(),
        fetchSkills(),
        fetchCertifications(),
        fetchPortfolioItems(),
      ]);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Supabase data');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchSiteContent, fetchExperiences, fetchSkills, fetchCertifications, fetchPortfolioItems]);

  // Initial load & Setup Supabase Realtime Channels for 5 tables
  useEffect(() => {
    isMountedRef.current = true;
    refetchAll();

    console.log('[Supabase Realtime] Initializing subscriptions for 5 tables...');

    // 1. site_content channel
    const siteContentChannel = supabase
      .channel('realtime:site_content')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_content' },
        (payload) => {
          console.log('[Supabase Realtime] site_content event:', payload.eventType, payload);
          if (!isMountedRef.current) return;

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (payload.new) {
              const formatted = formatSiteContent(payload.new);
              setProfile(formatted);
              localStorage.setItem('sirus_profile', JSON.stringify(formatted));
            }
          } else if (payload.eventType === 'DELETE') {
            setProfile(DEFAULT_PROFILE_DATA);
            localStorage.setItem('sirus_profile', JSON.stringify(DEFAULT_PROFILE_DATA));
          }
          fetchSiteContent();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connected successfully to site_content channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Supabase Realtime] Failed to connect to site_content channel:', err);
        } else if (status === 'TIMED_OUT') {
          console.warn('[Supabase Realtime] Connection timed out for site_content channel');
        } else if (status === 'CLOSED') {
          console.log('[Supabase Realtime] Channel closed for site_content');
        }
      });

    // 2. experiences channel
    const experiencesChannel = supabase
      .channel('realtime:experiences')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'experiences' },
        (payload) => {
          console.log('[Supabase Realtime] experiences event:', payload.eventType, payload);
          if (!isMountedRef.current) return;

          if (payload.eventType === 'INSERT') {
            if (payload.new) {
              const formatted = formatExperience(payload.new);
              setExperiences((prev) => {
                const exists = prev.some((item) => String(item.id) === String(formatted.id));
                const next = exists
                  ? prev.map((item) => (String(item.id) === String(formatted.id) ? formatted : item))
                  : [...prev, formatted];
                localStorage.setItem('sirus_experiences', JSON.stringify(next));
                return next;
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new) {
              const formatted = formatExperience(payload.new);
              setExperiences((prev) => {
                const next = prev.map((item) =>
                  String(item.id) === String(formatted.id) ? formatted : item
                );
                localStorage.setItem('sirus_experiences', JSON.stringify(next));
                return next;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRecord = (payload.old || payload.new) as any;
            const targetId = String(oldRecord?.id || '');
            setExperiences((prev) => {
              const next = prev.filter((item) => String(item.id) !== targetId);
              localStorage.setItem('sirus_experiences', JSON.stringify(next));
              return next;
            });
          }
          fetchExperiences();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connected successfully to experiences channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Supabase Realtime] Failed to connect to experiences channel:', err);
        } else if (status === 'TIMED_OUT') {
          console.warn('[Supabase Realtime] Connection timed out for experiences channel');
        } else if (status === 'CLOSED') {
          console.log('[Supabase Realtime] Channel closed for experiences');
        }
      });

    // 3. skills channel
    const skillsChannel = supabase
      .channel('realtime:skills')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'skills' },
        (payload) => {
          console.log('[Supabase Realtime] skills event:', payload.eventType, payload);
          if (!isMountedRef.current) return;

          if (payload.eventType === 'INSERT') {
            if (payload.new) {
              const formatted = formatSkill(payload.new);
              setSkills((prev) => {
                const exists = prev.some((item) => item.name === formatted.name);
                const next = exists
                  ? prev.map((item) => (item.name === formatted.name ? formatted : item))
                  : [...prev, formatted];
                localStorage.setItem('sirus_skills', JSON.stringify(next));
                return next;
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new) {
              const formatted = formatSkill(payload.new);
              setSkills((prev) => {
                const next = prev.map((item) =>
                  item.name === formatted.name ? formatted : item
                );
                localStorage.setItem('sirus_skills', JSON.stringify(next));
                return next;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRecord = (payload.old || payload.new) as any;
            const targetName = oldRecord?.name;
            const targetId = oldRecord?.id;
            setSkills((prev) => {
              const next = prev.filter((item) =>
                item.name !== targetName && String((item as any).id) !== String(targetId)
              );
              localStorage.setItem('sirus_skills', JSON.stringify(next));
              return next;
            });
          }
          fetchSkills();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connected successfully to skills channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Supabase Realtime] Failed to connect to skills channel:', err);
        } else if (status === 'TIMED_OUT') {
          console.warn('[Supabase Realtime] Connection timed out for skills channel');
        } else if (status === 'CLOSED') {
          console.log('[Supabase Realtime] Channel closed for skills');
        }
      });

    // 4. certifications channel
    const certificationsChannel = supabase
      .channel('realtime:certifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'certifications' },
        (payload) => {
          console.log('[Supabase Realtime] certifications event:', payload.eventType, payload);
          if (!isMountedRef.current) return;

          if (payload.eventType === 'INSERT') {
            if (payload.new) {
              const formatted = formatCertification(payload.new);
              setAwards((prev) => {
                const exists = prev.some((item) => String(item.id) === String(formatted.id));
                const next = exists
                  ? prev.map((item) => (String(item.id) === String(formatted.id) ? formatted : item))
                  : [...prev, formatted];
                localStorage.setItem('sirus_awards', JSON.stringify(next));
                return next;
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new) {
              const formatted = formatCertification(payload.new);
              setAwards((prev) => {
                const next = prev.map((item) =>
                  String(item.id) === String(formatted.id) ? formatted : item
                );
                localStorage.setItem('sirus_awards', JSON.stringify(next));
                return next;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRecord = (payload.old || payload.new) as any;
            const targetId = String(oldRecord?.id || '');
            setAwards((prev) => {
              const next = prev.filter((item) => String(item.id) !== targetId);
              localStorage.setItem('sirus_awards', JSON.stringify(next));
              return next;
            });
          }
          fetchCertifications();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connected successfully to certifications channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Supabase Realtime] Failed to connect to certifications channel:', err);
        } else if (status === 'TIMED_OUT') {
          console.warn('[Supabase Realtime] Connection timed out for certifications channel');
        } else if (status === 'CLOSED') {
          console.log('[Supabase Realtime] Channel closed for certifications');
        }
      });

    // 5. portfolio_items channel
    const portfolioItemsChannel = supabase
      .channel('realtime:portfolio_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_items' },
        (payload) => {
          console.log('[Supabase Realtime] portfolio_items event:', payload.eventType, payload);
          if (!isMountedRef.current) return;

          if (payload.eventType === 'INSERT') {
            if (payload.new) {
              const formatted = formatPortfolioItem(payload.new);
              setProjects((prev) => {
                const exists = prev.some((item) => String(item.id) === String(formatted.id));
                const next = exists
                  ? prev.map((item) => (String(item.id) === String(formatted.id) ? formatted : item))
                  : [...prev, formatted];
                localStorage.setItem('sirus_projects', JSON.stringify(next));
                return next;
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new) {
              const formatted = formatPortfolioItem(payload.new);
              setProjects((prev) => {
                const next = prev.map((item) =>
                  String(item.id) === String(formatted.id) ? formatted : item
                );
                localStorage.setItem('sirus_projects', JSON.stringify(next));
                return next;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRecord = (payload.old || payload.new) as any;
            const targetId = String(oldRecord?.id || '');
            setProjects((prev) => {
              const next = prev.filter((item) => String(item.id) !== targetId);
              localStorage.setItem('sirus_projects', JSON.stringify(next));
              return next;
            });
          }
          fetchPortfolioItems();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connected successfully to portfolio_items channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Supabase Realtime] Failed to connect to portfolio_items channel:', err);
        } else if (status === 'TIMED_OUT') {
          console.warn('[Supabase Realtime] Connection timed out for portfolio_items channel');
        } else if (status === 'CLOSED') {
          console.log('[Supabase Realtime] Channel closed for portfolio_items');
        }
      });

    // Cleanup all 5 channels on unmount
    return () => {
      isMountedRef.current = false;
      console.log('[Supabase Realtime] Unsubscribing all 5 channels...');
      supabase.removeChannel(siteContentChannel);
      supabase.removeChannel(experiencesChannel);
      supabase.removeChannel(skillsChannel);
      supabase.removeChannel(certificationsChannel);
      supabase.removeChannel(portfolioItemsChannel);
    };
  }, [
    refetchAll,
    fetchSiteContent,
    fetchExperiences,
    fetchSkills,
    fetchCertifications,
    fetchPortfolioItems,
  ]);

  // Update handlers
  const handleUpdateProfile = useCallback(async (newProfile: ProfileData) => {
    setProfile(newProfile);
    localStorage.setItem('sirus_profile', JSON.stringify(newProfile));

    try {
      await supabase.from('site_content').upsert(
        {
          id: 1,
          title: newProfile.titlePrimary,
          subtitle: newProfile.subtitle,
          title_primary: newProfile.titlePrimary,
          title_gradient: newProfile.titleGradient,
          intro_paragraph1: newProfile.introParagraph1,
          intro_paragraph2: newProfile.introParagraph2,
          quote: newProfile.quote,
          student_name: newProfile.studentName,
          email: newProfile.email,
          github_url: newProfile.githubUrl,
          hero_image: newProfile.heroImage,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.warn('[Supabase update site_content error]:', err);
    }
  }, []);

  const handleUpdateProjects = useCallback(async (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem('sirus_projects', JSON.stringify(newProjects));

    try {
      const rows = newProjects.map((p, idx) => ({
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
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('portfolio_items').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.warn('[Supabase update portfolio_items error]:', err);
    }
  }, []);

  const handleUpdateExperiences = useCallback(async (newExp: Experience[]) => {
    setExperiences(newExp);
    localStorage.setItem('sirus_experiences', JSON.stringify(newExp));

    try {
      const rows = newExp.map((e, idx) => ({
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
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('experiences').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.warn('[Supabase update experiences error]:', err);
    }
  }, []);

  const handleUpdateSkills = useCallback(async (newSkills: Skill[]) => {
    setSkills(newSkills);
    localStorage.setItem('sirus_skills', JSON.stringify(newSkills));

    try {
      const rows = newSkills.map((s, idx) => ({
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        level: s.proficiency,
        sort_order: idx,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('skills').upsert(rows, { onConflict: 'name' });
    } catch (err) {
      console.warn('[Supabase update skills error]:', err);
    }
  }, []);

  const handleUpdateAwards = useCallback(async (newAwards: Award[]) => {
    setAwards(newAwards);
    localStorage.setItem('sirus_awards', JSON.stringify(newAwards));

    try {
      const rows = newAwards.map((a, idx) => ({
        id: a.id,
        year: a.year,
        title: a.title,
        category: a.category,
        type: a.category,
        rank: a.rank,
        subtitle: a.rank,
        sort_order: idx,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('certifications').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.warn('[Supabase update certifications error]:', err);
    }
  }, []);

  return {
    // 5-table state aliases as requested
    siteContent: profile,
    experiences,
    skills,
    certifications: awards,
    portfolioItems: projects,
    // Original states
    profile,
    projects,
    awards,
    loading,
    error,
    // Setters
    setProfile,
    setProjects,
    setExperiences,
    setSkills,
    setAwards,
    // Action handlers
    handleUpdateProfile,
    handleUpdateProjects,
    handleUpdateExperiences,
    handleUpdateSkills,
    handleUpdateAwards,
    refetch: refetchAll,
  };
}

export default useSupabaseData;
