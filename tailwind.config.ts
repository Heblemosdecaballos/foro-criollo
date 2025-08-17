/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // usa variables CSS -> puedes cambiar los valores en globals.css
        brand: "rgb(var(--brand) / <alpha-value>)",
        brandfg: "rgb(var(--brand-foreground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        on: "rgb(var(--on-surface) / <alpha-value>)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 6px 30px rgba(0,0,0,.08)",
      },
    },
  },
  plugins: [],
};
