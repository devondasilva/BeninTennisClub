import type { Config } from "tailwindcss";

// Identité visuelle Bénin Tennis Club — couleurs du logo
// brand (bleu du logo) #1F5996 · lime (vert citron de la raquette) #D5DA45 · ink (bleu nuit, textes et fonds sombres) #0B2440
// Langage visuel repris de Beach Tennis Bénin : bandeaux sombres avec photo, titres Fraunces, cartes très arrondies.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B2440", // bleu nuit : textes, fonds sombres
        carbon: "#12345A", // bleu nuit éclairci : surfaces sombres secondaires
        brand: { DEFAULT: "#1F5996", dark: "#174675", light: "#E8F0F9" }, // bleu du logo
        lime: { DEFAULT: "#D5DA45", dark: "#B9BE2C", light: "#F4F6CF" }, // vert citron du logo
        mist: "#F3F7FB", // fond de page
        cloud: "#E3ECF6", // fond secondaire
        muted: "#4D6178", // texte secondaire
        // Échelles complètes (compatibilité des classes primary-* / accent-*)
        primary: {
          50: "#EEF4FB", 100: "#D6E4F4", 200: "#ADC8E8", 300: "#6F9BCF",
          400: "#1F5996", 500: "#1A4C80", 600: "#153F6B", 700: "#103256", 800: "#0B2440", 900: "#07172A",
        },
        accent: {
          50: "#FAFBE9", 100: "#F3F5C9", 200: "#E9ED9B", 300: "#DDE26C",
          400: "#D5DA45", 500: "#BEC32F", 600: "#9A9E22", 700: "#6E7118", 800: "#545714", 900: "#36380D",
        },
        clay: { 400: "#d9733f", 500: "#c4612f" },
        // Séries des graphiques (lisibles en cas de daltonisme)
        series: { 1: "#1F5996", 2: "#B9BE2C", 3: "#E39B1B", 4: "#6F9BCF" },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(11,36,64,0.06), 0 1px 2px rgba(11,36,64,0.04)",
        medium: "0 20px 40px -12px rgba(11,36,64,0.18)",
      },
      maxWidth: { content: "72rem" },
      keyframes: {
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        "pulse-dot": {
          "0%": { boxShadow: "0 0 0 0 rgba(213,218,69,.6)" },
          "70%": { boxShadow: "0 0 0 9px rgba(213,218,69,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(213,218,69,0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        "pulse-dot": "pulse-dot 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
