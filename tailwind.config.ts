import type { Config } from "tailwindcss";

// Identité visuelle Bénin Tennis Club
// primary = bleu nuit #1E3A5F · accent = vert citron #C8D965
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef3f9", 100: "#d9e4f1", 200: "#b3c8e2", 300: "#7f9fc7",
          400: "#1e3a5f", 500: "#1a3252", 600: "#152a45", 700: "#102035", 800: "#0b1625", 900: "#060c15",
        },
        accent: {
          50: "#f9fbea", 100: "#f2f6d2", 200: "#e5eda6", 300: "#d6e37f",
          400: "#c8d965", 500: "#b5c74c", 600: "#98a93a", 700: "#76842d", 800: "#566022", 900: "#373e16",
        },
        clay: { 400: "#d9733f", 500: "#c4612f" },
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      boxShadow: {
        soft: "0 2px 10px rgba(30,58,95,0.08)",
        medium: "0 8px 24px rgba(30,58,95,0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
