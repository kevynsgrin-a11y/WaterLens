import type { Config } from "tailwindcss";

// -----------------------------------------------------------------------------
// Design tokens (§13 UX & Trust Blueprint): clinical objectivity. Muted blues,
// greens, and grays; NO alarmist red/black. Semantic status colors are calm.
// -----------------------------------------------------------------------------
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary — deep, trustworthy municipal blue.
        brand: {
          50: "#eef6fb",
          100: "#d6e9f4",
          200: "#aed3e9",
          300: "#7cb6d8",
          400: "#4a93c1",
          500: "#2b76a6",
          600: "#1f5c86",
          700: "#1c4a6b",
          800: "#1b3e59",
          900: "#1a344b",
          950: "#112232",
        },
        // Secondary — calm verdigris/teal for "verified / safe".
        verdant: {
          50: "#eff8f4",
          100: "#d6ede1",
          200: "#b0dcc6",
          300: "#7fc2a4",
          400: "#4fa17f",
          500: "#348465",
          600: "#276a51",
          700: "#215543",
          800: "#1d4437",
          900: "#19392f",
        },
        // Neutral — slate/stone grays for text and surfaces.
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae1",
          300: "#b0b9c6",
          400: "#8592a4",
          500: "#667485",
          600: "#515d6c",
          700: "#434c58",
          800: "#3a414b",
          900: "#2b3038",
          950: "#1a1d22",
        },
        // Caution — amber (Tier-3 mapping ambiguity banner). Deliberately NOT red.
        caution: {
          50: "#fdf8ec",
          100: "#fbf0d0",
          200: "#f6e0a1",
          300: "#efc968",
          400: "#e8b13c",
          500: "#d9971f",
          600: "#bd7817",
          700: "#985916",
          800: "#7d4818",
          900: "#693c18",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,34,50,0.04), 0 8px 24px -12px rgba(17,34,50,0.12)",
        lift: "0 2px 4px rgba(17,34,50,0.06), 0 20px 40px -16px rgba(17,34,50,0.18)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      maxWidth: {
        content: "72rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
