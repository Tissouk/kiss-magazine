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
        korean: {
          50: '#fef7f7',
          100: '#feecec',
          200: '#fcdcdc',
          300: '#f9bfbf',
          400: '#f49595',
          500: '#ec6b6b',
          600: '#d94444',
          700: '#b73333',
          800: '#982d2d',
          900: '#7f2a2a',
        },
        kpop: {
          pink: '#FF69B4',
          purple: '#9B59B6',
          blue: '#3498DB',
          mint: '#1ABC9C',
        }
      },
      fontFamily: {
        korean: ['Noto Sans KR', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}