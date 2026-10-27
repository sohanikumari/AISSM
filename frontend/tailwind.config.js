/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        primary: {
          DEFAULT: 'var(--primary)',
          fg: 'var(--primary-fg)',
        },
        info: 'var(--info)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        neutral: 'var(--neutral)',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(100%) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
