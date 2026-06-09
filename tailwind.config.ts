import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        border: "var(--border)",
        "accent-red": "var(--accent-red)",
        "accent-blue": "var(--accent-blue)",
        "accent-blue-bright": "var(--accent-blue-bright)",
        "accent-green": "var(--accent-green)",
        "accent-gold": "var(--accent-gold)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        wordmark: ["var(--font-wordmark)", "var(--font-display)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, #e63946 0%, #1d3557 50%, #2d6a4f 100%)",
      },
      keyframes: {
        "gold-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(244,162,97,0.6)" },
          "50%": { boxShadow: "0 0 32px 8px rgba(244,162,97,0.45)" },
        },
        "flag-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "gold-pulse": "gold-pulse 2.4s ease-in-out infinite",
        "flag-scroll": "flag-scroll 40s linear infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
