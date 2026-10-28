import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midad: {
          dark: {
            bg: "#07090f",
            card: "#0d1424",
            cardHover: "#131e35",
            border: "#1e293b",
            muted: "#94a3b8",
            text: "#f8fafc",
          },
          light: {
            bg: "#f8fafc",
            card: "#ffffff",
            cardHover: "#f1f5f9",
            border: "#e2e8f0",
            muted: "#64748b",
            text: "#0f172a",
          },
          emerald: {
            50: "#ecfdf5",
            100: "#d1fae5",
            200: "#a7f3d0",
            300: "#6ee7b7",
            400: "#34d399",
            500: "#10b981",
            600: "#059669",
            700: "#047857",
            800: "#065f46",
            900: "#064e3b",
            950: "#022c22",
          },
        },
      },
      fontFamily: {
        sans: [
          "var(--font-cairo)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
        traditional: [
          "var(--font-amiri)",
          "'Traditional Arabic'",
          "'Amiri'",
          "serif",
        ],
      },
      boxShadow: {
        glow: "0 0 30px -5px rgba(16, 185, 129, 0.25)",
        "glow-sm": "0 0 15px -3px rgba(16, 185, 129, 0.2)",
        "glow-lg": "0 0 60px -10px rgba(16, 185, 129, 0.35)",
        card: "0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)",
        "card-dark": "0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px -1px rgba(0,0,0,0.2)",
        "glass-sm": "0 2px 8px 0 rgba(0,0,0,0.08), inset 0 1px 1px 0 rgba(255,255,255,0.2)",
        glass: "0 8px 32px 0 rgba(0,0,0,0.1), inset 0 1px 1px 0 rgba(255,255,255,0.25)",
        "glass-dark": "0 8px 40px 0 rgba(0,0,0,0.55), inset 0 1px 0 0 rgba(255,255,255,0.08)",
        "glass-emerald": "0 8px 24px -4px rgba(5,150,105,0.25), inset 0 1px 1px 0 rgba(255,255,255,0.3)",
        "glass-card": "0 4px 24px 0 rgba(0,0,0,0.06), inset 0 1px 1px 0 rgba(255,255,255,0.9)",
        "glass-card-hover": "0 20px 48px -4px rgba(0,0,0,0.12), 0 0 0 1px rgba(16,185,129,0.2)",
      },
      backgroundImage: {
        "liquid-glass-dark": "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        "liquid-glass-light": "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
        "liquid-glass-emerald": "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.06) 100%)",
        "glass-shine": "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
        "emerald-gradient": "linear-gradient(135deg, #34d399 0%, #059669 50%, #10b981 100%)",
        "hero-gradient": "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(16,185,129,0.15), transparent)",
        "hero-gradient-dark": "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(16,185,129,0.22), transparent)",
      },
      animation: {
        "fade-up": "fade-up 0.55s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.32s cubic-bezier(0.16,1,0.3,1) both",
        "scale-up": "scale-up 0.32s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-down": "slide-down 0.32s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "spin-slow": "spin-slow 12s linear infinite",
        breathe: "breathe 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s ease-in-out infinite",
        "fade-up-d1": "fade-up 0.55s 150ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-up-d2": "fade-up 0.55s 300ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-up-d3": "fade-up 0.55s 450ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-up-d4": "fade-up 0.55s 600ms cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-up": {
          from: { opacity: "0", transform: "scale(0.93)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(16,185,129,0.2)" },
          "50%": { boxShadow: "0 0 35px rgba(16,185,129,0.45), 0 0 60px rgba(16,185,129,0.15)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.04)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "out-smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      borderRadius: {
        "2.5xl": "20px",
        "3xl": "24px",
        "4xl": "32px",
      },
    },
  },
  plugins: [],
};

export default config;
