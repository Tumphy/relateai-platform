/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#f0f9ff',  // Lightest blue for backgrounds
          100: '#e0f2fe', // Light blue for hover states
          200: '#bae6fd', // Light blue for secondary elements
          300: '#7dd3fc', // Medium blue for highlights
          400: '#38bdf8', // Medium-bright blue
          500: '#0ea5e9', // Main brand color - trustworthy blue
          600: '#0284c7', // Deeper blue for buttons, CTAs
          700: '#0369a1', // Dark blue for hover states
          800: '#075985', // Very dark blue for specific elements
          900: '#0c4a6e', // Darkest blue, almost black
        },
        // Secondary accent color - purple for innovation
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Main secondary color
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Success color - green
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Main success color
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Warning color - amber
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Main warning color
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Danger color - red
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Main danger color
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Neutral colors for text, backgrounds, etc.
        neutral: {
          50: '#f9fafb',  // Lightest gray, almost white
          100: '#f3f4f6', // Very light gray for backgrounds
          200: '#e5e7eb', // Light gray for borders
          300: '#d1d5db', // Light gray for disabled elements
          400: '#9ca3af', // Medium gray for secondary text
          500: '#6b7280', // Medium gray for placeholder text
          600: '#4b5563', // Dark gray for body text
          700: '#374151', // Darker gray for headings
          800: '#1f2937', // Very dark gray for important text
          900: '#111827', // Almost black for main headings
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'card': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 8px 0 rgba(0, 0, 0, 0.06)',
      },
      spacing: {
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-in-out',
        'slide-in': 'slide-in 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}