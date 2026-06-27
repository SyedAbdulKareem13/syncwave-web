import type { Config } from "tailwindcss";

/**
 * SyncWave "Resonance" design system (Section 9.2).
 * Deep ink base, frosted-glass surfaces, a dynamic accent extracted from album art
 * (wired at runtime via CSS variables — see globals.css / colors.ts).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B12",
        "ink-2": "#101019",
        glass: "rgba(255,255,255,0.08)",
        "glass-line": "rgba(255,255,255,0.14)",
        "text-primary": "#F5F5FA",
        "text-muted": "#9A9AAE",
        "sync-ok": "#4ADE80",
        "sync-warn": "#FBBF24",
        "sync-bad": "#F87171",
        // Driven at runtime from album art:
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-2": "rgb(var(--accent-2) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
      },
      backdropBlur: {
        glass: "28px",
      },
      boxShadow: {
        glass: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
        ring: "0 0 60px 0 rgb(var(--accent) / 0.45)",
      },
      keyframes: {
        "float-up": {
          "0%": { transform: "translateY(0) scale(0.6)", opacity: "0" },
          "15%": { opacity: "1", transform: "translateY(-8px) scale(1)" },
          "100%": { transform: "translateY(-140px) scale(1.1)", opacity: "0" },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.25)" },
        },
      },
      animation: {
        "float-up": "float-up 2.6s ease-out forwards",
        "live-pulse": "live-pulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
