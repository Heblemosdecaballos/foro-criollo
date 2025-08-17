/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "rgb(var(--brand) / <alpha-value>)",      // Marrón Cuero
        brand2: "rgb(var(--brand-2) / <alpha-value>)",   // Verde Pino
        accent: "rgb(var(--accent) / <alpha-value>)",    // Amarillo Mostaza
        beige: "rgb(var(--beige) / <alpha-value>)",      // Beige Arena
        surface: "rgb(var(--surface) / <alpha-value>)",
        on: "rgb(var(--on-surface) / <alpha-value>)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 8px 40px rgba(0,0,0,.08)",
      },
    },
  },
  plugins: [],
};
