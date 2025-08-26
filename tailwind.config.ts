// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",   // <-- cubre app, components, lib, etc.
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  "#F8F1E6",
          100: "#F1E8DA",
          200: "#EADFCB",
        },
        brown: {
          700: "#5F422F",
          800: "#4B3325",
        },
        olive: {
          600: "#6F7F56",
          700: "#5E6D45",
        },
        cafe: {
          a: "#B36A3E",
          b: "#7B5740",
        },
      },
      boxShadow: {
        card: "0 10px 24px rgba(0,0,0,0.06)",
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
