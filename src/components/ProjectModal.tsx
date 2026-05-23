import { useState, useEffect, useRef } from 'react';
import { Project, LogEntry } from '../types';
import { X, Cpu, Terminal, Sparkles, Play, CheckCircle2, AlertTriangle, Info, Copy, Check } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'spec' | 'code' | 'telemetry'>('info');
  const [copied, setCopied] = useState(false);
  const [liveLogs, setLiveLogs] = useState<LogEntry[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project) return;
    setLiveLogs(project.simulateLogs);
    setActiveTab('info');
    setIsRunningDiagnostics(false);
    setDiagnosticProgress(0);
  }, [project]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [liveLogs]);

  if (!project) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runDiagnostics = () => {
    if (isRunningDiagnostics) return;
    setIsRunningDiagnostics(true);
    setDiagnosticProgress(0);
    setLiveLogs([
      { timestamp: '00:00.00', type: 'INFO', message: 'CRITICAL DIAGNOSTICS LAUNCHED.' }
    ]);

    const diagnosticSequence = [
      { delay: 400, log: { timestamp: '00:00.32', type: 'INFO', message: 'Probing hardware interfaces...' } },
      { delay: 1000, log: { timestamp: '00:00.85', type: 'SUCCESS', message: 'Main Controller response: AT_BUS_OK.' } },
      { delay: 1600, log: { timestamp: '00:01.40', type: 'INFO', message: 'Verifying continuous voltage inputs... Stable at 7.38V.' } },
      { delay: 2200, log: { timestamp: '00:01.92', type: 'SUCCESS', message: 'Actuator driver state: CONNECTED. 0 errors detected.' } },
      { delay: 3000, log: { timestamp: '00:02.50', type: 'WARNING', message: 'Sensor line 4 calibration deviation: +2.1%. Autocorrect active.' } },
      { delay: 3800, log: { timestamp: '00:03.11', type: 'SUCCESS', message: 'Feedback control loops unified & stabilized. (PID Ready)' } },
      { delay: 4300, log: { timestamp: '00:03.95', type: 'SUCCESS', message: 'DIAGNOSTIC TEST COMPLETE. ALL SYSTEMS OPERATE OPTIMALLY.' } }
    ];

    let timerSum = 0;
    
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setDiagnosticProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 90);

    diagnosticSequence.forEach((step, index) => {
      setTimeout(() => {
        setLiveLogs(prev => [...prev, step.log as LogEntry]);
        if (index === diagnosticSequence.length - 1) {
          setIsRunningDiagnostics(false);
          setDiagnosticProgress(100);
          clearInterval(progressInterval);
        }
      }, step.delay);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative bg-[#0f113a]/95 border border-[rgba(0,219,231,0.3)] shadow-[0_0_50px_rgba(0,219,231,0.2)] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-250 select-none text-[#e0e0ff] font-sans"
        id="project-detail-modal"
      >
        {/* Neon light bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00dbe7] to-[#00f2ff] shadow-[0_0_12px_#00f2ff]" />

        {/* Header */}
        <div className="px-6 py-5 border-b border-[rgba(0,219,231,0.15)] flex items-center justify-between bg-[#0a0b26]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(0,219,231,0.1)] border border-[rgba(0,219,231,0.25)] flex items-center justify-center">
              <Cpu className="w-4.5 h-4.5 text-[#00f2ff]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-[#e0e0ff] tracking-tight text-glow-cyan-soft">
                {project.title}
              </h3>
              <p className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-ping" />
                SYSTEM Inspect Module // {project.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#b9cacb] hover:text-[#00f2ff] hover:bg-[rgba(0,219,231,0.1)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(0,219,231,0.15)] bg-[#0b0d2d] px-6">
          {(['info', 'spec', 'code', 'telemetry'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 px-4 font-mono text-xs uppercase tracking-wider border-b-2 transition-all duration-200 -mb-[1px] ${
                activeTab === tab
                  ? 'border-[#00f2ff] text-[#00f2ff] font-semibold text-glow-cyan-soft bg-[rgba(0,219,231,0.03)]'
                  : 'border-transparent text-[#b9cacb] hover:text-[#e0e0ff]'
              }`}
            >
              {tab === 'info' && '1. Overview'}
              {tab === 'spec' && '2. Specifications'}
              {tab === 'code' && '3. Embedded Code'}
              {tab === 'telemetry' && '4. Real-time Diagnostic'}
            </button>
          ))}
        </div>

        {/* Main Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 bg-[#0f1134]">
          
          {/* Left Column: Visual Representation & Quick Stats */}
          <div className="w-full md:w-2/5 flex flex-col gap-4">
            <div className="relative rounded-xl overflow-hidden aspect-video border border-[rgba(0,219,231,0.2)] bg-black shadow-inner scanline">
              <img
                src={project.image}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 border border-[rgba(0,219,231,0.3)] font-mono text-[9px] text-[#00f2ff]">
                LIVE CAMERA FEED [01]
              </div>
            </div>

            {/* Quick Tech stats */}
            <div className="bg-[#17193c] border border-[rgba(0,219,231,0.15)] rounded-xl p-4">
              <h4 className="font-display font-medium text-xs uppercase text-[#00f2ff] tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Core Tech Matrix
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 rounded-md bg-[#0a0b1e] border border-[rgba(0,219,231,0.15)] font-mono text-[10px] text-[#e0e0ff]"
                  >
                    #{tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Software details box */}
            <div className="bg-[#1b1d44]/50 border border-[rgba(0,219,231,0.15)] rounded-xl p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-display font-medium text-xs uppercase text-[#00f2ff] tracking-wider mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> Control Logics Detail
                </h4>
                <p className="text-xs text-[#b9cacb] leading-relaxed">
                  {project.softwareDetails}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[rgba(0,219,231,0.1)] text-[10px] font-mono text-[#b9cacb]/70 flex items-center justify-between">
                <span>COM_INTERFACE: SERIAL_USB</span>
                <span>BAUD: 115200</span>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative / Interactive Elements */}
          <div className="w-full md:w-3/5 flex flex-col min-h-[350px]">
            {activeTab === 'info' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200 flex-1">
                <div className="bg-[rgba(0,219,231,0.02)] border-l-3 border-[#00f2ff] p-4 rounded-r-xl">
                  <h4 className="font-sans font-semibold text-sm text-[#00f2ff] mb-1">Project Concept</h4>
                  <p className="text-sm text-[#e0e0ff] leading-relaxed">
                    {project.longDescription}
                  </p>
                </div>

                <div className="mt-2 flex-1 flex flex-col justify-center border border-dashed border-[rgba(0,219,231,0.15)] p-5 rounded-xl text-center">
                  <Cpu className="w-10 h-10 text-[rgba(0,219,231,0.4)] mx-auto mb-3 animate-bounce" />
                  <p className="font-display font-medium text-sm text-[#e0e0ff] mb-1">
                    원하는 기술 탭을 선택하여 하드웨어 설계방식, 소스 코드 또는 실시간 가상 오류 진단을 체험해보세요.
                  </p>
                  <p className="text-xs text-[#b9cacb] max-w-md mx-auto leading-relaxed">
                    로봇 하드웨어의 부품 사양 명세부터 자율 기동 제어를 담당하는 펌웨어와 실제 동작 로그 시뮬레이션까지 모두 조밀하게 준비되어 있습니다.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'spec' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200 flex-1">
                <h4 className="font-display font-semibold text-sm text-[#00f2ff] uppercase tracking-wider flex items-center gap-2">
                  <span>◼</span> Hardware Bom Specification
                </h4>
                <div className="border border-[rgba(0,219,231,0.15)] rounded-xl overflow-hidden bg-[#0d0e2e]">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="bg-[#07081c] text-[#00f2ff] border-b border-[rgba(0,219,231,0.15)]">
                        <th className="p-3.5 font-semibold">파트 / 구성요소</th>
                        <th className="p-3.5 font-semibold">부품 사양 명세(Specification)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(0,219,231,0.1)] text-[#e0e0ff]">
                      {project.hardwareSpec.map((spec, i) => (
                        <tr key={i} className="hover:bg-[#15173f] transition-colors">
                          <td className="p-3.5 font-medium border-r border-[rgba(0,219,231,0.1)]">{spec.component}</td>
                          <td className="p-3.5 text-[#b9cacb]">{spec.spec}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-200 flex-1 relative min-h-[300px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#b9cacb] uppercase tracking-wider">
                    Firmware: {project.id === 'line-tracer' || project.id === 'sumo-robot' ? 'main.ino' : '/src/controller.cpp'}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#17193c] border border-[rgba(0,219,231,0.2)] text-[11px] font-mono text-[#e0e0ff] hover:text-[#00f2ff] hover:bg-[#1b1d4c] transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY_CODE</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Code Editor Mockup */}
                <div className="flex-1 bg-[#07081a] border border-[rgba(0,219,231,0.2)] rounded-xl p-4 font-mono text-xs overflow-y-auto max-h-[320px] shadow-inner select-text">
                  <pre className="text-[#a5d6ff]">
                    <code>{project.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'telemetry' && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-200 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-sm text-[#00f2ff] uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 animate-spin" /> Virtual System Telemetry
                  </h4>
                  <button
                    onClick={runDiagnostics}
                    disabled={isRunningDiagnostics}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all duration-300 ${
                      isRunningDiagnostics
                        ? 'bg-[rgba(0,219,231,0.05)] border border-[rgba(0,219,231,0.1)] text-[#b9cacb] cursor-not-allowed'
                        : 'bg-[#00dbe7] border border-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,219,231,0.3)] hover:glow-cyan-strong'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isRunningDiagnostics ? 'DIAG_RUNNING' : 'RUN DIAGNOSTICS'}</span>
                  </button>
                </div>

                {/* Progress bar container */}
                {isRunningDiagnostics && (
                  <div className="w-full bg-[#17193c] border border-[rgba(0,219,231,0.1)] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#00dbe7] to-[#00f2ff] h-full transition-all duration-100 shadow-[0_0_8px_#00f2ff]" 
                      style={{ width: `${diagnosticProgress}%` }}
                    />
                  </div>
                )}

                {/* Console Output Screen */}
                <div 
                  ref={logContainerRef}
                  className="flex-1 bg-[#050614] border border-[rgba(0,219,231,0.2)] rounded-xl p-4 font-mono text-[11px] overflow-y-auto max-h-[250px] space-y-2 select-text"
                >
                  <p className="text-gray-500">// READY TO CAPTURE SERIAL EMBEDDED TRANSMISSIONS...</p>
                  {liveLogs.map((log, index) => (
                    <div key={index} className="flex gap-2.5 leading-relaxed tracking-normal items-start group">
                      <span className="text-gray-600 font-medium select-none">[{log.timestamp}]</span>
                      
                      {log.type === 'SUCCESS' && (
                        <span className="text-green-400 bg-green-500/10 px-1 rounded flex items-center text-[9px] font-bold select-none h-4 uppercase">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" /> OK
                        </span>
                      )}
                      {log.type === 'INFO' && (
                        <span className="text-cyan-400 bg-cyan-500/10 px-1 rounded flex items-center text-[9px] font-bold select-none h-4 uppercase">
                          <Info className="w-2.5 h-2.5 mr-0.5 inline" /> INFO
                        </span>
                      )}
                      {log.type === 'WARNING' && (
                        <span className="text-yellow-400 bg-yellow-500/10 px-1 rounded flex items-center text-[9px] font-bold select-none h-4 uppercase animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5 inline" /> WARN
                        </span>
                      )}
                      {log.type === 'ERROR' && (
                        <span className="text-red-400 bg-red-500/10 px-1 rounded flex items-center text-[9px] font-bold select-none h-4 uppercase animate-ping">
                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5 inline" /> CRIT
                        </span>
                      )}

                      <span className="text-[#c1d9da] group-hover:text-white transition-colors">{log.message}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-mono text-[#b9cacb]/50 text-right">
                  SENSOR SAMPLE INTERRUPT RATIO: 16mS // HARDWARE CONTROLS NOMINAL
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0a0b26] border-t border-[rgba(0,219,231,0.15)] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[rgba(0,219,231,0.25)] hover:border-[#00f2ff] hover:bg-[rgba(0,219,231,0.05)] rounded-lg text-xs font-mono font-medium tracking-wide text-[#00f2ff] transition-all"
          >
            DISMISS_INTERFACE
          </button>
        </div>
      </div>
    </div>
  );
}
