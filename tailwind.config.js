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
        sans:    ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"IBM Plex Mono"', 'Menlo', 'monospace'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
        'radial-glow':  "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.15), transparent 60%)",
        'radial-glow-amber': "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.12), transparent 50%)",
        'hero-gradient': "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(234,88,12,0.06) 100%)",
      },
      boxShadow: {
        'glow-cyan':   '0 0 20px -4px rgba(34,211,238,0.4)',
        'glow-violet': '0 0 20px -4px rgba(167,139,250,0.35)',
        'glow-emerald':'0 0 16px -4px rgba(52,211,153,0.35)',
        'glow-amber':  '0 0 20px -4px rgba(245,158,11,0.45)',
        'glow-rose':   '0 0 16px -4px rgba(251,113,133,0.35)',
        'tv-card':     'var(--shadow-card)',
        'tv-panel':    'var(--shadow-panel)',
      },
      animation: {
        'pulse-glow':  'pulseGlow 2.8s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'fade-in':     'fadeSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in':    'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'ping-slow':   'pingSlowAnim 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shimmer':     'shimmerMove 2.2s ease-in-out infinite',
        'float':       'floatAnim 4s ease-in-out infinite',
        'radar':       'radarSpin 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%':      { opacity: '0.95', transform: 'scale(1.02)' },
        },
        fadeSlideIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pingSlowAnim: {
          '70%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        shimmerMove: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floatAnim: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        radarSpin: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        }
      },
      borderRadius: {
        'xl2': '16px',
        'xl3': '20px',
      },
    },
  },
  plugins: [],
}
