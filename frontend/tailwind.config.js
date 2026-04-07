/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#060714',
          elevated: '#0c0f1e',
          soft:     '#101427',
          card:     '#0d1122',
        },
        border: {
          subtle: 'rgba(148,163,184,0.12)',
          soft:   'rgba(148,163,184,0.22)',
          mid:    'rgba(148,163,184,0.32)',
          strong: 'rgba(148,163,184,0.50)',
        },
        accent: {
          indigo:  '#4f46e5',
          cyan:    '#06b6d4',
          green:   '#22c55e',
          purple:  '#a855f7',
          orange:  '#f97316',
          yellow:  '#eab308',
          blue:    '#3b82f6',
          pink:    '#ec4899',
          red:     '#ef4444',
        },
        text: {
          base:   '#e5e7eb',
          soft:   '#9ca3af',
          softer: '#6b7280',
        },
      },
      fontFamily: {
        sans:    ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Segoe UI"', 'sans-serif'],
        display: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'sans-serif'],
        mono:    ['"SF Mono"', '"Fira Code"', '"Cascadia Code"', 'Consolas', 'monospace'],
      },
      borderRadius: {
        pill: '999px',
        card: '18px',
        hero: '22px',
      },
      boxShadow: {
        soft:        '0 18px 40px rgba(0,0,0,0.65)',
        glow:        '0 0 0 1px rgba(148,163,184,0.12), 0 18px 45px rgba(15,23,42,0.9)',
        'glow-in':   '0 0 0 1px rgba(79,70,229,0.6), 0 0 0 8px rgba(79,70,229,0.18)',
        'inner-top': 'inset 0 1px 0 0 rgba(255,255,255,0.04)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'pulse-dot':  'pulseDot 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp:  { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseDot:  { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.5', transform: 'scale(0.85)' } },
      },
    },
  },
  plugins: [],
}
