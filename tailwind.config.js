/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Legacy dark palette (backward compat) ── */
        dark: {
          950: '#070A0E',
          900: '#0B0F14',
          850: '#0F172A',
          800: '#151B23',
          750: '#1A2230',
          700: '#222F3E',
          600: '#334155',
        },
        brand: {
          cyan: '#22D3EE',
          'cyan-dark': '#06B6D4',
          'cyan-glow': 'rgba(34, 211, 238, 0.18)',
        },

        /* ── CSS-variable-backed semantic tokens ── */
        tv: {
          base:     'var(--bg-base)',
          elevated: 'var(--bg-elevated)',
          surface:  'var(--bg-surface)',
          raised:   'var(--bg-raised)',
          overlay:  'var(--bg-overlay)',
          muted:    'var(--bg-muted)',
          accent:   'var(--accent-cyan)',
          violet:   'var(--accent-violet)',
          emerald:  'var(--accent-emerald)',
          amber:    'var(--accent-amber)',
          rose:     'var(--accent-rose)',
          primary:  'var(--text-primary)',
          secondary:'var(--text-secondary)',
          dim:      'var(--text-muted)',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"IBM Plex Mono"', 'Menlo', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
        'radial-glow':  "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.12), transparent 60%)",
        'radial-glow-violet': "radial-gradient(circle at 80% 20%, rgba(167,139,250,0.10), transparent 50%)",
        'hero-gradient': "linear-gradient(135deg, rgba(34,211,238,0.05) 0%, rgba(167,139,250,0.05) 100%)",
      },
      boxShadow: {
        'glow-cyan':   '0 0 20px -4px rgba(34,211,238,0.4)',
        'glow-violet': '0 0 20px -4px rgba(167,139,250,0.35)',
        'glow-emerald':'0 0 16px -4px rgba(52,211,153,0.35)',
        'glow-amber':  '0 0 16px -4px rgba(251,191,36,0.3)',
        'glow-rose':   '0 0 16px -4px rgba(251,113,133,0.35)',
        'tv-card':     'var(--shadow-card)',
        'tv-panel':    'var(--shadow-panel)',
      },
      animation: {
        'pulse-glow':  'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline':    'scanline 8s linear infinite',
        'spin-slow':   'spin 12s linear infinite',
        'fade-in':     'fadeSlideIn 0.3s ease forwards',
        'scale-in':    'scaleIn 0.25s cubic-bezier(0.4,0,0.2,1) forwards',
        'slide-up':    'slideUp 0.35s cubic-bezier(0.4,0,0.2,1) forwards',
        'ping-slow':   'pingSlowAnim 2s cubic-bezier(0,0,0.2,1) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.9', transform: 'scale(1.02)' },
        },
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        fadeSlideIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pingSlowAnim: {
          '75%, 100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
      borderRadius: {
        'xl2': '16px',
        'xl3': '20px',
      },
    },
  },
  plugins: [],
}
