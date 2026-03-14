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
        bg: {
          primary: '#171411',
          card: '#221D18',
          elevated: '#302821',
        },
        text: {
          primary: '#F6EFE5',
          secondary: '#C6B7A3',
          muted: '#8D7A66',
        },
        brand: {
          up: '#3FA66B',
          down: '#D9654F',
          accent: '#D4A24C',
          warning: '#E3813A',
          purple: '#8E6942',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'Noto Sans JP', 'system-ui', 'sans-serif'],
        mono: ['var(--font-inter)', 'Inter', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        card_lg: '24px',
      },
      boxShadow: {
        card: '0 8px 30px rgba(0, 0, 0, 0.28)',
        card_hover: '0 12px 36px rgba(212, 162, 76, 0.14)',
        glow_up: '0 0 20px rgba(63, 166, 107, 0.28)',
        glow_down: '0 0 20px rgba(217, 101, 79, 0.28)',
        glow_accent: '0 0 20px rgba(212, 162, 76, 0.26)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
