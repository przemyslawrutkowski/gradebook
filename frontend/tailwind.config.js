/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        textBg: {
          100: "#ffffff",
          150: "#F9F9F9",
          200: "#F2F3F4",
          300: "#DEE1E5",
          400: "#BDC0C9",
          500: "#8E94A0",
          600: "#565D6D",
          700: "#313642",
          800: "#1e2128",
          900: "#16191E"
        },
        primary: {
          100: "#FCEFF1",
          200: "#F9C7CD",
          400: "#F37986",
          500: "#EA4B60",
          600: "#D62847"
        },
        success: {
          100: "#EDFCF2",
          200: "#B7F4CD",
          500: "#1BD659",
          600: "#17A847",
          700: "#117A34" 
        },
        info: {
          200: "#FCECC2",
          500: "#F4C646",
          600: "#E8AD0B",
          700: "#A57B08"
        },
        accent1: {
          200: "#BBE0F9",
          500: "#1A98ED",
        },
        accent2: {
          500: "#6F50ED",
        }
      },
      fontFamily: {
        epilogue: ['Epilogue', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      screens: {
        'xs': { 'max': '400px' },
        'xxs': { 'min': '360px' }
      },
    },
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['14px', '18px'],
      base: ['16px', '20px'],
      lg: ['18px', '22px'],
      xl: ['20px', '24px'],
      '2xl': ['24px', '28px'],
      '3xl': ['32px', '36px'],
      '4xl': ['48px', '52px']
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.webkit-box': {
          display: '-webkit-box',
        },
        '.webkit-line-clamp-2': {
          '-webkit-line-clamp': '2',
        },
        '.webkit-line-clamp-4': {
          '-webkit-line-clamp': '4',
        },
        '.webkit-box-orient-vertical': {
          '-webkit-box-orient': 'vertical',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
    
  ],
}

