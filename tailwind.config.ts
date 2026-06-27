import type { Config } from "tailwindcss";

/** SyncWave "Spider-Verse / Earth-1610" comic design system. */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08070F",
        "ink-2": "#14101F",
        "ink-3": "#16121F",
        "ink-4": "#1f1830",
        line: "#2c2440",
        "line-2": "#221836",
        text: "#F4F1FF",
        muted: "#9A93B5",
        "muted-2": "#6a6483",
        pink: "#FF2A6D",
        "pink-2": "#FF4D8D",
        cyan: "#1FE0FF",
        yellow: "#FFE600",
        lime: "#C6FF00",
        purple: "#7B2FF7",
        red: "#FF3B3B",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sticker: ["var(--font-sticker)", "cursive"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        eqBar: { "0%,100%": { transform: "scaleY(.2)" }, "50%": { transform: "scaleY(1)" } },
        beatThump: { "0%,100%": { transform: "scale(1)" }, "16%": { transform: "scale(1.16)" }, "38%": { transform: "scale(.97)" } },
        pulseRing: { "0%": { transform: "scale(.5)", opacity: ".65" }, "100%": { transform: "scale(2.5)", opacity: "0" } },
        marquee: { to: { transform: "translateX(-50%)" } },
        stickerWob: { "0%,100%": { transform: "rotate(-5deg)" }, "50%": { transform: "rotate(5deg)" } },
        webSway: { "0%,100%": { transform: "rotate(-2.5deg)" }, "50%": { transform: "rotate(2.5deg)" } },
        spin12: { to: { transform: "rotate(360deg)" } },
        threadHang: { "0%,100%": { transform: "rotate(-3deg)" }, "50%": { transform: "rotate(3deg)" } },
        enterUp: { "0%": { transform: "translateY(22px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
      },
    },
  },
  plugins: [],
};

export default config;
