import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        'panel-raised': 'var(--panel-raised)',
        ink: 'var(--ink)',
        'ink-dim': 'var(--ink-dim)',
        amber: 'var(--flap-amber)',
        teal: 'var(--flap-teal)',
        alert: 'var(--alert)',
        line: 'var(--line)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        placard: '0.08em',
        tag: '0.14em',
      },
      keyframes: {
        settle: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        settle: 'settle 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
