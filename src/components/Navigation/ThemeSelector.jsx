import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Palette, 
  Check, 
  ChevronDown, 
  Sun, 
  Moon, 
  Sparkles, 
  Shield, 
  Zap, 
  Terminal 
} from 'lucide-react';

const THEME_ICONS = {
  dark: Terminal,
  emerald: Shield,
  violet: Sparkles,
  amber: Zap,
  light: Sun
};

export default function ThemeSelector({ compact = false }) {
  const { theme, setTheme, activeThemeMeta, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ActiveIcon = THEME_ICONS[theme] || Palette;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/40 bg-white/5 hover:bg-white/10 transition-all text-xs font-mono select-none"
        title="Change Website Theme & Colors"
        style={{ borderColor: isOpen ? 'var(--accent-cyan)' : undefined }}
      >
        <div 
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm animate-pulse"
          style={{ 
            backgroundColor: activeThemeMeta.accentColor,
            boxShadow: `0 0 8px ${activeThemeMeta.accentColor}`
          }}
        />
        
        {!compact && (
          <span className="font-bold text-slate-200 hidden md:inline">
            {activeThemeMeta.name}
          </span>
        )}

        <Palette className="w-3.5 h-3.5 text-slate-400" />
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-72 rounded-xl p-2 z-50 animate-scale-in shadow-2xl border"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-panel)'
          }}
        >
          <div className="px-3 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              <span>Theme & Palette</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">5 Curated</span>
          </div>

          <div className="py-1 space-y-1">
            {availableThemes.map((item) => {
              const isSelected = item.id === theme;
              const ItemIcon = THEME_ICONS[item.id] || Palette;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTheme(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-start gap-3 border ${
                    isSelected 
                      ? 'bg-white/10 border-[var(--border-strong)]' 
                      : 'hover:bg-white/5 border-transparent text-slate-300'
                  }`}
                >
                  {/* Theme Color Indicator Swatches */}
                  <div className="flex flex-col items-center gap-1 mt-0.5 shrink-0">
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center border border-white/20 shadow-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${item.accentColor}, ${item.secondaryColor})`,
                        boxShadow: isSelected ? `0 0 10px ${item.accentColor}` : 'none'
                      }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <ItemIcon className="w-3 h-3 text-slate-400" />
                        {item.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 uppercase">
                        {item.mode}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-1 pt-2 border-t border-[var(--border-subtle)] px-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Instant CSS-Variables Sync</span>
            <span className="text-[var(--accent-cyan)]">Live Render</span>
          </div>
        </div>
      )}
    </div>
  );
}
