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
        // Deep contemporary night colors (No gold!)
        midad: {
          dark: {
            bg: "#080c14",
            card: "#0f172a",
            cardHover: "#15203b",
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
          // Emerald branding
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
        glow: "0 0 25px -5px rgba(16, 185, 129, 0.15)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "card-dark": "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
