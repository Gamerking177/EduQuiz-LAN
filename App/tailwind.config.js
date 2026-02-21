/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.js",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /* Light Theme */
        background: "#F5F7FB",
        card: "#FFFFFF",
        textPrimary: "#111827",
        textSecondary: "#475467",
        border: "#E6EAF2",
        primary: "#2563EB",

        /* Status */
        success: "#16A34A",
        error: "#DC2626",
        warning: "#F59E0B",

        /* Dark Theme */
        darkBackground: "#0B1220",
        darkCard: "#0F172A",
        darkTextPrimary: "#E2E8F0",
        darkTextSecondary: "#94A3B8",
        darkBorder: "#1E293B",
        darkPrimary: "#3B82F6",
      },

      fontFamily: {
        manrope: ["ManropeRegular"],
        manropeMedium: ["ManropeMedium"],
        manropeSemiBold: ["ManropeSemiBold"],
        manropeBold: ["ManropeBold"],
      },

      fontSize: {
        spscreen:"20px",
        title: "24px",
        subtitle: "13px",
        section: "18px",
        body: "14px",
        button: "16px",
      },

      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        xxl: "24px",
      },

      borderRadius: {
        card: "16px",
        button: "12px",
      },
    },
  },
  plugins: [],
};
