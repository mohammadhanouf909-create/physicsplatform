import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      // ── Brand color palette ───────────────────────────────────────────────
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // primary indigo
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // sky blue accent
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        surface: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        success: { light: "#f0fdf4", DEFAULT: "#22c55e", dark: "#15803d" },
        warning: { light: "#fefce8", DEFAULT: "#eab308", dark: "#a16207" },
        danger:  { light: "#fef2f2", DEFAULT: "#ef4444", dark: "#b91c1c" },
      },

      // ── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        arabic:  ["var(--font-arabic)", "Segoe UI", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      // ── Spacing & sizing ───────────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
      },

      // ── Shadows ────────────────────────────────────────────────────────────
      boxShadow: {
        "card":    "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "card-lg": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
        "glow":    "0 0 20px -5px rgb(99 102 241 / 0.4)",
        "glow-sm": "0 0 10px -3px rgb(99 102 241 / 0.3)",
        "inner-sm":"inset 0 1px 3px 0 rgb(0 0 0 / 0.06)",
      },

      // ── Animation ──────────────────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%":   { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-8px)" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgb(99 102 241 / 0.4)" },
          "70%":  { transform: "scale(1)",    boxShadow: "0 0 0 8px rgb(99 102 241 / 0)" },
          "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgb(99 102 241 / 0)" },
        },
      },
      animation: {
        "fade-in":    "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "slide-in":   "slide-in 0.3s ease-out",
        shimmer:      "shimmer 2s linear infinite",
        float:        "float 3s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.455,0.03,0.515,0.955) infinite",
      },

      // ── Backgrounds ────────────────────────────────────────────────────────
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgb(99 102 241 / 0.04) 1px, transparent 1px), linear-gradient(to right, rgb(99 102 241 / 0.04) 1px, transparent 1px)",
        "dot-pattern":
          "radial-gradient(circle, rgb(99 102 241 / 0.15) 1px, transparent 1px)",
        "hero-gradient":
          "linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #1e3a5f 70%, #0c4a6e 100%)",
        "card-gradient":
          "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
        "brand-gradient":
          "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #0ea5e9 100%)",
      },
      backgroundSize: {
        "grid-sm":  "24px 24px",
        "grid-md":  "40px 40px",
        "dot-sm":   "20px 20px",
      },
    },
  },
  plugins: [],
};

export default config;