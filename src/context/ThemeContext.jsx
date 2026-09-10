import React, { createContext, useContext, useState, useEffect } from 'react';

export const AVAILABLE_THEMES = [
  {
    id: 'amber',
    name: 'Solar Command',
    label: 'Solar Command',
    mode: 'dark',
    accentColor: '#F59E0B',
    secondaryColor: '#EA580C',
    bgPreview: '#0E0B06',
    desc: 'Mission ops aerospace dark bronze with tactical amber'
  },
  {
    id: 'dark',
    name: 'Cyber Obsidian',
    label: 'Cyber Obsidian',
    mode: 'dark',
    accentColor: '#00F0FF',
    secondaryColor: '#2563EB',
    bgPreview: '#080C14',
    desc: 'Tactical deep carbon with electric cyan & cerulean telemetry'
  },
  {
    id: 'emerald',
    name: 'Tactical Recon',
    label: 'Tactical Recon',
    mode: 'dark',
    accentColor: '#10B981',
    secondaryColor: '#34D399',
    bgPreview: '#050D0A',
    desc: 'Stealth night-ops matrix with radioactive recon green'
  },
  {
    id: 'violet',
    name: 'Nebula Cyber',
    label: 'Nebula Cyber',
    mode: 'dark',
    accentColor: '#A855F7',
    secondaryColor: '#EC4899',
    bgPreview: '#090614',
    desc: 'Cosmic deep void with ultraviolet violet & neon magenta'
  },
  {
    id: 'light',
    name: 'Titanium Lab',
    label: 'Titanium Lab',
    mode: 'light',
    accentColor: '#0284C7',
    secondaryColor: '#2563EB',
    bgPreview: '#F1F5F9',
    desc: 'Precision daylight GIS lab with frost slate & royal cobalt'
  }
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tv-theme');
      // If user had the previous legacy dark default, switch them to Solar Command
      if (saved && saved !== 'dark' && AVAILABLE_THEMES.some(t => t.id === saved)) {
        return saved;
      }
    }
    return 'amber'; // Default theme: Solar Command
  });

  const activeThemeMeta = AVAILABLE_THEMES.find(t => t.id === theme) || AVAILABLE_THEMES[0];

  useEffect(() => {
    const root = document.documentElement;
    AVAILABLE_THEMES.forEach(t => {
      root.classList.remove(`theme-${t.id}`);
    });
    root.classList.remove('dark', 'light');

    root.classList.add(`theme-${theme}`);
    if (activeThemeMeta.mode === 'light') {
      root.classList.add('light');
    } else {
      root.classList.add('dark');
    }
    localStorage.setItem('tv-theme', theme);
  }, [theme, activeThemeMeta.mode]);

  const setTheme = (newTheme) => {
    if (AVAILABLE_THEMES.some(t => t.id === newTheme)) {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setThemeState(current => {
      const currentIndex = AVAILABLE_THEMES.findIndex(t => t.id === current);
      const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
      return AVAILABLE_THEMES[nextIndex].id;
    });
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      activeThemeMeta,
      availableThemes: AVAILABLE_THEMES
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
