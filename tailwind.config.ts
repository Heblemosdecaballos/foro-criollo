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
        // Fondo crema de tu diseño
        cream: {
          50:  "#F8F1E6",
          100: "#F1E8DA",
          200: "#EADFCB",
        },
        // Marrones de texto/hero
        brown: {
          700: "#5F422F",
          800: "#4B3325",
        },
        // VERDE exactamente como el de los cajones/botón (ajustado)
        olive: {
          600: "#6F7F56",
          700: "#5E6D45",
        },
        // Café del hero (usaremos clase .hero-cafe)
        cafe: {
          a: "#B36A3E",  // izquierda/arriba
          b: "#7B5740",  // derecha/abajo
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
