import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        luluca: {
          50: '#faf9f6',
          100: '#f5f1e8',
          200: '#ede4cf',
          300: '#e2d3b3',
          400: '#d4b984',
          500: '#d4af37',
          600: '#c9a227',
          700: '#b8961f',
          800: '#9a7d1a',
          900: '#7d6415',
          primary: '#d4af37',
          gold: '#d4af37',
          'gold-deep': '#b8860b',
          light: '#f5f1e8',
          cream: '#faf8f5',
          navy: '#1e2a44',
          'navy-soft': '#3d4f5f',
          dark: '#1e2a44',
          rose: '#f2b0b9',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'float-heart': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'float-heart': 'float-heart 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
