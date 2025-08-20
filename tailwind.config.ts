// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--fg)',
      },
      boxShadow: {
        card: '0 12px 36px rgba(0,0,0,.08)'
      }
    },
  },
  plugins: [],
} satisfies Config
