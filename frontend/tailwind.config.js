/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1', // Indigo-500
        accent: '#F472B6', // Pink-400
        background: '#F9FAFB', // Gray-50
        card: '#FFFFFF',
        border: '#E5E7EB', // Gray-200
        text: '#111827', // Gray-900
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        chic: '1.25rem',
      },
      boxShadow: {
        chic: '0 4px 24px 0 rgba(99,102,241,0.08)',
      },
    },
  },
  plugins: [],
} 