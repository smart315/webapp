import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ShieldClose, Trash2, Cpu } from 'lucide-react';

interface TerminalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandHistory {
  input: string;
  output: string;
}

export default function TerminalOverlay({ isOpen, onClose }: TerminalOverlayProps) {
  const [history, setHistory] = useState<CommandHistory[]>([
    { input: 'system_init', output: 'Welcome to SIRUS-RTOS Shell v1.0.4\nType "help" to list available commands.' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    let output = '';

    switch (cmd) {
      case 'help':
        output = 'Available Commands:\n' +
          '  help         - Lists all available shell instructions\n' +
          '  ls           - List files in current virtual directories\n' +
          '  cat <file>   - Display contents of textual file\n' +
          '  sensor-check - Read active ADC sensor levels from target robot\n' +
          '  compile      - Run virtual C++ compiler telemetry checks\n' +
          '  clear        - Clear console line history\n' +
          '  credits      - Developer system core specs';
        break;
      case 'ls':
        output = 'drwxr-xr-x   2 sirus  wheel   4096 May 23 05:45 projects/\n' +
          '-rw-r--r--   1 sirus  wheel   1024 May 23 05:45 about_me.txt\n' +
          '-rw-r--r--   1 sirus  wheel    512 May 23 05:45 achievements.json\n' +
          '-rwxr-xr-x   1 sirus  wheel    256 May 23 05:45 pid_tuner.sh';
        break;
      case 'cat about_me.txt':
        output = 'Sirus - Robotics Developer Profile:\n' +
          '--------------------------------------------\n' +
          '저는 로봇을 만들고 코딩하며 고유의 하드웨어 문제를 해결하는 과정을 즐깁니다.\n' +
          '실패를 번복하는 훈련 속에서 완벽한 피드백을 찾는 것이 제 철학입니다.\n' +
          'Main Tools: Arduino, Python, C++, Motion, Block Coding.';
        break;
      case 'cat achievements.json':
        output = '{\n' +
          '  "RoboCup2026": "Country National Superteam 1st Position",\n' +
          '  "RobotChallenge2025": "Sumo division - Bronze Grand Award Prize"\n' +
          '}';
        break;
      case 'cat pid_tuner.sh':
        output = '#!/bin/bash\n' +
          'echo "Sirus-PID Tuning system engaged..."\n' +
          'echo "Searching optimal Kp=1.35, Kd=4.20, Ki=0.02..."\n' +
          'echo "Status: COMPLETED. Calibration ratio: 99.8%"';
        break;
      case 'clear':
        setHistory([]);
        setInputVal('');
        return;
      case 'credits':
        output = 'SIRUS-RTOS // MICROCODE CONVERTER\n' +
          'Core Clock: AMD 4.20GHz equivalent logic thread\n' +
          'Memory: Static allocated 64KB RAM\n' +
          'Platform: React 19 + Vite 6 + Tailwind CSS v4\n' +
          'Author: jery314 / sirus (Email: sirus@example.com)';
        break;
      case 'sensor-check':
        const randomVolt = (7.2 + Math.random() * 0.4).toFixed(2);
        const sensorA0 = Math.floor(200 + Math.random() * 600);
        const sensorA1 = Math.floor(200 + Math.random() * 600);
        const sensorA2Over = Math.floor(800 + Math.random() * 100);
        output = 'READING REAL-TIME SYSTEM REGISTERS...\n' +
          `======================================\n` +
          `Battery Voltage Input: ${randomVolt}V (NOMINAL)\n` +
          `Reflectance Ch.1 [A0]: ${sensorA0} (GRAY_ZONE)\n` +
          `Reflectance Ch.2 [A1]: ${sensorA1} (GRAY_ZONE)\n` +
          `Reflectance Ch.3 [A2]: ${sensorA2Over} (BLACK_LINE_LOCK)\n` +
          `Gyroscopic Pitch Angle: +1.45 degrees\n` +
          `ADC Conversion Speed : 12 microseconds (OK)`;
        break;
      case 'compile':
        output = 'LAUNCHING AVRCPP COMPILER ENVIRONMENT...\n' +
          'Analyzing firmware include headers... OK\n' +
          'Mapping memory allocations... [Static: 18,245 Bytes / Dynamic: 122 Bytes]\n' +
          'Translating block logical nodes to assembly instructions...\n' +
          'Firmware compiled. Status: SUCCESS.\n' +
          'AVR Memory utilization: 59.2% of Flash.';
        break;
      default:
        if (cmd.startsWith('cat ')) {
          output = `cat: ${cmd.substring(4)}: No such file in current directory. Try 'ls' to list valid files.`;
        } else {
          output = `sh: command not found: "${cmd}". Type "help" to show standard operations.`;
        }
    }

    setHistory(prev => [...prev, { input: inputVal, output }]);
    setInputVal('');
  };

  return (
    <div className="fixed inset-x-0 top-0 z-40 bg-[#070815]/98 border-b border-[rgba(0,219,231,0.4)] shadow-[0_4px_30px_rgba(0,219,231,0.15)] transition-all duration-350 overflow-hidden font-mono text-xs select-none">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col h-[320px] text-[#00f2ff]">
        
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-[rgba(0,219,231,0.15)] pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#00f2ff] animate-pulse" />
            <span className="font-bold text-glow-cyan">SIRUS_RTOS_CONSOLE // REMOTE_SHELL</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHistory([])}
              className="p-1 rounded text-[#b9cacb]/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Clear Terminal history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded bg-red-950 border border-red-500/40 text-red-400 font-bold hover:bg-red-500 hover:text-black transition-all"
            >
              CLOSE_CON
            </button>
          </div>
        </div>

        {/* History Area */}
        <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-[#05060f] rounded-lg border border-[rgba(0,219,231,0.1)] mb-3 select-text select-all">
          {history.map((item, index) => (
            <div key={index} className="space-y-1">
              {item.input !== 'system_init' && (
                <div className="flex items-center gap-1.5 text-white">
                  <span className="text-pink-500">sirus@rtos:~#</span>
                  <span>{item.input}</span>
                </div>
              )}
              <div className="whitespace-pre-wrap text-emerald-400 leading-relaxed pl-2 font-mono">
                {item.output}
              </div>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Console Input Bar */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 bg-[#03040a] p-2 rounded border border-[rgba(0,219,231,0.2)]">
          <span className="text-pink-500 shrink-0 select-none">sirus@rtos:~#</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-[rgba(0,219,231,0.3)] text-xs"
            placeholder="Try entering 'help', 'ls', 'sensor-check', 'compile'..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
