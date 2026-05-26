import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        // Все цвета через CSS-переменные из shared/tokens/theme.css.
        // Tailwind-классы вроде bg-surface, text-primary будут резолвиться в var(--bg-surface) и т.п.
        'bg-app': 'var(--bg-app)',
        'bg-surface': 'var(--bg-surface)',
        'bg-subtle': 'var(--bg-subtle)',
        'bg-hover': 'var(--bg-hover)',
        'bg-disabled': 'var(--bg-disabled)',

        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-disabled': 'var(--text-disabled)',
        'text-inverse': 'var(--text-inverse)',

        'border-subtle': 'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'border-strong': 'var(--border-strong)',

        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-pressed': 'var(--accent-pressed)',
        'accent-subtle': 'var(--accent-subtle)',
        'accent-muted': 'var(--accent-muted)',
        'accent-border': 'var(--accent-border)',
        'accent-text': 'var(--accent-text)',

        // Semantic
        success: 'var(--success)',
        'success-bg': 'var(--success-bg)',
        'success-text': 'var(--success-text)',
        warning: 'var(--warning)',
        'warning-bg': 'var(--warning-bg)',
        'warning-text': 'var(--warning-text)',
        error: 'var(--error)',
        'error-bg': 'var(--error-bg)',
        'error-text': 'var(--error-text)',
        info: 'var(--info)',
        'info-bg': 'var(--info-bg)',
        'info-text': 'var(--info-text)',
      },
      fontFamily: {
        sans: ['Inter Tight', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        DEFAULT: '12px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(17,24,39,.04)',
        sm: '0 1px 2px rgba(17,24,39,.04), 0 1px 3px rgba(17,24,39,.06)',
        md: '0 4px 8px -2px rgba(17,24,39,.07), 0 2px 4px -2px rgba(17,24,39,.04)',
        lg: '0 12px 24px -6px rgba(17,24,39,.09), 0 4px 8px -4px rgba(17,24,39,.05)',
        focus: '0 0 0 3px rgba(37,99,235,.18)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 250ms ease-out',
        'accordion-up': 'accordion-up 250ms ease-out',
      },
    },
  },
  plugins: [],
}

export default config
