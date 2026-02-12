/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        secondary: {
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
        },
        success: {
          light: 'var(--success-light)',
          main: 'var(--success-main)',
          dark: 'var(--success-dark)',
          bg: 'var(--success-bg)',
        },
        warning: {
          light: 'var(--warning-light)',
          main: 'var(--warning-main)',
          dark: 'var(--warning-dark)',
          bg: 'var(--warning-bg)',
        },
        error: {
          light: 'var(--error-light)',
          main: 'var(--error-main)',
          dark: 'var(--error-dark)',
          bg: 'var(--error-bg)',
        },
        info: {
          light: 'var(--info-light)',
          main: 'var(--info-main)',
          dark: 'var(--info-dark)',
          bg: 'var(--info-bg)',
        },
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
          950: 'var(--gray-950)',
        },
        background: {
          default: 'var(--bg-default)',
          paper: 'var(--bg-paper)',
          canvas: 'var(--bg-canvas)',
          elevated: 'var(--bg-elevated)',
        },
        surface: {
          default: 'var(--surface-default)',
          hover: 'var(--surface-hover)',
          active: 'var(--surface-active)',
          focus: 'var(--surface-focus)',
        },
        border: {
          default: 'var(--border-default)',
          hover: 'var(--border-hover)',
          focus: 'var(--border-focus)',
          error: 'var(--border-error)',
        },
      },
      boxShadow: {
        elevated: '0 0 0 1px var(--shadow-sm), 0 2px 8px var(--shadow-md), 0 12px 24px var(--shadow-lg)',
        'elevated-lg': '0 0 0 1px var(--shadow-sm), 0 4px 12px var(--shadow-md), 0 20px 40px var(--shadow-xl)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'blob': 'blob 7s infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'blob': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}