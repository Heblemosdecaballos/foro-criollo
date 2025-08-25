// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // paleta tomada de las capturas (tonos crema, marrón y oliva)
        cream: {
          50:  "#F9F4EB",
          100: "#F3ECDF",
          200: "#EDE4D3",
        },
        sand: {
          100: "#F2E9DC",
          200: "#E9DFC9",
        },
        brown: {
          700: "#5F422F", // títulos / texto principal
          800: "#4B3325",
        },
        olive: {
          600: "#718255", // botones
          700: "#5E6D45",
        },
        accent: {
          500: "#C1702E", // acentos cálidos (gradiente hero)
        },
      },
      boxShadow: {
        card: "0 10px 24px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        serif: ["var(--font-serif)"],
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};
export default config;
