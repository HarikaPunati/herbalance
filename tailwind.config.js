/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F0F7FF",
          surface: "#F8FAFF",
        },
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#1D4ED8",
          medium: "#60A5FA",
          light: "#BFDBFE",
          pale: "#EFF6FF",
        },
        accent: {
          DEFAULT: "#7C3AED",
          medium: "#A78BFA",
          light: "#DDD6FE",
          pale: "#F5F3FF",
        },
        ink: {
          dark: "#1E3A5F",
          mid: "#475569",
          soft: "#94A3B8",
        },
        border: {
          DEFAULT: "#E2E8F0",
        },
        phase: {
          menstrual: { bg: "#FCA5A5", text: "#991B1B" },
          follicular: { bg: "#93C5FD", text: "#1E40AF" },
          ovulatory: { bg: "#86EFAC", text: "#14532D" },
          luteal: { bg: "#C4B5FD", text: "#4C1D95" },
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        body: ['Inter', "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1100px",
        onboard: "560px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(59, 130, 246, 0.08)",
        "card-hover": "0 6px 20px rgba(59, 130, 246, 0.15)",
        onboard: "0 8px 32px rgba(59, 130, 246, 0.12)",
      },
      borderRadius: {
        card: "16px",
        btn: "12px",
        input: "10px",
        onboard: "24px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "progress-width": {
          "0%": { width: "0%" },
          "100%": { width: "var(--tw-progress-pct, 100%)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease forwards",
        "fade-in-slow": "fade-in 400ms ease forwards",
        "slide-in-right": "slide-in-right 250ms ease forwards",
        "slide-in-left": "slide-in-left 250ms ease forwards",
        "slide-up": "slide-up 280ms cubic-bezier(0.34, 1.4, 0.64, 1) forwards",
        "sheet-up": "sheet-up 350ms cubic-bezier(0.32, 0.72, 0, 1) forwards",
      },
    },
  },
  plugins: [],
};
