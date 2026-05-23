import { useState, useEffect } from 'react';
import { Cpu, Menu, X, Terminal } from 'lucide-react';

interface HeaderProps {
  onToggleTerminal: () => void;
  terminalOpen: boolean;
}

export default function Header({ onToggleTerminal, terminalOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Determine active section based on scroll position
      const sections = ['about', 'experience', 'skills', 'awards', 'portfolio'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Experience', href: '#experience', id: 'experience' },
    { label: 'Skills', href: '#skills', id: 'skills' },
    { label: 'Awards', href: '#awards', id: 'awards' },
    { label: 'Portfolio', href: '#portfolio', id: 'portfolio' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 w-full z-45 transition-all duration-350 border-b ${
        scrolled
          ? 'bg-[#0f112a]/85 backdrop-blur-md border-[rgba(0,219,231,0.2)] py-4'
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('#about');
          }}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[rgba(0,219,231,0.1)] border border-[rgba(0,219,231,0.35)] flex items-center justify-center transition-all duration-300 group-hover:border-[rgba(0,219,231,0.7)] group-hover:glow-cyan">
            <Cpu className="w-5 h-5 text-[#00f2ff] animate-pulse" />
          </div>
          <span className="font-display font-bold text-lg text-[#e0e0ff] tracking-tight group-hover:text-[#00f2ff] transition-colors">
            My Robot Portfolio
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.href);
              }}
              className={`font-sans text-sm font-medium transition-all duration-200 relative py-1 ${
                activeSection === item.id
                  ? 'text-[#00f2ff] font-semibold text-glow-cyan-soft'
                  : 'text-[#b9cacb] hover:text-[#e0e0ff]'
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00dbe7] to-[#00f2ff] shadow-[0_0_8px_#00f2ff]" />
              )}
            </a>
          ))}
        </nav>

        {/* Extra Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            id="terminal-toggle-btn"
            onClick={onToggleTerminal}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-mono transition-all duration-300 ${
              terminalOpen
                ? 'bg-[rgba(0,219,231,0.15)] border-[#00f2ff] text-[#00f2ff] glow-cyan'
                : 'bg-[#171932] border-[rgba(0,219,231,0.2)] text-[#b9cacb] hover:text-[#00f2ff] hover:border-[#00f2ff] hover:bg-[#1b1d36]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{terminalOpen ? 'CLOSE_SHELL' : 'OPEN_SHELL'}</span>
          </button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={onToggleTerminal}
            className={`p-2 rounded-lg border ${
              terminalOpen
                ? 'bg-[rgba(0,219,231,0.15)] border-[#00f2ff] text-[#00f2ff]'
                : 'bg-[#171932] border-[rgba(0,219,231,0.15)] text-[#b9cacb]'
            }`}
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#171932] border border-[rgba(0,219,231,0.15)] text-[#e0e0ff] hover:text-[#00f2ff]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0f112a] border-b border-[rgba(0,219,231,0.2)] py-5 px-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.href);
              }}
              className={`font-sans text-base font-medium transition-all duration-200 py-1.5 border-b border-dashed border-[#171932] ${
                activeSection === item.id ? 'text-[#00f2ff]' : 'text-[#b9cacb]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
