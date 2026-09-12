import React, { useState, useEffect } from 'react';
import { 
  Project, Experience, Skill, Award, ProfileData, HardwareItem 
} from '../types';
import { 
  X, Save, RotateCcw, Plus, Trash2, Edit3, Image as ImageIcon, 
  Check, Shield, Sparkles, FolderKanban, Trophy, Briefcase, Cpu, Layers,
  Lock, AlertCircle, KeyRound, LogOut
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onUpdateProfile: (data: ProfileData) => void;
  projects: Project[];
  onUpdateProjects: (projects: Project[]) => void;
  experiences: Experience[];
  onUpdateExperiences: (experiences: Experience[]) => void;
  skills: Skill[];
  onUpdateSkills: (skills: Skill[]) => void;
  awards: Award[];
  onUpdateAwards: (awards: Award[]) => void;
  onResetToDefault: () => void;
  initialTab?: 'profile' | 'projects' | 'experience' | 'skills' | 'awards';
  targetProjectId?: string | null;
}

export default function AdminModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  projects,
  onUpdateProjects,
  experiences,
  onUpdateExperiences,
  skills,
  onUpdateSkills,
  awards,
  onUpdateAwards,
  onResetToDefault,
  initialTab = 'profile',
  targetProjectId = null
}: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'experience' | 'skills' | 'awards'>(initialTab);
  const [saveToast, setSaveToast] = useState(false);

  // Security Authentication states (Password: 6767)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sirus_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Local draft states
  const [draftProfile, setDraftProfile] = useState<ProfileData>(profile);
  const [draftProjects, setDraftProjects] = useState<Project[]>(projects);
  const [draftExperiences, setDraftExperiences] = useState<Experience[]>(experiences);
  const [draftSkills, setDraftSkills] = useState<Skill[]>(skills);
  const [draftAwards, setDraftAwards] = useState<Award[]>(awards);

  // Active editing project
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    targetProjectId || (projects.length > 0 ? projects[0].id : '')
  );

  useEffect(() => {
    if (isOpen) {
      setDraftProfile(profile);
      setDraftProjects(projects);
      setDraftExperiences(experiences);
      setDraftSkills(skills);
      setDraftAwards(awards);
      if (initialTab) setActiveTab(initialTab);
      if (targetProjectId) setSelectedProjectId(targetProjectId);
      else if (projects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projects[0].id);
      }
    }
  }, [isOpen, profile, projects, experiences, skills, awards, initialTab, targetProjectId]);

  if (!isOpen) return null;

  // Password verification (6767)
  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === '6767') {
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
      try {
        sessionStorage.setItem('sirus_admin_auth', 'true');
      } catch {}
    } else {
      setAuthError('비밀번호가 올바르지 않습니다. (ACCESS DENIED)');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPasswordInput('');
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (passwordInput.length < 8) {
      const nextVal = passwordInput + digit;
      setPasswordInput(nextVal);
      setAuthError(null);
      if (nextVal === '6767') {
        setIsAuthenticated(true);
        setAuthError(null);
        setPasswordInput('');
        try {
          sessionStorage.setItem('sirus_admin_auth', 'true');
        } catch {}
      }
    }
  };

  const handleKeypadBackspace = () => {
    setPasswordInput(prev => prev.slice(0, -1));
    setAuthError(null);
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
    try {
      sessionStorage.removeItem('sirus_admin_auth');
    } catch {}
  };

  const handleSaveAll = () => {
    onUpdateProfile(draftProfile);
    onUpdateProjects(draftProjects);
    onUpdateExperiences(draftExperiences);
    onUpdateSkills(draftSkills);
    onUpdateAwards(draftAwards);

    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
    }, 2500);
  };

  const handleReset = () => {
    if (window.confirm('정말 모든 데이터를 초기 기본 상태로 복원하시겠습니까? (작성한 내용이 초기화됩니다)')) {
      onResetToDefault();
      onClose();
    }
  };

  // --- Project Helpers ---
  const currentEditingProject = draftProjects.find(p => p.id === selectedProjectId) || draftProjects[0];

  const handleUpdateCurrentProject = (patch: Partial<Project>) => {
    if (!currentEditingProject) return;
    setDraftProjects(prev => prev.map(p => p.id === currentEditingProject.id ? { ...p, ...patch } : p));
  };

  const handleAddNewProject = () => {
    const newId = `project-${Date.now()}`;
    const newProject: Project = {
      id: newId,
      title: '새 로봇 프로젝트',
      description: '프로젝트에 대한 간단한 한 줄 요약입니다.',
      image: '/src/assets/images/line_tracing_1779515195312.png',
      techStack: ['Arduino', 'Motor', 'C++'],
      longDescription: '프로젝트의 목적과 제작 과정에 대한 상세 설명을 작성하세요.',
      hardwareSpec: [
        { component: '메인 컨트롤러', spec: 'Arduino Uno' },
        { component: '구동 모터', spec: 'DC Geared 모터 2개' }
      ],
      softwareDetails: '제어 알고리즘 및 소프트웨어 구조 설명',
      codeSnippet: `// New Robot Code Snippet\nvoid setup() {\n  Serial.begin(115200);\n}\nvoid loop() {\n  // your code here\n}`,
      simulateLogs: [
        { timestamp: '00:01.00', type: 'INFO', message: 'System Initialized.' }
      ]
    };
    setDraftProjects(prev => [...prev, newProject]);
    setSelectedProjectId(newId);
  };

  const handleDeleteProject = (id: string) => {
    if (draftProjects.length <= 1) {
      alert('최소 1개의 프로젝트는 유지되어야 합니다.');
      return;
    }
    if (window.confirm('이 프로젝트를 삭제하시겠습니까?')) {
      const remaining = draftProjects.filter(p => p.id !== id);
      setDraftProjects(remaining);
      if (selectedProjectId === id) {
        setSelectedProjectId(remaining[0].id);
      }
    }
  };

  const handleAddHardwareSpec = () => {
    if (!currentEditingProject) return;
    const currentSpecs = currentEditingProject.hardwareSpec || [];
    handleUpdateCurrentProject({
      hardwareSpec: [...currentSpecs, { component: '새 부품', spec: '사양 입력' }]
    });
  };

  const handleUpdateHardwareSpec = (index: number, key: 'component' | 'spec', val: string) => {
    if (!currentEditingProject) return;
    const currentSpecs = [...currentEditingProject.hardwareSpec];
    currentSpecs[index][key] = val;
    handleUpdateCurrentProject({ hardwareSpec: currentSpecs });
  };

  const handleDeleteHardwareSpec = (index: number) => {
    if (!currentEditingProject) return;
    const currentSpecs = currentEditingProject.hardwareSpec.filter((_, i) => i !== index);
    handleUpdateCurrentProject({ hardwareSpec: currentSpecs });
  };

  // --- Experience Helpers ---
  const handleAddExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: '새 로봇 대회 / 활동',
      team: 'Team Name',
      role: 'Role / Programmer',
      description: '활동 개요 및 내용을 입력하세요.',
      detailedPoints: ['주요 성과 1', '주요 성과 2']
    };
    setDraftExperiences(prev => [newExp, ...prev]);
  };

  const handleDeleteExperience = (id: string) => {
    setDraftExperiences(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateExperience = (id: string, patch: Partial<Experience>) => {
    setDraftExperiences(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  // --- Awards Helpers ---
  const handleAddAward = () => {
    const newAward: Award = {
      id: `award-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: '대회 이름',
      category: '부문 / 종목',
      rank: '수상 명칭 (예: 금상, 1위)'
    };
    setDraftAwards(prev => [newAward, ...prev]);
  };

  const handleDeleteAward = (id: string) => {
    setDraftAwards(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateAward = (id: string, patch: Partial<Award>) => {
    setDraftAwards(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  };

  // --- Skills Helpers ---
  const handleAddSkill = () => {
    const newSkill: Skill = {
      name: '새 기술 이름',
      category: 'Coding',
      proficiency: 80
    };
    setDraftSkills(prev => [...prev, newSkill]);
  };

  const handleDeleteSkill = (name: string) => {
    setDraftSkills(prev => prev.filter(s => s.name !== name));
  };

  const handleUpdateSkill = (index: number, patch: Partial<Skill>) => {
    setDraftSkills(prev => prev.map((s, i) => i === index ? { ...s, ...patch } : s));
  };

  // If not authenticated, require password (6767)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
          onClick={onClose}
        />
        
        {/* Security Lock Card */}
        <div 
          id="admin-security-auth-modal"
          className={`relative bg-[#0d0f26] border border-[#00f2ff]/40 shadow-[0_0_50px_rgba(0,219,231,0.25)] rounded-2xl w-full max-w-md p-6 overflow-hidden text-[#e0e0ff] animate-in fade-in zoom-in-95 duration-200 ${
            isShaking ? 'border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.5)] translate-x-[-4px] transition-transform' : ''
          }`}
        >
          {/* Top cyber glow bar */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00dbe7] via-[#00f2ff] to-[#74f5ff] shadow-[0_0_12px_#00f2ff]" />
          
          {/* Close / Cancel Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#b9cacb] hover:text-white hover:bg-white/5 transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header & Lock Graphic */}
          <div className="text-center space-y-3 mb-6 pt-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00f2ff]/10 border border-[#00f2ff]/40 flex items-center justify-center text-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.25)]">
              <Lock className="w-7 h-7 animate-pulse text-[#00f2ff]" />
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-[#00f2ff] uppercase tracking-widest font-semibold">
                <Shield className="w-3 h-3" />
                <span>SECURITY_GATE // ACCESS_LEVEL_4</span>
              </div>
              <h2 className="font-display font-bold text-xl text-white mt-1">
                관리자 비밀번호 확인
              </h2>
              <p className="text-xs text-[#b9cacb] mt-1">
                포트폴리오 내용 수정 모드에 접근하려면 비밀번호를 입력하세요.
              </p>
            </div>
          </div>

          {/* Form & PIN Input */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* PIN Slot Visualizer */}
            <div className="flex justify-center items-center gap-3 my-2">
              {[0, 1, 2, 3].map((slotIdx) => {
                const filled = passwordInput.length > slotIdx;
                return (
                  <div
                    key={slotIdx}
                    className={`w-12 h-14 rounded-xl border flex items-center justify-center font-mono text-xl font-bold transition-all duration-200 ${
                      filled
                        ? 'border-[#00f2ff] bg-[#00f2ff]/15 text-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.35)] scale-105'
                        : 'border-[rgba(0,219,231,0.2)] bg-[#070817] text-gray-500'
                    }`}
                  >
                    {filled ? '●' : '·'}
                  </div>
                );
              })}
            </div>

            {/* Direct Keyboard Input */}
            <div className="relative">
              <input
                type="password"
                autoFocus
                maxLength={8}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(null);
                  if (e.target.value === '6767') {
                    setIsAuthenticated(true);
                    try {
                      sessionStorage.setItem('sirus_admin_auth', 'true');
                    } catch {}
                  }
                }}
                placeholder="비밀번호 입력 (6767)"
                className="w-full bg-[#050614] border border-[rgba(0,219,231,0.25)] focus:border-[#00f2ff] rounded-xl px-4 py-2.5 text-center font-mono text-sm tracking-widest text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00f2ff]"
              />
            </div>

            {/* Error Message if wrong */}
            {authError && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-mono bg-red-950/40 border border-red-500/40 py-2 px-3 rounded-lg animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* On-screen Keypad for easy clicking */}
            <div className="grid grid-cols-3 gap-2 pt-2 select-none">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  type="button"
                  key={digit}
                  onClick={() => handleKeypadPress(digit)}
                  className="py-3 rounded-xl bg-[#141635] hover:bg-[#1c1f4a] active:bg-[#00f2ff]/20 border border-[rgba(0,219,231,0.15)] hover:border-[#00f2ff]/50 font-mono text-base font-semibold text-white transition-all active:scale-95"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="py-3 rounded-xl bg-[#141635] hover:bg-red-950/40 active:bg-red-950 border border-[rgba(0,219,231,0.15)] text-gray-400 hover:text-red-400 font-mono text-xs font-semibold transition-all active:scale-95"
              >
                지우기
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 rounded-xl bg-[#141635] hover:bg-[#1c1f4a] active:bg-[#00f2ff]/20 border border-[rgba(0,219,231,0.15)] hover:border-[#00f2ff]/50 font-mono text-base font-semibold text-white transition-all active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handlePasswordSubmit()}
                className="py-3 rounded-xl bg-gradient-to-r from-[#00dbe7] to-[#00f2ff] active:scale-95 text-black font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:brightness-110 transition-all"
              >
                확인
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-4 pt-3 border-t border-[rgba(0,219,231,0.1)] flex items-center justify-between text-[11px] font-mono text-gray-500">
            <span className="text-[#00f2ff]/70">PASSWORD: 4 DIGITS</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#00f2ff] transition-colors"
            >
              닫기 (Cancel)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Main Admin Box */}
      <div 
        id="admin-dashboard-modal"
        className="relative bg-[#0d0f26] border border-[#00f2ff]/30 shadow-[0_0_50px_rgba(0,219,231,0.25)] rounded-2xl w-full max-w-5xl h-[90vh] max-h-[850px] flex flex-col overflow-hidden text-[#e0e0ff] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Glowing Ribbon */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#00dbe7] via-[#00f2ff] to-[#74f5ff] shadow-[0_0_12px_#00f2ff]" />

        {/* Header */}
        <div className="px-6 py-4 bg-[#08091a] border-b border-[rgba(0,219,231,0.15)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex items-center justify-center text-[#00f2ff]">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white tracking-wide">
                  관리자 포트폴리오 편집기 (Admin Editor)
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-[#00f2ff]/30 font-mono text-[10px] text-[#00f2ff]">
                  ADMIN_MODE
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  SUPABASE_REALTIME
                </span>
              </div>
              <p className="text-xs text-[#b9cacb]">
                소개글, 프로젝트, 사진 링크, 수상 내역, 기술 스택을 자유롭게 수정하고 실시간으로 저장하세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveToast && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-green-500/20 border border-green-400/40 text-green-400 text-xs font-mono animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> 저장 완료!
              </span>
            )}

            {/* Lock (Logout) Button */}
            <button
              onClick={handleLock}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-500 hover:text-black text-xs font-mono transition-all mr-1"
              title="관리자 권한 잠금 (비밀번호 다시 요구)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>잠금</span>
            </button>

            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00dbe7] to-[#00f2ff] text-black font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:scale-[1.02] transition-all"
            >
              <Save className="w-3.5 h-3.5" /> 변경사항 저장
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#b9cacb] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#0a0c20] border-b border-[rgba(0,219,231,0.15)] px-6 overflow-x-auto">
          {[
            { id: 'profile', label: '1. 기본 소개 (About & Hero)', icon: Briefcase },
            { id: 'projects', label: '2. 로봇 프로젝트 (Projects)', icon: FolderKanban },
            { id: 'experience', label: '3. 대회/경력 (Experience)', icon: Layers },
            { id: 'awards', label: '4. 수상 내역 (Awards)', icon: Trophy },
            { id: 'skills', label: '5. 보유 기술 (Skills)', icon: Cpu }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                  isActive 
                    ? 'border-[#00f2ff] text-[#00f2ff] font-bold bg-[#00f2ff]/5' 
                    : 'border-transparent text-[#b9cacb] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0c0e24]">
          
          {/* TAB 1: Profile & Hero */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="bg-[#151739]/60 border border-[rgba(0,219,231,0.15)] rounded-xl p-5 space-y-4">
                <h3 className="font-display font-semibold text-sm text-[#00f2ff] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 히어로 헤드라인 문구
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-[#b9cacb] mb-1">메인 타이틀 (흰색)</label>
                    <input
                      type="text"
                      className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                      value={draftProfile.titlePrimary}
                      onChange={e => setDraftProfile({ ...draftProfile, titlePrimary: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-[#b9cacb] mb-1">강조 타이틀 (네온 그라데이션)</label>
                    <input
                      type="text"
                      className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-[#00f2ff] focus:outline-none focus:border-[#00f2ff]"
                      value={draftProfile.titleGradient}
                      onChange={e => setDraftProfile({ ...draftProfile, titleGradient: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#b9cacb] mb-1">서브 타이틀 (한 줄 설명)</label>
                  <input
                    type="text"
                    className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                    value={draftProfile.subtitle}
                    onChange={e => setDraftProfile({ ...draftProfile, subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-[#151739]/60 border border-[rgba(0,219,231,0.15)] rounded-xl p-5 space-y-4">
                <h3 className="font-display font-semibold text-sm text-[#00f2ff] uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> 상세 소개 본문 및 다짐 문구
                </h3>

                <div>
                  <label className="block font-mono text-xs text-[#b9cacb] mb-1">소개 본문 - 첫 번째 단락</label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                    value={draftProfile.introParagraph1}
                    onChange={e => setDraftProfile({ ...draftProfile, introParagraph1: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#b9cacb] mb-1">소개 본문 - 두 번째 단락</label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                    value={draftProfile.introParagraph2}
                    onChange={e => setDraftProfile({ ...draftProfile, introParagraph2: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#b9cacb] mb-1">하단 인용구 / 목표 문구</label>
                  <input
                    type="text"
                    className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-[#00f2ff] focus:outline-none focus:border-[#00f2ff]"
                    value={draftProfile.quote}
                    onChange={e => setDraftProfile({ ...draftProfile, quote: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-[#151739]/60 border border-[rgba(0,219,231,0.15)] rounded-xl p-5 space-y-4">
                <h3 className="font-display font-semibold text-sm text-[#00f2ff] uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> 대표 로봇 이미지 및 연락처 정보
                </h3>

                <div>
                  <label className="block font-mono text-xs text-[#b9cacb] mb-1">
                    대표 이미지 URL (온라인 이미지 링크 또는 로컬 이미지 경로)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                    placeholder="https://... 또는 /src/assets/..."
                    value={draftProfile.heroImage}
                    onChange={e => setDraftProfile({ ...draftProfile, heroImage: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-[#b9cacb] mb-1">학생 / 작성자 이름</label>
                    <input
                      type="text"
                      className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                      value={draftProfile.studentName}
                      onChange={e => setDraftProfile({ ...draftProfile, studentName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-[#b9cacb] mb-1">이메일 주소</label>
                    <input
                      type="text"
                      className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                      value={draftProfile.email}
                      onChange={e => setDraftProfile({ ...draftProfile, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-[#b9cacb] mb-1">GitHub 링크</label>
                    <input
                      type="text"
                      className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                      value={draftProfile.githubUrl}
                      onChange={e => setDraftProfile({ ...draftProfile, githubUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Projects */}
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
              {/* Projects Sidebar List */}
              <div className="lg:col-span-4 bg-[#151739]/60 border border-[rgba(0,219,231,0.15)] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[rgba(0,219,231,0.1)] pb-2">
                  <span className="font-mono text-xs font-semibold text-[#00f2ff] uppercase">
                    Projects ({draftProjects.length})
                  </span>
                  <button
                    onClick={handleAddNewProject}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30 text-xs font-mono transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> 추가
                  </button>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
                  {draftProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group ${
                        selectedProjectId === p.id 
                          ? 'bg-[#00f2ff]/10 border-[#00f2ff] text-white shadow-[0_0_10px_rgba(0,242,255,0.2)]' 
                          : 'bg-[#0a0b1e] border-[rgba(0,219,231,0.15)] hover:border-[#00f2ff]/50 text-[#b9cacb]'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-xs truncate">{p.title}</div>
                        <div className="font-mono text-[10px] text-gray-500 truncate">{p.techStack.join(', ')}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(p.id);
                        }}
                        className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-60 group-hover:opacity-100"
                        title="프로젝트 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editing Project Details Panel */}
              <div className="lg:col-span-8 bg-[#151739]/60 border border-[rgba(0,219,231,0.15)] rounded-xl p-5 space-y-4">
                {currentEditingProject ? (
                  <>
                    <div className="border-b border-[rgba(0,219,231,0.1)] pb-3 flex items-center justify-between">
                      <h4 className="font-display font-semibold text-sm text-[#00f2ff] flex items-center gap-2">
                        <Edit3 className="w-4 h-4" /> 프로젝트 편집: {currentEditingProject.title}
                      </h4>
                      <span className="font-mono text-[10px] text-gray-400">ID: {currentEditingProject.id}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-xs text-[#b9cacb] mb-1">프로젝트 제목</label>
                        <input
                          type="text"
                          className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                          value={currentEditingProject.title}
                          onChange={e => handleUpdateCurrentProject({ title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-[#b9cacb] mb-1">
                          기술 스택 태그 (쉼표로 구분)
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                          placeholder="Color Sensor, Motor Control, C++"
                          value={currentEditingProject.techStack.join(', ')}
                          onChange={e => handleUpdateCurrentProject({
                            techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#b9cacb] mb-1">카드 한 줄 요약 설명</label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                        value={currentEditingProject.description}
                        onChange={e => handleUpdateCurrentProject({ description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#b9cacb] mb-1">
                        대표 이미지 URL (온라인 이미지 링크 가능)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                        placeholder="https://... 또는 /src/assets/images/..."
                        value={currentEditingProject.image}
                        onChange={e => handleUpdateCurrentProject({ image: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#b9cacb] mb-1">프로젝트 상세 설명 (모달 팝업용)</label>
                      <textarea
                        rows={3}
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                        value={currentEditingProject.longDescription}
                        onChange={e => handleUpdateCurrentProject({ longDescription: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#b9cacb] mb-1">제어 로직 & 소프트웨어 알고리즘 설명</label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f2ff]"
                        value={currentEditingProject.softwareDetails}
                        onChange={e => handleUpdateCurrentProject({ softwareDetails: e.target.value })}
                      />
                    </div>

                    {/* Hardware Specs table editor */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-xs text-[#00f2ff] uppercase">하드웨어 부품 사양 목록 (BOM)</label>
                        <button
                          onClick={handleAddHardwareSpec}
                          className="px-2 py-0.5 rounded bg-[#00f2ff]/10 text-[#00f2ff] text-[11px] font-mono hover:bg-[#00f2ff]/20"
                        >
                          + 부품 추가
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                        {(currentEditingProject.hardwareSpec || []).map((spec, sIdx) => (
                          <div key={sIdx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              className="w-1/3 bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded px-2.5 py-1 text-xs text-white"
                              placeholder="부품명"
                              value={spec.component}
                              onChange={e => handleUpdateHardwareSpec(sIdx, 'component', e.target.value)}
                            />
                            <input
                              type="text"
                              className="flex-1 bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded px-2.5 py-1 text-xs text-[#b9cacb]"
                              placeholder="부품 사양"
                              value={spec.spec}
                              onChange={e => handleUpdateHardwareSpec(sIdx, 'spec', e.target.value)}
                            />
                            <button
                              onClick={() => handleDeleteHardwareSpec(sIdx)}
                              className="text-gray-500 hover:text-red-400 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Code Snippet Editor */}
                    <div className="space-y-1 pt-2">
                      <label className="block font-mono text-xs text-[#b9cacb]">임베디드 제어 소스 코드 스니펫</label>
                      <textarea
                        rows={5}
                        className="w-full bg-[#050614] border border-[rgba(0,219,231,0.2)] rounded-lg p-3 text-xs font-mono text-[#a5d6ff] focus:outline-none focus:border-[#00f2ff]"
                        value={currentEditingProject.codeSnippet}
                        onChange={e => handleUpdateCurrentProject({ codeSnippet: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-12">편집할 프로젝트를 선택하세요.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Experience */}
          {activeTab === 'experience' && (
            <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-[#00f2ff] uppercase">대회 및 활동 목록 ({draftExperiences.length})</span>
                <button
                  onClick={handleAddExperience}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30 text-xs font-mono transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> 새 활동 추가
                </button>
              </div>

              {draftExperiences.map((exp, idx) => (
                <div key={exp.id} className="bg-[#151739]/60 border border-[rgba(0,219,231,0.2)] rounded-xl p-5 space-y-3 relative group">
                  <div className="flex items-center justify-between border-b border-[rgba(0,219,231,0.1)] pb-2.5">
                    <span className="font-mono text-xs text-[#00f2ff] font-bold">Item #{idx + 1}</span>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-mono text-[11px] text-[#b9cacb] mb-1">연도 (Year)</label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-1.5 text-xs text-white"
                        value={exp.year}
                        onChange={e => handleUpdateExperience(exp.id, { year: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-mono text-[11px] text-[#b9cacb] mb-1">대회 / 활동명</label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-1.5 text-xs text-white"
                        value={exp.title}
                        onChange={e => handleUpdateExperience(exp.id, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-[#b9cacb] mb-1">팀 이름</label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-1.5 text-xs text-white"
                        value={exp.team || ''}
                        onChange={e => handleUpdateExperience(exp.id, { team: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[11px] text-[#b9cacb] mb-1">역할 (Role)</label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-1.5 text-xs text-white"
                        value={exp.role || ''}
                        onChange={e => handleUpdateExperience(exp.id, { role: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-[#b9cacb] mb-1">간략한 설명</label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg px-3 py-1.5 text-xs text-white"
                        value={exp.description}
                        onChange={e => handleUpdateExperience(exp.id, { description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-[#b9cacb] mb-1">
                      세부 성과 항목 (줄바꿈 단위로 1개씩 입력)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded-lg p-2.5 text-xs text-white"
                      value={exp.detailedPoints.join('\n')}
                      onChange={e => handleUpdateExperience(exp.id, {
                        detailedPoints: e.target.value.split('\n').filter(Boolean)
                      })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Awards */}
          {activeTab === 'awards' && (
            <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-[#00f2ff] uppercase">수상 내역 ({draftAwards.length})</span>
                <button
                  onClick={handleAddAward}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30 text-xs font-mono transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> 새 수상 내역 추가
                </button>
              </div>

              <div className="space-y-3">
                {draftAwards.map((award, idx) => (
                  <div key={award.id} className="bg-[#151739]/60 border border-[rgba(0,219,231,0.2)] rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center">
                    <div className="w-full md:w-24">
                      <label className="block font-mono text-[10px] text-gray-400 mb-0.5">연도</label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded px-2.5 py-1.5 text-xs text-white"
                        value={award.year}
                        onChange={e => handleUpdateAward(award.id, { year: e.target.value })}
                      />
                    </div>
                    <div className="w-full md:flex-1">
                      <label className="block font-mono text-[10px] text-gray-400 mb-0.5">대회명</label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded px-2.5 py-1.5 text-xs text-white"
                        value={award.title}
                        onChange={e => handleUpdateAward(award.id, { title: e.target.value })}
                      />
                    </div>
                    <div className="w-full md:w-36">
                      <label className="block font-mono text-[10px] text-gray-400 mb-0.5">종목/부문</label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded px-2.5 py-1.5 text-xs text-white"
                        value={award.category}
                        onChange={e => handleUpdateAward(award.id, { category: e.target.value })}
                      />
                    </div>
                    <div className="w-full md:w-36">
                      <label className="block font-mono text-[10px] text-[#00f2ff] mb-0.5">수상/순위</label>
                      <input
                        type="text"
                        className="w-full bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded px-2.5 py-1.5 text-xs text-[#00f2ff] font-bold"
                        value={award.rank}
                        onChange={e => handleUpdateAward(award.id, { rank: e.target.value })}
                      />
                    </div>
                    <div className="self-end md:self-center pt-2 md:pt-4">
                      <button
                        onClick={() => handleDeleteAward(award.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="수상 내역 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Skills */}
          {activeTab === 'skills' && (
            <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-[#00f2ff] uppercase">기술 목록 ({draftSkills.length})</span>
                <button
                  onClick={handleAddSkill}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30 text-xs font-mono transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> 새 기술 추가
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {draftSkills.map((skill, idx) => (
                  <div key={idx} className="bg-[#151739]/60 border border-[rgba(0,219,231,0.2)] rounded-xl p-3.5 flex items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded px-2.5 py-1 text-xs text-white font-medium"
                          value={skill.name}
                          onChange={e => handleUpdateSkill(idx, { name: e.target.value })}
                          placeholder="기술 이름"
                        />
                        <select
                          className="bg-[#08091a] border border-[rgba(0,219,231,0.2)] rounded px-2 py-1 text-xs text-[#00f2ff]"
                          value={skill.category}
                          onChange={e => handleUpdateSkill(idx, { category: e.target.value as any })}
                        >
                          <option value="Coding">Coding</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Methodology">Methodology</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-gray-400 w-12">숙련도:</span>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          className="flex-1 accent-[#00f2ff]"
                          value={skill.proficiency}
                          onChange={e => handleUpdateSkill(idx, { proficiency: Number(e.target.value) })}
                        />
                        <span className="font-mono text-[11px] text-[#00f2ff] w-8 text-right font-bold">
                          {skill.proficiency}%
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSkill(skill.name)}
                      className="p-1.5 text-gray-500 hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-[#08091a] border-t border-[rgba(0,219,231,0.15)] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 초기값으로 전체 복원
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[rgba(0,219,231,0.2)] rounded-lg text-xs font-mono text-[#b9cacb] hover:text-white hover:border-[#00f2ff] transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00dbe7] to-[#00f2ff] text-black font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:scale-[1.02] transition-all"
            >
              <Save className="w-4 h-4" /> 저장하고 닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
