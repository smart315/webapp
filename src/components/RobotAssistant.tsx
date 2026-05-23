import { useState, useEffect } from 'react';
import { Bot, X, MessageSquare, Send, Cpu, Sparkles, HelpCircle } from 'lucide-react';

interface Dialogue {
  sender: 'bot' | 'user';
  text: string;
}

export default function RobotAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogues, setDialogues] = useState<Dialogue[]>([
    { sender: 'bot', text: '안녕하세요! 저는 Sirus의 자율주행 비서 로봇입니다. 저의 센서 임베디드 설계가 궁금하시거나 포트폴리오 안내가 필요하시면 아래 질문 단추를 눌러 편안히 물어보세요!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const presetQuestions = [
    { q: 'Sirus는 어떤 개발자인가요?', a: 'Sirus는 문제 해결에 강한 미래지향적 학생 로봇 엔지니어입니다. 아두이노 기반 하드웨어 조립부터 파이썬 및 C++ 펌웨어 구현, 특히 정밀 제어용 PID 오차 수정 및 상태머신 설계를 매우 흥미로워합니다.' },
    { q: '2026 RoboCup대회에서 어떤 역할을 했나요?', a: 'Sirus는 Team K.F.C.SIRUS 소속으로 가상 및 현장 부대에서 CoSpace Rescue 종목에 참가해 기동을 담당하는 WORLD 2 프로그래머 전임 팀원으로 활약했습니다. 수많은 시뮬레이션 센서 보정과 노이즈 소거 필터 코드를 짰습니다!' },
    { q: '라인 트레이서 제어 알고리즘은 무엇인가요?', a: '라인 트레이서는 5채널 적외선 반사광의 가중 오차값을 바탕으로 비례(P), 적분(I), 미분(D) 이득을 조화롭게 제어하는 PID 궤도 복원 루틴을 주입하여 구동 모터 속도를 0.005초(200Hz) 단위로 능동 패치합니다.' },
    { q: '스모 로봇 동작 원리는?', a: '스모 로봇은 전방 초음파 탐지 모드로 무작위 정지 회전을 연속하다가 적을 포착(70cm 이내)하면 풀파워 자율 가속(Overdrive)을 전개합니다. 최하단 낙하방지 라인센서에 흰 선이 잡히는 극단 조우 시에는 0.15초 안에 역회전 제동 도주 상태로 자동 천이됩니다.' }
  ];

  const handleAskQuestion = (qText: string, aText: string) => {
    if (isTyping) return;
    
    // Add User dialogue
    setDialogues(prev => [...prev, { sender: 'user', text: qText }]);
    setIsTyping(true);

    // Simulate robot system response thinking delay
    setTimeout(() => {
      setDialogues(prev => [...prev, { sender: 'bot', text: aText }]);
      setIsTyping(false);
    }, 750);
  };

  return (
    <div className="fixed bottom-6 right-6 z-48 select-none font-sans text-[#e0e0ff]">
      {/* Floating Bot trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-[#0a0c24] to-[#171932] border border-[rgba(0,219,231,0.4)] flex items-center justify-center shadow-[0_0_20px_rgba(0,219,231,0.25)] hover:border-[#00f2ff] hover:glow-cyan-strong transition-all duration-300 animate-bounce"
        >
          {/* Active glow pulsing wave */}
          <span className="absolute -inset-0.5 rounded-full bg-[#00f2ff] opacity-10 group-hover:opacity-20 animate-pulse" />
          <Bot className="w-6 h-6 text-[#00f2ff] transition-transform duration-300 group-hover:scale-110" />
          
          {/* Floating tiny text */}
          <span className="absolute right-full mr-3.5 px-2.5 py-1 rounded bg-[#0a0b22]/95 border border-[rgba(0,219,231,0.25)] text-[10px] font-mono whitespace-nowrap text-[#00f2ff] opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none">
            INTELLIGENT BOT ASSISTANT
          </span>
        </button>
      )}

      {/* Interactive holographic chatbox */}
      {isOpen && (
        <div className="w-[330px] md:w-[360px] max-h-[480px] bg-[#0f1134]/95 border border-[rgba(0,219,231,0.35)] shadow-[0_0_35px_rgba(0,219,231,0.15)] rounded-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-250">
          
          {/* Top Panel */}
          <div className="bg-[#050614] border-b border-[rgba(0,219,231,0.15)] py-3 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[rgba(0,219,231,0.1)] border border-[rgba(0,219,231,0.2)] flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5 text-[#00f2ff]" />
              </div>
              <div>
                <span className="font-display font-bold text-xs">Sirus Bot Companion</span>
                <span className="text-[8px] font-mono text-[#00f2ff]/80 block leading-tight">STATUS: LOCAL_ACTIVE // PORT_3000</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-[#b9cacb] hover:text-[#00f2ff] hover:bg-[rgba(0,219,231,0.1)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dialogue display panel */}
          <div className="flex-1 bg-[#0f112e] p-4 overflow-y-auto space-y-3.5 max-h-[250px] min-h-[220px]">
            {dialogues.map((dialogue, i) => (
              <div
                key={i}
                className={`flex gap-2 p-2.5 rounded-xl border max-w-[85%] text-xs leading-relaxed ${
                  dialogue.sender === 'bot'
                    ? 'mr-auto bg-[#17193c] border-[rgba(0,219,231,0.15)] text-[#e0e0ff]'
                    : 'ml-auto bg-[rgba(0,219,231,0.1)] border-[rgba(0,219,231,0.3)] text-[#00f2ff]'
                }`}
              >
                {dialogue.sender === 'bot' && (
                  <Bot className="w-4 h-4 text-[#00f2ff] shrink-0 mt-0.5" />
                )}
                <span>{dialogue.text}</span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 px-3 rounded-lg border border-dashed border-[rgba(0,219,231,0.15)] text-gray-500 text-[10px] uppercase font-mono w-[150px]">
                <Sparkles className="w-3.5 h-3.5 text-[#00f2ff] animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>

          {/* Preset trigger suggestions */}
          <div className="bg-[#050614]/80 p-3.5 border-t border-[rgba(0,219,231,0.15)] space-y-2">
            <span className="text-[9px] font-mono text-[#b9cacb] uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> 자주 묻는 질문 선택
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {presetQuestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleAskQuestion(item.q, item.a)}
                  disabled={isTyping}
                  className="w-full text-left px-2.5 py-1.5 rounded bg-[#17193a] hover:bg-[#1b1d4c] border border-[rgba(0,219,231,0.1)] hover:border-[#00f2ff]/60 text-xs text-[#c1d9da] hover:text-[#00f2ff] truncate transition-all font-sans"
                >
                  ▶ {item.q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
