import { useState, useEffect } from 'react';
import { 
  PROJECTS_DATA, EXPERIENCE_DATA, SKILLS_DATA, AWARDS_DATA, 
  DEFAULT_PROFILE_DATA 
} from './data';
import { Project, Experience, Skill, Award, ProfileData } from './types';
import Header from './components/Header';
import ProjectModal from './components/ProjectModal';
import RobotAssistant from './components/RobotAssistant';
import TerminalOverlay from './components/TerminalOverlay';
import AdminModal from './components/AdminModal';
import { 
  getSupabaseProfile, saveSupabaseProfile,
  getSupabaseProjects, saveSupabaseProjects,
  getSupabaseExperience, saveSupabaseExperience,
  getSupabaseSkills, saveSupabaseSkills,
  getSupabaseAwards, saveSupabaseAwards,
  subscribeToSupabaseRealtime
} from './lib/supabase';
import { 
  Trophy, Cpu, Wrench, GraduationCap, Code2, Play, 
  ChevronRight, Compass, Heart, Github, CheckCircle2, Award as AwardIcon,
  Shield, Edit3, Plus, Settings
} from 'lucide-react';

export default function App() {
  // Persistence states
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

  // Fetch initial data from Supabase & Subscribe to Realtime postgres_changes
  useEffect(() => {
    let isMounted = true;

    const loadRemoteData = async () => {
      try {
        const [remoteProfile, remoteProjects, remoteExp, remoteSkills, remoteAwards] = await Promise.all([
          getSupabaseProfile(),
          getSupabaseProjects(),
          getSupabaseExperience(),
          getSupabaseSkills(),
          getSupabaseAwards(),
        ]);

        if (!isMounted) return;
        if (remoteProfile) setProfile(remoteProfile);
        if (remoteProjects && remoteProjects.length > 0) setProjects(remoteProjects);
        if (remoteExp && remoteExp.length > 0) setExperiences(remoteExp);
        if (remoteSkills && remoteSkills.length > 0) setSkills(remoteSkills);
        if (remoteAwards && remoteAwards.length > 0) setAwards(remoteAwards);
      } catch (err) {
        console.warn('[Supabase Realtime Sync]: Using local data fallback:', err);
      }
    };

    loadRemoteData();

    // Replaces Firestore onSnapshot with Supabase Realtime channel
    const unsubscribe = subscribeToSupabaseRealtime((tableName) => {
      console.log(`[Supabase Realtime] Syncing ${tableName} from PostgreSQL...`);
      if (tableName === 'portfolio_profile') {
        getSupabaseProfile().then(p => isMounted && setProfile(p));
      } else if (tableName === 'portfolio_projects') {
        getSupabaseProjects().then(p => isMounted && setProjects(p));
      } else if (tableName === 'portfolio_experience') {
        getSupabaseExperience().then(e => isMounted && setExperiences(e));
      } else if (tableName === 'portfolio_skills') {
        getSupabaseSkills().then(s => isMounted && setSkills(s));
      } else if (tableName === 'portfolio_awards') {
        getSupabaseAwards().then(a => isMounted && setAwards(a));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // UI modal states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [expandedExperience, setExpandedExperience] = useState<string | null>('exp1');

  // Admin Modal states
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'profile' | 'projects' | 'experience' | 'skills' | 'awards'>('profile');
  const [adminTargetProjectId, setAdminTargetProjectId] = useState<string | null>(null);

  // Update & Save Handlers (Local + Supabase PostgreSQL sync)
  const handleUpdateProfile = (newProfile: ProfileData) => {
    setProfile(newProfile);
    localStorage.setItem('sirus_profile', JSON.stringify(newProfile));
    saveSupabaseProfile(newProfile).catch(err => console.warn('[Supabase save profile error]:', err));
  };

  const handleUpdateProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem('sirus_projects', JSON.stringify(newProjects));
    saveSupabaseProjects(newProjects).catch(err => console.warn('[Supabase save projects error]:', err));
    if (selectedProject) {
      const updated = newProjects.find(p => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    }
  };

  const handleUpdateExperiences = (newExp: Experience[]) => {
    setExperiences(newExp);
    localStorage.setItem('sirus_experiences', JSON.stringify(newExp));
    saveSupabaseExperience(newExp).catch(err => console.warn('[Supabase save experience error]:', err));
  };

  const handleUpdateSkills = (newSkills: Skill[]) => {
    setSkills(newSkills);
    localStorage.setItem('sirus_skills', JSON.stringify(newSkills));
    saveSupabaseSkills(newSkills).catch(err => console.warn('[Supabase save skills error]:', err));
  };

  const handleUpdateAwards = (newAwards: Award[]) => {
    setAwards(newAwards);
    localStorage.setItem('sirus_awards', JSON.stringify(newAwards));
    saveSupabaseAwards(newAwards).catch(err => console.warn('[Supabase save awards error]:', err));
  };

  const handleResetToDefault = () => {
    localStorage.removeItem('sirus_profile');
    localStorage.removeItem('sirus_projects');
    localStorage.removeItem('sirus_experiences');
    localStorage.removeItem('sirus_skills');
    localStorage.removeItem('sirus_awards');

    setProfile(DEFAULT_PROFILE_DATA);
    setProjects(PROJECTS_DATA);
    setExperiences(EXPERIENCE_DATA);
    setSkills(SKILLS_DATA);
    setAwards(AWARDS_DATA);

    saveSupabaseProfile(DEFAULT_PROFILE_DATA).catch(() => {});
    saveSupabaseProjects(PROJECTS_DATA).catch(() => {});
    saveSupabaseExperience(EXPERIENCE_DATA).catch(() => {});
    saveSupabaseSkills(SKILLS_DATA).catch(() => {});
    saveSupabaseAwards(AWARDS_DATA).catch(() => {});
  };

  const openAdminAtTab = (tab: 'profile' | 'projects' | 'experience' | 'skills' | 'awards', projectId?: string) => {
    setAdminTab(tab);
    setAdminTargetProjectId(projectId || null);
    setAdminOpen(true);
  };

  // Filter projects by skill
  const handleSkillToggle = (skillName: string) => {
    setSelectedSkill(prev => (prev === skillName ? null : skillName));
  };

  const filteredProjects = projects.filter(project => {
    if (!selectedSkill) return true;
    return project.techStack.some(tech => 
      tech.toLowerCase().includes(selectedSkill.toLowerCase()) || 
      selectedSkill.toLowerCase().includes(tech.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#0f112a] bg-cyber-gradient tech-grid relative text-[#e0e0ff] overflow-x-hidden selection:bg-[#00f2ff]/35 selection:text-white">
      
      {/* Background Decorative Neon Orbs */}
      <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] rounded-full bg-cyan-900/10 blur-[90px] pointer-events-none" />
      <div className="absolute top-[45%] right-[5%] w-[450px] h-[450px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] left-[10%] w-[380px] h-[380px] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />

      {/* Embedded Terminal Shell */}
      <TerminalOverlay 
        isOpen={terminalOpen} 
        onClose={() => setTerminalOpen(false)} 
      />

      {/* Navigation Header with Admin Button */}
      <Header 
        onToggleTerminal={() => setTerminalOpen(prev => !prev)} 
        terminalOpen={terminalOpen}
        onOpenAdmin={() => openAdminAtTab('profile')}
      />

      {/* Main Content Sections wrapper */}
      <main className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-16 space-y-[120px]">
        
        {/* SECTION 1: ABOUT (Hero Module) */}
        <section 
          id="about" 
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 md:pt-16 scroll-mt-24 relative"
        >
          {/* Bio Content Text */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-[1px] w-12 bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]" />
                <span className="font-mono text-xs uppercase tracking-wider text-[#00f2ff] text-glow-cyan-soft font-semibold">
                  SYSTEM_PORTFOLIO // ROBOTICS ENGINE
                </span>
              </div>

              {/* Direct Edit Button for About */}
              <button
                onClick={() => openAdminAtTab('profile')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 border border-[#00f2ff]/30 text-xs font-mono text-[#00f2ff] transition-all hover:scale-105"
                title="기본 소개 문구 수정하기"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>수정</span>
              </button>
            </div>

            <div className="space-y-4">
              <h1 className="font-display font-extrabold text-[44px] sm:text-[54px] lg:text-[64px] leading-[1.05] tracking-tight text-white">
                {profile.titlePrimary} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00dbe7] via-[#00f2ff] to-[#74f5ff] text-glow-cyan drop-shadow-[0_0_20px_rgba(0,242,255,0.25)]">
                  {profile.titleGradient}
                </span>
              </h1>
              <p className="font-mono text-sm text-[#b9cacb]/90 border-l-2 border-[rgba(0,219,231,0.5)] pl-3">
                {profile.subtitle}
              </p>
            </div>

            <div className="space-y-4 font-sans text-base leading-relaxed text-[#c1c3e0]">
              <p>{profile.introParagraph1}</p>
              {profile.introParagraph2 && <p>{profile.introParagraph2}</p>}
            </div>

            {/* Quote banner */}
            <div className="bg-[#171932]/70 border border-[rgba(0,219,231,0.15)] rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00f2ff]" />
              <p className="font-sans italic text-sm text-[#00f2ff] font-medium leading-relaxed">
                {profile.quote}
              </p>
            </div>

            {/* CTA Actions */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <a
                href="#portfolio"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00dbe7] to-[#00f2ff] text-black font-display font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,255,0.25)] hover:shadow-[0_0_30px_rgba(0,242,255,0.45)]"
              >
                View Projects
              </a>
              <a
                href="#experience"
                className="px-6 py-3.5 rounded-xl bg-[rgba(0,219,231,0.05)] border border-[rgba(0,219,231,0.3)] hover:border-[#00f2ff] text-[#00f2ff] font-display font-bold text-sm tracking-wide transition-all duration-300 hover:bg-[rgba(0,219,231,0.1)] hover:scale-[1.02]"
              >
                My Experience
              </a>
              <button
                onClick={() => openAdminAtTab('profile')}
                className="px-4 py-3 rounded-xl border border-dashed border-[#00f2ff]/40 text-[#00f2ff] font-mono text-xs hover:bg-[#00f2ff]/10 transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Editor</span>
              </button>
            </div>
          </div>

          {/* Interactive Hero Image */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[380px] aspect-square rounded-2xl p-2.5 bg-[#171932]/40 border border-[rgba(0,219,231,0.2)] shadow-[0_0_35px_rgba(0,219,231,0.1)] backdrop-blur-md glow-cyan-hover transition-all duration-350 scanline group">
              {/* Linear top glow borders */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent" />
              
              {/* Image box spacer with absolute design frame */}
              <div className="w-full h-full rounded-xl overflow-hidden bg-[#070815] border border-[rgba(0,219,231,0.1)] relative">
                <img
                  src={profile.heroImage}
                  alt="Sirus Cybernetic Hero"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Visual interface elements on image */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 border border-[#00f2ff]/30 font-mono text-[9px] text-[#00f2ff]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block" />
                  <span>ONLINE_CORE_ACTIVE</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm border border-[rgba(0,219,231,0.2)] p-2.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="block font-mono text-[9px] text-[#00f2ff] uppercase tracking-wider mb-0.5">TARGET COMPACT CODE</span>
                    <span className="block font-sans font-medium text-[11px] text-white">SIRUS_AURA_PROCESSOR // REV_2.4</span>
                  </div>
                  <button
                    onClick={() => openAdminAtTab('profile')}
                    className="p-1.5 rounded bg-[#00f2ff]/20 text-[#00f2ff] hover:bg-[#00f2ff]/40 text-xs"
                    title="이미지 URL 변경"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: EXPERIENCE */}
        <section id="experience" className="scroll-mt-24">
          <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-display font-semibold text-3xl md:text-4xl text-white tracking-widest flex items-center gap-3">
                <span className="text-[#00f2ff]">◼</span> Experience
              </h2>
              <button
                onClick={() => openAdminAtTab('experience')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#00f2ff]/40 bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-xs font-mono text-[#00f2ff] transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>대회/경력 항목 수정</span>
              </button>
            </div>
            <p className="font-sans text-sm text-[#b9cacb] max-w-2xl leading-relaxed pl-4 border-l border-[rgba(0,219,231,0.25)]">
              로봇 수업과 실전 프로젝트 및 대회를 통해 축적한 하드웨어 빌딩 역량과 C언어 제어 루틴을 수집 정리했습니다.
            </p>
          </div>

          <div className="relative border-l border-[rgba(0,219,231,0.25)] ml-3 md:ml-6 space-y-8">
            {experiences.map((exp) => {
              const isActive = expandedExperience === exp.id;
              return (
                <div key={exp.id} className="relative pl-8 group">
                  
                  {/* Glowing Node Line Indicator */}
                  <span className={`absolute -left-[5px] top-[14px] w-[11px] h-[11px] rounded-full ring-4 transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#00f2ff] ring-cyan-900 shadow-[0_0_12px_#00f2ff]' 
                      : 'bg-[#1b1d36] ring-[#0f112a] group-hover:bg-[#00f2ff] group-hover:ring-cyan-950'
                  }`} />

                  {/* Experience Card Frame */}
                  <div 
                    onClick={() => setExpandedExperience(isActive ? null : exp.id)}
                    className={`cursor-pointer rounded-xl border p-6 transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#1b1d36]/90 border-[rgba(0,219,231,0.45)] shadow-[0_0_20px_rgba(0,219,231,0.12)]' 
                        : 'bg-[#171932]/50 border-[rgba(0,219,231,0.15)] hover:border-[rgba(0,219,231,0.35)] hover:bg-[#1b1d36]/70'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                      <div className="space-y-1">
                        <span className="font-mono text-xs font-semibold text-[#00f2ff] bg-[rgba(0,219,231,0.1)] px-2.5 py-1 rounded border border-[rgba(0,219,231,0.25)]">
                          YEAR: {exp.year}
                        </span>
                        <h3 className="font-display font-bold text-lg text-white group-hover:text-[#00f2ff] transition-colors pt-2.5">
                          {exp.title}
                        </h3>
                      </div>
                      
                      <div className="flex flex-col md:items-end font-mono text-[11px] text-[#b9cacb]/80">
                        {exp.team && <span className="font-bold text-[#00f2ff]/90">{exp.team}</span>}
                        {exp.role && <span>ROLE: {exp.role}</span>}
                      </div>
                    </div>

                    <p className="text-sm text-[#c1c3e0] leading-relaxed mb-4">
                      {exp.description}
                    </p>

                    {/* Expanding checklist logs details */}
                    {isActive ? (
                      <div className="space-y-4 pt-4 border-t border-[rgba(0,219,231,0.15)] animate-in fade-in slide-in-from-top-2 duration-300">
                        <span className="block font-mono text-[10px] text-[#00f2ff] uppercase tracking-wider">
                          🛠 SYSTEM DIAGNOSTIC ACCOMPLISHMENTS:
                        </span>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {exp.detailedPoints.map((point, index) => (
                            <li key={index} className="flex gap-2.5 text-xs text-[#b9cacb] leading-relaxed pl-1.5">
                              <span className="text-[#00f2ff] shrink-0 font-bold select-none text-[11px]">✔</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#00f2ff] bg-[rgba(0,219,231,0.04)] px-2.5 py-1 border border-[rgba(0,219,231,0.15)] rounded hover:border-[#00f2ff] transition-colors uppercase">
                          Deploy Details <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: SKILLS */}
        <section id="skills" className="scroll-mt-24">
          <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-display font-semibold text-3xl md:text-4xl text-white tracking-widest flex items-center gap-3">
                <span className="text-[#00f2ff]">◼</span> Skills
              </h2>
              <button
                onClick={() => openAdminAtTab('skills')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#00f2ff]/40 bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-xs font-mono text-[#00f2ff] transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>기술 목록 편집</span>
              </button>
            </div>
            <p className="font-sans text-sm text-[#b9cacb] max-w-2xl leading-relaxed pl-4 border-l border-[rgba(0,219,231,0.25)]">
              경험과 대회 준비를 통해 실전 배포 및 테스팅에 활용하는 전문 기술과 핵심 역량 칩입니다. 단추를 눌러 해당 기술이 스며든 로봇 프로젝트를 직접 필터링해보세요!
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto p-6 bg-[#171932]/40 border border-[rgba(0,219,231,0.15)] rounded-2xl glow-cyan-hover transition-all">
            {skills.map((skill) => {
              const isSelected = selectedSkill === skill.name;
              return (
                <button
                  key={skill.name}
                  onClick={() => handleSkillToggle(skill.name)}
                  className={`relative group px-4 py-2.5 rounded-xl font-mono text-xs transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#00f2ff] text-black border-[#00f2ff] font-bold shadow-[0_0_15px_rgba(0,242,255,0.45)]'
                      : 'bg-[#0c0d24] border border-[rgba(0,219,231,0.2)] hover:border-[#00f2ff] hover:bg-[#151739] text-[#b9cacb] hover:text-[#00f2ff]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black animate-pulse' : 'bg-[#00f2ff]'}`} />
                    {skill.name}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedSkill && (
            <p className="text-center font-mono text-xs text-[#00f2ff] mt-4 uppercase animate-pulse">
              ▲ CURRENT ACTIVE filter: "{selectedSkill}" // CLICK AGAIN TO RESET ALL
            </p>
          )}
        </section>

        {/* SECTION 4: CERTIFICATIONS & AWARDS */}
        <section id="awards" className="scroll-mt-24">
          <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-display font-semibold text-3xl md:text-4xl text-white tracking-widest flex items-center gap-3">
                <span className="text-[#00f2ff]">◼</span> Certifications & Awards
              </h2>
              <button
                onClick={() => openAdminAtTab('awards')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#00f2ff]/40 bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-xs font-mono text-[#00f2ff] transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>수상 내역 편집</span>
              </button>
            </div>
            <p className="font-sans text-sm text-[#b9cacb] max-w-2xl leading-relaxed pl-4 border-l border-[rgba(0,219,231,0.25)]">
              치열한 협업과 전압 한계를 뚫어내며 무대 위에서 이륙한 공식 영광의 트로피 보드입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {awards.map((award) => (
              <div 
                key={award.id}
                className="group relative flex items-center gap-5 p-6 rounded-2xl bg-[#1b1d3a]/60 border border-[rgba(0,219,231,0.2)] hover:border-[#00f2ff] glow-cyan-hover transition-all duration-350"
              >
                {/* Visual Icon Trophy with circular glow */}
                <div className="w-14 h-14 shrink-0 rounded-xl bg-[rgba(0,219,231,0.05)] border border-[rgba(0,219,231,0.25)] flex items-center justify-center text-[#00f2ff] transition-all duration-300 group-hover:bg-[rgba(0,219,231,0.12)] group-hover:scale-105 group-hover:glow-cyan">
                  <AwardIcon className="w-6 h-6 animate-pulse" />
                </div>

                <div className="space-y-1 flex-1">
                  <span className="font-mono text-[9px] text-[#00f2ff] bg-[rgba(0,219,231,0.1)] px-2 py-0.5 rounded border border-[#00f2ff]/20">
                    CLASS: {award.year}
                  </span>
                  <h3 className="font-display font-bold text-base text-white tracking-tight group-hover:text-[#00f2ff] transition-colors pt-1">
                    {award.title}
                  </h3>
                  <p className="font-mono text-xs text-[#b9cacb] flex items-center gap-1.5">
                    <span>{award.category}</span>
                    <span className="text-[#00f2ff] font-bold">•</span>
                    <span className="text-[#00f2ff] font-semibold text-glow-cyan-soft bg-[rgba(0,219,231,0.05)] px-1.5 rounded">{award.rank}</span>
                  </p>
                </div>

                {/* Direct edit button */}
                <button
                  onClick={() => openAdminAtTab('awards')}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-[#00f2ff] transition-opacity"
                  title="수상 내역 수정"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: PORTFOLIO (Interactive Project Grid) */}
        <section id="portfolio" className="scroll-mt-24">
          <div className="space-y-4 mb-10 pb-2 border-b border-[rgba(0,219,231,0.15)] flex justify-between items-end flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display font-semibold text-3xl md:text-4xl text-white tracking-widest flex items-center gap-3">
                  <span className="text-[#00f2ff]">◼</span> Portfolio
                </h2>
                <button
                  onClick={() => openAdminAtTab('projects')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#00f2ff]/40 bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-xs font-mono text-[#00f2ff] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 프로젝트 추가/관리</span>
                </button>
              </div>
              <p className="font-sans text-sm text-[#b9cacb] max-w-2xl leading-relaxed mt-2.5">
                완성도 높은 로봇 프로덕트와 쾌적한 펌웨어 디버깅 웹앱 결과물을 아래에서 검토하십시오.
              </p>
            </div>
            {selectedSkill && (
              <button
                onClick={() => setSelectedSkill(null)}
                className="px-3.5 py-1.5 rounded-lg border border-red-500/40 bg-red-950/20 text-red-400 font-mono text-[10px] hover:bg-red-500 hover:text-black hover:border-red-500 transition-all font-semibold select-none"
              >
                RESET_FILTER (SHOW_ALL)
              </button>
            )}
          </div>

          {/* Cards Flex responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-stretch">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col justify-between rounded-2xl bg-[#1b1d36]/70 border border-[rgba(0,219,231,0.2)] hover:border-[#00f2ff] shadow-lg overflow-hidden glow-cyan-hover transition-all duration-350 relative scanline"
              >
                {/* Thin top glow lines */}
                <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
                
                {/* Graphic Area */}
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#070815] border-b border-[rgba(0,219,231,0.15)]">
                    <img
                      src={project.image}
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-transform duration-750 group-hover:scale-[1.03]"
                    />
                    
                    {/* Hover technology chip overlay */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded bg-black/75 border border-[rgba(0,219,231,0.25)] font-mono text-[9px] text-[#e0e0ff] tracking-tight"
                        >
                          #{tech}
                        </span>
                      ))}
                    </div>

                    {/* Quick project edit button on card image hover */}
                    <button
                      onClick={() => openAdminAtTab('projects', project.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 border border-[#00f2ff]/40 text-[#00f2ff] opacity-0 group-hover:opacity-100 hover:scale-110 transition-all text-xs flex items-center gap-1 font-mono"
                      title="이 프로젝트 내용 수정"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>수정</span>
                    </button>
                  </div>

                  {/* Context Text Area */}
                  <div className="p-6 space-y-3.5">
                    <h3 className="font-display font-extrabold text-[#e0e0ff] text-xl group-hover:text-[#00f2ff] transition-colors leading-tight">
                      {project.title}
                    </h3>
                    <p className="font-sans text-sm text-[#b9cacb] leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Hardware Spec Badges & View Actions */}
                <div className="p-6 pt-0 border-t border-[rgba(0,219,231,0.1)] mt-auto bg-[#0d0f2b]/50">
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <span className="font-mono text-[9px] text-[#b9cacb]/80 flex items-center gap-1.5 uppercase">
                      <Cpu className="w-3.5 h-3.5 text-[#00f2ff]" />
                      HW_SPEC: AT_BUS_CORE
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAdminAtTab('projects', project.id)}
                        className="px-3 py-1.5 bg-[rgba(0,219,231,0.08)] border border-[rgba(0,219,231,0.3)] hover:border-[#00f2ff] text-xs font-mono text-[#b9cacb] hover:text-[#00f2ff] rounded-lg transition-all"
                        title="프로젝트 내용 수정"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="px-4 py-2 bg-transparent border border-[rgba(0,219,231,0.4)] hover:border-[#00f2ff] text-xs font-mono font-bold hover:bg-[rgba(0,219,231,0.08)] text-[#00f2ff] rounded-lg text-glow-cyan-soft transition-all"
                      >
                        VIEW DETAIL // INSP
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16 border border-dashed border-[rgba(0,219,231,0.2)] rounded-2xl bg-[#171932]/20">
              <Compass className="w-12 h-12 mx-auto text-[rgba(0,219,231,0.4)] mb-3 animate-spin" />
              <p className="font-display font-medium text-base text-[#e0e0ff] mb-1">매칭되는 로봇 포트폴리오 원소가 없습니다.</p>
              <button
                onClick={() => setSelectedSkill(null)}
                className="mt-3 px-4 py-2 border border-[#00f2ff] rounded-lg text-xs font-mono text-[#00f2ff] hover:bg-[#00f2ff]/10"
              >
                CLEAR FILTER (SHOW_ALL)
              </button>
            </div>
          )}
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#07081a] border-t border-[rgba(0,219,231,0.15)] py-12 px-6 mt-32 text-xs select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h4 className="font-display font-bold text-base text-glow-cyan-soft text-white">
                My Robot Portfolio
              </h4>
              <button
                onClick={() => openAdminAtTab('profile')}
                className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#00f2ff]/30 text-[#00f2ff] hover:bg-[#00f2ff]/10"
              >
                관리자 수정
              </button>
            </div>
            <p className="text-[#b9cacb]/70 font-sans tracking-tight">
              © {new Date().getFullYear()} My Robot Portfolio. All rights reserved. 
              <span className="block mt-0.5 font-mono text-[11px] text-[#b9cacb]/55">
                Student: {profile.studentName} • Email: {profile.email}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href={profile.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#b9cacb] hover:text-[#00f2ff] font-mono transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a 
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 text-[#b9cacb] hover:text-[#00f2ff] font-mono transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Portfolio</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Robot Companion chatbot */}
      <RobotAssistant />

      {/* Diagnostics Insight Modal panel */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {/* Admin Editor Modal */}
      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        projects={projects}
        onUpdateProjects={handleUpdateProjects}
        experiences={experiences}
        onUpdateExperiences={handleUpdateExperiences}
        skills={skills}
        onUpdateSkills={handleUpdateSkills}
        awards={awards}
        onUpdateAwards={handleUpdateAwards}
        onResetToDefault={handleResetToDefault}
        initialTab={adminTab}
        targetProjectId={adminTargetProjectId}
      />

    </div>
  );
}
